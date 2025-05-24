#!/bin/bash

# Embedding Server Startup Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Nomic Embedding Server...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install requirements
echo -e "${YELLOW}Installing/updating requirements...${NC}"
pip install -r requirements.txt

# Set environment variables
export PORT=${PORT:-8000}
export HOST=${HOST:-127.0.0.1}

echo -e "${GREEN}Starting server on ${HOST}:${PORT}${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Start the server
python embedding_server.py 