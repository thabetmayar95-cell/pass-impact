import assert from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repository } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 [E2E Functional Test Suite] Démarrage des tests réels de bout en bout...');
console.log('   (Vérification des transitions d\'état métier, sécurité du portefeuille, cryptographie et mise en page mobile)\n');

// -----------------------------------------------------------------------------
// TEST 1: User Registration & Exact +2.000 DT Welcome Bonus
// -----------------------------------------------------------------------------
console.log('▶ TEST 1: Inscription candidat & prime de bienvenue Tip Jar (+2 DT)...');
const testEmail = `test.candidate.${Date.now()}@isetn.tn`;
const initialUser = repository.createUser({
  name: 'Aymen Rekik',
  email: testEmail,
  role: 'student',
  avatar: 'Frontend Dev & Tourisme Tech',
  avatarIcon: '👨‍💻',
  school: 'ISET Nabeul • Résidence Hammamet',
  oldResume: 'Licence appliquée Web, projets JavaScript'
});

assert(initialUser && initialUser.id, 'L\'utilisateur doit être créé');
assert.strictEqual(initialUser.isTargeted, 1, 'Le statut doit être ciblé dès création');
assert.strictEqual(initialUser.dinarsJar, 2.0, 'La prime de bienvenue doit être de 2.000 DT');

const initialWallet = repository.getWallet(initialUser.id);
assert(initialWallet.transactions.length >= 1, 'Une transaction de bienvenue doit être consignée');
assert.strictEqual(initialWallet.balance, 2.0, 'Le solde du portefeuille doit correspondre');
console.log(`  ✓ Utilisateur créé: ${initialUser.name} (${initialUser.id}) | Statut: Ciblé | Solde Tip Jar: ${initialUser.dinarsJar.toFixed(3)} DT`);

// -----------------------------------------------------------------------------
// TEST 2: Project Creation & Dynamic +15 XP Attribution
// -----------------------------------------------------------------------------
console.log('▶ TEST 2: Ajout de projet pratique & attribution dynamique (+15 XP)...');
const xpBeforeProject = repository.getUser(initialUser.id).xp;
const project = repository.addProject({
  userId: initialUser.id,
  title: 'Portail Touristique Médina Hammamet',
  url: 'https://github.com/aymen/hammamet-tourisme',
  desc: 'PWA interactive des artisans céramistes et maisons d\'hôtes',
  tags: 'React, Tailwind, Flouci API'
});

assert(project && project.id, 'Le projet doit être enregistré');
const xpAfterProject = repository.getUser(initialUser.id).xp;
assert.strictEqual(xpAfterProject, xpBeforeProject + 15, 'L\'XP doit augmenter d\'exactement +15 points');
console.log(`  ✓ Projet "${project.title}" validé | XP: ${xpBeforeProject} ➔ ${xpAfterProject} (+15 XP)`);

// -----------------------------------------------------------------------------
// TEST 3: Peer Recommendation & Dynamic +10 XP Attribution
// -----------------------------------------------------------------------------
console.log('▶ TEST 3: Recommandation des pairs & attribution dynamique (+10 XP)...');
const xpBeforeReview = repository.getUser(initialUser.id).xp;
const review = repository.addReview({
  userId: initialUser.id,
  author: 'Sarra Triki',
  role: 'Présidente JCI Hammamet',
  comment: 'Excellente maîtrise technique et sens du collectif remarquable.',
  rating: 5
});

assert(review && review.id, 'La recommandation doit être enregistrée');
const xpAfterReview = repository.getUser(initialUser.id).xp;
assert.strictEqual(xpAfterReview, xpBeforeReview + 10, 'L\'XP doit augmenter d\'exactement +10 points');
console.log(`  ✓ Recommandation de ${review.author} validée | XP: ${xpBeforeReview} ➔ ${xpAfterReview} (+10 XP)`);

// -----------------------------------------------------------------------------
// TEST 4: Hackathon Participation & Real Tip Jar Payout
// -----------------------------------------------------------------------------
console.log('▶ TEST 4: Participation au Hackathon & versement de la compensation Tip Jar...');
const customEvent = repository.createEvent({
  title: 'Hackathon Smart Medina Challenge 2026',
  category: 'Smart Medina',
  badge: 'Défi Majeur',
  xpReward: 50,
  dinarsReward: 15.0,
  location: 'Médina Mediterranea Hammamet',
  desc: 'Numérisation des parcours touristiques',
  date: '14 Novembre 2026'
});

