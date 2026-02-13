# 🎯 Sistema de Assinatura - Guia Completo

## 📋 O que foi implementado

### 1. **Fluxo de Login → Pagamento → Área do Cliente**

```
Usuário faz Login
        ↓
Servidor GitHub OAuth
        ↓
Redirecionador para `/pagamento.html` com dados do usuário
        ↓
Usuário seleciona um plano (Starter, Pro, Ultimate)
        ↓
Clica em "Finalizar Compra"
        ↓
Sistema salva o plano via `/api/subscription/save`
        ↓
Redirecionador para `/cliente.html` com dados do plano
        ↓
Área do cliente mostra o plano ativo e benefícios
```

---

## 🔧 Componentes Criados

### **1. API de Assinatura**

#### `/api/subscription/save.js`
- **POST** `/api/subscription/save`
- **Recebe**: `username`, `plan` (starter|pro|ultimate), `price`, `email`
- **Faz**: Salva informações de assinatura do usuário
- **Retorna**: Confirmação + dados de assinatura criada

**Exemplo de requisição:**
```javascript
fetch('/api/subscription/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'seu-usuario',
    plan: 'pro',
    price: 25,
    email: 'seu-email@example.com'
  })
})
```

#### `/api/subscription/get.js`
- **GET** `/api/subscription/get?username=seu-usuario`
- **Retorna**: Plano atual, preço, status, próxima data de cobrança, benefícios

**Exemplo de requisição:**
```javascript
fetch('/api/subscription/get?username=seu-usuario')
  .then(res => res.json())
  .then(data => console.log(data.subscription))
```

---

### **2. Gerenciador de Assinatura (Frontend)**

#### `/js/subscription.js`
Classe `SubscriptionManager` que:
- ✅ Detecta cliques nos planos
- ✅ Armazena o plano selecionado
- ✅ Envia para API de salvamento
- ✅ Exibe notificações de sucesso/erro
- ✅ Redireciona para área do cliente

**Uso automático** - Carrega quando a página `pagamento.html` é aberta

---

### **3. Área do Cliente**

#### `/cliente.html` - Dashboard completo
Página personalizada do cliente com:

**🎨 Menu Lateral**
- 📊 Visão Geral
- 📋 Meu Plano
- 🖥️ Meus Servidores
- 💳 Faturamento
- 🆘 Suporte
- 🚪 Logout

**👤 Perfil do Usuário**
- Avatar (do GitHub)
- Nome completo
- Email
- Botão de logout

**📊 Seção de Visão Geral**
- Plano atual (Starter/Pro/Ultimate)
- Preço mensal
- Data da próxima cobrança
- Botão para mudar de plano

**📋 Informações do Plano**
- Card com benefícios do plano
- Status (Ativo)
- Data de início
- Data da próxima cobrança
- Botão para mudar de plano

**🖥️ Meus Servidores**
- Mostra servidores já criados
- Opção de criar novo servidor

**💳 Faturamento**
- Histórico de transações

**🆘 Suporte**
- Email de suporte
- Discord
- Página de status

---

## 🌊 Fluxo Atualizado

### **1. Login (sem mudança)**
```
/login.html → Clica em "Login com GitHub"
           → Redireciona para GitHub OAuth
```

### **2. Callback (MODIFICADO)**
```
GitHub OAuth → /api/auth/callback
            → Cria repositório automático
            → Redireciona para /pagamento.html com parâmetros:
                - name (nome do usuário)
                - username (login GitHub)
                - email (email do GitHub)
                - avatar (avatar profissional)
```

### **3. Seleção de Plano (NOVO)**
```
/pagamento.html → Mostra 3 planos com dados do usuário na navbar
                → Usuário clica em um plano (qual for)
                → Clica em "Finalizar Compra"
                → JavaScript chama subscriptionManager.savePlan()
                → POST para /api/subscription/save
                → Salva o plano
                → Redireciona para /cliente.html
```

