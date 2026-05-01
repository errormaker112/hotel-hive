@start "" /b cmd /c "cd backend && venv\Scripts\activate && python manage.py runserver"
start "" cmd /c "cd frontend && npm start"

title Development Server Started

echo Press any key to close the windows...
pause >nul