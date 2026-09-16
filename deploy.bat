@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo   Coloro: Build, Sync to Hostinger & Git Deployment
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
:: Step 2: Copy dist contents to Hostinger Deployment Folder
:: -----------------------------------------------------------
set "TARGET_DIR=D:\Hostiger_Deployment\Coloro"
echo.
echo [2/3] Copying dist/ files to %TARGET_DIR%...

if not exist "%TARGET_DIR%" (
    echo Creating target directory: %TARGET_DIR%
    mkdir "%TARGET_DIR%"
)

:: Copy all files, subdirectories, hidden files, overwrite without prompt
xcopy "dist\*" "%TARGET_DIR%\" /E /I /H /Y /Q
if %errorlevel% neq 0 (
    echo [WARN] Xcopy returned code %errorlevel%. Retrying with Robocopy...
    robocopy "dist" "%TARGET_DIR%" /E /IS /IT /NP /NFL /NDL /NJH /NJS
)
echo [OK] All dist files copied to %TARGET_DIR%.

:: -----------------------------------------------------------
:: Step 3: Git Add, Commit & Push in Workspace
:: -----------------------------------------------------------
echo.
echo [3/3] Performing Git Add, Commit and Push for Coloro...
git add .

set "DEFAULT_MSG=Deploy: Update production build and Pinterest pins (%date% %time%)"
echo Committing changes...
git commit -m "%DEFAULT_MSG%"

echo Pushing changes to remote repository...
git push
if %errorlevel% neq 0 (
    echo [WARN] Standard git push returned code %errorlevel%. Retrying with origin main...
    git push origin main
)

:: If the Hostinger target folder is also a Git repo, push from there too
if exist "%TARGET_DIR%\.git" (
    echo.
    echo Found Git repository in %TARGET_DIR%. Committing and pushing deployment repo...
    pushd "%TARGET_DIR%"
    git add .
    git commit -m "Hostinger Deploy: Build %date% %time%"
    git push
    popd
)

echo.
echo =========================================================
echo   [SUCCESS] Build, Sync & Git Push Completed Successfully!
echo =========================================================
pause
