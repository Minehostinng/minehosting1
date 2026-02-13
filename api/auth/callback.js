// api/auth/callback.js - GitHub OAuth callback
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect('/login.html?error=no_code');
    }

    // Trocar código por access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/auth/github/callback'
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.redirect('/login.html?error=no_token');
    }

    // Buscar dados do usuário
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const user = userResponse.data;

    // Buscar email
    let email = user.email;
    if (!email) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
        email = emailsResponse.data.find(e => e.primary)?.email;
      } catch (emailError) {
        console.log('Erro ao buscar emails:', emailError.message);
      }
    }

    // Tentar criar repositório
    try {
      await axios.post(
        'https://api.github.com/user/repos',
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
      console.log(`[✓] Repo criado para ${user.login}`);
    } catch (repoError) {
      if (repoError.response?.status === 422) {
        console.log(`[!] Repo já existe para ${user.login}`);
      } else {
        console.log(`[!] Erro ao criar repo:`, repoError.message);
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

    res.redirect(`/painel.html?${queryParams}`);
  } catch (error) {
    console.error('[Callback Error]', error.message);
    res.redirect('/login.html?error=callback_failed');
  }
};
