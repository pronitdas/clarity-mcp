import * as tf from '@tensorflow/tfjs-node';
import { v4 as uuidv4 } from 'uuid';
import { NomicEmbedder } from '../utils/nomic-embedder';

// Types
export interface MemoryNode {
    id: string;
    label: string;
    type: 'concept' | 'observation' | 'task' | 'solution';
    embedding?: Float32Array;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface MemoryEdge {
    id: string;
    from: string;
    to: string;
    relation: string;
    weight: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface SearchResult {
    node: Omit<MemoryNode, 'embedding'>;
    score: number;
    context?: {
        neighbors: Array<{
            node: Omit<MemoryNode, 'embedding'>;
            edge: MemoryEdge;
        }>;
    };
}

export interface MemoryQuery {
    text: string;
    type?: MemoryNode['type'];
    limit?: number;
    threshold?: number;
    includeContext?: boolean;
}

interface MemoryGraph {
    nodes: Map<string, MemoryNode>;
    edges: Map<string, MemoryEdge>;
    nodesByType: Map<MemoryNode['type'], Set<string>>;
}

export interface AddMemoryArgs {
    label: string;
    type: MemoryNode['type'];
    metadata?: Record<string, any>;
}

export interface LinkMemoryArgs {
    fromId: string;
    toId: string;
    relation: string;
    weight?: number;
    metadata?: Record<string, any>;
}

// Enhanced embedder that uses Nomic with fallback
class EnhancedEmbedder {
    private nomicEmbedder: NomicEmbedder;
    private fallbackEmbedder: LocalEmbedder;
    private useNomic: boolean = true;

    constructor(modelPath?: string) {
        this.nomicEmbedder = new NomicEmbedder(modelPath);
        this.fallbackEmbedder = new LocalEmbedder();
    }

    async initialize(): Promise<void> {
        try {
            await this.nomicEmbedder.initialize();
            console.log('Nomic embedder initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize Nomic embedder, using fallback:', error);
            this.useNomic = false;
        }
    }

    async embed(texts: string[]): Promise<Float32Array[]> {
        if (this.useNomic) {
            try {
                return await this.nomicEmbedder.embed(texts);
            } catch (error) {
                console.warn('Nomic embedding failed, falling back to local embedder:', error);
                this.useNomic = false;
            }
        }
        
        // Fallback to local embedder
        return await this.fallbackEmbedder.embed(texts);
    }

    async embedSingle(text: string): Promise<Float32Array> {
        if (this.useNomic) {
            try {
                return await this.nomicEmbedder.embedSingle(text);
            } catch (error) {
                console.warn('Nomic embedding failed, falling back to local embedder:', error);
                this.useNomic = false;
            }
        }
        
        // Fallback to local embedder
        return this.fallbackEmbedder.embedSingle(text);
    }

    updateVocabulary(newTexts: string[]): void {
        // Only relevant for fallback embedder
        if (!this.useNomic) {
            this.fallbackEmbedder.updateVocabulary(newTexts);
        }
    }
}

// Local embedding using simple but effective text processing (fallback)
class LocalEmbedder {
    private vocab: Map<string, number> = new Map();
    private idf: Map<string, number> = new Map();
    private initialized: boolean = false;
    private minWordLength: number = 2;
    private maxFeatures: number = 1000;

    constructor() {}

    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= this.minWordLength);
    }

    private buildVocabulary(documents: string[]): void {
        const wordCounts = new Map<string, number>();
        const docCounts = new Map<string, number>();

        // Count word frequencies and document frequencies
        for (const doc of documents) {
            const tokens = this.tokenize(doc);
            const uniqueTokens = new Set(tokens);

            for (const token of tokens) {
                wordCounts.set(token, (wordCounts.get(token) || 0) + 1);
            }

            for (const token of Array.from(uniqueTokens)) {
                docCounts.set(token, (docCounts.get(token) || 0) + 1);
            }
        }

        // Select top features by frequency
        const sortedWords = Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.maxFeatures);

        // Build vocabulary index
        sortedWords.forEach(([word], index) => {
            this.vocab.set(word, index);
        });

        // Calculate IDF values
        const numDocs = documents.length;
        for (const [word] of sortedWords) {
            const df = docCounts.get(word) || 1;
            this.idf.set(word, Math.log(numDocs / df));
        }

