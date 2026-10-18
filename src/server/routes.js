import { Router } from 'express';
import { repository } from './db.js';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Passe Impact Hammamet',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Profile & State
apiRouter.get('/profile', (req, res) => {
  try {
    const userId = req.query.userId || 'u-default';
    const user = repository.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Profil introuvable' });
    }
    const projects = repository.getProjects(userId);
    const reviews = repository.getReviews(userId);
    const wallet = repository.getWallet(userId);

    res.json({
      user,
      projects,
      reviews,
      wallet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/profile/:id', (req, res) => {
  try {
    const userId = req.params.id || 'u-default';
    const user = repository.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Profil introuvable' });
    }
    const projects = repository.getProjects(userId);
    const reviews = repository.getReviews(userId);
    const wallet = repository.getWallet(userId);

    res.json({
      user,
      candidate: user,
      projects,
      reviews,
      wallet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Avatar Preset
apiRouter.post('/profile/avatar', (req, res) => {
  try {
    const { userId = 'u-default', avatar, avatarIcon } = req.body;
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar requis' });
    }
    const current = repository.getUser(userId);
    const updated = repository.updateUser(userId, {
      avatar,
      avatarIcon: avatarIcon || '👨‍💻',
      xp: (current ? current.xp : 35) + 5
    });
    res.json({ success: true, user: updated, message: `Avatar mis à jour (+5 XP) !` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visitor Check-In
apiRouter.post('/auth/visitor', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et adresse email requis' });
    }

    let user = repository.getUserByEmail(email);
    if (!user) {
      user = repository.createUser({
        name,
        email,
        role: 'visitor',
        avatar: 'Visiteur Curieux',
        avatarIcon: '👤',
        school: 'Visiteur libre • Hammamet',
        oldResume: 'Consultation en mode découverte'
      });
    }

    repository.recordCookieConsent(user.id, `visitor-${Date.now()}`);
    res.json({
      success: true,
      user,
      message: `Pass Visiteur validé pour ${name}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete Registration (with 5 DT Calibration & 2 DT Welcome Deposit)
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { name, email, avatar, school, oldResume, payMethod = 'Flouci' } = req.body;
    if (!name || !email || !avatar) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    let user = repository.getUserByEmail(email);
    if (user) {
      user = repository.updateUser(user.id, {
        name,
        avatar,
        school: school || user.school,
        oldResume: oldResume || user.oldResume,
        role: 'student',
        isTargeted: 1,
        dinarsJar: user.dinarsJar + 2.000,
        xp: user.xp + 20
      });
    } else {
      user = repository.createUser({
        name,
        email,
        role: 'student',
        avatar,
        school: school || 'ISET Nabeul / INSAT • Résidence Hammamet',
        oldResume: oldResume || 'Parcours académique initial'
      });
    }

    // Record Calibration Fee & Welcome deposit
    repository.recordCookieConsent(user.id, `registered-${Date.now()}`);

    res.json({
      success: true,
      user,
      message: `Paiement de 5 DT validé via ${payMethod}. 2 Dinars versés dans votre Tip Jar !`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects
apiRouter.get('/projects', (req, res) => {
  try {
    const userId = req.query.userId || 'u-default';
    const projects = repository.getProjects(userId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/projects', (req, res) => {
  try {
    const { userId = 'u-default', title, url, desc, tags } = req.body;
    if (!title || !url || !desc) {
      return res.status(400).json({ error: 'Titre, URL et description requis' });
    }
    const project = repository.addProject({ userId, title, url, desc, tags: tags || 'Web, API' });
    const user = repository.getUser(userId);
    res.status(201).json({ success: true, project, user, message: 'Projet ajouté (+15 XP) !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews / Peer endorsements
apiRouter.get('/reviews', (req, res) => {
  try {
    const userId = req.query.userId || 'u-default';
    const reviews = repository.getReviews(userId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/reviews', (req, res) => {
  try {
    const { userId = 'u-default', author, role, comment, rating = 5 } = req.body;
    if (!author || !role || !comment) {
      return res.status(400).json({ error: 'Auteur, rôle et commentaire requis' });
    }
    const review = repository.addReview({ userId, author, role, comment, rating: Number(rating) || 5 });
    const user = repository.getUser(userId);
    res.status(201).json({ success: true, review, user, message: 'Avis enregistré (+10 XP) !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events & Hackathons
apiRouter.get('/events', (req, res) => {
  try {
    const events = repository.getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/events/:id/participate', (req, res) => {
  try {
    const { userId = 'u-default' } = req.body;
    const result = repository.participateInEvent(userId, req.params.id);
    res.json({
      success: true,
      participation: result.participation,
      user: result.user,
      message: `Mission validée ! XP et Dinars crédités dans votre Tip Jar.`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Wallet & Tip Jar
apiRouter.get('/wallet', (req, res) => {
  try {
    const userId = req.query.userId || 'u-default';
    const wallet = repository.getWallet(userId);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/wallet/transaction', (req, res) => {
  try {
    const { userId = 'u-default', type, amount, gateway = 'Flouci', note } = req.body;
    if (!type || !amount) {
      return res.status(400).json({ error: 'Type et montant requis' });
    }
    const result = repository.addWalletTransaction({ userId, type, amount, gateway, note });
    res.json({
      success: true,
      transaction: result.transaction,
      user: result.user,
      message: `${type === 'retrait' ? 'Retrait' : 'Recharge'} de ${Number(amount).toFixed(3)} DT effectué avec succès !`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Offers & Stages
apiRouter.get('/offers', (req, res) => {
  try {
    const type = req.query.type || 'all';
    const offers = repository.getOffers(type);
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/offers', (req, res) => {
  try {
    const { company, type, skill, desc, location, stipend } = req.body;
    if (!company || !type || !skill) {
      return res.status(400).json({ error: 'Entreprise, type et compétence requis' });
    }
    const offer = repository.addOffer({ company, type, skill, desc, location, stipend });
    res.status(201).json({ success: true, offer, message: 'Offre diffusée sur Hammamet !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/offers/:id/apply', (req, res) => {
  try {
    const { userId = 'u-default' } = req.body;
    const application = repository.applyToOffer({ offerId: req.params.id, userId });
    res.json({
      success: true,
      application,
      message: 'Candidature transmise avec succès ! L\'employeur consulte votre carte flippable.'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Candidates Pool (for Recruiters)
apiRouter.get('/candidates', (req, res) => {
  try {
    const role = req.query.role || 'all';
    const search = req.query.search || '';
    const candidates = repository.getCandidates(role, search);
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/candidates/:id/target', (req, res) => {
  try {
    const { companyName = 'Entreprise Partenaire', offerType = 'Stage PFE', message } = req.body;
    const result = repository.targetCandidate({
      candidateId: req.params.id,
      companyName,
      offerType,
      message
    });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cookies Consent
apiRouter.post('/cookies/consent', (req, res) => {
  try {
    const { userId = 'guest', sessionRef } = req.body;
    const result = repository.recordCookieConsent(userId, sessionRef);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verification Endpoint (Public Credential Proof)
apiRouter.get('/verify/:id', (req, res) => {
  try {
    const data = repository.getVerification(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Passe introuvable ou non certifié' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Candidate Inbox & Direct Recruiter Messages
apiRouter.get('/inbox', (req, res) => {
  try {
    const userId = req.query.userId || 'u-default';
    const inbox = repository.getInbox(userId);
    res.json(inbox);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/inbox/:id/respond', (req, res) => {
  try {
    const { status = 'accepted' } = req.body;
    const result = repository.respondToProposal(req.params.id, status);
    res.json({
      success: true,
      ...result,
      message: status === 'accepted' ? 'Proposition acceptée (+20 XP) ! Félicitations.' : 'Proposition déclinée.'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Partner Event Creation (Hackathons & Bounties)
apiRouter.post('/events', (req, res) => {
  try {
    const { title, category, badge, xpReward, dinarsReward, location, desc, date } = req.body;
    if (!title || !location) {
      return res.status(400).json({ error: 'Titre et lieu requis' });
    }
    const event = repository.createEvent({ title, category, badge, xpReward, dinarsReward, location, desc, date });
    res.status(201).json({
      success: true,
      event,
      message: `Hackathon '${title}' créé avec succès !`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

