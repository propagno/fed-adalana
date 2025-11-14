# 🎨 fed-fale-com-jesus

Frontend base desenvolvido com Angular 17+, TypeScript e integrado com as pipelines de infraestrutura.

## 📋 Tecnologias

- **Angular 17+** (Standalone Components, Signals)
- **TypeScript 5.4+**
- **Node.js 20+**
- **Docker** & **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Karma/Jasmine** (Testes)
- **ESLint** (Linting)

## 🚀 Quick Start

### Setup Automatizado (Recomendado)

```bash
# Execute o script de setup
./scripts/setup.sh        # Linux/Mac
.\scripts\setup.ps1       # Windows
```

O script irá:
- ✅ Verificar pré-requisitos (Node.js, npm, Docker)
- ✅ Criar arquivo .env.dev
- ✅ Instalar dependências
- ✅ Fazer build do projeto

### Setup Manual

1. **Clone e configure:**
```bash
git clone git@github.com:propagno/fed-fale-com-jesus.git
cd fed-fale-com-jesus
cp .env.example .env.dev
# Edite .env.dev com suas configurações
```

2. **Instale dependências:**
```bash
npm ci
```

3. **Execute a aplicação:**

**Opção A: Desenvolvimento local**
```bash
npm start
# Acesse: http://localhost:4200
```

**Opção B: Docker Compose**
```bash
docker-compose -f docker-compose.dev.yml up -d
# Acesse: http://localhost:4200
```

## 🏗️ Estrutura do Projeto

```
fed-fale-com-jesus/
├── src/
│   ├── app/
│   │   ├── features/          # Features da aplicação
│   │   │   └── home/          # Componente Home
│   │   ├── app.component.ts   # Componente raiz
│   │   └── app.routes.ts      # Rotas da aplicação
│   ├── assets/                # Arquivos estáticos
│   ├── styles.css             # Estilos globais
│   ├── index.html             # HTML principal
│   └── main.ts                # Bootstrap da aplicação
├── docker/                     # Dockerfiles e configurações
├── scripts/                    # Scripts de setup
├── .github/workflows/          # GitHub Actions
└── README.md
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo CI (headless)
npm run test:ci

# Ver cobertura de testes
# Após executar testes, abra: coverage/index.html
```

**Cobertura mínima:** 70% (linhas, branches, functions)

## 🔄 CI/CD

### Workflows Disponíveis

- **PR Check:** Validação em Pull Requests
  - Lint
  - Testes
  - Build
  - Validação de coverage (>= 70%)
  - Validação de secrets

- **CI/CD Development:** Deploy automático em `develop`
- **CI/CD Staging:** Deploy em `staging` ou `release/*`
- **CI/CD Production:** Deploy em `main`

### Validações Automáticas

- ✅ ESLint para qualidade de código
- ✅ Testes unitários com Karma/Jasmine
- ✅ Validação de coverage de testes (>= 70%)
- ✅ Validação de secrets em PRs
- ✅ Build de produção

## 📝 Desenvolvimento

### Convenção de Commits

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
refactor: refatora código
test: adiciona testes
chore: manutenção
style: formatação
```

### Checklist Antes de PR

- [ ] Testes passam (`npm test`)
- [ ] Cobertura de testes >= 70%
- [ ] Lint passa (`npm run lint`)
- [ ] Build funciona (`npm run build:prod`)
- [ ] Docker build funciona
- [ ] Nenhum arquivo `.env` no commit
- [ ] Mensagem de commit segue a convenção
- [ ] Documentação atualizada (se necessário)

## 🐛 Troubleshooting

### Erro: "Port 4200 already in use"

```bash
# Altere a porta no package.json ou use outra porta
npm start -- --port 4201
```

### Erro: "Cannot find module"

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm ci
```

### Erro: "Docker build fails"

```bash
# Verifique se o Docker está rodando
docker ps

# Limpe o cache do Docker
docker system prune -a
```

## 🔒 Segurança

- ✅ ESLint configurado
- ✅ Validação de secrets em PRs
- ✅ TypeScript strict mode
- ✅ Nenhum secret hardcoded
- ✅ Headers de segurança no nginx

## 📚 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Desenvolva seguindo os padrões do projeto
4. Escreva testes (cobertura >= 70%)
5. Commit: `git commit -m "feat: adiciona funcionalidade X"`
6. Push: `git push origin feature/minha-feature`
7. Abra um Pull Request

**O que NÃO fazer:**
- ❌ Commitar secrets ou senhas
- ❌ Commitar arquivos .env
- ❌ Quebrar testes existentes
- ❌ Ignorar feedback de code review
- ❌ Criar PRs muito grandes (divida em PRs menores)

## 🎯 Próximos Passos

1. Execute o setup: `./scripts/setup.sh`
2. Desenvolva suas features
3. Siga o checklist antes de criar PR
4. Crie seu PR!

---

**Desenvolvido com ❤️ usando as pipelines de infraestrutura Propagno** 🚀

