import { api } from './api.js';

// Consolidated Navigation Items Configuration
export const NAVIGATION_ITEMS = {
  brand: {
    title: 'Passe-Impact',
    badge: 'Hammamet',
    arabic: 'باس أثر الحمامات',
    target: 'page-intro',
    logo: '/logo.svg'
  },
  primary: [
    { id: 'nav-hackathons', label: 'Hackathons', target: 'page-events', icon: 'pulse', badge: 'Défis' },
    { id: 'nav-carte-id', label: 'Carte ID & Avatar', target: 'page-profile-card', icon: 'id-card' },
    { id: 'nav-entreprises', label: 'Espace Entreprises', target: 'page-company', icon: 'briefcase' }
  ],
  explorerDropdown: [
    { id: 'nav-presentation', label: 'Présentation', desc: 'Comprendre Passe Impact & Vision', target: 'page-intro', icon: 'sparkles' },
    { id: 'nav-tour', label: 'Visite Guidée', desc: 'Découvrir le fonctionnement pas-à-pas', action: 'startGuidedTour', icon: 'compass' },
    { id: 'nav-verify', label: 'Vérification SHA-256', desc: 'Attestation publique infalsifiable', href: '/verify/u-default', icon: 'shield' },
    { id: 'nav-visitor', label: 'Pass Visiteur Invité', desc: 'Gestion de statut et cookies', modal: 'modal-visitor', icon: 'user' }
  ],
  userPill: {
    defaultXp: 355,
    defaultDinars: 62.000,
    xpSymbol: '★',
    dinarsSymbol: '🏺'
  }
};

// Application State
const state = {
  currentUserId: 'u-default',
  isVisitor: false,
  hasAcceptedCookies: false,
  user: {
    id: 'u-default',
    name: 'Youssef Mansour',
    email: 'youssef@isetn.tn',
    role: 'student',
    avatar: 'Frontend Dev & Tourisme Tech',
    avatarIcon: '👨‍💻',
    school: 'ISET Nabeul / INSAT • Résidence Hammamet',
    oldResume: 'Licence appliquée en Technologies du Web. Projets scolaires en JavaScript et participation à un club éco-citoyenneté.',
    xp: 355,
    dinarsJar: 62.000,
    isTargeted: 1
  },
  projects: [],
  reviews: [],
  events: [],
  offers: [],
  candidates: [],
  inbox: [],
  wallet: { balance: 62.000, xp: 355, transactions: [] },
  activeRecTab: 'stages',
  activeTalentFilter: 'all',
  talentSearchTerm: '',
  tourStep: 0
};

// Tour Steps Definition
const tourSteps = [
  {
    step: 1,
    badge: '1. Mission & Vision Locale',
    title: 'Résoudre la fragmentation de l\'enseignement en Tunisie',
    desc: 'Les diplômes universitaires classiques sont souvent déconnectés des compétences concrètes demandées par le marché. Passe Impact Hammamet valorise vos projets pratiques et dynamise le tissu économique local à travers des défis réels.'
  },
  {
    step: 2,
    badge: '2. Fonctionnement & Avatar',
    title: 'L\'Avatar Portfolio et la Carte ID Numérique',
    desc: 'Chaque talent définit son Avatar cible (Frontend, IA, Tourisme Tech, Civic Ta\'sir). Vos participations aux hackathons accumulent des points d\'expérience (XP) et enrichissent votre carte flippable certifiée.'
  },
  {
    step: 3,
    badge: '3. Inscription & Prime de 2 DT',
    title: 'Frais de calibrage & Compensation immédiate',
    desc: 'Une modique participation (5 DT) prouve votre sérieux envers les employeurs. En retour, vous recevez automatiquement 2 Dinars (2 DT) dans votre Tip Jar et votre profil devient immédiatement "Ciblé" par les entreprises.'
  },
  {
    step: 4,
    badge: '4. Inclusion Financière Tunisienne',
    title: 'Paiements directs avec Flouci, D17 et Konnect',
    desc: 'Réglez vos inscriptions ou retirez vos compensations sans carte internationale grâce aux passerelles locales : Flouci Wallet, Cartes E-Dinar de La Poste Tunisienne (D17), Konnect et Sobflous.'
  }
];

// App Initialization
export async function initApp() {
  initTheme();
  setupEventListeners();
  initSplashScreen();

  // Load cookies preference
  try {
    const cookieSaved = localStorage.getItem('pi_cookies_accepted');
    if (cookieSaved === 'true') {
      state.hasAcceptedCookies = true;
      document.getElementById('cookie-banner')?.classList.add('hidden');
    }
  } catch (e) {}

  // Mount UI elements immediately on boot with baseline metrics
  renderUI();

  // Fetch data from backend
  await refreshAllData();

  // Support direct routing via URL hash or ?page= / ?nosplash=
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('nosplash') || urlParams.has('demo')) {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    document.getElementById('cookie-banner')?.classList.add('hidden');
  }

  const targetPage = urlParams.get('page') || (window.location.hash ? window.location.hash.replace('#', '') : null);
  if (targetPage && document.getElementById(targetPage)) {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    navigateTo(targetPage);
  }
}

