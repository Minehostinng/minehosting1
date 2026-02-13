# 🎯 GUIA RÁPIDO - 3 PASSOS PARA LOGIN GITHUB NO VERCEL

## O que você vai conseguir:
- ✅ Login GitHub funcionando no seu domínio
- ✅ Sem precisar rodar servidor local
- ✅ URL: `https://minehosting-seven.vercel.app`
- ✅ Criação automática de Codespaces

---

## 🚀 PASSO 1: Crie um GitHub OAuth App (5 min)

### 1. Acesse
```
https://github.com/settings/developers
```

### 2. Clique em "New OAuth App"

### 3. Preencha com:
```
Application name: MineHosting
Homepage URL: https://minehosting-seven.vercel.app
Authorization callback URL: https://minehosting-seven.vercel.app/auth/github/callback
```

### 4. Copie e guarde:
- Client ID
- Client Secret

---

## 🌩️ PASSO 2: Deploy no Vercel (5 min)

```bash
# Clone o repo
git clone https://github.com/seu-usuario/minehosting.git
cd minehosting

# Instale dependências
npm install

# Faça deploy
npm install -g vercel
vercel --prod
```

Copie a URL que aparecer (ex: `https://minehosting-seven.vercel.app`)

---

## 🔧 PASSO 3: Configure Variáveis de Ambiente (5 min)

No Dashboard do Vercel:
1. Vá para seu projeto
2. **Settings** → **Environment Variables**
3. Adicione todas essas variáveis:

```
GITHUB_CLIENT_ID = (do GitHub OAuth App)
GITHUB_CLIENT_SECRET = (do GitHub OAuth App)
GITHUB_PAT = (crie em https://github.com/settings/tokens)
GITHUB_OWNER = seu_username_github
GITHUB_REPO = seu_repo_template
CALLBACK_URL = https://minehosting-seven.vercel.app/auth/github/callback
SESSION_SECRET = gere_uma_string_aleatoria_complicada
NODE_ENV = production
```

### Depois execute:
```bash
vercel --prod --force
```

---

## ✅ PRONTO! Teste:

1. Acesse: `https://minehosting-seven.vercel.app/login.html`
2. Clique em **"Conectar com GitHub"**
3. Autorize
4. **Parabéns! Você está logado!** 🎉

---

## 📚 Documentação Completa

- **Muito Detalhado**: `docs/SETUP_GITHUB_OAUTH_VERCEL.md`
- **Passo a Passo Visual**: `docs/PASSO_A_PASSO.md`
- **Com Screenshots em Texto**: `docs/CHECKLIST.md`
- **Quick Start**: `docs/VERCEL_QUICKSTART.md`

---

## 🆘 Problemas?

### "Invalid redirect_uri"
→ A URL no GitHub app deve ser EXATAMENTE:
```
https://minehosting-seven.vercel.app/auth/github/callback
```

### "Client ID not configured"  
→ Execute: `vercel --prod --force`

### "Can't connect"  
→ Verifique os logs: Vercel Dashboard → Deployments → Logs

---

## 🎮 Agora você tem:

- Servidor rodando no Vercel (24/7)
- Login GitHub funcionando
- Sem computador local precisando rodar nada
- Pronto para Codespaces automáticos

**Tudo configurado! Bom uso! 🚀**