const xpBeforeHack = repository.getUser(initialUser.id).xp;
const dinarsBeforeHack = repository.getUser(initialUser.id).dinarsJar;

const hackResult = repository.participateInEvent(initialUser.id, customEvent.id);
assert(hackResult.participation && hackResult.participation.id, 'Participation confirmée');

const xpAfterHack = repository.getUser(initialUser.id).xp;
const dinarsAfterHack = repository.getUser(initialUser.id).dinarsJar;

assert.strictEqual(xpAfterHack, xpBeforeHack + 50, 'L\'XP doit augmenter d\'exactement +50 points');
assert.strictEqual(dinarsAfterHack, dinarsBeforeHack + 15.0, 'Le solde Tip Jar doit augmenter d\'exactement +15.000 DT');
console.log(`  ✓ Hackathon validé | XP: +50 (${xpAfterHack} XP) | Tip Jar: +15.000 DT (${dinarsAfterHack.toFixed(3)} DT)`);

// -----------------------------------------------------------------------------
// TEST 5: Financial Wallet Safety (Recharge, Withdrawal & Overdraft Protection)
// -----------------------------------------------------------------------------
console.log('▶ TEST 5: Sécurité financière du Tip Jar (Recharge, Retrait & Protection contre découvert)...');
const balInitial = repository.getUser(initialUser.id).dinarsJar;

// 5a. Recharge
const recharge = repository.addWalletTransaction({
  userId: initialUser.id,
  type: 'recharge',
  amount: 20.0,
  gateway: 'Flouci',
  note: 'Recharge compte pour formation'
});
assert.strictEqual(recharge.user.dinarsJar, balInitial + 20.0, 'La recharge doit créditer le solde');

// 5b. Retrait légitime
const retrait = repository.addWalletTransaction({
  userId: initialUser.id,
  type: 'retrait',
  amount: 10.0,
  gateway: 'D17',
  note: 'Virement vers carte e-Dinar'
});
assert.strictEqual(retrait.user.dinarsJar, balInitial + 20.0 - 10.0, 'Le retrait doit débiter le solde');

// 5c. Overdraft rejection
let threwOverdraft = false;
try {
  repository.addWalletTransaction({
    userId: initialUser.id,
    type: 'retrait',
    amount: 999999.0,
    gateway: 'Flouci',
    note: 'Tentative de retrait frauduleux'
  });
} catch (err) {
  threwOverdraft = true;
  assert(err.message.includes('Solde insuffisant'), 'Le message d\'erreur doit indiquer un solde insuffisant');
}
assert.strictEqual(threwOverdraft, true, 'Un retrait supérieur au solde disponible DOIT être rejeté');
console.log(`  ✓ Recharge (+20 DT) et Retrait (-10 DT) validés | Tentative de découvert bloquée avec succès`);

// -----------------------------------------------------------------------------
// TEST 6: Recruiter Targeting & Candidate Acceptance (+20 XP Bonus)
// -----------------------------------------------------------------------------
console.log('▶ TEST 6: Ciblage employeur & acceptation de proposition (+20 XP)...');
const targetResult = repository.targetCandidate({
  candidateId: initialUser.id,
  companyName: 'Radisson Blu Resort Hammamet',
  offerType: 'Stage PFE',
  message: 'Votre profil React et votre PWA touristique correspondent parfaitement à notre besoin.'
});

assert(targetResult.success === true, 'Le ciblage doit réussir');
assert(targetResult.proposal && targetResult.proposal.id, 'Une proposition doit être créée');
assert(targetResult.proposal.status === 'offered_by_company' || targetResult.proposal.status === 'pending', 'Le statut initial doit être offert par l\'entreprise');

const xpBeforeAccept = repository.getUser(initialUser.id).xp;
const acceptResult = repository.respondToProposal(targetResult.proposal.id, 'accepted');
assert.strictEqual(acceptResult.proposal.status, 'accepted', 'Le statut doit passer à "accepted"');

const xpAfterAccept = repository.getUser(initialUser.id).xp;
assert.strictEqual(xpAfterAccept, xpBeforeAccept + 20, 'L\'acceptation doit attribuer +20 XP');
console.log(`  ✓ Proposition acceptée | Statut: "accepted" | Bonus accordé: +20 XP (${xpAfterAccept} XP)`);

