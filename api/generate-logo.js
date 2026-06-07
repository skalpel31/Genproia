module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { nom, initiales, couleur1, couleur2 } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom manquant' });

  const c1 = couleur1 || '#7c3aed';
  const c2 = couleur2 || '#ec4899';
  const init = (initiales || nom.substring(0, 2)).toUpperCase();

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
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Crée un logo SVG professionnel et moderne pour une marque nommée "${nom}" (initiales: ${init}).
Couleur primaire: ${c1}, couleur secondaire: ${c2}.
Le SVG doit faire exactement 48x48px avec viewBox="0 0 48 48".
Règles importantes :
- Fond avec dégradé entre les 2 couleurs
- Formes géométriques créatives et élégantes (pas juste un rectangle)
- Les initiales "${init}" en blanc, bien centrées, police bold
- Coins arrondis (rx="10" à "14")
- Peut inclure une petite forme/icône abstraite liée au secteur
- Utilise des IDs SVG uniques (ex: grad_${init.toLowerCase()})
- Sobre, professionnel, moderne — style startup tech
Réponds UNIQUEMENT avec le code SVG complet commençant par <svg, rien d'autre, pas de markdown.`
        }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim() || '';
    const match = text.match(/<svg[\s\S]*<\/svg>/);

    if (match) {
      return res.status(200).json({ success: true, svg: match[0] });
    } else {
      throw new Error('SVG non trouvé dans la réponse');
    }
  } catch(e) {
    console.error('generate-logo error:', e);
    // Fallback SVG propre
    const uid = Math.random().toString(36).substring(2, 8);
    const fallback = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="12" fill="url(#g${uid})"/>
  <rect x="6" y="6" width="36" height="36" rx="9" fill="rgba(255,255,255,0.12)"/>
  <text x="24" y="31" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="${init.length > 2 ? '12' : '15'}" fill="white" letter-spacing="1">${init}</text>
</svg>`;
    return res.status(200).json({ success: true, svg: fallback });
  }
};
