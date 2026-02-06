# 🚀 Guia Completo: Sistema de Criação Automática de Codespaces GitHub

## 📋 Índice

1. [Preparação no GitHub](#1-preparação-no-github)
2. [Integração via API REST](#2-integração-via-api-rest)
3. [Automatização do Gatilho](#3-automatizando-a-criação)
4. [Gerenciamento de Custos](#4-gerenciamento-de-custos-e-permissões)
5. [Troubleshooting](#troubleshooting)

---

## 1. Preparação no GitHub

### 1.1 Criar o Repositório Template

```bash
# No GitHub.com:
1. Clique em "New repository"
2. Nome: minehosting-template
3. Descrição: "Template para ambientes de desenvolvimento cliente"
4. Visibilidade: Private (se for servidor de clientes) ou Public
5. Clique em "Create repository"
```

### 1.2 Adicionar devcontainer.json

Você já tem este arquivo em `.devcontainer/devcontainer.json`. Faça push:

```bash
git add .devcontainer/devcontainer.json
git commit -m "feat: adicionar configuração dev container"
git push origin main
```

### 1.3 Gerar Personal Access Token (PAT)

```
GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
```

**Escopos necessários:**
- ✅ `repo` - Acesso ao repositório
- ✅ `codespace` - Criar/gerenciar Codespaces

**Copie o token e guarde em local seguro**

Salve no arquivo `.env`:
```
GITHUB_PAT=ghp_seu_token_aqui
```

---

## 2. Integração via API REST

### 2.1 Estrutura da Requisição

**Endpoint:** `POST https://api.github.com/repos/{owner}/{repo}/codespaces`

**Headers:**
```json
{
  "Authorization": "Bearer ghp_seu_token_aqui",
  "Accept": "application/vnd.github.v3+json"
}
```

**Body:**
```json
{
  "ref": "main",
  "display_name": "Servidor do Usuario",
  "machine": "standardLinux32GB",
  "location": "WestUs2"
}
```

### 2.2 Opções de Máquina

| Machine | vCPU | RAM  | Custo/mês aprox |
|---------|------|------|-----------------|
| standardLinux2Core | 2 | 8GB | ~$50 |
| standardLinux4Core | 4 | 16GB | ~$100 |
| standardLinux8Core | 8 | 32GB | ~$200 |
| standardLinux16Core | 16 | 64GB | ~$400 |

### 2.3 Regiões Disponíveis

```
"AustraliaEast"
"EastUS"
"EastUS2"
"WestUS"
"WestUS2"      ← Melhor latência para América Latina
"EastUS1"
"EastUS2EUAP"
"SouthCentralUS"
```

### 2.4 Exemplo com cURL

```bash
curl -X POST \
  -H "Authorization: Bearer ghp_seu_token" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/seu-usuario/minehosting-template/codespaces \
  -d '{
    "ref": "main",
    "display_name": "Servidor do João",
    "machine": "standardLinux32GB",
    "location": "WestUS2"
  }'
```

**Resposta de sucesso (201):**
```json
{
  "id": "12345",
  "name": "trusting-doberman-xyz123",
  "display_name": "Servidor do João",
  "owner": {
    "login": "seu_usuario",
    "id": 999
  },
  "repository": {
    "id": 123,
    "name": "minehosting-template"
  },
  "state": "Creating",
  "created_at": "2026-02-06T10:00:00Z",
  "updated_at": "2026-02-06T10:00:00Z",
  "web_url": "https://seu_usuario-trusting-doberman-xyz123.github.dev",
  "machine": {
    "name": "standardLinux32GB",
    "display_name": "Linux 32 GB"
  },
  "location": "WestUS2"
}
```

---

## 3. Automatizando a Criação

### 3.1 Quando Usuário se Registra (Frontend)

No arquivo `registro.html`, adicione aos botões:

```javascript
// Após cadastro bem-sucedido no servidor
async function finalizarCadastro(dadosUsuario) {
  try {
    // 1. Registrar no banco de dados
    const regResponse = await apiCall('/api/usuarios/cadastro', {
      method: 'POST',
      body: dadosUsuario
    });

    // 2. Criar Codespace
    const csResponse = await fetch('/api/codespaces/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: regResponse.githubUsername,
        userEmail: regResponse.email,
        machineType: 'standardLinux32GB'
      })
    });

    const codespace = await csResponse.json();
    
    if (csResponse.ok) {
      // Exemplo 1: Redirecionar para o Codespace
      window.location.href = codespace.data.webUrl;
      
      // OU Exemplo 2: Mostrar link no painel
      localStorage.setItem('codespace_url', codespace.data.webUrl);
    } else {
      console.warn('Codespace não foi criado, mas usuário registrado');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

### 3.2 Usando Webhook (Automático)

Configure webhooks do seu servidor:

```bash
# Painel do site > Dashboard > Webhooks
# URL: https://seu-dominio.com/webhook/usuario-novo
# Evento: POST quando novo usuário se registra
# Body enviado:
{
  "usuario_id": 123,
  "username": "joao_silva",
  "email": "joao@email.com",
  "timestamp": "2026-02-06T10:00:00Z"
}
```

No `server.js`, processe o webhook:

```javascript
app.post('/webhook/usuario-novo', async (req, res) => {
  const { username, email } = req.body;

  try {
    // Criar Codespace automaticamente
    const response = await axios.post(
      `https://api.github.com/repos/seu-usuario/minehosting-template/codespaces`,
      {
        ref: 'main',
        display_name: `Servidor ${username}`,
        machine: 'standardLinux32GB',
        location: 'WestUS2'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    // Salvar no banco de dados
    await db.usuarios.updateOne(
      { username },
      {
        codespace_id: response.data.id,
        codespace_url: response.data.web_url,
        codespace_created_at: new Date()
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Erro ao criar Codespace:', error.message);
    res.status(500).json({ error: error.message });
  }
});
```

### 3.3 Usando AWS Lambda (Serverless)

Crie uma função Lambda que é disparada quando novo usuário se registra:

```javascript
// arquivo: lambda_criar_codespace.js
const axios = require('axios');

exports.handler = async (event) => {
  const { username, email } = JSON.parse(event.body || '{}');

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Username obrigatório' })
    };
  }

  try {
    const response = await axios.post(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/codespaces`,
      {
        ref: 'main',
        display_name: `Servidor ${username}`,
        machine: 'standardLinux32GB',
        location: 'WestUS2'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        codespaceUrl: response.data.web_url,
        codespaceName: response.data.name
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Falha ao criar Codespace',
        details: error.message
      })
    };
  }
};
```

---

## 4. Gerenciamento de Custos e Permissões

### 4.1 Configurar Cobrança

```
GitHub > Settings > Billing and plans > Codespaces > Spending limit
```

**Recomendações:**
- Defina um limite mensal por usuário
- Use máquinas menores (standardLinux8Core) por padrão
- Permite upgrade manual se necessário

### 4.2 Variáveis de Ambiente no Dev Container

No `devcontainer.json`, adicione:

```json
{
  "containerEnv": {
    "ENVIRONMENT": "production",
    "API_URL": "https://seu-dominio.com/api",
    "DATABASE_URL": "postgresql://user:pass@db:5432/minehosting",
    "GITHUB_PAT": "${localEnv:GITHUB_PAT}"
  }
}
```

### 4.3 Portas Expostas

Configure portas no `devcontainer.json`:

```json
{
  "forwardPorts": [3000, 5432, 8080, 8443],
  "portsAttributes": {
    "3000": {
      "label": "API Server",
      "onAutoForward": "notify"
    },
    "5432": {
      "label": "PostgreSQL",
      "onAutoForward": "silent"
    }
  }
}
```

### 4.4 GitHub App (Alternativa Segura para PAT)

Para produção, use GitHub App em vez de PAT:

1. **Criar App**: GitHub > Settings > Developer settings > GitHub Apps > New GitHub App
2. **Configurar Permissões**: 
   - Repository > Codespaces: Read & Write
   - User > Email: Read
3. **Gerar Chave Privada**: Baixar arquivo `.pem`
4. **Instalar no Repositório**: https://github.com/apps/seu-app/installations
5. **Usar no Código**:

```javascript
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync('private-key.pem');
const token = jwt.sign(
  { iss: process.env.GITHUB_APP_ID },
  privateKey,
  { algorithm: 'RS256', expiresIn: '10m' }
);

// Usar token no lugar do PAT
axios.post(url, data, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📊 Monitoramento

### Endpoints para Verificar

```javascript
// Listar contagem de Codespaces por repositório
GET /repos/{owner}/{repo}/codespaces

// Verificar custos (requer org owner)
GET /orgs/{org}/codespaces/billing

// Status de um Codespace
GET /repos/{owner}/{repo}/codespaces/{codespace_name}
```

---

## Troubleshooting

### ❌ Erro 403: "Insufficient Permission"
- Verifique se o PAT tem escopo `repo` + `codespace`
- Teste o PAT: `curl -H "Authorization: token SEU_PAT" https://api.github.com/user`

### ❌ Erro 404: "Not Found"
- Verifique se `owner` e `repo` estão corretos
- O repositório deve ser visível para seu usuário PAT

### ❌ "Machine not available in location"
- Nem todas as regiões têm todas as máquinas
- Tente outra região ou máquina

### ❌ Codespace não aparece no painel do usuário
- Espere 30-60 segundos
- Verifique se o repositório está visível para o usuário
- Refresque a página do GitHub

---

## 🔐 Boas Práticas de Segurança

1. **Nunca commite PAT** → Use `.env` local
2. **Rotacione tokens regularmente** → A cada 3-6 meses
3. **Use GitHub App para produção** → Mais seguro que PAT
4. **Valide entrada do usuário** → Sanitize username
5. **Limite reqs por usuário** → Evite abuso (rate limiting)
6. **Log todas operações** → Auditoria de quem criou o quê

---

## 📚 Documentação Oficial

- [GitHub Codespaces API](https://docs.github.com/en/rest/codespaces/codespaces?apiVersion=2022-11-28)
- [Devcontainer Spec](https://containers.dev/)
- [GitHub App Auth](https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps)

---

**Última atualização:** 2026-02-06
**Status:** ✅ Pronto para produção
