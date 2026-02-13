# ⚡ Quick Start - Deploy Vercel com GitHub OAuth

## 🚀 Em 5 minutos:

### 1️⃣ Prepare o repositório localmente

```bash
git clone https://github.com/seu-usuario/minehosting.git
cd minehosting
npm install
cp .env.example .env
```

### 2️⃣ Crie um GitHub OAuth App
- Acesse: https://github.com/settings/developers
- Clique em **"New OAuth App"**
- Preencha:
  - **Application name**: MineHosting
  - **Homepage URL**: https://minehosting-seven.vercel.app
  - **Authorization callback URL**: https://minehosting-seven.vercel.app/auth/github/callback
- Copie **Client ID** e gere um **Client Secret**

### 3️⃣ Deploy para Vercel

#### Opção A: Via CLI (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

#### Opção B: Via GitHub
1. Vá para https://vercel.com/new
2. Selecione seu repositório
3. Prossiga para o passo 4

### 4️⃣ Configure Variáveis de Ambiente no Vercel

No dashboard Vercel:
- Projeto → **Settings** → **Environment Variables**
- Adicione:

```
GITHUB_CLIENT_ID = <seu Client ID>
GITHUB_CLIENT_SECRET = <seu Client Secret>
GITHUB_PAT = <sua Chave de Acesso Pessoal>
GITHUB_OWNER = seu_usuario
GITHUB_REPO = seu_repo_template
CALLBACK_URL = https://minehosting-seven.vercel.app/auth/github/callback
SESSION_SECRET = gere_uma_chave_aleatoria_complicada
NODE_ENV = production
```

### 5️⃣ Redeploy
```bash
vercel --prod --force
```

### 6️⃣ Teste!
Acesse: **https://minehosting-seven.vercel.app/login.html**

✅ Clique em "Conectar com GitHub" e pronto!

---

## 📚 Documentação Completa
Veja [SETUP_GITHUB_OAUTH_VERCEL.md](SETUP_GITHUB_OAUTH_VERCEL.md) para instruções detalhadas.

## 🆘 Problemas?
- Erro "Invalid redirect_uri"? → Verifique a URL exata no GitHub OAuth App
- Erro "Client ID não configurado"? → Redeploy com `vercel --prod --force`
- Logs de erro? → Dashboard Vercel → Deployments → Logs
