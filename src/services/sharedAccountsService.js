/**
 * Service pour la gestion des comptes partagés
 * Interface avec l'API backend pour les opérations sur les comptes partagés
 */

import apiService from './apiService';

class SharedAccountsService {
  /**
   * Partager un compte avec un utilisateur
   * @param {number} accountId - ID du compte à partager
   * @param {Object} shareData - Données du partage
   * @param {string} shareData.email - Email de l'utilisateur
   * @param {string} shareData.role - Rôle (lecteur, contributeur, proprietaire)
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async shareAccount(accountId, shareData) {
    try {
      // Validation des données
      if (!accountId) {
        throw new Error('ID du compte requis');
      }
      if (!shareData.email || !shareData.email.includes('@')) {
        throw new Error('Email valide requis');
      }
      if (!shareData.role || !['lecteur', 'contributeur', 'proprietaire'].includes(shareData.role)) {
        throw new Error('Rôle valide requis (lecteur, contributeur, proprietaire)');
      }

      const response = await apiService.shareAccount(accountId, shareData);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors du partage du compte:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors du partage du compte'
      };
    }
  }

  /**
   * Récupérer les comptes partagés avec l'utilisateur actuel
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async getSharedAccountsByUser(userId) {
    try {
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }

      const response = await apiService.getSharedAccountsByUser(userId);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes partagés:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Erreur lors du chargement des comptes partagés'
      };
    }
  }

  /**
   * Récupérer les utilisateurs ayant accès à un compte
   * @param {number} accountId - ID du compte
   * @returns {Promise<Object>} Résultat avec succès/erreur et données
   */
  async getSharedUsersByAccount(accountId) {
    try {
      if (!accountId) {
        throw new Error('ID du compte requis');
      }

      const response = await apiService.getSharedUsersByAccount(accountId);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs partagés:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Erreur lors du chargement des utilisateurs partagés'
      };
    }
  }

  /**
   * Mettre à jour le rôle d'un utilisateur sur un compte partagé
   * @param {number} shareId - ID du partage
   * @param {string} role - Nouveau rôle
   * @returns {Promise<Object>} Résultat avec succès/erreur
   */
  async updateSharedAccountRole(shareId, role) {
    try {
      if (!shareId) {
        throw new Error('ID du partage requis');
      }
      if (!role || !['lecteur', 'contributeur', 'proprietaire'].includes(role)) {
        throw new Error('Rôle valide requis (lecteur, contributeur, proprietaire)');
      }

      const response = await apiService.updateSharedAccountRole(shareId, role);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors de la mise à jour du rôle'
      };
    }
  }

  /**
   * Supprimer un partage de compte
   * @param {number} shareId - ID du partage à supprimer
   * @returns {Promise<Object>} Résultat avec succès/erreur
   */
  async deleteSharedAccount(shareId) {
    try {
      if (!shareId) {
        throw new Error('ID du partage requis');
      }

      const response = await apiService.deleteSharedAccount(shareId);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du partage:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors de la suppression du partage'
      };
    }
  }

  /**
   * Formater les données d'un compte partagé pour l'affichage
   * @param {Object} sharedAccount - Données du compte partagé
   * @returns {Object} Compte partagé formaté
   */
  formatSharedAccount(sharedAccount) {
    return {
      ...sharedAccount,
      solde: parseFloat(sharedAccount.solde) || 0,
      soldeFormatted: (parseFloat(sharedAccount.solde) || 0).toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' AR',
      typeFormatted: this.getTypeLabel(sharedAccount.type),
      roleFormatted: this.getRoleLabel(sharedAccount.role)
    };
  }

  /**
   * Formater les données d'un utilisateur partagé pour l'affichage
   * @param {Object} sharedUser - Données de l'utilisateur partagé
   * @returns {Object} Utilisateur partagé formaté
   */
  formatSharedUser(sharedUser) {
    return {
      ...sharedUser,
      roleFormatted: this.getRoleLabel(sharedUser.role),
      displayName: `${sharedUser.prenom || ''} ${sharedUser.nom || ''}`.trim() || sharedUser.email
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
      crypto: 'Cryptomonnaie'
    };
    return labels[type] || type;
  }

  /**
   * Vérifier le rôle d'un utilisateur sur un compte
   * @param {number} accountId - ID du compte
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} { role: string|null, isOwner: boolean, canWrite: boolean }
   */
  async getUserRoleOnAccount(accountId, userId) {
    try {
      if (!accountId || !userId) {
        return { role: null, isOwner: false, canWrite: false };
      }

      // Récupérer les informations du compte
      const accountResult = await apiService.getAccountById(accountId);
      if (!accountResult || !accountResult.id_user) {
        return { role: null, isOwner: false, canWrite: false };
      }

      // Vérifier si l'utilisateur est propriétaire
      if (accountResult.id_user === userId) {
        return { role: 'proprietaire', isOwner: true, canWrite: true };
      }

      // Récupérer les utilisateurs partagés pour trouver le rôle
      const shareResult = await this.getSharedUsersByAccount(accountId);
      if (shareResult.success && shareResult.data) {
        const userShare = shareResult.data.find(user => user.id_user === userId);
        if (userShare) {
          const role = userShare.role?.toLowerCase().trim();
          const canWrite = ['contributeur', 'proprietaire'].includes(role);
          return { role, isOwner: false, canWrite };
        }
      }

      return { role: null, isOwner: false, canWrite: false };
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      return { role: null, isOwner: false, canWrite: false };
    }
  }

  /**
   * Obtenir le libellé d'un rôle
   * @param {string} role - Rôle de l'utilisateur
   * @returns {string} Libellé formaté
   */
  getRoleLabel(role) {
    const labels = {
      lecteur: 'Lecteur',
      contributeur: 'Contributeur',
      proprietaire: 'Propriétaire'
    };
    return labels[role] || role;
  }

  /**
   * Obtenir les rôles disponibles
   * @returns {Array} Liste des rôles disponibles
   */
  getAvailableRoles() {
    return [
      { value: 'lecteur', label: 'Lecteur - Lecture seule' },
      { value: 'contributeur', label: 'Contributeur - Peut modifier' },
      { value: 'proprietaire', label: 'Propriétaire - Accès complet' }
    ];
  }

  /**
   * Calculer les statistiques des comptes partagés
   * @param {Array} sharedAccounts - Liste des comptes partagés
   * @returns {Object} Statistiques calculées
   */
  calculateSharedStats(sharedAccounts) {
    if (!Array.isArray(sharedAccounts)) {
      return {
        total: 0,
        totalBalance: 0,
        averageBalance: 0,
        byRole: {}
      };
    }

    const stats = {
      total: sharedAccounts.length,
      totalBalance: 0,
      averageBalance: 0,
      byRole: {}
    };

    // Calcul du solde total et par rôle
    sharedAccounts.forEach(account => {
      const balance = parseFloat(account.solde) || 0;
      stats.totalBalance += balance;

      // Grouper par rôle
      if (!stats.byRole[account.role]) {
        stats.byRole[account.role] = {
          count: 0,
          total: 0
        };
      }
      stats.byRole[account.role].count += 1;
      stats.byRole[account.role].total += balance;
    });

    // Calcul de la moyenne
    stats.averageBalance = stats.total > 0 ? stats.totalBalance / stats.total : 0;

    return stats;
  }
}

// Export d'une instance unique du service
export default new SharedAccountsService();
