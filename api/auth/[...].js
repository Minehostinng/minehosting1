// api/auth/[...].js - Catch-all handler para todas as rotas de autenticação
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/api/auth/github/callback';
const GITHUB_API_URL = 'https://api.github.com';

console.log('[Auth Handler] Initialized');

// ============ ROTAS ============

// GET /api/auth/github - Inicia login
app.get('/github', (req, res) => {
  const redirectUri = encodeURIComponent(CALLBACK_URL);
  const scope = encodeURIComponent('user:email repo');
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  
  console.log('[Auth] Iniciando login...');
  res.redirect(githubAuthUrl);
});

// GET /api/auth/github/callback - Processa callback
app.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      console.log('[Callback] Sem code');
      return res.redirect('/login.html?error=no_code');
    }

    console.log('[Callback] Code recebido, trocando por token...');

    // Trocar código por access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: CALLBACK_URL
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const error = tokenResponse.data.error;

    if (error || !accessToken) {
      console.error('[Callback] Token error:', error);
      return res.redirect('/login.html?error=token_error');
    }

    console.log('[Callback] Token obtido, buscando dados do usuário...');

    // Buscar dados do usuário
    const userResponse = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const user = userResponse.data;
    console.log(`[Callback] Usuário: ${user.login}`);

    // Buscar email
    let email = user.email;
    if (!email) {
      try {
        const emailsResponse = await axios.get(`${GITHUB_API_URL}/user/emails`, {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
        email = emailsResponse.data.find(e => e.primary)?.email;
      } catch (emailError) {
        console.log('[Callback] Email fetch error:', emailError.message);
      }
    }

    // Tentar criar repositório
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
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      console.log(`[Callback] ✓ Repo criado para ${user.login}`);
    } catch (repoError) {
      if (repoError.response?.status === 422) {
        console.log(`[Callback] Repo já existe para ${user.login}`);
      } else {
        console.log(`[Callback] Repo error:`, repoError.response?.data?.message);
      }
    }

    // Redirecionar com dados do usuário
    const queryParams = new URLSearchParams({
      name: user.name || user.login,
      email: email || '',
      username: user.login,
      avatar: user.avatar_url || '',
      success: 'true'
    }).toString();

    console.log('[Callback] Redirecionando para painel...');
    res.redirect(`/painel.html?${queryParams}`);
  } catch (error) {
    console.error('[Callback Error]', error.message);
    res.redirect('/login.html?error=callback_failed');
  }
});

// GET /api/auth/health - Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', handler: 'auth' });
});

// 404
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

module.exports = app;
