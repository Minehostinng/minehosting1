// api/server.js - serverless function para Vercel
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

// Configurar Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu_secret_aleatorio_aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
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
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/auth/github/callback';

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

    return done(null, userData);
  } catch (error) {
    console.error('Erro ao processar usuário GitHub:', error);
    return done(error);
  }
}));

// ============ ROTAS DE AUTENTICAÇÃO ============

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

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
          console.error('[✗ Erro Repo]', repoError.response?.data || repoError.message);
        }
      }

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

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/');
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Servidor rodando', timestamp: new Date().toISOString() });
});

// 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

// Exportar para Vercel serverless
module.exports = app;
