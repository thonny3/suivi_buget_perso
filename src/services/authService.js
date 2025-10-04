const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de l\'inscription');
      }

      return data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la connexion');
      }

      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Token invalide');
      }

      return data;
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      throw error;
    }
  }

  // Test de connectivité avec le serveur
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur de connexion au serveur:', error);
      throw error;
    }
  }
}

export default new AuthService();
