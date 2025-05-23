import chalk from "chalk";

export interface Persona {
    id: string;
    name: string;
    expertise: string[];
    background: string;
    perspective: string;
    biases: string[];
    communication: {
        style: string;
        tone: string;
    };
}

export interface Contribution {
    personaId: string;
    content: string;
    type: "observation" | "question" | "insight" | "concern" | "suggestion" | "challenge" | "synthesis";
    confidence: number;
    referenceIds?: string[];
}

export interface Disagreement {
    topic: string;
    positions: Array<{
        personaId: string;
        position: string;
        arguments: string[];
    }>;
}

export interface CollaborativeReasoningInput {
    topic: string;
    personas: Persona[];
    contributions: Contribution[];
    stage: "problem-definition" | "ideation" | "critique" | "integration" | "decision" | "reflection";
    activePersonaId: string;
    nextPersonaId?: string;
    consensusPoints?: string[];
    disagreements?: Disagreement[];
    keyInsights?: string[];
    openQuestions?: string[];
    finalRecommendation?: string;
    sessionId: string;
    iteration: number;
    suggestedContributionTypes?: string[];
    nextContributionNeeded: boolean;
}

export interface CollaborativeReasoningResult {
    success: boolean;
    topic: string;
    sessionState: {
        stage: string;
        iteration: number;
        activePersonaId: string;
        nextPersonaId: string | null;
        consensusPoints: string[];
        disagreements: Disagreement[];
        keyInsights: string[];
        openQuestions: string[];
    };
    analysis: {
        groupDynamics: string[];
        perspectiveDiversity: number;
        consensusLevel: number;
        controversyAreas: string[];
        emergentThemes: string[];
    };
    suggestedNextActions: string[];
    nextContributionNeeded: boolean;
    finalRecommendation?: string;
    timestamp: string;
}

export class CollaborativeReasoningServer {
    private sessions: Map<string, CollaborativeReasoningInput> = new Map();

    processCollaborativeReasoning(input: CollaborativeReasoningInput): CollaborativeReasoningResult {
        console.error(chalk.blue(`👥 Processing Collaborative Reasoning: ${input.topic} (Stage: ${input.stage})`));
        
        // Store/update session state
        this.sessions.set(input.sessionId, input);
        
        const analysis = this.analyzeCollaboration(input);
        const sessionState = this.getSessionState(input);
        const suggestedNextActions = this.generateNextActions(input);
        
        return {
            success: true,
            topic: input.topic,
            sessionState,
            analysis,
            suggestedNextActions,
            nextContributionNeeded: input.nextContributionNeeded,
            finalRecommendation: input.finalRecommendation,
            timestamp: new Date().toISOString(),
        };
    }

    private analyzeCollaboration(input: CollaborativeReasoningInput) {
        const groupDynamics = this.analyzeGroupDynamics(input);
        const perspectiveDiversity = this.calculatePerspectiveDiversity(input.personas);
        const consensusLevel = this.calculateConsensusLevel(input);
        const controversyAreas = this.identifyControversyAreas(input);
        const emergentThemes = this.extractEmergentThemes(input);

        return {
            groupDynamics,
            perspectiveDiversity,
            consensusLevel,
            controversyAreas,
            emergentThemes
        };
    }

    private analyzeGroupDynamics(input: CollaborativeReasoningInput): string[] {
        const dynamics: string[] = [];
        
        // Analyze contribution patterns
        const contributionCounts = new Map<string, number>();
        input.contributions.forEach(contrib => {
            contributionCounts.set(contrib.personaId, (contributionCounts.get(contrib.personaId) || 0) + 1);
        });
        
        // Check for dominant voices
        const totalContributions = input.contributions.length;
        const avgContributions = totalContributions / input.personas.length;
        
        contributionCounts.forEach((count, personaId) => {
            const persona = input.personas.find(p => p.id === personaId);
            if (count > avgContributions * 1.5) {
                dynamics.push(`${persona?.name || personaId} is a dominant voice in the discussion`);
            } else if (count < avgContributions * 0.5) {
                dynamics.push(`${persona?.name || personaId} is relatively quiet in the discussion`);
            }
        });

        // Analyze contribution types
        const typeDistribution = new Map<string, number>();
        input.contributions.forEach(contrib => {
            typeDistribution.set(contrib.type, (typeDistribution.get(contrib.type) || 0) + 1);
        });

        if ((typeDistribution.get('challenge') || 0) > totalContributions * 0.3) {
            dynamics.push("High level of critical analysis and challenging");
        }
        
        if ((typeDistribution.get('synthesis') || 0) > totalContributions * 0.2) {
            dynamics.push("Strong synthesis and integration efforts");
        }

        if ((typeDistribution.get('question') || 0) > totalContributions * 0.3) {
            dynamics.push("Inquiry-driven discussion with many questions");
        }

        return dynamics.length > 0 ? dynamics : ["Balanced collaborative discussion"];
    }

