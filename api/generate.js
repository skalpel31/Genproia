const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

const PLAN_LIMITS = {
  free:     0,
  oneshot:  1,
  pro:      4,
  business: 999
};

async function checkPlanLimit(userId) {
  const { data: userData, error } = await supabase
    .from('users')
    .select('plan, projets_ce_mois, date_reset')
    .eq('id', userId)
    .single();

  if (error || !userData) return { allowed: false, reason: 'Utilisateur introuvable' };

  const plan = userData.plan || 'free';
  const limit = PLAN_LIMITS[plan] ?? 0;

  if (plan === 'free') {
    const { count } = await supabase
      .from('projets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (count >= 1) return { allowed: false, plan, reason: 'free', message: 'Le plan gratuit ne permet qu\'un seul aperçu.' };
    return { allowed: true, plan, preview_only: true, projets_restants: 0 };
  }

  if (plan === 'oneshot') {
    const { count } = await supabase
      .from('projets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (count >= 1) return { allowed: false, plan, reason: 'oneshot_used', message: 'Tu as déjà utilisé ton One-Shot. Passe au plan Pro.' };
    return { allowed: true, plan, projets_restants: 1 };
  }

  const today = new Date().toISOString().split('T')[0];
  const dateReset = userData.date_reset;
  let projetsCeMois = userData.projets_ce_mois || 0;

  if (!dateReset || today.substring(0, 7) !== dateReset.substring(0, 7)) {
    await supabase.from('users').update({ projets_ce_mois: 0, date_reset: today }).eq('id', userId);
    projetsCeMois = 0;
  }

  if (projetsCeMois >= limit) {
    return { allowed: false, plan, reason: 'limit_reached', projets_ce_mois: projetsCeMois, limite: limit, message: `Limite de ${limit} projets ce mois atteinte.` };
  }

  return { allowed: true, plan, projets_ce_mois: projetsCeMois, projets_restants: limit - projetsCeMois };
}

// ══════════════════════════════════════════════════════════════
// CLAUDE HAIKU — Traduction automatique si secteur inconnu
// ══════════════════════════════════════════════════════════════

async function translateWithClaude(idee) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 30,
        messages: [{
          role: 'user',
          content: `Traduis cette idée de business en exactement 3 mots-clés anglais pour recherche photo Unsplash. Réponds UNIQUEMENT avec 3 mots en anglais séparés par des espaces, rien d'autre : "${idee}"`
        }]
      })
    });
    const data = await response.json();
    const result = data.content[0].text.trim().toLowerCase().replace(/[^a-z\s]/g, '');
    console.log(`Claude translate: "${idee}" → "${result}"`);
    return result;
  } catch (e) {
    console.error('Claude translate error:', e);
    return 'business product professional';
  }
}

// ══════════════════════════════════════════════════════════════
// SVG LOGO — Fallback inline dans generate.js
// ══════════════════════════════════════════════════════════════

function fallbackSvgLogo(initiales, c1, c2) {
  const uid = Math.random().toString(36).substring(2, 8);
  return `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lg${uid}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#lg${uid})"/><rect x="8" y="8" width="32" height="32" rx="8" fill="rgba(255,255,255,0.1)"/><text x="24" y="31" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="${initiales.length > 2 ? '12' : '15'}" fill="white" letter-spacing="1">${initiales}</text></svg>`;
}

function getLogoIconPromptInline(idee, nom) {
  const idea = (idee + ' ' + nom).toLowerCase();
  if (idea.includes('bougie') || idea.includes('chandelle')) return `Une flamme de bougie stylisée en blanc.`;
  if (idea.includes('café') || idea.includes('coffee')) return `Une tasse avec vapeur stylisée en blanc.`;
  if (idea.includes('restaurant') || idea.includes('food')) return `Fourchette et couteau croisés en blanc.`;
  if (idea.includes('fitness') || idea.includes('sport') || idea.includes('gym')) return `Un haltère stylisé en blanc.`;
  if (idea.includes('saas') || idea.includes('tech') || idea.includes('app')) return `Accolades { } tech stylisées en blanc.`;
  if (idea.includes('immo') || idea.includes('maison')) return `Une maison stylisée en blanc.`;
  if (idea.includes('luxe') || idea.includes('bijou') || idea.includes('premium')) return `Un diamant géométrique en blanc.`;
  if (idea.includes('bio') || idea.includes('naturel') || idea.includes('plante')) return `Une feuille simple en blanc.`;
  if (idea.includes('musique') || idea.includes('music')) return `Une note de musique stylisée en blanc.`;
  if (idea.includes('voyage') || idea.includes('tourisme')) return `Une boussole stylisée en blanc.`;
  return `Une forme géométrique abstraite moderne en blanc pour "${nom}".`;
}

