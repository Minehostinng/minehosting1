// api/[...].js - Capture all routes and delegate to Express app
const serverApp = require('./server');

// Vercel serverless function handler
module.exports = serverApp;
