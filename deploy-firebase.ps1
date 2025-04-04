# Build the frontend
Write-Host "🏗️ Building frontend..."
Set-Location client
npm run build
Set-Location ..

# Deploy to Firebase Hosting
Write-Host "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

Write-Host "✨ Frontend deployment completed!" 