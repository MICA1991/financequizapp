# Start Backend Server
Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Green
Set-Location ".\backend"
$env:PORT=5000
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Set-Location ".\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "Both servers should now be running!" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000 or http://localhost:5173" -ForegroundColor Cyan 