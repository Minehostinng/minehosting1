# 🔐 Configuração de Login com GitHub (OAuth 2.0)

## ✅ Passo 1: Criar o Aplicativo no GitHub

Este passo é **manual** e precisa ser realizado no GitHub:

1. Acesse: https://github.com/settings/developers
2. Clique em **"OAuth Apps"** no menu lateral esquerdo
3. Clique em **"New OAuth App"**
4. Preencha o formulário com:
   - **Application name**: `MineHosting` (ou seu nome preferido)
   - **Homepage URL**: `http://localhost:3000` (para teste)
   - **Application description**: `Sistema de login para MineHosting`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
5. Clique em **"Register application"**
6. Você receberá:
   - **Client ID** (copiável diretamente)
   - **Client Secret**: Clique em "Generate a new client secret"

## ✅ Passo 2: Configurar Variáveis de Ambiente

No arquivo `.env` da raiz do seu projeto, atualize:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=seu_client_id_aqui
GITHUB_CLIENT_SECRET=seu_client_secret_aqui

# Session
SESSION_SECRET=seu_secret_aleatorio_muito_seguro_aqui
```

⚠️ **IMPORTANTE**: Nunca compartilhe o `GITHUB_CLIENT_SECRET`. Ele é sensível como uma senha!

## ✅ Passo 3: Instalar Dependências

As dependências já foram instaladas com:
```bash
npm install
```

## ✅ Passo 4: Rodar o Servidor

```bash
npm start
```

Ou para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 📋 Rotas Implementadas

### Autenticação GitHub
- **GET `/auth/github`** - Inicia o login GitHub
- **GET `/auth/github/callback`** - Callback do GitHub (automático)
- **GET `/auth/user`** - Retorna dados do usuário autenticado
- **GET `/auth/logout`** - Faz logout do usuário

### APIs de Codespaces
- **POST `/api/codespaces/create`** - Cria novo Codespace
- **GET `/api/codespaces/:username`** - Lista Codespaces do usuário
- **DELETE `/api/codespaces/:codespaceName`** - Deleta um Codespace

## 🧪 Testando o Login

1. Acesse: `http://localhost:3000/login.html`
2. Clique no botão **"Entrar com GitHub"**
3. Você será redirecionado para o GitHub
4. Autorize a aplicação
5. Você será redirecionado de volta para o painel com sua sessão ativa

## 🔒 Segurança

O sistema implementa:
- ✅ **Session Management**: Sessões seguras com Passport.js
- ✅ **OAuth 2.0**: Padrão de mercado para autenticação
- ✅ **HTTPS Cookies**: Em produção, use HTTPS (definido via `NODE_ENV=production`)
- ✅ **Variáveis de Ambiente**: Credenciais não ficam no código

## 📝 Próximos Passos (Opcionais)

### 1. Banco de Dados
Salvar usuários no banco de dados após login:

```javascript
// No callback do Passport, adicionar:
const user = await User.findOrCreate({
  githubId: profile.id,
  login: profile.username,
  email: primaryEmail
});
```

### 2. JWT Tokens
Para API sem estado (recomendado em produção):

```bash
npm install jsonwebtoken
```

### 3. Produção
Para deploy em produção:
- Use HTTPS (não HTTP)
- Altere `CALLBACK_URL` para seu domínio
- Configure `SESSION_SECRET` com um valor seguro e aleatório
- Defina `NODE_ENV=production`

## 🐛 Troubleshooting

### Erro: "Invalid redirect URI"
- Verifique se a **Authorization callback URL** no GitHub matches exatamente com `CALLBACK_URL` no `.env`

### Erro: "Client secret is invalid"
- Gere uma novo secret no GitHub OAuth Apps
- Atualize o `.env` com o novo valor

### Sessão não persiste
- Verifique se **Session Secret** está definido no `.env`
- Em produção, use um session store (Redis, MongoDB, etc.)

## 📚 Documentação Útil

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js GitHub Strategy](http://www.passportjs.org/packages/passport-github2/)
- [Express Session](https://github.com/expressjs/session)
