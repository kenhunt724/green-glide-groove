#Requires -Version 5.1
<#
.SYNOPSIS
    One-click desktop launcher for the Earth Resonance Hub dev server on an HP Omen/WSL2 setup.
.DESCRIPTION
    Prompts once for the project folder, then opens Windows Terminal running the
    WSL/Ubuntu start.sh script, waits for localhost:8080, and opens the site.
.NOTES
    Run via launch-eps.bat, or right-click this file and choose "Run with PowerShell".
#>

$ErrorActionPreference = "Stop"

$configFile = Join-Path $env:USERPROFILE ".eps-project-path.txt"

function Get-ProjectPath {
    if (-not (Test-Path $configFile)) {
        Add-Type -AssemblyName System.Windows.Forms | Out-Null
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = "Select your earthresonancehub project folder"
        $dialog.ShowNewFolderButton = $false
        $result = $dialog.ShowDialog()
        if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
            throw "No folder selected. Exiting."
        }
        $path = $dialog.SelectedPath
        $path | Out-File $configFile -Encoding utf8
        return $path
    }
    return (Get-Content $configFile -Raw).Trim()
}

function ConvertTo-WslPath {
    param([string]$WindowsPath)
    $drive = $WindowsPath.Substring(0, 1).ToLower()
    $rest = $WindowsPath.Substring(2) -replace '\\', '/'
    return "/mnt/$drive$rest"
}

$projectPath = Get-ProjectPath
$wslPath = ConvertTo-WslPath -WindowsPath $projectPath
$scriptDir = "$wslPath/docs/omen-setup"

Write-Host ""
Write-Host "Earth Resonance Hub — local launcher" -ForegroundColor Cyan
Write-Host "  Windows path: $projectPath"
Write-Host "  WSL path:     $wslPath"

$bashCommand = "cd '$scriptDir' && bash start.sh; exec bash"

$wt = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($wt) {
    $wtArgs = @(
        "new-tab",
        "--title", "EPS Dev Server",
        "wsl", "bash", "-c", $bashCommand
    )
    Start-Process -FilePath $wt.Source -ArgumentList $wtArgs -WindowStyle Normal
} else {
    Write-Host "Windows Terminal not found; falling back to wsl.exe directly." -ForegroundColor Yellow
    Start-Process -FilePath "wsl.exe" -ArgumentList "bash", "-c", $bashCommand
}

Write-Host ""
Write-Host "Waiting for http://localhost:8080 ..." -ForegroundColor Yellow

$ready = $false
while (-not $ready) {
    Start-Sleep -Seconds 2
    try {
        Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 3 | Out-Null
        $ready = $true
    } catch {
        Write-Host "  server not ready yet..." -ForegroundColor DarkGray
    }
}

Write-Host "Server is ready. Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:8080"
