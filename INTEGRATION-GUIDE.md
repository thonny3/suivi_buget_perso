# Guide d'intégration API - Inscription

## Problèmes résolus ✅

1. **Erreur `ReferenceError: register is not defined`** - Corrigée en ajoutant l'import `authService`
2. **Erreur 409 (Conflict) - Email déjà utilisé** - Amélioration de la gestion d'erreur avec messages conviviaux
3. **Gestion d'erreur insuffisante** - Ajout de messages d'erreur spécifiques pour chaque type d'erreur

## Modifications apportées

### 1. Page d'inscription (`src/app/[locale]/register/page.jsx`)
- ✅ Ajout de l'import `authService`
- ✅ Remplacement de `register(userData)` par `authService.register(userData)`
- ✅ Correction de la logique de gestion des réponses (le backend retourne `message` au lieu de `success`)
- ✅ Amélioration de la gestion d'erreur avec messages spécifiques
- ✅ Ajout d'un bouton "Se connecter" pour les emails déjà utilisés

### 2. Service d'authentification (`src/services/authService.js`)
- ✅ Correction des endpoints pour correspondre au backend :
  - `/auth/register` → `/users/register`
  - `/auth/login` → `/users/login`
  - `/auth/verify` → `/users/verify`

### 3. Service API générique (`src/services/apiService.js`)
- ✅ Mise à jour des endpoints pour utiliser les chemins corrects

### 4. Page d'inscription simple (`src/app/register/page.jsx`)
- ✅ Amélioration de la gestion d'erreur avec messages spécifiques
- ✅ Utilisation de toast pour les notifications d'erreur

## Configuration du backend

Le backend est configuré pour écouter sur `http://localhost:3001` avec les routes suivantes :
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/verify` - Vérification du token

## Test de l'intégration

### 1. Démarrer le backend
```bash
cd perso_buget/backend
npm run dev
```

### 2. Démarrer le frontend
```bash
cd suivi_buget_perso
npm run dev
```

### 3. Tester l'API (optionnel)
```bash
# Test basique
node test-register-api.js

# Test des scénarios d'erreur
node test-error-scenarios.js
```

## Structure des données

### Données d'inscription envoyées :
```javascript
{
  nom: "Nom de famille",
  prenom: "Prénom",
  email: "email@example.com",
  password: "motdepasse",
  currency: "EUR" // ou "USD", "MGA", etc.
}
```

### Réponse du backend (succès) :
```javascript
{
  message: "Compte créé avec succès",
  user: {
    id_user: 123,
    nom: "Nom de famille",
    prenom: "Prénom",
    email: "email@example.com",
    devise: "EUR"
  }
}
```

### Réponse du backend (erreur) :
```javascript
{
  error: "Message d'erreur",
  message: "Description détaillée"
}
```

## Gestion des erreurs côté frontend

### Messages d'erreur spécifiques :
- **Email déjà utilisé** : "Un compte avec cet email existe déjà. Veuillez utiliser un autre email ou vous connecter."
- **Email invalide** : "Veuillez entrer une adresse email valide."
- **Mot de passe trop court** : "Le mot de passe doit contenir au moins 6 caractères."
- **Champs manquants** : "Veuillez remplir tous les champs obligatoires."

### Fonctionnalités ajoutées :
- ✅ Messages d'erreur conviviaux et spécifiques
- ✅ Bouton "Se connecter" pour les emails déjà utilisés
- ✅ Gestion d'erreur identique sur les deux pages d'inscription
- ✅ Tests automatisés pour différents scénarios d'erreur

## Pages d'inscription disponibles

1. **Page localisée** : `/[locale]/register` (avec support multilingue)
2. **Page simple** : `/register` (version basique)

Les deux pages utilisent maintenant le même service d'authentification et sont entièrement intégrées avec l'API backend.

## Prochaines étapes

1. Tester l'inscription via l'interface utilisateur
2. Vérifier que la redirection vers la page de connexion fonctionne
3. Tester la connexion avec les comptes créés
4. Implémenter la gestion des erreurs côté frontend si nécessaire
