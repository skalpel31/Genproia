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

  // Prompt spécifique par secteur
  let stylePrompt = '';
  if (idea.includes('cbd') || idea.includes('cannabis') || idea.includes('chanvre')) {
    stylePrompt = 'cannabis leaf icon, green hemp plant symbol';
  } else if (idea.includes('bougie') || idea.includes('chandelle')) {
    stylePrompt = 'elegant candle flame icon, luxury candle symbol';
  } else if (idea.includes('restaurant') || idea.includes('repas') || idea.includes('food')) {
    stylePrompt = 'fork and knife icon, fine dining symbol';
  } else if (idea.includes('café') || idea.includes('coffee')) {
    stylePrompt = 'coffee cup with steam icon, cafe symbol';
  } else if (idea.includes('fitness') || idea.includes('sport') || idea.includes('gym')) {
    stylePrompt = 'dumbbell icon, fitness lightning bolt symbol';
  } else if (idea.includes('saas') || idea.includes('tech') || idea.includes('app') || idea.includes('logiciel')) {
    stylePrompt = 'abstract tech circuit icon, digital symbol';
  } else if (idea.includes('immo') || idea.includes('maison')) {
    stylePrompt = 'modern house icon, real estate symbol';
  } else if (idea.includes('mode') || idea.includes('vêtement') || idea.includes('fashion')) {
    stylePrompt = 'fashion hanger icon, clothing brand symbol';
  } else if (idea.includes('voyage') || idea.includes('tourisme')) {
    stylePrompt = 'compass or airplane icon, travel symbol';
  } else if (idea.includes('bio') || idea.includes('naturel') || idea.includes('plante')) {
    stylePrompt = 'leaf nature icon, organic plant symbol';
  } else if (idea.includes('bijou') || idea.includes('joaill') || idea.includes('luxe')) {
    stylePrompt = 'diamond gem icon, luxury jewelry symbol';
  } else {
    stylePrompt = 'modern abstract geometric icon, professional brand symbol';
  }

  const prompt = `Professional minimalist logo for a brand called "${nom}". ${stylePrompt}. The logo includes the text "${nom}" in bold modern font. Clean white icon on gradient background from ${c1} to ${c2}. Flat design, vector style, startup logo, white background, square format, high quality, professional branding.`;

  try {
    const IDEOGRAM_KEY = process.env.IDEOGRAM_API_KEY;
    if (!IDEOGRAM_KEY) throw new Error('IDEOGRAM_API_KEY manquant');

    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_request: {
          prompt,
          model: 'V_2_TURBO',
          magic_prompt_option: 'OFF',
          style_type: 'DESIGN',
          aspect_ratio: 'ASPECT_1_1',
          num_images: 1
        }
      })
    });

    const data = await response.json();
    console.log('Ideogram response:', JSON.stringify(data).substring(0, 200));

    const imageUrl = data?.data?.[0]?.url;
    if (imageUrl) {
      return res.status(200).json({ success: true, imageUrl, type: 'image' });
    }
    throw new Error('Pas d\'image dans la réponse Ideogram');

  } catch(e) {
    console.error('generate-logo error:', e.message);
    // Fallback SVG propre
    const uid = Date.now().toString(36);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="g${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="18" fill="url(#g${uid})"/>
  <text x="50" y="58" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="${init.length > 2 ? '22' : '28'}" fill="white">${init}</text>
</svg>`;
    return res.status(200).json({ success: true, svg, type: 'svg' });
  }
};