async function generateSVGLogo(nom, initiales, couleur1, couleur2, idee) {
  const iconPrompt = getLogoIconPromptInline(idee || nom, nom);
  const uid = Date.now().toString(36);
  const prompt = `Tu es un designer logo professionnel. Crée un logo SVG haute qualité pour la marque "${nom}".
SPECS : viewBox="0 0 100 100", fond gradient ${couleur1}→${couleur2}, id="grad_${uid}", rx="18"
ICÔNE (y=18 à y=68, centrée x=50) : ${iconPrompt} en blanc, paths SVG réels
TEXTE : "${nom}" en bas y≈82, centré, Arial font-weight="800" font-size="${nom.length > 8 ? '9' : nom.length > 5 ? '11' : '13'}" fill="white"
Réponds UNIQUEMENT avec le SVG complet, sans markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    const text = data.content[0].text.trim();
    const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
    if (svgMatch) { console.log(`Logo SVG inline généré pour "${nom}" ✅`); return svgMatch[0]; }
  } catch (e) { console.error('SVG logo inline error:', e); }

  return fallbackSvgLogo(initiales, couleur1, couleur2);
}

// ══════════════════════════════════════════════════════════════
// UNSPLASH — Requêtes précises par secteur + orientation
// ══════════════════════════════════════════════════════════════

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || 'S6gAHKEXVaC3STwu5YlEnKIyw-VGktEiGKP3Auib27A';

async function getUnsplashImages(query, count = 6, orientation = 'landscape') {
  if (!UNSPLASH_KEY) return [];
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=${orientation}&order_by=relevant`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    return (data.results || []).map(p => ({
      url: p.urls.regular,
      small: p.urls.small,
      thumb: p.urls.thumb,
      alt: p.alt_description || query,
      author: p.user.name,
      color: p.color
    }));
  } catch (e) {
    console.error('Unsplash error:', e);
    return [];
  }
}

