# 🔐 Referência Rápida - Variáveis de Ambiente & Configuração

## 📋 Arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# ============================================================
# GitHub Configuration
# ============================================================

# Seu Personal Access Token (veja https://github.com/settings/tokens)
# IMPORTANTE: Nunca compartilhe ou commite isso!
GITHUB_PAT=ghp_seu_token_personal_aqui_32_caracteres

# Seu username no GitHub (sem @)
GITHUB_OWNER=seu-username

# Nome do repositório template (sem link, só o nome)
GITHUB_REPO=minehosting-template

# ============================================================
# Server Configuration
# ============================================================

# Porta em que o servidor rodará
PORT=3000

# Ambiente (development | production | staging)
NODE_ENV=development

# ============================================================
# Database Configuration (PostgreSQL)
# ============================================================

# Host do banco de dados
DB_HOST=localhost

# Porta do PostgreSQL (padrão: 5432)
DB_PORT=5432

# Nome do banco de dados
DB_NAME=minehosting

# Usuário do banco de dados
DB_USER=postgres

# Senha do banco de dados
DB_PASSWORD=sua_senha_segura_123

# ============================================================
# Email Configuration (Opcional - para notificações)
# ============================================================

# Provedor SMTP (gmail, sendgrid, etc)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua_senha_de_app

# Email padrão para enviar notificações
FROM_EMAIL=noreply@seu-dominio.com

# ============================================================
# Web Server (Produção)
# ============================================================

# URL base do seu site (sem trailing slash)
API_URL=https://seu-dominio.com

# Origem CORS (domínio do seu site)
CORS_ORIGIN=https://seu-dominio.com

# ============================================================
# GitHub App (Alternativa segura para PAT - Opcional)
# ============================================================

# ID da GitHub App (veja https://github.com/settings/apps)
GITHUB_APP_ID=123456

# Private Key da GitHub App (em base64)
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...

# ============================================================
# Stripe Configuration (Opcional - Para pagamentos)
# ============================================================

# Chave pública do Stripe
STRIPE_PUBLIC_KEY=pk_live_seu_token_aqui

# Chave privada do Stripe (SEGREDO!)
STRIPE_SECRET_KEY=sk_live_seu_token_aqui_321

# ============================================================
# AWS Configuration (Opcional - Se usar AWS Lambda)
# ============================================================

# AWS Access Key ID
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE

# AWS Secret Access Key
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# AWS Region
AWS_REGION=us-east-1

# ============================================================
# Logging & Monitoring (Opcional)
# ============================================================

# Nível de log (debug | info | warn | error)
LOG_LEVEL=info

# Sentry DSN para rastreamento de erros
SENTRY_DSN=https://seu_token@sentry.io/projeto-id

# ============================================================
# Feature Flags
# ============================================================

# Ativar/desativar criação automática de Codespace
ENABLE_AUTO_CODESPACE_CREATION=true

# Ativar/desativar webhook de novo usuário
ENABLE_USER_WEBHOOK=false

# Ativar/desativar rate limiting
ENABLE_RATE_LIMITING=true

# Limite de requisições por minuto (por IP)
RATE_LIMIT_MAX=100
```

---

## 🔄 Variar por Ambiente

### Desenvolvimento (.env)

```bash
NODE_ENV=development
PORT=3000
GITHUB_PAT=seu_pat_development
LOG_LEVEL=debug
ENABLE_AUTO_CODESPACE_CREATION=true
CORS_ORIGIN=http://localhost:3000
```

### Produção (.env.production)

```bash
NODE_ENV=production
PORT=443
GITHUB_PAT=seu_pat_producao_diferente
LOG_LEVEL=info
ENABLE_AUTO_CODESPACE_CREATION=true
CORS_ORIGIN=https://seu-dominio.com
```

### Testes (.env.test)

```bash
NODE_ENV=test
PORT=3001
GITHUB_PAT=seu_pat_test
LOG_LEVEL=error
ENABLE_AUTO_CODESPACE_CREATION=false
```

---

## 📝 Como Criar o Arquivo .env

### Opção 1: Copiar do exemplo

```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

### Opção 2: Criar manualmente

```bash
# Linux/Mac
cat > .env << EOF
GITHUB_PAT=seu_token_aqui
GITHUB_OWNER=seu-username
GITHUB_REPO=minehosting-template
PORT=3000
NODE_ENV=development
EOF

# Windows (PowerShell)
@"
GITHUB_PAT=seu_token_aqui
GITHUB_OWNER=seu-username
GITHUB_REPO=minehosting-template
PORT=3000
NODE_ENV=development
"@ | Out-File .env
```

---

## ✅ Checklist de Configuração

Antes de iniciar o servidor, verifique:

