const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// ══════════════════════════════════════════════════════════════
// UNSPLASH — Récupérer des images par secteur
// ══════════════════════════════════════════════════════════════

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function getUnsplashImages(query, count = 6) {
  if (!UNSPLASH_KEY) return [];
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    return (data.results || []).map(p => ({
      url: p.urls.regular,
      small: p.urls.small,
      thumb: p.urls.thumb,
      alt: p.alt_description || query,
      author: p.user.name
    }));
  } catch (e) {
    console.error('Unsplash error:', e);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// UNSPLASH — Détection secteur (~60 secteurs + fallback intelligent)
// ══════════════════════════════════════════════════════════════

function getUnsplashQuery(type, idee) {
  const idea = idee.toLowerCase();

  // ── MODE & VÊTEMENTS ──
  if (idea.includes('cbd') || idea.includes('cannabis') || idea.includes('chanvre')) return 'cbd hemp wellness natural';
  if (idea.includes('street') || idea.includes('urban') || idea.includes('hype')) return 'streetwear fashion urban clothing';
  if (idea.includes('luxe') || idea.includes('luxury') || idea.includes('premium') || idea.includes('haut de gamme')) return 'luxury fashion elegant boutique';
  if (idea.includes('vêtement') || idea.includes('mode') || idea.includes('fring') || idea.includes('textile')) return 'fashion clothing store minimal';
  if (idea.includes('enfant') || idea.includes('bébé') || idea.includes('kid')) return 'children kids clothing baby';
  if (idea.includes('lingerie') || idea.includes('sous-vêtement')) return 'lingerie elegant fashion minimal';
  if (idea.includes('chaussure') || idea.includes('sneaker') || idea.includes('basket')) return 'sneakers shoes fashion footwear';
  if (idea.includes('bijou') || idea.includes('joaill') || idea.includes('bijoux')) return 'jewelry gold luxury accessories';
  if (idea.includes('maroquin') || idea.includes('sac') || idea.includes('bag')) return 'leather bag accessories luxury';
  if (idea.includes('chapeau') || idea.includes('casquette') || idea.includes('bonnet')) return 'hat cap fashion accessories';

  // ── BEAUTÉ & BIEN-ÊTRE ──
  if (idea.includes('cosmétique') || idea.includes('maquillage') || idea.includes('makeup')) return 'cosmetics makeup beauty products';
  if (idea.includes('soin') || idea.includes('skincare') || idea.includes('crème')) return 'skincare beauty natural products';
  if (idea.includes('parfum') || idea.includes('fragrance')) return 'perfume fragrance luxury bottle';
  if (idea.includes('coiffure') || idea.includes('salon') || idea.includes('barbier') || idea.includes('barber')) return 'hair salon barbershop grooming';
  if (idea.includes('spa') || idea.includes('massage') || idea.includes('détente')) return 'spa massage wellness relaxation';
  if (idea.includes('yoga') || idea.includes('méditation') || idea.includes('bien-être')) return 'yoga meditation wellness mindfulness';
  if (idea.includes('fit') || idea.includes('sport') || idea.includes('gym') || idea.includes('muscl')) return 'fitness gym workout training';
  if (idea.includes('nutrition') || idea.includes('complément') || idea.includes('protéine')) return 'nutrition supplements health food';
  if (idea.includes('tattoo') || idea.includes('tatouage') || idea.includes('piercing')) return 'tattoo art body art studio';

  // ── ALIMENTATION & BOISSONS ──
  if (idea.includes('restaurant') || idea.includes('resto') || idea.includes('brasserie')) return 'restaurant food dining elegant';
  if (idea.includes('café') || idea.includes('coffee') || idea.includes('barista')) return 'coffee cafe espresso barista';
  if (idea.includes('boulang') || idea.includes('pâtisserie') || idea.includes('bakery')) return 'bakery pastry bread croissant';
  if (idea.includes('pizza') || idea.includes('fast food') || idea.includes('burger')) return 'pizza burger fast food restaurant';
  if (idea.includes('sushi') || idea.includes('japonais') || idea.includes('asiatique')) return 'sushi japanese food asian cuisine';
  if (idea.includes('livraison') || idea.includes('delivery') || idea.includes('repas')) return 'food delivery meal service';
  if (idea.includes('bio') || idea.includes('organique') || idea.includes('vegan') || idea.includes('végétal')) return 'organic vegan healthy food natural';
  if (idea.includes('vin') || idea.includes('wine') || idea.includes('cave') || idea.includes('alcool')) return 'wine vineyard bottle cellar';
  if (idea.includes('bière') || idea.includes('brasserie') || idea.includes('craft beer')) return 'craft beer brewery bar';
  if (idea.includes('chocolat') || idea.includes('confiserie') || idea.includes('bonbon')) return 'chocolate sweets candy confectionery';
  if (idea.includes('traiteur') || idea.includes('catering')) return 'catering food event service';

  // ── IMMOBILIER & CONSTRUCTION ──
  if (idea.includes('immo') || idea.includes('agence') && idea.includes('maison')) return 'real estate house property luxury';
  if (idea.includes('architecte') || idea.includes('architecture')) return 'architecture building design modern';
  if (idea.includes('déco') || idea.includes('intérieur') || idea.includes('design') && idea.includes('maison')) return 'interior design home decor';
  if (idea.includes('jardin') || idea.includes('paysag') || idea.includes('garden')) return 'garden landscape nature green';
  if (idea.includes('construct') || idea.includes('bâtiment') || idea.includes('btp')) return 'construction building architecture';
  if (idea.includes('nettoy') || idea.includes('ménage') || idea.includes('cleaning')) return 'cleaning service home professional';

  // ── TECH & DIGITAL ──
  if (idea.includes('saas') || idea.includes('logiciel') || idea.includes('software')) return 'technology software dashboard interface';
  if (idea.includes('app') || idea.includes('mobile') || idea.includes('application')) return 'mobile app smartphone technology';
  if (idea.includes('ia') || idea.includes('intelligence artificielle') || idea.includes('ai')) return 'artificial intelligence technology future';
  if (idea.includes('crypto') || idea.includes('blockchain') || idea.includes('nft')) return 'cryptocurrency blockchain technology';
  if (idea.includes('cybersécurité') || idea.includes('securité') || idea.includes('security')) return 'cybersecurity technology protection digital';
  if (idea.includes('data') || idea.includes('analytics') || idea.includes('analyse')) return 'data analytics dashboard technology';
  if (idea.includes('ecommerce') || idea.includes('e-commerce') || idea.includes('boutique en ligne')) return 'ecommerce online shopping product';
  if (idea.includes('web') || idea.includes('site') || idea.includes('digital') || idea.includes('agence')) return 'digital agency technology web design';

  // ── SERVICES & B2B ──
  if (idea.includes('comptable') || idea.includes('comptabilité') || idea.includes('factur')) return 'accounting finance business office';
  if (idea.includes('avocat') || idea.includes('juridique') || idea.includes('droit')) return 'lawyer legal business professional';
  if (idea.includes('rh') || idea.includes('recrutement') || idea.includes('emploi')) return 'human resources recruitment office people';
  if (idea.includes('marketing') || idea.includes('publicité') || idea.includes('communication')) return 'marketing communication business creative';
  if (idea.includes('conseil') || idea.includes('consulting') || idea.includes('stratégie')) return 'consulting business strategy meeting';
  if (idea.includes('formation') || idea.includes('coaching') || idea.includes('cours')) return 'coaching training education learning';
  if (idea.includes('école') || idea.includes('université') || idea.includes('éducation')) return 'education school learning students';
  if (idea.includes('événement') || idea.includes('wedding') || idea.includes('mariage')) return 'event wedding celebration party';
  if (idea.includes('traduct') || idea.includes('langue') || idea.includes('translation')) return 'language translation communication global';
  if (idea.includes('graphiste') || idea.includes('design') || idea.includes('créatif')) return 'graphic design creative studio art';

  // ── TRANSPORT & MOBILITÉ ──
  if (idea.includes('voiture') || idea.includes('auto') || idea.includes('garage')) return 'car automobile automotive dealership';
  if (idea.includes('moto') || idea.includes('scooter')) return 'motorcycle scooter urban transport';
  if (idea.includes('vélo') || idea.includes('cyclisme') || idea.includes('vtt')) return 'bicycle cycling sport outdoor';
  if (idea.includes('taxi') || idea.includes('vtc') || idea.includes('chauffeur')) return 'taxi driver urban transport city';
  if (idea.includes('déménag') || idea.includes('transport') && idea.includes('meubl')) return 'moving transport logistics boxes';
  if (idea.includes('voyage') || idea.includes('tourisme') || idea.includes('vacances')) return 'travel tourism vacation destination';
  if (idea.includes('camping') || idea.includes('randonnée') || idea.includes('outdoor')) return 'camping outdoor adventure nature';

  // ── SANTÉ & MÉDICAL ──
  if (idea.includes('médecin') || idea.includes('médical') || idea.includes('santé')) return 'healthcare medical doctor hospital';
  if (idea.includes('dentiste') || idea.includes('dental')) return 'dental dentist teeth health';
  if (idea.includes('pharmacie') || idea.includes('pharma')) return 'pharmacy medicine health pills';
  if (idea.includes('vétérin') || idea.includes('animal') || idea.includes('pet') || idea.includes('chien') || idea.includes('chat')) return 'veterinary pet dog cat animal';
  if (idea.includes('psycholog') || idea.includes('thérapeute') || idea.includes('thérapie')) return 'psychology therapy mental health wellness';

  // ── ARTS & LOISIRS ──
  if (idea.includes('musique') || idea.includes('music') || idea.includes('studio')) return 'music studio recording instrument';
  if (idea.includes('photo') || idea.includes('photographe')) return 'photography photographer camera portrait';
  if (idea.includes('vidéo') || idea.includes('film') || idea.includes('cinéma')) return 'video film cinema production';
  if (idea.includes('jeu') || idea.includes('gaming') || idea.includes('esport')) return 'gaming esport video game controller';
  if (idea.includes('art') || idea.includes('galerie') || idea.includes('peinture')) return 'art gallery painting exhibition creative';
  if (idea.includes('livre') || idea.includes('librairie') || idea.includes('édition')) return 'books library reading literature';
  if (idea.includes('sport') || idea.includes('foot') || idea.includes('football')) return 'football sport team athletic';
  if (idea.includes('piscine') || idea.includes('natation') || idea.includes('aqua')) return 'swimming pool water sport aquatic';

  // ── MARKETPLACE & COMMUNAUTÉ ──
  if (idea.includes('artisan') || idea.includes('fait main') || idea.includes('handmade')) return 'artisan handmade craft workshop';
  if (idea.includes('seconde main') || idea.includes('occasion') || idea.includes('vintage')) return 'vintage second hand thrift market';
  if (idea.includes('communauté') || idea.includes('réseau') || idea.includes('platform')) return 'community people network connection';

  // ── FALLBACK INTELLIGENT ──
  // Extraire les mots significatifs de l'idée et construire une query anglaise
  const stopWords = ['je', 'veux', 'veut', 'créer', 'faire', 'lancer', 'ouvrir', 'une', 'un', 'des', 'les', 'mon', 'ma', 'pour', 'avec', 'qui', 'dans', 'sur', 'de', 'du', 'la', 'le', 'et', 'ou', 'en', 'par', 'à', 'au', 'aux'];
  const words = idea.split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w));

  // Traductions français -> anglais pour les mots courants
  const translations = {
    'boutique': 'store', 'magasin': 'shop', 'vente': 'sale', 'produit': 'product',
    'service': 'service', 'entreprise': 'business', 'société': 'company',
    'professionnel': 'professional', 'moderne': 'modern', 'luxe': 'luxury',
    'qualité': 'quality', 'artisan': 'artisan', 'local': 'local',
    'naturel': 'natural', 'écologique': 'eco', 'durable': 'sustainable',
    'innovant': 'innovative', 'technologie': 'technology', 'numérique': 'digital',
    'créatif': 'creative', 'design': 'design', 'agence': 'agency'
  };

  const translated = words.slice(0, 3).map(w => translations[w] || w).join(' ');

  // Fallback par type si pas assez de mots
  if (translated.length < 4) {
    if (type === 'ecommerce') return 'ecommerce products shopping';
    if (type === 'saas') return 'technology software business';
    if (type === 'vitrine') return 'professional business service';
    if (type === 'landing') return 'modern minimal design';
    if (type === 'marketplace') return 'marketplace community people';
    if (type === 'blog') return 'lifestyle content writing';
    return 'business professional modern';
  }

  return translated;
}

