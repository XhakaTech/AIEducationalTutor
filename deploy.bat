@echo off
echo 🚀 Starting AI Educational Tutor deployment...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found. Please create one based on .env.example
    exit /b 1
)

REM Pull the latest changes if this is a git repository
if exist .git (
    echo 📥 Pulling latest changes from git repository...
    git pull
)

REM Build and start the Docker containers
echo 🏗️ Building and starting Docker containers...
docker-compose build
docker-compose up -d

REM Check if the application is running
echo 🔍 Checking if the application is running...
timeout /t 10 /nobreak > nul
curl -s http://localhost:5000/api/health > nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ AI Educational Tutor is running at http://localhost:5000
) else (
    echo ❌ AI Educational Tutor failed to start. Check the logs with: docker-compose logs
    exit /b 1
)

echo ✨ Deployment completed successfully! 