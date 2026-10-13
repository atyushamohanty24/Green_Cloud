Write-Host "Starting GreenCloud AI Backend Server..." -ForegroundColor Green
Set-Location -Path $PSScriptRoot
$PythonCmd = if (Test-Path ".\.venv\Scripts\python.exe") { ".\.venv\Scripts\python.exe" } else { "python" }
& $PythonCmd seed_db.py
& $PythonCmd -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

