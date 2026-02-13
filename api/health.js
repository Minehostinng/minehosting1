// api/health.js - Simple health check endpoint
module.exports = (req, res) => {
  res.status(200).json({
    status: 'Servidor rodando',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    endpoint: '/health'
  });
};