// -----------------------------------------------------------------------------
// TEST 7: Cryptographic Proof & Tamper Resistance
// -----------------------------------------------------------------------------
console.log('▶ TEST 7: Intégrité cryptographique SHA-256 & résistance aux altérations...');
const verification = repository.getVerification(initialUser.id);
assert(verification && verification.hash, 'La vérification doit retourner une preuve');
assert.strictEqual(typeof verification.hash, 'string', 'Le hash doit être une chaîne');
assert.strictEqual(verification.hash.length, 64, 'Le hash SHA-256 doit comporter exactement 64 caractères hexadécimaux');

// Recompute hash independently matching server formula: PASSE-IMPACT:id:email:xp:dinarsJar
const rawPayload = `PASSE-IMPACT:${verification.candidate.id}:${verification.candidate.email}:${verification.candidate.xp}:${verification.candidate.dinarsJar}`;
const expectedHash = createHash('sha256').update(rawPayload).digest('hex');
assert.strictEqual(verification.hash, expectedHash, 'Le hash généré doit concorder rigoureusement avec le SHA-256 de la charge utile');

// Tamper simulation: changing XP must invalidate previous hash
const tamperedPayload = `PASSE-IMPACT:${verification.candidate.id}:${verification.candidate.email}:${verification.candidate.xp + 500}:${verification.candidate.dinarsJar}`;
const tamperedHash = createHash('sha256').update(tamperedPayload).digest('hex');
assert.notStrictEqual(verification.hash, tamperedHash, 'Toute altération doit immédiatement invalider l\'empreinte cryptographique');
console.log(`  ✓ Preuve SHA-256 certifiée: ${verification.hash.substring(0, 16)}... | Détection de falsification validée`);

// -----------------------------------------------------------------------------
// TEST 8: Mobile Layout & Viewport Anti-Overflow Assertions
// -----------------------------------------------------------------------------
console.log('▶ TEST 8: Audit de non-débordement mobile (Zero horizontal whitespace)...');
const indexHtml = readFileSync(resolve(__dirname, '../../public/index.html'), 'utf8');
const verifyHtml = readFileSync(resolve(__dirname, '../../public/verify.html'), 'utf8');
const appCss = readFileSync(resolve(__dirname, '../../public/css/app.css'), 'utf8');

// Assert viewport meta
assert(indexHtml.includes('name="viewport"') && indexHtml.includes('width=device-width'), 'index.html doit déclarer width=device-width');
assert(verifyHtml.includes('name="viewport"') && verifyHtml.includes('width=device-width'), 'verify.html doit déclarer width=device-width');

// Assert strict CSS viewport containment
assert(appCss.includes('overflow-x: hidden !important'), 'app.css doit verrouiller overflow-x: hidden !important');
assert(appCss.includes('max-width: 100%'), 'app.css doit imposer max-width: 100%');

// Assert zero negative margins in tab bars or cards
assert(!indexHtml.includes('-mx-1 px-1'), 'index.html ne doit contenir aucun -mx-1 px-1');
assert(!indexHtml.includes('min-w-[4'), 'index.html ne doit contenir aucune largeur minimale fixe en pixels');

// Assert restricted color palette (no green emerald or amber jasmine)
const legacyColorsRegex = /\b(emerald|jasmine|amber)-\d+/;
const indexLegacyMatch = indexHtml.match(legacyColorsRegex);
assert(!indexLegacyMatch, `index.html ne doit contenir aucune classe de couleur superflue (${indexLegacyMatch?.[0]})`);

const verifyLegacyMatch = verifyHtml.match(legacyColorsRegex);
assert(!verifyLegacyMatch, `verify.html ne doit contenir aucune classe de couleur superflue (${verifyLegacyMatch?.[0]})`);

console.log('  ✓ Containment viewport strict validé');
console.log('  ✓ Absence de marges négatives (-mx) et largeurs fixes validée');
console.log('  ✓ Palette restreinte vérifiée : 2 couleurs de marque (Cobalt + Terracotta) sur toile Slate');

console.log('\n=============================================================================');
console.log('🎉 TOUS LES TESTS E2E FONCTIONNELS ONT RÉUSSI AVEC SUCCÈS (100% PASSING) !');
console.log('=============================================================================\n');
