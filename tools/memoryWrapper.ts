import { EnhancedMemoryServer } from './memoryServer';
import path from 'path';

// Global memory server instance with model path
const modelPath = path.join(__dirname, '../../models/nomic-embed-text-v1.5.onnx');
const memoryServer = new EnhancedMemoryServer(modelPath);

// Initialize memory server
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
    if (!initPromise) {
        initPromise = memoryServer.initialize();
    }
    return initPromise;
}

export interface MCPMemoryParams {
    operation: 'add' | 'link' | 'search' | 'context';
    // Add operation
    text?: string;
    type?: 'concept' | 'observation' | 'task' | 'solution';
    metadata?: Record<string, any>;
    // Link operation
    fromId?: string;
    toId?: string;
    relation?: string;
    // Search operation
    limit?: number;
    threshold?: number;
    // Context operation
    nodeId?: string;
}

export async function handleMemoryOperation(params: MCPMemoryParams) {
    await ensureInitialized();
    
    switch (params.operation) {
        case 'add':
            if (!params.text || !params.type) {
                return { success: false, error: 'Text and type are required for add operation' };
            }
            
            return await memoryServer.addMemory({
                label: params.text,
                type: params.type,
                metadata: params.metadata
            });

        case 'link':
            if (!params.fromId || !params.toId || !params.relation) {
                return { success: false, error: 'FromId, toId, and relation are required for link operation' };
            }
            
            return memoryServer.linkMemory({
                fromId: params.fromId,
                toId: params.toId,
                relation: params.relation,
                metadata: params.metadata
            });

        case 'search':
            if (!params.text) {
                return { success: false, error: 'Text is required for search operation' };
            }
            
            return await memoryServer.searchMemory({
                text: params.text,
                type: params.type,
                limit: params.limit,
                threshold: params.threshold,
                includeContext: true
            });

        case 'context':
            if (!params.nodeId) {
                return { success: false, error: 'NodeId is required for context operation' };
            }
            
            return memoryServer.getMemoryContext(params.nodeId);

        default:
            return { success: false, error: `Unknown operation: ${params.operation}` };
    }
}

// Utility functions for external access
export function getMemoryStats() {
    return memoryServer.getStats();
}

export function exportMemoryGraph() {
    return memoryServer.exportGraph();
}

export function clearMemoryCache() {
    memoryServer.clearCache();
} 