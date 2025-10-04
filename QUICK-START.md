# 🚀 Guide de Démarrage Rapide

## ⚡ Démarrage en 3 étapes

### 1. Installer les dépendances
```bash
# Frontend
cd suivi_buget_perso
npm install

# Backend  
cd ../perso_buget/backend
npm install
```

### 2. Configurer la base de données
1. Créer une base MySQL
2. Importer `jalako.sql`
3. Vérifier `perso_buget/backend/config/db.js`

### 3. Démarrer l'application
```bash
cd suivi_buget_perso
npm run dev:full
```

## 🌐 URLs de test

- **Frontend** : http://localhost:3000/fr
- **Backend** : http://localhost:3001/api
- **Test API** : `node test-auth.js`

## 🔐 Flux d'authentification

1. **Inscription** → Redirection vers connexion
2. **Connexion** → Redirection vers dashboard  
3. **Protection** → Accès contrôlé selon l'état

## 📱 URLs importantes

### Non connecté
- `/fr` - Accueil
- `/fr/connexion` - Connexion
- `/fr/register` - Inscription

### Connecté
- `/fr/dashboard` - Tableau de bord
- `/fr/dashboard/budget` - Budget
- `/fr/dashboard/depenses` - Dépenses

## 🛠️ Dépannage

### Backend ne démarre pas
```bash
cd perso_buget/backend
npm install
npm run dev
```

### Frontend ne se connecte pas
- Vérifier que le backend est sur le port 3001
- Vérifier la configuration dans `src/config/api.js`

### Erreurs de base de données
- Vérifier la connexion MySQL
- Vérifier les paramètres dans `config/db.js`
- Importer le fichier `jalako.sql`

## ✅ Vérification

1. **Backend** : http://localhost:3001/api/users (doit retourner une erreur 404 normale)
2. **Frontend** : http://localhost:3000/fr (doit afficher la page d'accueil)
3. **Test complet** : `node test-auth.js`

## 🎯 Fonctionnalités implémentées

- ✅ Inscription avec validation backend
- ✅ Connexion avec JWT
- ✅ Protection des routes
- ✅ Redirection automatique
- ✅ Support multilingue (FR/MG/EN)
- ✅ Interface responsive
- ✅ Gestion d'erreurs complète

## 📞 Support

En cas de problème :
1. Vérifier les logs dans la console
2. Tester l'API avec `node test-auth.js`
3. Vérifier la configuration de la base de données
4. Consulter `README-BACKEND.md` pour plus de détails