// Refresh Data from Backend
async function refreshAllData() {
  try {
    const profileData = await api.getProfile(state.currentUserId);
    if (profileData.user) state.user = profileData.user;
    if (profileData.projects) state.projects = profileData.projects;
    if (profileData.reviews) state.reviews = profileData.reviews;
    if (profileData.wallet) state.wallet = profileData.wallet;

    state.events = await api.getEvents();
    state.offers = await api.getOffers();
    state.candidates = await api.getCandidates(state.activeTalentFilter, state.talentSearchTerm);
    state.inbox = await api.getInbox(state.currentUserId);
  } catch (err) {
    console.warn('Mode hors-ligne ou fallback local activé:', err);
  } finally {
    renderUI();
  }
}

// Render Master UI
function renderUI() {
  renderHeaderControls();
  renderProfileCard();
  renderProjects();
  renderReviews();
  renderTargetedSuggestions();
  renderEvents();
  renderRecruiterCandidates();
  renderWalletLedger();
  renderInbox();
  renderQRCode();
}

// Lightweight Number Interpolation for Tactile XP / Dinars Micro-Interactions
function animateValue(element, start, end, duration = 500, decimals = 0) {
  if (!element) return;
  const numStart = Number(start) || 0;
  const numEnd = Number(end) || 0;
  if (numStart === numEnd) {
    element.textContent = decimals > 0 ? numEnd.toFixed(decimals) : Math.round(numEnd);
    return;
  }
  const range = numEnd - numStart;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = numStart + range * easeProgress;
    element.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = decimals > 0 ? numEnd.toFixed(decimals) : Math.round(numEnd);
    }
  }
  window.requestAnimationFrame(step);
}

// Header & Pill Bars
function renderHeaderControls() {
  const dinars = state.user.dinarsJar || 0;
  const xp = state.user.xp || 0;

  const prevDinars = state._prevDinars !== undefined ? state._prevDinars : dinars;
  const prevXp = state._prevXp !== undefined ? state._prevXp : xp;

  const dinarsTopEl = document.getElementById('wallet-dinars-top');
  animateValue(dinarsTopEl, prevDinars, dinars, 500, 3);

  const xpTopEl = document.getElementById('wallet-xp-top');
  animateValue(xpTopEl, prevXp, xp, 500, 0);

  const xpMobileEl = document.getElementById('wallet-xp-mobile');
  animateValue(xpMobileEl, prevXp, xp, 500, 0);

  const walletModalBal = document.getElementById('wallet-modal-balance');
  animateValue(walletModalBal, prevDinars, dinars, 500, 3);

  const dinarsDropdownEl = document.getElementById('wallet-dinars-dropdown');
  animateValue(dinarsDropdownEl, prevDinars, dinars, 500, 3);

  const xpDropdownEl = document.getElementById('wallet-xp-dropdown');
  animateValue(xpDropdownEl, prevXp, xp, 500, 0);

  const passDinarsDisplay = document.getElementById('pass-dinars-display');
  animateValue(passDinarsDisplay, prevDinars, dinars, 500, 3);

  const passXpDisplay = document.getElementById('pass-xp-display');
  animateValue(passXpDisplay, prevXp, xp, 500, 0);

  state._prevDinars = dinars;
  state._prevXp = xp;

  // Header and Popover user details
  const headerAvatarBadge = document.getElementById('header-avatar-badge');
  if (headerAvatarBadge) headerAvatarBadge.textContent = state.user.avatarIcon || '👨‍💻';

  const popoverAvatar = document.getElementById('popover-avatar-icon');
  if (popoverAvatar) popoverAvatar.textContent = state.user.avatarIcon || '👨‍💻';

  const popoverName = document.getElementById('popover-name');
  if (popoverName) popoverName.textContent = state.user.name;

  const popoverAvatarTitle = document.getElementById('popover-avatar-title');
  if (popoverAvatarTitle) popoverAvatarTitle.textContent = state.user.avatar;

  const popoverSchool = document.getElementById('popover-school');
  if (popoverSchool) popoverSchool.textContent = state.user.school;

  const badgeIcon = document.getElementById('badge-icon');
  const badgeLabel = document.getElementById('badge-label');
  if (state.isVisitor) {
    if (badgeIcon) badgeIcon.textContent = '👤';
    if (badgeLabel) badgeLabel.textContent = 'Visiteur';
  } else {
    if (badgeIcon) badgeIcon.textContent = '🎓';
    if (badgeLabel) badgeLabel.textContent = 'Membre Ciblé';
  }
}

// 3D Flippable Card & Profile
function renderProfileCard() {
  const u = state.user;
  setText('pass-name', u.name);
  setText('pass-avatar-title', `Avatar : ${u.avatar}`);
  setText('pass-avatar-icon', u.avatarIcon || '👨‍💻');
  setText('pass-school', u.school);
  setText('pass-xp-display', u.xp);
  setText('pass-dinars-display', (u.dinarsJar || 0).toFixed(3));
  setText('pass-resume-school', u.school);
  setText('pass-resume-skills', u.oldResume);

  const recAvatarName = document.getElementById('rec-avatar-name');
  if (recAvatarName) recAvatarName.textContent = u.avatar;
}

