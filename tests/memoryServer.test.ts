import { EnhancedMemoryServer, MemoryNode, MemoryEdge, SearchResult } from '../tools/memoryServer';

describe('EnhancedMemoryServer', () => {
    let server: EnhancedMemoryServer;

    beforeEach(async () => {
        server = new EnhancedMemoryServer();
        await server.initialize();
    });

    describe('Initialization', () => {
        test('should initialize with empty state', () => {
            const stats = server.getStats();
            
            expect(stats.totalNodes).toBe(0);
            expect(stats.totalEdges).toBe(0);
            expect(stats.cacheSize).toBe(0);
            expect(stats.nodesByType.concept).toBe(0);
            expect(stats.nodesByType.observation).toBe(0);
            expect(stats.nodesByType.task).toBe(0);
            expect(stats.nodesByType.solution).toBe(0);
        });
    });

    describe('Adding Memory Nodes', () => {
        test('should add a concept node with metadata', async () => {
            const conceptResult = await server.addMemory({
                label: 'Machine Learning',
                type: 'concept',
                metadata: { domain: 'AI' }
            });
            
            expect(conceptResult.success).toBe(true);
            expect(conceptResult.node?.type).toBe('concept');
            expect(conceptResult.node?.label).toBe('Machine Learning');
            expect(conceptResult.node?.metadata?.domain).toBe('AI');
            expect(typeof conceptResult.node?.id).toBe('string');
        });

        test('should add an observation node', async () => {
            const observationResult = await server.addMemory({
                label: 'Neural networks perform well on image classification',
                type: 'observation'
            });
            
            expect(observationResult.success).toBe(true);
            expect(observationResult.node?.type).toBe('observation');
        });

        test('should update stats correctly after adding nodes', async () => {
            await server.addMemory({ label: 'Test Concept', type: 'concept' });
            await server.addMemory({ label: 'Test Observation', type: 'observation' });

            const stats = server.getStats();
            expect(stats.totalNodes).toBe(2);
            expect(stats.nodesByType.concept).toBe(1);
            expect(stats.nodesByType.observation).toBe(1);
        });
    });

    describe('Linking Memory Nodes', () => {
        test('should successfully link two nodes', async () => {
            const node1 = await server.addMemory({
                label: 'Deep Learning',
                type: 'concept'
            });
            
            const node2 = await server.addMemory({
                label: 'Convolutional Neural Networks are effective for image processing',
                type: 'observation'
            });

            const linkResult = server.linkMemory({
                fromId: node1.node!.id,
                toId: node2.node!.id,
                relation: 'supports',
                weight: 0.8,
                metadata: { confidence: 'high' }
            });

            expect(linkResult.success).toBe(true);
            expect(linkResult.edge?.relation).toBe('supports');
            expect(linkResult.edge?.weight).toBe(0.8);
            expect(linkResult.edge?.metadata?.confidence).toBe('high');

            const stats = server.getStats();
            expect(stats.totalEdges).toBe(1);
        });

        test('should fail to link non-existent nodes', () => {
            const linkResult = server.linkMemory({
                fromId: 'non-existent-1',
                toId: 'non-existent-2',
                relation: 'relates-to'
            });

            expect(linkResult.success).toBe(false);
            expect(linkResult.error).toBeDefined();
            expect(linkResult.edge).toBeUndefined();
        });
    });

    describe('Semantic Search', () => {
        beforeEach(async () => {
            // Add various test nodes
            await server.addMemory({ label: 'Machine Learning algorithms', type: 'concept' });
            await server.addMemory({ label: 'Neural networks for classification', type: 'observation' });
            await server.addMemory({ label: 'Deep learning models', type: 'concept' });
            await server.addMemory({ label: 'Cooking recipes', type: 'concept' });
            await server.addMemory({ label: 'Baking bread techniques', type: 'task' });
        });

        test('should find relevant results and sort by similarity', async () => {
            const searchResult = await server.searchMemory({
                text: 'machine learning neural networks',
                limit: 3,
                threshold: 0.1
            });

            expect(searchResult.success).toBe(true);
            expect(searchResult.results!.length).toBeGreaterThan(0);
            
            // Results should be sorted by similarity (descending)
            const scores = searchResult.results!.map(r => r.score);
            for (let i = 1; i < scores.length; i++) {
                expect(scores[i-1]).toBeGreaterThanOrEqual(scores[i]);
            }

            // Top result should be ML-related
            const topResult = searchResult.results![0];
            const label = topResult.node.label.toLowerCase();
            expect(
                label.includes('machine') || 
                label.includes('neural') ||
                label.includes('learning')
            ).toBe(true);
        });

        test('should filter results by node type', async () => {
            const conceptSearch = await server.searchMemory({
                text: 'learning algorithms',
                type: 'concept',
                threshold: 0.1
            });

            expect(conceptSearch.success).toBe(true);
            expect(conceptSearch.results!.length).toBeGreaterThan(0);
            
            // All results should be concepts
            for (const result of conceptSearch.results!) {
                expect(result.node.type).toBe('concept');
            }
        });

        test('should handle empty search query', async () => {
            const result = await server.searchMemory({
                text: '',
                limit: 5
            });

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should apply similarity threshold', async () => {
            const result = await server.searchMemory({
                text: 'completely unrelated topic like cooking recipes',
                threshold: 0.8, // High threshold
                limit: 10
            });

            expect(result.success).toBe(true);
            expect(result.results).toBeDefined();
            
            // All results should meet the threshold
            result.results!.forEach(res => {
                expect(res.score).toBeGreaterThanOrEqual(0.8);
            });
        });
    });

    describe('Memory Context and Neighbors', () => {
        test('should retrieve memory context with neighbors', async () => {
            // Create a small knowledge graph
            const aiConcept = await server.addMemory({ label: 'Artificial Intelligence', type: 'concept' });
            const mlConcept = await server.addMemory({ label: 'Machine Learning', type: 'concept' });
            const task = await server.addMemory({ label: 'Build ML model', type: 'task' });

            // Link them
            server.linkMemory({
                fromId: aiConcept.node!.id,
                toId: mlConcept.node!.id,
                relation: 'contains'
            });
            server.linkMemory({
                fromId: mlConcept.node!.id,
                toId: task.node!.id,
                relation: 'enables'
            });

            const context = server.getMemoryContext(mlConcept.node!.id);

            expect(context.success).toBe(true);
            expect(context.node).toBeDefined();
            expect(context.neighbors).toBeDefined();
            expect(context.neighbors!.length).toBe(2); // Connected to AI and task
        });

        test('should handle non-existent node context request', () => {
            const context = server.getMemoryContext('non-existent-id');

            expect(context.success).toBe(false);
            expect(context.error).toBeDefined();
        });

        test('should include context in search results when requested', async () => {
            // Add and link nodes
            const parentNode = await server.addMemory({
                label: 'Artificial Intelligence',
                type: 'concept'
            });
            const childNode = await server.addMemory({
                label: 'Machine Learning',
                type: 'concept'
            });

            server.linkMemory({
                fromId: parentNode.node!.id,
                toId: childNode.node!.id,
                relation: 'contains'
            });

            const searchResult = await server.searchMemory({
                text: 'Machine Learning',
                includeContext: true,
                limit: 1
            });

            expect(searchResult.success).toBe(true);
            expect(searchResult.results!.length).toBeGreaterThan(0);
            expect(searchResult.results![0].context).toBeDefined();
        });
    });

    describe('Utility Functions', () => {
        test('should provide accurate statistics', async () => {
            const initialStats = server.getStats();
            expect(initialStats.totalNodes).toBe(0);
            expect(initialStats.totalEdges).toBe(0);

            // Add some nodes
            await server.addMemory({ label: 'Node 1', type: 'concept' });
            await server.addMemory({ label: 'Node 2', type: 'observation' });

            const stats = server.getStats();
            expect(stats.totalNodes).toBe(2);
            expect(stats.nodesByType.concept).toBe(1);
            expect(stats.nodesByType.observation).toBe(1);
        });

        test('should export graph data without embeddings', async () => {
            const node1 = await server.addMemory({ label: 'Test 1', type: 'concept' });
            const node2 = await server.addMemory({ label: 'Test 2', type: 'task' });
            
            server.linkMemory({
                fromId: node1.node!.id,
                toId: node2.node!.id,
                relation: 'leads-to'
            });

            const exported = server.exportGraph();

            expect(exported.nodes).toHaveLength(2);
            expect(exported.edges).toHaveLength(1);
            expect(exported.nodes[0]).not.toHaveProperty('embedding'); // Should be stripped
        });

        test('should clear cache', () => {
            server.clearCache();
            
            const stats = server.getStats();
            expect(stats.cacheSize).toBe(0);
        });
    });

    describe('Error Handling', () => {
        test('should handle empty label gracefully', async () => {
            const result = await server.addMemory({
                label: '', // Empty label
                type: 'concept'
            });
            
            expect(result.success).toBe(true);
            expect(result.node!.label).toBe('');
        });

        test('should handle concurrent operations', async () => {
            const promises = Array.from({ length: 10 }, (_, i) => 
                server.addMemory({
                    label: `Concurrent node ${i}`,
                    type: 'concept'
                })
            );

            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result.success).toBe(true);
            });

            const stats = server.getStats();
            expect(stats.totalNodes).toBe(10);
        });
    });
}); 