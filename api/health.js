// api/health.js - Simple health check
module.exports = (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor respondendo'
  });
};
