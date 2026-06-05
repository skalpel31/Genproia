
// ── MULTILINGUE ──
const LANGS = {
  fr: {
    heroTitle: 'Ton idée devient un <span class="gradient-text">business complet</span> en quelques minutes',
    heroSub: "Entre ton idée de projet. Genproia génère automatiquement ton nom de marque, ton logo, ton slogan, ton nom de domaine et ton site web complet — prêt à encaisser des paiements.",
    heroCta: '✦ Générer mon projet gratuitement',
    demoTitle: 'Décris ton idée, on fait le reste',
    demoSub: 'Pas besoin d'être développeur ni designer. Juste ton idée.',
    demoPlaceholder: 'Ex : Je veux ouvrir une boutique e-commerce pour vendre des vêtements streetwear...',
    generateBtn: 'Générer ✦',
    navLogin: 'Connexion',
    navSignup: 'Inscription',
    installBanner: '📱 Installe Genproia sur ton téléphone !',
    installBtn: 'Installer',
    installDismiss: 'Plus tard',
  },
  en: {
    heroTitle: 'Your idea becomes a <span class="gradient-text">complete business</span> in minutes',
    heroSub: "Enter your project idea. Genproia automatically generates your brand name, logo, slogan, domain name and complete website — ready to accept payments.",
    heroCta: '✦ Generate my project for free',
    demoTitle: 'Describe your idea, we do the rest',
    demoSub: 'No need to be a developer or designer. Just your idea.',
    demoPlaceholder: 'Ex: I want to open an e-commerce store selling streetwear clothing...',
    generateBtn: 'Generate ✦',
    navLogin: 'Login',
    navSignup: 'Sign up',
    installBanner: '📱 Install Genproia on your phone!',
    installBtn: 'Install',
    installDismiss: 'Later',
  },
  es: {
    heroTitle: 'Tu idea se convierte en un <span class="gradient-text">negocio completo</span> en minutos',
    heroSub: "Introduce tu idea de proyecto. Genproia genera automáticamente tu nombre de marca, logo, eslogan, dominio y sitio web completo — listo para recibir pagos.",
    heroCta: '✦ Generar mi proyecto gratis',
    demoTitle: 'Describe tu idea, nosotros hacemos el resto',
    demoSub: 'No necesitas ser desarrollador ni diseñador. Solo tu idea.',
    demoPlaceholder: 'Ej: Quiero abrir una tienda online para vender ropa streetwear...',
    generateBtn: 'Generar ✦',
    navLogin: 'Iniciar sesión',
    navSignup: 'Registrarse',
    installBanner: '📱 ¡Instala Genproia en tu teléfono!',
    installBtn: 'Instalar',
    installDismiss: 'Más tarde',
  },
  pt: {
    heroTitle: 'A sua ideia torna-se um <span class="gradient-text">negócio completo</span> em minutos',
    heroSub: "Insira a sua ideia de projeto. Genproia gera automaticamente o nome da marca, logótipo, slogan, domínio e site completo — pronto para receber pagamentos.",
    heroCta: '✦ Gerar o meu projeto gratuitamente',
    demoTitle: 'Descreve a tua ideia, nós fazemos o resto',
    demoSub: 'Não precisas de ser programador nem designer. Só a tua ideia.',
    demoPlaceholder: 'Ex: Quero abrir uma loja online para vender roupa streetwear...',
    generateBtn: 'Gerar ✦',
    navLogin: 'Entrar',
    navSignup: 'Registar',
    installBanner: '📱 Instala o Genproia no teu telefone!',
    installBtn: 'Instalar',
    installDismiss: 'Mais tarde',
  },
  de: {
    heroTitle: 'Deine Idee wird in Minuten zu einem <span class="gradient-text">kompletten Business</span>',
    heroSub: "Gib deine Projektidee ein. Genproia generiert automatisch deinen Markennamen, Logo, Slogan, Domain und vollständige Website — bereit für Zahlungen.",
    heroCta: '✦ Mein Projekt kostenlos generieren',
    demoTitle: 'Beschreibe deine Idee, wir erledigen den Rest',
    demoSub: 'Du musst kein Entwickler oder Designer sein. Nur deine Idee.',
    demoPlaceholder: 'Z.B.: Ich möchte einen Online-Shop für Streetwear-Kleidung eröffnen...',
    generateBtn: 'Generieren ✦',
    navLogin: 'Anmelden',
    navSignup: 'Registrieren',
    installBanner: '📱 Installiere Genproia auf deinem Handy!',
    installBtn: 'Installieren',
    installDismiss: 'Später',
  },
  ar: {
    heroTitle: 'فكرتك تصبح <span class="gradient-text">مشروعاً كاملاً</span> في دقائق',
    heroSub: "أدخل فكرة مشروعك. Genproia تولّد تلقائياً اسم علامتك التجارية والشعار والموقع الكامل — جاهز لاستقبال المدفوعات.",
    heroCta: '✦ أنشئ مشروعي مجاناً',
    demoTitle: 'صف فكرتك، نحن نتولى الباقي',
    demoSub: 'لا تحتاج إلى مطوّر أو مصمم. فكرتك فقط.',
    demoPlaceholder: 'مثال: أريد فتح متجر إلكتروني لبيع الملابس...',
    generateBtn: 'توليد ✦',
    navLogin: 'تسجيل الدخول',
    navSignup: 'إنشاء حساب',
    installBanner: '📱 ثبّت Genproia على هاتفك!',
    installBtn: 'تثبيت',
    installDismiss: 'لاحقاً',
  },
};

