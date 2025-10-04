// Test du toast avec bouton d'action
console.log('🧪 Test du toast avec bouton d\'action');
console.log('=' .repeat(50));

console.log(`
📋 Instructions pour tester le toast avec bouton d'action :

1. Ouvrez la page d'inscription : http://localhost:3000/register
2. Remplissez le formulaire avec un email qui existe déjà
3. Cliquez sur "Hisoratra anarana"
4. Vous devriez voir un toast d'erreur avec :
   - Message : "Un compte avec cet email existe déjà."
   - Bouton bleu : "Se connecter avec cet email"
   - Bouton gris : "Fermer"

5. Caractéristiques du toast :
   - Arrière-plan blanc
   - Centré en haut de l'écran
   - Bordure rouge
   - Icône d'erreur
   - Deux boutons d'action
   - Durée : 8 secondes

6. Testez les boutons :
   - "Se connecter avec cet email" → Redirige vers /connexion
   - "Fermer" → Ferme le toast
`);

// Fonction pour tester depuis la console
if (typeof window !== 'undefined') {
  window.testToastWithAction = () => {
    console.log('🧪 Test du toast avec action depuis la console...');
    
    if (typeof toast !== 'undefined') {
      console.log('✅ react-hot-toast est disponible');
      
      // Simuler un toast d'erreur avec action
      const ErrorToastWithAction = ({ message, actionText, onAction, onDismiss }) => {
        return React.createElement('div', {
          className: 'flex flex-col items-center space-y-3 text-center'
        }, [
          React.createElement('div', {
            className: 'flex items-center space-x-2'
          }, [
            React.createElement('div', {
              className: 'w-5 h-5 rounded-full bg-red-100 flex items-center justify-center'
            }, [
              React.createElement('svg', {
                className: 'w-3 h-3 text-red-600',
                fill: 'currentColor',
                viewBox: '0 0 20 20'
              }, React.createElement('path', {
                fillRule: 'evenodd',
                d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
                clipRule: 'evenodd'
              }))
            ]),
            React.createElement('span', {
              className: 'text-sm font-medium text-gray-900'
            }, message)
          ]),
          React.createElement('div', {
            className: 'flex space-x-3'
          }, [
            React.createElement('button', {
              onClick: onAction,
              className: 'px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200'
            }, actionText),
            React.createElement('button', {
              onClick: onDismiss,
              className: 'px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200'
            }, 'Fermer')
          ])
        ])
      }
      
      // Afficher le toast de test
      toast.error(
        (t) => ErrorToastWithAction({
          message: 'Un compte avec cet email existe déjà.',
          actionText: 'Se connecter avec cet email',
          onAction: () => {
            console.log('🔄 Redirection vers la page de connexion...')
            toast.dismiss(t.id)
          },
          onDismiss: () => toast.dismiss(t.id)
        }),
        {
          duration: 8000,
          style: {
            background: '#ffffff',
            color: '#dc2626',
            border: '2px solid #ef4444',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(239, 68, 68, 0.04)',
            minWidth: '320px',
            maxWidth: '600px',
            padding: '20px 24px',
          }
        }
      )
      
    } else {
      console.log('❌ react-hot-toast n\'est pas disponible dans la console');
      console.log('   Ouvrez la page d\'inscription pour tester les toasts');
    }
  };
  
  console.log('\n💡 Pour tester le toast avec action depuis la console, tapez : testToastWithAction()');
}
