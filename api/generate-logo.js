// Bibliothèque d'icônes SVG paths prédéfinies par secteur
const ICONS = {
  cbd: `<g transform="translate(50,42) scale(0.38)">
    <path d="M0-60 C5-45 20-40 15-20 C25-35 40-30 35-10 C45-25 55-15 45,5 C55-5 60,10 50,20 C40,10 30,20 20,15 C25,30 15,35 0,30 C-15,35 -25,30 -20,15 C-30,20 -40,10 -50,20 C-60,10 -55,-5 -45,5 C-55,-15 -45,-25 -35,-10 C-40,-30 -25,-35 -15,-20 C-20,-40 -5,-45 0,-60Z" fill="white" opacity="0.95"/>
    <rect x="-3" y="20" width="6" height="25" rx="3" fill="white" opacity="0.8"/>
  </g>`,
  bougie: `<g transform="translate(50,45) scale(0.55)">
    <path d="M0-45 C8-35 12-20 8-5 C12-15 18-10 15,2 C10-5 5,5 0,8 C-5,5 -10,-5 -15,2 C-18,-10 -12,-15 -8,-5 C-12,-20 -8,-35 0,-45Z" fill="white" opacity="0.95"/>
    <rect x="-8" y="8" width="16" height="35" rx="6" fill="white" opacity="0.75"/>
    <ellipse cx="0" cy="43" rx="12" ry="4" fill="white" opacity="0.4"/>
  </g>`,
  restaurant: `<g transform="translate(50,50) scale(0.5)">
    <path d="M-20-45 L-20,45 M-20-20 C-20-35 5-35 5-20 C5-5 -20,-5 -20,-20Z" stroke="white" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.95"/>
    <path d="M15-45 L15-15 C15,-5 25,-5 25,-15 L25-45 M20-15 L20,45" stroke="white" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.95"/>
  </g>`,
  coffee: `<g transform="translate(50,48) scale(0.5)">
    <path d="M-25,0 L-25,30 C-25,42 -15,50 0,50 C15,50 25,42 25,30 L25,0Z" stroke="white" stroke-width="5" fill="none" opacity="0.95"/>
    <path d="M25,10 C35,10 40,18 40,25 C40,32 35,38 25,38" stroke="white" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.95"/>
    <path d="M-10-20 C-10-30 -5-30 -5-20" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M8-20 C8-35 14-35 14-20" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
  </g>`,
  fitness: `<g transform="translate(50,50) scale(0.5)">
    <rect x="-50" y="-8" width="100" height="16" rx="8" fill="white" opacity="0.95"/>
    <rect x="-50" y="-25" width="15" height="50" rx="7" fill="white" opacity="0.95"/>
    <rect x="35" y="-25" width="15" height="50" rx="7" fill="white" opacity="0.95"/>
    <rect x="-65" y="-18" width="15" height="36" rx="7" fill="white" opacity="0.75"/>
    <rect x="50" y="-18" width="15" height="36" rx="7" fill="white" opacity="0.75"/>
  </g>`,
  tech: `<g transform="translate(50,50) scale(0.5)">
    <path d="M-30-10 L-45,0 L-30,10 M30-10 L45,0 L30,10" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95"/>
    <path d="M-10,30 L10,-30" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.95"/>
  </g>`,
  immo: `<g transform="translate(50,52) scale(0.5)">
    <path d="M0-50 L-45,0 L-35,0 L-35,45 L35,45 L35,0 L45,0 Z" stroke="white" stroke-width="5" stroke-linejoin="round" fill="white" fill-opacity="0.2" opacity="0.95"/>
    <rect x="-12" y="15" width="24" height="30" rx="3" fill="white" opacity="0.9"/>
  </g>`,
  mode: `<g transform="translate(50,45) scale(0.5)">
    <path d="M0-50 C-5-30 -20-25 -20-10 L-20,50 L20,50 L20-10 C20-25 5-30 0-50Z" stroke="white" stroke-width="5" stroke-linejoin="round" fill="white" fill-opacity="0.2" opacity="0.95"/>
    <path d="M-20,-10 C-30,-15 -40,-5 -35,10 C-30,20 -20,20 -20,10" stroke="white" stroke-width="4" fill="white" fill-opacity="0.3" opacity="0.9"/>
    <path d="M20,-10 C30,-15 40,-5 35,10 C30,20 20,20 20,10" stroke="white" stroke-width="4" fill="white" fill-opacity="0.3" opacity="0.9"/>
  </g>`,
  voyage: `<g transform="translate(50,50) scale(0.5)">
    <path d="M0-50 C5-50 15-30 15,0 C15,30 5,50 0,50 C-5,50 -15,30 -15,0 C-15,-30 -5,-50 0,-50Z" stroke="white" stroke-width="5" fill="white" fill-opacity="0.15" opacity="0.95"/>
    <ellipse cx="0" cy="0" rx="50" ry="20" stroke="white" stroke-width="5" fill="white" fill-opacity="0.15" opacity="0.95"/>
    <circle cx="0" cy="0" r="8" fill="white" opacity="0.9"/>
  </g>`,
  beaute: `<g transform="translate(50,50) scale(0.5)">
    <path d="M0-50 C15-40 25-20 20,0 C15,20 5,35 0,50 C-5,35 -15,20 -20,0 C-25,-20 -15,-40 0,-50Z" fill="white" fill-opacity="0.3" stroke="white" stroke-width="4" opacity="0.95"/>
    <circle cx="0" cy="0" r="15" fill="white" opacity="0.9"/>
    <path d="M-35-10 C-20,-25 20,-25 35,-10" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
  </g>`,
  nature: `<g transform="translate(50,48) scale(0.5)">
    <path d="M0,45 L0,-10 M0,-10 C0,-10 -30,-20 -35,-45 C-10,-35 0,-20 0,-10 C0,-20 10,-35 35,-45 C30,-20 0,-10 0,-10Z" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="white" fill-opacity="0.2" opacity="0.95"/>
  </g>`,
  default: `<g transform="translate(50,50) scale(0.5)">
    <polygon points="0,-55 52,-18 32,47 -32,47 -52,-18" stroke="white" stroke-width="5" fill="white" fill-opacity="0.15" opacity="0.95"/>
    <polygon points="0,-35 32,-11 20,29 -20,29 -32,-11" fill="white" opacity="0.6"/>
  </g>`
};

