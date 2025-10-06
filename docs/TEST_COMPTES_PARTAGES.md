# Guide de Test - Comptes Partagés

## Vérification de l'intégration

### 1. Test de l'API Backend

Vérifiez que l'API backend fonctionne en testant les endpoints :

```bash
# Test de récupération des comptes partagés d'un utilisateur
curl -X GET "http://localhost:3001/api/comptes-partages/user/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test de partage d'un compte
curl -X POST "http://localhost:3001/api/comptes-partages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_compte": 1,
    "email": "test@example.com",
    "role": "lecteur"
  }'
```

### 2. Test de l'Interface Frontend

#### Étape 1 : Vérifier le chargement des comptes partagés
1. Ouvrez la page portefeuille
2. Cliquez sur le bouton "Test Comptes Partagés" (temporaire)
3. Vérifiez la console du navigateur pour voir les logs
4. Les comptes partagés doivent apparaître dans la section "Comptes partagés"

#### Étape 2 : Tester le partage d'un compte
1. Dans "Mes comptes", cliquez sur l'icône de partage (Share2)
2. Entrez un email valide d'un autre utilisateur
3. Sélectionnez un rôle (lecteur, contributeur, propriétaire)
4. Cliquez sur "Inviter"
5. Vérifiez que l'utilisateur apparaît dans la liste

#### Étape 3 : Vérifier l'affichage des comptes partagés
1. Les comptes partagés doivent avoir :
   - Un badge "Partagé" en haut à droite
   - Une bordure en pointillés
   - Un fond légèrement différent
   - Un indicateur de rôle (lecteur, contributeur, propriétaire)

### 3. Vérifications visuelles

#### Section "Mes comptes"
- ✅ Titre : "Mes comptes"
- ✅ Description : "Vos comptes personnels que vous gérez"
- ✅ Comptes avec bordure normale
- ✅ Boutons d'action (partager, modifier, supprimer)

#### Section "Comptes partagés"
- ✅ Titre : "Comptes partagés"
- ✅ Description : "Comptes partagés avec vous par d'autres utilisateurs"
- ✅ Comptes avec bordure en pointillés
- ✅ Badge "Partagé" visible
- ✅ Indicateur de rôle visible
- ✅ Pas de boutons d'action (lecture seule)

### 4. Test des statistiques

Vérifiez que les statistiques s'affichent correctement :
- Nombre total de comptes personnels
- Nombre de comptes partagés
- Solde total des comptes personnels
- Solde moyen des comptes personnels

### 5. Test des rôles

#### Rôle "Lecteur"
- Peut voir le compte et le solde
- Ne peut pas modifier le compte
- Ne peut pas partager le compte

#### Rôle "Contributeur"
- Peut voir le compte et le solde
- Peut ajouter des transactions (à implémenter)
- Ne peut pas partager le compte

#### Rôle "Propriétaire"
- Peut voir le compte et le solde
- Peut modifier le compte
- Peut partager le compte

### 6. Debug et logs

Vérifiez la console du navigateur pour :
- `Comptes partagés chargés:` - Liste des comptes partagés
- Erreurs d'API éventuelles
- Requêtes réseau dans l'onglet Network

### 7. Données de test

Pour tester, vous pouvez :
1. Créer plusieurs comptes avec différents utilisateurs
2. Partager des comptes entre utilisateurs
3. Vérifier que chaque utilisateur voit ses comptes personnels ET les comptes partagés

### 8. Nettoyage

Après les tests, supprimez le bouton de test temporaire :
- Supprimez le bouton "Test Comptes Partagés"
- Supprimez le console.log de debug

## Résolution de problèmes

### Problème : Les comptes partagés ne s'affichent pas
1. Vérifiez que l'utilisateur est connecté (userInfo.id_user)
2. Vérifiez la console pour les erreurs d'API
3. Vérifiez que l'API backend fonctionne
4. Vérifiez les permissions de l'utilisateur

### Problème : Erreur lors du partage
1. Vérifiez que l'email existe dans la base de données
2. Vérifiez que l'utilisateur n'est pas déjà partagé
3. Vérifiez les permissions du compte

### Problème : Interface ne se met pas à jour
1. Vérifiez que les callbacks sont appelés
2. Vérifiez que les états sont mis à jour
3. Vérifiez la synchronisation des données
