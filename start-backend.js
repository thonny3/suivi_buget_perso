const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Démarrage du backend...')

// Chemin vers le backend
const backendPath = path.join(__dirname, '..', 'perso_buget', 'backend')

// Démarrer le backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
})

backend.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du backend:', error)
})

backend.on('close', (code) => {
  console.log(`Backend fermé avec le code ${code}`)
})

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du backend...')
  backend.kill('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du backend...')
  backend.kill('SIGTERM')
  process.exit(0)
})
