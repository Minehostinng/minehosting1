# ⚡ GUIA RÁPIDO - 3 PASSOS (10 minutos)

## 🎯 Objetivo
Ter um sistema de login com GitHub funcionando em 10 minutos.

---

## PASSO 1️⃣: Configurar OAuth no GitHub (3 minutos)

### 1.1 Ir para GitHub
Abra: https://github.com/settings/developers

### 1.2 Criar OAuth App
1. Clique em **"OAuth Apps"** (menu esquerdo)
2. Clique em **"New OAuth App"**
3. Preencha assim:
   ```
   Application name: MineHosting
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/auth/github/callback
   ```
4. Clique **"Register application"**

### 1.3 Copiar Credenciais
1. Na página da app, você verá **"Client ID"** - Copie!
2. Clique **"Generate a new client secret"** 
3. Copie o **"Client Secret"**

### 1.4 Atualizar .env
Abra o arquivo `.env` na raiz do projeto e atualize:

```env
GITHUB_CLIENT_ID=seu_client_id_aqui
GITHUB_CLIENT_SECRET=seu_client_secret_aqui
SESSION_SECRET=seu_secret_aleatorio_muito_seguro_aqui
```

✅ **PASSO 1 Concluído!**

---

## PASSO 2️⃣: Iniciar o Servidor (2 minutos)

### 2.1 No Terminal
```bash
npm start
```

### 2.2 Esperado
```
🚀 Servidor rodando em http://localhost:3000
📁 Repositório: Minehostinng/MineHosting
🔐 PAT configurado: Sim
```

Se vir isto, significa ✅ **PASSO 2 Concluído!**

---

## PASSO 3️⃣: Testar no Navegador (5 minutos)

### 3.1 Abrir Página de Login
No navegador, acesse:
```
http://localhost:3000/login.html
```

### 3.2 Clicar em "Entrar com GitHub"
Você verá um botão preto com logo do GitHub.

### 3.3 Autorizar
1. GitHub vai pedir para autorizar a app
2. Clique **"Authorize"** ou **"Autorizar"**
3. Você será redirecionado para o painel

### 3.4 Verificar
Se você vir seus dados no painel, seu sistema está funcionando! 🎉

---

## 👀 Onde Estão os Dados do Usuário?

Após login bem-sucedido, você tem acesso a:
```javascript
{
  id: 12345,
  name: "João Silva",
  login: "joaosilva", 
  email: "joao@email.com",
  avatar: "https://avatars.github.com/..."
}
```

Veja como usar em: `js/github-auth-example.js`

---

## 🎓 Próximas Leituras (Opcionais)

Se tudo funcionou, você pode:

1. **Para entender melhor:**  
   Leia [RESUMO_IMPLEMENTACAO.md](RESUMO_IMPLEMENTACAO.md)

2. **Para usar no seu projeto:**  
   Veja [js/github-auth-example.js](js/github-auth-example.js)

3. **Para troubleshooting:**  
   Consulte [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md)

---

## ❓ Algo Deu Errado?

### Erro: "Invalid redirect URI"
- Verifique se em GitHub a **Authorization callback URL** é exatamente:
  ```
  http://localhost:3000/auth/github/callback
  ```
- Atualize também seu `.env` com o mesmo valor

### Erro: "Client secret is invalid"
- Gere um novo secret em GitHub
- Copie o novo valor no `.env`

### Servidor não inicia
- Execute: `npm start`
- Se der erro, execute: `npm install`

### Validar Tudo
Execute para validar a configuração:
```bash
./validate-oauth-setup.sh
```

---

## ✅ Checklist Final

- [ ] Criei OAuth App no GitHub (Passo 1)
- [ ] Copiei Client ID e Secret para `.env` (Passo 1)
- [ ] Executei `npm start` sem erros (Passo 2)
- [ ] Acessei `http://localhost:3000/login.html` (Passo 3)
- [ ] Cliquei em "Entrar com GitHub" (Passo 3)
- [ ] Autorizei a aplicação (Passo 3)
- [ ] Fui redirecionado para o painel (Passo 3)
- [ ] Consigo ver meus dados no painel ✅

---

## 🎉 Sucesso!

Se chegou até aqui, seu sistema de autenticação GitHub está **100% funcional!**

---

**👉 Próxim Passo:** Se tudo funcionou, leia [RESUMO_IMPLEMENTACAO.md](RESUMO_IMPLEMENTACAO.md) para saber como integrar no seu projeto.

---

**Tempo total gasto:** ~10 minutos ⏱️

*A implementação técnica já estava pronta. Você só precisa fazer os 3 passos acima!*
