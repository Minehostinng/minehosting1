const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./'));

// Inicie o Stripe com sua chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51SzJzVPJmaheIHPbgnKBdUsVyQ0RzVWDraLIbAC0EvQvp5o76CQvWiH27nsL9hSYhI69iArxTbrmvoSlxV1rbHjD00a6YMsrB1');

// Configurações
const GITHUB_PAT = process.env.GITHUB_PAT; // Seu Personal Access Token
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'seu-usuario'; // Dono do repositório
const GITHUB_REPO = process.env.GITHUB_REPO || 'seu-repo-template'; // Repositório template
const GITHUB_API_URL = 'https://api.github.com';

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
 * POST /create-checkout-session
 * Cria uma sessão de checkout do Stripe
 */
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { lookup_key } = req.body;
    console.log(`[Stripe] Iniciando checkout para: ${lookup_key}`);

    // No exemplo do Stripe, se usa lookup_keys para buscar o preço
    // Aqui usaremos IDs fixos de teste ou simularemos a busca
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Plano ${lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1)}`,
            },
            unit_amount: lookup_key === 'starter' ? 1900 : (lookup_key === 'pro' ? 4900 : 9900),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pagamento.html?plano=${lookup_key}`,
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('[Stripe Erro]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /create-portal-session
 * Cria uma sessão do portal de faturamento do Stripe
 */
app.post('/create-portal-session', async (req, res) => {
  try {
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // Esta é a URL para a qual os usuários serão redirecionados após gerenciarem o faturamento.
    const returnUrl = `${req.headers.origin}`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
  } catch (error) {
    console.error('[Stripe Portal Erro]', error.message);
    res.status(500).json({ error: error.message });
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
