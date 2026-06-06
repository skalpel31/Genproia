module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message manquant' });

  const systemPrompt = `Tu es l'assistant commercial de Genproia, une plateforme IA qui transforme une idée en business complet en quelques minutes (nom de marque, logo, slogan, domaine, site web, paiements Stripe).

Ton rôle : convaincre le visiteur de créer son compte gratuit et d'essayer Genproia.

Ce que fait Genproia :
- Entre son idée → Genproia génère un nom de marque, slogan, logo, domaine suggéré
- Génère un site web complet (e-commerce, SaaS, vitrine, landing page)
- Intègre Stripe pour les paiements
- Plan gratuit disponible (1 projet), Pro à 29€/mois, Business à 79€/mois

Règles :
- Réponds en français, sois chaleureux et enthousiaste
- Réponses courtes (2-4 phrases max)
- Si l'utilisateur parle d'une idée, encourage-le et propose de la tester dans la démo
- Termine souvent par un call-to-action vers l'inscription gratuite
- Ne fais jamais de promesses fausses sur les fonctionnalités`;

  const messages = [
    ...(history || []).slice(-6),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, reply: data.content[0].text.trim() });
  } catch(err) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
