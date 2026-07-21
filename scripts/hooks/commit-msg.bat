@echo off

setlocal enabledelayedexpansion

set COMMIT_MSG_FILE=%1
set COMMIT_MSG=
for /f "delims=" %%a in ('type "%COMMIT_MSG_FILE%"') do (
    set COMMIT_MSG=!COMMIT_MSG!%%a
)

echo %COMMIT_MSG% | findstr /r "[^\x00-\x7F]" >nul
if %errorlevel% equ 0 (
    echo.
    echo ERROR: Commit message must be in English only!
    echo.
    echo Commit message detected:
    echo %COMMIT_MSG%
    echo.
    echo Please rewrite your commit message using only English characters.
    echo Example: feat: add user authentication module
    echo.
    exit /b 1
)

exit /b 0