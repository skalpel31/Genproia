function getLogoIconPrompt(idee, nom) {
  const idea = (idee + ' ' + nom).toLowerCase();

  // ── NATURE / BIO / PLANTES ──
  if (idea.includes('cbd') || idea.includes('cannabis') || idea.includes('chanvre'))
    return `Une feuille de cannabis stylisée avec 7 folioles pointues finement tracées. Paths SVG précis. Élégante et reconnaissable.`;
  if (idea.includes('bougie') || idea.includes('chandelle') || idea.includes('cire') || idea.includes('lumière'))
    return `Une flamme de bougie stylisée — goutte allongée pointue en haut, légèrement inclinée, avec un rectangle fin en bas pour la mèche. Minimaliste et élégant.`;
  if (idea.includes('plante') || idea.includes('fleur') || idea.includes('floral') || idea.includes('jardin'))
    return `Un bourgeon stylisé avec 3 pétales arrondis qui s'ouvrent. Formes courbes organiques. Doux et naturel.`;
  if (idea.includes('bio') || idea.includes('naturel') || idea.includes('organic') || idea.includes('vegan'))
    return `Une feuille simple — tige centrale avec 2 courbes symétriques formant la feuille. Minimaliste, nature.`;

  // ── FOOD & BOISSONS ──
  if (idea.includes('café') || idea.includes('coffee') || idea.includes('barista') || idea.includes('espresso'))
    return `Une tasse de café vue de côté avec 2 volutes de vapeur stylisées au-dessus. Proportions harmonieuses. Simple.`;
  if (idea.includes('restaurant') || idea.includes('brasserie') || idea.includes('gastronomie') || idea.includes('chef'))
    return `Une cloche de restaurant stylisée avec poignée ronde. Ou une fourchette et couteau croisés à 45°. Élégant.`;
  if (idea.includes('pizza') || idea.includes('burger') || idea.includes('fast'))
    return `Une pizza vue de dessus stylisée avec 3 tranches. Ou un burger de profil minimaliste à 3 couches.`;
  if (idea.includes('boulang') || idea.includes('pâtisserie') || idea.includes('bakery') || idea.includes('pain'))
    return `Un croissant stylisé avec des courbes douces. Ou une baguette en diagonale. Simple et reconnaissable.`;
  if (idea.includes('vin') || idea.includes('wine') || idea.includes('cave') || idea.includes('vigne'))
    return `Une bouteille de vin stylisée avec une grappe de raisin à côté. Ou juste la grappe géométrique avec 5-6 cercles.`;
  if (idea.includes('sushi') || idea.includes('japonais') || idea.includes('ramen'))
    return `Des baguettes stylisées en croix, ou un rouleau de sushi vu de dessus. Géométrique et net.`;
  if (idea.includes('chocolat') || idea.includes('confiserie') || idea.includes('bonbon'))
    return `Un carré de chocolat avec 4 cases en relief. Ou un bonbon stylisé. Gourmand et joyeux.`;
  if (idea.includes('livraison') || idea.includes('delivery'))
    return `Un scooter de livraison stylisé, ou une boîte avec une flèche vers le haut. Simple et dynamique.`;

  // ── MODE & LIFESTYLE ──
  if (idea.includes('street') || idea.includes('urban') || idea.includes('hype') || idea.includes('skateboard'))
    return `Un éclair stylisé (bolt) asymétrique et moderne. Ou un S stylisé géométrique. Aucun cintre. Énergie et dynamisme.`;
  if (idea.includes('luxe') || idea.includes('luxury') || idea.includes('premium') || idea.includes('haut de gamme'))
    return `Un diamant géométrique précis — losange avec des facettes intérieures tracées en traits fins. Élégant, épuré.`;
  if (idea.includes('bijou') || idea.includes('joaill') || idea.includes('or') || idea.includes('argent'))
    return `Un anneau stylisé avec un diamant dessus. Ou une couronne minimaliste à 5 pointes. Luxueux.`;
  if (idea.includes('mode') || idea.includes('vêtement') || idea.includes('fashion') || idea.includes('collection'))
    return `Un hexagone élégant avec une ligne diagonale ou motif géométrique intérieur. Abstrait, mode, jamais littéral.`;
  if (idea.includes('chaussure') || idea.includes('sneaker') || idea.includes('basket'))
    return `Une semelle de sneaker stylisée vue de profil, ou un éclair géométrique. Dynamique et sportif.`;
  if (idea.includes('montre') || idea.includes('horlog'))
    return `Un cadran de montre circulaire avec 2 aiguilles à 10h10. Élégant et précis.`;

  // ── BEAUTÉ & BIEN-ÊTRE ──
  if (idea.includes('cosmétique') || idea.includes('maquillage') || idea.includes('makeup') || idea.includes('beauté'))
    return `Un pinceau de maquillage stylisé en diagonale. Ou une fleur à 5 pétales avec centre pointillé.`;
  if (idea.includes('parfum') || idea.includes('fragrance') || idea.includes('scent'))
    return `Un flacon de parfum stylisé — forme rectangulaire arrondie avec bouchon carré. Élégant et minimaliste.`;
  if (idea.includes('spa') || idea.includes('massage') || idea.includes('détente') || idea.includes('relaxation'))
    return `Un lotus à 5-6 pétales stylisés. Ou des vagues concentriques évoquant l'eau et la sérénité.`;
  if (idea.includes('yoga') || idea.includes('méditation') || idea.includes('bien-être') || idea.includes('mindfulness'))
    return `Un lotus minimaliste à 3 niveaux de pétales. Ou une silhouette de posture de méditation (cercle + forme humaine simple).`;
  if (idea.includes('fit') || idea.includes('gym') || idea.includes('muscl') || idea.includes('sport') || idea.includes('coach'))
    return `Un haltère stylisé — barre horizontale avec 2 disques ronds. Ou un éclair vertical pour l'énergie.`;
  if (idea.includes('coiffure') || idea.includes('barber') || idea.includes('salon'))
    return `Des ciseaux stylisés ouverts à 45°. Lignes précises et épurées.`;

  // ── TECH & DIGITAL ──
  if (idea.includes('saas') || idea.includes('logiciel') || idea.includes('software') || idea.includes('dashboard'))
    return `Des accolades { } stylisées avec un point entre elles </>. Ou 3 lignes de code horizontales de longueurs décroissantes.`;
  if (idea.includes('app') || idea.includes('mobile') || idea.includes('application'))
    return `Un smartphone stylisé avec 2 lignes sur l'écran. Minimaliste et moderne.`;
  if (idea.includes('ia') || idea.includes('intelligence artificielle') || idea.includes('ai') || idea.includes('machine learning'))
    return `Un cerveau stylisé en 2 hémisphères avec des connexions en points. Ou un réseau de neurones abstrait à 5-6 nœuds.`;
  if (idea.includes('crypto') || idea.includes('blockchain') || idea.includes('nft') || idea.includes('web3'))
    return `Un hexagone avec des connexions en réseau. Ou un cube 3D isométrique stylisé.`;
  if (idea.includes('data') || idea.includes('analytics') || idea.includes('analyse'))
    return `3 barres de graphique de hauteurs différentes. Ou un cercle avec des segments de données.`;
  if (idea.includes('cybersécurité') || idea.includes('securité') || idea.includes('security'))
    return `Un bouclier stylisé avec une coche à l'intérieur. Formes géométriques nettes.`;
  if (idea.includes('cloud') || idea.includes('hébergement') || idea.includes('serveur'))
    return `Un nuage stylisé simple avec une flèche vers le haut. Ou 3 cercles reliés horizontalement.`;
  if (idea.includes('agence') || idea.includes('web') || idea.includes('digital'))
    return `Un curseur de souris stylisé. Ou 3 rectangles imbriqués évoquant des fenêtres/layers.`;

  // ── IMMOBILIER & SERVICES ──
  if (idea.includes('immo') || idea.includes('maison') || idea.includes('appart') || idea.includes('logement'))
    return `Une maison stylisée — toit triangulaire simple + rectangle, porte arrondie. Minimaliste et net.`;
  if (idea.includes('nettoy') || idea.includes('ménage') || idea.includes('cleaning'))
    return `Un balai stylisé ou une bulle de savon avec des étincelles. Propre et simple.`;
  if (idea.includes('avocat') || idea.includes('juridique') || idea.includes('droit') || idea.includes('legal'))
    return `Une balance de justice stylisée. Ou un marteau de tribunal minimaliste.`;
  if (idea.includes('comptable') || idea.includes('finance') || idea.includes('banque') || idea.includes('invest'))
    return `Un graphique ascendant stylisé (courbe ou barres). Ou un signe $ stylisé géométriquement.`;
  if (idea.includes('recrutement') || idea.includes('rh') || idea.includes('emploi') || idea.includes('talent'))
    return `Deux silhouettes humaines stylisées côte à côte. Ou une poignée de main schématique.`;
  if (idea.includes('événement') || idea.includes('mariage') || idea.includes('wedding') || idea.includes('fête'))
    return `Un champagne stylisé avec des bulles. Ou 2 alliances croisées. Festif et élégant.`;
  if (idea.includes('voyage') || idea.includes('tourisme') || idea.includes('hotel') || idea.includes('vacances'))
    return `Une boussole avec les 4 points cardinaux. Ou un avion en papier origami vu de dessus.`;

  // ── TRANSPORT ──
  if (idea.includes('voiture') || idea.includes('auto') || idea.includes('garage') || idea.includes('mecanique'))
    return `Une voiture stylisée vue de profil, 2 cercles pour les roues, lignes épurées.`;
  if (idea.includes('vélo') || idea.includes('cyclisme') || idea.includes('vtt'))
    return `Une roue de vélo avec rayons, ou un vélo schématique épuré.`;
  if (idea.includes('moto') || idea.includes('scooter'))
    return `Un casque de moto stylisé vu de profil, ou une moto de profil minimaliste.`;

  // ── SANTÉ ──
  if (idea.includes('médecin') || idea.includes('médical') || idea.includes('santé') || idea.includes('clinique'))
    return `Une croix médicale dans un cercle. Ou un stéthoscope stylisé en forme de cœur.`;
  if (idea.includes('dentiste') || idea.includes('dental'))
    return `Une dent stylisée avec un éclat brillant. Géométrique et propre.`;
  if (idea.includes('vétérin') || idea.includes('animal') || idea.includes('pet') || idea.includes('chien') || idea.includes('chat'))
    return `Une patte d'animal stylisée à 4 coussinets. Ou un chien et chat schématiques face à face.`;

  // ── ARTS & LOISIRS ──
  if (idea.includes('musique') || idea.includes('music') || idea.includes('studio') || idea.includes('concert'))
    return `Une note de musique double ♫ stylisée. Ou des ondes sonores en demi-cercles concentriques.`;
  if (idea.includes('photo') || idea.includes('photographe') || idea.includes('camera'))
    return `Un objectif photo stylisé — cercle avec 3 cercles concentriques. Ou un appareil photo schématique.`;
  if (idea.includes('jeu') || idea.includes('gaming') || idea.includes('esport') || idea.includes('gamer'))
    return `Une manette de jeu stylisée avec 2 sticks et 2 boutons. Ou un éclair pixel art.`;
  if (idea.includes('art') || idea.includes('peinture') || idea.includes('galerie') || idea.includes('créatif'))
    return `Une palette de peintre stylisée avec 4-5 cercles de couleurs. Ou un pinceau diagonal.`;
  if (idea.includes('livre') || idea.includes('librairie') || idea.includes('édition') || idea.includes('lecture'))
    return `Un livre ouvert stylisé — 2 pages en V. Simple et reconnaissable.`;

  // ── MARKETPLACE / COMMUNAUTÉ ──
  if (idea.includes('artisan') || idea.includes('fait main') || idea.includes('handmade'))
    return `Des mains stylisées en coupe tenant un objet. Ou une aiguille et fil formant un cœur.`;
  if (idea.includes('marketplace') || idea.includes('plateforme') || idea.includes('communauté'))
    return `3 cercles interconnectés formant un réseau. Évoque la connexion et le partage.`;
  if (idea.includes('formation') || idea.includes('cours') || idea.includes('école') || idea.includes('éducation'))
    return `Un chapeau de diplôme stylisé. Ou un livre ouvert avec une ampoule au-dessus.`;

  // ── FALLBACK CRÉATIF ──
  return `Une forme géométrique abstraite unique et mémorable pour la marque "${nom}" — évite les clichés. Propose quelque chose d'original : spirale, formes imbriquées, symbole asymétrique mais équilibré. Style startup moderne, flat design premium.`;
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

  const prompt = `Tu es un designer logo SVG expert, spécialisé dans les logos de startups modernes.
Crée un logo SVG de haute qualité pour la marque "${nom}" (secteur: ${idee || 'business'}).

SPÉCIFICATIONS TECHNIQUES OBLIGATOIRES :
- viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg"
- Fond : <rect width="100" height="100" rx="18" fill="url(#grad_${uid})"/>
- Gradient : <linearGradient id="grad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>
- Légère texture : <rect x="5" y="5" width="90" height="90" rx="14" fill="rgba(255,255,255,0.06)"/>

ICÔNE À DESSINER (occupe la zone y=18 à y=68, centrée à x=50) :
${iconPrompt}
- OBLIGATOIRE : icône en blanc pur (fill="white") ou fill="rgba(255,255,255,0.95)"
- Utilise uniquement des paths, circles, rects, polygons SVG natifs — PAS d'emoji, PAS de texte unicode
- L'icône doit être belle, propre, professionnelle — comme un vrai logo de startup

TEXTE NOM (obligatoire) :
- <text x="50" y="84" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${nom.length > 9 ? '8' : nom.length > 6 ? '10' : nom.length > 4 ? '12' : '14'}" fill="white" letter-spacing="0.5">${nom.toUpperCase()}</text>

QUALITÉ : le résultat doit ressembler à un vrai logo de startup (Figma, Notion, Linear, Vercel).
Réponds UNIQUEMENT avec le SVG complet, commençant par <svg, sans markdown ni explication.`;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim() || '';
    const match = text.match(/<svg[\s\S]*<\/svg>/);

    if (match) {
      console.log(`Logo SVG généré pour "${nom}" ✅`);
      return res.status(200).json({ success: true, svg: match[0], type: 'svg' });
    }
    throw new Error('SVG non trouvé dans la réponse');

  } catch(e) {
    console.error('generate-logo error:', e.message);
    // Fallback propre avec initiales
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs><linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="18" fill="url(#g${uid})"/>
  <rect x="8" y="8" width="84" height="84" rx="13" fill="rgba(255,255,255,0.08)"/>
  <text x="50" y="56" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${init.length > 2 ? '26' : '32'}" fill="white">${init}</text>
  <text x="50" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${nom.length > 8 ? '7' : '9'}" fill="rgba(255,255,255,0.85)" letter-spacing="1">${nom.toUpperCase()}</text>
</svg>`;
    return res.status(200).json({ success: true, svg: fallback, type: 'svg' });
  }
};
