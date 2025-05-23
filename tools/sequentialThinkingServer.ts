import chalk from "chalk";

export interface SequentialThinkingInput {
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    isRevision?: boolean;
    revisesThought?: number;
    branchFromThought?: number;
    branchId?: string;
    needsMoreThoughts?: boolean;
}

export interface SequentialThinkingResult {
    success: boolean;
    thought: string;
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    processState: {
        currentBranch: string | null;
        totalBranches: number;
        revisionsCount: number;
        thoughtChain: ThoughtNode[];
    };
    insights: string[];
    hypotheses: string[];
    analysis: {
        coherence: number;
        depth: number;
        completeness: number;
    };
    suggestedNextActions: string[];
    timestamp: string;
}

interface ThoughtNode {
    id: number;
    thought: string;
    isRevision: boolean;
    revisesThought?: number;
    branchId?: string;
    branchFromThought?: number;
    timestamp: string;
}

export class SequentialThinkingServer {
    private thoughtChains: Map<string, ThoughtNode[]> = new Map();
    private currentSessionId: string = "default";

    processThought(input: SequentialThinkingInput): SequentialThinkingResult {
        console.error(chalk.green(`🧠 Processing Thought ${input.thoughtNumber}/${input.totalThoughts}`));
        
        // Get or create thought chain for current session
        if (!this.thoughtChains.has(this.currentSessionId)) {
            this.thoughtChains.set(this.currentSessionId, []);
        }
        
        const thoughtChain = this.thoughtChains.get(this.currentSessionId)!;
        
        // Create new thought node
        const thoughtNode: ThoughtNode = {
            id: input.thoughtNumber,
            thought: input.thought,
            isRevision: input.isRevision || false,
            revisesThought: input.revisesThought,
            branchId: input.branchId,
            branchFromThought: input.branchFromThought,
            timestamp: new Date().toISOString()
        };
        
        // Add to chain
        thoughtChain.push(thoughtNode);
        
        // Analyze the thinking process
        const insights = this.extractInsights(thoughtChain);
        const hypotheses = this.extractHypotheses(thoughtChain);
        const analysis = this.analyzeThinkingQuality(thoughtChain);
        const processState = this.getProcessState(thoughtChain);
        
        return {
            success: true,
            thought: input.thought,
            thoughtNumber: input.thoughtNumber,
            totalThoughts: input.totalThoughts,
            nextThoughtNeeded: input.nextThoughtNeeded,
            processState,
            insights,
            hypotheses,
            analysis,
            suggestedNextActions: this.generateNextActions(input, thoughtChain),
            timestamp: new Date().toISOString()
        };
    }

    private extractInsights(thoughtChain: ThoughtNode[]): string[] {
        const insights: string[] = [];
        
        // Look for insight patterns in thoughts
        thoughtChain.forEach(node => {
            const thought = node.thought.toLowerCase();
            
            if (thought.includes('realize') || thought.includes('insight') || thought.includes('understand')) {
                insights.push(`Insight from thought ${node.id}: ${this.extractKeyPhrase(node.thought)}`);
            }
            
            if (thought.includes('connection') || thought.includes('relate') || thought.includes('link')) {
                insights.push(`Connection identified: ${this.extractKeyPhrase(node.thought)}`);
            }
            
            if (thought.includes('pattern') || thought.includes('trend')) {
                insights.push(`Pattern recognition: ${this.extractKeyPhrase(node.thought)}`);
            }
        });
        
        return insights.length > 0 ? insights : ["Continuing analytical reasoning process"];
    }

    private extractHypotheses(thoughtChain: ThoughtNode[]): string[] {
        const hypotheses: string[] = [];
        
        thoughtChain.forEach(node => {
            const thought = node.thought.toLowerCase();
            
            if (thought.includes('hypothesis') || thought.includes('theory') || thought.includes('might be')) {
                hypotheses.push(`Hypothesis from thought ${node.id}: ${this.extractKeyPhrase(node.thought)}`);
            }
            
            if (thought.includes('if') && thought.includes('then')) {
                hypotheses.push(`Conditional hypothesis: ${this.extractKeyPhrase(node.thought)}`);
            }
            
            if (thought.includes('could be') || thought.includes('possibly') || thought.includes('perhaps')) {
                hypotheses.push(`Possibility: ${this.extractKeyPhrase(node.thought)}`);
            }
        });
        
        return hypotheses.length > 0 ? hypotheses : ["Building towards hypothesis formation"];
    }

