# ✅ Checklist de Implementação - Sistema de Codespaces GitHub

## 📋 Fase 1: Preparação (GitHub)

- [ ] **Criar Repositório Template**
  - [ ] Acesso: https://github.com/new
  - [ ] Nome: `minehosting-template`
  - [ ] Descrição: "Template para ambientes de desenvolvimento cliente"
  - [ ] Inicializar com README
  - [ ] Adicionar .gitignore (Node.js)

- [ ] **Configurar devcontainer.json**
  - [ ] Copiou o arquivo `.devcontainer/devcontainer.json` para o repo
  - [ ] Incluir extensões VS Code necessárias
  - [ ] Configurar portas (3000, 5432, 8080)
  - [ ] Adicionar variáveis de ambiente
  - [x] Commit & push para `main`

- [ ] **Gerar Personal Access Token (PAT)**
  - [ ] Acessar: https://github.com/settings/tokens/new
  - [ ] Scopes selecionados:
    - [ ] ✅ `repo`
    - [ ] ✅ `codespace`
  - [ ] Salvar token em local seguro
  - [ ] Nunca fazer commit do token!

---

## 📋 Fase 2: Backend Node.js

- [ ] **Instalar Dependências**
  ```bash
  npm install express axios dotenv cors body-parser
  npm install --save-dev nodemon
  ```

- [ ] **Criar arquivo .env**
  ```
  GITHUB_PAT=seu_token_aqui
  GITHUB_OWNER=seu-usuario
  GITHUB_REPO=minehosting-template
  PORT=3000
  DB_HOST=localhost
  DB_NAME=minehosting
  ```

- [ ] **Arquivos Criados**
  - [x] `server.js` - API Express
  - [x] `package.json` - Dependências
  - [x] `.env.example` - Referência de env
  - [x] `database.js` - Schema e queries
  - [x] `GUIA_COMPLETO.md` - Documentação
  - [x] `EXEMPLOS_INTEGRACAO.js` - Exemplos práticos

- [ ] **Testar Servidor Localmente**
  ```bash
  npm install
  npm run dev
  # Acessar http://localhost:3000/health
  ```

---

## 📋 Fase 3: Banco de Dados

### PostgreSQL (Recomendado)

- [ ] **Instalar PostgreSQL** (local ou cloud)
  - [ ] Windows: https://www.postgresql.org/download/windows/
  - [ ] Cloud: https://render.com ou https://railway.app

- [ ] **Executar SQL Schema**
  ```bash
  psql -U seu_usuario -d minehosting < schema.sql
  ```

- [ ] **Testar Conexão**
  ```javascript
  npm test database.js
  ```

### Alternativa: MongoDB

- [ ] **Usar MongoDB Atlas** (Cloud)
  - [ ] Criar cluster
  - [ ] Gerar connection string
  - [ ] Adicionar a `.env`

---

## 📋 Fase 4: Integração Frontend

- [ ] **Atualizar registro.html**
  ```javascript
  // Ao fim do cadastro, chamar:
  await fetch('/api/codespaces/create', {
    method: 'POST',
    body: JSON.stringify({
      username: githubUsername,
      userEmail: email,
      machineType: 'standardLinux32GB'
    })
  });
  ```

- [ ] **Criar painel.html**
  - [ ] Mostrar Codespaces do usuário
  - [ ] Botão para abrir Codespace
  - [ ] Opção de deletar
  - [ ] Link para upgrade de máquina

- [ ] **Adicionar botão no topo**
  ```html
  <a href="#" id="openCodespace" class="btn btn-primary">
    🚀 Abrir Servidor
  </a>
  ```

---

## 📋 Fase 5: Deploy

### Local (Desenvolvimento)

- [ ] **Tudo funcionando localmente?**
  ```bash
  npm run dev
  # Testa criar Codespace:
  curl -X POST http://localhost:3000/api/codespaces/create \
    -H "Content-Type: application/json" \
    -d '{"username":"seu-user","userEmail":"seu@email.com"}'
  ```

### Produção (Escolha uma opção)

#### Opção A: Railway.app (Recomendado - Fácil)

- [ ] **Criar Conta**: https://railway.app
- [ ] **Conectar GitHub**
- [ ] **Selecionar este repositório**
- [ ] **Adicionar variáveis de ambiente**
- [ ] **Deploy automático** ✅

#### Opção B: Heroku

- [ ] **Instalar Heroku CLI**
- [ ] **Login**: `heroku login`
- [ ] **Criar app**: `heroku create seu-app`
- [ ] **Adicionar config**: `heroku config:set GITHUB_PAT=xxx`
- [ ] **Deploy**: `git push heroku main`

#### Opção C: AWS Lambda + API Gateway

- [ ] **Criar função Lambda**
- [ ] **Adicionar API Gateway**
- [ ] **Configurar variáveis de ambiente**
- [ ] **Testar endpoints**

#### Opção D: DigitalOcean App Platform

- [ ] **Conectar repositório GitHub**
- [ ] **Selecionar branch `main`**
- [ ] **Configurar build command**: `npm install`
- [ ] **Configurar start command**: `npm start`
- [ ] **Adicionar variáveis de ambiente**
- [ ] **Deploy**

