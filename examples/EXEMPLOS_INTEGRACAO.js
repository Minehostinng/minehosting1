/**
 * EXEMPLO 1: Integração no Registro de Usuário
 * Quando o usuário se cadastra, crie um Codespace automaticamente
 */

// Exemplo com fetch no Frontend (registro.html)
async function registrarUsuario(dadosFormulario) {
  try {
    // 1. Registrar o usuário no seu banco de dados
    const usuarioResponse = await fetch('/api/usuarios/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: dadosFormulario.email,
        username: dadosFormulario.username,
        senha: dadosFormulario.senha,
      }),
    });

    const usuario = await usuarioResponse.json();

    if (!usuarioResponse.ok) {
      throw new Error(usuario.error || 'Erro ao registrar usuário');
    }

    // 2. Criar Codespace automaticamente
    const codespacesResponse = await fetch('/api/codespaces/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usuario.githubUsername, // Username do GitHub
        userEmail: usuario.email,
        machineType: 'standardLinux32GB', // ou 'standardLinux16GB' para menor custo
      }),
    });

    const codespace = await codespacesResponse.json();

    if (!codespacesResponse.ok) {
      console.warn('⚠️ Codespace não foi criado:', codespace.error);
      // Ainda assim, o usuário é registrado, mas sem Codespace
      return {
        success: true,
        message: 'Usuário registrado. Codespace será criado manualmente.',
        usuario,
      };
    }

    // 3. Sucesso! Redirecionar para o Codespace
    alert(
      '✅ Servidor criado com sucesso! Redirecionando para seu ambiente...'
    );
    window.location.href = codespace.data.webUrl;

    return {
      success: true,
      message: 'Usuário registrado e Codespace criado!',
      usuario,
      codespace: codespace.data,
    };
  } catch (error) {
    console.error('❌ Erro:', error);
    alert(`Erro: ${error.message}`);
  }
}

/**
 * EXEMPLO 2: Webhook do GitHub (Evento de Novo Usuário)
 * Processa eventos webhook disparados quando algo acontece no repositório
 */

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Middleware para verificar assinatura do webhook
function verificarWebhookSignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const hmac = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === `sha256=${hmac}`;
}

/**
 * Webhook que se ativa quando usuário primeiro acessa o repositório
 */
app.post('/webhook/usuario-novo', (req, res) => {
  // Validar assinatura
  if (!verificarWebhookSignature(req)) {
    return res.status(403).json({ error: 'Assinatura inválida' });
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`📨 Webhook recebido: ${event}`);

  // Processar diferentes tipos de eventos
  if (event === 'pull_request' && payload.action === 'opened') {
    console.log(`👤 Novo PR de: ${payload.pull_request.user.login}`);
    // Aqui você pode obter os dados do usuário e criar Codespace
  }

  if (event === 'repository_dispatch') {
    const { username, userEmail } = payload.client_payload;
    console.log(`🚀 Disparando criação de Codespace para: ${username}`);

    // Chamar a API de criação de Codespace
    fetch('http://localhost:3000/api/codespaces/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        userEmail,
        machineType: 'standardLinux32GB',
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ Codespace criado:', data);
      })
      .catch(err => console.error('❌ Erro:', err));
  }

  res.json({ success: true, message: 'Webhook processado' });
});

/**
 * EXEMPLO 3: AWS Lambda (Alternativa Serverless)
 * Use isso para disparar Codespace creation sem servidor
 */

const axios = require('axios');

exports.handler = async (event) => {
  // Lambda disparado via API Gateway ou CloudWatch
  // event pode conter { username, userEmail, machineType }

  const { username, userEmail, machineType = 'standardLinux32GB' } = JSON.parse(
    event.body || '{}'
  );

  try {
    const response = await axios.post(
      'https://api.github.com/repos/{owner}/{repo}/codespaces',
      {
        ref: 'main',
        display_name: `Servidor ${username}`,
        machine: machineType,
        location: 'WestUs2',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        codespaceUrl: response.data.web_url,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Falha ao criar Codespace',
        details: error.message,
      }),
    };
  }
};

/**
 * EXEMPLO 4: Usando GitHub Actions para criar Codespace
 * Arquivo: .github/workflows/criar-codespace.yml
 */

/*
name: Criar Codespace Automático
on:
  workflow_dispatch:
    inputs:
      username:
        description: 'Username do GitHub'
        required: true
      email:
        description: 'Email do usuário'
        required: true

jobs:
  create-codespace:
    runs-on: ubuntu-latest
    steps:
      - name: Criar Codespace
        run: |
          curl -X POST \
            -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/${{ github.repository }}/codespaces \
            -d '{
              "ref": "main",
              "display_name": "Servidor ${{ github.event.inputs.username }}",
              "machine": "standardLinux32GB"
            }'
*/
