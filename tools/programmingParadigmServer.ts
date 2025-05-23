import chalk from "chalk";

export interface ProgrammingParadigmInput {
    paradigmName: "imperative" | "procedural" | "object_oriented" | "functional" | "declarative" | "logic" | "event_driven" | "aspect_oriented" | "concurrent" | "reactive";
    problem: string;
    approach?: string[];
    benefits?: string[];
    limitations?: string[];
    codeExample?: string;
    languages?: string[];
}

export interface ProgrammingParadigmResult {
    success: boolean;
    paradigmName: string;
    problem: string;
    analysis: {
        approach: string[];
        benefits: string[];
        limitations: string[];
        principles: string[];
        bestPractices: string[];
    };
    codeExample: string;
    languages: string[];
    suitableFor: string[];
    avoidWhen: string[];
    timestamp: string;
}

export class ProgrammingParadigmServer {
    processParadigm(input: ProgrammingParadigmInput): ProgrammingParadigmResult {
        console.error(chalk.magenta(`⚡ Processing Programming Paradigm: ${input.paradigmName}`));
        
        const analysis = this.analyzeParadigm(input);
        const codeExample = input.codeExample || this.generateCodeExample(input.paradigmName, input.languages?.[0] || "typescript");
        const languages = input.languages || this.getLanguagesForParadigm(input.paradigmName);
        
        return {
            success: true,
            paradigmName: input.paradigmName,
            problem: input.problem,
            analysis,
            codeExample,
            languages,
            suitableFor: this.getSuitableUseCases(input.paradigmName),
            avoidWhen: this.getAvoidanceCriteria(input.paradigmName),
            timestamp: new Date().toISOString(),
        };
    }

    private analyzeParadigm(input: ProgrammingParadigmInput) {
        return {
            approach: input.approach || this.getApproach(input.paradigmName),
            benefits: input.benefits || this.getBenefits(input.paradigmName),
            limitations: input.limitations || this.getLimitations(input.paradigmName),
            principles: this.getPrinciples(input.paradigmName),
            bestPractices: this.getBestPractices(input.paradigmName)
        };
    }

    private getApproach(paradigmName: string): string[] {
        const approaches: { [key: string]: string[] } = {
            imperative: [
                "Break down problem into sequential steps",
                "Define variables to track state changes",
                "Use control structures (loops, conditionals)",
                "Modify state directly through assignments",
                "Focus on how to solve the problem"
            ],
            procedural: [
                "Decompose problem into smaller functions",
                "Pass data between functions as parameters",
                "Organize functions into logical modules",
                "Minimize global state usage",
                "Focus on reusable function design"
            ],
            object_oriented: [
                "Model problem domain as interacting objects",
                "Define classes with data and behavior",
                "Use inheritance for code reuse",
                "Apply polymorphism for flexible design",
                "Encapsulate data and operations"
            ],
            functional: [
                "Express solution as function compositions",
                "Use pure functions without side effects",
                "Apply higher-order functions and recursion",
                "Leverage immutable data structures",
                "Focus on what to compute, not how"
            ],
            declarative: [
                "Specify desired outcome, not implementation",
                "Use domain-specific languages or frameworks",
                "Define constraints and relationships",
                "Let the system determine execution strategy",
                "Focus on problem specification"
            ],
            logic: [
                "Define facts and rules about the problem",
                "Express relationships using logical statements",
                "Use inference engines for problem solving",
                "Query the knowledge base for solutions",
                "Let logical reasoning find answers"
            ],
            event_driven: [
                "Identify events and their handlers",
                "Design loose coupling between components",
                "Implement event publishing and subscription",
                "Handle asynchronous event processing",
                "Create responsive user interfaces"
            ],
            aspect_oriented: [
                "Identify cross-cutting concerns",
                "Separate core logic from aspects",
                "Define pointcuts and advice",
                "Weave aspects into the main program",
                "Maintain clean separation of concerns"
            ],
            concurrent: [
                "Identify parallelizable tasks",
                "Design thread-safe data structures",
                "Implement synchronization mechanisms",
                "Handle race conditions and deadlocks",
                "Optimize for multi-core execution"
            ],
            reactive: [
                "Model data as streams and observables",
                "Compose operations on data streams",
                "Handle asynchronous data sources",
                "Implement backpressure and error handling",
                "Create responsive and resilient systems"
            ]
        };
        
        return approaches[paradigmName] || ["Apply paradigm-specific techniques"];
    }

