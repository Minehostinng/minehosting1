# 🚀 Início Rápido - 15 Minutos para Começar

Guia passo-a-passo para configurar e testar o sistema de Codespaces em 15 minutos.

---

## ⚡ Passo 1: Preparar GitHub (3 min)

### 1.1 Criar Repositório Template

```bash
# Acesse https://github.com/new e crie:
Repositório: minehosting-template
Visibilidade: Private (recomendado)
Inicializar com: README.md + Node.js .gitignore
```

### 1.2 Gerar Personal Access Token

```
1. GitHub.com > Settings (canto superior direito)
2. Developer settings > Personal access tokens > Tokens (classic)
3. Generate new token (classic)
4. Name: "MineHosting API"
5. Scopes: ☑️ repo + ☑️ codespace
6. Generate token
7. COPIE E GUARDE O TOKEN (não conseguirá ver novamente!)
```

**Token deve parecer:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚡ Passo 2: Configurar Projeto Local (5 min)

### 2.1 Clone o Repositório Template

```bash
git clone https://github.com/seu-usuario/minehosting-template.git
cd minehosting-template
```

### 2.2 Copie os Arquivos de Configuração

```bash
# Copie esses arquivos para seu repositório:
# - .devcontainer/devcontainer.json
# - package.json
# - server.js
# - database.js
```

### 2.3 Crie arquivo .env

```bash
# No diretório raiz, crie .env
echo "GITHUB_PAT=ghp_seu_token_aqui_123" > .env
echo "GITHUB_OWNER=seu-usuario-github" >> .env
echo "GITHUB_REPO=minehosting-template" >> .env
echo "PORT=3000" >> .env
```

### 2.4 Instale Dependências

```bash
npm install
```

---

## ⚡ Passo 3: Testar Localmente (4 min)

### 3.1 Inicie o Servidor

```bash
npm run dev
# Deveria ver:
# 🚀 Servidor rodando em http://localhost:3000
# 📁 Repositório: seu-usuario/minehosting-template
# 🔐 PAT configurado: Sim
```

### 3.2 Teste o Health Check

```bash
# Em outro terminal:
curl http://localhost:3000/health

# Resposta esperada:
# {"status":"Servidor rodando","timestamp":"2026-02-06T10:00:00Z"}
```

### 3.3 Teste Criando um Codespace

```bash
curl -X POST http://localhost:3000/api/codespaces/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seu-username-github",
    "userEmail": "seu@email.com",
    "machineType": "standardLinux8Core"
  }'

# Resposta esperada (201):
# {
#   "success": true,
#   "data": {
#     "id": "...",
#     "name": "...",
#     "webUrl": "https://seu-username-...-github.dev",
#     "state": "Creating"
#   }
# }
```

**Você deve ver uma URL como:**
```
https://seu-username-trusting-doberman-xyz123.github.dev
```

---

## ⚡ Passo 4: Integrar no HTML (3 min)

### 4.1 Adicione ao seu `registro.html`

No final do formulário, adicione:

```html
<button type="submit" id="submitBtn">
  Criar Conta & Servidor 🚀
</button>

<script>
  document.getElementById('submitBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('github').value;
    const email = document.getElementById('email').value;
    
    try {
      const res = await fetch('/api/codespaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          userEmail: email,
          machineType: 'standardLinux32GB'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Servidor criado! Abrindo...');
        window.location.href = data.data.webUrl;
      } else {
        alert('❌ Erro: ' + data.error);
      }
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  });
</script>
```

---

## 🎯 Checklist de Conclusão

- [ ] PAT gerado no GitHub
- [ ] Repositório template criado
- [ ] `.env` configurado com PAT
- [ ] `npm install` executado
- [ ] Servidor rodando lokalmente (`npm run dev`)
- [ ] Health check funcionando (`/health`)
- [ ] Conseguiu criar um Codespace com curl
- [ ] HTML integrado com button submit

---

## 🆘 Troubleshooting Rápido

### `Error: GITHUB_PAT não configurado`
```bash
# Verifique se .env existe
ls -la .env

# Teste se está sendo lido
node -e "require('dotenv').config(); console.log(process.env.GITHUB_PAT)"
# Deve imprimir: ghp_...
```

### `403 Forbidden - Insufficient Permission`
```bash
# Seu PAT não tem permissões
# 1. Vá em https://github.com/settings/tokens
# 2. Clique no seu token
# 3. Verifique se tem escopos: repo + codespace
# 4. Se não, delete e crie novo
```

### `404 Not Found - Repository`
```bash
# Verifique variáveis de ambiente
echo "GITHUB_OWNER=$GITHUB_OWNER"
echo "GITHUB_REPO=$GITHUB_REPO"

# Repita exatamente como no GitHub
# Ex: seu-usuario/minehosting-template (case-sensitive)
```

### `Codespace criado mas não aparece no painel`
```bash
# É normal! Espere 30-60 segundos
# Verifique com:
curl https://api.github.com/repos/seu-usuario/seu-repo/codespaces \
  -H "Authorization: token seu_token" | jq
```

---

## 📊 Next Steps (Próximas Semanas)

**Semana 1:** ✅ Setup básico (você está aqui)
- [ ] Funcionando em produção
- [ ] Banco de dados integrado
- [ ] Usuários persistindo

**Semana 2:** 
- [ ] Painel completo
- [ ] Deletar Codespaces
- [ ] Upgrade/Downgrade de máquinas

**Semana 3:**
- [ ] Cobrança via Stripe
- [ ] Alertas por email
- [ ] Rate limiting

**Semana 4:**
- [ ] Dashboard de analytics
- [ ] GitHub App (mais seguro que PAT)
- [ ] Backup automático

---

## 📞 Referências Rápidas

### Documentação
- [GitHub Codespaces API](https://docs.github.com/en/rest/codespaces)
- [Devcontainer.json Spec](https://containers.dev/)
- [Express.js Docs](https://expressjs.com/)

### Arquivos no Projeto
- **Servidor:** `server.js` (endpoints principais)
- **Banco de dados:** `database.js` (schema + query examples)
- **Testes:** `test-api.js` (suite de testes)
- **Documentação completa:** `GUIA_COMPLETO.md`
- **Arquitetura:** `ARQUITETURA.md` (fluxos visuais)

### Comandos Úteis

```bash
# Desenvolver
npm run dev

# Testar
node test-api.js

# Produção
npm start

# Limpar node_modules (se tiver problema)
rm -rf node_modules
npm install

# Ver logs do Git
git log --oneline

# Ver variáveis de ambiente
env | grep GITHUB
```

---

## ✅ Você conseguiu!

Se chegou até aqui:

1. ✅ Entendeu a arquitetura
2. ✅ Configurou o GitHub
3. ✅ Testou a API localmente
4. ✅ Integrou ao HTML

**Próximo passo:** Fazer deploy em produção (Railway, Heroku, etc.)

---

**Criado:** 2026-02-06
**Tempo estimado:** 15 minutos
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
