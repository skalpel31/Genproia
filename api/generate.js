const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Vérifier token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token invalide ou expiré' });

  const { idee, type } = req.body;
  if (!idee || idee.trim().length < 10) {
    return res.status(400).json({ error: 'Décris ton idée en au moins 10 caractères.' });
  }

  // Vérifier plan
  const { data: userData } = await supabase
    .from('users')
    .select('plan, projets_count')
    .eq('id', user.id)
    .single();

  if (userData?.plan === 'free' && userData?.projets_count >= 1) {
    return res.status(403).json({
      error: 'Limite atteinte',
      message: 'Le plan gratuit permet 1 génération. Passe au plan Pro.',
      upgrade: true
    });
  }

  const typeLabel = {
    ecommerce: 'e-commerce (boutique en ligne avec catalogue, panier, paiement Stripe)',
    saas: 'SaaS (abonnements, dashboard utilisateur, super admin)',
    vitrine: 'site vitrine professionnel (présentation, contact, services)',
    landing: 'landing page (capture de leads, conversion, CTA)',
    marketplace: 'marketplace (multi-vendeurs, commissions)',
    blog: 'blog / média (articles, monétisation, newsletter)'
  }[type] || 'site web complet';

  const prompt = `Tu es Genproia, un générateur de business complet propulsé par l'IA.

L'utilisateur veut créer un ${typeLabel}.
Son idée : "${idee}"

Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après :

{
  "nom": "Nom de marque court et mémorable (1-2 mots)",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan percutant en français (5-8 mots)",
  "description": "Description du business en 2 phrases",
  "type": "${type || 'ecommerce'}",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.io"],
  "secteur": "secteur en 2-3 mots",
  "cible": "cible client en 1 phrase courte",
  "fonctionnalites": ["Fonctionnalité 1", "Fonctionnalité 2", "Fonctionnalité 3", "Fonctionnalité 4"],
  "site_html": "CODE HTML COMPLET — navigation, hero, features, pricing 3 plans, footer, CSS dans style, responsive, tout en français, minimum 200 lignes"
}`;

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'Erreur IA. Réessaie dans quelques secondes.' });
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('JSON parse error:', e.message, '| Raw:', text.substring(0, 200));
      return res.status(500).json({ error: 'Erreur de format IA. Réessaie.' });
    }

    // Sauvegarder dans Supabase
    const { data: projet, error: projetError } = await supabase.from('projets').insert({
      user_id: user.id,
      nom: result.nom,
      slogan: result.slogan,
      logo_initiales: result.logo_initiales,
      couleur_primaire: result.couleur_primaire,
      couleur_secondaire: result.couleur_secondaire,
      domaine: result.domaines?.[0],
      type: result.type,
      idee: idee,
      site_html: result.site_html,
      statut: 'generated',
      created_at: new Date().toISOString()
    }).select().single();

    if (!projetError && projet) {
      result.projet_id = projet.id;
      await supabase.from('users').update({
        projets_count: (userData?.projets_count || 0) + 1
      }).eq('id', user.id);
    }

    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
};
