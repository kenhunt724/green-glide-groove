@echo off
REM One-click shortcut to start the Earth Resonance Hub dev server.
REM Put a shortcut to this file on your desktop, then double-click it.
REM It runs the PowerShell launcher with execution policy bypassed.

powershell -ExecutionPolicy Bypass -File "%~dp0launch-eps.ps1"