### **4. Área do Cliente (NOVO)**
```
/cliente.html → Carrega dados do usuário (URL params)
              → Chama /api/subscription/get
              → Exibe plano, benefícios, status
              → Permite mudar para área de servidores
              → Permite logout
```

---

## 📊 Estrutura de Dados

### **Planos Disponíveis**

| Plano | Preço | Cores CPU | RAM | SSD | Jogadores | Benefícios Extras |
|-------|-------|-----------|-----|-----|-----------|------------------|
| Starter | R$ 15/mês | 2 | 4GB DDR5 | 10GB NVMe | 20 | - |
| Pro | R$ 25/mês | 2 | 8GB DDR5 | 20GB NVMe | 30 | Suporte a Mods |
| Ultimate | R$ 35/mês | 4 | 16GB DDR5 | 30GB NVMe | 50 | Suporte a Mods |

### **Campos de Assinatura**
```javascript
{
  username: 'seu-usuario',
  plan: 'pro',
  price: 25,
  email: 'seu-email@example.com',
  startDate: '2024-02-13T20:30:00Z',
  status: 'active',
  nextBillingDate: '2024-03-13T20:30:00Z'
}
```

---

## 🔗 URLs Importantes

| URL | Descrição |
|-----|-----------|
| `/login.html` | Página de login |
| `/pagamento.html` | Seleção de plano |
| `/cliente.html` | Área do cliente (dashboard) |
| `/api/auth/github` | Iniciar autenticação GitHub |
| `/api/auth/callback` | Callback do GitHub OAuth |
| `/api/subscription/save` | Salvar assinatura |
| `/api/subscription/get` | Buscar assinatura atual |

---

## 💻 Como Testar

### **1. Testar Localmente**
```bash
npm start
# Acessar: http://localhost:3000
```

### **2. Testar em Produção (Vercel)**
```bash
git push
# O Vercel faz deploy automático
# Acessar: https://minehosting-seven.vercel.app
```

### **3. Fluxo de Teste Completo**

1. **Acesse** `/login.html`
2. **Clique** em "Login com GitHub"
3. **Autorize** no GitHub
4. **Você será redirecionado** para `/pagamento.html`
5. **Selecione um plano** (clique em uma das opções)
6. **Clique** em "Finalizar Compra"
7. **Verá uma notificação** de sucesso
8. **Será redirecionado** para `/cliente.html`
9. **Seu plano** será exibido no dashboard

---

## 🔐 Segurança

### **Dados Armazenados**
- ✅ Dados básicos do usuário (via URL durante sessão)
- ⚠️ **IMPORTANTE**: Dados de assinatura devem ser salvos em banco de dados real!
- ✅ GitHub OAuth garante autenticação segura

### **Próximas Etapas Recomendadas**
1. Integrar com banco de dados (PostgreSQL/MongoDB/Supabase)
2. Implementar sessões persistentes
3. Adicionar proteção contra fraudes
4. Implementar verificação de pagamento com Stripe/PagSeguro

---

## 📝 Arquivos Modificados

### Criados
- `/api/subscription/save.js` - API para salvar plano
- `/api/subscription/get.js` - API para buscar plano
- `/js/subscription.js` - Gerenciador de assinatura (frontend)
- `/cliente.html` - Área do cliente (dashboard)

### Modificados
- `/pagamento.html` - Adicionado script de subscription + navbar dinâmica
- `/api/auth/callback.js` - Mudou redirecionamento para `/pagamento.html`

---

## 🎯 Próximas Funcionalidades

- [ ] Banco de dados real para persistência de dados
- [ ] Integração com gateway de pagamento (Stripe/PagSeguro)
- [ ] Sistema de cobrança automática
- [ ] Histórico de transações
- [ ] Suporte a cancelamento de assinatura
- [ ] Sistema de múltiplos servidores por usuário
- [ ] Painel de administração
- [ ] Relatórios de faturamento

---

## ❓ Dúvidas?

Consulte a documentação completa em `GUIA_RAPIDO.md` ou entre em contato com o suporte.
