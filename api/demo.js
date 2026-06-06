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
    const prompt = `Tu es un expert en branding et naming pour startups françaises.
L'utilisateur veut créer ce projet : "${idee}"
Génère une identité de marque cohérente avec cette idée. Réponds UNIQUEMENT en JSON valide, sans markdown.

{
  "nom": "Nom de marque court et mémorable (1-2 mots, original, cohérent avec l'idée)",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan accrocheur en français (4-7 mots, percutant)",
  "initiales": "2 lettres majuscules du nom",
  "domaines": ["nommarque.fr", "nommarque.com", "nommarque.co"],
  "couleur_primaire": "#hexcode cohérent avec le secteur",
  "couleur_secondaire": "#hexcode complémentaire"
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
        max_tokens: 500,
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
