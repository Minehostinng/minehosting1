// api/auth/github.js - Inicia login GitHub
module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.CALLBACK_URL || 'https://minehosting-seven.vercel.app/api/auth/github/callback');
  const scope = encodeURIComponent('user:email repo');
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  
  res.redirect(githubAuthUrl);
};
