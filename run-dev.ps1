# 86 Connect - Development Runner
# Starts both frontend and backend servers

param(
    [switch]$Clean,
    [switch]$Help
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Help {
    Write-Host ""
    Write-Host "86 Connect Development Runner" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\run-dev.ps1           Start both servers"
    Write-Host "  .\run-dev.ps1 -Clean    Clear cache and start"
    Write-Host "  .\run-dev.ps1 -Help     Show this help"
    Write-Host ""
    Write-Host "Servers:" -ForegroundColor Yellow
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Backend:  http://localhost:3001"
    Write-Host ""
}

if ($Help) {
    Show-Help
    exit 0
}

Write-Host ""
Write-Host "Starting 86 Connect Development Servers..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Clean cache if requested
if ($Clean) {
    Write-Host "[1/3] Cleaning caches..." -ForegroundColor Yellow

    $FrontendCache = Join-Path $ProjectRoot "frontend\.next"
    if (Test-Path $FrontendCache) {
        Remove-Item -Recurse -Force $FrontendCache -ErrorAction SilentlyContinue
        Write-Host "  Cleared frontend .next cache" -ForegroundColor Green
    }

    Write-Host "  Cache cleaned" -ForegroundColor Green
    Write-Host ""
}

# Start Backend
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
$BackendPath = Join-Path $ProjectRoot "backend"
$BackendJob = Start-Job -ScriptBlock {
    param($Path)
    Set-Location $Path
    npm run dev
} -ArgumentList $BackendPath
Write-Host "  Backend starting on http://localhost:3001" -ForegroundColor Green

# Start Frontend
Write-Host "[3/3] Starting Frontend Server..." -ForegroundColor Yellow
$FrontendPath = Join-Path $ProjectRoot "frontend"
$FrontendJob = Start-Job -ScriptBlock {
    param($Path)
    Set-Location $Path
    npm run dev
} -ArgumentList $FrontendPath
Write-Host "  Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Servers are starting..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Wait for both jobs
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $BackendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $FrontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $BackendJob, $FrontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "Servers stopped" -ForegroundColor Green
}
