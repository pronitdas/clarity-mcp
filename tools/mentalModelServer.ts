import chalk from "chalk";

export interface MentalModelInput {
    modelName: "first_principles" | "opportunity_cost" | "error_propagation" | "rubber_duck" | "pareto_principle" | "occams_razor";
    problem: string;
    steps?: string[];
    reasoning?: string;
    conclusion?: string;
}

export interface MentalModelResult {
    success: boolean;
    modelName: string;
    problem: string;
    analysis: {
        steps: string[];
        reasoning: string;
        insights: string[];
        applications: string[];
    };
    conclusion: string;
    nextSteps: string[];
    timestamp: string;
}

export class MentalModelServer {
    processModel(input: MentalModelInput): MentalModelResult {
        console.error(chalk.blue(`🧠 Processing Mental Model: ${input.modelName}`));
        
        const analysis = this.analyzeWithModel(input);
        
        return {
            success: true,
            modelName: input.modelName,
            problem: input.problem,
            analysis,
            conclusion: input.conclusion || analysis.reasoning,
            nextSteps: this.generateNextSteps(input.modelName, analysis),
            timestamp: new Date().toISOString(),
        };
    }

    private analyzeWithModel(input: MentalModelInput) {
        const steps = input.steps || this.generateSteps(input.modelName, input.problem);
        const reasoning = input.reasoning || this.generateReasoning(input.modelName, input.problem);
        const insights = this.generateInsights(input.modelName, input.problem);
        const applications = this.generateApplications(input.modelName);

        return { steps, reasoning, insights, applications };
    }

    private generateSteps(modelName: string, problem: string): string[] {
        const stepTemplates: Record<string, string[]> = {
            first_principles: [
                "Identify the fundamental truths and basic principles",
                "Strip away assumptions and conventional wisdom",
                "Build up understanding from the ground up",
                "Question each assumption systematically",
                "Reconstruct the solution from basics"
            ],
            opportunity_cost: [
                "Identify all available options",
                "Determine the value of the best alternative",
                "Calculate explicit and implicit costs",
                "Evaluate trade-offs and sacrifices",
                "Make decision based on comparative value"
            ],
            error_propagation: [
                "Identify potential error sources",
                "Trace how errors compound through the system",
                "Assess impact and magnification factors",
                "Implement error detection and correction",
                "Design robust failure handling"
            ],
            rubber_duck: [
                "Explain the problem step by step aloud",
                "Describe what should happen vs what's happening",
                "Walk through the logic line by line",
                "Question assumptions and expectations",
                "Listen for inconsistencies in explanation"
            ],
            pareto_principle: [
                "Identify all contributing factors",
                "Rank factors by impact or importance",
                "Focus on the vital few (20%) that drive most results",
                "Allocate resources to high-impact areas",
                "Monitor and adjust based on effectiveness"
            ],
            occams_razor: [
                "List all possible explanations",
                "Evaluate complexity of each explanation",
                "Prefer simpler explanations over complex ones",
                "Test the simplest viable hypothesis first",
                "Add complexity only when necessary"
            ]
        };
        
        return stepTemplates[modelName] || ["Analyze the problem", "Apply the model", "Draw conclusions"];
    }

    private generateReasoning(modelName: string, problem: string): string {
        const reasoningTemplates: Record<string, string> = {
            first_principles: `Applying first principles thinking to break down "${problem}" into fundamental components and rebuild understanding from the ground up.`,
            opportunity_cost: `Analyzing opportunity costs for "${problem}" by evaluating what we give up when choosing one path over alternatives.`,
            error_propagation: `Examining how errors might propagate through the system when addressing "${problem}" and building resilience.`,
            rubber_duck: `Using rubber duck debugging methodology to explain "${problem}" step-by-step and uncover hidden assumptions.`,
            pareto_principle: `Applying the 80/20 rule to identify the vital few factors that will have the most impact on "${problem}".`,
            occams_razor: `Seeking the simplest explanation or solution for "${problem}" while avoiding unnecessary complexity.`
        };
        
        return reasoningTemplates[modelName] || `Applying ${modelName} model to analyze ${problem}`;
    }

    private generateInsights(modelName: string, problem: string): string[] {
        const insightTemplates: Record<string, string[]> = {
            first_principles: [
                "Fundamental assumptions may not be as solid as they appear",
                "Complex problems often have simple underlying principles",
                "Starting from basics reveals hidden complexity"
            ],
            opportunity_cost: [
                "Every choice involves trade-offs",
                "Hidden costs often exceed visible ones",
                "Time and attention are finite resources"
            ],
            error_propagation: [
                "Small errors can cascade into major failures",
                "System design should account for error amplification",
                "Early detection prevents downstream problems"
            ],
            rubber_duck: [
                "Explaining forces clarification of thinking",
                "Assumptions become visible when articulated",
                "Teaching reveals gaps in understanding"
            ],
            pareto_principle: [
                "Most impact comes from a few key factors",
                "Efficiency comes from focusing on vital few",
                "Not all problems deserve equal attention"
            ],
            occams_razor: [
                "Simple explanations are often correct",
                "Complexity should be justified",
                "Elegant solutions are usually better"
            ]
        };
        
        return insightTemplates[modelName] || ["Standard insights for this model"];
    }

    private generateApplications(modelName: string): string[] {
        const applicationTemplates: Record<string, string[]> = {
            first_principles: [
                "Product development and innovation",
                "Problem-solving in unfamiliar domains",
                "Challenging industry assumptions"
            ],
            opportunity_cost: [
                "Resource allocation decisions",
                "Strategic planning and prioritization",
                "Investment and time management"
            ],
            error_propagation: [
                "System design and architecture",
                "Quality assurance and testing",
                "Risk management and mitigation"
            ],
            rubber_duck: [
                "Debugging and troubleshooting",
                "Code review and explanation",
                "Learning and knowledge transfer"
            ],
            pareto_principle: [
                "Project management and prioritization",
                "Performance optimization",
                "Resource allocation and focus"
            ],
            occams_razor: [
                "Hypothesis formation and testing",
                "Design simplification",
                "Problem diagnosis and solution"
            ]
        };
        
        return applicationTemplates[modelName] || ["General problem-solving applications"];
    }

    private generateNextSteps(modelName: string, analysis: any): string[] {
        return [
            "Review the analysis and insights generated",
            "Apply the reasoning to specific aspects of the problem",
            "Test key assumptions identified in the analysis",
            "Iterate on the solution based on new understanding",
            "Consider combining with other mental models for deeper insight"
        ];
    }
} 