function detectIcon(idee, nom) {
  const idea = (idee + ' ' + nom).toLowerCase();
  if (idea.includes('cbd') || idea.includes('cannabis') || idea.includes('chanvre')) return ICONS.cbd;
  if (idea.includes('bougie') || idea.includes('chandelle') || idea.includes('cire')) return ICONS.bougie;
  if (idea.includes('restaurant') || idea.includes('repas') || idea.includes('food') || idea.includes('pizza') || idea.includes('burger')) return ICONS.restaurant;
  if (idea.includes('café') || idea.includes('coffee') || idea.includes('barista')) return ICONS.coffee;
  if (idea.includes('fitness') || idea.includes('sport') || idea.includes('gym') || idea.includes('muscl') || idea.includes('coach')) return ICONS.fitness;
  if (idea.includes('saas') || idea.includes('tech') || idea.includes('logiciel') || idea.includes('app') || idea.includes('code')) return ICONS.tech;
  if (idea.includes('immo') || idea.includes('maison') || idea.includes('appart') || idea.includes('logement')) return ICONS.immo;
  if (idea.includes('mode') || idea.includes('vêtement') || idea.includes('fashion') || idea.includes('street') || idea.includes('hype')) return ICONS.mode;
  if (idea.includes('voyage') || idea.includes('tourisme') || idea.includes('hotel') || idea.includes('vacances')) return ICONS.voyage;
  if (idea.includes('beauté') || idea.includes('cosmétique') || idea.includes('soin') || idea.includes('parfum') || idea.includes('maquillage')) return ICONS.beaute;
  if (idea.includes('bio') || idea.includes('naturel') || idea.includes('plante') || idea.includes('organic') || idea.includes('vegan')) return ICONS.nature;
  return ICONS.default;
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

  const icon = detectIcon(idee || '', nom);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <clipPath id="clip${uid}">
      <rect width="100" height="100" rx="18"/>
    </clipPath>
  </defs>
  <rect width="100" height="100" rx="18" fill="url(#g${uid})"/>
  <rect width="100" height="100" rx="18" fill="rgba(0,0,0,0.08)" clip-path="url(#clip${uid})"/>
  ${icon}
</svg>`;

  return res.status(200).json({ success: true, svg });
};
