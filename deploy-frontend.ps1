# Configuration
$PROJECT = "gen-lang-client-0728091754"
$REGION = "us-central1"
$SERVICE = "xhakatutor-frontend"
$IMAGE = "gcr.io/$PROJECT/$SERVICE"

Write-Host "🚀 Deploying frontend to Cloud Run..."

# Deploy to Cloud Run with increased timeout
gcloud run deploy $SERVICE `
    --image $IMAGE `
    --platform managed `
    --region $REGION `
    --project $PROJECT `
    --allow-unauthenticated `
    --port=8080 `
    --memory=256Mi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --timeout=300

Write-Host "✨ Frontend deployment completed!" 