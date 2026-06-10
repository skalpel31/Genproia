module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { idee } = req.body;
  if (!idee || idee.trim().length < 3) {
    return res.status(400).json({ error: 'Idée trop courte' });
  }

  try {
    const prompt = `Tu es un expert en branding, naming et identité visuelle pour startups françaises. Tu as un sens aigu du design et de l'originalité.

L'utilisateur veut créer ce projet : "${idee}"

RÈGLES ABSOLUES pour le naming :
- Le nom doit être UNIQUE, mémorable, jamais générique
- INTERDIT : NovaBrand, FlowTech, SmartShop, EasyX, ProX, MaxX, BestX, TopX, QuickX — tout ce qui ressemble à ces noms trop communs
- Privilégie des noms inventés, des contrastes, des associations inattendues
- 1-2 mots max, prononçable, qui évoque l'univers du projet sans être littéral
- Exemples de bons noms : Figma, Notion, Stripe, Zara, Oura, Graze, Glow, Veed, Pitch, Loom
- Le slogan doit être percutant, spécifique au projet, jamais générique

COULEURS : choisir des couleurs cohérentes avec le secteur et l'émotion voulue :
- Luxe/premium → noir, or, bordeaux, bleu marine
- Tech/SaaS → violet, bleu électrique, indigo
- Food/restaurant → rouge brique, orange chaud, vert olive
- Beauté/bien-être → rose poudré, lavande, nude
- Sport/fitness → orange vif, noir, rouge
- Nature/bio → vert forêt, beige, terre cuite
- Finance/legal → bleu marine, gris anthracite, or

Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après :
{
  "nom": "Nom original et mémorable (jamais générique)",
  "nom_alternatives": ["Alternative créative 1", "Alternative créative 2"],
  "slogan": "Slogan spécifique et percutant (4-7 mots)",
  "initiales": "2 lettres majuscules",
  "domaines": ["nommarque.fr", "nommarque.com", "nommarque.co"],
  "couleur_primaire": "#hexcode adapté au secteur",
  "couleur_secondaire": "#hexcode complémentaire et harmonieux"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 600,
        temperature: 1, // Maximum créativité
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Demo error:', err);
    return res.status(500).json({ error: 'Erreur IA' });
  }
};
