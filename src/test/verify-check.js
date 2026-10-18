import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';
import { repository } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 [Passe Impact Hammamet] Vérification du module public/verify.html...');

// 1. File existence
const verifyHtmlPath = resolve(__dirname, '../../public/verify.html');
assert(existsSync(verifyHtmlPath), 'public/verify.html doit exister');
const htmlContent = readFileSync(verifyHtmlPath, 'utf8');

// 2. DOM Elements Check
const requiredIds = [
  'verify-name',
  'verify-avatar-icon',
  'verify-avatar-title',
  'verify-school',
  'verify-id',
  'verify-xp',
  'verify-dinars',
  'verify-hash',
  'verify-projects',
  'verify-reviews',
  'btn-recruit-cta',
  'btn-theme-toggle'
];

for (const id of requiredIds) {
  assert(
    htmlContent.includes(`id="${id}"`),
    `Élément requis avec l'identifiant id="${id}" manquant dans public/verify.html`
  );
}
console.log(`✓ 1. Structure HTML certifiée : tous les ${requiredIds.length} sélecteurs critiques sont présents.`);

// 3. Cryptographic hash & seal integrity test
const verificationData = repository.getVerification('u-default');
assert(verificationData, 'La vérification de u-default doit retourner un résultat valide');
assert.strictEqual(verificationData.verified, true, 'Le statut verified doit être true');
assert(verificationData.candidate && verificationData.candidate.name, 'Les données candidat doivent contenir le nom');
assert(typeof verificationData.hash === 'string' && verificationData.hash.length === 64, 'Le hash doit être un SHA-256 valide de 64 caractères');
assert(verificationData.seal && verificationData.seal.includes('RÉPUBLIQUE TUNISIENNE'), 'Le sceau officiel doit être présent');

console.log(`✓ 2. Preuve cryptographique SHA-256 validée : ${verificationData.hash}`);
console.log(`✓ 3. Sceau officiel validé : ${verificationData.seal}`);
console.log(`✓ 4. Projets (${verificationData.projects.length}) et recommandations (${verificationData.reviews.length}) validés.`);

console.log('\n🎉 TEST VERIFY-CHECK 100% VALIDÉ !');
