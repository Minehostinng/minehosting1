# ⚡ CHECKLIST - Deploy MineHosting no Vercel

## 📋 Antes de Começar

- [ ] Você tem uma conta no GitHub
- [ ] Você tem uma conta no Vercel
- [ ] Node.js 18+ está instalado (`node --version`)
- [ ] Git está instalado (`git --version`)
- [ ] Você fez fork deste repositório

---

## 🔑 PARTE 1: GitHub OAuth App

- [ ] Acesse: https://github.com/settings/developers
- [ ] Clique em "New OAuth App"
- [ ] Preencha:
  - [ ] **Application name**: `MineHosting`
  - [ ] **Homepage URL**: `https://minehosting-seven.vercel.app`
  - [ ] **Authorization callback URL**: `https://minehosting-seven.vercel.app/auth/github/callback`
- [ ] Clique em "Create OAuth App"
- [ ] Copie o **Client ID** para um lugar seguro
- [ ] Clique em "Generate a new client secret"
- [ ] Copie o **Client Secret** para um lugar seguro

**✅ Credenciais GitHub copiadas!**

---

## 🚀 PARTE 2: Prepare o Repositório

```bash
# Clone seu repositório
git clone https://github.com/SEU_USUARIO/minehosting.git
cd minehosting

# Instale dependências
npm install
```

- [ ] Repositório clonado
- [ ] `npm install` completado sem erros
- [ ] Arquivo `vercel.json` existe (`ls vercel.json`)
- [ ] Arquivo `.env.example` existe (`ls .env.example`)

---

## 🌩️ PARTE 3: Deploy no Vercel

### Opção A: Via CLI (Recomendado)

```bash
npm install -g vercel
vercel --prod
```

- [ ] Vercel CLI instalado
- [ ] Login no Vercel feito com GitHub
- [ ] Deploy para produção iniciado
- [ ] URL gerada: `https://minehosting-seven.vercel.app` (ou similar)

### Opção B: Via Dashboard Web

- [ ] Acesse: https://vercel.com/new
- [ ] Conecte seu repositório GitHub
- [ ] Clique em "Import"
- [ ] Deploy iniciado automaticamente

---

## 🔧 PARTE 4: Configurar Variáveis de Ambiente

### Via Dashboard Vercel (RECOMENDADO):

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto (`minehosting-*`)
3. Vá para: **Settings** → **Environment Variables**
4. Adicione cada variável:

| Variável | Valor | Origem |
|----------|-------|--------|
| `GITHUB_CLIENT_ID` | `1a2b3c4d5e...` | GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | `secret123...` | GitHub OAuth App |
| `GITHUB_PAT` | `ghp_xxxxx...` | https://github.com/settings/tokens |
| `GITHUB_OWNER` | `seu_username` | Seu GitHub username |
| `GITHUB_REPO` | `seu_repo_template` | Nome do seu repo |
| `CALLBACK_URL` | `https://minehosting-seven.vercel.app/auth/github/callback` | Exato assim! |
| `SESSION_SECRET` | `gere_uma_string_aleatoria_complicada` | Qualquer coisa segura |
| `NODE_ENV` | `production` | Fixo |

- [ ] `GITHUB_CLIENT_ID` adicionado
- [ ] `GITHUB_CLIENT_SECRET` adicionado
- [ ] `GITHUB_PAT` adicionado
- [ ] `GITHUB_OWNER` adicionado
- [ ] `GITHUB_REPO` adicionado
- [ ] `CALLBACK_URL` adicionado
- [ ] `SESSION_SECRET` adicionado
- [ ] `NODE_ENV` adicionado

### Redeploy após adicionar variáveis:

```bash
vercel --prod --force
```

- [ ] Redeploy iniciado
- [ ] Aguardou compilação completa (~30 segundos)
- [ ] Status: "Deployment successful" ✓

---

## ✅ PARTE 5: Teste o Login

1. Acesse: `https://minehosting-seven.vercel.app/login.html`

- [ ] Página de login carrega
- [ ] Vê o botão "Conectar com GitHub"

2. Clique em "Conectar com GitHub"

- [ ] Redirecionado para GitHub
- [ ] GitHub pede autorização

3. Clique em "Autorizar"

- [ ] Redirecionado de volta para seu site
- [ ] Vê a página de painel (`/painel.html`)
- [ ] Está logado com seu nome do GitHub! ✨

---

## 🎯 Status Final

```
✅ Repo preparado
✅ Deploy no Vercel
✅ Variáveis de Ambiente configuradas
✅ GitHub OAuth funcionando
✅ Login via Browser funcionando
✅ SEM precisar de servidor local rodando
```

**🎉 SUCESSO! Você tem um servidor web rodando no Vercel!**

---

## 📚 Documentação

- **Detalhado**: [SETUP_GITHUB_OAUTH_VERCEL.md](SETUP_GITHUB_OAUTH_VERCEL.md)
- **Passo a Passo Visual**: [PASSO_A_PASSO.md](PASSO_A_PASSO.md)
- **Quick Start**: [VERCEL_QUICKSTART.md](VERCEL_QUICKSTART.md)

---

## 🆘 Se Algo Deu Errado

### "Invalid redirect_uri"
- [ ] Verifique exatamente em: https://github.com/settings/developers
- [ ] URL deve ser: `https://minehosting-seven.vercel.app/auth/github/callback`
- [ ] Sem acrescentar barra final ou espaços

### "Client ID not configured"
- [ ] Verifique se variável foi salva no Vercel
- [ ] Execute redeploy: `vercel --prod --force`
- [ ] Aguarde 30 segundos e teste novamente

### "Connection refused" ou "Cannot reach server"
- [ ] Verifique se deployment foi bem-sucedido
- [ ] Vá para: Vercel Dashboard → Deployments → Logs
- [ ] Procure por erros

---

## 🎓 Próximos Passos (Opcional)

- [ ] Integrar banco de dados (PostgreSQL)
- [ ] Implementar Sistema de Pagamento (Stripe)
- [ ] Adicionar mais páginas no dashboard
- [ ] Configurar domínio customizado
- [ ] Adicionar CI/CD com GitHub Actions

---

## ❓ Dúvidas Frequentes

**P: Como obtenho um Personal Access Token do GitHub?**  
R: https://github.com/settings/tokens → New token → Marque `repo`, `user`, `gist`

**P: Posso usar outro domínio em vez de `.vercel.app`?**  
R: Sim! Adicione domínio em: Vercel Dashboard → Settings → Domains

**P: Como faço para voltar ao login anterior?**  
R: Tudo está armazenado no `localStorage` do navegador. Limpe cookies ou abra em modo anônimo.

**P: Como vejo os logs do servidor?**  
R: Vercel Dashboard → Seu Projeto → Deployments → Clique no deployment → Logs

---

## 🚀 Você está pronto!

```
npm install -g vercel && vercel --prod
```

Depois configure as variáveis e pronto!

**https://minehosting-seven.vercel.app** 🎮
