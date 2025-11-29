/**
 * Service pour la gestion des comptes
 * Interface avec l'API backend pour les opérations CRUD sur les comptes
 */

import apiService from './apiService';

class AccountsService {
  /**
   * Récupérer tous les comptes de l'utilisateur authentifié
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async getMyAccounts() {
    try {
      const response = await apiService.getMyAccounts();
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Erreur lors du chargement des comptes'
      };
    }
  }

  /**
   * Récupérer tous les comptes (admin)
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async getAllAccounts() {
    try {
      const response = await apiService.getAccounts();
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les comptes:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Erreur lors du chargement des comptes'
      };
    }
  }

  /**
   * Récupérer un compte par son ID
   * @param {number} id - ID du compte
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async getAccountById(id) {
    try {
      if (!id) {
        throw new Error('ID du compte requis');
      }
      
      const response = await apiService.getAccountById(id);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors du chargement du compte'
      };
    }
  }

  /**
   * Créer un nouveau compte
   * @param {Object} accountData - Données du compte à créer
   * @param {string} accountData.nom - Nom du compte
   * @param {string} accountData.type - Type du compte (courant, epargne, etc.)
   * @param {number} accountData.solde - Solde initial
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async createAccount(accountData) {
    try {
      // Validation des données
      if (!accountData.nom || !accountData.nom.trim()) {
        throw new Error('Le nom du compte est requis');
      }
      if (!accountData.type) {
        throw new Error('Le type du compte est requis');
      }
      if (accountData.solde < 0) {
        throw new Error('Le solde ne peut pas être négatif');
      }

      // Préparation des données
      const data = {
        nom: accountData.nom.trim(),
        type: accountData.type,
        solde: parseFloat(accountData.solde) || 0
      };

      const response = await apiService.createAccount(data);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors de la création du compte'
      };
    }
  }

  /**
   * Mettre à jour un compte existant
   * @param {number} id - ID du compte à modifier
   * @param {Object} accountData - Nouvelles données du compte
   * @param {string} accountData.nom - Nom du compte
   * @param {string} accountData.type - Type du compte
   * @param {number} accountData.solde - Solde du compte
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async updateAccount(id, accountData) {
    try {
      // Validation des données
      if (!id) {
        throw new Error('ID du compte requis');
      }
      if (!accountData.nom || !accountData.nom.trim()) {
        throw new Error('Le nom du compte est requis');
      }
      if (!accountData.type) {
        throw new Error('Le type du compte est requis');
      }
      if (accountData.solde < 0) {
        throw new Error('Le solde ne peut pas être négatif');
      }

      // Préparation des données
      const data = {
        nom: accountData.nom.trim(),
        type: accountData.type,
        solde: parseFloat(accountData.solde) || 0
      };

      const response = await apiService.updateAccount(id, data);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors de la mise à jour du compte'
      };
    }
  }

  /**
   * Supprimer un compte
   * @param {number} id - ID du compte à supprimer
   * @returns {Promise<Object>} Résultat avec succès/erreur
   */
  async deleteAccount(id) {
    try {
      if (!id) {
        throw new Error('ID du compte requis');
      }

      const response = await apiService.deleteAccount(id);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors de la suppression du compte'
      };
    }
  }

  /**
   * Récupérer les statistiques des comptes
   * @param {Array} accounts - Liste des comptes
   * @returns {Object} Statistiques calculées
   */
  calculateStats(accounts) {
    if (!Array.isArray(accounts)) {
      return {
        total: 0,
        totalBalance: 0,
        averageBalance: 0,
        byType: {}
      };
    }

    const stats = {
      total: accounts.length,
      totalBalance: 0,
      averageBalance: 0,
      byType: {}
    };

    // Calcul du solde total et par type
    accounts.forEach(account => {
      const balance = parseFloat(account.solde) || 0;
      stats.totalBalance += balance;

      // Grouper par type
      if (!stats.byType[account.type]) {
        stats.byType[account.type] = {
          count: 0,
          total: 0
        };
      }
      stats.byType[account.type].count += 1;
      stats.byType[account.type].total += balance;
    });

    // Calcul de la moyenne
    stats.averageBalance = stats.total > 0 ? stats.totalBalance / stats.total : 0;

    return stats;
  }

  /**
   * Formater les données d'un compte pour l'affichage
   * @param {Object} account - Données du compte
   * @returns {Object} Compte formaté
   */
  formatAccount(account) {
    return {
      ...account,
      solde: parseFloat(account.solde) || 0,
      soldeFormatted: (parseFloat(account.solde) || 0).toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' €',
      typeFormatted: this.getTypeLabel(account.type)
    };
  }

  /**
   * Obtenir le libellé d'un type de compte
   * @param {string} type - Type du compte
   * @returns {string} Libellé formaté
   */
  getTypeLabel(type) {
    const labels = {
      courant: 'Compte Courant',
      epargne: 'Épargne',
      investissement: 'Investissement',
      trading: 'Trading',
      crypto: 'Cryptomonnaie',
      mobile_money: 'Mobile Money',
      cash: 'Espèces'
    };
    return labels[type] || type;
  }

  /**
   * Obtenir les types de comptes disponibles
   * @returns {Array} Liste des types disponibles
   */
  getAvailableTypes() {
    return [
      { value: 'courant', label: 'Compte Courant' },
      { value: 'epargne', label: 'Compte Épargne' },
      { value: 'investissement', label: 'Investissement' },
      { value: 'trading', label: 'Trading' },
      { value: 'crypto', label: 'Cryptomonnaie' },
      { value: 'mobile_money', label: 'Mobile Money' },
      { value: 'cash', label: 'Espèces' }
    ];
  }
  
}

// Export d'une instance unique du service
export default new AccountsService();
