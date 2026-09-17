# ProofPass — Full Setup & Deploy Script
# ========================================
# Run this as Administrator in PowerShell
# Right-click PowerShell → "Run as Administrator" → paste this script
#
# Usage: .\setup-and-deploy.ps1

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ProofPass Full Setup & Deploy Script  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Enable WSL ─────────────────────────────────────────────────────
Write-Host "[1/5] Enabling WSL & Virtual Machine Platform..." -ForegroundColor Yellow
$wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
$vmFeature  = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

if ($wslFeature.State -ne "Enabled") {
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart
    Write-Host "  ✓ WSL feature enabled" -ForegroundColor Green
} else {
    Write-Host "  ✓ WSL already enabled" -ForegroundColor Green
}

if ($vmFeature.State -ne "Enabled") {
    Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
    Write-Host "  ✓ VirtualMachinePlatform enabled" -ForegroundColor Green
} else {
    Write-Host "  ✓ VirtualMachinePlatform already enabled" -ForegroundColor Green
}

# ─── Step 2: Install Ubuntu via winget ──────────────────────────────────────
Write-Host ""
Write-Host "[2/5] Installing Ubuntu (WSL distro)..." -ForegroundColor Yellow
winget install --id Canonical.Ubuntu.2204 --accept-source-agreements --accept-package-agreements --silent 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Ubuntu installed" -ForegroundColor Green
} else {
    Write-Host "  ! Ubuntu install may need restart first — continue after reboot" -ForegroundColor Red
}

# ─── Step 3: Set WSL 2 as default ───────────────────────────────────────────
Write-Host ""
Write-Host "[3/5] Setting WSL version 2 as default..." -ForegroundColor Yellow
wsl --set-default-version 2 2>&1
Write-Host "  ✓ WSL 2 set as default" -ForegroundColor Green

# ─── Step 4: Install Docker Desktop ─────────────────────────────────────────
Write-Host ""
Write-Host "[4/5] Installing Docker Desktop..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "  ✓ Docker already installed: $(docker --version)" -ForegroundColor Green
} else {
    Write-Host "  Downloading Docker Desktop installer..." -ForegroundColor Yellow
    $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
    Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstaller -UseBasicParsing
    Write-Host "  Running Docker Desktop installer (silent)..." -ForegroundColor Yellow
    Start-Process -FilePath $dockerInstaller -ArgumentList "install --quiet" -Wait
    Write-Host "  ✓ Docker Desktop installed" -ForegroundColor Green
}

# ─── Step 5: Create WSL bootstrap script ─────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Creating WSL setup script for Compact compiler + deployment..." -ForegroundColor Yellow

$wslScript = @'
#!/bin/bash
set -e

echo ""
echo "========================================"
echo "  ProofPass WSL Setup: Compact + Deploy "
echo "========================================"
echo ""

# Install Compact compiler
echo "[1/3] Installing Compact compiler..."
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc
echo "Compact version: $(compact --version)"
echo "✓ Compact compiler installed"

# Install Node.js if not present
echo ""
echo "[2/3] Checking Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node version: $(node --version)"
echo "✓ Node.js ready"

# Compile the ProofPass contract
echo ""
echo "[3/3] Compiling ProofPass Compact contract..."
cd /mnt/c/Users/mandi/OneDrive/Desktop/midnight
compact compile contracts/proofpass.compact
echo "✓ Contract compiled successfully"

echo ""
echo "========================================="
echo "  Now starting Deployment...              "
echo "========================================="
echo ""
echo "Make sure Proof Server is running in another terminal:"
echo "  docker run -p 6300:6300 midnightntwrk/proof-server:latest"
echo ""
echo "Press ENTER when Proof Server is running..."
read

# Deploy to Preprod
echo "Deploying to PREPROD..."
cd /mnt/c/Users/mandi/OneDrive/Desktop/midnight/contracts/deploy
npm install --silent
npm run deploy:preprod

echo ""
echo "Deploying to PREVIEW..."
npm run deploy:preview

echo ""
echo "✅ DONE! Copy the contract addresses above and paste them in the chat."
'@

$wslScript | Out-File -FilePath "C:\Users\mandi\OneDrive\Desktop\midnight\setup-wsl.sh" -Encoding utf8 -NoNewline
Write-Host "  ✓ WSL script saved: setup-wsl.sh" -ForegroundColor Green

# ─── Summary ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! RESTART YOUR PC NOW   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After restart, do this:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Open Ubuntu from Start Menu" -ForegroundColor Yellow
Write-Host "     (create a username/password when prompted)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Open Docker Desktop and let it start" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. In Ubuntu terminal, run:" -ForegroundColor Yellow
Write-Host "     bash /mnt/c/Users/mandi/OneDrive/Desktop/midnight/setup-wsl.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. In a SECOND Ubuntu terminal, run:" -ForegroundColor Yellow
Write-Host "     docker run -p 6300:6300 midnightntwrk/proof-server:latest" -ForegroundColor Cyan
Write-Host ""
Write-Host "  5. Paste the contract address here in the chat!" -ForegroundColor Green
Write-Host ""
