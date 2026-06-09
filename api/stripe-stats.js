const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Vérifier que c'est un admin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token invalide' });

  const ADMIN_EMAILS = ['alex.skp31@gmail.com'];
  if (!ADMIN_EMAILS.includes(user.email)) return res.status(403).json({ error: 'Accès refusé' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Récupérer les paiements du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startTimestamp = Math.floor(startOfMonth.getTime() / 1000);

    // Charges réussies ce mois
    const charges = await stripe.charges.list({
      created: { gte: startTimestamp },
      limit: 100
    });

    const successfulCharges = charges.data.filter(c => c.status === 'succeeded' && !c.refunded);
    const mrrThisMonth = successfulCharges.reduce((sum, c) => sum + c.amount, 0) / 100;

    // Total de tous les paiements réussis
    const allCharges = await stripe.charges.list({ limit: 100 });
    const totalRevenue = allCharges.data
      .filter(c => c.status === 'succeeded' && !c.refunded)
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    // Abonnements actifs
    const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    const activeSubs = subscriptions.data.length;

    // MRR depuis les abonnements actifs
    const mrr = subscriptions.data.reduce((sum, sub) => {
      const item = sub.items.data[0];
      if (!item) return sum;
      const price = item.price;
      if (price.recurring?.interval === 'month') return sum + price.unit_amount / 100;
      if (price.recurring?.interval === 'year') return sum + price.unit_amount / 100 / 12;
      return sum;
    }, 0);

    // Derniers paiements
    const recentPayments = charges.data.slice(0, 10).map(c => ({
      amount: c.amount / 100,
      currency: c.currency,
      email: c.billing_details?.email || c.receipt_email || '—',
      date: new Date(c.created * 1000).toLocaleDateString('fr-FR'),
      status: c.status,
      description: c.description || 'Paiement'
    }));

    return res.status(200).json({
      success: true,
      mrr: Math.round(mrr * 100) / 100,
      mrrThisMonth: Math.round(mrrThisMonth * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeSubs,
      recentPayments
    });

  } catch (err) {
    console.error('Stripe stats error:', err);
    return res.status(500).json({ error: err.message });
  }
};
