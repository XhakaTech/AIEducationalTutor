#!/bin/bash

# Configuration
PROJECT_ID="gen-lang-client-0728091754"
REGION="us-central1"  # Change this to your preferred region
SERVICE_NAME="aieducationaltutor"
CONTAINER_IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Build and push the container image
echo "🏗️ Building and pushing container image..."
docker build -t ${CONTAINER_IMAGE} -f backend.Dockerfile .
docker push ${CONTAINER_IMAGE}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${CONTAINER_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID} --format='value(status.url)')
echo "✨ Service deployed successfully!"
echo "🌎 Service URL: ${SERVICE_URL}" 