import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.VERCEL ? '/tmp' : resolve(__dirname, '../../data');
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = resolve(DATA_DIR, 'passe_impact.db');
export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'student',
      avatar TEXT DEFAULT 'Frontend Dev & Tourisme Tech',
      avatarIcon TEXT DEFAULT '👨‍💻',
      school TEXT DEFAULT 'ISET Nabeul / INSAT • Résidence Hammamet',
      oldResume TEXT DEFAULT 'Licence appliquée en Technologies du Web. Projets scolaires en JavaScript et participation à un club éco-citoyenneté.',
      xp INTEGER DEFAULT 35,
      dinarsJar REAL DEFAULT 2.000,
      isTargeted INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      desc TEXT NOT NULL,
      tags TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      author TEXT NOT NULL,
      role TEXT NOT NULL,
      comment TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      badge TEXT NOT NULL,
      xpReward INTEGER NOT NULL,
      dinarsReward REAL NOT NULL,
      location TEXT NOT NULL,
      desc TEXT NOT NULL,
      date TEXT NOT NULL,
      participantsCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS participations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      eventId TEXT NOT NULL,
      eventTitle TEXT NOT NULL,
      xpEarned INTEGER NOT NULL,
      dinarsEarned REAL NOT NULL,
      completedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      gateway TEXT NOT NULL,
      note TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      type TEXT NOT NULL,
      skill TEXT NOT NULL,
      desc TEXT,
      location TEXT DEFAULT 'Hammamet Centre',
      stipend TEXT DEFAULT 'Selon profil',
      status TEXT DEFAULT 'open',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      offerId TEXT NOT NULL,
      offerTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      userId TEXT NOT NULL,
      candidateName TEXT NOT NULL,
      candidateAvatar TEXT NOT NULL,
      status TEXT DEFAULT 'submitted',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cookie_consents (
      id TEXT PRIMARY KEY,
      userId TEXT,
      sessionRef TEXT,
      acceptedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const existingUser = db.prepare("SELECT id FROM users WHERE id = ?").get("u-default");
  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (id, name, email, role, avatar, avatarIcon, school, oldResume, xp, dinarsJar, isTargeted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "u-default",
      "Youssef Mansour",
      "youssef@isetn.tn",
      "student",
      "Frontend Dev & Tourisme Tech",
      "👨‍💻",
      "ISET Nabeul / INSAT • Résidence Hammamet",
      "Licence appliquée en Technologies du Web. Projets scolaires en JavaScript et participation à un club éco-citoyenneté.",
      35,
      2.000,
      1
    );

    db.prepare(`
      INSERT INTO wallet_transactions (id, userId, type, amount, gateway, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("tx-welcome-001", "u-default", "welcome_bonus", 2.000, "System", "Prime de bienvenue d'inscription Pass ID Hammamet");
  }

  const candidateCount = db.prepare("SELECT count(*) as count FROM users").get().count;
  if (candidateCount <= 1) {
    const candidates = [
      {
        id: "u-sarra",
        name: "Sarra Trabelsi",
        email: "sarra.trabelsi@enit.tn",
        role: "worker",
        avatar: "Ingénieur IA & Smart Medina",
        avatarIcon: "🤖",
        school: "Diplômée ENIT Tunis / Hammamet Sud",
        oldResume: "Cycle ingénieur Génie Informatique. Spécialisation en Computer Vision et modèles de langage.",
        xp: 65,
        dinarsJar: 14.000,
        isTargeted: 1
      },
      {
        id: "u-amine",
        name: "Amine Bouazizi",
        email: "amine.bouazizi@gmail.com",
        role: "freelancer",
        avatar: "Leader Civic Tech & Ta'sir",
        avatarIcon: "🤝",
        school: "Freelance • Ancien ISET Nabeul",
        oldResume: "Coordination de projets associatifs locaux, applications de mobilisation citoyenne et UI Design.",
        xp: 45,
        dinarsJar: 9.500,
        isTargeted: 1
      },
      {
        id: "u-nourhene",
        name: "Nourhene Khelifi",
        email: "nourhene.khelifi@esprit.tn",
        role: "student",
        avatar: "Développeuse Mobile Flutter",
        avatarIcon: "📱",
        school: "ESPRIT / Résidence Nabeul",
        oldResume: "Étudiante 4ème année Génie Logiciel. Création d'applications mobiles avec intégration de paiement D17.",
        xp: 40,
        dinarsJar: 7.000,
        isTargeted: 1
      }
    ];

    for (const c of candidates) {
      db.prepare(`
        INSERT OR IGNORE INTO users (id, name, email, role, avatar, avatarIcon, school, oldResume, xp, dinarsJar, isTargeted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(c.id, c.name, c.email, c.role, c.avatar, c.avatarIcon, c.school, c.oldResume, c.xp, c.dinarsJar, c.isTargeted);
    }
  }

  const projectCount = db.prepare("SELECT count(*) as count FROM projects").get().count;
  if (projectCount === 0) {
    const seedProjects = [
      {
        id: "p1",
        userId: "u-default",
        title: "Portail Touristique 'Hammamet Authentique'",
        url: "https://demo.hubact.tn/hammamet-tourisme",
        desc: "Plateforme interactive répertoriant les artisans céramistes et les maisons d'hôtes de la vieille Médina.",
        tags: "React, Tailwind, API Météo & Cartes"
      },
      {
        id: "p2",
        userId: "u-default",
        title: "Intégrateur Flouci pour Boutiques Locales",
        url: "https://github.com/hubact/flouci-micro-gateway",
        desc: "Module open-source permettant aux artisans de Nabeul et Hammamet d'accepter les paiements instantanés.",
        tags: "Node.js, Webhooks, Flouci SDK"
      }
    ];

    for (const p of seedProjects) {
      db.prepare(`
        INSERT INTO projects (id, userId, title, url, desc, tags)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(p.id, p.userId, p.title, p.url, p.desc, p.tags);
    }
  }

  const reviewCount = db.prepare("SELECT count(*) as count FROM reviews").get().count;
  if (reviewCount === 0) {
    const seedReviews = [
      {
        id: "r1",
        userId: "u-default",
        author: "Karim Ben Cheikh",
        role: "CTO @ Startup Hammamet • Il y a 3 jours",
        comment: "Youssef a fait preuve d'une autonomie remarquable lors du sprint technique. Son code React est propre et bien documenté.",
        rating: 5
      },
      {
        id: "r2",
        userId: "u-default",
        author: "Mouna Belhadj",
        role: "Présidente JCI Hammamet • Il y a 2 semaines",
        comment: "Excellente énergie sur les projets Ta'sir. Toujours ponctuel et force de proposition pour valoriser les jeunes locaux.",
        rating: 5
      }
    ];

    for (const r of seedReviews) {
      db.prepare(`
        INSERT INTO reviews (id, userId, author, role, comment, rating)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(r.id, r.userId, r.author, r.role, r.comment, r.rating);
    }
  }

  const eventCount = db.prepare("SELECT count(*) as count FROM events").get().count;
  if (eventCount === 0) {
    const seedEvents = [
      {
        id: "ev-1",
        title: "Hackathon 'Smart Médina & Artisans'",
        category: "Hackathon Phare",
        badge: "Phare",
        xpReward: 45,
        dinarsReward: 10.000,
        location: "Centre Culturel International Dar Sebastian, Hammamet",
        desc: "48h immersives pour concevoir des applications de valorisation des poteries, du jasmin et des galeries de la vieille Médina.",
        date: "Prochaine session : Samedi prochain",
        participantsCount: 38
      },
      {
        id: "ev-2",
        title: "Bootcamp API Flouci & Konnect",
        category: "Atelier Fintech",
        badge: "Fintech",
        xpReward: 25,
        dinarsReward: 5.000,
        location: "Marina Yasmine Hammamet",
        desc: "Intégration technique des moyens de paiement tunisiens (Flouci, D17) pour booster les réservations hôtelières en ligne.",
        date: "En continu",
        participantsCount: 52
      },
      {
        id: "ev-3",
        title: "Sprint Ta'sir : Tourisme Zéro Déchet",
        category: "Défi Éco-Civique",
        badge: "Civique",
        xpReward: 35,
        dinarsReward: 8.000,
        location: "Fort Historique de Hammamet",
        desc: "Prototypage d'une carte citoyenne pour la gestion intelligente des plages et la propreté urbaine avec la JCI Hammamet.",
        date: "Ce week-end",
        participantsCount: 29
      },
      {
        id: "ev-4",
        title: "Formation Next.js 15 & E-commerce Touristique",
        category: "Formation Certifiante",
        badge: "Formation",
        xpReward: 30,
        dinarsReward: 4.000,
        location: "HUBACT Lab Hammamet (En ligne ou présentiel)",
        desc: "Architecture d'applications modernes pour la réservation et la promotion du patrimoine artisanal côtier.",
        date: "Session active",
        participantsCount: 64
      }
    ];

    for (const ev of seedEvents) {
      db.prepare(`
        INSERT INTO events (id, title, category, badge, xpReward, dinarsReward, location, desc, date, participantsCount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(ev.id, ev.title, ev.category, ev.badge, ev.xpReward, ev.dinarsReward, ev.location, ev.desc, ev.date, ev.participantsCount);
    }
  }

  const offerCount = db.prepare("SELECT count(*) as count FROM offers").get().count;
  if (offerCount === 0) {
    const seedOffers = [
      {
        id: "off-1",
        company: "Hôtel Radisson Blu Hammamet",
        type: "Stage PFE",
        skill: "Refonte du portail client & Intégration Flouci",
        desc: "Développement du système de réservation directe des chambres et activités nautiques avec passerelle Flouci.",
        location: "Hammamet Nord",
        stipend: "450 DT / mois"
      },
      {
        id: "off-2",
        company: "Médina Smart Tourisme",
        type: "Premier Emploi",
        skill: "Développeur React/Node & Cartes Interactives",
        desc: "Conception de la cartographie interactive de la Médina et des guides vocaux pour les touristes.",
        location: "Hammamet Centre",
        stipend: "1300 DT / mois"
      },
      {
        id: "off-3",
        company: "Association Sauvegarde Hammamet",
        type: "Stage d'été",
        skill: "Coordination Civic Tech & Écologie Côtière",
        desc: "Animation de la plateforme citoyenne Ta'sir et collecte de données géographiques.",
        location: "Médina de Hammamet",
        stipend: "300 DT indemnité"
      },
      {
        id: "off-4",
        company: "Office Régional du Tourisme Nabeul-Hammamet",
        type: "Mission Freelance",
        skill: "Widget Météo & Cartes Médina",
        desc: "Mission courte de 2 semaines pour concevoir un widget embeddable pour les hôtels partenaires.",
        location: "Télétravail / Hammamet",
        stipend: "600 DT forfait garanti"
      }
    ];

    for (const off of seedOffers) {
      db.prepare(`
        INSERT INTO offers (id, company, type, skill, desc, location, stipend)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(off.id, off.company, off.type, off.skill, off.desc, off.location, off.stipend);
    }
  }

  const appCount = db.prepare("SELECT count(*) as count FROM applications").get().count;
  if (appCount === 0) {
    db.prepare(`
      INSERT INTO applications (id, offerId, offerTitle, company, userId, candidateName, candidateAvatar, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "prop-seed-1",
      "direct-target",
      "Stage PFE : Intégration Flouci & Dashboard Hôtelier",
      "Radisson Blu Resort Hammamet",
      "u-default",
      "Youssef Mansour",
      "Frontend Dev & Tourisme Tech",
      "offered_by_company"
    );
  }
}

// Data Access Repository
export const repository = {
  getUser(id = "u-default") {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  },

  getUserByEmail(email) {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  },

  createUser({ id, name, email, role = "student", avatar = "Frontend Dev & Tourisme Tech", avatarIcon = "👨‍💻", school = "ISET Nabeul / INSAT", oldResume = "Formation universitaire" }) {
    const userId = id || `u-${Date.now()}`;
    db.prepare(`
      INSERT INTO users (id, name, email, role, avatar, avatarIcon, school, oldResume, xp, dinarsJar, isTargeted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, role, avatar, avatarIcon, school, oldResume, 50, 2.000, 1);

    db.prepare(`
      INSERT INTO wallet_transactions (id, userId, type, amount, gateway, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`tx-${Date.now()}`, userId, "welcome_bonus", 2.000, "Flouci", "Prime d'inscription de bienvenue (2 DT offerts)");

    return this.getUser(userId);
  },

  updateUser(id, data) {
    const fields = [];
    const values = [];
    for (const [k, v] of Object.entries(data)) {
      if (k !== "id") {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    }
    values.push(id);
    db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return this.getUser(id);
  },

  getProjects(userId = "u-default") {
    return db.prepare("SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC").all(userId);
  },

  addProject({ userId = "u-default", title, url, desc, tags }) {
    const id = `p-${Date.now()}`;
    db.prepare(`
      INSERT INTO projects (id, userId, title, url, desc, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, title, url, desc, tags);

    db.prepare("UPDATE users SET xp = xp + 15 WHERE id = ?").run(userId);
    return db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  },

  getReviews(userId = "u-default") {
    return db.prepare("SELECT * FROM reviews WHERE userId = ? ORDER BY createdAt DESC").all(userId);
  },

  addReview({ userId = "u-default", author, role, comment, rating = 5 }) {
    const id = `r-${Date.now()}`;
    db.prepare(`
      INSERT INTO reviews (id, userId, author, role, comment, rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, author, role, comment, rating);

    db.prepare("UPDATE users SET xp = xp + 10 WHERE id = ?").run(userId);
    return db.prepare("SELECT * FROM reviews WHERE id = ?").get(id);
  },

  getEvents() {
    return db.prepare("SELECT * FROM events ORDER BY xpReward DESC").all();
  },

  getEvent(id) {
    return db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  },

  participateInEvent(userId = "u-default", eventId) {
    const event = this.getEvent(eventId);
    if (!event) throw new Error("Événement introuvable");

    const partId = `part-${Date.now()}`;
    db.prepare(`
      INSERT INTO participations (id, userId, eventId, eventTitle, xpEarned, dinarsEarned)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(partId, userId, event.id, event.title, event.xpReward, event.dinarsReward);

    db.prepare("UPDATE users SET xp = xp + ?, dinarsJar = dinarsJar + ? WHERE id = ?").run(
      event.xpReward,
      event.dinarsReward,
      userId
    );

    db.prepare("UPDATE events SET participantsCount = participantsCount + 1 WHERE id = ?").run(eventId);

    db.prepare(`
      INSERT INTO wallet_transactions (id, userId, type, amount, gateway, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `tx-${Date.now()}`,
      userId,
      "mission_reward",
      event.dinarsReward,
      "System",
      `Récompense mission : ${event.title}`
    );

    return {
      participation: { id: partId, eventId, eventTitle: event.title },
      user: this.getUser(userId)
    };
  },

  getWallet(userId = "u-default") {
    const user = this.getUser(userId);
    const transactions = db.prepare("SELECT * FROM wallet_transactions WHERE userId = ? ORDER BY createdAt DESC").all(userId);
    return {
      balance: user ? user.dinarsJar : 0,
      xp: user ? user.xp : 0,
      transactions
    };
  },

  addWalletTransaction({ userId = "u-default", type, amount, gateway, note }) {
    const user = this.getUser(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) throw new Error("Montant invalide");

    if (type === "retrait") {
      if (user.dinarsJar < numAmount) {
        throw new Error("Solde insuffisant dans votre Tip Jar pour ce retrait");
      }
      db.prepare("UPDATE users SET dinarsJar = dinarsJar - ? WHERE id = ?").run(numAmount, userId);
    } else {
      db.prepare("UPDATE users SET dinarsJar = dinarsJar + ?, xp = xp + 10 WHERE id = ?").run(numAmount, userId);
    }

    const txId = `tx-${Date.now()}`;
    db.prepare(`
      INSERT INTO wallet_transactions (id, userId, type, amount, gateway, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(txId, userId, type, numAmount, gateway, note || `${type === "retrait" ? "Retrait vers" : "Recharge via"} ${gateway}`);

    return {
      transaction: db.prepare("SELECT * FROM wallet_transactions WHERE id = ?").get(txId),
      user: this.getUser(userId)
    };
  },

  getOffers(typeFilter = "all") {
    if (typeFilter && typeFilter !== "all") {
      return db.prepare("SELECT * FROM offers WHERE type = ? ORDER BY createdAt DESC").all(typeFilter);
    }
    return db.prepare("SELECT * FROM offers ORDER BY createdAt DESC").all();
  },

  addOffer({ company, type, skill, desc = "", location = "Hammamet", stipend = "Selon profil" }) {
    const id = `off-${Date.now()}`;
    db.prepare(`
      INSERT INTO offers (id, company, type, skill, desc, location, stipend)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, company, type, skill, desc, location, stipend);
    return db.prepare("SELECT * FROM offers WHERE id = ?").get(id);
  },

  applyToOffer({ offerId, userId = "u-default" }) {
    const offer = db.prepare("SELECT * FROM offers WHERE id = ?").get(offerId);
    const user = this.getUser(userId);
    if (!offer) throw new Error("Offre introuvable");
    if (!user) throw new Error("Candidat introuvable");

    const appId = `app-${Date.now()}`;
    db.prepare(`
      INSERT INTO applications (id, offerId, offerTitle, company, userId, candidateName, candidateAvatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(appId, offer.id, `${offer.type} : ${offer.skill}`, offer.company, user.id, user.name, user.avatar);

    return db.prepare("SELECT * FROM applications WHERE id = ?").get(appId);
  },

  getCandidates(roleFilter = "all", search = "") {
    let query = "SELECT * FROM users WHERE isTargeted = 1";
    const params = [];

    if (roleFilter && roleFilter !== "all") {
      query += " AND role = ?";
      params.push(roleFilter);
    }

    if (search && search.trim()) {
      query += " AND (name LIKE ? OR avatar LIKE ? OR school LIKE ?)";
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += " ORDER BY xp DESC";
    return db.prepare(query).all(...params);
  },

  targetCandidate({ candidateId, companyName, offerType, message }) {
    const candidate = this.getUser(candidateId);
    if (!candidate) throw new Error("Candidat introuvable");

    const appId = `prop-${Date.now()}`;
    db.prepare(`
      INSERT INTO applications (id, offerId, offerTitle, company, userId, candidateName, candidateAvatar, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(appId, "direct-target", `${offerType} proposé`, companyName, candidate.id, candidate.name, candidate.avatar, "offered_by_company");

    return {
      success: true,
      proposalId: appId,
      proposal: { id: appId, status: 'offered_by_company' },
      message: `Proposition transmise avec succès à ${candidate.name}`,
      candidate
    };
  },

  recordCookieConsent(userId = "guest", sessionRef = "") {
    const id = `cookie-${Date.now()}`;
    db.prepare(`
      INSERT INTO cookie_consents (id, userId, sessionRef)
      VALUES (?, ?, ?)
    `).run(id, userId, sessionRef);
    return { id, success: true };
  },

  getVerification(candidateId = "u-default") {
    const candidate = this.getUser(candidateId);
    if (!candidate) return null;
    const projects = this.getProjects(candidateId);
    const reviews = this.getReviews(candidateId);
    const wallet = this.getWallet(candidateId);
    const payload = `PASSE-IMPACT:${candidate.id}:${candidate.email}:${candidate.xp}:${candidate.dinarsJar}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    const timestamp = new Date().toISOString();
    return {
      verified: true,
      seal: '✓ PASSE IMPACT OFFICIELLEMENT CERTIFIÉ • RÉPUBLIQUE TUNISIENNE',
      candidate,
      user: candidate,
      projects,
      reviews,
      wallet,
      hash,
      verificationHash: hash,
      issuedAt: timestamp,
      timestamp
    };
  },

  getInbox(userId = "u-default") {
    return db.prepare("SELECT * FROM applications WHERE userId = ? ORDER BY createdAt DESC").all(userId);
  },

  respondToProposal(proposalId, status = 'accepted') {
    const prop = db.prepare("SELECT * FROM applications WHERE id = ?").get(proposalId);
    if (!prop) throw new Error("Proposition introuvable");
    db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, proposalId);
    if (status === 'accepted') {
      db.prepare("UPDATE users SET xp = xp + 20 WHERE id = ?").run(prop.userId);
    }
    return {
      success: true,
      proposal: db.prepare("SELECT * FROM applications WHERE id = ?").get(proposalId),
      user: this.getUser(prop.userId)
    };
  },

  createEvent({ title, category, badge, xpReward, dinarsReward, location, desc, date }) {
    const id = `ev-${Date.now()}`;
    const numXp = parseInt(xpReward, 10) || 30;
    const numDinars = parseFloat(dinarsReward) || 5.0;
    db.prepare(`
      INSERT INTO events (id, title, category, badge, xpReward, dinarsReward, location, desc, date, participantsCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      id,
      title,
      category || 'Hackathon Hammamet',
      badge || 'Partenaire',
      numXp,
      numDinars,
      location || 'Hammamet',
      desc || 'Défi d\'innovation ouvert.',
      date || 'Session à venir'
    );
    return db.prepare("SELECT * FROM events WHERE id = ?").get(id);
  }
};

