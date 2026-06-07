function getLogoIconPrompt(idee, nom) {
  const idea = (idee + ' ' + nom).toLowerCase();
  if (idea.includes('cbd') || idea.includes('cannabis') || idea.includes('chanvre'))
    return `Dessine une feuille de cannabis stylisée (5-7 folioles pointues) en blanc, centrée. Paths SVG précis, reconnaissable et élégante.`;
  if (idea.includes('bougie') || idea.includes('chandelle') || idea.includes('cire'))
    return `Dessine une flamme de bougie stylisée en blanc — forme de goutte inversée avec base rectangulaire. Élégant et minimaliste.`;
  if (idea.includes('restaurant') || idea.includes('repas') || idea.includes('food') || idea.includes('pizza') || idea.includes('burger'))
    return `Dessine une fourchette et couteau croisés en blanc, ou une cloche de restaurant stylisée.`;
  if (idea.includes('café') || idea.includes('coffee') || idea.includes('barista'))
    return `Dessine une tasse de café vue de côté avec vapeur stylisée (2-3 vagues) en blanc.`;
  if (idea.includes('fitness') || idea.includes('sport') || idea.includes('gym') || idea.includes('muscl') || idea.includes('coach'))
    return `Dessine un haltère stylisé en blanc — deux cercles reliés par une barre. Ou un éclair pour l'énergie.`;
  if (idea.includes('saas') || idea.includes('tech') || idea.includes('logiciel') || idea.includes('app') || idea.includes('digital'))
    return `Dessine des accolades { } stylisées en blanc, ou un circuit abstrait. Style tech moderne.`;
  if (idea.includes('immo') || idea.includes('maison') || idea.includes('appart'))
    return `Dessine une maison stylisée en blanc — toit triangulaire, porte rectangulaire. Minimaliste.`;
  if (idea.includes('mode') || idea.includes('vêtement') || idea.includes('fashion') || idea.includes('street') || idea.includes('hype') || idea.includes('urban'))
    return `Dessine une forme géométrique abstraite moderne en blanc — losange, hexagone, ou forme unique évoquant le style urbain. PAS de cintre.`;
  if (idea.includes('voyage') || idea.includes('tourisme') || idea.includes('hotel'))
    return `Dessine une boussole stylisée en blanc, ou un avion en papier origami.`;
  if (idea.includes('bio') || idea.includes('naturel') || idea.includes('plante') || idea.includes('organic') || idea.includes('vegan'))
    return `Dessine une feuille simple ou bourgeon stylisé en blanc — formes courbes naturelles.`;
  if (idea.includes('bijou') || idea.includes('joaill') || idea.includes('luxe') || idea.includes('premium'))
    return `Dessine un diamant géométrique stylisé en blanc — hexagone avec facettes. Élégant et luxueux.`;
  if (idea.includes('musique') || idea.includes('music') || idea.includes('studio'))
    return `Dessine une note de musique stylisée en blanc, ou des ondes sonores abstraites.`;
  if (idea.includes('beauté') || idea.includes('cosmétique') || idea.includes('soin') || idea.includes('spa'))
    return `Dessine une fleur stylisée à 5 pétales en blanc, ou un cristal/diamant.`;
  return `Dessine une forme géométrique abstraite, moderne et unique en blanc — hexagone, pentagone, ou forme custom reflétant la marque "${nom}".`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { nom, initiales, couleur1, couleur2, idee } = req.body;
  if (!nom) return res.status(400).json({ error: 'Nom manquant' });

  const c1 = couleur1 || '#7c3aed';
  const c2 = couleur2 || '#ec4899';
  const init = (initiales || nom.substring(0, 2)).toUpperCase();
  const uid = Date.now().toString(36);
  const iconPrompt = getLogoIconPrompt(idee || nom, nom);

  const prompt = `Tu es un designer logo professionnel. Crée un logo SVG haute qualité pour la marque "${nom}".

SPÉCIFICATIONS TECHNIQUES :
- viewBox="0 0 100 100", width="100", height="100"
- Fond : rect 100x100 rx="18" avec dégradé de ${c1} (0%) à ${c2} (100%), diagonal
- ID gradient unique : "grad_${uid}"

ICÔNE (zone 20-65% de la hauteur, centrée horizontalement) :
${iconPrompt}
- L'icône doit être en blanc (fill="white")
- Taille : environ 35-40px de hauteur, centrée à x=50
- Utilise des paths SVG réels, pas d'emoji

TEXTE :
- Le nom "${nom}" en bas (y≈82), centré (text-anchor="middle" x="50")
- font-family="Arial,sans-serif" font-weight="800" font-size="${nom.length > 8 ? '9' : nom.length > 5 ? '11' : '13'}" fill="white" letter-spacing="1"

STYLE : flat design, minimaliste, professionnel, style startup moderne.

Réponds UNIQUEMENT avec le code SVG complet commençant par <svg, sans markdown.`;

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim() || '';
    const match = text.match(/<svg[\s\S]*<\/svg>/);

    if (match) {
      return res.status(200).json({ success: true, svg: match[0], type: 'svg' });
    }
    throw new Error('SVG non trouvé');

  } catch(e) {
    console.error('generate-logo error:', e.message);
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs><linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="18" fill="url(#g${uid})"/>
  <rect x="10" y="10" width="80" height="80" rx="12" fill="rgba(255,255,255,0.1)"/>
  <text x="50" y="52" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${init.length > 2 ? '24' : '30'}" fill="white">${init}</text>
  <text x="50" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-weight="600" font-size="8" fill="rgba(255,255,255,0.8)">${nom.toUpperCase()}</text>
</svg>`;
    return res.status(200).json({ success: true, svg: fallback, type: 'svg' });
  }
};
