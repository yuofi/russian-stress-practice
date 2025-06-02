#!/bin/sh
# Выходить немедленно, если команда завершается с ненулевым статусом
set -e

echo "Running database preprocessing scripts (if needed)..."

# Запускаем скомпилированные скрипты.
# Они должны быть идемпотентными или проверять, нужно ли им выполняться.
node ./backend/dist/backend/src/scripts/presetDB.js
node ./backend/dist/backend/src/scripts/importParonyms.js

echo "Database preprocessing finished."
echo "Starting application..."

# Запускаем основное приложение (команда из вашего текущего CMD Dockerfile)
exec node ./backend/dist/backend/src/index.js