    private extractKeyPhrase(thought: string): string {
        // Extract the most meaningful part of a thought
        const sentences = thought.split('.').filter(s => s.trim().length > 0);
        return sentences[0].trim().substring(0, 100) + (sentences[0].length > 100 ? '...' : '');
    }

    private analyzeThinkingQuality(thoughtChain: ThoughtNode[]): { coherence: number; depth: number; completeness: number } {
        const chainLength = thoughtChain.length;
        
        // Coherence: how well thoughts connect to each other
        let coherence = 0.7; // Base coherence
        const revisions = thoughtChain.filter(n => n.isRevision).length;
        coherence += Math.min(revisions * 0.1, 0.3); // Revisions improve coherence
        
        // Depth: complexity and insight level of thoughts
        let depth = 0.5; // Base depth
        const avgThoughtLength = thoughtChain.reduce((sum, node) => sum + node.thought.length, 0) / chainLength;
        depth += Math.min(avgThoughtLength / 500, 0.4); // Longer thoughts indicate more depth
        
        // Completeness: how well the thinking covers the problem space
        let completeness = Math.min(chainLength / 10, 0.8); // More thoughts = more complete
        const branches = new Set(thoughtChain.map(n => n.branchId).filter(Boolean)).size;
        completeness += Math.min(branches * 0.1, 0.2); // Multiple branches improve completeness
        
        return {
            coherence: Math.min(coherence, 1.0),
            depth: Math.min(depth, 1.0),
            completeness: Math.min(completeness, 1.0)
        };
    }

    private getProcessState(thoughtChain: ThoughtNode[]) {
        const branches = new Set(thoughtChain.map(n => n.branchId).filter(Boolean));
        const revisions = thoughtChain.filter(n => n.isRevision);
        const currentBranch = thoughtChain[thoughtChain.length - 1]?.branchId || null;
        
        return {
            currentBranch,
            totalBranches: branches.size,
            revisionsCount: revisions.length,
            thoughtChain: [...thoughtChain]
        };
    }

    private generateNextActions(input: SequentialThinkingInput, thoughtChain: ThoughtNode[]): string[] {
        const actions: string[] = [];
        
        if (input.nextThoughtNeeded) {
            actions.push("Continue with the next sequential thought");
            
            // Suggest specific types of next thoughts based on current state
            if (input.thoughtNumber < 3) {
                actions.push("Focus on problem understanding and context");
            } else if (input.thoughtNumber < input.totalThoughts * 0.7) {
                actions.push("Explore different approaches and generate ideas");
            } else {
                actions.push("Synthesize insights and move toward conclusion");
            }
            
            // Check if revision might be helpful
            const recentRevisions = thoughtChain.slice(-3).filter(n => n.isRevision);
            if (recentRevisions.length === 0 && thoughtChain.length > 2) {
                actions.push("Consider revising a previous thought if new insights emerge");
            }
            
            // Check if branching might be helpful
            const branches = new Set(thoughtChain.map(n => n.branchId).filter(Boolean));
            if (branches.size < 2 && thoughtChain.length > 3) {
                actions.push("Consider branching to explore alternative approaches");
            }
        } else {
            actions.push("Review the complete thought chain for final insights");
            actions.push("Synthesize key findings and conclusions");
            actions.push("Identify any remaining questions or areas for future exploration");
        }
        
        return actions;
    }

    // Utility method to reset session
    resetSession(sessionId?: string): void {
        const targetSession = sessionId || this.currentSessionId;
        this.thoughtChains.delete(targetSession);
        console.error(chalk.yellow(`🔄 Reset thinking session: ${targetSession}`));
    }

    // Utility method to get session summary
    getSessionSummary(sessionId?: string): any {
        const targetSession = sessionId || this.currentSessionId;
        const thoughtChain = this.thoughtChains.get(targetSession) || [];
        
        return {
            sessionId: targetSession,
            totalThoughts: thoughtChain.length,
            insights: this.extractInsights(thoughtChain),
            hypotheses: this.extractHypotheses(thoughtChain),
            quality: this.analyzeThinkingQuality(thoughtChain),
            processState: this.getProcessState(thoughtChain)
        };
    }
} 