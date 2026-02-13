#!/bin/bash

# ============================================================
# 🚀 DEPLOY SCRIPT - MineHosting para Vercel
# ============================================================
# Use este script para automatizar o deploy
# 
# Uso: bash deploy.sh
#

set -e  # Exit on error

echo "🎮 MineHosting - Deploy Script"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env não encontrado!"
    echo "Criando a partir de .env.example..."
    cp .env.example .env
    echo "✓ .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais GitHub!"
    echo "Depois execute este script novamente."
    exit 1
fi

# Check if vercel.json exists
if [ ! -f vercel.json ]; then
    echo "❌ vercel.json não encontrado!"
    exit 1
fi

echo "✓ Configurações encontradas"
echo ""

# Install dependencies
echo "📦 Instalando dependências..."
npm install > /dev/null 2>&1
echo "✓ Dependências instaladas"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Instalando Vercel CLI..."
    npm install -g vercel > /dev/null 2>&1
    echo "✓ Vercel CLI instalado"
    echo ""
fi

# Deploy
echo "🚀 Iniciando deploy para Vercel..."
echo ""

# Check if logged in
if ! vercel whoami > /dev/null 2>&1; then
    echo "🔐 Você precisa fazer login no Vercel"
    vercel login
fi

# Deploy to production
vercel --prod --env-file .env

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Próximos passos:"
echo "1. Acesse: https://minehosting-seven.vercel.app/login.html"
echo "2. Clique em 'Conectar com GitHub'"
echo "3. Autorize e pronto! 🎉"
echo ""
echo "📚 Documentação: docs/PASSO_A_PASSO.md"
