// Test simple pour vérifier l'intégration de l'API d'inscription
const API_BASE_URL = 'http://localhost:3001/api';

async function testRegisterAPI() {
  console.log('🧪 Test de l\'API d\'inscription...\n');
  
  const testUser = {
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    password: 'password123',
    currency: 'EUR'
  };

  try {
    console.log('📤 Envoi de la requête d\'inscription...');
    console.log('URL:', `${API_BASE_URL}/users/register`);
    console.log('Données:', testUser);
    
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log('\n📥 Réponse reçue:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Test réussi ! L\'API d\'inscription fonctionne correctement.');
    } else {
      console.log('\n❌ Test échoué. Erreur:', data.error || data.message);
    }

  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error.message);
    console.log('\n🔍 Vérifiez que:');
    console.log('1. Le serveur backend est démarré (npm run dev dans perso_buget/backend)');
    console.log('2. Le serveur écoute sur le port 3001');
    console.log('3. La base de données est configurée et accessible');
  }
}

// Test de connectivité du serveur
async function testServerConnectivity() {
  console.log('🔌 Test de connectivité du serveur...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/ping`);
    const data = await response.json();
    
    console.log('✅ Serveur accessible:', data.message);
    return true;
  } catch (error) {
    console.error('❌ Serveur inaccessible:', error.message);
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests d\'intégration API\n');
  console.log('=' .repeat(50));
  
  const isServerUp = await testServerConnectivity();
  
  if (isServerUp) {
    console.log('\n' + '=' .repeat(50));
    await testRegisterAPI();
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Tests terminés');
}

runTests();
