# 7 Ensemble – V6.1

## Lancer le projet

```bash
cd 7ensemble
npm install
npm run dev
```

→ `http://localhost:5173`

## Corrections V6.1

### FIX 1 — Bug formulaire (critique)
Les composants `Field` et `Sel` étaient définis **à l'intérieur** du composant parent.
React les recréait à chaque re-render → perte de focus après 1 caractère.
**Correction** : `FormInput` et `FormSelect` extraits en composants stables HORS du parent.

### FIX 2 — Flux direct
"Rejoindre la révolution" → formulaire d'inscription directement. Aucun écran intermédiaire connexion/choix.

### FIX 3 — Alcyone obligatoire
Le champ "Mon Alcyone" est maintenant **requis** (validation + message d'erreur).
Pour le seed (1er compte), utiliser `MERCI_L_UNIVERS` comme Alcyone.

### FIX 4 — Badge 21€
"Paiement initial 21€" est un **badge informatif** (non cliquable, `select-none`).
Le seul bouton d'action est "Créer ma constellation" qui déclenche le flux paiement.

### FIX 5 — Modes de paiement Europe V1
Simplifié à : **Carte bancaire (Stripe)**, **PayPal**, **TWINT**.
Tout le reste supprimé.

### FIX 6 — Nouvelle constellation : flux complet
Clic "Nouvelle constellation" →
1. Étape 1/3 : Choix Triangulum / Pléiade
2. Étape 2/3 : Saisie Pseudo + Mot de passe
3. Étape 3/3 : Paiement 21€
→ Dashboard avec la nouvelle constellation active.

## Mode DEMO / Production

Dans `src/data/businessData.js` :
```js
export const DEMO_MODE = false;  // Production (par défaut)
export const DEMO_MODE = true;   // Démo
```

## Structure

```
src/
├── App.jsx
├── context/AppContext.jsx      # État + logique financière
├── data/businessData.js        # Constantes + DEMO_MODE
├── components/
│   ├── RegistrationModal.jsx   # Formulaire (FormInput/FormSelect stables)
│   ├── PaymentScreen.jsx       # Écran paiement 21€
│   ├── TopBar.jsx              # Barre + dropdowns
│   ├── StatCards.jsx           # 4 cartes financières
│   ├── ConstellationVisual.jsx # SVG constellation
│   ├── PaymentCard.jsx         # Bloc "Payer maintenant"
│   ├── MesConstellations.jsx   # Liste + flow création 3 étapes
│   ├── WorldMap.jsx            # Carte mondiale
│   ├── SearchPlaces.jsx        # Recherche places
│   ├── TestimonialModal.jsx    # Formulaire témoignage
│   └── TestimonialCarousel.jsx # Carrousel landing
└── pages/
    ├── LandingPage.jsx
    └── DashboardPage.jsx
```
