// Passe Impact Hammamet - Client API Service
const API_BASE = '/api';

export const api = {
  async getProfile(userId = 'u-default') {
    const res = await fetch(`${API_BASE}/profile?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur chargement profil');
    return res.json();
  },

  async updateAvatar(avatar, avatarIcon, userId = 'u-default') {
    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, avatar, avatarIcon })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur mise à jour avatar');
    return res.json();
  },

  async submitVisitor(name, email) {
    const res = await fetch(`${API_BASE}/auth/visitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur pass visiteur');
    return res.json();
  },

  async submitRegistration(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur inscription');
    return res.json();
  },

  async getProjects(userId = 'u-default') {
    const res = await fetch(`${API_BASE}/projects?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur projets');
    return res.json();
  },

  async addProject(projectData) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ajout projet');
    return res.json();
  },

  async getReviews(userId = 'u-default') {
    const res = await fetch(`${API_BASE}/reviews?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur avis');
    return res.json();
  },

  async addReview(reviewData) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ajout avis');
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur hackathons');
    return res.json();
  },

  async participateInEvent(eventId, userId = 'u-default') {
    const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}/participate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur participation');
    return res.json();
  },

  async getWallet(userId = 'u-default') {
    const res = await fetch(`${API_BASE}/wallet?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur cagnotte');
    return res.json();
  },

  async submitWalletTransaction(type, amount, gateway, note, userId = 'u-default') {
    const res = await fetch(`${API_BASE}/wallet/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, amount, gateway, note })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur transaction');
    return res.json();
  },

  async getOffers(type = 'all') {
    const res = await fetch(`${API_BASE}/offers?type=${encodeURIComponent(type)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur offres');
    return res.json();
  },

  async postOffer(data) {
    const res = await fetch(`${API_BASE}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur publication offre');
    return res.json();
  },

  async applyToOffer(offerId, userId = 'u-default') {
    const res = await fetch(`${API_BASE}/offers/${encodeURIComponent(offerId)}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur candidature');
    return res.json();
  },

  async getCandidates(role = 'all', search = '') {
    const res = await fetch(`${API_BASE}/candidates?role=${encodeURIComponent(role)}&search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur candidats');
    return res.json();
  },

  async targetCandidate(candidateId, companyName, offerType, message) {
    const res = await fetch(`${API_BASE}/candidates/${encodeURIComponent(candidateId)}/target`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, offerType, message })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ciblage');
    return res.json();
  },

  async recordCookieConsent(userId = 'guest') {
    const res = await fetch(`${API_BASE}/cookies/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionRef: `browser-${Date.now()}` })
    });
    return res.json();
  }
};
