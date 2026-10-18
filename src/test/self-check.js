import assert from 'node:assert/strict';
import { initDatabase, repository, db } from '../server/db.js';

console.log('🧪 [Ponytail Self-Check] Démarrage des vérifications automatiques...');

// 1. Database Initialization
initDatabase();
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(t => t.name);
assert(tables.includes('users'), 'Table users doit exister');
assert(tables.includes('projects'), 'Table projects doit exister');
assert(tables.includes('reviews'), 'Table reviews doit exister');
assert(tables.includes('events'), 'Table events doit exister');
assert(tables.includes('wallet_transactions'), 'Table wallet_transactions doit exister');
assert(tables.includes('offers'), 'Table offers doit exister');
console.log('✓ 1. Base de données SQLite native vérifiée et tables initialisées.');

// 2. Default User Check
const user = repository.getUser('u-default');
assert(user !== null, 'Utilisateur par défaut doit exister');
assert.equal(user.name, 'Youssef Mansour');
assert(user.xp >= 35, 'XP initial valide');
assert(user.dinarsJar >= 2.000, 'Cagnotte initiale valide');
console.log(`✓ 2. Profil utilisateur vérifié : ${user.name} (${user.xp} XP, ${user.dinarsJar.toFixed(3)} DT).`);

// 3. Project Addition & XP Reward (+15 XP)
const initialXP = user.xp;
const newProject = repository.addProject({
  userId: 'u-default',
  title: 'Test Integration Hammamet App',
  url: 'https://test.hubact.tn',
  desc: 'Projet de test pour validation automatisée du pipeline',
  tags: 'Node.js, SQLite, Test'
});
assert.equal(newProject.title, 'Test Integration Hammamet App');
const userAfterProj = repository.getUser('u-default');
assert.equal(userAfterProj.xp, initialXP + 15, 'L\'ajout de projet doit rapporter exactement +15 XP');
console.log('✓ 3. Ajout de projet et attribution dynamique des points XP (+15 XP) validés.');

// 4. Review Addition (+10 XP)
const newReview = repository.addReview({
  userId: 'u-default',
  author: 'Directeur JCI Test',
  role: 'Partenaire Civique',
  comment: 'Code test impeccable et minimal.',
  rating: 5
});
assert.equal(newReview.author, 'Directeur JCI Test');
const userAfterRev = repository.getUser('u-default');
assert.equal(userAfterRev.xp, initialXP + 15 + 10, 'L\'avis doit rapporter +10 XP');
console.log('✓ 4. Recommandation des pairs et attribution dynamique (+10 XP) validées.');

// 5. Events & Participation Rewards
const events = repository.getEvents();
assert(events.length > 0, 'Il doit y avoir des hackathons enregistrés');
const targetEvent = events[0];
const balanceBeforeEvent = userAfterRev.dinarsJar;
const xpBeforeEvent = userAfterRev.xp;

const partResult = repository.participateInEvent('u-default', targetEvent.id);
assert.equal(partResult.user.xp, xpBeforeEvent + targetEvent.xpReward, 'XP de l\'événement correctement crédité');
assert.equal(
  Math.round(partResult.user.dinarsJar * 1000),
  Math.round((balanceBeforeEvent + targetEvent.dinarsReward) * 1000),
  'Dinars de l\'événement correctement crédités dans le Tip Jar'
);
console.log(`✓ 5. Participation au Hackathon '${targetEvent.title}' validée (+${targetEvent.xpReward} XP, +${targetEvent.dinarsReward.toFixed(3)} DT).`);

// 6. Wallet Transactions & Balance Safety
const walletBefore = repository.getWallet('u-default');
const rechargeResult = repository.addWalletTransaction({
  userId: 'u-default',
  type: 'recharge',
  amount: 10,
  gateway: 'Flouci',
  note: 'Recharge test'
});
assert.equal(rechargeResult.user.dinarsJar, walletBefore.balance + 10, 'Recharge correctement créditée');

// Withdrawal test
const retraitResult = repository.addWalletTransaction({
  userId: 'u-default',
  type: 'retrait',
  amount: 5,
  gateway: 'D17',
  note: 'Retrait test'
});
assert.equal(retraitResult.user.dinarsJar, walletBefore.balance + 10 - 5, 'Retrait correctement débité');

// Insufficient funds guard
assert.throws(() => {
  repository.addWalletTransaction({
    userId: 'u-default',
    type: 'retrait',
    amount: 999999,
    gateway: 'Flouci'
  });
}, /Solde insuffisant/, 'Le retrait au-delà du solde doit être rejeté');
console.log('✓ 6. Passerelles de paiement (Flouci, D17) et sécurité du Tip Jar validées.');

// 7. Offers & Candidate Application Flow
const offers = repository.getOffers();
assert(offers.length > 0, 'Il doit y avoir des offres disponibles');
const appResult = repository.applyToOffer({ offerId: offers[0].id, userId: 'u-default' });
assert.equal(appResult.offerId, offers[0].id);
assert.equal(appResult.candidateName, 'Youssef Mansour');

// Direct Recruiter Targeting
const targetRes = repository.targetCandidate({
  candidateId: 'u-sarra',
  companyName: 'Radisson Blu Hammamet',
  offerType: 'Stage PFE',
  message: 'Votre profil IA nous intéresse.'
});
assert.equal(targetRes.candidate.name, 'Sarra Trabelsi');
console.log('✓ 7. Système de ciblage employeurs et dépôt de candidatures validé.');

// 8. Cookie Policy Check
const consent = repository.recordCookieConsent('u-default', 'sess-test-42');
assert.equal(consent.success, true);
console.log('✓ 8. Registre des cookies de session essentiels validé.');

// 9. Inbox & Recruiter Proposal Response (+20 XP)
const inboxItems = repository.getInbox('u-default');
assert(Array.isArray(inboxItems), 'L\'inbox doit retourner un tableau');
assert(inboxItems.length > 0, 'L\'inbox par défaut doit contenir au moins une proposition');
const pendingProp = inboxItems[0];
const xpBeforeProposal = repository.getUser('u-default').xp;
const respondRes = repository.respondToProposal(pendingProp.id, 'accepted');
assert.equal(respondRes.success, true);
assert.equal(respondRes.proposal.status, 'accepted');
assert.equal(respondRes.user.xp, xpBeforeProposal + 20, 'L\'acceptation d\'une proposition doit attribuer +20 XP');
console.log('✓ 9. Boîte de réception recruteurs et acceptation d\'offre (+20 XP) validées.');

// 10. Partner Hackathon Creation with Dinars & XP Pool
const createdEvent = repository.createEvent({
  title: 'Hackathon Smart Medina Challenge 2026',
  category: 'Smart Medina',
  badge: 'Défi Partenaire',
  xpReward: 60,
  dinarsReward: 25.0,
  location: 'Médina d\'Hammamet',
  desc: 'Défi pour la numérisation des parcours touristiques',
  date: '20 Novembre 2026'
});
assert(createdEvent.id.startsWith('ev-'));
assert.equal(createdEvent.title, 'Hackathon Smart Medina Challenge 2026');
assert.equal(createdEvent.dinarsReward, 25.0);
assert.equal(createdEvent.xpReward, 60);
console.log('✓ 10. Portail créateur de Hackathons partenaires (+Dotation & XP) validé.');

console.log('\n🎉 TOUS LES TESTS DU SELF-CHECK ONT RÉUSSI AVEC SUCCÈS ! (100% de passage)');
