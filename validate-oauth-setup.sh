#!/bin/bash

# Script para validar a configuração de OAuth do GitHub

echo "🔍 Validando Configuração de OAuth do GitHub"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar arquivo .env
echo "📋 Verificando arquivo .env..."
if [ ! -f .env ]; then
    echo -e "${RED}✗ Arquivo .env não encontrado${NC}"
    exit 1
fi

# Verificar variáveis necessárias
echo ""
echo "🔐 Verificando variáveis de ambiente..."

# Função para verificar variável
check_var() {
    local var_name=$1
    if grep -q "^${var_name}=" .env; then
        local var_value=$(grep "^${var_name}=" .env | cut -d'=' -f2)
        if [ -z "$var_value" ] || [ "$var_value" = "seu_client_id_aqui" ] || [ "$var_value" = "seu_client_secret_aqui" ] || [ "$var_value" = "seu_secret_aleatorio_muito_seguro_aqui" ]; then
            echo -e "${YELLOW}⚠ $var_name: Configurado mas com valor padrão${NC}"
            return 1
        else
            echo -e "${GREEN}✓ $var_name: Configurado${NC}"
            return 0
        fi
    else
        echo -e "${RED}✗ $var_name: Não encontrado${NC}"
        return 1
    fi
}

check_var "GITHUB_CLIENT_ID"
check_var "GITHUB_CLIENT_SECRET"
check_var "SESSION_SECRET"
check_var "CALLBACK_URL"

echo ""
echo "📦 Verificando dependências..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules não encontrado. Execute: npm install${NC}"
else
    # Verificar se as dependências estão instaladas
    if [ -d "node_modules/passport" ]; then
        echo -e "${GREEN}✓ passport: Instalado${NC}"
    else
        echo -e "${RED}✗ passport: Não instalado${NC}"
    fi

    if [ -d "node_modules/passport-github2" ]; then
        echo -e "${GREEN}✓ passport-github2: Instalado${NC}"
    else
        echo -e "${RED}✗ passport-github2: Não instalado${NC}"
    fi

    if [ -d "node_modules/express-session" ]; then
        echo -e "${GREEN}✓ express-session: Instalado${NC}"
    else
        echo -e "${RED}✗ express-session: Não instalado${NC}"
    fi
fi

echo ""
echo "📁 Verificando arquivos..."

# Verificar arquivos essenciais
if [ -f "js/server.js" ]; then
    echo -e "${GREEN}✓ js/server.js: Existe${NC}"
else
    echo -e "${RED}✗ js/server.js: Não existe${NC}"
fi

if [ -f "login.html" ]; then
    echo -e "${GREEN}✓ login.html: Existe${NC}"
else
    echo -e "${RED}✗ login.html: Não existe${NC}"
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json: Existe${NC}"
else
    echo -e "${RED}✗ package.json: Não existe${NC}"
fi

echo ""
echo "🎯 Checklist de Configuração:"
echo "=============================="
echo ""
echo "${YELLOW}ANTES DE INICIAR O SERVIDOR:${NC}"
echo ""
echo "1. [ ] Acessar https://github.com/settings/developers"
echo "2. [ ] Clicar em 'OAuth Apps' → 'New OAuth App'"
echo "3. [ ] Preencher:"
echo "       - Application name: MineHosting"
echo "       - Homepage URL: http://localhost:3000"
echo "       - Authorization callback URL: http://localhost:3000/auth/github/callback"
echo "4. [ ] Copiar Client ID para GITHUB_CLIENT_ID no .env"
echo "5. [ ] Gerar Client Secret e copiar para GITHUB_CLIENT_SECRET no .env"
echo "6. [ ] Salvar arquivo .env"
echo ""
echo "${YELLOW}PARA INICIAR:${NC}"
echo ""
echo "  npm start"
echo ""
echo "${YELLOW}ENTÃO TESTAR:${NC}"
echo ""
echo "  http://localhost:3000/login.html"
echo ""
echo "---"
echo "✅ Se tudo está ${GREEN}verde${NC}, você está pronto!"
echo ""
