/**
 * Script de test pour l'authentification
 * Usage: node test-auth.js
 */

const API_BASE_URL = 'http://localhost:3001/api'

async function testAuth() {
  console.log('🧪 Test du système d\'authentification...\n')

  try {
    // Test 1: Inscription
    console.log('1️⃣ Test d\'inscription...')
    const registerData = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: 'password123',
      currency: 'EUR'
    }

    const registerResponse = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    })

    if (registerResponse.ok) {
      console.log('✅ Inscription réussie')
    } else {
      const error = await registerResponse.json()
      console.log('❌ Erreur inscription:', error.message)
    }

    // Test 2: Connexion
    console.log('\n2️⃣ Test de connexion...')
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    })

    if (loginResponse.ok) {
      const loginResult = await loginResponse.json()
      console.log('✅ Connexion réussie')
      console.log('🔑 Token:', loginResult.token.substring(0, 20) + '...')
      
      // Test 3: Vérification du token
      console.log('\n3️⃣ Test de vérification du token...')
      const verifyResponse = await fetch(`${API_BASE_URL}/users/verify`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${loginResult.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json()
        console.log('✅ Token valide')
        console.log('👤 Utilisateur:', verifyResult.user.nom, verifyResult.user.prenom)
      } else {
        console.log('❌ Token invalide')
      }
    } else {
      const error = await loginResponse.json()
      console.log('❌ Erreur connexion:', error.message)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    console.log('\n💡 Vérifiez que le backend est démarré sur le port 3001')
  }

  console.log('\n🏁 Test terminé')
}

// Exécuter le test
testAuth()
