// api/subscription/get.js - Buscar informações de assinatura do usuário
module.exports = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username obrigatório' });
    }

    console.log(`[Subscription] Buscando assinatura para ${username}`);

    // Aqui você consultaria o banco de dados
    // Por enquanto, simulando dados
    
    // Simulando busca
    const subscription = {
      username,
      plan: 'pro', // Padrão: Pro
      price: 25,
      startDate: new Date().toISOString(),
      status: 'active',
      nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      features: {
        starter: [
          'Até 5 servidores',
          'Suporte por email',
          '10GB de armazenamento'
        ],
        pro: [
          'Até 20 servidores',
          'Suporte prioritário',
          '100GB de armazenamento',
          'Backup automático'
        ],
        ultimate: [
          'Servidores ilimitados',
          'Suporte 24/7',
          'Armazenamento ilimitado',
          'Backup automático',
          'Gerenciador dedicado',
          'API customizada'
        ]
      }
    };

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('[Subscription Error]', error.message);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
};
