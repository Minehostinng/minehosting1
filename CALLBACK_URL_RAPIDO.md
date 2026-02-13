# 🌐 Configuração de CALLBACK_URL por Provedor

## Resumo Rápido

Mude APENAS a URL de callback conforme seu provedor:

### Desenvolvimento (Localhost)
```env
CALLBACK_URL=http://localhost:3000/auth/github/callback
```

### Vercel
```env
CALLBACK_URL=https://seu-projeto.vercel.app/auth/github/callback
```

### Netlify
```env
CALLBACK_URL=https://seu-site.netlify.app/auth/github/callback
```

### Heroku
```env
CALLBACK_URL=https://seu-app.herokuapp.com/auth/github/callback
```

### Railway
```env
CALLBACK_URL=https://seu-projeto-railway.up.railway.app/auth/github/callback
```

### Render
```env
CALLBACK_URL=https://seu-projeto.onrender.com/auth/github/callback
```

### Seu Próprio Servidor
```env
CALLBACK_URL=https://seu-dominio.com/auth/github/callback
```

---

## ⚡ Passo Extra: Atualizar GitHub OAuth App

Qualquer que seja seu domínio, atualize no GitHub:

1. https://github.com/settings/developers
2. Selecione sua app OAuth
3. Mude **"Authorization callback URL"** para o novo domínio
4. Salve

---

## 🎯 Exemplo Prático (Vercel)

### Seu projeto se chama: `minehosting-live`

**URL do Vercel:** `https://minehosting-live.vercel.app`

**Seu .env:**
```env
CALLBACK_URL=https://minehosting-live.vercel.app/auth/github/callback
```

**GitHub OAuth:**
```
Authorization callback URL: https://minehosting-live.vercel.app/auth/github/callback
```

**Pronto!** ✅

---

Mais detalhes: Veja [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
