@echo off
title retro::blog admin
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js bulunamadi.
  echo   https://nodejs.org adresinden indirip kur, sonra bu dosyayi tekrar calistir.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo.
  echo   Ilk kurulum yapiliyor, lutfen bekle...
  echo.
  call npm install
  if errorlevel 1 (
    echo   npm install basarisiz oldu.
    pause
    exit /b 1
  )
)

start "" http://localhost:3000/admin.html
node server.js

echo.
echo   Sunucu kapandi.
pause
