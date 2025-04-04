#!/bin/bash

# AI Educational Tutor Deployment Script
echo "🚀 Starting AI Educational Tutor deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Pull the latest changes if this is a git repository
if [ -d .git ]; then
    echo "📥 Pulling latest changes from git repository..."
    git pull
fi

# Build and start the Docker containers
echo "🏗️ Building and starting Docker containers..."
docker-compose build
docker-compose up -d

# Check if the application is running
echo "🔍 Checking if the application is running..."
sleep 10
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ AI Educational Tutor is running at http://localhost:5000"
else
    echo "❌ AI Educational Tutor failed to start. Check the logs with: docker-compose logs"
    exit 1
fi

echo "✨ Deployment completed successfully!" 