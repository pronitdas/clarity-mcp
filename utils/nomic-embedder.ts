import axios from 'axios';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

interface EmbedRequest {
    texts: string[];
    model?: string;
}

interface EmbedResponse {
    embeddings: number[][];
    model: string;
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    };
}

interface HealthResponse {
    status: string;
    model: string;
    ready: boolean;
}

class NomicEmbedder {
    private serverUrl: string;
    private serverProcess: ChildProcess | null = null;
    private isServerStarted: boolean = false;
    private serverPort: number;
    private maxRetries: number = 3;
    private retryDelay: number = 1000;
    private serverDir: string;

    constructor(serverPort: number = 8000, serverUrl?: string) {
        this.serverPort = serverPort;
        this.serverUrl = serverUrl || `http://127.0.0.1:${serverPort}`;
        this.serverDir = path.join(__dirname, '..', 'python-server');
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async checkServerHealth(): Promise<boolean> {
        try {
            const response = await axios.get<HealthResponse>(`${this.serverUrl}/health`, {
                timeout: 5000
            });
            return response.data.ready;
        } catch (error) {
            return false;
        }
    }

    private async startPythonServer(): Promise<void> {
        if (this.isServerStarted) {
            return;
        }

        console.log('🐍 Starting Python embedding server...');
        
        // Check if virtual environment exists
        const venvPath = path.join(this.serverDir, 'venv');
        const fs = require('fs');
        if (!fs.existsSync(venvPath)) {
            throw new Error(`Virtual environment not found at ${venvPath}. Please run 'npm run build' first to set up the Python environment.`);
        }

        // Use the virtual environment to start the server
        const activateAndRun = `source venv/bin/activate && python3 embedding_server.py`;
        
        // Clean environment to avoid conflicts
        const cleanEnv = { ...process.env };
        // Remove any conflicting environment variables
        delete cleanEnv.MODEL_PATH;
        delete cleanEnv.ONNX_MODEL_PATH;
        
        this.serverProcess = spawn('bash', ['-c', activateAndRun], {
            cwd: this.serverDir,
            env: {
                ...cleanEnv,
                PORT: this.serverPort.toString(),
                HOST: '127.0.0.1'
            },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        if (this.serverProcess.stdout) {
            this.serverProcess.stdout.on('data', (data) => {
                console.log(`[Python Server]: ${data.toString().trim()}`);
            });
        }

        if (this.serverProcess.stderr) {
            this.serverProcess.stderr.on('data', (data) => {
                console.error(`[Python Server Error]: ${data.toString().trim()}`);
            });
        }

        this.serverProcess.on('exit', (code, signal) => {
            console.log(`Python server exited with code ${code} and signal ${signal}`);
            this.isServerStarted = false;
            this.serverProcess = null;
        });

        // Wait for server to be ready
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max for first-time model download
        
        console.log('⏳ Waiting for Python server to be ready...');
        while (attempts < maxAttempts) {
            await this.sleep(1000);
            
            const isHealthy = await this.checkServerHealth();
            if (isHealthy) {
                console.log('✅ Python embedding server is ready!');
                this.isServerStarted = true;
                return;
            }
            
            attempts++;
            if (attempts % 10 === 0) {
                console.log(`⏳ Still waiting for server... (${attempts}/${maxAttempts}s) - This may take a while on first run for model download`);
            }
        }

        throw new Error('Failed to start Python embedding server within timeout');
    }

    async initialize(): Promise<void> {
        // Check if server is already running
        const isHealthy = await this.checkServerHealth();
        if (isHealthy) {
            console.log('✅ Python embedding server is already running');
            this.isServerStarted = true;
            return;
        }

        // Try to start the server
        await this.startPythonServer();
    }

    private generateFallbackEmbedding(text: string): Float32Array {
        // Simple fallback embedding using text hashing and basic features
        const embedding = new Float32Array(768); // Standard embedding dimension
        const cleanText = text.toLowerCase().trim();
        
        // Simple hash-based features
        for (let i = 0; i < cleanText.length && i < 100; i++) {
            const charCode = cleanText.charCodeAt(i);
            const idx = (charCode * 7 + i * 11) % 768;
            embedding[idx] += Math.sin(charCode + i) * 0.1;
        }
        
        // Add length feature
        embedding[0] = Math.log(cleanText.length + 1) * 0.1;
        
        // Normalize
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] /= norm;
            }
        }
        
        return embedding;
    }

    async embed(texts: string[]): Promise<Float32Array[]> {
        await this.initialize();

        let lastError: Error | null = null;
        
        // Try with retries
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const request: EmbedRequest = {
                    texts: texts,
                    model: "nomic-ai/nomic-embed-text-v1.5"
                };

                const response = await axios.post<EmbedResponse>(`${this.serverUrl}/embed`, request, {
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Convert to Float32Array
                return response.data.embeddings.map(embedding => 
                    new Float32Array(embedding)
                );

            } catch (error) {
                lastError = error as Error;
                console.error(`❌ Embedding attempt ${attempt + 1} failed:`, error);
                
                if (attempt < this.maxRetries - 1) {
                    console.log(`🔄 Retrying in ${this.retryDelay}ms...`);
                    await this.sleep(this.retryDelay);
                    
                    // Try to restart server if it seems down
                    const isHealthy = await this.checkServerHealth();
                    if (!isHealthy) {
                        console.log('🔄 Server appears to be down, attempting restart...');
                        this.isServerStarted = false;
                        await this.startPythonServer();
                    }
                }
            }
        }

        console.warn('⚠️  All embedding attempts failed, using fallback embeddings');
        return texts.map(text => this.generateFallbackEmbedding(text));
    }

    async embedSingle(text: string): Promise<Float32Array> {
        const [embedding] = await this.embed([text]);
        return embedding;
    }

    async shutdown(): Promise<void> {
        if (this.serverProcess) {
            console.log('🛑 Shutting down Python embedding server...');
            this.serverProcess.kill('SIGTERM');
            
            // Wait a bit for graceful shutdown
            await this.sleep(2000);
            
            if (this.serverProcess && !this.serverProcess.killed) {
                console.log('🔨 Force killing server...');
                this.serverProcess.kill('SIGKILL');
            }
            
            this.serverProcess = null;
            this.isServerStarted = false;
        }
    }

    // Health check method for external use
    async isHealthy(): Promise<boolean> {
        return await this.checkServerHealth();
    }
}

export { NomicEmbedder };