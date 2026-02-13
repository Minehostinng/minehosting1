# 🎯 PASSO A PASSO - Login GitHub no Vercel

## ⏱️ Tempo Total: ~15 minutos

---

## 📋 Pré-requisitos Checklist

- [ ] Conta GitHub criada
- [ ] Conta Vercel criada (ou login com GitHub)
- [ ] Este repositório clonado/forked no seu GitHub
- [ ] Node.js 18+ instalado
- [ ] Git instalado

---

## PARTE 1️⃣: Criar GitHub OAuth App

### Passo 1: Acesse GitHub Developer Settings

```
URL: https://github.com/settings/developers
```

Clique em **"OAuth Apps"** ou **"New OAuth App"**

### Passo 2: Preencha o Formulário

```
┌─────────────────────────────────────────────────────────────┐
│ Application name                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MineHosting                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Homepage URL                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://minehosting-seven.vercel.app                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Application description                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Minecraft Server Hosting with GitHub Codespaces        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Authorization callback URL                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ https://minehosting-seven.vercel.app/auth/github/callbk│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

⚠️ CRÍTICO: A URL deve ser EXATAMENTE:
   https://minehosting-seven.vercel.app/auth/github/callback
```

### Passo 3: Copie as Credenciais

Após criar, você verá:

```
┌──────────────────────────────────────────┐
│ Client ID                                │
│ ┌──────────────────────────────────────┐ │
│ │ 1a2b3c4d5e6f7g8h9i0j                 │ │ ← COPIE!
│ └──────────────────────────────────────┘ │
│ [Copy to clipboard]                      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Client Secret                            │
│ [Generate a new client secret]           │
│ ┌──────────────────────────────────────┐ │
│ │ ●●●●●●●●●●●●●●●●●●●●●               │ │
│ └──────────────────────────────────────┘ │
│ [Copy to clipboard]                      │
└──────────────────────────────────────────┘
```

**Copie e guarde em um lugar seguro!**

---

## PARTE 2️⃣: Deploy para Vercel

### Passo 1: Prepare seu Repositório Localmente

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/minehosting.git
cd minehosting

# Instale dependências
npm install

# Verifique se vercel.json existe
ls vercel.json
# Saída: vercel.json ✓

# Verifique se .env.example existe
ls .env.example
# Saída: .env.example ✓
```

### Passo 2: Escolha Deploy via CLI ou Web

#### ✅ OPÇÃO A: Deploy via CLI (RECOMENDADA)

```bash
# Instale Vercel CLI
npm install -g vercel

# Faça login
vercel login
# Siga as instruções... (autentique com GitHub)

# Deploy para produção
vercel --prod
```

**Saída esperada:**
```
✓ Linked to seu-usuario/minehosting (created .vercel)
✓ Built in 5s
✓ Deployed to minehosting-seven.vercel.app
```

#### ✅ OPÇÃO B: Deploy via Web

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório
4. Clique em **"Import"**
5. Vercel detectará automaticamente `vercel.json`
6. Próximo passo: Variáveis de Ambiente

### Passo 3: Configure Variáveis de Ambiente

**VIA CLI (após deploy):**
```bash
vercel env add GITHUB_CLIENT_ID
# Cole: 1a2b3c4d5e6f7g8h9i0j

vercel env add GITHUB_CLIENT_SECRET
# Cole: seu_secret_aqui

vercel env add CALLBACK_URL
# Cole: https://minehosting-seven.vercel.app/auth/github/callback

vercel env add SESSION_SECRET
# Cole: gere_uma_string_aleatoria_complicada

vercel env add GITHUB_OWNER
# Cole: seu_username_github

vercel env add GITHUB_REPO
# Cole: seu_repo_template

vercel env add GITHUB_PAT
# Cole: seu_personal_access_token

# Redeploy com novas variáveis
vercel --prod --force
```

**VIA DASHBOARD VERCEL (recomendado):**

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto **minehosting-seven**
3. Vá para **Settings**

```
┌─ Settings ─┐ ← Clique aqui

