# Système de Langues i18n

Ce projet utilise un système de routage i18n avec Next.js 13+ App Router pour gérer plusieurs langues de manière persistante.

## Structure des Routes

Les routes sont organisées comme suit :
- `/fr` - Français (langue par défaut)
- `/mg` - Malagasy
- `/en` - English

### Exemples d'URLs :
- `http://localhost:3000/fr/register` - Page d'inscription en français
- `http://localhost:3000/mg/register` - Page d'inscription en malagasy
- `http://localhost:3000/en/register` - Page d'inscription en anglais
- `http://localhost:3000/fr/dashboard` - Dashboard en français
- `http://localhost:3000/mg/dashboard` - Dashboard en malagasy

## Fonctionnalités

### 1. Persistance de la Langue
- La langue choisie est sauvegardée dans le localStorage
- Même après actualisation de la page, la langue reste la même
- La langue est également persistante dans l'URL

### 2. Redirection Automatique
- Si l'utilisateur accède à `/` (sans langue), il est automatiquement redirigé vers `/fr`
- Le middleware détecte automatiquement la langue manquante et redirige

### 3. Changement de Langue
- Le sélecteur de langue permet de changer de langue instantanément
- Le changement de langue redirige vers la même page dans la nouvelle langue
- Exemple : `/fr/dashboard` → `/mg/dashboard`

## Configuration

### Middleware
Le fichier `src/middleware.js` gère :
- La détection des langues dans l'URL
- La redirection automatique vers la langue par défaut
- La gestion des routes sans locale

### Contexte de Langue
Le fichier `src/context/LanguageContext.jsx` gère :
- Le chargement des traductions
- La persistance de la langue choisie
- La redirection lors du changement de langue

### Traductions
Les fichiers de traduction se trouvent dans `src/i18n/locales/` :
- `fr.json` - Traductions françaises
- `mg.json` - Traductions malagasy
- `en.json` - Traductions anglaises

## Utilisation

### Dans les Composants
```jsx
import { useLanguage } from '@/context/LanguageContext'

function MyComponent() {
  const { t, currentLanguage, changeLanguage } = useLanguage()
  
  return (
    <div>
      <h1>{t('common.dashboard')}</h1>
      <p>Langue actuelle : {currentLanguage}</p>
      <button onClick={() => changeLanguage('en')}>
        Changer en anglais
      </button>
    </div>
  )
}
```

### Navigation avec Locale
```jsx
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

function NavigationComponent() {
  const router = useRouter()
  const { currentLanguage } = useLanguage()
  
  const navigateToPage = (page) => {
    router.push(`/${currentLanguage}${page}`)
  }
  
  return (
    <button onClick={() => navigateToPage('/dashboard')}>
      Aller au dashboard
    </button>
  )
}
```

## Avantages

1. **URLs Sémantiques** : Les URLs incluent la langue, facilitant le partage et le SEO
2. **Persistance** : La langue reste la même même après actualisation
3. **Flexibilité** : Facile d'ajouter de nouvelles langues
4. **Performance** : Chargement optimisé des traductions
5. **UX Améliorée** : L'utilisateur ne perd jamais sa langue préférée

## Ajout de Nouvelles Langues

Pour ajouter une nouvelle langue (ex: espagnol) :

1. Ajouter `'es'` dans le tableau `locales` du middleware
2. Créer `src/i18n/locales/es.json`
3. Ajouter la langue dans `LanguageContext.jsx`
4. Créer les routes dans `src/app/[locale]/`

## Dépannage

### Problème : Redirection infinie
- Vérifier que le middleware ne crée pas de boucle
- S'assurer que les routes par défaut existent

### Problème : Traductions manquantes
- Vérifier que les fichiers JSON sont valides
- S'assurer que les clés existent dans tous les fichiers de langue

### Problème : Langue non persistante
- Vérifier que localStorage est disponible
- S'assurer que le contexte est bien configuré
