@echo off
echo Starting GreenCloud AI Backend Server...
cd /d "%~dp0"
if exist .venv\Scripts\python.exe (
    set PYTHON=.\.venv\Scripts\python.exe
) else (
    set PYTHON=python
)
%PYTHON% seed_db.py
%PYTHON% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

