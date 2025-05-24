# Python Embedding Server

This is a FastAPI-based embedding server that provides HTTP endpoints for generating text embeddings using the Nomic embedding models.

## Features

- **Multiple Model Support**: Automatic fallback from sentence-transformers to transformers to simple hash-based embeddings
- **Health Checks**: Built-in health endpoint for monitoring
- **Batch Processing**: Support for embedding multiple texts in one request
- **CORS Enabled**: Ready for cross-origin requests
- **Error Handling**: Robust error handling with detailed logging

## Quick Start

### 1. Install Dependencies

```bash
cd python-server
pip install -r requirements.txt
```

### 2. Start the Server

#### Option A: Using the startup script (recommended)
```bash
./start_server.sh
```

#### Option B: Manual start
```bash
python3 embedding_server.py
```

#### Option C: Using uvicorn directly
```bash
uvicorn embedding_server:app --host 127.0.0.1 --port 8000
```

### 3. Test the Server

```bash
# Health check
curl http://127.0.0.1:8000/health

# Generate embeddings
curl -X POST http://127.0.0.1:8000/embed \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Hello world", "This is a test"]}'
```

## API Endpoints

### Health Check
```
GET /health
```

Returns server status and model information.

### Generate Embeddings
```
POST /embed
```

Request body:
```json
{
  "texts": ["text1", "text2", ...],
  "model": "optional-model-name"
}
```

Response:
```json
{
  "embeddings": [[0.1, 0.2, ...], [0.3, 0.4, ...]],
  "model": "nomic-ai/nomic-embed-text-v1.5",
  "usage": {
    "prompt_tokens": 10,
    "total_tokens": 10
  }
}
```

## Environment Variables

- `HOST`: Server host (default: 127.0.0.1)
- `PORT`: Server port (default: 8000)

## Model Fallback Strategy

1. **sentence-transformers**: Uses the official sentence-transformers library (best performance)
2. **transformers**: Falls back to using transformers with manual pooling
3. **hash-based**: Simple fallback using text hashing (no ML dependencies required)

## Dependencies

### Required
- fastapi
- uvicorn
- numpy
- pydantic

### Optional (for ML models)
- sentence-transformers (recommended)
- torch + transformers (alternative)

## Development

To modify the server:

1. Edit `embedding_server.py`
2. Update `requirements.txt` if needed
3. Restart the server

## Integration with Node.js

The Node.js client (`utils/nomic-embedder.ts`) automatically:
- Starts this Python server
- Manages the server lifecycle
- Handles retries and fallbacks
- Provides the same interface as before

## Troubleshooting

### Server won't start
- Check Python version (requires Python 3.7+)
- Verify all dependencies are installed
- Check if port 8000 is available

### Model loading issues
- Check internet connection for downloading models
- Verify sufficient disk space for model cache
- Check RAM usage (models can be several GB)

### Performance issues
- Install sentence-transformers for best performance
- Use GPU if available (modify requirements.txt for CUDA)
- Adjust batch sizes based on available memory 