    private getBenefits(paradigmName: string): string[] {
        const benefits: { [key: string]: string[] } = {
            imperative: [
                "Direct control over program execution",
                "Easy to understand for beginners",
                "Efficient memory usage",
                "Close to machine-level operations",
                "Straightforward debugging"
            ],
            procedural: [
                "Code reusability through functions",
                "Better organization than pure imperative",
                "Easier testing of individual functions",
                "Reduced code duplication",
                "Modular design approach"
            ],
            object_oriented: [
                "Natural modeling of real-world entities",
                "Code reusability through inheritance",
                "Encapsulation provides data security",
                "Polymorphism enables flexible design",
                "Easier maintenance of large codebases"
            ],
            functional: [
                "Predictable behavior with pure functions",
                "Easier testing and debugging",
                "Better support for parallelization",
                "Reduced side effects and bugs",
                "Mathematical reasoning about code"
            ],
            declarative: [
                "Higher level of abstraction",
                "Less boilerplate code",
                "Focus on problem domain",
                "Often more readable and maintainable",
                "Automatic optimization opportunities"
            ],
            logic: [
                "Natural representation of knowledge",
                "Automatic search and inference",
                "Flexible problem solving",
                "Easy to modify rules and facts",
                "Suitable for AI and expert systems"
            ],
            event_driven: [
                "Highly responsive user interfaces",
                "Loose coupling between components",
                "Natural handling of asynchronous events",
                "Scalable architecture",
                "Better separation of concerns"
            ],
            aspect_oriented: [
                "Clean separation of concerns",
                "Reduced code tangling and scattering",
                "Easier maintenance of cross-cutting features",
                "Better code modularity",
                "Simplified debugging of specific aspects"
            ],
            concurrent: [
                "Better performance on multi-core systems",
                "Improved responsiveness",
                "Higher throughput for I/O operations",
                "Better resource utilization",
                "Scalability for large systems"
            ],
            reactive: [
                "Excellent handling of asynchronous data",
                "Composable and declarative data flows",
                "Built-in error handling and recovery",
                "Backpressure management",
                "Responsive and resilient systems"
            ]
        };
        
        return benefits[paradigmName] || ["General programming benefits"];
    }

    private getLimitations(paradigmName: string): string[] {
        const limitations: { [key: string]: string[] } = {
            imperative: [
                "Can become complex with state management",
                "Harder to reason about with side effects",
                "Difficult to parallelize",
                "Maintenance challenges in large programs",
                "Tight coupling between components"
            ],
            procedural: [
                "Global state can still cause issues",
                "Limited abstraction capabilities",
                "Difficulty with complex data relationships",
                "No built-in data encapsulation",
                "Can lead to long parameter lists"
            ],
            object_oriented: [
                "Can lead to over-engineering",
                "Inheritance hierarchies can become complex",
                "Performance overhead from abstraction",
                "Tight coupling through inheritance",
                "Difficulty with some problem domains"
            ],
            functional: [
                "Steep learning curve",
                "Performance overhead in some cases",
                "Memory usage from immutable structures",
                "Limited state management options",
                "Not suitable for all problem types"
            ],
            declarative: [
                "Less control over execution",
                "Performance can be unpredictable",
                "Debugging can be challenging",
                "Limited flexibility in some cases",
                "Dependency on underlying implementation"
            ],
            logic: [
                "Performance can be unpredictable",
                "Limited practical applications",
                "Steep learning curve",
                "Debugging can be difficult",
                "Not suitable for all problem domains"
            ],
            event_driven: [
                "Complex debugging and testing",
                "Potential memory leaks from event handlers",
                "Difficult to understand program flow",
                "Race conditions and timing issues",
                "Complexity in event ordering"
            ],
            aspect_oriented: [
                "Increased complexity and learning curve",
                "Debugging can be challenging",
                "Tool and language support limitations",
                "Potential for aspect conflicts",
                "Hidden dependencies between aspects"
            ],
            concurrent: [
                "Complex debugging and testing",
                "Race conditions and deadlocks",
                "Increased memory overhead",
                "Synchronization complexity",
                "Non-deterministic behavior"
            ],
            reactive: [
                "Steep learning curve",
                "Complex debugging",
                "Memory management challenges",
                "Performance overhead from operators",
                "Difficulty reasoning about timing"
            ]
        };
        
        return limitations[paradigmName] || ["Paradigm-specific limitations"];
    }

