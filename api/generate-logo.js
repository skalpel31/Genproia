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
  const idea = (idee || nom).toLowerCase();

  // Détecter le secteur pour guider l'icône
  let iconeGuide = '';
  if (idea.includes('cbd') || idea.includes('cannabis') || idea.includes('chanvre')) {
    iconeGuide = 'Crée une feuille de cannabis stylisée (5 folioles pointues) comme icône principale. La feuille doit être reconnaissable et élégante.';
  } else if (idea.includes('bougie') || idea.includes('chandelle') || idea.includes('cire')) {
    iconeGuide = 'Crée une flamme de bougie stylisée comme icône principale. Forme de goutte inversée pour la flamme, élégante et moderne.';
  } else if (idea.includes('restaurant') || idea.includes('food') || idea.includes('repas') || idea.includes('cuisine')) {
    iconeGuide = 'Crée une fourchette et couteau croisés stylisés, ou une assiette avec une étoile, comme icône principale.';
  } else if (idea.includes('café') || idea.includes('coffee') || idea.includes('barista')) {
    iconeGuide = 'Crée une tasse de café avec de la vapeur stylisée comme icône principale.';
  } else if (idea.includes('fitness') || idea.includes('sport') || idea.includes('gym') || idea.includes('muscl')) {
    iconeGuide = 'Crée un haltère ou un éclair stylisé comme icône principale, dynamique et énergique.';
  } else if (idea.includes('tech') || idea.includes('saas') || idea.includes('logiciel') || idea.includes('app')) {
    iconeGuide = 'Crée un éclair ou un circuit stylisé, ou des accolades {}, comme icône principale tech et moderne.';
  } else if (idea.includes('immo') || idea.includes('maison') || idea.includes('appart')) {
    iconeGuide = 'Crée une maison stylisée avec toit triangulaire et porte, simple et élégante.';
  } else if (idea.includes('mode') || idea.includes('vêtement') || idea.includes('fashion')) {
    iconeGuide = 'Crée un cintre stylisé ou une silhouette de robe/veste abstraite comme icône principale.';
  } else if (idea.includes('voyage') || idea.includes('tourisme') || idea.includes('hotel')) {
    iconeGuide = 'Crée un avion stylisé ou une boussole abstraite comme icône principale.';
  } else if (idea.includes('musique') || idea.includes('studio') || idea.includes('music')) {
    iconeGuide = 'Crée une note de musique ou des ondes sonores stylisées comme icône principale.';
  } else if (idea.includes('photo') || idea.includes('photographe')) {
    iconeGuide = 'Crée un objectif photo ou un appareil stylisé comme icône principale.';
  } else if (idea.includes('bijou') || idea.includes('joaill') || idea.includes('luxe')) {
    iconeGuide = 'Crée un diamant ou un anneau stylisé comme icône principale, élégant et luxueux.';
  } else if (idea.includes('naturel') || idea.includes('bio') || idea.includes('organic') || idea.includes('plante')) {
    iconeGuide = 'Crée une feuille simple ou un bourgeon stylisé comme icône principale, naturel et organique.';
  } else {
    iconeGuide = 'Crée une icône géométrique abstraite et moderne (hexagone, triangle, losange, ou forme unique) qui reflète le nom de la marque.';
  }

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
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Tu es un designer logo professionnel. Crée un logo SVG de haute qualité pour la marque "${nom}".

COULEURS : primaire ${c1}, secondaire ${c2}
INITIALES : ${init}

DESIGN REQUIS :
${iconeGuide}
- Le logo doit faire 100x100px (viewBox="0 0 100 100")
- Fond : rectangle arrondi (rx="18") avec dégradé des 2 couleurs
- L'icône doit être dessinée en blanc ou blanc semi-transparent, centrée en haut (~30-55% de la hauteur)
- Les initiales "${init}" en blanc, bold, en bas de l'icône (~65-75% de la hauteur), taille 18-22px
- Style : moderne, minimaliste, professionnel — qualité logo startup
- Utilise des paths SVG réels pour dessiner l'icône (pas de texte emoji)
- ID unique pour le gradient : utilise "grad_${init.toLowerCase()}_${Date.now().toString(36)}"

IMPORTANT : Réponds UNIQUEMENT avec le code SVG complet, commençant par <svg, sans markdown ni explication.`
        }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim() || '';
    const match = text.match(/<svg[\s\S]*<\/svg>/);

    if (match) {
      return res.status(200).json({ success: true, svg: match[0] });
    }
    throw new Error('SVG non trouvé');

  } catch(e) {
    console.error('generate-logo error:', e);
    // Fallback SVG propre avec initiales stylées
    const uid = Date.now().toString(36);
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="18" fill="url(#g${uid})"/>
  <rect x="12" y="12" width="76" height="76" rx="12" fill="rgba(255,255,255,0.1)"/>
  <text x="50" y="62" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="${init.length > 2 ? '24' : '30'}" fill="white" letter-spacing="2">${init}</text>
</svg>`;
    return res.status(200).json({ success: true, svg: fallback });
  }
};