// Render Projects List
function renderProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  if (state.projects.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 sm:col-span-2 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs">
        Aucun projet enregistré pour l'instant. Cliquez sur "+ Ajouter un projet" pour booster votre score (+15 XP).
      </div>
    `;
    return;
  }

  container.innerHTML = state.projects.map(p => `
    <article class="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
      <div class="space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-snug">${escapeHtml(p.title)}</h4>
          <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-medina-600 dark:text-medina-400 hover:underline flex items-center gap-1 shrink-0">
            <span>Démo</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtml(p.desc)}</p>
      </div>
      <div class="p-2 rounded-xl bg-slate-50 dark:bg-[#080c14] border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
        ${escapeHtml(p.tags)}
      </div>
    </article>
  `).join('');
}

// Render Reviews List
function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  if (state.reviews.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs">
        Aucune recommandation pour l'instant. Invitez un mentor ou collègue à vous laisser un avis (+10 XP).
      </div>
    `;
    return;
  }

  container.innerHTML = state.reviews.map(r => `
    <article class="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition">
      <div class="flex items-center justify-between">
        <div>
          <h5 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtml(r.author)}</h5>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">${escapeHtml(r.role)}</p>
        </div>
        <div class="text-medina-500 text-sm tracking-wider flex items-center">
          ${'★'.repeat(r.rating || 5)}
        </div>
      </div>
      <p class="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed pt-1">
        "${escapeHtml(r.comment)}"
      </p>
    </article>
  `).join('');
}

// Render Targeted Suggestions (Stages / Jobs / Formations)
function renderTargetedSuggestions() {
  const container = document.getElementById('rec-tab-content');
  if (!container) return;

  if (state.activeRecTab === 'stages') {
    container.innerHTML = `
      <div class="bg-slate-50 dark:bg-[#080c14]/80 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-medina-600 dark:text-medina-400">PFE Recommandé Spécifique</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Stage PFE : Plateforme Hôtelière & API Flouci</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Hôtel Hasdrubal Thalassa Hammamet • 450 DT / mois</p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">Concordance à 98% avec vos projets React et API de paiement certifiés sur votre carte.</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Stage PFE Hasdrubal')" class="btn-tactile w-full py-2.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Candidater avec mon Pass ID Ciblé ➔
        </button>
      </div>

      <div class="bg-slate-50 dark:bg-[#080c14]/80 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-terracotta-600 dark:text-terracotta-400">Stage d'été / Perfectionnement</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Assistant UI/UX & Numérisation Médina</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Startup Yallabiz Travel • Hammamet Centre</p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">Participation à la création du catalogue interactif des artisans céramistes.</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Stage Été Yallabiz')" class="btn-tactile w-full py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition">
          Candidater avec mon Pass ID Ciblé ➔
        </button>
      </div>
    `;
  } else if (state.activeRecTab === 'jobs') {
    container.innerHTML = `
      <div class="bg-slate-50 dark:bg-[#080c14]/80 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-terracotta-600 dark:text-terracotta-400">Premier Emploi / CDI Junior</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Développeur Frontend Web Junior (React/Node)</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Agence Médina Tech • Hammamet / Télétravail</p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">Rémunération : 1200 - 1500 DT/mois. Vos points XP vous dispensent du test technique initial !</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Emploi Médina Tech')" class="btn-tactile w-full py-2.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Postuler en 1 Clic ➔
        </button>
      </div>

      <div class="bg-slate-50 dark:bg-[#080c14]/80 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-medina-600 dark:text-medina-400">Mission Freelance Rémunérée</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Widget Météo & Cartes Médina Hammamet</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Office du Tourisme Nabeul-Hammamet • Durée : 2 semaines</p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">Budget garanti en séquestre : 600 DT versés directement dans votre Tip Jar.</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Mission Freelance Office Tourisme')" class="btn-tactile w-full py-2.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Accepter la Mission Freelance ➔
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="bg-slate-50 dark:bg-[#080c14]/80 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-medina-600 dark:text-medina-400">+30 XP & Certification</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Next.js 15 & E-commerce Touristique</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">HUBACT Lab Hammamet • 10 heures</p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">Renforcez votre Avatar pour débloquer les offres de stages supérieures à 50 XP.</p>
        </div>
        <button onclick="window.HubAct.participateInEventById('ev-4')" class="btn-tactile w-full py-2.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Démarrer (+30 XP & +4 DT) ➔
        </button>
      </div>

      <div class="bg-slate-50 dark:bg-[#080c14]/80 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-terracotta-600 dark:text-terracotta-400">+25 XP Pratique</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Sécurité des Webhooks Flouci & Konnect</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Fintech Tunisia • 6 heures</p>
          <p class="text-[11px] text-slate-600 dark:text-slate-300">Idéal pour certifier vos compétences en intégration bancaire tunisienne.</p>
        </div>
        <button onclick="window.HubAct.participateInEventById('ev-2')" class="btn-tactile w-full py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition">
          Démarrer (+25 XP & +5 DT) ➔
        </button>
      </div>
    `;
  }
}

// Render Hackathons & Events Grid
function renderEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  grid.innerHTML = state.events.map(ev => `
    <div class="bg-white dark:bg-[#0b1329] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-medina-500/50 transition">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-medina-100 text-medina-700 dark:bg-medina-950 dark:text-medina-300">${escapeHtml(ev.category)}</span>
          <span class="text-xs font-black text-medina-400 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            +${ev.xpReward} XP
          </span>
        </div>
        <h4 class="text-base font-black text-slate-900 dark:text-white">${escapeHtml(ev.title)}</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtml(ev.desc)}</p>
        <div class="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
          <div class="flex items-start gap-1.5">
            <span class="text-medina-500 font-bold">📍</span>
            <span><strong>Lieu :</strong> ${escapeHtml(ev.location)}</span>
          </div>
          <div class="flex items-start gap-1.5">
            <span class="text-terracotta-500 font-bold">🏺</span>
            <span><strong>Compensation :</strong> ${ev.dinarsReward.toFixed(3)} DT versés dans votre Tip Jar</span>
          </div>
        </div>
      </div>
      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
        <button onclick="window.HubAct.participateInEventById('${ev.id}')" class="btn-tactile w-full py-2.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
          <span>Valider la Mission (+${ev.xpReward} XP & +${ev.dinarsReward.toFixed(3)} DT)</span>
        </button>
      </div>
    </div>
  `).join('');
}

