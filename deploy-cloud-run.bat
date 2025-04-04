@echo off
setlocal

REM Configuration
set PROJECT_ID=gen-lang-client-0728091754
set REGION=us-central1
set BACKEND_SERVICE_NAME=xhakatutor-backend
set FRONTEND_SERVICE_NAME=xhakatutor-frontend
set BACKEND_IMAGE=gcr.io/%PROJECT_ID%/%BACKEND_SERVICE_NAME%
set FRONTEND_IMAGE=gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE_NAME%

echo 🏗️ Building and pushing container images...

echo Building backend...
docker build -t %BACKEND_IMAGE% -f backend.Dockerfile .
docker push %BACKEND_IMAGE%

echo Building frontend...
docker build -t %FRONTEND_IMAGE% -f frontend.Dockerfile .
docker push %FRONTEND_IMAGE%

echo 🚀 Deploying backend to Cloud Run...
gcloud run deploy %BACKEND_SERVICE_NAME% ^
  --image %BACKEND_IMAGE% ^
  --platform managed ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 512Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 10

echo 🚀 Deploying frontend to Cloud Run...
gcloud run deploy %FRONTEND_SERVICE_NAME% ^
  --image %FRONTEND_IMAGE% ^
  --platform managed ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 256Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 10

REM Get the service URLs
for /f "tokens=* USEBACKQ" %%F in (`gcloud run services describe %BACKEND_SERVICE_NAME% --region %REGION% --project %PROJECT_ID% --format="value(status.url)"`) do (
  set BACKEND_URL=%%F
)

for /f "tokens=* USEBACKQ" %%F in (`gcloud run services describe %FRONTEND_SERVICE_NAME% --region %REGION% --project %PROJECT_ID% --format="value(status.url)"`) do (
  set FRONTEND_URL=%%F
)

echo ✨ Services deployed successfully!
echo 🌎 Backend URL: %BACKEND_URL%
echo 🌎 Frontend URL: %FRONTEND_URL%

endlocal 