# Passe Impact Hammamet | باس أثر الحمامات

Plateforme fullstack d'employabilité ciblée et d'engagement civique pour la jeunesse et les entreprises de la région côtière de Hammamet & Nabeul (Tunisie).

Conçue avec la philosophie **Ponytail** (minimalisme senior pragmatique, standard libraries sans surcoût) et les standards **Impeccable** (direction artistique méditerranéenne authentique, 0 anti-pattern).

---

## 🌊 Fonctionnalités Clés

1. **Carte ID Numérique 3D Flippable :**
   - *Recto :* Avatar professionnel, score XP, solde de la cagnotte Tip Jar en Dinars Tunisiens (DT), statut *"Ciblé par les Entreprises"*.
   - *Verso :* Extraction certifiée de l'ancien CV, diplôme et hash cryptographique.
2. **Cagnotte Tip Jar & Inclusion Financière Tunisienne :**
   - Prime de bienvenue de **2 DT** offerte dès la validation du pass.
   - Simulation et intégration des passerelles locales : **Flouci Wallet**, **D17 / La Poste Tunisienne**, **Konnect**, et **Sobflous**.
3. **Hackathons & Défis Pratiques à Hammamet :**
   - Défis réels tenus dans des lieux emblématiques (Dar Sebastian, Marina Yasmine, Fort de Hammamet, HUBACT Lab) avec rémunération directe en Dinars.
4. **Portail Recruteurs & Entreprises :**
   - Annuaire dynamique des talents (Étudiants PFE, Travailleurs Juniors, Freelancers qualifiés) avec filtrage et recherche instantanée.
   - Dépôt d'offres de stages et proposition de missions en 1 clic.
5. **Visite Guidée Interactive & Politique Cookie Stricte :**
   - Visite explicative pas à pas en 4 étapes.
   - Respect strict de la minimisation des données : cookies uniquement dédiés au pass, nom et email.

---

## 🛠️ Architecture & Stack Technique

- **Backend :** Node.js 24 avec base de données SQLite native (`node:sqlite` via `DatabaseSync`), serveur Express RESTful.
- **Frontend :** HTML5 / CSS3 / JavaScript ES6+ moderne, Tailwind CSS, typographie Lexend & Noto Sans Arabic, animations et micro-interactions 3D fluides.
- **Tests :** Suite d'assertions automatisée Ponytail vérifiant 100% des cas d'usage et le câblage de tous les formulaires.

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Exécution des tests d'assertion
```bash
npm test
```

### 3. Lancement de l'application
```bash
npm start
```
L'application est disponible sur : **http://localhost:3000**

---

## ☁️ Déploiement

### Déploiement sur Render
Le fichier `render.yaml` est configuré à la racine :
1. Créez un nouveau **Web Service** sur [Render](https://render.com).
2. Connectez ce dépôt Git.
3. Render détecte automatiquement `render.yaml` et démarre avec `npm start`.

### Déploiement sur Vercel
Le fichier `vercel.json` et le point d'entrée serverless `api/index.js` sont prêts :
1. Importez le projet sur [Vercel](https://vercel.com).
2. Les routes `/api/*` sont automatiquement mappées sur la fonction serverless Node.js, et la base de données bascule automatiquement sur `/tmp` pour garantir la compatibilité en environnement serverless lecture seule.
3. Les fichiers du dossier `public/` sont servis directement sur le CDN Edge.
