// ── SUPABASE ──
const SUPABASE_URL = 'https://fgkqobuomiuirwtvuuxz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_D8jaWGbn4G72A7eq8oBtqg_acLVSLBX';
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CURSOR ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; cursor.style.left = mx+'px'; cursor.style.top = my+'px'; });
function animRing() { rx += (mx-rx)*0.12; ry += (my-ry)*0.12; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(animRing); }
animRing();

// ── PASSWORD CHECK ──
function checkPasswordMatch() {
  const p1 = document.getElementById('signupPassword').value;
  const p2 = document.getElementById('signupPasswordConfirm').value;
  const msg = document.getElementById('passwordMatchMsg');
  const btn = document.getElementById('signupSubmitBtn');
  if (!p2) { msg.style.display = 'none'; btn.disabled = false; return; }
  msg.style.display = 'block';
  if (p1 === p2 && p1.length >= 8) {
    msg.textContent = 'Mots de passe identiques';
    msg.style.color = '#6ee7b7';
    btn.disabled = false; btn.style.opacity = '1';
  } else if (p1 !== p2) {
    msg.textContent = 'Les mots de passe ne correspondent pas';
    msg.style.color = '#fca5a5';
    btn.disabled = true; btn.style.opacity = '0.5';
  } else {
    msg.textContent = 'Minimum 8 caracteres requis';
    msg.style.color = '#fcd34d';
    btn.disabled = true; btn.style.opacity = '0.5';
  }
}

function showSignupError(msg) {
  const m = document.getElementById('passwordMatchMsg');
  m.textContent = msg;
  m.style.color = '#fca5a5';
  m.style.display = 'block';
}

// ── INSCRIPTION ──
async function validateSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const p1 = document.getElementById('signupPassword').value;
  const p2 = document.getElementById('signupPasswordConfirm').value;

  if (!name) { showSignupError('Entre ton prenom et nom'); return; }
  if (!email || !email.includes('@')) { showSignupError('Entre un email valide'); return; }
  if (p1.length < 8) { showSignupError('Mot de passe trop court (8 caracteres minimum)'); return; }
  if (p1 !== p2) { showSignupError('Les mots de passe ne correspondent pas'); return; }

  const btn = document.getElementById('signupSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Chargement...';

  const result = await _supabase.auth.signUp({
    email: email,
    password: p1,
    options: { data: { nom: name } }
  });

  if (result.error) {
    const msg = result.error.message.includes('already') ? 'Cet email est deja utilise' : result.error.message;
    showSignupError(msg);
    btn.disabled = false;
    btn.textContent = 'Continuer';
    return;
  }

  if (result.data && result.data.session) {
    localStorage.setItem('genproia_token', result.data.session.access_token);
    localStorage.setItem('genproia_user', JSON.stringify({
      id: result.data.user.id,
      email: result.data.user.email,
      nom: name,
      plan: 'free'
    }));
  }

  goToPlan();
}

// ── CONNEXION ──
async function processLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');

  if (!email || !pass) {
    errEl.textContent = 'Remplis tous les champs';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const btn = document.querySelector('#loginModal .submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Connexion...'; }

  const result = await _supabase.auth.signInWithPassword({ email: email, password: pass });

  if (result.error) {
    errEl.textContent = 'Email ou mot de passe incorrect';
    errEl.style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; }
    return;
  }

  localStorage.setItem('genproia_token', result.data.session.access_token);
  localStorage.setItem('genproia_user', JSON.stringify({
    id: result.data.user.id,
    email: result.data.user.email,
    nom: result.data.user.user_metadata.nom || email.split('@')[0],
    plan: 'free'
  }));

  closeLogin();
  window.location.href = '/genproia-dashboard.html';
}

// ── MODALS ──
function openModal(type, plan) {
  if (type === 'login') openLogin();
  else openSignup();
}