Settings
├─ General
├─ Environment Variables     ← Clique aqui!
├─ Domains
└─ ...
```

### Passo 4: Adicione Variáveis Uma a Uma

```
┌────────────────────────────────────────────────────────┐
│ Environment Variables                                  │
├────────────────────────────────────────────────────────┤
│ [+ Add new...]                                         │
└────────────────────────────────────────────────────────┘
```

Clique em **"Add new..."** e preencha:

**Variável 1:**
```
Key:   GITHUB_CLIENT_ID
Value: 1a2b3c4d5e6f7g8h9i0j
(do GitHub OAuth App)
```

**Variável 2:**
```
Key:   GITHUB_CLIENT_SECRET
Value: seu_client_secret_aqui
(do GitHub OAuth App)
```

**Variável 3:**
```
Key:   CALLBACK_URL
Value: https://minehosting-seven.vercel.app/auth/github/callback
(EXATAMENTE assim!)
```

**Variável 4:**
```
Key:   SESSION_SECRET
Value: gere_string_aleatoria_super_complicada_aqui
(Qualquer coisa complicada)
```

**Variável 5:**
```
Key:   GITHUB_OWNER
Value: seu_username_github
(Seu username no GitHub)
```

**Variável 6:**
```
Key:   GITHUB_PAT
Value: seu_personal_access_token
(Crie em: https://github.com/settings/tokens)
Permissões: repo, user, gist
```

**Variável 7:**
```
Key:   GITHUB_REPO
Value: seu_repo_template
(Nome do repo principal no seu GitHub)
```

**Variável 8:**
```
Key:   NODE_ENV
Value: production
```

### Passo 5: Redeploy

```bash
# Após adicionar variáveis, redeploy
vercel --prod --force
```

Aguarde a compilação...

```
✓ Built in 8s
✓ Deployed to minehosting-seven.vercel.app
✓ Ready with env variables configured
```

---

## PARTE 3️⃣: Testar o Login

### Passo 1: Acesse a página de login

```
URL: https://minehosting-seven.vercel.app/login.html
```

### Passo 2: Clique no botão GitHub

```
┌──────────────────────────────────────┐
│                                      │
│      🎮 MineHosting - Login         │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📧 Entre com Email             │ │
│  │ ____________________________    │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 🐙 Conectar com GitHub         │ │ ← CLIQUE AQUI!
│  └────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

### Passo 3: Autorize no GitHub

Você será redirecionado para:

```
┌────────────────────────────────────────────────────────┐
│ github.com/login/oauth/authorize                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│ MineHosting quer acessar:                             │
│ • Ler seu perfil público                              │
│ • Acessar seu email                                   │
│ • Acessar seus repositórios                           │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ✓ Autorizar MineHosting                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Clique em **"Autorizar"**

### Passo 4: Sucesso! 🎉

Você será redirecionado de volta com:

```
https://minehosting-seven.vercel.app/painel.html?success=true
```

E verá:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ✓ Bem-vindo, seu_nome!                            │
│                                                      │
│  Seus Servidores:                                   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Servidor MineHosting Pro                     │   │
│  │ Status: 🟢 Online                            │   │
│  │ RAM: 16GB | CPU: 4 Cores                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Conectar Console] [Parar] [Deletar]               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🆘 ERROS COMUNS E SOLUÇÕES

### ❌ Erro: "Invalid redirect_uri"

```
403 - Bad Request
error=redirect_uri_mismatch
```

**Causa:** A URL de callback não bate

**Solução:**
1. Vá para: https://github.com/settings/developers
2. Clique no seu OAuth App
3. Verifique "Authorization callback URL"
4. Deve ser EXATAMENTE:
   ```
   https://minehosting-seven.vercel.app/auth/github/callback
   ```
5. Se não for, edite e salve
6. Redeploy: `vercel --prod --force`

---

### ❌ Erro: "Client ID not configured"

```
500 - Internal Server Error
error: 'GITHUB_CLIENT_ID not configured on server'
```

**Causa:** Variável de ambiente não está definida

**Solução:**
1. Dashboard Vercel → Seu projeto
2. Settings → Environment Variables
3. Verifique se `GITHUB_CLIENT_ID` está lá
4. Se não, adicione
5. Faça redeploy: `vercel --prod --force`
6. Aguarde 30 segundos e teste novamente

---

### ❌ Erro: "Session Secret issue"

```
500 - Cannot serialize user
```

**Causa:** `SESSION_SECRET` não configurado

**Solução:**
1. Vá para: Dashboard Vercel → Environment Variables
2. Adicione: `SESSION_SECRET=gere_uma_string_aleatoria_longa`
3. Redeploy
4. Teste novamente

---

### ❌ Erro: "CORS / Connection refused"

```
Failed to fetch: Cross-Origin or localhost refused
```

**Causa:** Frontend tenta acessar API de domínio diferente

**Solução:** Já está resolvido no projeto! Se não funcionar:
1. Verifique `vercel.json`
2. Verifique rewrites para `/auth/` e `/api/`
3. Redeploy com força: `vercel --prod --force`

---

## ✅ CHECKLIST FINAL

Antes de declarar sucesso, verifique:

```
✓ GitHub OAuth App criado
✓ URLs registradas corretamente no GitHub
✓ Repositório forkado/clonado
✓ npm install rodou sem erros
✓ vercel.json existe na raiz
✓ .env.example existe
✓ Deploy no Vercel completou
✓ Todas as 8 variáveis foram definidas
✓ Redeploy com --force foi feito
✓ Aguardou 30 segundos
✓ Acessou https://minehosting-seven.vercel.app/login.html
✓ Clicou em "Conectar com GitHub"
✓ Autorizou no GitHub
✓ Retornou para painel.html logado ✨
```

---

## 🎉 SUCESSO!

Você agora tem:
- ✅ Login GitHub funcionando
- ✅ Servidor rodando no Vercel (sem computador local)
- ✅ Domín
io https://minehosting-seven.vercel.app/
- ✅ Pronto para adicionar banco de dados e pagamentos

**Próximos passos:**
1. Integrar PostgreSQL/MongoDB
2. Implementar webhook de Codespace
3. Adicionar sistema de pagamentos
4. Customizar dashboard

---

## 📞 Ainda tem dúvidas?

1. Verifique os logs do Vercel: Dashboard → Deployments → Logs
2. Leia: [SETUP_GITHUB_OAUTH_VERCEL.md](SETUP_GITHUB_OAUTH_VERCEL.md)
3. Teste localmente primeiro: `npm start` e http://localhost:3000

**Boa sorte! 🚀**
