import { api } from './api.js';

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
    xp: 35,
    dinarsJar: 2.000,
    isTargeted: 1
  },
  projects: [],
  reviews: [],
  events: [],
  offers: [],
  candidates: [],
  wallet: { balance: 2.000, xp: 35, transactions: [] },
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
  const cookieSaved = localStorage.getItem('pi_cookies_accepted');
  if (cookieSaved === 'true') {
    state.hasAcceptedCookies = true;
    document.getElementById('cookie-banner')?.classList.add('hidden');
  }

  // Fetch data from backend
  await refreshAllData();
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
}

// Header & Pill Bars
function renderHeaderControls() {
  const dinars = state.user.dinarsJar || 0;
  const xp = state.user.xp || 0;

  const dinarsTopEl = document.getElementById('wallet-dinars-top');
  if (dinarsTopEl) dinarsTopEl.textContent = dinars.toFixed(3);

  const xpTopEl = document.getElementById('wallet-xp-top');
  if (xpTopEl) xpTopEl.textContent = xp;

  const walletModalBal = document.getElementById('wallet-modal-balance');
  if (walletModalBal) walletModalBal.textContent = dinars.toFixed(3);

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
      <div class="col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
        Aucun projet enregistré pour l'instant. Cliquez sur "+ Ajouter un projet" pour booster votre score (+15 XP).
      </div>
    `;
    return;
  }

  container.innerHTML = state.projects.map(p => `
    <article class="bg-[#0b121e] border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
      <div class="space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <h4 class="text-sm font-bold text-white leading-snug">${escapeHtml(p.title)}</h4>
          <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-medina-400 hover:text-medina-300 flex items-center gap-1 shrink-0">
            <span>Démo</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(p.desc)}</p>
      </div>
      <div class="p-2 rounded-xl bg-[#132034] border border-[#1e3450] text-[11px] font-mono text-slate-200 truncate">
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
      <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 text-xs">
        Aucune recommandation pour l'instant. Invitez un mentor ou collègue à vous laisser un avis (+10 XP).
      </div>
    `;
    return;
  }

  container.innerHTML = state.reviews.map(r => `
    <article class="bg-[#0b121e] border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-slate-700 transition">
      <div class="flex items-center justify-between">
        <div>
          <h5 class="text-sm font-bold text-white">${escapeHtml(r.author)}</h5>
          <p class="text-[11px] text-slate-400 font-medium">${escapeHtml(r.role)}</p>
        </div>
        <div class="text-amber-400 text-sm tracking-wider flex items-center">
          ${'★'.repeat(r.rating || 5)}
        </div>
      </div>
      <p class="text-xs text-slate-300 italic leading-relaxed pt-1">
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
      <div class="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-emerald-400">PFE Recommandé Spécifique</span>
          <h4 class="text-sm font-bold text-white">Stage PFE : Plateforme Hôtelière & API Flouci</h4>
          <p class="text-xs text-slate-400">Hôtel Hasdrubal Thalassa Hammamet • 450 DT / mois</p>
          <p class="text-[11px] text-slate-300">Concordance à 98% avec vos projets React et API de paiement certifiés sur votre carte.</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Stage PFE Hasdrubal')" class="w-full py-2 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Candidater avec mon Pass ID Ciblé ➔
        </button>
      </div>

      <div class="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-amber-400">Stage d'été / Perfectionnement</span>
          <h4 class="text-sm font-bold text-white">Assistant UI/UX & Numérisation Médina</h4>
          <p class="text-xs text-slate-400">Startup Yallabiz Travel • Hammamet Centre</p>
          <p class="text-[11px] text-slate-300">Participation à la création du catalogue interactif des artisans céramistes.</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Stage Été Yallabiz')" class="w-full py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition">
          Candidater avec mon Pass ID Ciblé ➔
        </button>
      </div>
    `;
  } else if (state.activeRecTab === 'jobs') {
    container.innerHTML = `
      <div class="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-jasmine-300">Premier Emploi / CDI Junior</span>
          <h4 class="text-sm font-bold text-white">Développeur Frontend Web Junior (React/Node)</h4>
          <p class="text-xs text-slate-400">Agence Médina Tech • Hammamet / Télétravail</p>
          <p class="text-[11px] text-slate-300">Rémunération : 1200 - 1500 DT/mois. Vos points XP vous dispensent du test technique initial !</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Emploi Médina Tech')" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
          Postuler en 1 Clic ➔
        </button>
      </div>

      <div class="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-medina-400">Mission Freelance Rémunérée</span>
          <h4 class="text-sm font-bold text-white">Widget Météo & Cartes Médina Hammamet</h4>
          <p class="text-xs text-slate-400">Office du Tourisme Nabeul-Hammamet • Durée : 2 semaines</p>
          <p class="text-[11px] text-slate-300">Budget garanti en séquestre : 600 DT versés directement dans votre Tip Jar.</p>
        </div>
        <button onclick="window.HubAct.applyToSuggestion('Mission Freelance Office Tourisme')" class="w-full py-2 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Accepter la Mission Freelance ➔
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-amber-400">+30 XP & Certification</span>
          <h4 class="text-sm font-bold text-white">Next.js 15 & E-commerce Touristique</h4>
          <p class="text-xs text-slate-400">HUBACT Lab Hammamet • 10 heures</p>
          <p class="text-[11px] text-slate-300">Renforcez votre Avatar pour débloquer les offres de stages supérieures à 50 XP.</p>
        </div>
        <button onclick="window.HubAct.participateInEventById('ev-4')" class="w-full py-2 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs transition">
          Démarrer (+30 XP & +4 DT) ➔
        </button>
      </div>

      <div class="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase text-emerald-400">+25 XP Pratique</span>
          <h4 class="text-sm font-bold text-white">Sécurité des Webhooks Flouci & Konnect</h4>
          <p class="text-xs text-slate-400">Fintech Tunisia • 6 heures</p>
          <p class="text-[11px] text-slate-300">Idéal pour certifier vos compétences en intégration bancaire tunisienne.</p>
        </div>
        <button onclick="window.HubAct.participateInEventById('ev-2')" class="w-full py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition">
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
    <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-medina-400 transition">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-medina-100 text-medina-700 dark:bg-medina-950 dark:text-medina-300">${escapeHtml(ev.category)}</span>
          <span class="text-xs font-black text-amber-500 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            +${ev.xpReward} XP
          </span>
        </div>
        <h4 class="text-base font-black text-slate-900 dark:text-white">${escapeHtml(ev.title)}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${escapeHtml(ev.desc)}</p>
        <div class="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
          <div class="flex items-start gap-1.5">
            <span class="text-medina-500 font-bold">📍</span>
            <span><strong>Lieu :</strong> ${escapeHtml(ev.location)}</span>
          </div>
          <div class="flex items-start gap-1.5">
            <span class="text-emerald-500 font-bold">💰</span>
            <span><strong>Compensation :</strong> ${ev.dinarsReward.toFixed(3)} DT versés dans votre Tip Jar</span>
          </div>
        </div>
      </div>
      <div class="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
        <button onclick="window.HubAct.participateInEventById('${ev.id}')" class="w-full py-2.5 rounded-xl bg-medina-600 hover:bg-medina-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2">
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
    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between hover:border-medina-400 transition">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-slate-900 dark:text-white">${escapeHtml(c.name)}</span>
          <span class="text-xs font-black text-amber-500">⭐ ${c.xp} XP</span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-medina-100 dark:bg-medina-950 text-medina-700 dark:text-medina-300 inline-block">
          ${c.role === 'student' ? '🎓 Étudiant PFE' : c.role === 'worker' ? '💼 Travailleur Junior' : '🌍 Freelancer Qualifié'}
        </span>
        <p class="text-xs text-medina-600 dark:text-medina-400 font-bold">${escapeHtml(c.avatar)}</p>
        <p class="text-[11px] text-slate-500">${escapeHtml(c.school)}</p>
        <div class="text-[10px] text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
          Compétences : ${escapeHtml(c.oldResume || 'React, API, Fullstack')}
        </div>
      </div>
      <div class="pt-2 border-t border-slate-100 dark:border-slate-700">
        <button onclick="window.HubAct.openTargetModal('${c.id}', '${escapeHtml(c.name)}')" class="w-full py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs transition">
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
        <span class="font-black ${isCredit ? 'text-emerald-500' : 'text-rose-500'}">
          ${isCredit ? '+' : '-'}${Number(t.amount).toFixed(3)} DT
        </span>
      </div>
    `;
  }).join('');
}

// Navigation
export function navigateTo(pageId) {
  document.querySelectorAll('.page-module').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-page') === pageId) {
      btn.className = 'nav-btn px-3 py-1.5 rounded-lg text-xs font-bold text-medina-600 dark:text-medina-400 bg-medina-50 dark:bg-medina-950/60 border border-medina-200 dark:border-medina-800';
    } else {
      btn.className = 'nav-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-medina-600 hover:bg-slate-100 dark:hover:bg-slate-800';
    }
  });

  document.getElementById('mobile-menu')?.classList.add('hidden');
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
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-medina-600 text-white shadow transition';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition';
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

  // Dark mode button
  document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);

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

// Theme Switcher
export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('pi_theme', isDark ? 'dark' : 'light');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = isDark ? '☀️' : '🌙';
}

function initTheme() {
  const saved = localStorage.getItem('pi_theme');
  const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = isDark ? '☀️' : '🌙';
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

// Modals Helper
export function openModal(id) {
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
  toast.className = 'pointer-events-auto bg-slate-950/95 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 dark:border-slate-200 transform transition-all duration-300 translate-y-2 opacity-0 max-w-sm';
  toast.innerHTML = `<svg class="w-4 h-4 text-jasmine-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg><span>${escapeHtml(message)}</span>`;
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

// Expose on window for inline HTML onclick handlers
window.HubAct = {
  navigateTo,
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
  triggerConfetti
};

// Auto start on load
window.addEventListener('DOMContentLoaded', initApp);
