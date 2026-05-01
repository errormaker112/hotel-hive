@echo off
setlocal

echo ==========================================
echo Setting up Backend (Python)
echo ==========================================

cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists.
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend setup failed.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ==========================================
echo Setting up Frontend (Node.js)
echo ==========================================

cd frontend
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend setup failed.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ==========================================
echo Setup complete!
echo ==========================================
pause