// Requêtes Unsplash MULTIPLES selon le type de contenu
async function getAllImages(idee, type) {
  const idea = idee.toLowerCase();

  // Déterminer la requête principale selon le secteur
  let heroQuery = '';
  let productQuery = '';
  let ambianceQuery = '';

  // ── MAISON & DÉCO ──
  if (idea.includes('bougie') || idea.includes('chandelle')) {
    heroQuery = 'luxury scented candle minimal dark aesthetic';
    productQuery = 'scented candle collection lifestyle';
    ambianceQuery = 'cozy home candlelight interior';
  } else if (idea.includes('déco') || idea.includes('intérieur') || idea.includes('mobilier') || idea.includes('meuble')) {
    heroQuery = 'interior design modern living room luxury';
    productQuery = 'home decor furniture minimal scandinavian';
    ambianceQuery = 'elegant home interior light';
  } else if (idea.includes('jardin') || idea.includes('plante') || idea.includes('fleur')) {
    heroQuery = 'botanical garden plants luxury greenhouse';
    productQuery = 'plants flowers indoor aesthetic pot';
    ambianceQuery = 'garden nature green sunlight';

  // ── MODE & VÊTEMENTS ──
  } else if (idea.includes('street') || idea.includes('urban') || idea.includes('hype') || idea.includes('skateboard')) {
    heroQuery = 'streetwear fashion urban youth editorial';
    productQuery = 'streetwear clothing hoodie sneakers flatlay';
    ambiancQuery = 'urban street style graffiti city';
  } else if (idea.includes('luxe') || idea.includes('luxury') || idea.includes('premium') || idea.includes('haut de gamme')) {
    heroQuery = 'luxury fashion editorial elegant dark';
    productQuery = 'luxury fashion product photography minimal';
    ambianceQuery = 'luxury brand aesthetic gold marble';
  } else if (idea.includes('vêtement') || idea.includes('mode') || idea.includes('fashion') || idea.includes('textile')) {
    heroQuery = 'fashion clothing store editorial minimal';
    productQuery = 'clothing fashion product flatlay minimal';
    ambianceQuery = 'fashion studio light minimal aesthetic';
  } else if (idea.includes('bijou') || idea.includes('joaill')) {
    heroQuery = 'jewelry luxury gold minimal dark background';
    productQuery = 'jewelry rings necklace product photography';
    ambianceQuery = 'luxury jewelry editorial elegant';
  } else if (idea.includes('chaussure') || idea.includes('sneaker')) {
    heroQuery = 'sneakers shoes product photography minimal';
    productQuery = 'sneakers collection flatlay white background';
    ambianceQuery = 'shoe fashion editorial urban';
  } else if (idea.includes('montre') || idea.includes('horlog')) {
    heroQuery = 'luxury watch minimal dark aesthetic';
    productQuery = 'watch timepiece product photography';
    ambianceQuery = 'watch lifestyle elegant man';

  // ── BEAUTÉ & BIEN-ÊTRE ──
  } else if (idea.includes('cosmétique') || idea.includes('maquillage') || idea.includes('makeup')) {
    heroQuery = 'luxury cosmetics makeup beauty minimal editorial';
    productQuery = 'makeup cosmetics product photography pastel';
    ambianceQuery = 'beauty makeup glam aesthetic studio';
  } else if (idea.includes('soin') || idea.includes('skincare') || idea.includes('crème')) {
    heroQuery = 'skincare beauty natural products minimal white';
    productQuery = 'skincare serum cream product photography';
    ambianceQuery = 'skincare routine bathroom minimal clean';
  } else if (idea.includes('parfum') || idea.includes('fragrance')) {
    heroQuery = 'luxury perfume bottle dark moody editorial';
    productQuery = 'perfume fragrance bottle minimal aesthetic';
    ambianceQuery = 'perfume luxury brand editorial flowers';
  } else if (idea.includes('spa') || idea.includes('massage') || idea.includes('bien-être')) {
    heroQuery = 'luxury spa wellness relaxation minimal';
    productQuery = 'spa products natural stones candle towel';
    ambianceQuery = 'wellness spa interior calm water light';
  } else if (idea.includes('yoga') || idea.includes('méditation')) {
    heroQuery = 'yoga meditation woman nature sunrise';
    productQuery = 'yoga mat accessories minimal pastel';
    ambianceQuery = 'yoga studio calm light mindfulness';
  } else if (idea.includes('fit') || idea.includes('gym') || idea.includes('muscl') || idea.includes('sport')) {
    heroQuery = 'fitness gym athlete training dark dramatic';
    productQuery = 'fitness equipment gym weights minimal';
    ambianceQuery = 'gym training motivation athlete lifestyle';
  } else if (idea.includes('coiffure') || idea.includes('barber') || idea.includes('salon')) {
    heroQuery = 'hair salon barber editorial minimal';
    productQuery = 'hair care products minimal aesthetic';
    ambianceQuery = 'barber shop vintage modern interior';

  // ── FOOD & RESTAURANT ──
  } else if (idea.includes('restaurant') || idea.includes('gastronomie') || idea.includes('chef')) {
    heroQuery = 'gourmet restaurant food plating elegant dark';
    productQuery = 'restaurant food dish gourmet plating editorial';
    ambianceQuery = 'restaurant interior elegant ambiance candlelight';
  } else if (idea.includes('café') || idea.includes('coffee')) {
    heroQuery = 'coffee shop minimal aesthetic espresso barista';
    productQuery = 'coffee latte art cup minimal wooden';
    ambianceQuery = 'coffee shop interior cozy light';
  } else if (idea.includes('boulang') || idea.includes('pâtisserie')) {
    heroQuery = 'bakery pastry artisan bread croissant light';
    productQuery = 'pastry cake bread artisan bakery aesthetic';
    ambianceQuery = 'bakery shop interior warm morning light';
  } else if (idea.includes('pizza')) {
    heroQuery = 'pizza artisan wood fired restaurant';
    productQuery = 'pizza close up cheese toppings fresh';
    ambianceQuery = 'pizza restaurant italian interior';
  } else if (idea.includes('sushi') || idea.includes('japonais')) {
    heroQuery = 'sushi japanese food minimal dark';
    productQuery = 'sushi roll plating japanese dark aesthetic';
    ambianceQuery = 'japanese restaurant minimal interior';
  } else if (idea.includes('livraison') || idea.includes('delivery') || idea.includes('repas')) {
    heroQuery = 'food delivery meal healthy fresh';
    productQuery = 'food meal box delivery healthy';
    ambianceQuery = 'food preparation kitchen fresh ingredients';
  } else if (idea.includes('bio') || idea.includes('organic') || idea.includes('vegan')) {
    heroQuery = 'organic vegan healthy food nature flat lay';
    productQuery = 'organic vegetables fruits natural food';
    ambianceQuery = 'organic farm nature fresh healthy lifestyle';
  } else if (idea.includes('vin') || idea.includes('wine') || idea.includes('cave')) {
    heroQuery = 'wine bottle vineyard luxury dark';
    productQuery = 'wine glass bottle cellar elegant';
    ambianceQuery = 'vineyard sunset wine tasting elegant';

  // ── TECH & DIGITAL ──
  } else if (idea.includes('saas') || idea.includes('logiciel') || idea.includes('software')) {
    heroQuery = 'technology software dashboard interface dark';
    productQuery = 'software interface UI design minimal dark';
    ambianceQuery = 'office tech startup modern workspace';
  } else if (idea.includes('ia') || idea.includes('intelligence artificielle') || idea.includes('ai')) {
    heroQuery = 'artificial intelligence technology futuristic dark';
    productQuery = 'AI technology neural network abstract blue';
    ambianceQuery = 'technology future digital abstract';
  } else if (idea.includes('app') || idea.includes('mobile') || idea.includes('application')) {
    heroQuery = 'mobile app smartphone technology minimal';
    productQuery = 'smartphone app interface design minimal';
    ambianceQuery = 'mobile technology lifestyle minimal';
  } else if (idea.includes('ecommerce') || idea.includes('boutique en ligne') || idea.includes('e-commerce')) {
    heroQuery = 'ecommerce online shopping product minimal';
    productQuery = 'product photography minimal white background';
    ambianceQuery = 'shopping lifestyle minimal aesthetic';
  } else if (idea.includes('crypto') || idea.includes('blockchain')) {
    heroQuery = 'cryptocurrency blockchain technology dark neon';
    productQuery = 'crypto bitcoin technology abstract';
    ambianceQuery = 'blockchain technology future digital';
  } else if (idea.includes('agence') || idea.includes('web') || idea.includes('digital')) {
    heroQuery = 'creative agency design studio minimal dark';
    productQuery = 'web design creative agency workspace';
    ambianceQuery = 'design studio creative workspace modern';

  // ── IMMOBILIER ──
  } else if (idea.includes('immo') || idea.includes('maison') || idea.includes('appart')) {
    heroQuery = 'luxury real estate house architecture modern';
    productQuery = 'modern house interior architecture minimal';
    ambianceQuery = 'luxury home interior design elegant';

  // ── SERVICES ──
  } else if (idea.includes('avocat') || idea.includes('juridique') || idea.includes('droit')) {
    heroQuery = 'law office professional elegant minimal';
    productQuery = 'legal professional office business';
    ambianceQuery = 'law firm office professional minimal';
  } else if (idea.includes('comptable') || idea.includes('finance') || idea.includes('invest')) {
    heroQuery = 'finance business professional minimal dark';
    productQuery = 'finance business chart professional';
    ambianceQuery = 'business finance office professional';
  } else if (idea.includes('formation') || idea.includes('coaching') || idea.includes('cours')) {
    heroQuery = 'education learning coaching professional';
    productQuery = 'online learning education minimal';
    ambianceQuery = 'coaching education training workshop';
  } else if (idea.includes('voyage') || idea.includes('tourisme') || idea.includes('vacances')) {
    heroQuery = 'travel destination luxury vacation aerial';
    productQuery = 'travel landscape destination beautiful';
    ambianceQuery = 'travel adventure nature beautiful place';

  // ── SANTÉ ──
  } else if (idea.includes('médecin') || idea.includes('médical') || idea.includes('santé')) {
    heroQuery = 'healthcare medical professional minimal clean';
    productQuery = 'medical health professional minimal';
    ambianceQuery = 'healthcare clinic modern clean';
  } else if (idea.includes('vétérin') || idea.includes('animal') || idea.includes('pet') || idea.includes('chien') || idea.includes('chat')) {
    heroQuery = 'veterinary pet dog cat cute professional';
    productQuery = 'pet dog cat cute lifestyle';
    ambianceQuery = 'veterinary clinic animal care';

  // ── ARTS & LOISIRS ──
  } else if (idea.includes('musique') || idea.includes('music') || idea.includes('studio')) {
    heroQuery = 'music studio recording dark moody';
    productQuery = 'music instrument guitar piano minimal';
    ambianceQuery = 'music concert performance dark light';
  } else if (idea.includes('photo') || idea.includes('photographe')) {
    heroQuery = 'photography camera professional minimal';
    productQuery = 'photography camera lens minimal';
    ambianceQuery = 'photographer studio light creative';
  } else if (idea.includes('art') || idea.includes('galerie') || idea.includes('peinture')) {
    heroQuery = 'art gallery exhibition minimal light';
    productQuery = 'art painting canvas creative';
    ambianceQuery = 'art gallery white walls exhibition';

  // ── MARKETPLACE ──
  } else if (idea.includes('artisan') || idea.includes('fait main') || idea.includes('handmade')) {
    heroQuery = 'artisan handmade craft workshop aesthetic';
    productQuery = 'handmade craft product minimal';
    ambianceQuery = 'artisan workshop craft hands making';
  } else if (idea.includes('marketplace') || idea.includes('plateforme')) {
    heroQuery = 'marketplace community people connection';
    productQuery = 'product variety collection minimal';
    ambianceQuery = 'marketplace people community interaction';

  // ── FALLBACK INTELLIGENT ──
  } else {
    heroQuery = idee.substring(0, 40) + ' professional minimal';
    productQuery = idee.substring(0, 30) + ' product lifestyle';
    ambianceQuery = idee.substring(0, 30) + ' aesthetic minimal';
  }

  // Récupérer hero (1 image landscape haute qualité) + produits (6 images)
  const [heroImages, productImages] = await Promise.all([
    getUnsplashImages(heroQuery, 2, 'landscape'),
    getUnsplashImages(productQuery, 6, 'landscape')
  ]);

  console.log(`Unsplash hero: "${heroQuery}" → ${heroImages.length} imgs`);
  console.log(`Unsplash products: "${productQuery}" → ${productImages.length} imgs`);

  return {
    hero: heroImages[0] || null,
    hero2: heroImages[1] || null,
    products: productImages,
    all: [...heroImages, ...productImages]
  };
}

