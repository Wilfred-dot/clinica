#!/bin/bash
set -e

echo "🚀 A iniciar o backend..."

# Aguardar o banco ficar pronto
echo "⏳ A aguardar o banco de dados..."
until nc -z db 5432; do
  sleep 1
done
echo "✅ Banco de dados pronto!"

# Configurar o Prisma
echo "📦 A configurar o banco de dados..."
npx prisma generate
npx prisma db push
npx prisma db seed

# Iniciar a aplicação
echo "🚀 A iniciar o servidor..."
exec npm run start:dev