        this.initialized = true;
    }

    async embed(texts: string[]): Promise<Float32Array[]> {
        if (!this.initialized) {
            this.buildVocabulary(texts);
        }

        return texts.map(text => this.embedSingle(text));
    }

    embedSingle(text: string): Float32Array {
        const tokens = this.tokenize(text);
        const vector = new Float32Array(this.vocab.size);
        const termFreq = new Map<string, number>();

        // Calculate term frequencies
        for (const token of tokens) {
            if (this.vocab.has(token)) {
                termFreq.set(token, (termFreq.get(token) || 0) + 1);
            }
        }

        // Create TF-IDF vector
        for (const [term, tf] of Array.from(termFreq.entries())) {
            const vocabIndex = this.vocab.get(term);
            const idf = this.idf.get(term) || 0;
            if (vocabIndex !== undefined) {
                vector[vocabIndex] = tf * idf;
            }
        }

        // Normalize vector
        const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= norm;
            }
        }

        return vector;
    }

    updateVocabulary(newTexts: string[]): void {
        if (newTexts.length > 0) {
            this.initialized = false;
        }
    }
}

// Enhanced Memory Server
export class EnhancedMemoryServer {
    private graph: MemoryGraph;
    private embedder: EnhancedEmbedder;
    private embeddingCache: Map<string, Float32Array> = new Map();
    private initialized: boolean = false;

    constructor(modelPath?: string) {
        this.graph = {
            nodes: new Map(),
            edges: new Map(),
            nodesByType: new Map<MemoryNode['type'], Set<string>>([
                ['concept', new Set<string>()],
                ['observation', new Set<string>()],
                ['task', new Set<string>()],
                ['solution', new Set<string>()]
            ])
        };
        this.embedder = new EnhancedEmbedder(modelPath);
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;
        await this.embedder.initialize();
        this.initialized = true;
    }

