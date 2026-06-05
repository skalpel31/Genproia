// ============================================
// GENPROIA — Backend Node.js + Supabase Auth
// ============================================
// Installation : npm install
// Lancement    : node server.js
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
  process.env.SUPABASE_SERVICE_KEY // clé secrète côté serveur
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

// Rate limiting — protection contre les attaques
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 tentatives par IP
  message: { error: 'Trop de tentatives. Réessaie dans 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Trop de requêtes. Ralentis un peu !' }
});

app.use('/api/auth', authLimiter);
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
// ROUTES AUTH
// ══════════════════════════════════════════

// ── INSCRIPTION ──
app.post('/api/auth/signup', async (req, res) => {
  const { nom, email, password } = req.body;

  if (!nom || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  try {
    // Créer le compte dans Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // envoi email de confirmation
      user_metadata: { nom, plan: 'free', created_at: new Date().toISOString() }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
      return res.status(400).json({ error: error.message });
    }

    // Créer le profil dans la table users
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      nom,
      plan: 'free',
      projets_count: 0,
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé ! Vérifie ton email pour confirmer.',
      userId: data.user.id
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
});

// ── CONNEXION ──
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login')) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({ error: 'Confirme ton email avant de te connecter' });
      }
      return res.status(401).json({ error: error.message });
    }

    // Récupère le profil utilisateur
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        nom: profile?.nom || data.user.user_metadata?.nom,
        plan: profile?.plan || 'free',
        projets_count: profile?.projets_count || 0
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur. Réessaie.' });
  }
});

// ── DÉCONNEXION ──
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  await supabase.auth.admin.signOut(token);
  res.json({ success: true, message: 'Déconnecté' });
});

// ── MOT DE PASSE OUBLIÉ ──
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://genproia.com/reset-password'
  });

  // On répond toujours succès pour ne pas révéler si l'email existe
  res.json({ success: true, message: 'Si cet email existe, tu recevras un lien de réinitialisation.' });
});

// ── REFRESH TOKEN ──
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token requis' });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) return res.status(401).json({ error: 'Session expirée, reconnecte-toi' });

  res.json({
    success: true,
    token: data.session.access_token,
    refreshToken: data.session.refresh_token
  });
});

// ══════════════════════════════════════════
// ROUTES UTILISATEUR
// ══════════════════════════════════════════

// ── PROFIL ──
app.get('/api/user/profile', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Profil introuvable' });
  res.json({ success: true, user: data });
});

// ── METTRE À JOUR PROFIL ──
app.put('/api/user/profile', verifyToken, async (req, res) => {
  const { nom } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ nom, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Profil mis à jour' });
});

// ══════════════════════════════════════════
// ROUTES PROJETS
// ══════════════════════════════════════════

// ── LISTE DES PROJETS ──
app.get('/api/projets', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('projets')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, projets: data });
});

// ── CRÉER UN PROJET ──
app.post('/api/projets', verifyToken, async (req, res) => {
  const { nom, slogan, logo_initiales, couleur_primaire, couleur_secondaire, domaine, type, idee } = req.body;

  // Vérifier les limites selon le plan
  const { data: user } = await supabase.from('users').select('plan, projets_count').eq('id', req.user.id).single();

  if (user?.plan === 'free' && user?.projets_count >= 1) {
    return res.status(403).json({
      error: 'Limite atteinte',
      message: 'Le plan gratuit permet 1 projet. Passe au plan Pro pour des projets illimités.',
      upgrade: true
    });
  }

  const { data, error } = await supabase.from('projets').insert({
    user_id: req.user.id,
    nom, slogan, logo_initiales,
    couleur_primaire, couleur_secondaire,
    domaine, type, idee,
    statut: 'draft',
    created_at: new Date().toISOString()
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });

  // Incrémenter le compteur
  await supabase.from('users').update({ projets_count: (user?.projets_count || 0) + 1 }).eq('id', req.user.id);

  res.status(201).json({ success: true, projet: data });
});

// ── SUPPRIMER UN PROJET ──
app.delete('/api/projets/:id', verifyToken, async (req, res) => {
  const { error } = await supabase
    .from('projets')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id); // sécurité : on ne peut supprimer que ses propres projets

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Projet supprimé' });
});

// ══════════════════════════════════════════
// ROUTES ADMIN (super admin uniquement)
// ══════════════════════════════════════════

async function verifyAdmin(req, res, next) {
  await verifyToken(req, res, async () => {
    const { data } = await supabase.from('users').select('role').eq('id', req.user.id).single();
    if (data?.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    next();
  });
}

// ── LISTE TOUS LES USERS (admin) ──
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, users: data, total: data.length });
});

// ── OFFRIR UN PLAN GRATUIT (admin) ──
app.post('/api/admin/gift-plan', verifyAdmin, async (req, res) => {
  const { userId, plan, duration, note } = req.body;

  const expiresAt = duration === 'lifetime' ? null : new Date(
    Date.now() + { '1month': 30, '3months': 90, '6months': 180, '1year': 365 }[duration] * 86400000
  ).toISOString();

  const { error } = await supabase.from('users').update({
    plan,
    plan_expires_at: expiresAt,
    plan_gift_note: note,
    plan_gifted_by: req.user.id,
    updated_at: new Date().toISOString()
  }).eq('id', userId);

  if (error) return res.status(400).json({ error: error.message });

  // Log dans la table gifts
  await supabase.from('gifts').insert({
    user_id: userId, plan, duration, note,
    gifted_by: req.user.id,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, message: `Plan ${plan} offert avec succès !` });
});

// ── SUSPENDRE UN USER (admin) ──
app.post('/api/admin/suspend/:userId', verifyAdmin, async (req, res) => {
  const { error } = await supabase.from('users').update({
    statut: 'suspended', updated_at: new Date().toISOString()
  }).eq('id', req.params.userId);

  if (error) return res.status(400).json({ error: error.message });

  // Invalider toutes les sessions
  await supabase.auth.admin.signOut(req.params.userId);
  res.json({ success: true, message: 'Utilisateur suspendu' });
});

// ── STATS GLOBALES (admin) ──
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  const [users, projets] = await Promise.all([
    supabase.from('users').select('plan', { count: 'exact' }),
    supabase.from('projets').select('statut', { count: 'exact' })
  ]);

  const planCounts = { free: 0, pro: 0, business: 0 };
  users.data?.forEach(u => planCounts[u.plan] = (planCounts[u.plan] || 0) + 1);

  res.json({
    success: true,
    stats: {
      total_users: users.count,
      total_projets: projets.count,
      plans: planCounts,
      mrr: (planCounts.pro * 29) + (planCounts.business * 79)
    }
  });
});

// ══════════════════════════════════════════
// ROUTE SANTÉ
// ══════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Genproia API', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── LANCEMENT ──
app.listen(PORT, () => {
  console.log(`✅ Genproia API démarrée sur le port ${PORT}`);
  console.log(`📡 Supabase connecté : ${process.env.SUPABASE_URL}`);
});

module.exports = app;
