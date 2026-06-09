module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { email, nom } = req.body;
  if (!email) return res.status(400).json({ error: 'Email manquant' });

  const prenom = (nom || email.split('@')[0]).split(' ')[0];

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#05030f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05030f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- LOGO -->
        <tr><td style="padding-bottom:32px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#7c3aed,#ec4899);display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:white;text-align:center;line-height:36px;">G</div>
            <span style="font-size:22px;font-weight:700;color:#f0ecff;letter-spacing:-0.03em;">Genpr<span style="color:#8b5cf6">oia</span></span>
          </div>
        </td></tr>

        <!-- CARD -->
        <tr><td style="background:#13102a;border:1px solid rgba(139,92,246,0.2);border-radius:20px;padding:40px;position:relative;overflow:hidden;">
          
          <!-- Gradient top -->
          <div style="height:3px;background:linear-gradient(90deg,#7c3aed,#ec4899);border-radius:20px 20px 0 0;margin:-40px -40px 32px -40px;"></div>

          <!-- Emoji -->
          <div style="text-align:center;font-size:48px;margin-bottom:20px;">🎉</div>

          <!-- Titre -->
          <h1 style="font-size:28px;font-weight:700;color:#f0ecff;text-align:center;margin:0 0 12px;letter-spacing:-0.03em;">
            Bienvenue, ${prenom} !
          </h1>

          <!-- Sous-titre -->
          <p style="font-size:16px;color:#7a6fa0;text-align:center;margin:0 0 32px;line-height:1.6;">
            Ton compte Genproia est actif. Tu peux maintenant générer ton premier business complet en quelques minutes.
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:32px;">
            <a href="https://genproia.com/genproia-dashboard.html" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:16px;letter-spacing:-0.01em;">
              Accéder à mon dashboard →
            </a>
          </div>

          <!-- Features -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15);border-radius:12px;padding:16px;text-align:center;width:33%;">
                <div style="font-size:24px;margin-bottom:8px;">✦</div>
                <div style="font-size:13px;font-weight:600;color:#f0ecff;margin-bottom:4px;">Génère ton business</div>
                <div style="font-size:12px;color:#7a6fa0;">Nom, logo, site en minutes</div>
              </td>
              <td width="12"></td>
              <td style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15);border-radius:12px;padding:16px;text-align:center;width:33%;">
                <div style="font-size:24px;margin-bottom:8px;">🌐</div>
                <div style="font-size:13px;font-weight:600;color:#f0ecff;margin-bottom:4px;">Domaine inclus</div>
                <div style="font-size:12px;color:#7a6fa0;">Suggestions automatiques</div>
              </td>
              <td width="12"></td>
              <td style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.15);border-radius:12px;padding:16px;text-align:center;width:33%;">
                <div style="font-size:24px;margin-bottom:8px;">💳</div>
                <div style="font-size:13px;font-weight:600;color:#f0ecff;margin-bottom:4px;">Prêt à vendre</div>
                <div style="font-size:12px;color:#7a6fa0;">Stripe intégré</div>
              </td>
            </tr>
          </table>

          <!-- Footer card -->
          <p style="font-size:13px;color:#4a4068;text-align:center;margin:0;">
            Des questions ? Réponds à cet email ou contacte-nous sur <a href="https://genproia.com" style="color:#8b5cf6;text-decoration:none;">genproia.com</a>
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="font-size:12px;color:#4a4068;margin:0;">
            © 2026 Genproia · <a href="https://genproia.com" style="color:#4a4068;text-decoration:none;">genproia.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Genproia <bonjour@genproia.com>',
        to: [email],
        subject: `Bienvenue sur Genproia, ${prenom} ! 🎉`,
        html
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: 'Erreur envoi email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email welcome error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
