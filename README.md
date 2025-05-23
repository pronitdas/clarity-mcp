# Clear Thought MCP Server

A Model Context Protocol (MCP) server that provides structured reasoning and thinking tools for AI assistants. This server implements multiple cognitive frameworks and reasoning methodologies to enhance problem-solving capabilities.

## 🧠 Features

The Clear Thought MCP Server provides the following reasoning tools:

### Core Reasoning Tools

- **🧠 Sequential Thinking**: Step-by-step reasoning with revision and branching capabilities
- **🔍 Mental Models**: Apply structured mental models (first principles, opportunity cost, etc.)
- **🏗️ Design Patterns**: Software architecture and implementation patterns
- **⚡ Programming Paradigms**: Different programming approaches (functional, OOP, etc.)
- **🔍 Debugging Approaches**: Systematic debugging methodologies

### Advanced Reasoning Tools

- **👥 Collaborative Reasoning**: Multi-perspective problem solving with virtual personas
- **⚖️ Decision Framework**: Structured decision analysis and evaluation
- **🧮 Metacognitive Monitoring**: Self-assessment of knowledge and reasoning quality
- **🔬 Scientific Method**: Formal scientific reasoning and hypothesis testing
- **📝 Structured Argumentation**: Dialectical reasoning and argument analysis
- **🎨 Visual Reasoning**: Visual thinking and diagram-based problem solving

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd clear-thinking
npm install
```

2. **Build the server:**
```bash
npm run build
```

3. **Run the server:**
```bash
npm start
```

### Development

```bash
# Watch mode for development
npm run dev

# Clean build files
npm run clean
```

## 🛠️ Usage

The server implements the Model Context Protocol and can be used with any MCP-compatible client (like Claude Desktop, Cursor, or other AI assistants).

### Example Tool Usage

#### Sequential Thinking
```json
{
  "name": "sequentialthinking",
  "arguments": {
    "thought": "Let me analyze this step by step...",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "nextThoughtNeeded": true
  }
}
```

#### Mental Models
```json
{
  "name": "mentalmodel",
  "arguments": {
    "modelName": "first_principles",
    "problem": "How to optimize database performance"
  }
}
```

#### Design Patterns
```json
{
  "name": "designpattern",
  "arguments": {
    "patternName": "modular_architecture",
    "context": "Building a scalable web application"
  }
}
```

#### Collaborative Reasoning
```json
{
  "name": "collaborativereasoning",
  "arguments": {
    "topic": "Should we implement microservices?",
    "personas": [
      {
        "id": "architect",
        "name": "Senior Architect",
        "expertise": ["system design", "scalability"],
        "background": "10+ years in enterprise architecture"
      }
    ],
    "stage": "problem-definition",
    "sessionId": "session-1",
    "iteration": 0,
    "nextContributionNeeded": true
  }
}
```

## 📋 Tool Reference

### Mental Models Available
- `first_principles` - Break down to fundamental truths
- `opportunity_cost` - Analyze trade-offs and alternatives
- `error_propagation` - Understand how errors compound
- `rubber_duck` - Explain problems step-by-step
- `pareto_principle` - Focus on vital few factors
- `occams_razor` - Prefer simpler explanations

### Design Patterns Available
- `modular_architecture` - Component-based design
- `api_integration` - Service integration patterns
- `state_management` - State handling strategies
- `async_processing` - Asynchronous operation patterns
- `scalability` - Scaling and performance patterns
- `security` - Security implementation patterns
- `agentic_design` - Autonomous agent patterns

### Programming Paradigms Available
- `imperative` - Step-by-step instruction style
- `functional` - Function-based computation
- `object_oriented` - Class and object modeling
- `reactive` - Event-driven data flows
- `concurrent` - Parallel execution patterns
- And more...

### Debugging Approaches Available
- `binary_search` - Bisection debugging method
- `reverse_engineering` - Backward trace analysis
- `divide_conquer` - Component isolation method
- `backtracking` - Execution path tracing
- `cause_elimination` - Process of elimination
- `program_slicing` - Code dependency analysis

## 🏗️ Architecture

```
clear-thinking/
├── index.ts              # Main MCP server entry point
├── tools/                # Tool implementations
│   ├── mentalModelServer.ts
│   ├── sequentialThinkingServer.ts
│   ├── designPatternServer.ts
│   ├── programmingParadigmServer.ts
│   ├── debuggingApproachServer.ts
│   ├── collaborativeReasoningServer.ts
│   └── ...               # Other reasoning tools
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🔧 Configuration

The server runs on stdio transport by default. Configuration can be adjusted in `index.ts`:

```typescript
// Server configuration
const server = new Server({
  name: "clarity-mcp-server",
  version: "1.1.2"
}, {
  capabilities: {
    tools: { /* tool definitions */ }
  }
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io/)
- Inspired by various cognitive science and reasoning frameworks
- Uses TypeScript for type safety and developer experience

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Runtime Errors:**
- Check that all dependencies are installed
- Verify Node.js version (18+)
- Check TypeScript compilation errors

**MCP Connection Issues:**
- Ensure the server is running on stdio
- Check client MCP configuration
- Verify tool schema compatibility

## 📖 Further Reading

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Reasoning and Cognitive Science Resources](https://en.wikipedia.org/wiki/Cognitive_science) 