// Render Recruiter Candidates Pool
function renderRecruiterCandidates() {
  const grid = document.getElementById('candidates-pool-grid');
  if (!grid) return;

  if (state.candidates.length === 0) {
    grid.innerHTML = `
      <div class="col-span-3 p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
        Aucun talent ne correspond à ces critères de recherche.
      </div>
    `;
    return;
  }

  grid.innerHTML = state.candidates.map(c => `
    <div class="bg-white dark:bg-[#0b1329] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-medina-500/50 transition">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-slate-900 dark:text-white">${escapeHtml(c.name)}</span>
          <span class="text-xs font-black text-medina-400">⭐ ${c.xp} XP</span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-medina-100 dark:bg-medina-950 text-medina-700 dark:text-medina-300 inline-block">
          ${c.role === 'student' ? '🎓 Étudiant PFE' : c.role === 'worker' ? '💼 Travailleur Junior' : '🌍 Freelancer Qualifié'}
        </span>
        <p class="text-xs text-medina-600 dark:text-medina-400 font-bold">${escapeHtml(c.avatar)}</p>
        <p class="text-[11px] text-slate-500">${escapeHtml(c.school)}</p>
        <div class="text-[10px] text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900/70 p-2 rounded-lg">
          Compétences : ${escapeHtml(c.oldResume || 'React, API, Fullstack')}
        </div>
      </div>
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onclick="window.HubAct.openTargetModal('${c.id}', '${escapeHtml(c.name)}')" class="btn-tactile w-full py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition">
          🎯 Proposer un Stage / Mission ➔
        </button>
      </div>
    </div>
  `).join('');
}

// Render Wallet Ledger
function renderWalletLedger() {
  const container = document.getElementById('wallet-transactions-list');
  if (!container) return;

  const txs = state.wallet.transactions || [];
  if (txs.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-400 italic">Aucune transaction enregistrée.</p>`;
    return;
  }

  container.innerHTML = txs.slice(0, 5).map(t => {
    const isCredit = t.type !== 'retrait';
    return `
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span class="font-bold text-slate-800 dark:text-slate-200 block">${escapeHtml(t.note || t.type)}</span>
          <span class="text-[10px] text-slate-400 font-mono">${t.gateway} • ${t.createdAt ? t.createdAt.split('T')[0] : 'Récent'}</span>
        </div>
        <span class="font-black ${isCredit ? 'text-terracotta-500' : 'text-slate-400'}">
          ${isCredit ? '+' : '-'}${Number(t.amount).toFixed(3)} DT
        </span>
      </div>
    `;
  }).join('');
}

// Navigation & Perspective Sync
function syncPerspectiveButtons(perspective) {
  const isRecruiter = perspective === 'recruiter';
  const talentBtns = [
    document.getElementById('perspective-talent-btn'),
    document.getElementById('mobile-perspective-talent-btn')
  ];
  const recruiterBtns = [
    document.getElementById('perspective-recruiter-btn'),
    document.getElementById('mobile-perspective-recruiter-btn')
  ];

  talentBtns.forEach(btn => {
    if (!btn) return;
    btn.className = btn.id.includes('mobile')
      ? (isRecruiter
          ? 'flex-1 py-2 px-3 rounded-xl text-center text-slate-500 dark:text-slate-400 hover:text-slate-800 transition flex items-center justify-center gap-1.5'
          : 'flex-1 py-2 px-3 rounded-xl text-center bg-white dark:bg-slate-700 text-medina-600 dark:text-medina-400 font-bold shadow-sm transition flex items-center justify-center gap-1.5')
      : (isRecruiter
          ? 'px-2.5 py-1 rounded-lg transition text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          : 'px-2.5 py-1 rounded-lg transition bg-white dark:bg-slate-700 text-medina-600 dark:text-medina-400 shadow-sm');
    btn.setAttribute('aria-checked', isRecruiter ? 'false' : 'true');
  });

  recruiterBtns.forEach(btn => {
    if (!btn) return;
    btn.className = btn.id.includes('mobile')
      ? (isRecruiter
          ? 'flex-1 py-2 px-3 rounded-xl text-center bg-white dark:bg-slate-700 text-terracotta-600 dark:text-terracotta-400 font-bold shadow-sm transition flex items-center justify-center gap-1.5'
          : 'flex-1 py-2 px-3 rounded-xl text-center text-slate-500 dark:text-slate-400 hover:text-slate-800 transition flex items-center justify-center gap-1.5')
      : (isRecruiter
          ? 'px-2.5 py-1 rounded-lg transition bg-white dark:bg-slate-700 text-terracotta-600 dark:text-terracotta-400 shadow-sm'
          : 'px-2.5 py-1 rounded-lg transition text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200');
    btn.setAttribute('aria-checked', isRecruiter ? 'true' : 'false');
  });
}

export function switchPerspective(perspective) {
  syncPerspectiveButtons(perspective);
  if (perspective === 'recruiter') {
    navigateTo('page-company');
    showToast("🏢 Perspective Recruteur : Recherche des profils certifiés & envoi d'offres.");
  } else {
    navigateTo('page-profile-card');
    showToast("🎓 Perspective Talent : Carte 3D, Quêtes Hackathons et Cagnotte Tip Jar.");
  }
}

// Navigation
export function navigateTo(pageId) {
  document.querySelectorAll('.page-module').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Desktop primary nav active styling
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-page') === pageId) {
      btn.className = 'nav-btn px-3 py-1.5 rounded-xl text-xs font-bold text-medina-600 dark:text-medina-400 bg-medina-50 dark:bg-medina-950/60 border border-medina-200 dark:border-medina-800 transition duration-200';
    } else {
      btn.className = 'nav-btn px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-medina-600 dark:hover:text-white transition duration-200';
    }
  });

  // Mobile bottom bar active styling
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-page') === pageId;
    if (isTarget) {
      btn.classList.add('text-medina-600', 'dark:text-medina-400', 'font-bold');
      btn.classList.remove('text-slate-500', 'dark:text-slate-400');
    } else {
      btn.classList.remove('text-medina-600', 'dark:text-medina-400', 'font-bold');
      btn.classList.add('text-slate-500', 'dark:text-slate-400');
    }
  });

  if (pageId === 'page-company') {
    syncPerspectiveButtons('recruiter');
  } else if (pageId === 'page-profile-card' || pageId === 'page-intro' || pageId === 'page-events') {
    syncPerspectiveButtons('talent');
  }

  closeAllDropdowns();
}

