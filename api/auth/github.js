// api/auth/github.js - GitHub login endpoint
const axios = require('axios');

module.exports = (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/api/auth/callback'
    );
    const scope = encodeURIComponent('user:email repo');
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    console.log('[GitHub] Redirecionando para GitHub auth...');
    res.redirect(githubAuthUrl);
  } catch (error) {
    console.error('[GitHub Error]', error.message);
    res.status(500).json({ error: error.message });
  }
};
