const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// ══════════════════════════════════════════════════════════════
// PROMPTS DÉDIÉS PAR TYPE DE SITE — Genproia v3.0
// ══════════════════════════════════════════════════════════════

function getPrompt(type, idee) {

  const base = `Tu es Genproia, un générateur de business complet propulsé par l'IA.
L'utilisateur veut créer ce projet : "${idee}"
Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après.`;

  const siteInstructions = {

    // ─────────────────────────────────────────────
    // E-COMMERCE
    // ─────────────────────────────────────────────
    ecommerce: `${base}

Génère un business e-commerce complet et cohérent avec l'idée. Le JSON doit contenir :

{
  "nom": "Nom de marque court, mémorable, original (1-2 mots max)",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan accrocheur en français (5-8 mots)",
  "description": "Description du business en 2 phrases percutantes",
  "type": "ecommerce",
  "couleur_primaire": "#hexcode — couleur principale cohérente avec le secteur",
  "couleur_secondaire": "#hexcode — couleur complémentaire harmonieuse",
  "couleur_accent": "#hexcode — couleur d'accentuation pour les CTA",
  "logo_initiales": "2-3 lettres pour le logo",
  "domaines": ["domaine.fr", "domaine.com", "domaine.shop"],
  "secteur": "secteur d'activité précis",
  "cible": "cible client précise (âge, profil, besoin)",
  "fonctionnalites": ["Catalogue produits filtrable", "Panier et checkout sécurisé", "Paiement Stripe", "Fiches produits détaillées", "Système d'avis clients", "Programme fidélité"],
  "produits": [
    {"nom": "Nom produit 1 cohérent avec l'idée", "prix": 49, "description": "Description courte du produit", "badge": "Nouveau"},
    {"nom": "Nom produit 2", "prix": 79, "description": "Description courte", "badge": "Bestseller"},
    {"nom": "Nom produit 3", "prix": 39, "description": "Description courte", "badge": ""},
    {"nom": "Nom produit 4", "prix": 129, "description": "Description courte", "badge": "Premium"},
    {"nom": "Nom produit 5", "prix": 59, "description": "Description courte", "badge": ""},
    {"nom": "Nom produit 6", "prix": 89, "description": "Description courte", "badge": "Populaire"}
  ],
  "site_html": "VOIR INSTRUCTIONS CI-DESSOUS"
}

Pour site_html, génère un vrai site e-commerce HTML complet et professionnel avec :
- Header fixe avec logo, navigation (Accueil, Boutique, À propos, Contact), icône panier avec badge compteur
- Hero section avec grande image de fond (dégradé couleur_primaire), titre accrocheur, sous-titre, bouton CTA "Découvrir la boutique"
- Barre de réassurance (Livraison gratuite | Retours 30j | Paiement sécurisé | Service client 7j/7)
- Section "Nos produits" avec grille de 6 cards produits, chaque card ayant : image placeholder stylée avec les couleurs de la marque, badge (Nouveau/Bestseller/etc), nom, description, prix, bouton "Ajouter au panier"
- Section "Pourquoi nous choisir" avec 4 avantages iconiques
- Section témoignages avec 3 avis clients 5 étoiles cohérents avec le secteur
- Newsletter avec champ email et bouton
- Footer complet avec logo, liens, réseaux sociaux, copyright
- CSS moderne : variables CSS pour les couleurs de la marque, hover effects, transitions fluides, responsive mobile parfait
- JavaScript : compteur panier fonctionnel, animation au scroll, notification "Ajouté au panier"
- Minimum 400 lignes de HTML
- Tout en français, cohérent avec l'identité de la marque`,

    // ─────────────────────────────────────────────
    // SAAS
    // ─────────────────────────────────────────────
    saas: `${base}

Génère un business SaaS complet et cohérent avec l'idée. Le JSON doit contenir :

{
  "nom": "Nom de marque court, mémorable, tech (1-2 mots max)",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan qui promet un bénéfice concret (5-8 mots)",
  "description": "Description du SaaS en 2 phrases avec le problème résolu et la solution",
  "type": "saas",
  "couleur_primaire": "#hexcode — couleur tech/pro cohérente",
  "couleur_secondaire": "#hexcode — couleur secondaire",
  "couleur_accent": "#hexcode — couleur CTA",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.io", "domaine.app", "domaine.fr"],
  "secteur": "secteur SaaS précis",
  "cible": "cible (type d'entreprise, taille, métier)",
  "fonctionnalites": ["Feature principale 1", "Feature principale 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6"],
  "plans": [
    {"nom": "Starter", "prix": 0, "features": ["Feature 1", "Feature 2", "Feature 3"], "cta": "Commencer gratuitement"},
    {"nom": "Pro", "prix": 29, "features": ["Tout Starter", "Feature 4", "Feature 5", "Feature 6", "Support prioritaire"], "cta": "Essai 14 jours", "populaire": true},
    {"nom": "Enterprise", "prix": 99, "features": ["Tout Pro", "API illimitée", "SSO", "SLA garanti", "Account manager"], "cta": "Contacter les ventes"}
  ],
  "site_html": "VOIR INSTRUCTIONS CI-DESSOUS"
}

Pour site_html, génère un vrai site SaaS HTML complet et professionnel avec :
- Header fixe avec logo, navigation (Fonctionnalités, Tarifs, Témoignages, Blog), boutons "Se connecter" et "Essai gratuit" (CTA principal)
- Hero section impact : titre H1 ultra fort qui résout un problème, sous-titre explicatif, 2 CTA (Essai gratuit 14j + Voir la démo), stats de réassurance (X clients, Y% satisfaction, Z heures économisées/mois)
- Section "Dashboard preview" : mockup d'interface fictif stylisé en CSS pur (fenêtre de browser avec des éléments UI simulés)
- Section features : 6 fonctionnalités avec icônes SVG inline, titre et description pour chacune
- Section "Comment ça marche" : 3 étapes numérotées
- Section pricing : 3 plans côte à côte avec toggle mensuel/annuel (prix annuel = -20%), plan populaire mis en avant
- Section témoignages : 3 témoignages avec photo avatar, nom, titre, entreprise, note 5 étoiles
- FAQ : 5 questions/réponses en accordion JavaScript
- CTA final : grande section avec titre et bouton "Commencer maintenant"
- Footer tech avec liens, statut système, conformité RGPD
- CSS : design SaaS moderne (dark/light selon secteur), animations subtiles, responsive parfait
- JavaScript : toggle pricing mensuel/annuel, FAQ accordion, compteur animé pour les stats
- Minimum 450 lignes, tout en français`,

    // ─────────────────────────────────────────────
    // VITRINE
    // ─────────────────────────────────────────────
    vitrine: `${base}

Génère un site vitrine professionnel complet et cohérent avec l'idée. Le JSON doit contenir :

{
  "nom": "Nom d'entreprise professionnel et mémorable",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Promesse claire et professionnelle (5-8 mots)",
  "description": "Description de l'entreprise en 2 phrases avec expertise et valeur ajoutée",
  "type": "vitrine",
  "couleur_primaire": "#hexcode — couleur sérieuse et professionnelle",
  "couleur_secondaire": "#hexcode — couleur complémentaire",
  "couleur_accent": "#hexcode — couleur pour les CTA",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.pro"],
  "secteur": "secteur d'activité précis",
  "cible": "clientèle cible précise",
  "fonctionnalites": ["Service 1", "Service 2", "Service 3", "Service 4"],
  "services": [
    {"nom": "Service 1 cohérent avec l'idée", "description": "Description détaillée du service", "icone": "emoji"},
    {"nom": "Service 2", "description": "Description détaillée", "icone": "emoji"},
    {"nom": "Service 3", "description": "Description détaillée", "icone": "emoji"},
    {"nom": "Service 4", "description": "Description détaillée", "icone": "emoji"}
  ],
  "site_html": "VOIR INSTRUCTIONS CI-DESSOUS"
}

Pour site_html, génère un vrai site vitrine HTML complet et professionnel avec :
- Header fixe élégant avec logo, navigation (Accueil, Services, À propos, Réalisations, Contact), bouton "Nous contacter"
- Hero section : grande image de fond en dégradé, titre accrocheur, sous-titre avec valeur ajoutée, 2 CTA (Nos services + Nous contacter), badges de confiance (Années d'expérience, Clients satisfaits, Projets réalisés)
- Section services : 4 cards avec icône, titre, description, lien "En savoir plus"
- Section "À propos" : texte de présentation, liste de valeurs, chiffres clés (année création, clients, projets, satisfaction)
- Section "Nos réalisations" : 3 projets/cas clients avec description et résultats
- Section témoignages : 3 avis clients avec nom, entreprise, photo avatar CSS, note étoiles
- Formulaire de contact complet : nom, email, téléphone, sujet, message, bouton envoyer avec validation JS
- Footer professionnel : logo, description, services, coordonnées, réseaux sociaux, mentions légales
- CSS : design corporate élégant, palette couleurs de la marque, typographie professionnelle, responsive parfait
- JavaScript : formulaire de contact avec validation, animation au scroll, menu mobile hamburger
- Minimum 400 lignes, tout en français, ton professionnel`,

    // ─────────────────────────────────────────────
    // LANDING PAGE
    // ─────────────────────────────────────────────
    landing: `${base}

Génère une landing page de conversion ultra-efficace et cohérente avec l'idée. Le JSON doit contenir :

{
  "nom": "Nom de marque court et percutant",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Promesse de valeur claire et irrésistible (5-8 mots)",
  "description": "Description en 2 phrases axées sur le bénéfice client",
  "type": "landing",
  "couleur_primaire": "#hexcode — couleur forte et engageante",
  "couleur_secondaire": "#hexcode — couleur secondaire",
  "couleur_accent": "#hexcode — couleur CTA ultra visible",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.io"],
  "secteur": "secteur précis",
  "cible": "persona précis avec problème spécifique",
  "fonctionnalites": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3", "Bénéfice 4"],
  "site_html": "VOIR INSTRUCTIONS CI-DESSOUS"
}

Pour site_html, génère une landing page HTML de conversion ultra-efficace avec :
- Header minimal : logo + bouton CTA unique "Commencer maintenant"
- Hero section ultra-impactant : titre H1 qui parle directement au problème du client, sous-titre avec la promesse de résultat, formulaire d'inscription email inline (email + bouton), preuve sociale sous le formulaire (X personnes déjà inscrites, logos de médias/partenaires)
- Barre de social proof : logos d'entreprises clientes ou médias (simulés en CSS)
- Section "Le problème" : 3 points de douleur du client avec icônes ❌
- Section "La solution" : 3 bénéfices avec icônes ✅, transformation avant/après
- Section "Comment ça marche" : 3 étapes simples et numérotées
- Section features : 4 avantages avec icônes et descriptions courtes
- Section témoignages vidéo : 3 témoignages avec avatar, citation forte, résultat chiffré
- Section urgence/scarcité : countdown timer JavaScript, places limitées ou offre limitée dans le temps
- Section pricing simple : 1 seul plan ou 2 maximum, très clair
- FAQ : 4 objections courantes répondues
- CTA final massif : grande section colorée avec titre fort et bouton énorme
- Footer minimaliste : mentions légales, confidentialité
- CSS : design psychologiquement optimisé pour la conversion, couleurs de la marque, boutons CTA très visibles, responsive parfait
- JavaScript : countdown timer fonctionnel (72h), formulaire avec validation, scroll smooth
- Minimum 380 lignes, tout en français, copywriting orienté conversion`,

    // ─────────────────────────────────────────────
    // MARKETPLACE
    // ─────────────────────────────────────────────
    marketplace: `${base}

Génère une marketplace complète et cohérente avec l'idée. Le JSON doit contenir :

{
  "nom": "Nom de marketplace mémorable et évocateur",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan qui connecte acheteurs et vendeurs (5-8 mots)",
  "description": "Description en 2 phrases expliquant la valeur pour acheteurs ET vendeurs",
  "type": "marketplace",
  "couleur_primaire": "#hexcode — couleur de confiance",
  "couleur_secondaire": "#hexcode — couleur complémentaire",
  "couleur_accent": "#hexcode — couleur CTA",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.co"],
  "secteur": "secteur de la marketplace",
  "cible": "acheteurs ET vendeurs ciblés",
  "fonctionnalites": ["Mise en relation", "Paiement sécurisé", "Système d'avis", "Messagerie intégrée", "Tableau de bord vendeur", "Protection acheteur"],
  "categories": ["Catégorie 1 cohérente", "Catégorie 2", "Catégorie 3", "Catégorie 4", "Catégorie 5", "Catégorie 6"],
  "vendeurs": [
    {"nom": "Vendeur/Prestataire 1 cohérent", "note": 4.9, "avis": 127, "badge": "Top vendeur"},
    {"nom": "Vendeur/Prestataire 2", "note": 4.8, "avis": 89, "badge": "Certifié"},
    {"nom": "Vendeur/Prestataire 3", "note": 4.7, "avis": 203, "badge": ""}
  ],
  "site_html": "VOIR INSTRUCTIONS CI-DESSOUS"
}

Pour site_html, génère une vraie marketplace HTML complète et professionnelle avec :
- Header avec logo, barre de recherche centrale avec filtre catégorie, boutons "S'inscrire" et "Proposer mes services/produits"
- Hero section : titre fort, sous-titre, grande barre de recherche avec exemples de recherches populaires, stats (X vendeurs, Y catégories, Z transactions)
- Section catégories : grille de 6 catégories avec icône emoji et nombre d'annonces
- Section "Vendeurs/Prestataires en vedette" : 3 cards avec avatar CSS, nom, spécialité, note étoiles, nombre d'avis, badge, bouton "Voir le profil"
- Section "Dernières annonces/offres" : 6 cards avec image placeholder stylée, titre, vendeur, prix, note
- Section "Comment ça marche" : 2 colonnes (Pour les acheteurs | Pour les vendeurs) avec 3 étapes chacune
- Section confiance : garanties, protection, paiement sécurisé, assurance
- Section témoignages : 3 avis mixtes acheteurs/vendeurs
- Newsletter et CTA final pour les vendeurs
- Footer complet avec catégories, liens utiles, app mobile (si pertinent), réseaux sociaux
- CSS : design marketplace moderne, système de notation étoiles CSS, cards hover effects, responsive
- JavaScript : barre de recherche avec suggestions, filtres catégories, pagination simulée
- Minimum 420 lignes, tout en français`,

    // ─────────────────────────────────────────────
    // BLOG / MÉDIA
    // ─────────────────────────────────────────────
    blog: `${base}

Génère un blog/média professionnel complet et cohérent avec l'idée. Le JSON doit contenir :

{
  "nom": "Nom de publication mémorable et crédible",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Ligne éditoriale claire (5-8 mots)",
  "description": "Description en 2 phrases sur la mission éditoriale et la cible",
  "type": "blog",
  "couleur_primaire": "#hexcode — couleur éditoriale forte",
  "couleur_secondaire": "#hexcode — couleur secondaire",
  "couleur_accent": "#hexcode — couleur liens et CTA",
  "logo_initiales": "2-3 lettres",
  "domaines": ["domaine.fr", "domaine.com", "domaine.media"],
  "secteur": "thématique éditoriale précise",
  "cible": "lectorat cible précis",
  "fonctionnalites": ["Articles de fond", "Newsletter", "Podcasts/Vidéos", "Communauté membres", "Contenu premium", "Archives searchables"],
  "categories": ["Catégorie 1 cohérente", "Catégorie 2", "Catégorie 3", "Catégorie 4"],
  "articles": [
    {"titre": "Article 1 accrocheur et cohérent avec le thème", "categorie": "Catégorie", "temps_lecture": "5 min", "date": "Aujourd'hui"},
    {"titre": "Article 2 très intéressant", "categorie": "Catégorie", "temps_lecture": "8 min", "date": "Hier"},
    {"titre": "Article 3 pertinent", "categorie": "Catégorie", "temps_lecture": "3 min", "date": "Il y a 2 jours"},
    {"titre": "Article 4 engageant", "categorie": "Catégorie", "temps_lecture": "6 min", "date": "Il y a 3 jours"},
    {"titre": "Article 5 viral", "categorie": "Catégorie", "temps_lecture": "4 min", "date": "Il y a 4 jours"},
    {"titre": "Article 6 complet", "categorie": "Catégorie", "temps_lecture": "10 min", "date": "Il y a 5 jours"}
  ],
  "site_html": "VOIR INSTRUCTIONS CI-DESSOUS"
}

Pour site_html, génère un vrai blog/média HTML complet et professionnel avec :
- Header avec logo/titre du média, navigation catégories (4 catégories cohérentes), barre de recherche, bouton "S'abonner"
- Hero article à la une : grande image de fond dégradé couleur marque, catégorie badge, titre H1 de l'article principal, auteur + date + temps de lecture, bouton "Lire l'article"
- Barre catégories filtrables : 4 catégories cliquables en JS
- Grille d'articles : 6 cards avec image placeholder colorée selon catégorie, badge catégorie, titre article, extrait (2 lignes), auteur avec avatar CSS, date et temps de lecture
- Sidebar droite : articles populaires, newsletter inline, tags cloud
- Section newsletter grande : titre accrocheur, sous-titre, formulaire email, nombre d'abonnés
- Section "À propos du média" : mission, équipe (3 personnes avec avatar CSS et bio courte)
- Footer avec logo, mission, catégories, newsletter, réseaux sociaux
- CSS : design éditorial élégant, typographie optimisée pour la lecture, cards hover, responsive parfait (mobile first)
- JavaScript : filtre catégories, recherche live, mode sombre/clair toggle
- Minimum 400 lignes, tout en français, ton éditorial adapté à la thématique`
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

  // Construire le prompt selon le type
  const prompt = getPrompt(type || 'ecommerce', idee);

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

    // Sauvegarder dans Supabase
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
