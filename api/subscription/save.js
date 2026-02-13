// api/subscription/save.js - Salvar informações de assinatura
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { username, plan, price, email } = req.body;

    if (!username || !plan || !price) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    console.log(`[Subscription] Salvando ${plan} para ${username}`);

    // Aqui você poderia salvar em um banco de dados
    // Por enquanto, vamos retornar sucesso
    // Em produção: usar PostgreSQL, MongoDB, etc

    // Validar dados
    const validPlans = ['starter', 'pro', 'ultimate'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    // Simulando salvamento (em produção seria em DB)
    const subscriptionData = {
      username,
      plan,
      price,
      email,
      startDate: new Date().toISOString(),
      status: 'active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log(`[Subscription] ✓ Assinatura criada:`, subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Assinatura salva com sucesso',
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('[Subscription Error]', error.message);
    res.status(500).json({ error: 'Erro ao salvar assinatura' });
  }
};
