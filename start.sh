#!/bin/sh
set -e

echo "🔄 Aplicando migrações do banco..."
npx prisma db push --skip-generate

echo "🚀 Iniciando servidor..."
exec node server.js
