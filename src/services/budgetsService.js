import apiService from './apiService'

class BudgetsService {
  async getBudgets() {
    return apiService.request('/budgets', { method: 'GET' })
  }

  async createBudget(data) {
    return apiService.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBudget(id_budget, data) {
    return apiService.request(`/budgets/${id_budget}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBudget(id_budget) {
    return apiService.request(`/budgets/${id_budget}`, { method: 'DELETE' })
  }
}

export default new BudgetsService()