function detectLang() {
  const nav = navigator.language || navigator.userLanguage || 'fr';
  const code = nav.substring(0, 2).toLowerCase();
  return LANGS[code] ? code : 'fr';
}

function applyLang() {
  const code = detectLang();
  const t = LANGS[code];
  if (!t) return;

  // RTL for Arabic
  if (code === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.style.direction = 'rtl';
  }

  // Hero
  const h1 = document.querySelector('.hero h1');
  if (h1) h1.innerHTML = t.heroTitle;
  const heroP = document.querySelector('.hero p');
  if (heroP) heroP.textContent = t.heroSub;
  const heroCta = document.querySelector('.btn-primary[href="#demo"]');
  if (heroCta) heroCta.textContent = t.heroCta;

  // Demo section
  const demoTitle = document.querySelector('#demo .section-title');
  if (demoTitle) demoTitle.textContent = t.demoTitle;
  const demoSub = document.querySelector('#demo .section-sub');
  if (demoSub) demoSub.textContent = t.demoSub;
  const textarea = document.getElementById('ideaInput');
  if (textarea) textarea.placeholder = t.demoPlaceholder;
  const genBtn = document.getElementById('genBtnText');
  if (genBtn) genBtn.textContent = t.generateBtn;

  // Nav buttons
  const loginBtn = document.querySelector('.nav-btn-login');
  if (loginBtn) loginBtn.textContent = t.navLogin;
  const signupBtn = document.querySelector('.nav-btn-signup');
  if (signupBtn) signupBtn.textContent = t.navSignup;

  // Store lang for Claude prompt
  window.currentLang = code;
}

// ── PWA INSTALL ──
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  const code = detectLang();
  const t = LANGS[code] || LANGS.fr;
  const banner = document.getElementById('installBanner');
  if (banner) {
    document.getElementById('installBannerText').textContent = t.installBanner;
    document.getElementById('installBannerBtn').textContent = t.installBtn;
    document.getElementById('installBannerDismiss').textContent = t.installDismiss;
    banner.style.transform = 'translateY(0)';
  }
}

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; dismissInstall(); });
  }
}

function dismissInstall() {
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.transform = 'translateY(120px)';
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// Apply language on load
document.addEventListener('DOMContentLoaded', applyLang);