// ══════════════════════════════════════════════════════════════
// SVG LOGO — Généré par Claude
// ══════════════════════════════════════════════════════════════

async function generateSVGLogo(nom, initiales, couleur1, couleur2) {
  try {
    const prompt = `Génère un logo SVG minimaliste et professionnel pour une marque nommée "${nom}" avec les initiales "${initiales}".
Utilise ces couleurs : primaire ${couleur1}, secondaire ${couleur2}.
Le logo doit être dans un carré de 100x100px, avec un fond dégradé et les initiales en blanc centré.
Réponds UNIQUEMENT avec le code SVG complet, rien d'autre.
Exemple de format attendu : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>`;

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
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim();
    const svgMatch = text.match(/<svg[\s\S]*<\/svg>/);
    if (svgMatch) return svgMatch[0];
  } catch (e) {
    console.error('SVG logo error:', e);
  }

  // Fallback SVG simple
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:${couleur1}"/>
    <stop offset="100%" style="stop-color:${couleur2}"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="20" fill="url(#g)"/>
  <text x="50" y="62" font-family="Inter,sans-serif" font-size="${initiales.length > 2 ? '26' : '32'}" font-weight="800" fill="white" text-anchor="middle">${initiales}</text>
</svg>`;
}

// ══════════════════════════════════════════════════════════════
// PROMPTS DÉDIÉS PAR TYPE DE SITE — Genproia v4.0
// ══════════════════════════════════════════════════════════════

function getPrompt(type, idee, images) {
  const base = `Tu es Genproia, un générateur de business complet propulsé par l'IA.
L'utilisateur veut créer ce projet : "${idee}"
Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après.`;

  // Instructions images Unsplash à injecter dans les prompts
  const imgInstructions = images && images.length > 0
    ? `\n\nIMPORTANT — Images disponibles (Unsplash, libres de droits) à utiliser dans le HTML :
${images.map((img, i) => `Image ${i+1}: ${img.url} (alt: "${img.alt}")`).join('\n')}
Utilise ces vraies URLs d'images dans les balises <img> du site. Ne génère PAS de placeholders CSS pour les images — utilise ces vraies photos Unsplash.
Ajoute l'attribut loading="lazy" sur chaque image.`
    : `\n\nPas d'images Unsplash disponibles — utilise des dégradés CSS colorés comme placeholder d'images.`;

  const siteInstructions = {

    ecommerce: `${base}

Génère un business e-commerce complet et cohérent avec l'idée. Le JSON doit contenir :
{
  "nom": "Nom de marque court, mémorable, original (1-2 mots max)",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan accrocheur en français (5-8 mots)",
  "description": "Description du business en 2 phrases percutantes",
  "type": "ecommerce",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "couleur_accent": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.shop"],
  "secteur": "secteur d'activité précis",
  "cible": "cible client précise",
  "fonctionnalites": ["Catalogue produits filtrable", "Panier et checkout sécurisé", "Paiement Stripe", "Fiches produits détaillées", "Système d'avis clients", "Programme fidélité"],
  "produits": [
    {"nom": "Nom produit 1 cohérent", "prix": 49, "description": "Description courte", "badge": "Nouveau"},
    {"nom": "Nom produit 2", "prix": 79, "description": "Description courte", "badge": "Bestseller"},
    {"nom": "Nom produit 3", "prix": 39, "description": "Description courte", "badge": ""},
    {"nom": "Nom produit 4", "prix": 129, "description": "Description courte", "badge": "Premium"},
    {"nom": "Nom produit 5", "prix": 59, "description": "Description courte", "badge": ""},
    {"nom": "Nom produit 6", "prix": 89, "description": "Description courte", "badge": "Populaire"}
  ],
  "site_html": "..."
}
${imgInstructions}

Pour site_html, génère un vrai site e-commerce HTML complet et professionnel avec :
- Header fixe avec logo SVG (LOGO_SVG_PLACEHOLDER), navigation, icône panier avec badge compteur
- Hero section avec image de fond (utilise Image 1 si disponible), titre accrocheur, CTA "Découvrir la boutique"
- Barre de réassurance (Livraison gratuite | Retours 30j | Paiement sécurisé | Service client 7j/7)
- Section "Nos produits" : grille de 6 cards avec vraies photos Unsplash (Images 1-6), badge, nom, prix, bouton "Ajouter au panier"
- Section "Pourquoi nous choisir" avec 4 avantages
- Témoignages 5 étoiles cohérents avec le secteur
- Newsletter + Footer complet
- CSS moderne avec variables couleurs, hover effects, responsive
- JavaScript : panier fonctionnel, notification "Ajouté au panier", animation scroll
- Minimum 400 lignes, tout en français`,

    saas: `${base}

Génère un business SaaS complet. Le JSON doit contenir :
{
  "nom": "Nom tech mémorable (1-2 mots)",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Slogan avec bénéfice concret (5-8 mots)",
  "description": "Description en 2 phrases",
  "type": "saas",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "couleur_accent": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.io", "domaine.app", "domaine.fr"],
  "secteur": "secteur SaaS précis",
  "cible": "cible entreprise/métier",
  "fonctionnalites": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6"],
  "plans": [
    {"nom": "Starter", "prix": 0, "features": ["F1", "F2", "F3"], "cta": "Commencer gratuitement"},
    {"nom": "Pro", "prix": 29, "features": ["Tout Starter", "F4", "F5", "Support prioritaire"], "cta": "Essai 14 jours", "populaire": true},
    {"nom": "Enterprise", "prix": 99, "features": ["Tout Pro", "API", "SSO", "SLA"], "cta": "Contacter"}
  ],
  "site_html": "..."
}
${imgInstructions}

Pour site_html, génère un vrai site SaaS HTML avec :
- Header avec logo SVG (LOGO_SVG_PLACEHOLDER), nav, boutons connexion/essai gratuit
- Hero avec image de fond (Image 1), titre H1 fort, stats réassurance
- Mockup dashboard CSS simulé
- 6 features avec icônes SVG inline
- 3 étapes "Comment ça marche"
- Pricing 3 plans avec toggle mensuel/annuel (-20%)
- 3 témoignages avec avatars
- FAQ accordion (5 questions)
- CTA final + Footer
- JavaScript : toggle pricing, FAQ accordion, compteurs animés
- Minimum 450 lignes`,

    vitrine: `${base}

Génère un site vitrine professionnel. Le JSON doit contenir :
{
  "nom": "Nom professionnel mémorable",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Promesse professionnelle claire (5-8 mots)",
  "description": "Description en 2 phrases",
  "type": "vitrine",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "couleur_accent": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.pro"],
  "secteur": "secteur précis",
  "cible": "clientèle cible",
  "fonctionnalites": ["Service 1", "Service 2", "Service 3", "Service 4"],
  "services": [
    {"nom": "Service 1", "description": "Description détaillée", "icone": "emoji"},
    {"nom": "Service 2", "description": "Description", "icone": "emoji"},
    {"nom": "Service 3", "description": "Description", "icone": "emoji"},
    {"nom": "Service 4", "description": "Description", "icone": "emoji"}
  ],
  "site_html": "..."
}
${imgInstructions}

Pour site_html, génère un vrai site vitrine HTML avec :
- Header avec logo SVG (LOGO_SVG_PLACEHOLDER), nav, bouton contact
- Hero avec image de fond (Image 1 si dispo), titre, 2 CTA, badges confiance
- 4 cards services avec icônes
- Section "À propos" avec chiffres clés
- 3 réalisations/cas clients avec photos (Images 2-4)
- 3 témoignages avec avatars
- Formulaire contact complet avec validation JS
- Footer professionnel
- Minimum 400 lignes`,

    landing: `${base}

Génère une landing page de conversion. Le JSON doit contenir :
{
  "nom": "Nom percutant",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Promesse irrésistible (5-8 mots)",
  "description": "Description axée bénéfice client",
  "type": "landing",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "couleur_accent": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.io"],
  "secteur": "secteur précis",
  "cible": "persona précis avec problème",
  "fonctionnalites": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3", "Bénéfice 4"],
  "site_html": "..."
}
${imgInstructions}

Pour site_html, génère une landing page HTML ultra-efficace avec :
- Header minimal : logo SVG (LOGO_SVG_PLACEHOLDER) + CTA unique
- Hero ultra-impactant avec image (Image 1), titre H1 problème/solution, formulaire email inline, preuve sociale
- Section problème (3 points ❌) + solution (3 points ✅)
- 3 étapes "Comment ça marche" avec images (Images 2-4)
- 4 features avec icônes
- 3 témoignages avec résultats chiffrés
- Countdown timer JavaScript (72h)
- Pricing simple (1-2 plans)
- FAQ 4 questions
- CTA final massif
- Footer minimal
- Minimum 380 lignes, copywriting conversion`,

    marketplace: `${base}

Génère une marketplace complète. Le JSON doit contenir :
{
  "nom": "Nom marketplace mémorable",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Slogan acheteurs-vendeurs (5-8 mots)",
  "description": "Description valeur acheteurs ET vendeurs",
  "type": "marketplace",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "couleur_accent": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.co"],
  "secteur": "secteur marketplace",
  "cible": "acheteurs ET vendeurs",
  "fonctionnalites": ["Mise en relation", "Paiement sécurisé", "Avis", "Messagerie", "Dashboard vendeur", "Protection acheteur"],
  "categories": ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5", "Cat 6"],
  "vendeurs": [
    {"nom": "Vendeur 1", "note": 4.9, "avis": 127, "badge": "Top vendeur"},
    {"nom": "Vendeur 2", "note": 4.8, "avis": 89, "badge": "Certifié"},
    {"nom": "Vendeur 3", "note": 4.7, "avis": 203, "badge": ""}
  ],
  "site_html": "..."
}
${imgInstructions}

Pour site_html, génère une vraie marketplace HTML avec :
- Header avec logo SVG (LOGO_SVG_PLACEHOLDER), recherche centrale, boutons inscription/vendre
- Hero avec image (Image 1), titre, barre recherche, stats
- 6 catégories avec icônes et compteurs
- 3 vendeurs en vedette avec avatars, notes, badges
- 6 annonces avec photos (Images 1-6), prix, notes
- Comment ça marche (acheteurs | vendeurs)
- Section confiance et garanties
- 3 témoignages mixtes
- Newsletter + CTA vendeurs + Footer
- Minimum 420 lignes`,

    blog: `${base}

Génère un blog/média professionnel. Le JSON doit contenir :
{
  "nom": "Nom publication crédible",
  "nom_alternatives": ["Alt 1", "Alt 2"],
  "slogan": "Ligne éditoriale claire (5-8 mots)",
  "description": "Mission éditoriale en 2 phrases",
  "type": "blog",
  "couleur_primaire": "#hexcode",
  "couleur_secondaire": "#hexcode",
  "couleur_accent": "#hexcode",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.media"],
  "secteur": "thématique éditoriale",
  "cible": "lectorat cible",
  "fonctionnalites": ["Articles de fond", "Newsletter", "Podcasts", "Communauté", "Premium", "Archives"],
  "categories": ["Cat 1", "Cat 2", "Cat 3", "Cat 4"],
  "articles": [
    {"titre": "Article 1 accrocheur", "categorie": "Cat", "temps_lecture": "5 min", "date": "Aujourd'hui"},
    {"titre": "Article 2", "categorie": "Cat", "temps_lecture": "8 min", "date": "Hier"},
    {"titre": "Article 3", "categorie": "Cat", "temps_lecture": "3 min", "date": "Il y a 2 jours"},
    {"titre": "Article 4", "categorie": "Cat", "temps_lecture": "6 min", "date": "Il y a 3 jours"},
    {"titre": "Article 5", "categorie": "Cat", "temps_lecture": "4 min", "date": "Il y a 4 jours"},
    {"titre": "Article 6", "categorie": "Cat", "temps_lecture": "10 min", "date": "Il y a 5 jours"}
  ],
  "site_html": "..."
}
${imgInstructions}

Pour site_html, génère un vrai blog HTML avec :
- Header avec logo SVG (LOGO_SVG_PLACEHOLDER), nav catégories, recherche, bouton s'abonner
- Hero article à la une avec image (Image 1), badge catégorie, titre H1, auteur + date
- Barre catégories filtrables (JS)
- Grille 6 articles avec photos (Images 1-6), badges, titres, extraits, auteurs
- Sidebar : articles populaires, newsletter, tags
- Grande section newsletter
- À propos du média avec équipe (3 personnes)
- Footer complet
- JavaScript : filtres catégories, recherche live, mode sombre/clair
- Minimum 400 lignes`
  };

  return siteInstructions[type] || siteInstructions['ecommerce'];
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

  // Auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token invalide ou expiré' });

  const { idee, type } = req.body;
  if (!idee || idee.trim().length < 10) {
    return res.status(400).json({ error: 'Décris ton idée en au moins 10 caractères.' });
  }

  try {
    // 1. Récupérer les images Unsplash en parallèle
    const unsplashQuery = getUnsplashQuery(type || 'ecommerce', idee);
    const images = await getUnsplashImages(unsplashQuery, 6);
    console.log(`Unsplash: ${images.length} images pour "${unsplashQuery}"`);

    // 2. Construire le prompt avec les images
    const prompt = getPrompt(type || 'ecommerce', idee, images);

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
      console.error('JSON parse error:', e.message, '| Raw:', text.substring(0, 300));
      return res.status(500).json({ error: 'Erreur de format IA. Réessaie.' });
    }

    // 4. Générer le logo SVG
    const svgLogo = await generateSVGLogo(
      result.nom,
      result.logo_initiales || result.nom.substring(0, 2).toUpperCase(),
      result.couleur_primaire || '#7c3aed',
      result.couleur_secondaire || '#ec4899'
    );

    // 5. Injecter le logo SVG dans le site HTML
    if (result.site_html && result.site_html.includes('LOGO_SVG_PLACEHOLDER')) {
      const svgInline = svgLogo.replace(/"/g, "'");
      result.site_html = result.site_html.replace(/LOGO_SVG_PLACEHOLDER/g, svgInline);
    }

    // 6. Sauvegarder le SVG logo dans le résultat
    result.logo_svg = svgLogo;
    result.images_unsplash = images;

    // 7. Sauvegarder dans Supabase
    try {
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
        statut: 'draft',
        created_at: new Date().toISOString()
      }).select().single();

      if (projetError) {
        console.error('Supabase insert error:', projetError);
      } else if (projet) {
        result.projet_id = projet.id;
        const { data: userData } = await supabase
          .from('users')
          .select('projets_count')
          .eq('id', user.id)
          .single();
        await supabase.from('users').update({
          projets_count: (userData?.projets_count || 0) + 1
        }).eq('id', user.id);
      }
    } catch (dbErr) {
      console.error('DB error (non-blocking):', dbErr);
    }

    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
};
