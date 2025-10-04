# 🚀 Système d'Authentification avec Backend

## 📋 Vue d'ensemble

Ce système implémente une authentification complète avec un backend Node.js/Express et un frontend Next.js, incluant :

- ✅ **Inscription** avec validation backend
- ✅ **Connexion** avec JWT tokens
- ✅ **Protection des routes** automatique
- ✅ **Redirection intelligente** selon l'état de connexion
- ✅ **Support multilingue** (FR/MG/EN)

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Port** : `3001`
- **Base de données** : MySQL
- **Authentification** : JWT + bcrypt
- **Endpoints** :
  - `POST /api/users/register` - Inscription
  - `POST /api/users/login` - Connexion
  - `GET /api/users/verify` - Vérification token

### Frontend (Next.js)
- **Port** : `3000`
- **Authentification** : Context API + localStorage
- **Protection** : Composants ProtectedRoute/RedirectIfAuthenticated
- **Langues** : Routes localisées (`/fr`, `/mg`, `/en`)

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
# Frontend
cd suivi_buget_perso
npm install

# Backend
cd ../perso_buget/backend
npm install
```

### 2. Configuration de la base de données

1. Créer une base de données MySQL
2. Importer le fichier `jalako.sql`
3. Configurer les paramètres dans `perso_buget/backend/config/db.js`

### 3. Démarrage des services

#### Option A : Démarrage complet (recommandé)
```bash
cd suivi_buget_perso
npm run dev:full
```

#### Option B : Démarrage séparé
```bash
# Terminal 1 - Backend
cd perso_buget/backend
npm run dev

# Terminal 2 - Frontend
cd suivi_buget_perso
npm run dev
```

## 🔐 Flux d'Authentification

### 1. Inscription
```
Utilisateur → Formulaire → Backend → Base de données → Redirection vers connexion
```

### 2. Connexion
```
Utilisateur → Formulaire → Backend → JWT Token → Dashboard
```

### 3. Protection des routes
```
Route protégée → Vérification token → Accès autorisé/Redirection
```

## 📱 URLs et Redirections

### URLs Publiques (non connecté)
- `http://localhost:3000/fr` - Accueil français
- `http://localhost:3000/mg` - Accueil malagasy  
- `http://localhost:3000/en` - Accueil anglais
- `http://localhost:3000/fr/connexion` - Connexion
- `http://localhost:3000/fr/register` - Inscription

### URLs Protégées (connecté requis)
- `http://localhost:3000/fr/dashboard` - Tableau de bord
- `http://localhost:3000/fr/dashboard/budget` - Budget
- `http://localhost:3000/fr/dashboard/depenses` - Dépenses
- etc.

### Logique de Redirection

#### Utilisateur NON connecté :
- ✅ Accès : `/`, `/connexion`, `/register`
- ❌ Accès : `/dashboard/*` → Redirection vers `/connexion`

#### Utilisateur connecté :
- ✅ Accès : `/dashboard/*`
- ❌ Accès : `/`, `/connexion`, `/register` → Redirection vers `/dashboard`

## 🛠️ Composants de Protection

### `ProtectedRoute`
```jsx
<ProtectedRoute locale={locale}>
  <DashboardContent />
</ProtectedRoute>
```
- Vérifie l'authentification
- Redirige vers `/connexion` si non connecté

### `RedirectIfAuthenticated`
```jsx
<RedirectIfAuthenticated locale={locale}>
  <LoginForm />
</RedirectIfAuthenticated>
```
- Redirige vers `/dashboard` si déjà connecté
- Utilisé sur les pages de connexion/inscription

## 🔧 Configuration API

### Variables d'environnement
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Configuration dans `src/config/api.js`
```javascript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    USERS: {
      REGISTER: '/users/register',
      LOGIN: '/users/login',
      VERIFY: '/users/verify'
    }
  }
}
```

## 📊 Structure des Données

### Utilisateur (Backend)
```javascript
{
  id_user: number,
  nom: string,
  prenom: string,
  email: string,
  mot_de_passe: string (hashé),
  devise: string,
  date_creation: datetime
}
```

### Token JWT
```javascript
{
  id_user: number,
  exp: timestamp
}
```

## 🐛 Dépannage

### Erreurs courantes

1. **"Cannot connect to backend"**
   - Vérifier que le backend est démarré sur le port 3001
   - Vérifier la configuration API_URL

2. **"Token invalide"**
   - Vérifier que le token est stocké dans localStorage
   - Vérifier l'expiration du token

3. **"Redirection en boucle"**
   - Vérifier la logique de protection des routes
   - Vérifier l'état d'authentification

### Logs utiles

```javascript
// Vérifier l'état d'authentification
console.log('Authenticated:', isAuthenticated())
console.log('User:', user)
console.log('Token:', localStorage.getItem('authToken'))
```

## 🚀 Déploiement

### Production
1. Configurer les variables d'environnement
2. Construire le frontend : `npm run build`
3. Démarrer en production : `npm start`
4. Configurer le backend pour la production

### Variables d'environnement production
```env
NEXT_PUBLIC_API_URL=https://votre-api.com/api
```

## 📝 Notes importantes

- ✅ **Sécurité** : Mots de passe hashés avec bcrypt
- ✅ **Tokens** : JWT avec expiration (1 jour)
- ✅ **Validation** : Côté frontend et backend
- ✅ **UX** : Redirections automatiques et messages d'erreur
- ✅ **i18n** : Support complet des 3 langues
- ✅ **Responsive** : Interface adaptative

## 🔄 Mise à jour

Pour ajouter de nouvelles fonctionnalités d'authentification :

1. **Backend** : Ajouter les endpoints dans `userController.js`
2. **Frontend** : Ajouter les méthodes dans `apiService.js`
3. **Context** : Mettre à jour `AuthContext.jsx`
4. **Routes** : Ajouter la protection si nécessaire
