#!/bin/sh
set -e

echo "Entrypoint script started." # Добавим для отладки

# Проверяем и копируем .env для бэкенда
if [ -f /etc/secrets/.backend.env ]; then
  cp /etc/secrets/.backend.env /app/backend/.env
  echo "Copied /etc/secrets/.backend.env to /app/backend/.env"
  ls -la /app/backend/ # Проверим содержимое
else
  echo "Error: /etc/secrets/.backend.env not found at runtime."
fi

# Проверяем и копируем .env для фронтенда (если он нужен бэкенду или для статики)
if [ -f /etc/secrets/.frontend.env ]; then
  cp /etc/secrets/.frontend.env /app/frontend/.env
  echo "Copied /etc/secrets/.frontend.env to /app/frontend/.env"
  ls -la /app/frontend/ # Проверим содержимое
else
  echo "Warning: /etc/secrets/.frontend.env not found at runtime."
fi

echo "Listing /etc/secrets/ directory:"
ls -la /etc/secrets/ # Посмотрим, что там есть во время выполнения

echo "Running database preprocessing scripts (if needed)..."
node ./backend/dist/backend/src/scripts/presetDB.js
node ./backend/dist/backend/src/scripts/importParonyms.js

echo "Database preprocessing finished."
echo "Starting application..."
exec node ./backend/dist/backend/src/index.js