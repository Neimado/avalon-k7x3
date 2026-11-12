@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"

echo === Etape 1 : ajout des nouveaux scores ===
python injection_json.py
if errorlevel 1 goto erreur

echo.
echo === Etape 2 : generation du site ===
python export_web.py
if errorlevel 1 goto erreur

if exist ".git" (
    echo.
    echo === Etape 3 : mise en ligne ===
    git add docs
    git commit -m "Mise a jour %date%"
    git push
    if errorlevel 1 goto erreur
) else (
    echo.
    echo [Info] GitHub n'est pas encore configure : le site est a jour sur ton PC mais pas en ligne.
)

echo.
echo Termine !
pause
exit /b 0

:erreur
echo.
echo *** Une erreur est survenue. Lis le message ci-dessus. ***
pause
exit /b 1