function openSignup() {
  document.getElementById('signupModal').classList.add('open');
  showSignupSection('signupSection');
}
function closeSignup() { document.getElementById('signupModal').classList.remove('open'); }
function showSignupSection(id) {
  ['signupSection','signupPlanSection','signupPaySection','signupSuccessSection'].forEach(function(s) {
    document.getElementById(s).style.display = s === id ? 'block' : 'none';
  });
}
function openLogin() { document.getElementById('loginModal').classList.add('open'); }
function closeLogin() { document.getElementById('loginModal').classList.remove('open'); }
function closeModal() { closeSignup(); closeLogin(); }
function closeModalOutside() {}

function goToPlan() { showSignupSection('signupPlanSection'); }
function goToMoteur() { openSignup(); }

function selectPlan(el, plan) {
  document.querySelectorAll('.plan-opt').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  const btn = document.getElementById('planBtn');
  if (plan === 'starter') {
    btn.textContent = 'Continuer gratuitement';
    btn.onclick = function() {
      closeSignup();
      window.location.href = '/genproia-dashboard.html';
    };
  } else {
    btn.textContent = 'Continuer vers le paiement';
    btn.onclick = goToPayment;
  }
}

function goToPayment() { showSignupSection('signupPaySection'); }

function processPayment() {
  const btn = document.getElementById('payBtnText');
  btn.textContent = 'Traitement...';
  setTimeout(function() { showSignupSection('signupSuccessSection'); }, 2000);
}

// ── DEMO GENERATOR ──
const demoData = {
  'boutique': { name: 'UrbanThread', alt: 'VogueNest, StyleFlow', slogan: 'Porte ton histoire.', logo: 'UT', domains: ['urbanthread.fr','urbanthread.co','urban-thread.com'] },
  'fidelite': { name: 'LoyalPulse', alt: 'RewardLoop, BonusSpark', slogan: 'Fideliser, cest grandir.', logo: 'LP', domains: ['loyalpulse.io','loyalpulse.fr','loyal-pulse.app'] },
  'livraison': { name: 'SwiftBite', alt: 'RapidEats, ZipFood', slogan: 'Chaud. Vite. La.', logo: 'SB', domains: ['swiftbite.fr','swift-bite.co','swiftbite.app'] },
  'fitness': { name: 'CoreFlow', alt: 'PeakPulse, FitMind', slogan: 'Entraine-toi mieux, vis mieux.', logo: 'CF', domains: ['coreflow.app','coreflow.io','core-flow.fr'] },
  'immobilier': { name: 'NestIQ', alt: 'PropSense, ImmoVision', slogan: 'Trouve. Achete. Vis.', logo: 'NQ', domains: ['nestiq.fr','nest-iq.immo','nestiq.io'] }
};

let validated = { name: false, slogan: false, logo: false, domains: false };
let selectedDomain = null;

function fillIdea(el) {
  document.getElementById('ideaInput').value = el.textContent.trim();
}

function generateIdea() {
  const val = document.getElementById('ideaInput').value.toLowerCase();
  const btn = document.getElementById('genBtnText');
  btn.textContent = '...';
  validated = { name: false, slogan: false, logo: false, domains: false };
  document.getElementById('buildSiteBar').style.display = 'none';
  document.getElementById('validateHint').style.display = 'block';

  setTimeout(function() {
    let data = demoData['boutique'];
    if (val.includes('fidel') || val.includes('saas') || val.includes('loyal')) data = demoData['fidelite'];
    else if (val.includes('livr') || val.includes('repas')) data = demoData['livraison'];
    else if (val.includes('fit') || val.includes('sport') || val.includes('coach')) data = demoData['fitness'];
    else if (val.includes('immob') || val.includes('maison')) data = demoData['immobilier'];

    document.getElementById('outName').textContent = data.name;
    document.getElementById('outAlt').textContent = data.alt;
    document.getElementById('outSlogan').textContent = data.slogan;
    document.getElementById('outLogo').textContent = data.logo;
    renderDomains(data.domains, 'outDomains');
    btn.textContent = 'Generer';
    document.getElementById('outputPreview').classList.add('visible');
  }, 1500);
}