// ══════════════════════════════════════════════════════════════
// PROMPTS PAR TYPE — v5.0 Qualité Premium
// ══════════════════════════════════════════════════════════════

function getPrompt(type, idee, images) {
  const base = `Tu es Genproia, le meilleur générateur de sites web IA. Tu crées des sites PROFESSIONNELS, BEAUX et COHÉRENTS.
Projet : "${idee}"
Réponds UNIQUEMENT en JSON valide, sans markdown.`;

  const hero = images.hero;
  const hero2 = images.hero2;
  const products = images.products || [];

  const getImg = (i) => products[i] ? products[i].url : (hero ? hero.url : '');
  const getAlt = (i) => products[i] ? (products[i].alt || '') : '';

  const heroUrl = hero ? hero.url : '';
  const hero2Url = hero2 ? hero2.url : heroUrl;

  const imgNote = products.length > 0
    ? `\n\nIMAGES UNSPLASH DISPONIBLES — URLs exactes à utiliser :
Hero/bannière: ${heroUrl}
Hero 2: ${hero2Url}
Produit 1: ${getImg(0)}
Produit 2: ${getImg(1)}
Produit 3: ${getImg(2)}
Produit 4: ${getImg(3)}
Produit 5: ${getImg(4)}
Produit 6: ${getImg(5)}
RÈGLE : copie EXACTEMENT ces URLs dans les balises <img>. Ne génère aucune autre URL.`
    : '\n\nPas d\'images — utilise des dégradés CSS colorés.';

  const templates = {

ecommerce: `${base}

Génère un e-commerce premium et cohérent. JSON attendu :
{
  "nom": "Nom de marque court et original (1-2 mots, jamais générique)",
  "nom_alternatives": ["Alt créative 1", "Alt créative 2"],
  "slogan": "Slogan percutant spécifique au produit (5-8 mots)",
  "description": "Description en 2 phrases percutantes",
  "type": "ecommerce",
  "couleur_primaire": "#hex adapté au secteur",
  "couleur_secondaire": "#hex complémentaire",
  "couleur_accent": "#hex pour CTA",
  "logo_initiales": "2 lettres",
  "domaines": ["marque.fr", "marque.com", "marque.shop"],
  "secteur": "secteur précis",
  "cible": "profil client précis avec âge et motivation",
  "fonctionnalites": ["6 fonctionnalités réelles"],
  "produits": [
    {"nom": "Nom produit cohérent avec l'idée", "prix": 49, "description": "Description précise 10 mots", "badge": "Nouveau", "image": "${getImg(0)}"},
    {"nom": "Produit 2", "prix": 79, "description": "Description", "badge": "Bestseller", "image": "${getImg(1)}"},
    {"nom": "Produit 3", "prix": 39, "description": "Description", "badge": "", "image": "${getImg(2)}"},
    {"nom": "Produit 4", "prix": 129, "description": "Description", "badge": "Premium", "image": "${getImg(3)}"},
    {"nom": "Produit 5", "prix": 59, "description": "Description", "badge": "", "image": "${getImg(4)}"},
    {"nom": "Produit 6", "prix": 89, "description": "Description", "badge": "Populaire", "image": "${getImg(5)}"}
  ],
  "site_html": "SITE_HTML_ICI"
}
${imgNote}

Pour site_html, génère un e-commerce HTML COMPLET et PROFESSIONNEL (minimum 500 lignes) :

STRUCTURE :
1. <head> avec meta, title, Google Fonts (Inter), CSS variables complètes
2. Header sticky : logo SVG (LOGO_SVG_PLACEHOLDER), nav desktop, burger mobile, icône panier avec badge
3. Hero plein écran : image de fond ${heroUrl} avec overlay gradient, titre H1 bold, sous-titre, 2 CTA, badge "Livraison gratuite"
4. Barre réassurance : 🚚 Livraison offerte | ↩ Retours 30j | 🔒 Paiement sécurisé | ⭐ 4.9/5 (2847 avis)
5. Section produits : titre + filtres (Tout / Catégorie1 / Catégorie2 / Promo), grille 3 colonnes responsive, cards avec :
   - image <img src="[URL_PRODUIT_EXACT]" loading="lazy" style="width:100%;height:220px;object-fit:cover">
   - badge couleur (Nouveau=vert, Bestseller=violet, Premium=or)
   - nom produit, description courte, prix, bouton "Ajouter au panier"
   - hover effect avec ombre et légère élévation
6. Section "Notre histoire" : texte + image ${hero2Url} côte à côte
7. Section "Pourquoi nous choisir" : 4 avantages avec icônes SVG inline
8. Témoignages : 3 avis 5 étoiles avec noms réels, avatars CSS, textes cohérents avec le secteur
9. Newsletter : fond gradient, email input, bouton CTA
10. Footer : logo, liens, réseaux sociaux, mentions légales, paiements acceptés

CSS :
- Variables CSS : --primary, --secondary, --accent, --dark, --light
- Animations : fade-in au scroll (IntersectionObserver), hover produits, panier shake
- Responsive : mobile-first, grille 1 col mobile, 2 col tablette, 3 col desktop
- Cards ombres, border-radius modernes, transitions smooth

JS :
- Panier : ajouter, compteur badge, notification toast
- Filtres produits fonctionnels
- Formulaire newsletter avec validation
- Scroll reveal animations`,

saas: `${base}

Génère un site SaaS premium. JSON attendu :
{
  "nom": "Nom tech original et mémorable",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Promesse avec bénéfice concret et chiffré si possible",
  "description": "Description en 2 phrases orientées résultat",
  "type": "saas",
  "couleur_primaire": "#hex tech (violet, bleu, indigo)",
  "couleur_secondaire": "#hex",
  "couleur_accent": "#hex",
  "logo_initiales": "2 lettres",
  "domaines": ["app.io", "app.com", "app.fr"],
  "secteur": "domaine SaaS précis",
  "cible": "type d'entreprise/métier précis",
  "fonctionnalites": ["6 features concrètes"],
  "plans": [
    {"nom": "Starter", "prix": 0, "features": ["3 features clés"], "cta": "Commencer gratuitement"},
    {"nom": "Pro", "prix": 29, "features": ["Tout Starter +", "3 features avancées", "Support prioritaire"], "cta": "Essai 14 jours gratuit", "populaire": true},
    {"nom": "Enterprise", "prix": 99, "features": ["Tout Pro +", "API complète", "SSO/SAML", "SLA 99.9%"], "cta": "Contacter l'équipe"}
  ],
  "site_html": "SITE_HTML_ICI"
}
${imgNote}

Pour site_html, génère un site SaaS HTML COMPLET (minimum 500 lignes) :

STRUCTURE :
1. Header : logo SVG (LOGO_SVG_PLACEHOLDER), nav avec liens (Fonctionnalités/Tarifs/Blog/À propos), boutons Se connecter + Essai gratuit (gradient)
2. Hero : image fond ${heroUrl} avec overlay sombre, badge "Nouveau ✨ [feature clé]", H1 impact max, sous-titre bénéfice, 2 CTA (Essai gratuit + Voir démo), logos clients (5 logos SVG fictifs), métriques clés (ex: 10k+ utilisateurs, 4.9★, 99.9% uptime)
3. Mockup produit : fausse interface dashboard CSS avec graphiques, sidebar, header d'app — très stylisé
4. 6 Features : grille 2x3, chaque feature avec icône SVG inline, titre, description précise
5. "Comment ça marche" : 3 étapes numérotées avec images ${getImg(0)} ${getImg(1)} ${getImg(2)}
6. Stats sociales : compteurs animés (10k+ users, 99.9% uptime, 4.9/5 étoiles, 500+ intégrations)
7. Pricing : toggle mensuel/annuel (-20%), 3 plans cards, plan populaire mis en avant
8. Intégrations : logos d'outils compatibles (Slack, Notion, Zapier, etc.) en SVG simple
9. Témoignages : 3 témoignages avec photo (images Unsplash), nom, titre, entreprise, rating
10. FAQ : 5 questions avec accordion JS
11. CTA final : section gradient avec H2 fort + bouton
12. Footer complet

CSS : dark mode élégant (fond #0a0612), variables couleurs, glassmorphism sur les cards
JS : toggle pricing, FAQ accordion, compteurs animés, tabs features`,

vitrine: `${base}

Génère un site vitrine professionnel premium. JSON attendu :
{
  "nom": "Nom professionnel et mémorable",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Promesse professionnelle spécifique (5-8 mots)",
  "description": "Description en 2 phrases percutantes",
  "type": "vitrine",
  "couleur_primaire": "#hex adapté au secteur",
  "couleur_secondaire": "#hex",
  "couleur_accent": "#hex",
  "logo_initiales": "2 lettres",
  "domaines": ["marque.fr", "marque.com", "marque.pro"],
  "secteur": "secteur précis",
  "cible": "clientèle cible avec profil",
  "fonctionnalites": ["4-6 services concrets"],
  "services": [
    {"nom": "Service 1", "description": "Description détaillée 15 mots", "icone": "emoji", "prix": "À partir de X€"},
    {"nom": "Service 2", "description": "Description", "icone": "emoji", "prix": "Sur devis"},
    {"nom": "Service 3", "description": "Description", "icone": "emoji", "prix": "À partir de X€"},
    {"nom": "Service 4", "description": "Description", "icone": "emoji", "prix": "Sur devis"}
  ],
  "site_html": "SITE_HTML_ICI"
}
${imgNote}

Pour site_html, génère un site vitrine HTML COMPLET et ÉLÉGANT (minimum 450 lignes) :

STRUCTURE :
1. Header : logo SVG (LOGO_SVG_PLACEHOLDER), nav, numéro de tel, bouton "Devis gratuit"
2. Hero : image plein écran ${heroUrl} avec overlay, titre H1, sous-titre, 2 CTA, badges de confiance (X ans d'expérience, X clients, certifications)
3. Barre chiffres clés : 4 stats animées (ex: 10+ ans, 500+ clients, 98% satisfaction, X projets)
4. Services : titre section, grille 2x2 de cards avec icône grande, titre, description détaillée, prix indicatif
5. "Notre approche" : 3 étapes avec numéros stylisés et descriptions
6. Réalisations/Portfolio : 3 projets avec images ${getImg(0)} ${getImg(1)} ${getImg(2)}, titre, description, résultats
7. À propos : photo équipe ${hero2Url}, texte histoire, valeurs, certifications
8. Témoignages : 3 avis avec avatar, nom, poste, entreprise, 5 étoiles, texte précis
9. FAQ : 4 questions accordion
10. Formulaire contact : nom, prénom, email, téléphone, message, checkbox RGPD, bouton envoi
11. Footer : logo, services, coordonnées, réseaux sociaux

CSS : professionnel et épuré, couleurs cohérentes avec le secteur
JS : compteurs animés, FAQ accordion, formulaire validation, smooth scroll`,

landing: `${base}

Génère une landing page de conversion ultra-efficace. JSON attendu :
{
  "nom": "Nom accrocheur et mémorable",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Promesse irrésistible axée bénéfice (5-8 mots)",
  "description": "Description axée transformation client",
  "type": "landing",
  "couleur_primaire": "#hex",
  "couleur_secondaire": "#hex",
  "couleur_accent": "#hex fort pour CTA",
  "logo_initiales": "2 lettres",
  "domaines": ["marque.fr", "marque.com", "marque.io"],
  "secteur": "secteur précis",
  "cible": "persona ultra-précis avec problème identifié",
  "fonctionnalites": ["4 bénéfices transformationnels"],
  "site_html": "SITE_HTML_ICI"
}
${imgNote}

Pour site_html, génère une landing page HTML COMPLÈTE à haute conversion (minimum 450 lignes) :

STRUCTURE :
1. Header minimal : logo SVG (LOGO_SVG_PLACEHOLDER) + badge "Offre limitée" + CTA unique
2. Hero maximum impact : image fond ${heroUrl} + overlay, H1 problème/solution percutant, sous-titre bénéfice, formulaire inline (email + CTA), preuve sociale (X personnes ont déjà rejoint, logos médias)
3. Problème (section sombre) : "Tu en as assez de..." avec 3 points douloureux ❌
4. Solution : "Imagine si..." avec 3 bénéfices ✅ + image ${getImg(0)}
5. Comment ça marche : 3 étapes avec images ${getImg(1)} ${getImg(2)} ${getImg(3)}, numéros animés
6. Preuves sociales : compteurs (X clients, X résultats, X étoiles), logos partenaires
7. Témoignages : 3 témoignages RÉSULTATS CHIFFRÉS avec avant/après
8. Offre pricing : 1-2 plans max, garantie satisfaction 30j, urgence (places limitées)
9. Countdown timer JavaScript (72h)
10. FAQ 4 questions
11. CTA final massif : titre fort + formulaire + garanties
12. Footer minimal

JS : countdown timer dynamique, scroll reveal, formulaire capture email`,

marketplace: `${base}

Génère une marketplace complète et convaincante. JSON attendu :
{
  "nom": "Nom marketplace original",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Promesse double valeur acheteurs ET vendeurs",
  "description": "Description valeur des 2 côtés de la marketplace",
  "type": "marketplace",
  "couleur_primaire": "#hex",
  "couleur_secondaire": "#hex",
  "couleur_accent": "#hex",
  "logo_initiales": "2 lettres",
  "domaines": ["marque.fr", "marque.com", "marque.co"],
  "secteur": "niche marketplace précise",
  "cible": "acheteurs ET vendeurs — profils précis",
  "fonctionnalites": ["6 features marketplace"],
  "categories": ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5", "Cat 6"],
  "site_html": "SITE_HTML_ICI"
}
${imgNote}

Pour site_html, génère une marketplace HTML COMPLÈTE (minimum 480 lignes) :

STRUCTURE :
1. Header : logo SVG (LOGO_SVG_PLACEHOLDER), barre recherche centrale, boutons S'inscrire + Vendre/Proposer
2. Hero : image fond ${heroUrl}, titre, barre recherche grande, stats (X vendeurs, X produits, X transactions)
3. Catégories : 6 cards avec icônes emoji, nom catégorie, nombre d'annonces
4. Vendeurs en vedette : 3 profils avec image ${getImg(0)} ${getImg(1)} ${getImg(2)}, note ⭐, badge, nombre d'avis
5. Annonces populaires : grille 6 cards avec images ${getImg(0)}...${getImg(5)}, prix, vendeur, note, badge
6. "Comment ça marche" : 2 tabs (Acheter | Vendre), 3 étapes chacun
7. Garanties : icônes + texte (Paiement sécurisé, Protection acheteur, Vendeurs vérifiés)
8. Témoignages mixtes : acheteurs + vendeurs
9. CTA vendeurs : section dédiée avec avantages de vendre
10. Newsletter + Footer complet`,

blog: `${base}

Génère un blog/média professionnel premium. JSON attendu :
{
  "nom": "Nom publication crédible et mémorable",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Ligne éditoriale précise et engageante",
  "description": "Mission éditoriale claire en 2 phrases",
  "type": "blog",
  "couleur_primaire": "#hex adapté au thème",
  "couleur_secondaire": "#hex",
  "couleur_accent": "#hex",
  "logo_initiales": "2 lettres",
  "domaines": ["marque.fr", "marque.com", "marque.media"],
  "secteur": "thématique éditoriale précise",
  "cible": "lectorat précis avec intérêts",
  "fonctionnalites": ["6 fonctionnalités éditoriales"],
  "categories": ["Cat 1", "Cat 2", "Cat 3", "Cat 4"],
  "articles": [
    {"titre": "Titre accrocheur et précis", "categorie": "Cat", "temps_lecture": "5 min", "date": "Aujourd'hui", "auteur": "Prénom Nom", "extrait": "Résumé de 20 mots"},
    {"titre": "Article 2", "categorie": "Cat", "temps_lecture": "8 min", "date": "Hier", "auteur": "Prénom Nom", "extrait": "Résumé"},
    {"titre": "Article 3", "categorie": "Cat", "temps_lecture": "3 min", "date": "Il y a 2j", "auteur": "Prénom Nom", "extrait": "Résumé"},
    {"titre": "Article 4", "categorie": "Cat", "temps_lecture": "6 min", "date": "Il y a 3j", "auteur": "Prénom Nom", "extrait": "Résumé"},
    {"titre": "Article 5", "categorie": "Cat", "temps_lecture": "4 min", "date": "Il y a 4j", "auteur": "Prénom Nom", "extrait": "Résumé"},
    {"titre": "Article 6", "categorie": "Cat", "temps_lecture": "10 min", "date": "Il y a 5j", "auteur": "Prénom Nom", "extrait": "Résumé"}
  ],
  "site_html": "SITE_HTML_ICI"
}
${imgNote}

Pour site_html, génère un blog HTML COMPLET et ÉLÉGANT (minimum 450 lignes) :

STRUCTURE :
1. Header : logo SVG (LOGO_SVG_PLACEHOLDER), nav catégories, recherche, bouton S'abonner
2. Article hero à la une : image grande ${heroUrl}, badge catégorie, titre H1, extrait, auteur + date + temps lecture
3. Catégories filtrables : boutons avec compteur, JS pour filtrer les articles
4. Grille 6 articles : image ${getImg(0)}...${getImg(5)}, badge catégorie coloré, titre, extrait 20 mots, auteur, date, temps lecture
5. Section newsletter : design accrocheur, email input, compteur abonnés
6. Articles populaires : sidebar 3 mini-cards
7. À propos du média : photo équipe ${hero2Url}, mission, chiffres clés
8. Footer : catégories, liens utiles, réseaux sociaux, newsletter condensée

JS : filtres catégories, recherche live, mode sombre/clair toggle`

  };

  return templates[type] || templates['ecommerce'];
}

