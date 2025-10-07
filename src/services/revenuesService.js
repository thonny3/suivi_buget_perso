import apiService from './apiService'

class RevenuesService {
  async getRevenues() {
    return apiService.request('/revenus', { method: 'GET' })
  }

  async createRevenue(revenueData) {
    return apiService.request('/revenus', {
      method: 'POST',
      body: JSON.stringify(revenueData),
    })
  }

  async updateRevenue(id, revenueData) {
    return apiService.request(`/revenus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(revenueData),
    })
  }

  async deleteRevenue(id) {
    return apiService.request(`/revenus/${id}`, { method: 'DELETE' })
  }

  async getRevenueCategories() {
    return apiService.request('/categories/revenues', { method: 'GET' })
  }

  async getMyComptes() {
    return apiService.request('/comptes/mycompte/user', { method: 'GET' })
  }
}

export default new RevenuesService()


