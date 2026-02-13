# 🔐 Setup de Autenticação GitHub no Vercel

## 🎯 Objetivo
Fazer login com GitHub a partir de `https://minehosting-seven.vercel.app/` sem precisar de um computador local rodando o servidor.

---

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Este repositório espelhado no GitHub
- Node.js 18+ instalado localmente

---

## 🔑 Passo 1: Criar GitHub OAuth App

### 1.1 Acesse as Settings do GitHub
- Vá para: https://github.com/settings/developers
- Clique em **"New OAuth App"** ou **"New GitHub App"**

### 1.2 Preenchaa os dados:

| Campo | Valor |
|-------|-------|
| **Application name** | MineHosting |
| **Homepage URL** | `https://minehosting-seven.vercel.app` |
| **Authorization callback URL** | `https://minehosting-seven.vercel.app/auth/github/callback` |

### 1.3 Copie as credenciais:
- Copie **Client ID**
- Clique em **"Generate a new client secret"** e copie o **Client Secret**

---

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Conecte seu repositório ao Vercel
```bash
# Clone seu repositório
git clone https://github.com/seu-usuario/minehosting.git
cd minehosting

# Instale as dependências
npm install
```

### 2.2 Deploy via Vercel CLI (Recomendado)
```bash
# Instale Vercel CLI globalmente
npm install -g vercel

# Faça deploy
vercel --prod
```

### 2.3 OU Deploy via Web do Vercel
1. Vá para https://vercel.com/new
2. Importe seu repositório do GitHub
3. Configure as variáveis de ambiente (veja próximo passo)
4. Clique em **Deploy**

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente no Vercel

### 3.1 Via Dashboard do Vercel
1. Vá para seu projeto em https://vercel.com/dashboard
2. Clique no seu projeto **minehosting**
3. Vá para **Settings** → **Environment Variables**

### 3.2 Adicione as seguintes variáveis:

```
GITHUB_CLIENT_ID=<copie do GitHub OAuth App>
GITHUB_CLIENT_SECRET=<copie do GitHub OAuth App>
GITHUB_PAT=<seu Personal Access Token>
GITHUB_OWNER=seu_usuario_github
GITHUB_REPO=seu_repo_template
CALLBACK_URL=https://minehosting-seven.vercel.app/auth/github/callback
SESSION_SECRET=gere_uma_chave_aleatoria_complicada_aqui
NODE_ENV=production
```

### 3.3 Clique em **Save**

---

## 📱 Passo 4: Testar o Login

### 4.1 Acesse a página de login:
```
https://minehosting-seven.vercel.app/login.html
```

### 4.2 Clique no botão **"Conectar com GitHub"**

### 4.3 Você será redirecionado para GitHub para autorizar

### 4.4 Após autorizar, voltará para o painel logado!

---

## 🔍 Troubleshooting

### ❌ Erro: "Invalid redirect_uri"
**Solução:** Verifique se a URL em Authorization callback URL no GitHub OAuth App é exatamente: `https://minehosting-seven.vercel.app/auth/github/callback`

### ❌ Erro: "Client ID não configurado"
**Solução:** Verifique se as variáveis de ambiente estão salvas no Vercel. Faça redeploy:
```bash
vercel --prod --force
```

### ❌ Erro: "Sessão expirada"
**Solução:** Limpe cookies do navegador e tente novamente. Ou regenere o `SESSION_SECRET`.

### ❌ Servidor retorna erro 500
**Solução:** Verifique os logs no Vercel:
1. Dashboard → Projeto → **Deployments**
2. Clique no último deployment
3. Vá para **Logs**

---

## 📝 Variáveis de Ambiente Explicadas

```
GITHUB_CLIENT_ID          # ID fornecido pelo GitHub OAuth App
GITHUB_CLIENT_SECRET      # Senha fornecida pelo GitHub OAuth App
GITHUB_PAT                # Personal Access Token (criar em https://github.com/settings/tokens)
GITHUB_OWNER              # Seu username no GitHub
GITHUB_REPO               # Nome do repositório template
CALLBACK_URL              # URL de retorno após autorizar (DEVE estar registrada no GitHub)
SESSION_SECRET            # Chave para criptografar sessões (gere uma aleatória)
NODE_ENV                  # "production" para Vercel
```

---

## 🎯 Próximos Passos

Após o login funcionar:

1. **Criar Codespaces automaticamente**
   - O servidor agora cria repositório e Codespace ao fazer login
   - Configure um webhook para eventos automáticos

2. **Salvar dados do usuário em banco de dados**
   - Descomente as linhas no `server.js` para salvar usuários
   - Configure PostgreSQL, MongoDB ou outro BD

3. **Implementar logout e perfil**
   - Endpoints já existem em `server.js`
   - Complete a UI no frontend

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do Vercel
2. Teste localmente com `.env` local
3. Certifique-se que CALLBACK_URL está exata no GitHub app

🎉 **Pronto! Seu app agora aceita login via GitHub no domínio do Vercel!**
