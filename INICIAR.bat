@echo off
cd /d "%~dp0"
echo ============================================
echo   WANDERSQUAD - INICIAR PROYECTO
 echo ============================================
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: No se encontro Node.js. Instala Node.js LTS y vuelve a intentarlo.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias del proyecto...
  call npm install
  if errorlevel 1 (
    echo ERROR al instalar dependencias.
    pause
    exit /b 1
  )
)
echo Iniciando servidor... Cuando aparezca la direccion, abre http://localhost:3000
call npm start
pause
