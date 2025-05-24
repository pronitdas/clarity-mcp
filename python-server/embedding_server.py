#!/usr/bin/env python3
"""
Embedding server using Nomic embedding models.
Provides HTTP API for generating embeddings.
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import asyncio
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nomic Embedding Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model
embedder = None
model_name = "nomic-ai/nomic-embed-text-v2-moe"

class EmbedRequest(BaseModel):
    texts: List[str]
    model: Optional[str] = None

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    usage: dict

class HealthResponse(BaseModel):
    status: str
    model: str
    ready: bool

async def load_model():
    """Load the embedding model."""
    global embedder, model_name
    
    try:
        logger.info(f"Loading model: {model_name}")
        
        # Try to import sentence-transformers
        try:
            from sentence_transformers import SentenceTransformer
            embedder = SentenceTransformer(model_name, trust_remote_code=True)
            logger.info("Successfully loaded model with sentence-transformers")
            return
        except ImportError:
            logger.warning("sentence-transformers not available, trying transformers")
        
        # Fallback to transformers
        try:
            from transformers import AutoTokenizer, AutoModel
            import torch
            
            class TransformersEmbedder:
                def __init__(self, model_name):
                    self.tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
                    self.model = AutoModel.from_pretrained(model_name, trust_remote_code=True)
                    self.model.eval()
                
                def encode(self, texts):
                    # Tokenize and encode
                    inputs = self.tokenizer(texts, return_tensors='pt', padding=True, truncation=True, max_length=512)
                    
                    with torch.no_grad():
                        outputs = self.model(**inputs)
                        # Use mean pooling
                        embeddings = outputs.last_hidden_state.mean(dim=1)
                        # Normalize
                        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
                    
                    return embeddings.numpy()
            
            embedder = TransformersEmbedder(model_name)
            logger.info("Successfully loaded model with transformers")
            return
            
        except ImportError:
            logger.warning("transformers not available, using fallback")
        
        # Simple fallback embedder
        class FallbackEmbedder:
            def encode(self, texts):
                embeddings = []
                for text in texts:
                    # Simple hash-based embedding
                    embedding = np.zeros(768, dtype=np.float32)
                    text_clean = text.lower().strip()
                    
                    for i, char in enumerate(text_clean[:100]):
                        char_code = ord(char)
                        idx = (char_code * 7 + i * 11) % 768
                        embedding[idx] += np.sin(char_code + i) * 0.1
                    
                    # Add length feature
                    embedding[0] = np.log(len(text_clean) + 1) * 0.1
                    
                    # Normalize
                    norm = np.linalg.norm(embedding)
                    if norm > 0:
                        embedding = embedding / norm
                    
                    embeddings.append(embedding)
                
                return np.array(embeddings)
        
        embedder = FallbackEmbedder()
        logger.warning("Using fallback embedder - install sentence-transformers or transformers for better results")
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup."""
    await load_model()

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model=model_name,
        ready=embedder is not None
    )

@app.post("/embed", response_model=EmbedResponse)
async def embed_texts(request: EmbedRequest):
    """Generate embeddings for the given texts."""
    if embedder is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.texts:
        raise HTTPException(status_code=400, detail="No texts provided")
    
    if len(request.texts) > 100:
        raise HTTPException(status_code=400, detail="Too many texts (max 100)")
    
    try:
        logger.info(f"Embedding {len(request.texts)} texts")
        
        # Generate embeddings
        embeddings = embedder.encode(request.texts)
        
        # Convert to list of lists
        embeddings_list = [emb.tolist() for emb in embeddings]
        
        return EmbedResponse(
            embeddings=embeddings_list,
            model=request.model or model_name,
            usage={
                "prompt_tokens": sum(len(text.split()) for text in request.texts),
                "total_tokens": sum(len(text.split()) for text in request.texts)
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Nomic Embedding Server", "model": model_name}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port) 