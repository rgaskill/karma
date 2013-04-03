@echo off

if not exist ".git" (
  echo Run the init script from the root of the project. e.g.
  echo   $ scripts/init-dev-env.bat
) else (
  node scripts/init-dev-env.js
)
