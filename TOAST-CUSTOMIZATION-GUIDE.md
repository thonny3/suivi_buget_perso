# Guide de personnalisation des Toasts

## Configuration actuelle ✅

Les toasts sont maintenant configurés avec :
- **Arrière-plan blanc** (#ffffff)
- **Centrage parfait** en haut de l'écran
- **Bordures colorées** selon le type de message
- **Ombres subtiles** pour un effet moderne
- **Animations fluides** d'entrée et sortie
- **Design responsive** pour mobile et desktop

## Fichiers créés/modifiés

### 1. `src/components/CustomToaster.jsx`
Composant personnalisé pour la configuration des toasts :
```jsx
<Toaster 
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerStyle={{
    top: 20,
    left: 0,
    right: 0,
    zIndex: 9999,
  }}
  // ... configuration complète
/>
```

### 2. `src/hooks/useToast.js`
Hook personnalisé pour une utilisation facile :
```javascript
const { showSuccess, showError, showLoading, showInfo } = useToast()

// Utilisation
showSuccess('Inscription réussie !')
showError('Email déjà utilisé')
showLoading('Chargement...')
```

### 3. `src/styles/toast.css`
Styles CSS personnalisés pour un contrôle total :
- Styles pour tous les types de toasts
- Animations d'entrée/sortie
- Design responsive
- Z-index élevé pour la visibilité

### 4. `src/app/register/page.jsx`
Page d'inscription mise à jour :
- Utilisation du hook `useToast`
- Remplacement des toasts basiques
- Messages d'erreur améliorés
- Toast avec bouton d'action pour les emails existants

### 5. `src/components/ErrorToastWithAction.jsx`
Composant de toast d'erreur avec boutons d'action :
- Design professionnel avec icônes
- Boutons d'action stylisés
- Gestion des clics et fermeture

## Types de toasts disponibles

### ✅ Toast de succès
- **Couleur** : Vert (#059669)
- **Bordure** : 2px solid #10b981
- **Ombre** : Verte subtile
- **Durée** : 3 secondes

### ❌ Toast d'erreur
- **Couleur** : Rouge (#dc2626)
- **Bordure** : 2px solid #ef4444
- **Ombre** : Rouge subtile
- **Durée** : 4 secondes

### ℹ️ Toast d'information
- **Couleur** : Bleu (#3b82f6)
- **Bordure** : 2px solid #3b82f6
- **Ombre** : Bleue subtile
- **Durée** : 3 secondes

### 🔄 Toast de chargement
- **Couleur** : Gris (#374151)
- **Bordure** : 1px solid #e5e7eb
- **Durée** : Infinie (jusqu'à ce qu'il soit fermé)

### ❌ Toast d'erreur avec action
- **Couleur** : Rouge (#dc2626)
- **Bordure** : 2px solid #ef4444
- **Fonctionnalités** : Boutons d'action, icône d'erreur
- **Durée** : 8 secondes
- **Largeur** : 320-600px

## Personnalisation avancée

### Modifier les couleurs
Éditez `src/styles/toast.css` :
```css
[data-sonner-toast][data-type="success"] {
  background: #ffffff !important;
  color: #059669 !important;
  border: 2px solid #10b981 !important;
  /* Modifiez ces couleurs selon vos besoins */
}
```

### Modifier la position
Éditez `src/components/CustomToaster.jsx` :
```jsx
<Toaster 
  position="top-center" // ou "top-left", "top-right", "bottom-center", etc.
  containerStyle={{
    top: 20, // Distance du haut
    left: 0,
    right: 0,
  }}
/>
```

### Modifier les animations
Éditez `src/styles/toast.css` :
```css
@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

## Utilisation dans d'autres composants

### 1. Importer le hook
```javascript
import { useToast } from '@/hooks/useToast'
```

### 2. Utiliser dans le composant
```javascript
function MonComposant() {
  const { showSuccess, showError, showErrorWithAction, showLoading } = useToast()
  
  const handleAction = async () => {
    const loadingToast = showLoading('Chargement...')
    
    try {
      await monAction()
      showSuccess('Action réussie !')
    } catch (error) {
      if (error.message.includes('existe déjà')) {
        showErrorWithAction(
          'Un compte avec cet email existe déjà.',
          'Se connecter avec cet email',
          () => router.push('/connexion')
        )
      } else {
        showError('Erreur lors de l\'action')
      }
    } finally {
      dismiss(loadingToast)
    }
  }
}
```

### 3. Ajouter le CustomToaster
```jsx
import CustomToaster from '@/components/CustomToaster'

function MonComposant() {
  return (
    <>
      <CustomToaster />
      {/* Votre contenu */}
    </>
  )
}
```

## Test des toasts

### 1. Test manuel
- Allez sur `http://localhost:3000/register`
- Testez l'inscription avec différents scénarios
- Observez les toasts centrés avec arrière-plan blanc

### 2. Test depuis la console
```javascript
// Dans la console du navigateur
testToasts() // Fonction définie dans test-toast-demo.js
```

### 3. Test automatisé
```bash
node test-toast-demo.js
```

## Responsive design

Les toasts s'adaptent automatiquement :
- **Desktop** : Largeur fixe (300-500px), centré
- **Mobile** : Largeur adaptative, marges de 20px
- **Tablet** : Largeur intermédiaire

## Accessibilité

- **Contraste élevé** : Texte sombre sur fond blanc
- **Tailles appropriées** : Police 14px, padding généreux
- **Focus visible** : Bordures colorées
- **Animations respectueuses** : Pas de flash ou de mouvement excessif

## Prochaines améliorations possibles

1. **Thème sombre** : Support des toasts en mode sombre
2. **Sons** : Notifications audio optionnelles
3. **Actions** : Boutons d'action dans les toasts
4. **Groupement** : Grouper les toasts similaires
5. **Persistance** : Sauvegarder les toasts importants