// 3D Card Flip
export function flipPassCard() {
  const card = document.getElementById('user-pass-card');
  card?.classList.toggle('rotate-y-180');
}

// Guided Tour Stepper
export function startGuidedTour() {
  state.tourStep = 0;
  renderTourStep();
  openModal('modal-tour');
}

function renderTourStep() {
  const step = tourSteps[state.tourStep];
  setText('tour-step-counter', `Étape ${state.tourStep + 1} sur ${tourSteps.length}`);
  const content = document.getElementById('tour-step-content');
  if (content) {
    content.innerHTML = `
      <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-medina-100 text-medina-700 dark:bg-medina-950 dark:text-medina-300">${step.badge}</span>
      <h3 class="text-base font-black text-slate-900 dark:text-white pt-1">${step.title}</h3>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${step.desc}</p>
    `;
  }

  const prevBtn = document.getElementById('tour-prev-btn');
  if (prevBtn) prevBtn.style.visibility = state.tourStep === 0 ? 'hidden' : 'visible';

  const nextBtn = document.getElementById('tour-next-btn');
  if (nextBtn) nextBtn.textContent = state.tourStep === tourSteps.length - 1 ? 'Terminer la visite ✓' : 'Suivant ➔';
}

export function nextTourStep() {
  if (state.tourStep < tourSteps.length - 1) {
    state.tourStep++;
    renderTourStep();
  } else {
    closeModal('modal-tour');
    showToast('Visite terminée ! Créez votre carte ID pour activer vos 2 DT.');
  }
}

export function prevTourStep() {
  if (state.tourStep > 0) {
    state.tourStep--;
    renderTourStep();
  }
}

