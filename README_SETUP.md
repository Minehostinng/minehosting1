# 🎮 MineHosting - Hospedagem de Servidores Minecraft com GitHub Codespaces

Sistema automático para criar e gerenciar servidores Minecraft usando GitHub Codespaces com autenticação via OAuth.

---

## 🌟 Features

✅ **Autenticação GitHub OAuth** - Login seguro via GitHub  
✅ **Criação Automática de Codespaces** - Servidor criado na hora  
✅ **Console em Tempo Real** - Gerenciar servidor pelo navegador  
✅ **Terminal Web** - Interface terminal integrada  
✅ **Painel Administrativo** - Dashboard completo  
✅ **Deploy Vercel Ready** - Funciona 100% em cloud  

---

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/minehosting.git
cd minehosting

# 2. Instale dependências
npm install

# 3. Configure variaveis (copied de .env.local.example)
cp .env.local.example .env

# 4. Edite .env com suas credenciais GitHub
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...
# CALLBACK_URL=http://localhost:3000/auth/github/callback

# 5. Inicie o servidor
npm start
# ou com hot-reload:
npm run dev

# 6. Acesse
# http://localhost:3000/login.html
```

### Deploy no Vercel

Veja: [Rapidíssimo! 5 minutos](docs/VERCEL_QUICKSTART.md)

Ou documentação completa: [Setup Completo](docs/SETUP_GITHUB_OAUTH_VERCEL.md)

---

## 📁 Estrutura do Projeto

```
minehosting1/
├── css/
│   └── style.css                 # Estilos modernos
├── docs/
│   ├── SETUP_GITHUB_OAUTH_VERCEL.md  # Guia completo
│   ├── VERCEL_QUICKSTART.md          # Setup rápido
│   └── [outros documentos]
├── examples/
│   ├── EXEMPLO_REGISTRO.html     # Exemplo de registro
│   ├── EXEMPLOS_INTEGRACAO.js    # Exemplos de uso
│   └── test-api.js               # Testes da API
├── js/
│   ├── server.js                 # Backend Express + Passport
│   ├── main.js                   # Front-end principal
│   ├── panel.js                  # Lógica do painel
│   ├── terminal.js               # Terminal web
│   └── database.js               # Queries database
├── .env.example                  # Variáveis (Vercel)
├── .env.local.example            # Variáveis (Local)
├── vercel.json                   # Config Vercel
├── package.json
├── index.html                    # Homepage
├── login.html                    # Página de login
├── painel.html                   # Painel principal
└── [outras páginas HTML]
```

---

## 🔐 Autenticação GitHub

### Como Funciona?

```
1. Usuário clica "Conectar com GitHub"
   ↓
2. Redireciona para GitHub para autorizar
   ↓
3. GitHub retorna um código
   ↓
4. Servidor troca código por access token
   ↓
5. Servidor usa token para:
   - Criar repositório automaticamente
   - Criar Codespace de alta performance
   - Salvar dados do usuário
   ↓
6. Usuário logado no painel!
```

### Setup Rápido (Vercel)

**IMPORTANTE:** Você precisa fazer DUAS coisas:

#### 1. Registrar GitHub OAuth App
- https://github.com/settings/developers
- New OAuth App
- **Authorization callback URL**: `https://minehosting-seven.vercel.app/auth/github/callback`
- Copie Client ID e Secret

#### 2. Configurar Vercel
- Dashboard → Projeto → Settings → Environment Variables
- Adicione `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, etc.
- Redeploy

---

## 🔑 Variáveis de Ambiente

```bash
# OAuth GitHub
GITHUB_CLIENT_ID              # De: https://github.com/settings/developers
GITHUB_CLIENT_SECRET          # De: https://github.com/settings/developers
GITHUB_PAT                    # De: https://github.com/settings/tokens
GITHUB_OWNER                  # Seu username GitHub
GITHUB_REPO                   # Repo template para Codespaces

# URLs
CALLBACK_URL                  # DEVE estar registrada no GitHub OAuth App
# Local: http://localhost:3000/auth/github/callback
# Vercel: https://minehosting-seven.vercel.app/auth/github/callback

# Sessão
SESSION_SECRET                # Gere uma chave aleatória

# Ambiente
NODE_ENV                      # "development" ou "production"
PORT                          # 3000 (padrão)

# Opcional
DEBUG                         # "true" para logs verbosos
```

---

## 📚 Endpoints da API

### Autenticação
- `GET /auth/github/login` - Inicia login GitHub
- `GET /auth/github/callback` - Callback após autorizar
- `GET /auth/logout` - Logout

### Codespaces
- `POST /api/codespaces/create` - Cria novo Codespace
- `GET /api/codespaces/:username` - Lista Codespaces
- `DELETE /api/codespaces/:codespaceName` - Deleta Codespace

### Health
- `GET /health` - Status do servidor

---

## 🛠️ Desenvolvimento

### Dependências Principais
```json
{
  "express": "^4.18.2",
  "passport": "^0.7.0",
  "passport-github2": "^0.1.12",
  "express-session": "^1.17.3",
  "axios": "^1.6.2",
  "dotenv": "^16.3.1"
}
```

### Scripts Disponíveis
```bash
npm start        # Inicia servidor
npm run dev      # Desenvolvimentocom nodemon
npm test         # Testes
```

---

## 🆘 Troubleshooting

### ❌ "Invalid redirect_uri" no GitHub

**Problema:** Callback URL não bate

**Solução:**
1. Verifique em `https://github.com/settings/developers`
2. A URL EXATA deve ser registrada lá
3. Compare com `CALLBACK_URL` no `.env`

### ❌ "Client ID não encontrado"

**Problema:** Variáveis de ambiente não carregadas

**Solução:**
- Local: Verifique `.env`
- Vercel: Dashboard → Environment Variables → Redeploy

### ❌ Erro ao criar Codespace

**Problema:** PAT (Personal Access Token) inválido ou sem permissões

**Solução:**
1. Gere novo PAT em: https://github.com/settings/tokens
2. Marque: `repo`, `user`, `gist`
3. Atualize `GITHUB_PAT`

### ❌ Logs não aparecem

**Solução:** Defina `DEBUG=true` no `.env`

---

## 🚢 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel --prod
```

### Docker (Alternativa)

```dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
```

```bash
docker build -t minehosting .
docker run -p 3000:3000 --env-file .env minehosting
```

---

## 📝 Próximos Passos

- [ ] Integrar banco de dados (PostgreSQL/MongoDB)
- [ ] Implementar pagamentos (Stripe)
- [ ] Dashboard avançado
- [ ] Gerenciar múltiplos Codespaces
- [ ] Webhooks automáticos
- [ ] Backup automático

---

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes

---

## 🤝 Contribuindo

Issues e Pull Requests são bem-vindos!

---

## 📞 Suporte

- 📖 [Documentação Vercel](docs/SETUP_GITHUB_OAUTH_VERCEL.md)
- ⚡ [Quick Start](docs/VERCEL_QUICKSTART.md)
- 🐛 [GitHub Issues](https://github.com/seu-usuario/minehosting/issues)

---

**🎉 Ready to host? Deploy agora em Vercel!**

```bash
npm install -g vercel && vercel --prod
```
