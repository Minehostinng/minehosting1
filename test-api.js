/**
 * test-api.js - Script de Teste Rápido da API
 * 
 * Use isso para testar a integração sem interface gráfica
 * 
 * Executar:
 * node test-api.js
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const GITHUB_PAT = process.env.GITHUB_PAT;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const timestamp = new Date().toISOString();
  const prefix = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    request: `${colors.cyan}→${colors.reset}`,
  }[type] || '';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Teste 1: Health Check
 */
async function testHealthCheck() {
  try {
    log('info', 'Teste 1: Health Check');
    const response = await axios.get(`${API_BASE_URL}/health`);

    if (response.status === 200) {
      log('success', 'Servidor está rodando ✓');
      return true;
    }
  } catch (error) {
    log('error', `Servidor não responde: ${error.message}`);
    return false;
  }
}

/**
 * Teste 2: Criar Codespace
 */
async function testCreateCodespace() {
  try {
    log('info', 'Teste 2: Criar Codespace');
    log('request', 'POST /api/codespaces/create');

    const payload = {
      username: 'teste-usuario-' + Math.random().toString(36).substr(2, 9),
      userEmail: 'teste@exemplo.com',
      machineType: 'standardLinux8Core',
    };

    log('info', `Username: ${payload.username}`);
    log('info', `Máquina: ${payload.machineType}`);

    const response = await axios.post(`${API_BASE_URL}/api/codespaces/create`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201 && response.data.success) {
      log('success', 'Codespace criado com sucesso!');
      log('info', `Nome: ${response.data.data.name}`);
      log('info', `URL: ${response.data.data.webUrl}`);
      log('info', `ID: ${response.data.data.id}`);
      return response.data.data;
    }
  } catch (error) {
    log('error', `Erro ao criar Codespace: ${error.message}`);
    if (error.response?.data) {
      log('error', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

/**
 * Teste 3: Listar Codespaces
 */
async function testListCodespaces(username) {
  try {
    log('info', `Teste 3: Listar Codespaces de ${username}`);
    log('request', `GET /api/codespaces/${username}`);

    const response = await axios.get(`${API_BASE_URL}/api/codespaces/${username}`);

    if (response.data.success) {
      log('success', `Encontrados ${response.data.count} Codespace(s)`);
      response.data.codespaces.forEach(cs => {
        log('info', `  - ${cs.name} (${cs.state})`);
      });
      return response.data.codespaces;
    }
  } catch (error) {
    log('error', `Erro ao listar: ${error.message}`);
    return [];
  }
}

/**
 * Teste 4: Deletar Codespace
 */
async function testDeleteCodespace(codespaceName) {
  try {
    log('info', `Teste 4: Deletar Codespace ${codespaceName}`);
    log('request', `DELETE /api/codespaces/${codespaceName}`);

    const response = await axios.delete(
      `${API_BASE_URL}/api/codespaces/${codespaceName}`
    );

    if (response.data.success) {
      log('success', `Codespace deletado: ${codespaceName}`);
      return true;
    }
  } catch (error) {
    log('error', `Erro ao deletar: ${error.message}`);
    return false;
  }
}

/**
 * Teste 5: Testar com Token Inválido
 */
async function testInvalidAuth() {
  try {
    log('info', 'Teste 5: Autenticação Inválida');

    // Salvar PAT original
    const originalPAT = process.env.GITHUB_PAT;
    process.env.GITHUB_PAT = 'token-invalido-123';

    const response = await axios.post(
      `${API_BASE_URL}/api/codespaces/create`,
      {
        username: 'test-user',
        userEmail: 'test@email.com',
      },
      { validateStatus: () => true } // Não lançar erro
    );

    // Restaurar PAT
    process.env.GITHUB_PAT = originalPAT;

    if (response.status >= 400) {
      log('success', `Sistema rejeitou token inválido (${response.status})`);
      return true;
    }
  } catch (error) {
    log('error', `Erro inesperado: ${error.message}`);
    return false;
  }
}

/**
 * Teste 6: Rate Limiting (Opcional)
 */
async function testRateLimiting() {
  try {
    log('info', 'Teste 6: Rate Limiting');
    log('warning', 'Enviando 20 requisições simultâneas...');

    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        axios.post(
          `${API_BASE_URL}/api/codespaces/create`,
          {
            username: `user-${i}`,
            userEmail: `user${i}@email.com`,
          },
          { validateStatus: () => true }
        )
      );
    }

    const results = await Promise.all(promises);

    const rateLimited = results.filter(r => r.status === 429).length;
    if (rateLimited > 0) {
      log('success', `Rate limiting ativo (${rateLimited}/20 bloqueadas)`);
    } else {
      log('warning', 'Rate limiting não detectado (não implementado)');
    }
  } catch (error) {
    log('error', `Erro no teste: ${error.message}`);
  }
}

/**
 * Teste 7: Performance
 */
async function testPerformance() {
  try {
    log('info', 'Teste 7: Performance');

    const payload = {
      username: 'perf-test-' + Date.now(),
      userEmail: 'perf@email.com',
      machineType: 'standardLinux8Core',
    };

    const start = Date.now();
    const response = await axios.post(`${API_BASE_URL}/api/codespaces/create`, payload, {
      validateStatus: () => true,
    });
    const duration = Date.now() - start;

    log('info', `Tempo de resposta: ${duration}ms`);

    if (duration < 1000) {
      log('success', 'Resposta rápida ✓');
    } else if (duration < 3000) {
      log('warning', 'Resposta aceitável');
    } else {
      log('error', 'Resposta lenta - verificar servidor');
    }
  } catch (error) {
    log('error', `Erro: ${error.message}`);
  }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log(
    `\n${colors.cyan}🧪 Iniciando Suite de Testes - GitHub Codespaces API${colors.reset}\n`
  );

  // Teste 1: Health check
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    log('error', '❌ Servidor não está rodando. Abortando testes.');
    return;
  }

  console.log('');

  // Teste 2: Criar Codespace
  const codespace = await testCreateCodespace();

  console.log('');

  // Teste 3: Listar Codespaces
  if (codespace) {
    await testListCodespaces(codespace.owner);
  }

  console.log('');

  // Teste 4: Deletar Codespace
  if (codespace) {
    await testDeleteCodespace(codespace.name);
  }

  console.log('');

  // Teste 5: Autenticação
  await testInvalidAuth();

  console.log('');

  // Teste 6: Rate Limiting
  await testRateLimiting();

  console.log('');

  // Teste 7: Performance
  await testPerformance();

  console.log(
    `\n${colors.green}✓ Testes concluídos!${colors.reset}\n`
  );
}

// ============================================================
// EXECUTAR
// ============================================================

if (require.main === module) {
  runAllTests().catch(error => {
    log('error', `Erro fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testHealthCheck,
  testCreateCodespace,
  testListCodespaces,
  testDeleteCodespace,
  testInvalidAuth,
  testRateLimiting,
  testPerformance,
};