    private calculatePerspectiveDiversity(personas: Persona[]): number {
        // Calculate diversity based on unique expertise areas and backgrounds
        const allExpertise = new Set();
        const allBackgrounds = new Set();
        
        personas.forEach(persona => {
            persona.expertise.forEach(exp => allExpertise.add(exp));
            allBackgrounds.add(persona.background);
        });
        
        // Diversity score based on unique perspectives relative to group size
        const expertiseDiversity = allExpertise.size / (personas.length * 3); // Assume ~3 expertise areas per person
        const backgroundDiversity = allBackgrounds.size / personas.length;
        
        return Math.min((expertiseDiversity + backgroundDiversity) / 2, 1.0);
    }

    private calculateConsensusLevel(input: CollaborativeReasoningInput): number {
        const consensusPoints = input.consensusPoints || [];
        const disagreements = input.disagreements || [];
        const totalContributions = input.contributions.length;
        
        // Base consensus on explicit consensus points vs disagreements
        let consensusScore = 0.5; // Neutral starting point
        
        if (consensusPoints.length > 0) {
            consensusScore += Math.min(consensusPoints.length * 0.1, 0.3);
        }
        
        if (disagreements.length > 0) {
            consensusScore -= Math.min(disagreements.length * 0.15, 0.4);
        }
        
        // Adjust based on contribution types
        const supportiveContributions = input.contributions.filter(c => 
            c.type === 'insight' || c.type === 'synthesis'
        ).length;
        const challengingContributions = input.contributions.filter(c => 
            c.type === 'challenge' || c.type === 'concern'
        ).length;
        
        if (totalContributions > 0) {
            const supportRatio = supportiveContributions / totalContributions;
            const challengeRatio = challengingContributions / totalContributions;
            
            consensusScore += (supportRatio - challengeRatio) * 0.2;
        }
        
        return Math.max(0, Math.min(consensusScore, 1.0));
    }

    private identifyControversyAreas(input: CollaborativeReasoningInput): string[] {
        const controversies: string[] = [];
        
        // From explicit disagreements
        input.disagreements?.forEach(disagreement => {
            controversies.push(disagreement.topic);
        });
        
        // From contribution analysis
        const challengeContributions = input.contributions.filter(c => c.type === 'challenge');
        const concernContributions = input.contributions.filter(c => c.type === 'concern');
        
        // Group similar challenges/concerns
        const issueTopics = new Set<string>();
        [...challengeContributions, ...concernContributions].forEach(contrib => {
            // Simple keyword extraction for controversy areas
            const keywords = contrib.content.toLowerCase().split(' ').filter(word => word.length > 5);
            keywords.slice(0, 3).forEach(keyword => issueTopics.add(keyword));
        });
        
        issueTopics.forEach(topic => {
            if (!controversies.includes(topic)) {
                controversies.push(`Potential controversy around: ${topic}`);
            }
        });
        
        return controversies;
    }

    private extractEmergentThemes(input: CollaborativeReasoningInput): string[] {
        const themes: string[] = [];
        
        // From key insights
        if (input.keyInsights && input.keyInsights.length > 0) {
            themes.push(`Key insights emerging around: ${input.keyInsights.slice(0, 2).join(', ')}`);
        }
        
        // From synthesis contributions
        const syntheses = input.contributions.filter(c => c.type === 'synthesis');
        if (syntheses.length > 0) {
            themes.push("Synthesis patterns emerging across perspectives");
        }
        
        // From high-confidence insights
        const highConfidenceInsights = input.contributions.filter(c => 
            c.type === 'insight' && c.confidence > 0.8
        );
        if (highConfidenceInsights.length > 2) {
            themes.push("Strong convergence on key insights");
        }
        
        // Stage-specific themes
        switch (input.stage) {
            case 'problem-definition':
                themes.push("Problem scope and definition emerging");
                break;
            case 'ideation':
                themes.push("Creative solution generation in progress");
                break;
            case 'critique':
                themes.push("Critical evaluation and refinement phase");
                break;
            case 'integration':
                themes.push("Synthesis and integration of perspectives");
                break;
            case 'decision':
                themes.push("Moving toward decision and recommendation");
                break;
            case 'reflection':
                themes.push("Reflection and learning consolidation");
                break;
        }
        
        return themes;
    }