function renderDomains(domains, targetId) {
  document.getElementById(targetId).innerHTML = domains.map(function(d, i) {
    return '<div class="domain-option" id="dom-' + i + '" onclick="selectDomain(this,\'' + d + '\')">' +
      '<span class="domain-dot">●</span>' +
      '<span class="domain-name">' + d + '</span>' +
      '<span class="domain-check">✓</span>' +
      '<a class="domain-verify" href="https://www.lws.fr/nom-de-domaine.php?domaine=' + d + '" target="_blank" onclick="event.stopPropagation()">Verifier dispo</a>' +
      '</div>';
  }).join('');
  const first = document.getElementById('dom-0');
  if (first) selectDomain(first, domains[0]);
}

function selectDomain(el, domain) {
  document.querySelectorAll('.domain-option').forEach(function(d) { d.classList.remove('selected'); });
  el.classList.add('selected');
  selectedDomain = domain;
}

function regenCell(type) {
  const alts = {
    name: [['VogueNest','UrbanThread, StyleFlow'],['StyleFlow','UrbanThread, VogueNest'],['PrimeCraft','NovaBrand, ZenVault']],
    slogan: ['Le style sans limites.','Fait pour se demarquer.','Fais-en ta marque.'],
    logo: ['VN','SF','PC'],
    domains: [['voguenest.fr','voguenest.co','vogue-nest.com'],['styleflow.io','styleflow.fr','style-flow.co'],['primecraft.fr','primecraft.io','prime-craft.app']]
  };
  const idx = Math.floor(Math.random() * 3);
  if (type === 'name') {
    document.getElementById('outName').textContent = alts.name[idx][0];
    document.getElementById('outAlt').textContent = alts.name[idx][1];
  } else if (type === 'slogan') {
    document.getElementById('outSlogan').textContent = alts.slogan[idx];
  } else if (type === 'logo') {
    document.getElementById('outLogo').textContent = alts.logo[idx];
  } else if (type === 'domains') {
    renderDomains(alts.domains[idx], 'outDomains');
  }
  validated[type] = false;
  const ids = { name:'valName', slogan:'valSlogan', logo:'valLogo', domains:'valDomains' };
  const btn = document.getElementById(ids[type]);
  if (btn) { btn.classList.remove('validated'); btn.textContent = 'Valider'; btn.disabled = false; }
  checkAllValidated();
}

function validateCell(type) {
  validated[type] = true;
  const ids = { name:'valName', slogan:'valSlogan', logo:'valLogo', domains:'valDomains' };
  const btn = document.getElementById(ids[type]);
  if (btn) { btn.classList.add('validated'); btn.textContent = 'Valide'; btn.disabled = true; }
  checkAllValidated();
}

function checkAllValidated() {
  const allDone = validated.name && validated.slogan && validated.logo && validated.domains;
  document.getElementById('buildSiteBar').style.display = allDone ? 'flex' : 'none';
  document.getElementById('validateHint').style.display = allDone ? 'none' : 'block';

  if (allDone) {
    const domainsRaw = Array.from(document.querySelectorAll('.domain-name')).map(function(el) { return el.textContent.trim(); });
    const projectData = {
      nom: document.getElementById('outName').textContent,
      slogan: document.getElementById('outSlogan').textContent,
      logoInitiales: document.getElementById('outLogo').textContent,
      domaines: domainsRaw,
      domainChoisi: selectedDomain || domainsRaw[0] || '',
      couleurPrimaire: '#7c3aed',
      couleurSecondaire: '#ec4899',
      idee: document.getElementById('ideaInput').value,
      validated: true
    };
    localStorage.setItem('genproia_project', JSON.stringify(projectData));
  }
}

function goToMoteurFinal() { openSignup(); }

// ── CARD FORMATTING ──
function formatCard(input) {
  let v = input.value.replace(/\D/g,'').substring(0,16);
  input.value = v.replace(/(.{4})/g,'$1 ').trim();
  const display = v ? v.replace(/(.{4})/g,'$1 ').trim().replace(/\d(?=.{5})/g,'*') : '**** **** **** ****';
  document.getElementById('cardNumDisplay').textContent = display;
}

function formatExp(input) {
  let v = input.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.substring(0,2)+'/'+v.substring(2,4);
  input.value = v;
  document.getElementById('cardExpDisplay').textContent = v || 'MM/AA';
}

// ── ESC KEY ──
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
