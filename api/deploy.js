const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token invalide' });

  const { projet_id } = req.body;
  if (!projet_id) return res.status(400).json({ error: 'projet_id manquant' });

  // Récupérer le projet
  const { data: projet, error: projErr } = await supabase.from('projets').select('*').eq('id', projet_id).eq('user_id', user.id).single();
  if (projErr || !projet) return res.status(404).json({ error: 'Projet non trouvé' });
  if (!projet.site_html) return res.status(400).json({ error: 'Pas de site HTML à déployer' });

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

  if (!VERCEL_TOKEN) return res.status(500).json({ error: 'VERCEL_TOKEN manquant' });

  const projectName = (projet.nom || 'site').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 50);
  const uniqueName = projectName + '-' + Date.now().toString(36);

  try {
    // Créer le déploiement Vercel
    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      },
      body: JSON.stringify({
        name: uniqueName,
        files: [
          {
            file: 'index.html',
            data: projet.site_html
          }
        ],
        projectSettings: {
          framework: null,
          buildCommand: null,
          outputDirectory: null
        },
        target: 'production'
      })
    });

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
      console.error('Vercel deploy error:', deployData);
      return res.status(500).json({ error: deployData.error?.message || 'Erreur déploiement Vercel' });
    }

    const siteUrl = `https://${deployData.url}`;

    // Mettre à jour le projet avec l'URL de déploiement
    await supabase.from('projets').update({
      statut: 'live',
      site_url: siteUrl
    }).eq('id', projet_id);

    return res.status(200).json({ success: true, url: siteUrl, deployId: deployData.id });

  } catch(err) {
    console.error('Deploy error:', err);
    return res.status(500).json({ error: 'Erreur serveur lors du déploiement' });
  }
};
