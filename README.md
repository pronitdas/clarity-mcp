# Clarity Mcp Server

A Model Context Protocol (MCP) server that provides structured reasoning and thinking tools for AI assistants. This server implements multiple cognitive frameworks and reasoning methodologies to enhance problem-solving capabilities.

## 🧠 Features

The Clarity Mcp Server provides the following reasoning tools:

### Core Reasoning Tools

- **🧠 Sequential Thinking**: Step-by-step reasoning with revision and branching capabilities
- **🔍 Mental Models**: Apply structured mental models (first principles, opportunity cost, etc.)
- **🏗️ Design Patterns**: Software architecture and implementation patterns
- **⚡ Programming Paradigms**: Different programming approaches (functional, OOP, etc.)
- **🔍 Debugging Approaches**: Systematic debugging methodologies
- **🧮 Memory Management**: Persistent memory graph with semantic search capabilities

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
git clone https://github.com/pronitdas/clarity-mcp.git
cd clarity-mcp
pnpm install
```

2. **Build the server:**
```bash
pnpm run build
```

3. **Run the server:**
```bash
pnpm start
```

### Development

```bash
# Watch mode for development
pnpm run dev

# Clean build files
pnpm run clean
```

## 🛠️ Usage

### MCP Integration Guide

The Clear Thought MCP Server is designed to be integrated with AI assistants through the Model Context Protocol (MCP). Here's how to integrate and use the server:

#### 1. Server Connection
- The server runs on stdio transport by default
- Ensure your MCP client is configured to connect via stdio
- Connection URL format: `mcp://localhost:0/clear-thinking`

#### 2. Authentication
- No authentication required for local development
- For production, implement your authentication strategy in `index.ts`

#### 3. Tool Registration
Register the tools with your MCP client:

```typescript
const tools = {
  sequentialthinking: {
    name: "sequentialthinking",
    description: "Step-by-step reasoning with revision capabilities",
    parameters: {
      thought: "string",
      thoughtNumber: "number",
      totalThoughts: "number",
      nextThoughtNeeded: "boolean"
    }
  },
  // ... other tools ...
};
```

#### 4. Error Handling
- Tools return structured error responses
- Check response.error for error details
- Handle timeouts and connection issues appropriately

### MCP Client Configuration

The server can be integrated with MCP-compatible clients using a simple configuration file. Here's a typical example:

```json
{
  "command": "npx",
  "args": [
    "clarity-mcp-server"
  ],
}
```

Place this configuration in your client's MCP configuration file (e.g., `mcp.json`). The server will be started automatically when the client needs to use the reasoning tools.

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

### Server Components
- `SequentialThinkingServer`: Manages step-by-step reasoning processes
- `MentalModelServer`: Handles mental model application
- `DesignPatternServer`: Processes software design patterns
- `ProgrammingParadigmServer`: Manages programming approach selection
- `DebuggingApproachServer`: Handles debugging methodologies
- `CollaborativeReasoningServer`: Manages multi-perspective analysis
- `DecisionFrameworkServer`: Handles decision analysis
- `MetacognitiveMonitoringServer`: Manages self-assessment
- `ScientificMethodServer`: Handles scientific reasoning
- `StructuredArgumentationServer`: Manages dialectical analysis
- `VisualReasoningServer`: Handles visual thinking tools
- `MemoryServer`: Manages persistent memory operations

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
- `procedural` - Function-based organization
- `object_oriented` - Class and object modeling
- `functional` - Function-based computation
- `declarative` - Outcome-focused programming
- `logic` - Rule-based programming
- `event_driven` - Event-driven programming
- `aspect_oriented` - Cross-cutting concern separation
- `concurrent` - Parallel execution patterns
- `reactive` - Event-driven data flows

### Debugging Approaches Available
- `binary_search` - Bisection debugging method
- `reverse_engineering` - Backward trace analysis
- `divide_conquer` - Component isolation method
- `backtracking` - Execution path tracing
- `cause_elimination` - Process of elimination
- `program_slicing` - Code dependency analysis

### Memory Operations Available
- `add` - Add new memory nodes
- `link` - Create relationships between memories
- `search` - Search across stored memories
- `context` - Retrieve memory context and relationships

## 🧠 Enhanced Embedding System

The Clarity MCP Server includes an advanced embedding system for superior semantic search capabilities:

### Python-Based Architecture
- **Primary Engine**: Uses Nomic's state-of-the-art embedding model (`nomic-embed-text-v2-moe`) via Python server
- **Automatic Management**: Node.js client automatically starts and manages the Python server
- **Fallback System**: Multi-tier fallback (sentence-transformers → transformers → hash-based)
- **High Performance**: Optimized for both CPU and GPU execution

### Features
- **Semantic Similarity**: Advanced text understanding beyond keyword matching
- **Context Awareness**: Maintains relationship context in memory graph
- **Zero Configuration**: Works out of the box with automatic server management
- **Multi-Modal Ready**: Architecture supports future image and multimodal embeddings

