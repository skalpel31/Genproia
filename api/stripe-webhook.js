const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {

      // Paiement one-shot réussi
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;

        if (!userId || !planType) break;

        if (planType === 'oneshot') {
          await supabase.from('users').update({
            plan: 'oneshot',
            stripe_customer_id: session.customer || null
          }).eq('id', userId);
        } else {
          // Pour pro et business, on attend checkout.session.completed + subscription active
          await supabase.from('users').update({
            plan: planType,
            stripe_customer_id: session.customer || null,
            stripe_subscription_id: session.subscription || null
          }).eq('id', userId);
        }
        break;
      }

      // Abonnement renouvelé avec succès
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        if (!customerId) break;

        const { data: users } = await supabase
          .from('users')
          .select('id, plan')
          .eq('stripe_customer_id', customerId);

        if (users && users.length > 0) {
          // Renouvellement OK — on ne change rien mais on pourrait logger
          console.log(`Renouvellement OK pour customer ${customerId}`);
        }
        break;
      }

      // Paiement échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        if (!customerId) break;

        await supabase.from('users').update({
          plan: 'free'
        }).eq('stripe_customer_id', customerId);
        break;
      }

      // Abonnement annulé
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        if (!customerId) break;

        await supabase.from('users').update({
          plan: 'free',
          stripe_subscription_id: null
        }).eq('stripe_customer_id', customerId);
        break;
      }

      // Abonnement mis à jour (upgrade/downgrade)
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        if (!customerId) break;

        const priceId = subscription.items?.data?.[0]?.price?.id;
        const PRICE_TO_PLAN = {
          'price_1Tg0UUBMjR8Z8byn0XzIni0i': 'pro',
          'price_1Tg0UuBMjR8Z8bynrr8zrlz6': 'business'
        };
        const newPlan = PRICE_TO_PLAN[priceId];
        if (!newPlan) break;

        await supabase.from('users').update({
          plan: newPlan
        }).eq('stripe_customer_id', customerId);
        break;
      }

      default:
        console.log(`Event non géré: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Helper pour lire le raw body (nécessaire pour Stripe signature)
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(Buffer.from(data)));
    req.on('error', reject);
  });
}
