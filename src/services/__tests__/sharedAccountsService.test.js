/**
 * Tests unitaires pour le service des comptes partagés
 */

import sharedAccountsService from '../sharedAccountsService';

describe('SharedAccountsService', () => {
  describe('formatSharedAccount', () => {
    it('should format a shared account correctly', () => {
      const mockAccount = {
        id: 1,
        nom: 'Compte Test',
        type: 'courant',
        solde: 1000.50,
        role: 'lecteur'
      };

      const formatted = sharedAccountsService.formatSharedAccount(mockAccount);

      expect(formatted).toHaveProperty('solde', 1000.50);
      expect(formatted).toHaveProperty('typeFormatted', 'Compte Courant');
      expect(formatted).toHaveProperty('roleFormatted', 'Lecteur');
      expect(formatted).toHaveProperty('soldeFormatted');
    });
  });

  describe('formatSharedUser', () => {
    it('should format a shared user correctly', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        nom: 'Doe',
        prenom: 'John',
        role: 'contributeur'
      };

      const formatted = sharedAccountsService.formatSharedUser(mockUser);

      expect(formatted).toHaveProperty('displayName', 'John Doe');
      expect(formatted).toHaveProperty('roleFormatted', 'Contributeur');
    });
  });

  describe('getRoleLabel', () => {
    it('should return correct role labels', () => {
      expect(sharedAccountsService.getRoleLabel('lecteur')).toBe('Lecteur');
      expect(sharedAccountsService.getRoleLabel('contributeur')).toBe('Contributeur');
      expect(sharedAccountsService.getRoleLabel('proprietaire')).toBe('Propriétaire');
    });
  });

  describe('calculateSharedStats', () => {
    it('should calculate statistics correctly', () => {
      const mockAccounts = [
        { solde: 1000, role: 'lecteur' },
        { solde: 2000, role: 'contributeur' },
        { solde: 500, role: 'lecteur' }
      ];

      const stats = sharedAccountsService.calculateSharedStats(mockAccounts);

      expect(stats.total).toBe(3);
      expect(stats.totalBalance).toBe(3500);
      expect(stats.averageBalance).toBe(1166.67);
      expect(stats.byRole.lecteur.count).toBe(2);
      expect(stats.byRole.contributeur.count).toBe(1);
    });

    it('should handle empty array', () => {
      const stats = sharedAccountsService.calculateSharedStats([]);

      expect(stats.total).toBe(0);
      expect(stats.totalBalance).toBe(0);
      expect(stats.averageBalance).toBe(0);
    });
  });
});