### Quick Usage
The embedding system works seamlessly:
```typescript
import { NomicEmbedder } from './utils/nomic-embedder';

const embedder = new NomicEmbedder();
const embeddings = await embedder.embed(['Hello world', 'Another text']);
```

The Node.js client automatically:
1. Starts the Python server if needed
2. Waits for it to be ready
3. Handles all HTTP communication
4. Provides fallbacks if the server fails

### Memory Operations with Semantic Search
```json
{
  "name": "memory",
  "arguments": {
    "operation": "search",
    "text": "machine learning neural networks",
    "type": "concept",
    "limit": 5,
    "threshold": 0.7
  }
}
```

### Performance Notes
- Server startup: ~5-15 seconds (first time, includes model download)
- Embedding generation: ~50-200ms per batch
- Search latency: ~10-50ms across 1000+ nodes
- Memory usage: ~500MB-2GB (depending on model and batch size)

### Visual Reasoning Operations
- Operations: `create`, `update`, `delete`, `transform`, `observe`
- Diagram Types: `graph`, `flowchart`, `stateDiagram`, `conceptMap`, `treeDiagram`, `custom`
- Element Types: `node`, `edge`, `container`, `annotation`
- Transform Types: `rotate`, `move`, `resize`, `recolor`, `regroup`

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
│   ├── memoryServer.ts   # Enhanced memory with embedding search
│   └── ...               # Other reasoning tools
├── utils/                # Utility modules
│   └── nomic-embedder.ts # Python server client integration
├── python-server/        # Python embedding server
│   ├── embedding_server.py     # FastAPI server
│   ├── requirements.txt        # Python dependencies
│   ├── start_server.sh         # Startup script
│   └── test_server.py          # Test script
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🔧 Configuration

### MCP Server Configuration
The server supports the following configuration options in `index.ts`:

```typescript
const config = {
  transport: "stdio", // or "tcp" for network transport
  port: 0, // default for stdio
  timeout: 30000, // tool execution timeout in ms
  maxConcurrent: 10, // max concurrent tool executions
  logging: {
    level: "info",
    format: "json"
  }
};

// Server initialization
const server = new Server({
  name: "clarity-mcp-server",
  version: "1.1.2",
  config
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
- Powered by Nomic's advanced embedding models

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

### MCP-Specific Issues

**Tool Execution Timeouts:**
- Increase timeout in server configuration
- Check for blocking operations in tool implementation
- Monitor system resources

**Schema Validation Errors:**
- Verify tool parameter types match schema
- Check for required parameters
- Validate enum values are correct

**Transport Issues:**
- For stdio: Check process stdin/stdout handling
- For TCP: Verify network connectivity and ports
- Check for conflicting transport configurations

### Embedding System Issues

**Model Download Failures:**
- Check internet connectivity during build
- Verify model URLs are accessible
- System will fallback to local embeddings if download fails

**FastAPI Issues:**
- Ensure compatible Node.js version (18+)
- Check system architecture compatibility
- Verify FastAPI installation

**Memory Issues:**
- Monitor system memory usage (~200MB for full model)
- Adjust embedding cache size if needed
- Consider using fallback embeddings for resource-constrained environments

## 📖 Further Reading

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Nomic Embeddings](https://www.nomic.ai/blog/posts/nomic-embed-text-v1)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Reasoning and Cognitive Science Resources](https://en.wikipedia.org/wiki/Cognitive_science)

## Embedding Architecture

This project now uses a **hybrid architecture** for embeddings:

- **Python Embedding Server**: A FastAPI-based server that handles the actual ML model inference
- **Node.js Proxy Client**: The TypeScript client that manages the Python server and provides a clean interface

### Why This Architecture?

1. **Better ML Support**: Python has superior support for ML models and transformers
2. **Easier Model Management**: Direct access to Hugging Face models without conversion
3. **Improved Performance**: Native Python inference is faster and more reliable
4. **Simpler Deployment**: The Node.js code is lighter without heavy ML dependencies

### Components

#### Python Server (`python-server/`)
- FastAPI-based HTTP server
- Automatic model downloading and caching
- Multiple fallback strategies (sentence-transformers → transformers → hash-based)
- Health monitoring and error handling

#### Node.js Client (`utils/nomic-embedder.ts`)
- Automatic server lifecycle management
- HTTP client for embeddings
- Retry logic and graceful fallbacks
- Same interface as before for seamless integration

### Quick Start

The embedding system works out of the box:

```typescript
import { NomicEmbedder } from './utils/nomic-embedder';

const embedder = new NomicEmbedder();
const embeddings = await embedder.embed(['Hello world', 'Another text']);
```

The Node.js client will automatically:
1. Start the Python server if needed
2. Wait for it to be ready
3. Handle all HTTP communication
4. Provide fallbacks if the server fails

### Manual Server Management

You can also run the Python server manually:

```bash
cd python-server
./start_server.sh
```

Or test it directly:

```bash
cd python-server
python3 test_server.py
```