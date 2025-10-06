# Synchronisation des Comptes Partagés

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de partager leurs comptes avec d'autres utilisateurs, avec différents niveaux d'accès (lecteur, contributeur, propriétaire).

## Architecture

### Backend (API existante)
- **Endpoint**: `/api/comptes-partages`
- **Modèle**: `ComptesPartages` dans `perso_buget/backend/models/comptesPartagesModel.js`
- **Contrôleur**: `comptesPartagesController.js`
- **Routes**: `comptesPartagesRoutes.js`

### Frontend (Nouvelle intégration)
- **Service**: `sharedAccountsService.js` - Gestion des appels API
- **API Service**: `apiService.js` - Endpoints des comptes partagés
- **Composant**: `page.jsx` - Interface utilisateur intégrée

## Fonctionnalités implémentées

### 1. Partage de comptes
- Invitation d'utilisateurs par email
- Attribution de rôles (lecteur, contributeur, propriétaire)
- Validation des données côté client et serveur

### 2. Gestion des rôles
- **Lecteur**: Lecture seule des comptes et transactions
- **Contributeur**: Peut ajouter/modifier des transactions
- **Propriétaire**: Accès complet, peut gérer les partages

### 3. Interface utilisateur
- Modal de partage avec liste des utilisateurs
- Affichage des comptes partagés dans le portefeuille
- Statistiques mises à jour (nombre de comptes partagés)
- Gestion des états de chargement et d'erreur

### 4. Synchronisation
- Chargement automatique des comptes partagés
- Mise à jour en temps réel après modifications
- Gestion des erreurs et retry automatique

## API Endpoints

### Partager un compte
```http
POST /api/comptes-partages
Content-Type: application/json
Authorization: Bearer <token>

{
  "id_compte": 123,
  "email": "user@example.com",
  "role": "lecteur"
}
```

### Récupérer les comptes partagés d'un utilisateur
```http
GET /api/comptes-partages/user/{userId}
Authorization: Bearer <token>
```

### Récupérer les utilisateurs d'un compte partagé
```http
GET /api/comptes-partages/compte/{accountId}
Authorization: Bearer <token>
```

### Modifier le rôle d'un utilisateur
```http
PUT /api/comptes-partages/{shareId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "contributeur"
}
```

### Supprimer un partage
```http
DELETE /api/comptes-partages/{shareId}
Authorization: Bearer <token>
```

## Utilisation

### Dans le composant portefeuille
```javascript
import sharedAccountsService from '@/services/sharedAccountsService';

// Charger les comptes partagés
const loadSharedAccounts = async () => {
  const result = await sharedAccountsService.getSharedAccountsByUser(userId);
  if (result.success) {
    setSharedAccounts(result.data);
  }
};

// Partager un compte
const shareAccount = async (accountId, email, role) => {
  const result = await sharedAccountsService.shareAccount(accountId, {
    email,
    role
  });
  return result;
};
```

### Formatage des données
```javascript
// Formater un compte partagé
const formattedAccount = sharedAccountsService.formatSharedAccount(account);

// Formater un utilisateur partagé
const formattedUser = sharedAccountsService.formatSharedUser(user);

// Calculer les statistiques
const stats = sharedAccountsService.calculateSharedStats(sharedAccounts);
```

## Gestion des erreurs

Le service gère automatiquement :
- Validation des données d'entrée
- Gestion des erreurs réseau
- Messages d'erreur utilisateur
- Retry automatique en cas d'échec

## Sécurité

- Authentification requise pour tous les endpoints
- Validation des permissions côté serveur
- Vérification de l'existence des utilisateurs
- Protection contre les partages en double

## Tests

Des tests unitaires sont disponibles dans `src/services/__tests__/sharedAccountsService.test.js` pour valider :
- Formatage des données
- Calcul des statistiques
- Gestion des cas limites

## Configuration

Les endpoints sont configurés dans `src/config/api.js` :

```javascript
SHARED_ACCOUNTS: {
  SHARE: '/comptes-partages',
  GET_BY_USER: (userId) => `/comptes-partages/user/${userId}`,
  GET_BY_ACCOUNT: (accountId) => `/comptes-partages/compte/${accountId}`,
  UPDATE_ROLE: (shareId) => `/comptes-partages/${shareId}`,
  DELETE: (shareId) => `/comptes-partages/${shareId}`
}
```

## Prochaines étapes

1. Tests d'intégration avec l'API backend
2. Notifications en temps réel pour les nouveaux partages
3. Historique des modifications de partage
4. Interface mobile optimisée
5. Export des données de partage