// ══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ══════════════════════════════════════════════════════════════

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token invalide ou expiré' });

  const { idee, type, identiteValidee } = req.body;
  if (!idee || idee.trim().length < 10) {
    return res.status(400).json({ error: 'Décris ton idée en au moins 10 caractères.' });
  }

  const planCheck = await checkPlanLimit(user.id);
  if (!planCheck.allowed) {
    return res.status(403).json({ error: planCheck.message, reason: planCheck.reason, plan: planCheck.plan });
  }

  try {
    // 1. Images Unsplash précises
    const images = await getAllImages(idee, type || 'ecommerce');
    console.log(`Images: ${images.all.length} total, ${images.products.length} produits`);

    // 2. Prompt
    const identiteContext = identiteValidee && identiteValidee.nom
      ? `\n\nIDENTITÉ VALIDÉE — RESPECTER ABSOLUMENT :
- Nom : "${identiteValidee.nom}" (ne pas changer)
- Slogan : "${identiteValidee.slogan}"
- Couleur primaire : ${identiteValidee.couleur_primaire}
- Couleur secondaire : ${identiteValidee.couleur_secondaire}
- Domaine : ${identiteValidee.domaine}`
      : '';

    const prompt = getPrompt(type || 'ecommerce', idee, images) + identiteContext;

    // 3. Appel Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 16000,
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
      console.error('JSON parse error:', e.message);
      return res.status(500).json({ error: 'Erreur de format IA. Réessaie.' });
    }

    // 4. Forcer identité validée
    if (identiteValidee && identiteValidee.nom) {
      result.nom = identiteValidee.nom;
      result.slogan = identiteValidee.slogan;
      result.couleur_primaire = identiteValidee.couleur_primaire;
      result.couleur_secondaire = identiteValidee.couleur_secondaire;
      if (identiteValidee.domaine) result.domaines = [identiteValidee.domaine, ...(result.domaines || []).filter(d => d !== identiteValidee.domaine)];
    }

    // 5. Logo
    let svgLogo = identiteValidee?.logo_svg || '';

    // 6. Injecter logo
    if (result.site_html) {
      if (svgLogo && result.site_html.includes('LOGO_SVG_PLACEHOLDER')) {
        result.site_html = result.site_html.replace(/LOGO_SVG_PLACEHOLDER/g, svgLogo.replace(/"/g, "'"));
      } else if (result.site_html.includes('LOGO_SVG_PLACEHOLDER')) {
        result.site_html = result.site_html.replace(/LOGO_SVG_PLACEHOLDER/g, '');
      }
    }

    // 7. Post-traitement images — assigner les bonnes images produits
    if (images.products.length > 0 && result.site_html) {
      let imgIndex = 0;
      result.site_html = result.site_html.replace(/<img([^>]*?)src="([^"]*?)"([^>]*?)>/gi, (match, before, src, after) => {
        if (src.includes('data:') || src.includes('logo') || before.includes('logo') || after.includes('logo')) {
          return match;
        }
        // Remplacer les images non-Unsplash
        if (!src.includes('unsplash') && !src.includes('images.unsplash') && imgIndex < images.products.length) {
          const newSrc = images.products[imgIndex].url;
          const newAlt = images.products[imgIndex].alt || '';
          imgIndex++;
          return `<img${before}src="${newSrc}"${after} alt="${newAlt}" loading="lazy">`;
        }
        return match;
      });
    }

    // 8. Titre HTML
    if (identiteValidee?.nom && result.site_html) {
      result.site_html = result.site_html.replace(/<title>[^<]*<\/title>/, `<title>${identiteValidee.nom}</title>`);
    }

    result.logo_svg = svgLogo;
    result.images_unsplash = images.all;

    // 9. Sauvegarder Supabase
    try {
      const { data: projet, error: projetError } = await supabase.from('projets').insert({
        user_id: user.id,
        nom: result.nom,
        slogan: result.slogan,
        logo_initiales: result.logo_initiales,
        logo_svg: svgLogo,
        couleur_primaire: result.couleur_primaire,
        couleur_secondaire: result.couleur_secondaire,
        domaine: result.domaines?.[0],
        type: result.type,
        idee: idee,
        site_html: result.site_html,
        statut: 'draft',
        created_at: new Date().toISOString()
      }).select().single();

      if (!projetError && projet) {
        result.projet_id = projet.id;
        if (planCheck.plan === 'pro' || planCheck.plan === 'business') {
          await supabase.from('users').update({ projets_ce_mois: (planCheck.projets_ce_mois || 0) + 1 }).eq('id', user.id);
        }
        const { data: userData } = await supabase.from('users').select('projets_count').eq('id', user.id).single();
        await supabase.from('users').update({ projets_count: (userData?.projets_count || 0) + 1 }).eq('id', user.id);
      }
    } catch (dbErr) {
      console.error('DB error (non-blocking):', dbErr);
    }

    return res.status(200).json({
      success: true,
      result,
      plan_info: { plan: planCheck.plan, projets_restants: planCheck.projets_restants ? planCheck.projets_restants - 1 : null }
    });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
};