---

## 📋 Fase 6: Testes

### Teste Manual

- [ ] **Criar Codespace via cURL**
  ```bash
  curl -X POST https://seu-dominio.com/api/codespaces/create \
    -H "Content-Type: application/json" \
    -d '{
      "username": "seu-user",
      "userEmail": "seu@email.com",
      "machineType": "standardLinux8Core"
    }'
  ```

- [ ] **Listar Codespaces**
  ```bash
  curl https://seu-dominio.com/api/codespaces/seu-user \
    -H "Authorization: Bearer seu_token"
  ```

- [ ] **Deletar Codespace**
  ```bash
  curl -X DELETE https://seu-dominio.com/api/codespaces/nome_do_codespace \
    -H "Authorization: Bearer seu_token"
  ```

### Teste de Carga

- [ ] **Simular 10 registros simultâneos**
- [ ] **Verificar erros de rate limiting**
- [ ] **Monitorar CPU/Memória do servidor**

---

## 📋 Fase 7: Segurança

- [ ] **Nunca commitar .env**
  ```bash
  echo ".env" >> .gitignore
  git rm --cached .env
  git commit -m "remove: .env file"
  ```

- [ ] **Validar entrada do usuário**
  ```javascript
  // Sanitizar username
  const username = req.body.username.replace(/[^a-zA-Z0-9_-]/g, '');
  ```

- [ ] **Rate Limiting**
  ```javascript
  npm install express-rate-limit
  // Limitar 5 requests por minuto por IP
  ```

- [ ] **Usar HTTPS**
  - [ ] Certificado SSL (Let's Encrypt)
  - [ ] Redirecionar HTTP → HTTPS

- [ ] **Configurar CORS**
  ```javascript
  app.use(cors({
    origin: ['https://seu-dominio.com'],
    credentials: true
  }));
  ```

- [ ] **Adicionar Ambiente Virtual**
  ```bash
  # Não usar PAT real, criar GitHub App para produção
  # Ver: https://docs.github.com/en/developers/apps/building-github-apps
  ```

---

## 📋 Fase 8: Monitoramento

- [ ] **Logging**
  ```javascript
  npm install winston
  // Registrar todas operações
  ```

- [ ] **Alertas por Email**
  - [ ] Se Codespace falhar ao criar
  - [ ] Se usuário ultrapassa cota
  - [ ] Se erro 5xx ocorrer

- [ ] **Dashboard de Métricas**
  - [ ] Número de Codespaces ativos
  - [ ] Total de usuários
  - [ ] Taxa de sucesso/falha
  - [ ] Custo estimado mensal

- [ ] **Monitorar Custos**
  - [ ] GitHub > Billing > Codespaces
  - [ ] Alertar se custo > $5000/mês
  - [ ] Análise: máquinas mais caras

---

## 📋 Fase 9: Documentação

- [ ] **README.md**
  - [ ] Como usar a API
  - [ ] Exemplos de curl
  - [ ] Campos obrigatórios
  - [ ] Códigos de erro

- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI (opcional)
  - [ ] Ou usar ApiDoc

- [ ] **Guia do Usuário**
  - [ ] Como registrar
  - [ ] Como acessar Codespace
  - [ ] Como fazer upgrade/downgrade
  - [ ] Como deletar servidor

---

## 🚨 Troubleshooting

### ❌ Erro: "403 Insufficient Permission"

**Solução:**
```bash
# Regenerar PAT com escopos corretos
# GitHub > Settings > Developer settings > Personal access tokens
# Escopos: repo + codespace
```

### ❌ Erro: "404 Not Found"

**Solução:**
```bash
# Verificar variáveis de ambiente
echo $GITHUB_OWNER
echo $GITHUB_REPO

# Testar se repo existe
curl -H "Authorization: token SEU_PAT" \
  https://api.github.com/repos/seu-owner/seu-repo
```

### ❌ Erro: "Machine not available"

**Solução:**
```javascript
// Nem todas as máquinas estão em todas as regiões
// Tente outra máquina menor ou outra location
location: "EastUS"  // em vez de WestUS2
machine: "standardLinux8Core"  // em vez de 32GB
```

### ⏰ Codespace demorando para criar

**Normal:** Primeiro Codespace leva 2-5 minutos
**Solução:** Aguarde, a criação continua em background

---

## 📊 Roadmap Futuro

- [ ] **GitHub App** ao invés de PAT (mais seguro)
- [ ] **Multi-região** automática
- [ ] **Scaling** automático baseado em uso
- [ ] **Backup/Snapshot** de Codespaces
- [ ] **Integração com Stripe** para cobrança
- [ ] **Dashboard de Analytics**
- [ ] **WebSocket** para notificações em tempo real
- [ ] **CLI próprio** para gerenciar Codespaces

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique [GUIA_COMPLETO.md](GUIA_COMPLETO.md)
2. Consulte [Documentação GitHub Codespaces](https://docs.github.com/en/codespaces)
3. Abra uma issue no repositório

---

**Status:** 🟢 Pronto para implementar
**Última atualização:** 2026-02-06
**Autor:** MineHosting Team