// Switch Tabs for Recommendations
export function switchRecTab(tab) {
  state.activeRecTab = tab;
  ['stages', 'jobs', 'formations'].forEach(t => {
    const btn = document.getElementById(`rec-tab-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold bg-medina-600 text-white shadow transition shrink-0 inline-flex items-center gap-1.5';
      } else {
        btn.className = 'btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#0b1329] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition shrink-0 inline-flex items-center gap-1.5';
      }
    }
  });
  renderTargetedSuggestions();
}

// Filter Recruiter Candidate Pool
export function filterTalentType(type) {
  state.activeTalentFilter = type;
  document.querySelectorAll('.talent-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === type) {
      btn.className = 'talent-filter-btn px-3 py-1 rounded-lg text-xs font-bold bg-medina-600 text-white';
    } else {
      btn.className = 'talent-filter-btn px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  });
  refreshCandidates();
}

export function handleCandidateSearch(query) {
  state.talentSearchTerm = query;
  refreshCandidates();
}

async function refreshCandidates() {
  try {
    state.candidates = await api.getCandidates(state.activeTalentFilter, state.talentSearchTerm);
    renderRecruiterCandidates();
  } catch (err) {
    console.error(err);
  }
}

// Change Avatar Preset
export async function changeAvatarPreset(title, icon) {
  try {
    const res = await api.updateAvatar(title, icon, state.currentUserId);
    state.user = res.user;
    triggerConfetti();
    showToast(`Avatar actualisé : ${title} (+5 XP) !`);
    renderUI();
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
}

// Participate in Event
export async function participateInEventById(eventId) {
  try {
    const res = await api.participateInEvent(eventId, state.currentUserId);
    state.user = res.user;
    triggerConfetti();
    showToast(res.message);
    await refreshAllData();
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
}

// Apply to Suggestion
export function applyToSuggestion(title) {
  triggerConfetti();
  showToast(`Candidature transmise à : ${title} ! L'employeur consulte actuellement votre profil certifié.`);
}

// Event Listeners and Modal Forms
function setupEventListeners() {
  // Mobile menu toggle
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });

  // Outside click closes user popover and explore dropdown
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-chip-container') && !e.target.closest('#mobile-bottom-profile-btn') && !e.target.closest('#mobile-header-avatar-btn')) {
      document.getElementById('user-popover')?.classList.add('hidden');
    }
    if (!e.target.closest('#explore-dropdown-container')) {
      document.getElementById('explore-dropdown')?.classList.add('hidden');
    }
  });

  // Keyboard accessibility: Escape key closes active modals, dropdowns and menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
      closeAllDropdowns();
    }
  });

  // Modal backdrop click closes modal
  document.querySelectorAll('[id^="modal-"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // Add Project Form
  document.getElementById('form-add-project')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('inp-proj-title').value;
    const url = document.getElementById('inp-proj-url').value;
    const tags = document.getElementById('inp-proj-tags').value;
    const desc = document.getElementById('inp-proj-desc').value;

    try {
      const res = await api.addProject({ userId: state.currentUserId, title, url, tags, desc });
      state.user = res.user;
      closeModal('modal-add-project');
      triggerConfetti();
      showToast('Projet enregistré avec succès (+15 XP) !');
      e.target.reset();
      await refreshAllData();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });

  // Add Review Form
  document.getElementById('form-add-review')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('inp-rev-author').value;
    const role = document.getElementById('inp-rev-role').value;
    const comment = document.getElementById('inp-rev-comment').value;

    try {
      const res = await api.addReview({ userId: state.currentUserId, author, role, comment });
      state.user = res.user;
      closeModal('modal-add-review');
      triggerConfetti();
      showToast('Recommandation publiée (+10 XP) !');
      e.target.reset();
      await refreshAllData();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });

  // Visitor Check-In Form
  document.getElementById('form-visitor')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('vis-name').value;
    const email = document.getElementById('vis-email').value;

    try {
      const res = await api.submitVisitor(name, email);
      state.isVisitor = true;
      state.currentUserId = res.user.id;
      state.user = res.user;
      closeModal('modal-visitor');
      showToast(`Pass Visiteur généré pour ${name}.`);
      setText('visitor-card-title', `Pass Visiteur Actif : ${name}`);
      renderUI();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });

  // Complete Registration Form
  document.getElementById('form-register')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const avatar = document.getElementById('reg-avatar').value;
    const school = document.getElementById('reg-school').value;
    const oldResume = document.getElementById('reg-old-resume').value;
    const payMethod = document.querySelector('input[name="reg_pay_method"]:checked')?.value || 'Flouci';

    try {
      const res = await api.submitRegistration({
        name,
        email,
        avatar,
        school,
        oldResume,
        payMethod
      });
      state.isVisitor = false;
      state.currentUserId = res.user.id;
      state.user = res.user;
      closeModal('modal-register');
      triggerConfetti();
      showToast(res.message);
      navigateTo('page-profile-card');
      await refreshAllData();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });

  // Wallet Simulation
  document.getElementById('btn-wallet-recharge')?.addEventListener('click', () => handleWalletAction('recharge'));
  document.getElementById('btn-wallet-retrait')?.addEventListener('click', () => handleWalletAction('retrait'));

  // Post Offer Form (Recruiter)
  document.getElementById('form-post-offer')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const company = document.getElementById('off-company').value;
    const type = document.getElementById('off-type').value;
    const skill = document.getElementById('off-skill').value;
    const desc = document.getElementById('off-desc')?.value || '';

    try {
      await api.postOffer({ company, type, skill, desc });
      closeModal('modal-offer');
      triggerConfetti();
      showToast('Offre diffusée avec succès auprès des candidats ciblés de Hammamet !');
      e.target.reset();
      await refreshAllData();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });

  // Direct Candidate Targeting Form
  document.getElementById('form-target-candidate')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const candidateId = document.getElementById('target-candidate-id').value;
    const companyName = document.getElementById('target-company-name').value;
    const offerType = document.getElementById('target-offer-type').value;
    const message = document.getElementById('target-message').value;

    try {
      const res = await api.targetCandidate(candidateId, companyName, offerType, message);
      closeModal('modal-target');
      triggerConfetti();
      showToast(res.message || 'Proposition transmise au candidat !');
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });

  // Candidate Search Input
  document.getElementById('candidate-search-input')?.addEventListener('input', (e) => {
    handleCandidateSearch(e.target.value);
  });

  // Partner Hackathon Creator Form
  document.getElementById('form-add-event')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const category = document.getElementById('event-category').value;
    const badge = document.getElementById('event-badge')?.value || 'Défi Partenaire';
    const dinarsReward = document.getElementById('event-dinars').value;
    const xpReward = document.getElementById('event-xp').value;
    const location = document.getElementById('event-location').value;
    const desc = document.getElementById('event-desc').value;
    const date = document.getElementById('event-date')?.value || '14 Novembre 2026';

    try {
      const res = await api.createEvent({ title, category, badge, dinarsReward, xpReward, location, desc, date });
      closeModal('modal-add-event');
      triggerConfetti();
      showToast(res.message || `Hackathon '${title}' publié avec succès !`);
      e.target.reset();
      await refreshAllData();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  });
}

