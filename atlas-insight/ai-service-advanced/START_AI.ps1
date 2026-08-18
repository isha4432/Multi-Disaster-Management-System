Set-Location "$PSScriptRoot"
if (!(Test-Path ".venv")) { python -m venv .venv }
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Write-Host "Train: python training\train_roberta.py"
Write-Host "Serve: uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"