    private getSessionState(input: CollaborativeReasoningInput) {
        return {
            stage: input.stage,
            iteration: input.iteration,
            activePersonaId: input.activePersonaId,
            nextPersonaId: input.nextPersonaId || this.suggestNextPersona(input),
            consensusPoints: input.consensusPoints || [],
            disagreements: input.disagreements || [],
            keyInsights: input.keyInsights || [],
            openQuestions: input.openQuestions || []
        };
    }

    private suggestNextPersona(input: CollaborativeReasoningInput): string | null {
        // Find persona who hasn't contributed recently
        const recentContributions = input.contributions.slice(-3);
        const recentPersonas = new Set(recentContributions.map(c => c.personaId));
        
        const availablePersonas = input.personas.filter(p => !recentPersonas.has(p.id));
        
        if (availablePersonas.length > 0) {
            // Prefer personas with relevant expertise for current stage
            const stageExpertise = this.getStageRelevantExpertise(input.stage);
            const relevantPersonas = availablePersonas.filter(p => 
                p.expertise.some(exp => stageExpertise.includes(exp))
            );
            
            if (relevantPersonas.length > 0) {
                return relevantPersonas[0].id;
            }
            
            return availablePersonas[0].id;
        }
        
        return null;
    }

    private getStageRelevantExpertise(stage: string): string[] {
        const expertiseMap: { [key: string]: string[] } = {
            'problem-definition': ['systems thinking', 'analysis', 'research'],
            'ideation': ['creativity', 'innovation', 'design thinking'],
            'critique': ['critical thinking', 'evaluation', 'risk assessment'],
            'integration': ['synthesis', 'systems thinking', 'facilitation'],
            'decision': ['decision making', 'strategy', 'leadership'],
            'reflection': ['learning', 'evaluation', 'metacognition']
        };
        
        return expertiseMap[stage] || [];
    }

    private generateNextActions(input: CollaborativeReasoningInput): string[] {
        const actions: string[] = [];
        
        if (input.nextContributionNeeded) {
            const nextPersona = input.personas.find(p => p.id === (input.nextPersonaId || this.suggestNextPersona(input)));
            if (nextPersona) {
                actions.push(`Continue with contribution from ${nextPersona.name} (${nextPersona.expertise.join(', ')})`);
            }
            
            // Stage-specific suggestions
            switch (input.stage) {
                case 'problem-definition':
                    actions.push("Focus on clarifying problem scope and constraints");
                    actions.push("Identify stakeholders and success criteria");
                    break;
                case 'ideation':
                    actions.push("Generate diverse solution approaches");
                    actions.push("Build on previous ideas with 'yes, and' thinking");
                    break;
                case 'critique':
                    actions.push("Evaluate feasibility and potential risks");
                    actions.push("Challenge assumptions and identify gaps");
                    break;
                case 'integration':
                    actions.push("Synthesize compatible elements from different perspectives");
                    actions.push("Resolve disagreements through deeper exploration");
                    break;
                case 'decision':
                    actions.push("Evaluate options against defined criteria");
                    actions.push("Build consensus on recommended approach");
                    break;
                case 'reflection':
                    actions.push("Identify key learnings and insights");
                    actions.push("Document process improvements for future");
                    break;
            }
            
            // Contribution type suggestions
            const recentTypes = input.contributions.slice(-3).map(c => c.type);
            if (!recentTypes.includes('question')) {
                actions.push("Consider asking clarifying questions");
            }
            if (!recentTypes.includes('synthesis') && input.contributions.length > 5) {
                actions.push("Look for opportunities to synthesize perspectives");
            }
        } else {
            actions.push("Review session outcomes and key insights");
            actions.push("Document final recommendations and rationale");
            actions.push("Identify areas for follow-up exploration");
        }
        
        return actions;
    }

    // Utility methods for session management
    getSession(sessionId: string): CollaborativeReasoningInput | undefined {
        return this.sessions.get(sessionId);
    }

    endSession(sessionId: string): void {
        this.sessions.delete(sessionId);
        console.error(chalk.yellow(`🔚 Ended collaborative reasoning session: ${sessionId}`));
    }
} 