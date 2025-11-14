#!/bin/bash

set -e

echo "🚀 Configurando fed-fale-com-jesus..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 20+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js versão 20+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker não encontrado. Algumas funcionalidades podem não funcionar"
else
    echo "✅ Docker $(docker --version) encontrado"
fi

# Criar .env.dev se não existir
if [ ! -f .env.dev ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.dev
        echo "✅ Arquivo .env.dev criado a partir de .env.example"
    else
        echo "⚠️  .env.example não encontrado"
    fi
else
    echo "✅ Arquivo .env.dev já existe"
fi

# Instalar dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm ci
    echo "✅ Dependências instaladas"
else
    echo "✅ node_modules já existe"
fi

# Verificar build
echo "🔨 Testando build..."
npm run build:prod
echo "✅ Build bem-sucedido"

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Edite .env.dev com suas configurações"
echo "  2. Execute: npm start (para desenvolvimento)"
echo "  3. Execute: docker-compose -f docker-compose.dev.yml up (para Docker)"