- [ ] `.env` foi criado na raiz do projeto
- [ ] `GITHUB_PAT` foi preenchido (gere em https://github.com/settings/tokens)
- [ ] `GITHUB_OWNER` e `GITHUB_REPO` estão corretos
- [ ] `PORT` não está em uso por outro aplicativo
- [ ] Se usar banco de dados: `DB_*` estão corretos
- [ ] `.env` **NÃO** foi adicionado ao git (verificar `.gitignore`)

```bash
# Verificar se .env está ignorado
cat .gitignore | grep ".env"
# Deve retornar: .env
```

---

## 🔍 Validar Configuração

Após criar `.env`, teste se está correto:

### Teste 1: Carregar variáveis

```bash
# Linux/Mac
source .env
echo $GITHUB_PAT
echo $GITHUB_OWNER
echo $GITHUB_REPO

# Windows (PowerShell)
Get-Content .env | Select-String "GITHUB"
```

### Teste 2: Node.js

```bash
node -e "require('dotenv').config(); console.log({
  pat: process.env.GITHUB_PAT?.substring(0, 10) + '...',
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO
})"
```

### Teste 3: GitHub PAT válido

```bash
# Testar se o token é válido
curl -H "Authorization: token $GITHUB_PAT" \
  https://api.github.com/user

# Se funciona, retorna dados do seu usuário
# Se erro 401, token inválido ou expirado
```

---

## 🚨 Erros Comuns

### Erro: "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### Erro: "GITHUB_PAT is not defined"

```bash
# Verifique se .env existe
ls -la .env

# Verifique se tem conteúdo
cat .env

# Reinicie o servidor
npm run dev
```

### Erro: "Invalid token"

```bash
# Regenere o PAT em https://github.com/settings/tokens/new
# Escopos: repo + codespace
# Copie para .env
```

---

## 🔐 Boas Práticas

### ✅ Faça

```bash
# ✅ Usar .env para desenvolvimento
GITHUB_PAT=ghp_xxxx

# ✅ Usar variáveis de ambiente em produção
export GITHUB_PAT=ghp_xxxx
npm start

# ✅ Usar .env.example como template
git add .env.example

# ✅ Ignorar .env
echo ".env" >> .gitignore
```

### ❌ NÃO Faça

```bash
# ❌ Colocar no código fonte
const PAT = "ghp_xxxx";

# ❌ Commitar .env
git add .env
git push

# ❌ Compartilhar token por Slack/Email
# PAT é senha! Trate como tal.

# ❌ Usar mesmo PAT em dev e produção
# Criar tokens diferentes para cada ambiente
```

---

## 🌍 Variáveis de Ambiente em Produção

### Railway.app

```bash
# No painel do Railway:
# Dashboard > Project > Variables
# Adicione cada variável individualmente

GITHUB_PAT = ghp_seu_token
GITHUB_OWNER = seu-username
GITHUB_REPO = seu-repo
NODE_ENV = production
```

### Heroku

```bash
heroku config:set GITHUB_PAT=ghp_seu_token
heroku config:set GITHUB_OWNER=seu-username
heroku config:set GITHUB_REPO=seu-repo
heroku config:set NODE_ENV=production

# Verificar
heroku config
```

### DigitalOcean App Platform

```bash
# App > Settings > Build & Deploy > Environment
GITHUB_PAT=ghp_seu_token
GITHUB_OWNER=seu-username
GITHUB_REPO=seu-repo
NODE_ENV=production
```

### AWS Lambda

```bash
# AWS Console > Lambda > Functions > seu-app
# Configuration > Environment variables

GITHUB_PAT = ghp_seu_token
GITHUB_OWNER = seu-username
GITHUB_REPO = seu-repo
```

---

## 📊 Referência de Valores

### Machine Types (GITHUB_{MACHINE})

```
standardLinux2Core    = 2 vCPU, 8GB RAM    (~$50/mês)
standardLinux4Core    = 4 vCPU, 16GB RAM   (~$100/mês)
standardLinux8Core    = 8 vCPU, 32GB RAM   (~$200/mês)
standardLinux16Core   = 16 vCPU, 64GB RAM  (~$400/mês)
standardLinux32Core   = 32 vCPU, 64GB RAM  (~$600/mês)
```

### Regiões (GITHUB_LOCATION)

```
AustraliaEast
EastUS
EastUS2       ← Recomendado para América do Sul
WestUS
WestUS2       ← Também boa opção
```

### Node.js Environments

```
development   = logs detalhados, sem cache
production    = otimizado, cache ativo
staging       = produção simulada
test          = desabilitado certas features
```

---

## 🔗 Recursos Relacionados

- [Como gerar GitHub PAT](GUIA_COMPLETO.md#gerar-um-pat)
- [Variáveis de Produção](CHECKLIST_IMPLEMENTACAO.md#fase-5-deploy)
- [Segurança](GUIA_COMPLETO.md#boas-práticas-de-segurança)

---

**Última atualização:** 2026-02-06
