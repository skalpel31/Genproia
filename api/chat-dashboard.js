const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token invalide' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message manquant' });

  // Charger les projets de l'utilisateur
  let projets = [];
  try {
    const { data } = await supabase.from('projets').select('id,nom,slogan,type,domaine,couleur_primaire,couleur_secondaire,statut,idee').eq('user_id', user.id).order('created_at', { ascending: false });
    projets = data || [];
  } catch(e) {}

  const systemPrompt = `Tu es l'assistant IA de Genproia, une plateforme qui génère des businesses complets avec l'IA.
Tu aides l'utilisateur à gérer ses projets et à utiliser Genproia.

Projets de l'utilisateur :
${projets.length === 0 ? 'Aucun projet encore généré.' : projets.map(p => `- ${p.nom} (${p.type}) — ${p.idee?.substring(0,50)} — Domaine: ${p.domaine || 'non défini'} — Statut: ${p.statut}`).join('\n')}

Tu peux :
- Répondre aux questions sur Genproia et ses fonctionnalités
- Aider l'utilisateur à comprendre ses projets
- Suggérer des améliorations pour ses projets
- Expliquer comment utiliser les différentes fonctionnalités

Si l'utilisateur demande à modifier un projet (changer couleur, slogan, nom de domaine etc.), réponds en JSON avec ce format UNIQUEMENT si une modification est demandée :
{"action": "modifier_projet", "projet_id": "ID_DU_PROJET", "champ": "nom|slogan|domaine|statut", "valeur": "nouvelle_valeur", "message": "Ta réponse à afficher"}

Sinon réponds normalement en français, de manière concise et amicale. Tu t'appelles Genproia IA.`;

  const messages = [
    ...(history || []),
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
        max_tokens: 1000,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Vérifier si c'est une action de modification
    try {
      const jsonMatch = text.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (jsonMatch) {
        const action = JSON.parse(jsonMatch[0]);
        if (action.action === 'modifier_projet' && action.projet_id && action.champ && action.valeur) {
          const updateData = {};
          updateData[action.champ] = action.valeur;
          await supabase.from('projets').update(updateData).eq('id', action.projet_id).eq('user_id', user.id);
          return res.status(200).json({ success: true, reply: action.message || 'Modification effectuée !', action });
        }
      }
    } catch(e) {}

    return res.status(200).json({ success: true, reply: text });
  } catch(err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