    private getPrinciples(paradigmName: string): string[] {
        const principles: { [key: string]: string[] } = {
            imperative: ["Sequential execution", "Direct state manipulation", "Explicit control flow"],
            procedural: ["Function decomposition", "Parameter passing", "Modular design"],
            object_oriented: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
            functional: ["Immutability", "Pure functions", "Higher-order functions", "Function composition"],
            declarative: ["What not how", "Domain abstraction", "Constraint specification"],
            logic: ["Facts and rules", "Logical inference", "Declarative knowledge"],
            event_driven: ["Event-response pattern", "Loose coupling", "Asynchronous communication"],
            aspect_oriented: ["Separation of concerns", "Cross-cutting modularization", "Advice and pointcuts"],
            concurrent: ["Parallel execution", "Synchronization", "Resource sharing"],
            reactive: ["Data streams", "Asynchronous processing", "Event propagation"]
        };
        
        return principles[paradigmName] || ["Core paradigm principles"];
    }

    private getBestPractices(paradigmName: string): string[] {
        const practices: { [key: string]: string[] } = {
            imperative: [
                "Keep functions small and focused",
                "Minimize shared mutable state",
                "Use clear variable names",
                "Avoid deep nesting"
            ],
            procedural: [
                "Design cohesive functions",
                "Minimize coupling between functions",
                "Use meaningful function names",
                "Keep parameter lists manageable"
            ],
            object_oriented: [
                "Follow SOLID principles",
                "Prefer composition over inheritance",
                "Use interfaces for abstraction",
                "Keep classes focused on single responsibility"
            ],
            functional: [
                "Write pure functions when possible",
                "Use immutable data structures",
                "Leverage function composition",
                "Avoid side effects"
            ],
            declarative: [
                "Focus on problem specification",
                "Use appropriate domain languages",
                "Leverage existing frameworks",
                "Keep declarations simple and clear"
            ],
            logic: [
                "Keep rules simple and clear",
                "Organize facts logically",
                "Use appropriate inference strategies",
                "Test rules thoroughly"
            ],
            event_driven: [
                "Keep event handlers lightweight",
                "Avoid memory leaks from handlers",
                "Use proper event naming conventions",
                "Handle errors in event processing"
            ],
            aspect_oriented: [
                "Keep aspects focused and cohesive",
                "Avoid aspect interference",
                "Document aspect interactions",
                "Test aspects independently"
            ],
            concurrent: [
                "Minimize shared mutable state",
                "Use appropriate synchronization",
                "Avoid deadlocks and race conditions",
                "Design for thread safety"
            ],
            reactive: [
                "Handle backpressure appropriately",
                "Use proper error handling",
                "Avoid memory leaks in streams",
                "Keep operators simple and composable"
            ]
        };
        
        return practices[paradigmName] || ["General best practices"];
    }

