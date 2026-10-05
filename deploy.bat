@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo   Coloro: Production Build & SSH Direct Server Deploy
echo   Target: u511521801@46.17.175.114 (Port: 65002)
echo =========================================================

:: Ensure execution from script directory
cd /d "%~dp0"

:: -----------------------------------------------------------
:: Step 1: Production Build
:: -----------------------------------------------------------
echo.
echo [1/3] Building production bundle (vite build)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Vite build failed with exit code %errorlevel%.
    echo Aborting deployment.
    pause
    exit /b %errorlevel%
)
echo [OK] Build completed successfully.

:: -----------------------------------------------------------
:: Step 2: Sync to Local Hostinger Deployment Folder
:: -----------------------------------------------------------
set "LOCAL_DEPLOY_DIR=D:\Hostiger_Deployment\Coloro"
echo.
echo [2/3] Copying dist/ (including .env and .htaccess) to %LOCAL_DEPLOY_DIR%...

if not exist "%LOCAL_DEPLOY_DIR%" (
    echo Creating local directory: %LOCAL_DEPLOY_DIR%
    mkdir "%LOCAL_DEPLOY_DIR%"
)

:: Copy all files, subdirectories, and hidden files (like .env and .htaccess)
xcopy "dist\*" "%LOCAL_DEPLOY_DIR%\" /E /I /H /Y /Q
if %errorlevel% neq 0 (
    echo [WARN] Xcopy returned code %errorlevel%. Retrying with Robocopy...
    robocopy "dist" "%LOCAL_DEPLOY_DIR%" /E /IS /IT /NP /NFL /NDL /NJH /NJS
)

:: Explicitly verify and copy api\.env to local folder
if exist "public\api\.env" (
    if not exist "%LOCAL_DEPLOY_DIR%\api" mkdir "%LOCAL_DEPLOY_DIR%\api"
    copy /Y "public\api\.env" "%LOCAL_DEPLOY_DIR%\api\.env" >nul
)

echo [OK] Local copy completed with all secret .env files.

:: -----------------------------------------------------------
:: Step 3: Direct SSH / SCP Transfer to Live Hostinger Server
:: -----------------------------------------------------------
set "SSH_USER=u511521801"
set "SSH_HOST=46.17.175.114"
set "SSH_PORT=65002"
set "REMOTE_PATH=/home/u511521801/domains/coloro.in/public_html"

echo.
echo [3/3] Uploading all files to live server via SSH/SCP...
echo Destination: %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/ (Port: %SSH_PORT%)
echo.

:: 1. Upload all dist files and directories to Hostinger public_html
scp -P %SSH_PORT% -r dist/* %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/
if %errorlevel% neq 0 (
    echo [WARN] SCP root upload encountered a warning. Retrying sub-transfers...
)

:: 2. Upload root .htaccess (important for SPA routing)
if exist "dist\.htaccess" (
    echo Uploading .htaccess...
    scp -P %SSH_PORT% dist\.htaccess %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/.htaccess
)

:: 3. Upload sensitive .env and api configuration files
if exist "public\api\.env" (
    echo Uploading public/api/.env...
    scp -P %SSH_PORT% public\api\.env %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/api/.env
)

if exist "public\api\.htaccess" (
    echo Uploading public/api/.htaccess...
    scp -P %SSH_PORT% public\api\.htaccess %SSH_USER%@%SSH_HOST%:%REMOTE_PATH%/api/.htaccess
)

echo.
echo =========================================================
echo   [SUCCESS] Build and Live SSH Deployment Completed!
echo   Website is live at: https://coloro.in
echo =========================================================
pause
