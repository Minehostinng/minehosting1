// api/[...].js - Route handler para todas as requisições
const http = require('http');
const serverApp = require('./server');

// Criar um servidor que o Vercel pode executar
const server = http.createServer(serverApp);

// Handler para Vercel - retorna a aplicação Express
module.exports = serverApp;
