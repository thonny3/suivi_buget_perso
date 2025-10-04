// Démonstration des toasts personnalisés
// Ce fichier peut être exécuté dans la console du navigateur pour tester les toasts

console.log('🧪 Démonstration des toasts personnalisés');
console.log('=' .repeat(50));

// Instructions pour tester les toasts
console.log(`
📋 Instructions pour tester les toasts :

1. Ouvrez la page d'inscription : http://localhost:3000/register
2. Testez les différents scénarios :

   ✅ Toast de succès :
   - Remplissez le formulaire avec des données valides
   - Cliquez sur "Hisoratra anarana"
   - Vous devriez voir un toast vert avec un arrière-plan blanc

   ❌ Toast d'erreur :
   - Essayez de vous inscrire avec un email existant
   - Vous devriez voir un toast rouge avec un arrière-plan blanc

   🔄 Toast de chargement :
   - Pendant l'inscription, un toast de chargement peut apparaître

3. Caractéristiques des toasts :
   - Arrière-plan blanc
   - Centré en haut de l'écran
   - Bordures colorées selon le type
   - Ombres subtiles
   - Animation d'entrée/sortie
   - Responsive design

4. Testez aussi :
   - Boutons Google/Facebook (toast d'erreur)
   - Validation des champs (messages d'erreur)
`);

// Fonction pour tester les toasts depuis la console
if (typeof window !== 'undefined') {
  window.testToasts = () => {
    console.log('🧪 Test des toasts depuis la console...');
    
    // Note: Ces fonctions nécessitent que react-hot-toast soit chargé
    if (typeof toast !== 'undefined') {
      console.log('✅ react-hot-toast est disponible');
      
      // Test toast de succès
      toast.success('Test de toast de succès !', {
        duration: 2000,
      });
      
      // Test toast d'erreur après 1 seconde
      setTimeout(() => {
        toast.error('Test de toast d\'erreur !', {
          duration: 2000,
        });
      }, 1000);
      
      // Test toast d'info après 2 secondes
      setTimeout(() => {
        toast('Test de toast d\'information !', {
          duration: 2000,
          style: {
            background: '#ffffff',
            color: '#3b82f6',
            border: '2px solid #3b82f6',
            textAlign: 'center',
          },
        });
      }, 2000);
      
    } else {
      console.log('❌ react-hot-toast n\'est pas disponible dans la console');
      console.log('   Ouvrez la page d\'inscription pour tester les toasts');
    }
  };
  
  console.log('\n💡 Pour tester les toasts depuis la console, tapez : testToasts()');
}
