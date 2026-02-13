const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const app = express();
const path = require('path');

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu_secret_aleatorio_aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurações GitHub API
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'seu-usuario';
const GITHUB_REPO = process.env.GITHUB_REPO || 'seu-repo-template';
const GITHUB_API_URL = 'https://api.github.com';

// Configurações GitHub OAuth
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3000/auth/github/callback';

// ============ CONFIGURAR PASSPORT ============

// Serializar usuário
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserializar usuário
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Estratégia GitHub
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['user:email', 'repo']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar emails do usuário
    const emailsResponse = await axios.get(`${GITHUB_API_URL}/user/emails`, {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const primaryEmail = emailsResponse.data.find(email => email.primary)?.email;

    const userData = {
      id: profile.id,
      login: profile.username,
      name: profile.displayName || profile.username,
      email: primaryEmail || profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
      accessToken: accessToken,
      profile: profile
    };

    // Aqui você pode salvar usuário no banco de dados
    // await User.findOrCreate(userData);

    return done(null, userData);
  } catch (error) {
    console.error('Erro ao processar usuário GitHub:', error);
    return done(error);
  }
}));

// ============ ROTAS DE AUTENTICAÇÃO ============

/**
 * GET /auth/github
 * Inicia o fluxo de autenticação GitHub com Passport
 */
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

/**
 * GET /auth/github/callback
 * Callback do GitHub após autorização
 */
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;

      // Criar repositório automático
      console.log(`[Flow] Criando repositório para ${user.login}`);
      let repoReady = false;

      try {
        await axios.post(
          `${GITHUB_API_URL}/user/repos`,
          {
            name: 'minehosting',
            description: 'Repositório criado automaticamente via MineHosting',
            private: false,
            auto_init: true
          },
          {
            headers: {
              Authorization: `token ${user.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        console.log(`[✓] Repositório 'minehosting' criado.`);
        repoReady = true;
      } catch (repoError) {
        if (repoError.response?.status === 422) {
          console.log(`[!] O repositório 'minehosting' já existe.`);
          repoReady = true;
        } else {
          console.error('[✗ Erro Repo]', repoError.response?.data || repoError.message);
        }
      }

      // Criar Codespace automaticamente
      if (repoReady) {
        console.log(`[Codespace Creation] Tentando criar Codespace para ${user.login}/minehosting`);
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));

          await axios.post(
            `${GITHUB_API_URL}/repos/${user.login}/minehosting/codespaces`,
            {
              ref: 'main',
              machine: 'largeLinux',
              display_name: 'Servidor MineHosting Pro'
            },
            {
              headers: {
                Authorization: `token ${user.accessToken}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );
          console.log(`[✓ Sucesso] Codespace criado para ${user.login}`);
        } catch (csError) {
          console.error('[✗ Erro Codespace]', csError.response?.data || csError.message);
        }
      }

      // Redirecionar para o painel com dados do usuário
      const queryParams = new URLSearchParams({
        name: user.name,
        email: user.email,
        username: user.login,
        avatar: user.avatar,
        success: 'true'
      }).toString();

      res.redirect(`/painel.html?${queryParams}`);
    } catch (error) {
      console.error('[OAuth Error]', error.message);
      res.redirect('/login.html?error=auth_failed');
    }
  }
);

/**
 * GET /auth/user
 * Retorna dados do usuário autenticado
 */
app.get('/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      login: req.user.login,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

/**
 * GET /auth/logout
 * Faz logout do usuário
 */
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.redirect('/login.html?message=logout_success');
  });
});



/**
 * POST /api/codespaces/create
 * Cria um novo Codespace para o usuário
 * 
 * Body esperado:
 * {
 *   "username": "usuario-github",
 *   "userEmail": "usuario@email.com",
 *   "machineType": "standardLinux32GB" (opcional)
 * }
 */
app.post('/api/codespaces/create', async (req, res) => {
  try {
    const { username, userEmail, machineType = 'standardLinux32GB' } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username do GitHub é obrigatório' });
    }

    if (!GITHUB_PAT) {
      return res.status(500).json({ error: 'GITHUB_PAT não configurado no servidor' });
    }

    console.log(`[Criando Codespace] para usuário: ${username}`);

    // Requisição para criar Codespace
    const response = await axios.post(
      `${GITHUB_API_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/codespaces`,
      {
        ref: 'main', // Branch principal
        display_name: `Servidor ${username}`,
        machine: machineType,
        location: 'WestUs2', // Opcional: ajuste conforme sua região
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'MineHosting-API',
        },
      }
    );

    const codespaceData = {
      id: response.data.id,
      name: response.data.name,
      displayName: response.data.display_name,
      webUrl: response.data.web_url,
      owner: response.data.owner.login,
      state: response.data.state,
      location: response.data.location,
      machineType: response.data.machine.name,
    };

    console.log(`[✓ Sucesso] Codespace criado: ${codespaceData.name}`);
    console.log(`[URL] ${codespaceData.webUrl}`);

    // Aqui você deve SALVAR os dados no seu banco de dados
    // Exemplo: await Database.saveCodespace(username, userEmail, codespaceData);

    res.status(201).json({
      success: true,
      message: 'Codespace criado com sucesso!',
      data: codespaceData,
    });
  } catch (error) {
    console.error('[✗ Erro]', error.response?.data || error.message);

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Acesso negado. Verifique seu GitHub PAT e permissões.',
        details: error.response.data?.message,
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Repositório ou usuário não encontrado.',
        details: error.response.data?.message,
      });
    }

    res.status(error.response?.status || 500).json({
      error: 'Erro ao criar Codespace',
      message: error.response?.data?.message || error.message,
    });
  }
});

/**
 * GET /api/codespaces/:username
 * Lista Codespaces do usuário
 */
app.get('/api/codespaces/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!GITHUB_PAT) {
      return res.status(500).json({ error: 'GITHUB_PAT não configurado' });
    }

    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/codespaces`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const userCodespaces = response.data.codespaces
      ?.filter(cs => cs.owner.login === username)
      .map(cs => ({
        id: cs.id,
        name: cs.name,
        displayName: cs.display_name,
        webUrl: cs.web_url,
        state: cs.state,
        createdAt: cs.created_at,
      })) || [];

    res.json({
      success: true,
      username,
      count: userCodespaces.length,
      codespaces: userCodespaces,
    });
  } catch (error) {
    console.error('[✗ Erro]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Erro ao listar Codespaces',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/codespaces/:codespaceName
 * Deleta um Codespace específico
 */
app.delete('/api/codespaces/:codespaceName', async (req, res) => {
  try {
    const { codespaceName } = req.params;

    if (!GITHUB_PAT) {
      return res.status(500).json({ error: 'GITHUB_PAT não configurado' });
    }

    await axios.delete(
      `${GITHUB_API_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/codespaces/${codespaceName}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    console.log(`[✓ Sucesso] Codespace deletado: ${codespaceName}`);

    res.json({
      success: true,
      message: `Codespace ${codespaceName} foi deletado com sucesso.`,
    });
  } catch (error) {
    console.error('[✗ Erro]', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Erro ao deletar Codespace',
      message: error.message,
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Servidor rodando', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Repositório: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log(`🔐 PAT configurado: ${GITHUB_PAT ? 'Sim' : 'Não'}`);
});

module.exports = app;
