import * as tf from '@tensorflow/tfjs-node';
import { load } from '@tensorflow-models/universal-sentence-encoder';
import { v4 as uuidv4 } from 'uuid';

interface MemoryNode {
    id: string;
    label: string;
    type: 'concept' | 'observation' | 'task' | 'solution';
    embedding?: number[];
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

interface MemoryEdge {
    id: string;
    from: string;
    to: string;
    relation: string;
    weight?: number;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

interface MemoryGraph {
    nodes: Map<string, MemoryNode>;
    edges: Map<string, MemoryEdge>;
}

interface SearchResult {
    node: MemoryNode;
    score: number;
}

interface MemoryQuery {
    text?: string;
    type?: MemoryNode['type'];
    limit?: number;
    threshold?: number;
}

export class MemoryServer {
    private graph: MemoryGraph;
    private model: any;
    private initialized: boolean = false;

    constructor() {
        this.graph = {
            nodes: new Map<string, MemoryNode>(),
            edges: new Map<string, MemoryEdge>()
        };
    }

    private async initialize() {
        if (!this.initialized) {
            this.model = await load();
            this.initialized = true;
        }
    }

    private async generateEmbedding(text: string): Promise<number[]> {
        await this.initialize();
        const embeddings = await this.model.embed([text]);
        const array = await embeddings.array();
        return array[0];
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        const dotProduct = tf.tensor1d(a).dot(tf.tensor1d(b));
        const normA = tf.tensor1d(a).norm();
        const normB = tf.tensor1d(b).norm();
        
        const similarity = tf.div(dotProduct, tf.mul(normA, normB));
        return similarity.dataSync()[0];
    }

    async addMemory(args: { label: string; type: MemoryNode['type']; metadata?: Record<string, any> }) {
        const embedding = await this.generateEmbedding(args.label);
        const node: MemoryNode = {
            id: uuidv4(),
            label: args.label,
            type: args.type,
            embedding,
            metadata: args.metadata,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.graph.nodes.set(node.id, node);
        return {
            success: true,
            node: {
                id: node.id,
                label: node.label,
                type: node.type,
                metadata: node.metadata
            }
        };
    }

    linkMemory(args: { fromId: string; toId: string; relation: string; metadata?: Record<string, any> }) {
        if (!this.graph.nodes.has(args.fromId) || !this.graph.nodes.has(args.toId)) {
            return {
                success: false,
                error: 'One or both nodes do not exist'
            };
        }

        const edge: MemoryEdge = {
            id: uuidv4(),
            from: args.fromId,
            to: args.toId,
            relation: args.relation,
            metadata: args.metadata,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.graph.edges.set(edge.id, edge);
        return {
            success: true,
            edge: {
                id: edge.id,
                from: edge.from,
                to: edge.to,
                relation: edge.relation,
                metadata: edge.metadata
            }
        };
    }

    async searchMemory(args: MemoryQuery) {
        if (!args.text) {
            return {
                success: false,
                error: 'Search query text is required'
            };
        }

        const queryEmbedding = await this.generateEmbedding(args.text);
        const results: SearchResult[] = [];

        for (const node of this.graph.nodes.values()) {
            if (args.type && node.type !== args.type) continue;
            if (!node.embedding) continue;

            const similarity = this.cosineSimilarity(queryEmbedding, node.embedding);
            if (!args.threshold || similarity >= args.threshold) {
                results.push({
                    node: {
                        ...node,
                        embedding: undefined // Don't expose embeddings in response
                    },
                    score: similarity
                });
            }
        }

        results.sort((a, b) => b.score - a.score);
        const limitedResults = args.limit ? results.slice(0, args.limit) : results;

        return {
            success: true,
            results: limitedResults
        };
    }

    getMemoryContext(args: { nodeId: string }) {
        const node = this.graph.nodes.get(args.nodeId);
        if (!node) {
            return {
                success: false,
                error: 'Node not found'
            };
        }

        const neighbors: { node: Omit<MemoryNode, 'embedding'>; edge: MemoryEdge }[] = [];
        
        for (const edge of this.graph.edges.values()) {
            if (edge.from === args.nodeId) {
                const connectedNode = this.graph.nodes.get(edge.to);
                if (connectedNode) {
                    const { embedding, ...nodeWithoutEmbedding } = connectedNode;
                    neighbors.push({ 
                        node: nodeWithoutEmbedding,
                        edge 
                    });
                }
            }
            if (edge.to === args.nodeId) {
                const connectedNode = this.graph.nodes.get(edge.from);
                if (connectedNode) {
                    const { embedding, ...nodeWithoutEmbedding } = connectedNode;
                    neighbors.push({ 
                        node: nodeWithoutEmbedding,
                        edge 
                    });
                }
            }
        }

        const { embedding, ...nodeWithoutEmbedding } = node;
        return {
            success: true,
            node: nodeWithoutEmbedding,
            neighbors
        };
    }
} 