#!/bin/sh
set -e

# Ensure directory exists for SQLite file-based databases
case "$DATABASE_URL" in
  file:*)
    DB_DIR=$(dirname "$DATABASE_URL" | sed 's|^file:||')
    mkdir -p "$DB_DIR"
    echo "📂 SQLite database directory ensured: $DB_DIR"
    ;;
esac

echo "🔄 Aplicando migrações do banco..."
npx prisma db push --skip-generate

echo "🚀 Iniciando servidor..."
exec node server.js