    private generateCodeExample(paradigmName: string, language: string): string {
        const examples: { [key: string]: { [key: string]: string } } = {
            functional: {
                typescript: `
// Functional approach to array processing
const numbers = [1, 2, 3, 4, 5];

// Pure functions
const square = (x: number): number => x * x;
const isEven = (x: number): boolean => x % 2 === 0;

// Function composition
const processNumbers = (nums: number[]): number[] =>
  nums
    .filter(isEven)
    .map(square)
    .sort((a, b) => a - b);

const result = processNumbers(numbers); // [4, 16]
`,
                haskell: `
-- Pure functional approach
square :: Int -> Int
square x = x * x

isEven :: Int -> Bool
isEven x = x \`mod\` 2 == 0

processNumbers :: [Int] -> [Int]
processNumbers = sort . map square . filter isEven

result = processNumbers [1,2,3,4,5] -- [4,16]
`
            },
            object_oriented: {
                typescript: `
// Object-oriented approach
interface Shape {
  area(): number;
  perimeter(): number;
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number
  ) {}

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// Polymorphism in action
const shapes: Shape[] = [
  new Rectangle(5, 3),
  new Circle(2)
];

const totalArea = shapes.reduce((sum, shape) => sum + shape.area(), 0);
`
            },
            reactive: {
                typescript: `
// Reactive programming with RxJS
import { fromEvent, map, filter, debounceTime } from 'rxjs';

// Create observable from input events
const searchInput = document.getElementById('search') as HTMLInputElement;
const searchEvents$ = fromEvent(searchInput, 'input');

// Reactive data flow
const searchResults$ = searchEvents$.pipe(
  map((event: Event) => (event.target as HTMLInputElement).value),
  filter(text => text.length > 2),
  debounceTime(300),
  map(query => searchAPI(query))
);

// Subscribe to the stream
searchResults$.subscribe(results => {
  displayResults(results);
});
`
            }
        };
        
        return examples[paradigmName]?.[language] || 
               `// ${paradigmName} paradigm example in ${language}\n// Implementation would demonstrate ${paradigmName} principles`;
    }

    private getLanguagesForParadigm(paradigmName: string): string[] {
        const languageMap: { [key: string]: string[] } = {
            imperative: ["C", "Assembly", "Fortran", "COBOL"],
            procedural: ["C", "Pascal", "Go", "Rust"],
            object_oriented: ["Java", "C#", "C++", "Python", "TypeScript"],
            functional: ["Haskell", "Lisp", "Clojure", "F#", "Elm"],
            declarative: ["SQL", "HTML", "CSS", "Prolog"],
            logic: ["Prolog", "Mercury", "Datalog"],
            event_driven: ["JavaScript", "C#", "Java", "Python"],
            aspect_oriented: ["AspectJ", "C#", "Spring AOP"],
            concurrent: ["Go", "Rust", "Erlang", "Java", "C#"],
            reactive: ["JavaScript", "TypeScript", "Scala", "Clojure"]
        };
        
        return languageMap[paradigmName] || ["TypeScript", "Python"];
    }

    private getSuitableUseCases(paradigmName: string): string[] {
        const useCases: { [key: string]: string[] } = {
            imperative: ["System programming", "Performance-critical applications", "Hardware control"],
            procedural: ["Scripts and utilities", "System administration", "Mathematical computations"],
            object_oriented: ["Large enterprise applications", "GUI applications", "Game development"],
            functional: ["Data transformation", "Mathematical computations", "Concurrent systems"],
            declarative: ["Database queries", "Configuration", "Markup and styling"],
            logic: ["Expert systems", "AI reasoning", "Rule-based systems"],
            event_driven: ["User interfaces", "Real-time systems", "IoT applications"],
            aspect_oriented: ["Enterprise applications", "Framework development", "Cross-cutting concerns"],
            concurrent: ["Server applications", "Parallel processing", "Real-time systems"],
            reactive: ["Real-time data processing", "User interfaces", "Streaming applications"]
        };
        
        return useCases[paradigmName] || ["General programming applications"];
    }

    private getAvoidanceCriteria(paradigmName: string): string[] {
        const avoidWhen: { [key: string]: string[] } = {
            imperative: ["Complex state management required", "High-level abstractions needed"],
            procedural: ["Complex object relationships", "Need for data encapsulation"],
            object_oriented: ["Simple scripts", "Performance-critical code", "Mathematical computations"],
            functional: ["Heavy I/O operations", "Performance-critical systems", "Simple procedural tasks"],
            declarative: ["Need fine control over execution", "Performance optimization required"],
            logic: ["Procedural algorithms", "Real-time systems", "Simple data processing"],
            event_driven: ["Sequential processing", "Simple linear workflows", "Batch processing"],
            aspect_oriented: ["Simple applications", "Learning projects", "Performance-critical code"],
            concurrent: ["Simple sequential tasks", "Single-threaded environments", "Debugging-intensive development"],
            reactive: ["Simple CRUD operations", "Linear data processing", "Simple user interfaces"]
        };
        
        return avoidWhen[paradigmName] || ["When paradigm doesn't fit problem domain"];
    }
} 