// api/[...].js - Catch-all handler para todas as requisições
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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Configurações
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/auth/github/callback';
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_OWNER_KEY = process.env.GITHUB_OWNER;
const GITHUB_API_URL = 'https://api.github.com';

console.log('[Init] GitHub OAuth configured');

// ============ PASSPORT CONFIG ============

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

    console.log(`[Auth OK] ${userData.login}`);
    return done(null, userData);
  } catch (error) {
    console.error('[Auth Error]', error.message);
    return done(error);
  }
}));

// ============ ROUTES ============

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html' }),
  async (req, res) => {
    try {
      const user = req.user;
      console.log(`[Callback] ${user.login}`);
      
      let repoReady = false;

      try {
        await axios.post(
          `${GITHUB_API_URL}/user/repos`,
          {
            name: 'minehosting',
            description: 'Auto-created via MineHosting',
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
        console.log(`[✓] Repo created`);
        repoReady = true;
      } catch (repoError) {
        if (repoError.response?.status === 422) {
          console.log(`[!] Repo exists`);
          repoReady = true;
        }
      }

      if (repoReady) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await axios.post(
            `${GITHUB_API_URL}/repos/${user.login}/minehosting/codespaces`,
            { ref: 'main', machine: 'largeLinux' },
            {
              headers: {
                Authorization: `token ${user.accessToken}`,
                Accept: 'application/vnd.github.v3+json',
              },
            }
          );
          console.log(`[✓] Codespace created`);
        } catch (csError) {
          console.log(`[!] Codespace:`, csError.response?.data?.message);
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
      console.error('[Callback Error]', error.message);
      res.redirect('/login.html?error=auth_failed');
    }
  }
);

app.get('/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
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
    if (err) return res.status(500).json({ error: err.message });
    res.redirect('/');
  });
});

// 404
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found', path: req.path });
});

module.exports = app;