// Wallet Action (Recharge / Retrait)
async function handleWalletAction(action) {
  const amountInput = document.getElementById('wallet-amount-input');
  const amount = parseFloat(amountInput?.value) || 5;
  const gateway = document.getElementById('wallet-gateway-select')?.value || 'Flouci';

  try {
    const res = await api.submitWalletTransaction(action, amount, gateway, '', state.currentUserId);
    state.user = res.user;
    closeModal('modal-wallet');
    triggerConfetti();
    showToast(res.message);
    await refreshAllData();
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
}

// Direct Target Modal Opener
export function openTargetModal(candidateId, candidateName) {
  document.getElementById('target-candidate-id').value = candidateId;
  document.getElementById('target-candidate-name-display').textContent = candidateName;
  openModal('modal-target');
}

// Cookie Consent
export function acceptMinimalCookies() {
  state.hasAcceptedCookies = true;
  localStorage.setItem('pi_cookies_accepted', 'true');
  api.recordCookieConsent(state.currentUserId);
  document.getElementById('cookie-banner')?.classList.add('hidden');
  showToast('✓ Cookies essentiels enregistrés : Pass ID, email et nom uniquement.');
}

// Theme Context & Controller
export const ThemeContext = {
  getTheme() {
    try {
      const saved = localStorage.getItem('pi_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'dark'; // Safe fallback default to 'dark'
  },
  setTheme(theme) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('pi_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
    this.updateVisualState(isDark);
    return isDark;
  },
  toggle() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    return this.setTheme(next);
  },
  updateVisualState(isDark) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.textContent = isDark ? '☀️' : '🌙';
      icon.setAttribute('aria-label', isDark ? 'Activer le mode clair' : 'Activer le mode sombre');
    }
    const btn = document.getElementById('theme-btn');
    if (btn) {
      btn.setAttribute('title', isDark ? 'Passer en mode clair' : 'Passer en mode sombre');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
  },
  init() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qTheme = urlParams.get('theme');
      if (qTheme === 'light' || qTheme === 'dark') {
        this.setTheme(qTheme);
        return;
      }
    } catch (e) {}
    this.setTheme(this.getTheme());
  }
};

let lastThemeToggle = 0;
export function toggleTheme(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  const now = Date.now();
  if (now - lastThemeToggle < 80) return; // Debounce dual-fire
  lastThemeToggle = now;
  return ThemeContext.toggle();
}

function initTheme() {
  ThemeContext.init();
}

// Splash Screen
function initSplashScreen() {
  const bar = document.getElementById('splash-progress');
  if (bar) setTimeout(() => { bar.style.width = '100%'; }, 200);
}

export function dismissSplash() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
    if (!state.hasAcceptedCookies) {
      document.getElementById('cookie-banner')?.classList.remove('hidden');
    }
  }, 700);
}

// Mobile & Dropdown Navigation Helpers
export function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.add('hidden');
}

export function toggleExploreDropdown() {
  document.getElementById('user-popover')?.classList.add('hidden');
  document.getElementById('explore-dropdown')?.classList.toggle('hidden');
}

export function toggleUserDropdown() {
  document.getElementById('explore-dropdown')?.classList.add('hidden');
  document.getElementById('user-popover')?.classList.toggle('hidden');
}

export function closeAllDropdowns() {
  document.getElementById('explore-dropdown')?.classList.add('hidden');
  document.getElementById('user-popover')?.classList.add('hidden');
  document.getElementById('mobile-menu')?.classList.add('hidden');
}

// Modals Helper
export function openModal(id) {
  closeMobileMenu();
  document.getElementById(id)?.classList.remove('hidden');
}

export function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

