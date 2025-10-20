import Api from '@/services/apiService'

class AdminStatsService {
  async getAdminStats() {
    try {
      // Utiliser le nouvel endpoint backend pour récupérer toutes les statistiques
      const data = await Api.request('/admin/stats', { method: 'GET' })
      
      // Le backend retourne déjà toutes les données formatées
      return {
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        inactiveUsers: data.inactiveUsers || 0,
        totalCategoriesDepenses: data.totalCategoriesDepenses || 0,
        totalCategoriesRevenus: data.totalCategoriesRevenus || 0,
        totalCategories: data.totalCategories || 0,
        usersByRole: data.usersByRole || {},
        recentUsers: data.recentUsers || [],
        // Statistiques supplémentaires du backend
        totalRevenus: data.totalRevenus || 0,
        totalDepenses: data.totalDepenses || 0,
        totalComptes: data.totalComptes || 0,
        totalObjectifs: data.totalObjectifs || 0,
        userActivationRate: data.userActivationRate || 0,
        platformBalance: data.platformBalance || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques admin:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalCategoriesDepenses: 0,
        totalCategoriesRevenus: 0,
        totalCategories: 0,
        usersByRole: {},
        recentUsers: [],
        totalRevenus: 0,
        totalDepenses: 0,
        totalComptes: 0,
        totalObjectifs: 0,
        userActivationRate: 0,
        platformBalance: 0
      }
    }
  }

  // Méthode pour récupérer tous les utilisateurs (si nécessaire)
  async getAllUsers() {
    try {
      return await Api.request('/admin/users', { method: 'GET' })
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return []
    }
  }
}

export default new AdminStatsService()
