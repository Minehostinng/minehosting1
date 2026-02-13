// api/server.js - Handler para Vercel Serverless Functions
const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Sessão com storage em memória (necessário para Vercel)
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu_secret_aleatorio_aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
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
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/auth/github/callback';

console.log('✓ Configurações carregadas:', {
  GITHUB_CLIENT_ID: GITHUB_CLIENT_ID ? '✓' : '✗',
  GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET ? '✓' : '✗',
  CALLBACK_URL,
  NODE_ENV: process.env.NODE_ENV
});

// ============ CONFIGURAR PASSPORT ============

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['user:email', 'repo']
}, async (accessToken, refreshToken, profile, done) => {
  try {
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

    console.log(`✓ Usuário autenticado: ${userData.login}`);
    return done(null, userData);
  } catch (error) {
    console.error('✗ Erro ao processar usuário GitHub:', error.message);
    return done(error);
  }
}));

// ============ ROTAS DE AUTENTICAÇÃO ============

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Servidor rodando',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV
  });
});

// Iniciar login GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// Callback do GitHub
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user;
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
          console.error('[✗ Erro Repo]', repoError.response?.data?.message || repoError.message);
        }
      }

      if (repoReady) {
        console.log(`[Codespace] Tentando criar Codespace para ${user.login}/minehosting`);
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
          console.log(`[✓] Codespace criado para ${user.login}`);
        } catch (csError) {
          console.error('[!] Codespace:', csError.response?.data?.message || csError.message);
        }
      }

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

// Dados do usuário autenticado
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
      avatar: req.user.avatar,
    }
  });
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/');
  });
});

// 404
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

// Exportar como handler serverless
module.exports = app;
