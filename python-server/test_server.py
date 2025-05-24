#!/usr/bin/env python3
"""
Test script for the embedding server.
"""

import requests
import json
import time
import sys

def test_server(base_url="http://127.0.0.1:8000"):
    """Test the embedding server functionality."""
    
    print(f"Testing embedding server at {base_url}")
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed")
            print(f"   Status: {health_data['status']}")
            print(f"   Model: {health_data['model']}")
            print(f"   Ready: {health_data['ready']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Simple embedding
    print("\n2. Testing single text embedding...")
    try:
        payload = {
            "texts": ["Hello, world!"]
        }
        response = requests.post(
            f"{base_url}/embed",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            embeddings = data['embeddings']
            print(f"✅ Single embedding successful")
            print(f"   Embedding dimension: {len(embeddings[0])}")
            print(f"   Model: {data['model']}")
            print(f"   Token usage: {data['usage']}")
        else:
            print(f"❌ Single embedding failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Single embedding failed: {e}")
        return False
    
    # Test 3: Batch embedding
    print("\n3. Testing batch embedding...")
    try:
        payload = {
            "texts": [
                "This is the first sentence.",
                "Here's another sentence.",
                "And one more for good measure."
            ]
        }
        response = requests.post(
            f"{base_url}/embed",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            embeddings = data['embeddings']
            print(f"✅ Batch embedding successful")
            print(f"   Number of embeddings: {len(embeddings)}")
            print(f"   Embedding dimensions: {[len(emb) for emb in embeddings]}")
            
            # Check if embeddings are different
            if len(embeddings) > 1:
                emb1, emb2 = embeddings[0], embeddings[1]
                similarity = sum(a*b for a, b in zip(emb1, emb2))
                print(f"   Similarity between first two: {similarity:.4f}")
                
        else:
            print(f"❌ Batch embedding failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Batch embedding failed: {e}")
        return False
    
    # Test 4: Empty input handling
    print("\n4. Testing error handling...")
    try:
        payload = {"texts": []}
        response = requests.post(
            f"{base_url}/embed",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 400:
            print(f"✅ Empty input properly rejected")
        else:
            print(f"⚠️  Empty input returned: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False
    
    print(f"\n🎉 All tests passed! Server is working correctly.")
    return True

def wait_for_server(base_url="http://127.0.0.1:8000", max_wait=60):
    """Wait for server to become available."""
    print(f"Waiting for server at {base_url} to become available...")
    
    start_time = time.time()
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Server is ready!")
                return True
        except:
            pass
        
        print(".", end="", flush=True)
        time.sleep(1)
    
    print(f"\n❌ Server didn't start within {max_wait} seconds")
    return False

if __name__ == "__main__":
    # Parse command line arguments
    base_url = "http://127.0.0.1:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    # Wait for server and then test
    if wait_for_server(base_url):
        success = test_server(base_url)
        sys.exit(0 if success else 1)
    else:
        print("❌ Server is not available")
        sys.exit(1) 