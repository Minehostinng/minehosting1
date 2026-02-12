const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configurações GitHub API
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'seu-usuario';
const GITHUB_REPO = process.env.GITHUB_REPO || 'seu-repo-template';
const GITHUB_API_URL = 'https://api.github.com';

// Configurações GitHub OAuth
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback';

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

/**
 * GET /api/auth/github/login
 * Redireciona para o GitHub para iniciar o OAuth
 */
app.get('/api/auth/github/login', (req, res) => {
  const scope = 'read:user user:email repo';
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=${scope}`;
  res.redirect(url);
});

/**
 * GET /api/auth/github/callback
 * Recebe o código do GitHub e troca por um token de acesso
 */
app.get('/api/auth/github/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Trocar código por token de acesso
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Buscar dados do usuário
    const userResponse = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    // Buscar email principal do usuário
    const emailsResponse = await axios.get(`${GITHUB_API_URL}/user/emails`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const primaryEmail = emailsResponse.data.find(email => email.primary)?.email;

    const userData = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name || userResponse.data.login,
      email: primaryEmail,
      avatar: userResponse.data.avatar_url,
    };

    // --- CRIAÇÃO AUTOMÁTICA DO REPOSITÓRIO E CODESPACE ---
    console.log(`[Flow] Iniciando automação para ${userData.login}`);
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
            Authorization: `token ${accessToken}`,
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
      console.log(`[Codespace Creation] Tentando criar Codespace 4-Core/16GB para ${userData.login}/minehosting`);
      try {
        // Aguarda um pequeno delay para o GitHub processar a criação do repo
        await new Promise(resolve => setTimeout(resolve, 2000));

        await axios.post(
          `${GITHUB_API_URL}/repos/${userData.login}/minehosting/codespaces`,
          {
            ref: 'main',
            machine: 'largeLinux', // largeLinux = 4 Cores, 16GB RAM
            display_name: 'Servidor MineHosting Pro'
          },
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        console.log(`[✓ Sucesso] Codespace de alto desempenho criado para ${userData.login}`);
      } catch (csError) {
        console.error('[✗ Erro Codespace]', csError.response?.data || csError.message);
      }
    }
    // -----------------------------------------------------

    // Aqui você pode salvar/atualizar o usuário no banco de dados
    // E gerar um JWT ou sessão para o seu sistema

    // Redirecionar de volta para o front-end com os dados (apenas para demonstração/protótipo)
    // Em produção, use cookies seguros ou tokens
    const queryParams = new URLSearchParams({
      name: userData.name,
      email: userData.email,
      username: userData.login,
      success: 'true'
    }).toString();

    res.redirect(`/painel.html?${queryParams}`);
  } catch (error) {
    console.error('[OAuth Error]', error.message);
    res.redirect('/login.html?error=auth_failed');
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
