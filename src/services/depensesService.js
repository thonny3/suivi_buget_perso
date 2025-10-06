import apiService from './apiService'

class DepensesService {
  async getDepenses() {
    return apiService.request('/depenses', { method: 'GET' })
  }

  async createDepense(depenseData) {
    return apiService.request('/depenses', {
      method: 'POST',
      body: JSON.stringify(depenseData),
    })
  }

  async updateDepense(id, depenseData) {
    return apiService.request(`/depenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(depenseData),
    })
  }

  async deleteDepense(id) {
    return apiService.request(`/depenses/${id}`, { method: 'DELETE' })
  }

  async getDepenseCategories() {
    return apiService.request('/categories/depenses', { method: 'GET' })
  }

  async getMyComptes() {
    return apiService.request('/comptes/mycompte/user', { method: 'GET' })
  }
}

export default new DepensesService()


