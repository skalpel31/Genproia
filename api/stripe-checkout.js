const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { priceId, planType, userEmail, userId } = req.body;

    if (!priceId || !planType || !userEmail || !userId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const PRICE_IDS = {
      oneshot:  'price_1Tg9BE8kY6t6gqGZtT8uQcfb',
      pro:      'price_1Tg9C78kY6t6gqGZZrDXAsjl',
      business: 'price_1Tg9D18kY6t6gqGZGxtG64SN'
    };

    if (priceId !== PRICE_IDS[planType]) {
      return res.status(400).json({ error: 'Price ID invalide' });
    }

    const isOneShot = planType === 'oneshot';

    const sessionParams = {
      payment_method_types: ['card'],
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planType: planType
      },
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: isOneShot ? 'payment' : 'subscription',
      success_url: `https://genproia.com/genproia-dashboard.html?payment=success&plan=${planType}`,
      cancel_url: `https://genproia.com/index.html?payment=cancelled`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ success: true, url: session.url, sessionId: session.id });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
