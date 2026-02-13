# 🚀 Deploy no Vercel (ou outro domínio)

## 📋 Passo 1: Configurar Vercel

### 1.1 Conectar Repositório
1. Acesse: https://vercel.com
2. Clique em **"Add New"** → **"Project"**
3. Selecione seu repositório do GitHub
4. Clique em **"Import"**

### 1.2 Configurar Variáveis de Ambiente
Na página de configuração do Vercel, adicione:

```env
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
SESSION_SECRET=seu_secret_muito_seguro
CALLBACK_URL=https://seu-projeto.vercel.app/auth/github/callback
NODE_ENV=production
PORT=3000
```

⚠️ **IMPORTANTE:** O `CALLBACK_URL` deve ser exatamente igual ao que você vai configurar no GitHub OAuth!

### 1.3 Deploy
Clique em **"Deploy"** e aguarde (2-3 minutos)

---

## 🔐 Passo 2: Atualizar GitHub OAuth App

Após o Vercel gerar sua URL (ex: `seu-projeto.vercel.app`):

1. Acesse: https://github.com/settings/developers
2. Clique na sua app OAuth
3. Atualize **"Authorization callback URL"** para:
   ```
   https://seu-projeto.vercel.app/auth/github/callback
   ```
4. Clique em **"Update application"**

⚠️ **Agora você TEM 2 URLs:**
- **Localhost:** http://localhost:3000/auth/github/callback (testes)
- **Produção:** https://seu-projeto.vercel.app/auth/github/callback (Vercel)

---

## 📝 Passo 3: Atualizar arquivo `.env`

### Para Desenvolvimento (localhost):
```env
NODE_ENV=development
CALLBACK_URL=http://localhost:3000/auth/github/callback
```

### Para Produção (Vercel):
```env
NODE_ENV=production
CALLBACK_URL=https://seu-projeto.vercel.app/auth/github/callback
```

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá para **Settings** → **Environment Variables**

Adicione estas variáveis:

```
GITHUB_CLIENT_ID = seu_client_id_aqui
GITHUB_CLIENT_SECRET = seu_client_secret_aqui
SESSION_SECRET = seu_secret_aleatorio_muito_seguro
CALLBACK_URL = https://seu-projeto.vercel.app/auth/github/callback
NODE_ENV = production
PORT = 3000
```

---

## 🧪 Testar

1. Aguarde o deploy terminar (status verde ✅)
2. Acesse: `https://seu-projeto.vercel.app/login.html`
3. Clique em **"Entrar com GitHub"**
4. Você será redirecionado para GitHub para autorizar
5. Se funcionar, você será redirecionado para o painel!

---

## 🔄 Atualizações Futuras

Quando você fizer push no GitHub:

```bash
git add .
git commit -m "Atualizações no sistema"
git push origin main
```

Vercel detecta automaticamente e faz **redeploy** em poucos segundos!

---

## ❌ Problemas Comuns

### Erro: "Invalid redirect URI"
- Verifique se a URL no `.env` é exatamente igual à do GitHub OAuth App
- Sem espaços, sem barras extras no final

### Erro: "Client secret is invalid"
- Verifique se você copou corretamente o Client Secret
- Gere um novo se necessário

### Sessão não persiste
- Adicione `SESSION_SECRET` nas variáveis de ambiente do Vercel
- Aguarde redeploy

---

## 🎯 Alternativas (além de Vercel)

### Heroku:
```bash
heroku create seu-app-name
heroku config:set GITHUB_CLIENT_ID=seu_id
heroku config:set GITHUB_CLIENT_SECRET=seu_secret
git push heroku main
```

### Railway:
1. Conecte seu GitHub
2. Crie novo projeto
3. Selecione seu repositório
4. Configure variáveis de ambiente
5. Deploy automático

### Render:
1. Acesse https://render.com
2. New → Web Service
3. Conecte GitHub
4. Configure variáveis
5. Deploy

---

## 📊 Checklist Final

- [ ] Criei projeto no Vercel
- [ ] Adicionei variáveis de ambiente no Vercel
- [ ] Fiz deploy com sucesso (status ✅)
- [ ] Atualizei GitHub OAuth App com nova URL
- [ ] Testei login (Entrar com GitHub) com sucesso
- [ ] Redirecionamento funciona
- [ ] Dados do usuário aparecem no painel

---

## 🔗 Sua URL de Produção:

```
https://seu-projeto.vercel.app
```

Substitua `seu-projeto` pelo nome do seu projeto no Vercel!

---

**Próxim passo:** Fazer push do seu código para GitHub e deixar Vercel fazer o deploy automático! 🚀