// Toast Notifications
export function showToast(message) {
  const container = document.getElementById('toast-wrapper');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-white dark:bg-[#0b1329] text-slate-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-800 transform transition-all duration-300 translate-y-2 opacity-0 max-w-sm';
  toast.innerHTML = `<svg class="w-4 h-4 text-medina-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// Confetti Celebration
export function triggerConfetti() {
  if (typeof window.confetti === 'function') {
    window.confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#ea580c', '#facc15', '#10b981']
    });
  }
}

// Render Inbox Proposals
function renderInbox() {
  const container = document.getElementById('inbox-list');
  const countBadge = document.getElementById('inbox-unread-count');
  const mobileCountBadge = document.getElementById('inbox-mobile-count');

  const pending = (state.inbox || []).filter(item => !item.status || item.status === 'pending');
  const count = pending.length;

  if (countBadge) {
    countBadge.textContent = count;
    if (count === 0) {
      countBadge.classList.add('hidden');
    } else {
      countBadge.classList.remove('hidden');
    }
  }

  if (mobileCountBadge) {
    mobileCountBadge.textContent = count;
    if (count === 0) {
      mobileCountBadge.classList.add('hidden');
    } else {
      mobileCountBadge.classList.remove('hidden');
    }
  }

  if (!container) return;

  if (!state.inbox || state.inbox.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center space-y-2">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Aucune offre reçue pour le moment</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Vos participations aux hackathons et votre statut 'Ciblé' incitent les entreprises de Hammamet à vous contacter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.inbox.map(item => {
    const isPending = !item.status || item.status === 'pending' || item.status === 'offered_by_company' || item.status === 'submitted';
    const isAccepted = item.status === 'accepted';
    const company = item.companyName || item.company || 'Entreprise Partenaire';
    const offerType = item.offerType || item.offerTitle || 'Mission';
    const d = item.createdAt ? new Date(item.createdAt) : new Date();

    return `
      <div class="py-3.5 first:pt-1 last:pb-1 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="font-extrabold text-sm text-slate-900 dark:text-white">${escapeHtml(company)}</span>
            <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-950 dark:text-terracotta-300">${escapeHtml(offerType)}</span>
          </div>
          <span class="text-[10px] font-mono text-slate-400 shrink-0">${d.toLocaleDateString('fr-FR')}</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(item.message || 'Nous avons consulté votre carte Passe Impact et souhaitons échanger avec vous.')}</p>
        <div class="flex items-center justify-between pt-1">
          ${isPending ? `
            <div class="flex items-center gap-2">
              <button onclick="window.HubAct.respondToProposal('${escapeHtml(item.id)}', 'accepted')" class="btn-tactile px-3 py-1.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs shadow-sm flex items-center gap-1">
                <span>✓</span> Accepter (+20 XP)
              </button>
              <button onclick="window.HubAct.respondToProposal('${escapeHtml(item.id)}', 'declined')" class="btn-tactile px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold">
                Décliner
              </button>
            </div>
          ` : isAccepted ? `
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold text-medina-700 dark:text-medina-400 bg-medina-50 dark:bg-medina-950/60 border border-medina-200 dark:border-medina-800 flex items-center gap-1">
              <span>✓</span> Proposition acceptée (+20 XP)
            </span>
          ` : `
            <span class="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800">
              Proposition déclinée
            </span>
          `}
          <span class="text-[10px] text-slate-400 font-mono">ID: ${escapeHtml(item.id)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Respond to Recruiter Proposal (Accept / Decline)
export async function respondToProposal(proposalId, status) {
  try {
    const res = await api.respondToProposal(proposalId, status);
    if (status === 'accepted') {
      triggerConfetti();
      showToast(res.message || 'Proposition acceptée (+20 XP) ! Félicitations.');
    } else {
      showToast('Proposition déclinée.');
    }
    await refreshAllData();
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
}

// Render Native SVG QR Code for Biometric Pass
function renderQRCode() {
  const container = document.getElementById('pass-qr-container');
  if (!container) return;

  container.innerHTML = `
    <svg viewBox="0 0 29 29" class="w-full h-full text-slate-900" fill="currentColor" shape-rendering="crispEdges">
      <!-- Finder Top-Left -->
      <rect x="2" y="2" width="7" height="7"/>
      <rect x="3" y="3" width="5" height="5" fill="white"/>
      <rect x="4" y="4" width="3" height="3"/>
      
      <!-- Finder Top-Right -->
      <rect x="20" y="2" width="7" height="7"/>
      <rect x="21" y="3" width="5" height="5" fill="white"/>
      <rect x="22" y="4" width="3" height="3"/>

      <!-- Finder Bottom-Left -->
      <rect x="2" y="20" width="7" height="7"/>
      <rect x="3" y="21" width="5" height="5" fill="white"/>
      <rect x="4" y="22" width="3" height="3"/>

      <!-- Alignment Pattern -->
      <rect x="18" y="18" width="5" height="5"/>
      <rect x="19" y="19" width="3" height="3" fill="white"/>
      <rect x="20" y="20" width="1" height="1"/>

      <!-- Timing & Payload -->
      <rect x="10" y="4" width="1" height="1"/><rect x="12" y="4" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="16" y="4" width="1" height="1"/>
      <rect x="4" y="10" width="1" height="1"/><rect x="4" y="12" width="1" height="1"/><rect x="4" y="14" width="1" height="1"/><rect x="4" y="16" width="1" height="1"/>
      <rect x="10" y="10" width="2" height="1"/><rect x="13" y="10" width="1" height="2"/><rect x="15" y="10" width="2" height="1"/>
      <rect x="10" y="12" width="1" height="2"/><rect x="12" y="13" width="2" height="1"/><rect x="16" y="12" width="1" height="2"/>
      <rect x="10" y="15" width="2" height="2"/><rect x="13" y="14" width="1" height="1"/><rect x="15" y="15" width="2" height="1"/>
      <rect x="10" y="18" width="1" height="2"/><rect x="13" y="17" width="2" height="1"/><rect x="10" y="22" width="2" height="1"/>
      <rect x="13" y="21" width="1" height="2"/><rect x="15" y="22" width="2" height="1"/><rect x="13" y="24" width="2" height="1"/>
      <rect x="20" y="10" width="2" height="1"/><rect x="23" y="11" width="1" height="2"/><rect x="25" y="10" width="2" height="1"/>
      <rect x="21" y="13" width="1" height="2"/><rect x="24" y="14" width="2" height="1"/><rect x="24" y="24" width="3" height="2"/>
    </svg>
  `;
}

// Print / PDF Export
export function printPass() {
  window.print();
}

// Helper utilities
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Expose on window for inline HTML onclick handlers and early delegates
window.HubAct = Object.assign(window.HubAct || {}, {
  __realToggleTheme: toggleTheme,
  __realNavigateTo: navigateTo,
  navigateTo,
  closeMobileMenu,
  flipPassCard,
  startGuidedTour,
  nextTourStep,
  prevTourStep,
  switchRecTab,
  filterTalentType,
  handleCandidateSearch,
  changeAvatarPreset,
  participateInEventById,
  applyToSuggestion,
  openTargetModal,
  acceptMinimalCookies,
  toggleTheme,
  dismissSplash,
  openModal,
  closeModal,
  showToast,
  triggerConfetti,
  printPass,
  respondToProposal,
  switchPerspective,
  toggleExploreDropdown,
  toggleUserDropdown,
  closeAllDropdowns,
  ThemeContext,
  NAVIGATION_ITEMS
});

// Auto start on load (or immediate if DOMContentLoaded already fired)
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

