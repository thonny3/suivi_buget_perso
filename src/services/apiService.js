import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

class ApiService {
  // Méthode générique pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      let data
      let rawText
      try {
        data = await response.json()
      } catch (_e) {
        try {
          rawText = await response.text()
        } catch (_e2) {
          rawText = ''
        }
      }

      if (!response.ok) {
        const details = (
          typeof data === 'string' ? data :
          data?.message || data?.error?.message || data?.error ||
          rawText || response.statusText || 'Erreur de requête'
        )
        const message = typeof details === 'string' ? details : JSON.stringify(details)
        const error = new Error(message)
        // attach extra context for debugging
        error.status = response.status
        error.payload = data ?? rawText
        
        // Gestion spéciale des erreurs d'authentification
        if (response.status === 401 || response.status === 403) {
          // Token invalide ou accès refusé - déconnecter l'utilisateur
          this.logout()
          // Rediriger vers la page de connexion si on est dans le navigateur
          if (typeof window !== 'undefined') {
            window.location.href = '/connexion'
          }
        }
        
        if (process.env.NEXT_PUBLIC_DEBUG_API === '1') {
          // eslint-disable-next-line no-console
          console.warn('[API ERROR]', { url, status: response.status, message, payload: error.payload })
        }
        throw error
      }

      if (process.env.NEXT_PUBLIC_DEBUG_API === '1') {
        // eslint-disable-next-line no-console
        console.log('[API OK]', { url, status: response.status, data: data ?? rawText })
      }

      return data ?? rawText
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur API:', error, error?.payload)
      throw error
    }
  }

  // Méthode pour les requêtes multipart/form-data (FormData)
  async requestForm(endpoint, formData, method = 'POST') {
    const url = `${API_BASE_URL}${endpoint}`
    const token = localStorage.getItem('authToken')

    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const config = {
      method,
      headers, // Ne pas définir Content-Type, laissé à fetch pour FormData
      body: formData,
    }

    try {
      const response = await fetch(url, config)
      let data
      let rawText
      try {
        data = await response.json()
      } catch (_e) {
        try {
          rawText = await response.text()
        } catch (_e2) {
          rawText = ''
        }
      }

      if (!response.ok) {
        const details = (
          typeof data === 'string' ? data :
          data?.message || data?.error?.message || data?.error ||
          rawText || response.statusText || 'Erreur de requête'
        )
        const message = typeof details === 'string' ? details : JSON.stringify(details)
        const error = new Error(message)
        error.status = response.status
        error.payload = data ?? rawText
        throw error
      }

      return data ?? rawText
    } catch (error) {
      console.error('Erreur API (form):', error, error?.payload)
      throw error
    }
  }

  // Authentification
  async register(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async verifyToken() {
    return this.request('/users/verify', {
      method: 'GET',
    })
  }

  // Utilisateurs
  async getCurrentUser() {
    // Récupère l'utilisateur courant via vérification du token
    return this.request('/users/verify', { method: 'GET' })
  }

  async updateUser(userId, { nom, prenom, email, devise, imageFile }) {
    // Utilise FormData pour supporter l'upload d'image
    const form = new FormData()
    if (typeof nom !== 'undefined') form.append('nom', nom)
    if (typeof prenom !== 'undefined') form.append('prenom', prenom)
    if (typeof email !== 'undefined') form.append('email', email)
    if (typeof devise !== 'undefined') form.append('devise', devise)
    if (imageFile) form.append('image', imageFile)

    return this.requestForm(`/users/${userId}`, form, 'PUT')
  }

  async changePassword({ currentPassword, newPassword }) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // Gestion des tokens
  setToken(token) {
    localStorage.setItem('authToken', token)
  }

  getToken() {
    return localStorage.getItem('authToken')
  }

  removeToken() {
    localStorage.removeItem('authToken')
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken()
  }

  // Déconnexion
  logout() {
    this.removeToken()
  }

  // Services des comptes
  async getAccounts() {
    return this.request('/comptes', {
      method: 'GET',
    })
  }

  async getMyAccounts() {
    return this.request('/comptes/mycompte/user', {
      method: 'GET',
    })
  }

  async getAccountById(id) {
    return this.request(`/comptes/${id}`, {
      method: 'GET',
    })
  }

  async createAccount(accountData) {
    return this.request('/comptes', {
      method: 'POST',
      body: JSON.stringify(accountData),
    })
  }

  async updateAccount(id, accountData) {
    return this.request(`/comptes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    })
  }

  async deleteAccount(id) {
    return this.request(`/comptes/${id}`, {
      method: 'DELETE',
    })
  }

  // Services des comptes partagés
  async shareAccount(accountId, shareData) {
    return this.request('/comptes-partages', {
      method: 'POST',
      body: JSON.stringify({
        id_compte: accountId,
        email: shareData.email,
        role: shareData.role
      }),
    })
  }

  async getSharedAccountsByUser(userId) {
    return this.request(`/comptes-partages/user/${userId}`, {
      method: 'GET',
    })
  }

  async getSharedUsersByAccount(accountId) {
    return this.request(`/comptes-partages/compte/${accountId}`, {
      method: 'GET',
    })
  }

  async updateSharedAccountRole(shareId, role) {
    return this.request(`/comptes-partages/${shareId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async deleteSharedAccount(shareId) {
    return this.request(`/comptes-partages/${shareId}`, {
      method: 'DELETE',
    })
  }

  // (Dépenses déplacées vers depensesService)
}

export default new ApiService()
