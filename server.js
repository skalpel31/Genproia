// ============================================
// GENPROIA — Backend Node.js + Supabase Auth
// ============================================

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── SUPABASE ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── MIDDLEWARE ──
app.use(express.json());
app.use(cors({
  origin: [
    'https://genproia.com',
    'https://genproia.fr',
    'https://genproia.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { error: 'Trop de tentatives. Réessaie dans 15 minutes.' } });
const apiLimiter = rateLimit({ windowMs: 60*1000, max: 30, message: { error: 'Trop de requêtes. Ralentis un peu !' } });
const aiLimiter = rateLimit({ windowMs: 60*1000, max: 5, message: { error: 'Limite IA atteinte. Max 5 générations par minute.' } });

app.use('/api/auth', authLimiter);
app.use('/api/generate', aiLimiter);
app.use('/api', apiLimiter);

// ── HELPER : vérifier token ──
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token invalide ou expiré' });
  req.user = user;
  next();
}

// ══════════════════════════════════════════
// ROUTE IA — GÉNÉRATION COMPLÈTE
// ══════════════════════════════════════════
app.post('/api/generate', verifyToken, async (req, res) => {
  const { idee, type } = req.body;

  if (!idee || idee.trim().length < 10) {
    return res.status(400).json({ error: 'Décris ton idée en au moins 10 caractères.' });
  }

  // Vérifier plan
  const { data: user } = await supabase.from('users').select('plan, projets_count').eq('id', req.user.id).single();
  if (user?.plan === 'free' && user?.projets_count >= 1) {
    return res.status(403).json({
      error: 'Limite atteinte',
      message: 'Le plan gratuit permet 1 génération. Passe au plan Pro pour des générations illimitées.',
      upgrade: true
    });
  }

  const typeLabel = {
    ecommerce: 'e-commerce (boutique en ligne avec catalogue, panier, paiement Stripe)',
    saas: 'SaaS (abonnements, dashboard utilisateur, super admin)',
    vitrine: 'site vitrine professionnel (présentation, contact, services)',
    landing: 'landing page (capture de leads, conversion, CTA)',
    marketplace: 'marketplace (multi-vendeurs, commissions)',
    blog: 'blog / média (articles, monétisation, newsletter)'
  }[type] || 'site web complet';

  const prompt = `Tu es Genproia, un générateur de business complet propulsé par l'IA.

L'utilisateur veut créer un ${typeLabel}.

Son idée : "${idee}"

Génère un business complet et cohérent. Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après :

{
  "nom": "Nom de marque court, mémorable, original (1-2 mots max)",
  "nom_alternatives": ["Alternative 1", "Alternative 2"],
  "slogan": "Slogan percutant en français (5-8 mots max)",
  "description": "Description du business en 2 phrases",
  "type": "${type || 'ecommerce'}",
  "couleur_primaire": "#hexcode (couleur principale de la marque)",
  "couleur_secondaire": "#hexcode (couleur secondaire complémentaire)",
  "logo_initiales": "2-3 lettres pour le logo",
  "domaines": ["domaine1.fr", "domaine1.com", "domaine1.io"],
  "secteur": "secteur d'activité en 2-3 mots",
  "cible": "cible client en 1 phrase courte",
  "fonctionnalites": ["Fonctionnalité clé 1", "Fonctionnalité clé 2", "Fonctionnalité clé 3", "Fonctionnalité clé 4"],
  "site_html": "CODE HTML COMPLET du site — voir instructions ci-dessous"
}

Pour site_html, génère un vrai site HTML complet avec :
- Design professionnel dark/light selon le secteur
- Couleurs cohérentes avec couleur_primaire et couleur_secondaire
- Navigation, hero section avec le nom et slogan, section features, section pricing (3 plans), footer
- CSS inline dans un tag <style>, JavaScript minimal
- Responsive mobile
- Le tout en français
- Minimum 200 lignes de HTML

Sois créatif, professionnel et cohérent avec l'idée de l'utilisateur.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 8000,
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
      // Nettoyer les éventuels blocs markdown
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse error:', e, 'Raw:', text.substring(0, 200));
      return res.status(500).json({ error: 'Erreur de format IA. Réessaie.' });
    }

    // Sauvegarder le projet dans Supabase
    const { data: projet, error: projetError } = await supabase.from('projets').insert({
      user_id: req.user.id,
      nom: result.nom,
      slogan: result.slogan,
      logo_initiales: result.logo_initiales,
      couleur_primaire: result.couleur_primaire,
      couleur_secondaire: result.couleur_secondaire,
      domaine: result.domaines?.[0],
      type: result.type,
      idee: idee,
      site_html: result.site_html,
      statut: 'generated',
      created_at: new Date().toISOString()
    }).select().single();

    if (!projetError && projet) {
      result.projet_id = projet.id;
      // Incrémenter compteur
      await supabase.from('users').update({
        projets_count: (user?.projets_count || 0) + 1
      }).eq('id', req.user.id);
    }

    res.json({ success: true, result });

  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
});

// ── RÉCUPÉRER LE HTML D'UN PROJET ──
app.get('/api/projets/:id/html', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('projets')
    .select('site_html, nom')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Projet introuvable' });
  res.json({ success: true, nom: data.nom, html: data.site_html });
});

// ══════════════════════════════════════════
// ROUTES AUTH (inchangées)
// ══════════════════════════════════════════

app.post('/api/auth/signup', async (req, res) => {
  const { nom, email, password } = req.body;
  if (!nom || !email || !password) return res.status(400).json({ error: 'Tous les champs sont requis' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  if (!email.includes('@')) return res.status(400).json({ error: 'Email invalide' });

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: false,
      user_metadata: { nom, plan: 'free', created_at: new Date().toISOString() }
    });
    if (error) {
      if (error.message.includes('already registered')) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      return res.status(400).json({ error: error.message });
    }
    await supabase.from('users').insert({ id: data.user.id, email, nom, plan: 'free', projets_count: 0, created_at: new Date().toISOString() });
    res.status(201).json({ success: true, message: 'Compte créé !', userId: data.user.id });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return res.status(401).json({ error: error.message });
    }
    const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
    res.json({
      success: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email, nom: profile?.nom || data.user.user_metadata?.nom, plan: profile?.plan || 'free', projets_count: profile?.projets_count || 0 }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
});

app.post('/api/auth/logout', verifyToken, async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  await supabase.auth.admin.signOut(token);
  res.json({ success: true });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://genproia.com/reset-password' });
  res.json({ success: true, message: 'Si cet email existe, tu recevras un lien de réinitialisation.' });
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token requis' });
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) return res.status(401).json({ error: 'Session expirée, reconnecte-toi' });
  res.json({ success: true, token: data.session.access_token, refreshToken: data.session.refresh_token });
});

app.get('/api/user/profile', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  if (error) return res.status(404).json({ error: 'Profil introuvable' });
  res.json({ success: true, user: data });
});

app.put('/api/user/profile', verifyToken, async (req, res) => {
  const { nom } = req.body;
  const { error } = await supabase.from('users').update({ nom, updated_at: new Date().toISOString() }).eq('id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Profil mis à jour' });
});

app.get('/api/projets', verifyToken, async (req, res) => {
  const { data, error } = await supabase.from('projets').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, projets: data });
});

app.post('/api/projets', verifyToken, async (req, res) => {
  const { nom, slogan, logo_initiales, couleur_primaire, couleur_secondaire, domaine, type, idee } = req.body;
  const { data: user } = await supabase.from('users').select('plan, projets_count').eq('id', req.user.id).single();
  if (user?.plan === 'free' && user?.projets_count >= 1) {
    return res.status(403).json({ error: 'Limite atteinte', message: 'Le plan gratuit permet 1 projet. Passe au plan Pro.', upgrade: true });
  }
  const { data, error } = await supabase.from('projets').insert({
    user_id: req.user.id, nom, slogan, logo_initiales, couleur_primaire, couleur_secondaire, domaine, type, idee, statut: 'draft', created_at: new Date().toISOString()
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  await supabase.from('users').update({ projets_count: (user?.projets_count || 0) + 1 }).eq('id', req.user.id);
  res.status(201).json({ success: true, projet: data });
});

app.delete('/api/projets/:id', verifyToken, async (req, res) => {
  const { error } = await supabase.from('projets').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Projet supprimé' });
});

async function verifyAdmin(req, res, next) {
  await verifyToken(req, res, async () => {
    const { data } = await supabase.from('users').select('role').eq('id', req.user.id).single();
    if (data?.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    next();
  });
}

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, users: data, total: data.length });
});

app.post('/api/admin/gift-plan', verifyAdmin, async (req, res) => {
  const { userId, plan, duration, note } = req.body;
  const expiresAt = duration === 'lifetime' ? null : new Date(Date.now() + { '1month': 30, '3months': 90, '6months': 180, '1year': 365 }[duration] * 86400000).toISOString();
  const { error } = await supabase.from('users').update({ plan, plan_expires_at: expiresAt, plan_gift_note: note, plan_gifted_by: req.user.id, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) return res.status(400).json({ error: error.message });
  await supabase.from('gifts').insert({ user_id: userId, plan, duration, note, gifted_by: req.user.id, created_at: new Date().toISOString() });
  res.json({ success: true, message: `Plan ${plan} offert !` });
});

app.post('/api/admin/suspend/:userId', verifyAdmin, async (req, res) => {
  const { error } = await supabase.from('users').update({ statut: 'suspended', updated_at: new Date().toISOString() }).eq('id', req.params.userId);
  if (error) return res.status(400).json({ error: error.message });
  await supabase.auth.admin.signOut(req.params.userId);
  res.json({ success: true, message: 'Utilisateur suspendu' });
});

app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  const [users, projets] = await Promise.all([
    supabase.from('users').select('plan', { count: 'exact' }),
    supabase.from('projets').select('statut', { count: 'exact' })
  ]);
  const planCounts = { free: 0, pro: 0, business: 0 };
  users.data?.forEach(u => planCounts[u.plan] = (planCounts[u.plan] || 0) + 1);
  res.json({ success: true, stats: { total_users: users.count, total_projets: projets.count, plans: planCounts, mrr: (planCounts.pro * 29) + (planCounts.business * 79) } });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Genproia API', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Genproia API démarrée sur le port ${PORT}`);
  console.log(`📡 Supabase : ${process.env.SUPABASE_URL}`);
});

module.exports = app;
