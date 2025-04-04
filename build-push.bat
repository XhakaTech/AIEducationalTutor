@echo off
setlocal

REM Configuration
set PROJECT_ID=gen-lang-client-0728091754
set SERVICE_NAME=xhakatutor
set CONTAINER_IMAGE=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo 🏗️ Building backend container image...
docker build -t %CONTAINER_IMAGE%-backend -f backend.Dockerfile .
docker push %CONTAINER_IMAGE%-backend

echo 🏗️ Building frontend container image...
docker build -t %CONTAINER_IMAGE%-frontend -f frontend.Dockerfile .
docker push %CONTAINER_IMAGE%-frontend

echo ✨ Container images built and pushed successfully!
echo.
echo Backend image: %CONTAINER_IMAGE%-backend
echo Frontend image: %CONTAINER_IMAGE%-frontend
echo.
echo You can now select these container images in the Cloud Run configuration page.

endlocal 