    private cosineSimilarity(a: Float32Array, b: Float32Array): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const norm = Math.sqrt(normA) * Math.sqrt(normB);
        return norm > 0 ? dotProduct / norm : 0;
    }

    private async generateEmbedding(text: string): Promise<Float32Array> {
        // Check cache first
        const cacheKey = text.toLowerCase().trim();
        if (this.embeddingCache.has(cacheKey)) {
            return this.embeddingCache.get(cacheKey)!;
        }

        // Generate new embedding
        const embedding = await this.embedder.embedSingle(text);
        this.embeddingCache.set(cacheKey, embedding);
        return embedding;
    }

    private stripEmbedding(node: MemoryNode): Omit<MemoryNode, 'embedding'> {
        const { embedding, ...nodeWithoutEmbedding } = node;
        return nodeWithoutEmbedding;
    }

    async addMemory(args: AddMemoryArgs): Promise<{
        success: boolean;
        node?: Omit<MemoryNode, 'embedding'>;
        error?: string;
    }> {
        try {
            await this.initialize();
            const embedding = await this.generateEmbedding(args.label);
            
            const node: MemoryNode = {
                id: uuidv4(),
                label: args.label.trim(),
                type: args.type,
                embedding,
                metadata: args.metadata || {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.graph.nodes.set(node.id, node);
            this.graph.nodesByType.get(node.type)?.add(node.id);

            // Update embedder vocabulary periodically (only for fallback)
            if (this.graph.nodes.size % 50 === 0) {
                const allTexts = Array.from(this.graph.nodes.values()).map(n => n.label);
                this.embedder.updateVocabulary(allTexts);
            }

            return {
                success: true,
                node: this.stripEmbedding(node)
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to add memory: ${error}`
            };
        }
    }

    linkMemory(args: LinkMemoryArgs): {
        success: boolean;
        edge?: MemoryEdge;
        error?: string;
    } {
        const fromNode = this.graph.nodes.get(args.fromId);
        const toNode = this.graph.nodes.get(args.toId);

        if (!fromNode || !toNode) {
            return {
                success: false,
                error: 'One or both nodes do not exist'
            };
        }

        const edge: MemoryEdge = {
            id: uuidv4(),
            from: args.fromId,
            to: args.toId,
            relation: args.relation.trim(),
            weight: args.weight ?? 1.0,
            metadata: args.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.graph.edges.set(edge.id, edge);

        return {
            success: true,
            edge
        };
    }

    async searchMemory(query: MemoryQuery): Promise<{
        success: boolean;
        results?: SearchResult[];
        error?: string;
    }> {
        try {
            await this.initialize();
            
            if (!query.text?.trim()) {
                return {
                    success: false,
                    error: 'Search query text is required'
                };
            }

            const queryEmbedding = await this.generateEmbedding(query.text);
            const results: SearchResult[] = [];
            const threshold = query.threshold ?? 0.1;

            // Filter nodes by type if specified
            const nodesToSearch = query.type 
                ? Array.from(this.graph.nodesByType.get(query.type) || [])
                    .map(id => this.graph.nodes.get(id)!)
                    .filter(Boolean)
                : Array.from(this.graph.nodes.values());

            for (const node of nodesToSearch) {
                if (!node.embedding) continue;

                const similarity = this.cosineSimilarity(queryEmbedding, node.embedding);
                
                if (similarity >= threshold) {
                    const result: SearchResult = {
                        node: this.stripEmbedding(node),
                        score: similarity
                    };

                    // Add context if requested
                    if (query.includeContext) {
                        result.context = this.getNodeContext(node.id);
                    }

                    results.push(result);
                }
            }

            // Sort by similarity score (descending)
            results.sort((a, b) => b.score - a.score);

            // Apply limit
            const limitedResults = query.limit 
                ? results.slice(0, query.limit) 
                : results;

            return {
                success: true,
                results: limitedResults
            };
        } catch (error) {
            return {
                success: false,
                error: `Search failed: ${error}`
            };
        }
    }

    private getNodeContext(nodeId: string): {
        neighbors: Array<{
            node: Omit<MemoryNode, 'embedding'>;
            edge: MemoryEdge;
        }>;
    } {
        const neighbors: Array<{
            node: Omit<MemoryNode, 'embedding'>;
            edge: MemoryEdge;
        }> = [];

        for (const edge of Array.from(this.graph.edges.values())) {
            let connectedNodeId: string | null = null;

            if (edge.from === nodeId) {
                connectedNodeId = edge.to;
            } else if (edge.to === nodeId) {
                connectedNodeId = edge.from;
            }

            if (connectedNodeId) {
                const connectedNode = this.graph.nodes.get(connectedNodeId);
                if (connectedNode) {
                    neighbors.push({
                        node: this.stripEmbedding(connectedNode),
                        edge
                    });
                }
            }
        }

        return { neighbors };
    }

    getMemoryContext(nodeId: string): {
        success: boolean;
        node?: Omit<MemoryNode, 'embedding'>;
        neighbors?: Array<{
            node: Omit<MemoryNode, 'embedding'>;
            edge: MemoryEdge;
        }>;
        error?: string;
    } {
        const node = this.graph.nodes.get(nodeId);
        if (!node) {
            return {
                success: false,
                error: 'Node not found'
            };
        }

        const context = this.getNodeContext(nodeId);

        return {
            success: true,
            node: this.stripEmbedding(node),
            neighbors: context.neighbors
        };
    }

    // Utility methods
    getStats(): {
        totalNodes: number;
        totalEdges: number;
        nodesByType: Record<MemoryNode['type'], number>;
        cacheSize: number;
    } {
        const nodesByType: Record<MemoryNode['type'], number> = {
            concept: this.graph.nodesByType.get('concept')?.size || 0,
            observation: this.graph.nodesByType.get('observation')?.size || 0,
            task: this.graph.nodesByType.get('task')?.size || 0,
            solution: this.graph.nodesByType.get('solution')?.size || 0
        };

        return {
            totalNodes: this.graph.nodes.size,
            totalEdges: this.graph.edges.size,
            nodesByType,
            cacheSize: this.embeddingCache.size
        };
    }

    clearCache(): void {
        this.embeddingCache.clear();
    }

    // Export/Import functionality
    exportGraph(): {
        nodes: Array<Omit<MemoryNode, 'embedding'>>;
        edges: MemoryEdge[];
    } {
        return {
            nodes: Array.from(this.graph.nodes.values()).map(node => this.stripEmbedding(node)),
            edges: Array.from(this.graph.edges.values())
        };
    }
}