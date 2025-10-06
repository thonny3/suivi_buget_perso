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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur de requête')
      }

      return data
    } catch (error) {
      console.error('Erreur API:', error)
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
}

export default new ApiService()
