# 🔀 Fluxo de Integração - Sistema de Codespaces GitHub

## 📊 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (HTML/JS)                           │
│                                                                   │
│  [registro.html] → Formulário de Cadastro                        │
│      ↓                                                            │
│  Validar entrada (email, username, senha)                        │
│      ↓                                                            │
│  POST /api/usuarios/cadastro (Registrar no BD)                   │
│      ↓                                                            │
│  POST /api/codespaces/create (Criar Codespace)                   │
│      ↓                                                            │
│  Receber URL do Codespace                                        │
│      ↓                                                            │
│  Redirecionar para Codespace ou Painel                           │
└─────────────────────────────────────────────────────────────────┘
                              ↑↓
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                       │
│                                                                   │
│  [server.js] - API REST                                          │
│                                                                   │
│  POST /api/usuarios/cadastro                                     │
│    ├─ Validar dados                                              │
│    ├─ Hash password (bcrypt)                                     │
│    └─ Salvar no banco de dados (users table)                     │
│                                                                   │
│  POST /api/codespaces/create                                     │
│    ├─ Receber: username, email, machineType                      │
│    ├─ Validar permissões                                         │
│    ├─ Chamar GitHub API ────────┐                               │
│    ├─ Salvar resposta no BD      │                               │
│    └─ Retornar: { webUrl, id }   │                               │
│                                  │                               │
│  GET /api/codespaces/:username   │                               │
│    └─ Listar Codespaces do user  │                               │
│                                  │                               │
│  DELETE /api/codespaces/:name    │                               │
│    └─ Deletar (soft delete)      │                               │
└──────────────────────────────────┼───────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB API (REST)                             │
│                                                                   │
│  Authorization: Bearer ${GITHUB_PAT}                              │
│                                                                   │
│  POST /repos/{owner}/{repo}/codespaces                           │
│    ├─ ref: "main"                                                │
│    ├─ display_name: "Servidor do João"                           │
│    ├─ machine: "standardLinux32GB"                               │
│    └─ location: "WestUS2"                                        │
│         ↓                                                        │
│  Resposta:                                                       │
│    {                                                             │
│      "id": "12345",                                              │
│      "name": "trusting-doberman-xyz",                            │
│      "web_url": "https://...github.dev",                         │
│      "state": "Creating"                                         │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (PostgreSQL/MongoDB)                  │
│                                                                   │
│  ┌─ usuarios table                                               │
│  │  ├─ id (PK)                                                   │
│  │  ├─ email                                                     │
│  │  ├─ github_username                                           │
│  │  ├─ nome                                                      │
│  │  └─ criado_em                                                 │
│  │                                                               │
│  ├─ codespaces table                                             │
│  │  ├─ id (PK)                                                   │
│  │  ├─ usuario_id (FK)                                           │
│  │  ├─ github_codespace_id                                       │
│  │  ├─ web_url                                                   │
│  │  ├─ state                                                     │
│  │  └─ criado_em                                                 │
│  │                                                               │
│  └─ codespaces_logs table                                        │
│     ├─ id (PK)                                                   │
│     ├─ usuario_id (FK)                                           │
│     ├─ acao (create, delete, error)                              │
│     └─ criado_em                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Sequência de Chamadas (Message Flow)

### Cenário: Usuário se registra

```
tempo →

Usuário               Frontend            Backend              GitHub API        Database
  │                     │                   │                     │                │
  ├─ Preenche form ────→│                   │                     │                │
  │                     │                   │                     │                │
  │                     ├─ Validação ──────→│                     │                │
  │                     │                   │                     │                │
  │                     │    POST /usuarios/cadastro               │                │
  │                     ├──────────────────→│                     │                │
  │                     │                   ├─ Hash password       │                │
  │                     │                   │                     │                │
  │                     │                   ├─ INSERT user ──────→│                │
  │                     │                   │←─ id: 123 ──────────┤                │
  │                     │←── 201 Created ──│                     │                │
  │                     │    {user: {...}} │                     │                │
  │                     │                   │                     │                │
  │                     │    POST /codespaces/create               │                │
  │                     ├──────────────────→│                     │                │
  │                     │                   ├─ Validar PAT ──────→│                │
  │                     │                   │←─ OK ───────────────┤                │
  │                     │                   │                     │                │
  │                     │                   ├─ POST /repos/.../codespaces         │
  │                     │                   ├────────────────────→│                │
  │                     │                   │                     ├─ Preparar     │
  │                     │                   │                     ├─ Criar        │
  │                     │                   │←─ {id, name, url} ──┤                │
  │                     │                   │                     │                │
  │                     │                   ├─ INSERT codespace ─→│                │
  │                     │                   │←─ Inserido ─────────┤                │
  │                     │←─ 201 Created ────│                     │                │
  │                     │   {webUrl: ...}   │                     │                │
  │                     │                   │                     │                │
  │←─ Redirect ────────│                   │                     │                │
  │  /painel.html      │                   │                     │                │
  │                     │                   │                     │                │
  ├─ Acessa painel ───→│                   │                     │                │
  │                     ├─ GET /codespaces/user                   │                │
  │                     ├──────────────────→│                     │                │
  │                     │                   ├─ SELECT * FROM codespaces          │
  │                     │                   ├────────────────────────────────────→│
  │                     │                   │←─ [{id, name, url, ...}] ──────────┤
  │                     │←─ 200 OK ─────────│                     │                │
  │                     │   {codespaces}    │                     │                │
  │                     │                   │                     │                │
  │←─ Mostra table ────│                   │                     │                │
  │  com Codespaces     │                   │                     │                │
  │                     │                   │                     │                │
  ├─ Clica "Abrir" ────→│                   │                     │                │
  │                     ├─ window.open(url)→│                     │                │
  │                     │                   │                     │                │
  └─────→ Abre Codespace no GitHub.dev  ←─→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
```

---

## 🛠️ Endpoints Principais

### 1. Criar Usuário (Registro)

```
POST /api/usuarios/cadastro
Content-Type: application/json

REQUEST:
{
  "email": "user@email.com",
  "github_username": "user-github",
  "nome": "João Silva",
  "senha": "senha123"
}

RESPONSE (201):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@email.com",
    "github_username": "user-github",
    "criado_em": "2026-02-06T10:00:00Z"
  }
}

ERRORS:
- 400: Email já existe
- 400: GitHub username inválido
- 500: Erro ao salvar
```

### 2. Criar Codespace

```
POST /api/codespaces/create
Content-Type: application/json
Authorization: Bearer ${PAT} (interno)

REQUEST:
{
  "username": "user-github",
  "userEmail": "user@email.com",
  "machineType": "standardLinux32GB"  // opcional
}

RESPONSE (201):
{
  "success": true,
  "message": "Codespace criado com sucesso!",
  "data": {
    "id": "abc123",
    "name": "trusting-doberman",
    "displayName": "Servidor do João",
    "webUrl": "https://user-trusting-doberman.github.dev",
    "state": "Creating",
    "location": "WestUS2",
    "machineType": "standardLinux32GB"
  }
}

ERRORS:
- 400: Username obrigatório
- 403: Acesso negado ao repositório
- 404: Repositório não encontrado
- 500: Erro ao criar
```

### 3. Listar Codespaces do Usuário

```
GET /api/codespaces/{username}

RESPONSE (200):
{
  "success": true,
  "username": "user-github",
  "count": 2,
  "codespaces": [
    {
      "id": "abc123",
      "name": "trusting-doberman",
      "webUrl": "https://...",
      "state": "Available",
      "createdAt": "2026-02-06T10:00:00Z"
    },
    {
      "id": "xyz789",
      "name": "happy-lion",
      "webUrl": "https://...",
      "state": "Creating",
      "createdAt": "2026-02-06T11:00:00Z"
    }
  ]
}
```

### 4. Deletar Codespace

```
DELETE /api/codespaces/{codespaceName}

RESPONSE (200):
{
  "success": true,
  "message": "Codespace trusting-doberman foi deletado com sucesso."
}

ERRORS:
- 404: Codespace não encontrado
- 403: Sem permissão para deletar
- 500: Erro ao deletar
```

---

## 🔐 Estados do Codespace

```
Creating  ──→  Available  ──→  Running
                   ↓
                Stopped (inativo por 30 min)
                   ↓
            Rebuilding (mudança de config)
                   ↓
            Deleted (removido)
```

---

## 💸 Fluxo de Custos

```
Usuário registra                           ~$0
    ↓
Codespace criado (standardLinux32GB)      ~$0.30/hora
    ↓                                      = ~$200/mês
Codespace rodando 24/7                    (se always-on)
    ↓
Usuário para o Codespace                  Custos param
    ↓ (após 30 min de inatividade)
Auto-stop (se configurado)                ~$0/hora
    ↓
Usuário delete Codespace                  ~$0
```

---

## 🚨 Tratamento de Erros

```javascript
// No Backend

try {
  // 1. Validar entrada
  if (!username) throw new Error('Username obrigatório', 400);
  
  // 2. Chamar GitHub API
  const response = await githubAPI.createCodespace();
  
  // 3. Salvar no BD
  await db.saveCodespace(userId, response);
  
  // 4. Retornar sucesso
  res.status(201).json({ success: true });
  
} catch (error) {
  // Classificar erro
  if (error.response?.status === 403) {
    // Problema de autenticação
    log('error', 'GitHub PAT inválido ou sem permissão');
    res.status(403).json({ error: 'Acesso negado' });
  } else if (error.response?.status === 404) {
    // Repositório não existe
    log('error', 'Repositório não encontrado');
    res.status(404).json({ error: 'Repositório inválido' });
  } else {
    // Erro genérico
    log('error', error.message);
    res.status(500).json({ error: 'Erro interno' });
  }
}
```

---

## 📱 Fluxo no Frontend (registro.html)

```javascript
1. Usuário preenche formulário
   ↓
2. Clica "Criar Conta"
   ↓
3. Frontend valida
   ├─ Email válido?
   ├─ Senha forte?
   ├─ Username GitHub?
   └─ Senhas coincidem?
   ↓
4. POST /api/usuarios/cadastro (Sistema cria usuário)
   ↓
5. Se OK:
   ├─ Status: "✓ Conta criada"
   ├─ POST /api/codespaces/create (Cria Codespace)
   └─ Mostrar progresso
   ↓
6. Se Codespace criado:
   ├─ Status: "✓ Servidor pronto!"
   ├─ Salvar URL em localStorage
   └─ Redirecionar para Codespace
   ↓
7. Se erro:
   ├─ Mostrar mensagem
   ├─ Permitir retry
   └─ Community: "Contate suporte"
```

---

## 🔌 Webhooks (Automação)

### Configurar Webhook no seu Site

```bash
Endpoint: POST https://seu-dominio.com/webhook/novo-usuario
Disparado: Quando novo usuário se registra
Body:
{
  "usuario_id": 123,
  "email": "user@email.com",
  "username": "user-github",
  "timestamp": "2026-02-06T10:00:00Z"
}
```

### No Backend

```javascript
app.post('/webhook/novo-usuario', async (req, res) => {
  const { username, email } = req.body;
  
  // Criar Codespace automaticamente
  try {
    const response = await fetch(
      'https://seu-api.com/api/codespaces/create',
      {
        method: 'POST',
        body: JSON.stringify({
          username,
          userEmail: email,
          machineType: 'standardLinux32GB'
        })
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📊 Métricas & Monitoramento

```
Dashboard:

✓ Codespaces ativos: 42
✓ Usuários totais: 156
✓ Taxa sucesso: 98.5%
✓ Tempo médio criação: 2m 34s
✓ Custo estimado mês: $8,400

Alertas:
⚠️ 2 Codespaces falharam (verificar logs)
⚠️ Custo 115% do orçamento
⚠️ 5 usuários ultrapassaram limite de máquinas
```

---

**Criado:** 2026-02-06
**Status:** ✅ Pronto para Produção
