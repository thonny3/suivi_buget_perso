// Test des différents scénarios d'erreur pour l'API d'inscription
const API_BASE_URL = 'http://localhost:3001/api';

async function testErrorScenarios() {
  console.log('🧪 Test des scénarios d\'erreur pour l\'API d\'inscription\n');
  console.log('=' .repeat(60));

  const testCases = [
    {
      name: 'Email déjà utilisé',
      data: {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com', // Email qui existe déjà
        password: 'password123',
        currency: 'EUR'
      },
      expectedError: 'existe déjà'
    },
    {
      name: 'Email invalide',
      data: {
        nom: 'Test',
        prenom: 'User',
        email: 'email-invalide',
        password: 'password123',
        currency: 'EUR'
      },
      expectedError: 'Format d\'email invalide'
    },
    {
      name: 'Mot de passe trop court',
      data: {
        nom: 'Test',
        prenom: 'User',
        email: 'newuser@example.com',
        password: '123', // Trop court
        currency: 'EUR'
      },
      expectedError: 'trop court'
    },
    {
      name: 'Champs manquants',
      data: {
        nom: '',
        prenom: 'User',
        email: 'incomplete@example.com',
        password: 'password123',
        currency: 'EUR'
      },
      expectedError: 'champs sont requis'
    },
    {
      name: 'Devise manquante',
      data: {
        nom: 'Test',
        prenom: 'User',
        email: 'nodevise@example.com',
        password: 'password123',
        currency: ''
      },
      expectedError: 'champs sont requis'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`📤 Données:`, testCase.data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const data = await response.json();
      
      console.log(`📥 Status: ${response.status}`);
      console.log(`📥 Réponse:`, data);

      if (response.status >= 400) {
        if (data.error && data.error.includes(testCase.expectedError)) {
          console.log(`✅ Test réussi: Erreur attendue détectée`);
        } else {
          console.log(`⚠️  Test partiel: Erreur détectée mais message différent`);
          console.log(`   Attendu: ${testCase.expectedError}`);
          console.log(`   Reçu: ${data.error || data.message}`);
        }
      } else {
        console.log(`❌ Test échoué: Aucune erreur détectée (status ${response.status})`);
      }

    } catch (error) {
      console.error(`💥 Erreur lors du test:`, error.message);
    }
    
    console.log('-'.repeat(40));
  }
}

async function testSuccessScenario() {
  console.log('\n🎉 Test du scénario de succès');
  console.log('=' .repeat(60));
  
  const successData = {
    nom: 'Success',
    prenom: 'Test',
    email: `success-${Date.now()}@example.com`, // Email unique
    password: 'password123',
    currency: 'EUR'
  };

  try {
    console.log('📤 Données:', successData);
    
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(successData),
    });

    const data = await response.json();
    
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Réponse:`, data);

    if (response.ok && data.message) {
      console.log(`✅ Inscription réussie: ${data.message}`);
    } else {
      console.log(`❌ Échec inattendu:`, data.error || data.message);
    }

  } catch (error) {
    console.error(`💥 Erreur lors du test de succès:`, error.message);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de scénarios d\'erreur\n');
  
  await testErrorScenarios();
  await testSuccessScenario();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Tous les tests terminés');
  console.log('\n💡 Conseils:');
  console.log('- Vérifiez que le serveur backend est démarré');
  console.log('- Les tests d\'erreur sont normaux et attendus');
  console.log('- Le test de succès devrait créer un nouvel utilisateur');
}

runAllTests();
