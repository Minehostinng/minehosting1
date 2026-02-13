// api/auth/[...].js - Handler para rotas de autenticação
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

// Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/auth/github/callback';
const GITHUB_API_URL = 'https://api.github.com';

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

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
    return done(error);
  }
}));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// GitHub login
app.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GitHub callback
app.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login.html' }),
  async (req, res) => {
    try {
      const user = req.user;
      
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
        repoReady = true;
      } catch (repoError) {
        if (repoError.response?.status === 422) {
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
        } catch (csError) {
          // Ignore codespace errors
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
      res.redirect('/login.html?error=auth_failed');
    }
  }
);

// Get user
app.get('/user', (req, res) => {
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

// Logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.redirect('/');
  });
});

module.exports = app;
