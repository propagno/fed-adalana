# PowerShell setup script for fed-fale-com-jesus

Write-Host "🚀 Configurando fed-fale-com-jesus..." -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale Node.js 20+" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker não encontrado. Algumas funcionalidades podem não funcionar" -ForegroundColor Yellow
}

# Criar .env.dev se não existir
if (-not (Test-Path ".env.dev")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.dev"
        Write-Host "✅ Arquivo .env.dev criado a partir de .env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.example não encontrado" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Arquivo .env.dev já existe" -ForegroundColor Green
}

# Instalar dependências
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    npm ci
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules já existe" -ForegroundColor Green
}

# Verificar build
Write-Host "🔨 Testando build..." -ForegroundColor Cyan
npm run build:prod
Write-Host "✅ Build bem-sucedido" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Edite .env.dev com suas configurações"
Write-Host "  2. Execute: npm start (para desenvolvimento)"
Write-Host "  3. Execute: docker-compose -f docker-compose.dev.yml up (para Docker)"

