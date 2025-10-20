import Api from '@/services/apiService'

class AdminCategoriesService {
  async listRevenus() {
    return Api.request('/categories/revenues', { method: 'GET' })
  }
  async addRevenu(nom) {
    return Api.request('/categories/revenues', {
      method: 'POST',
      body: JSON.stringify({ nom })
    })
  }
  async deleteRevenu(id) {
    return Api.request(`/categories/revenues/${id}`, { method: 'DELETE' })
  }
  async updateRevenu(id, nom) {
    return Api.request(`/categories/revenues/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nom })
    })
  }

  async listDepenses() {
    return Api.request('/categories/depenses', { method: 'GET' })
  }
  async addDepense(nom) {
    return Api.request('/categories/depenses', {
      method: 'POST',
      body: JSON.stringify({ nom })
    })
  }
  async deleteDepense(id) {
    return Api.request(`/categories/depenses/${id}`, { method: 'DELETE' })
  }
  async updateDepense(id, nom) {
    return Api.request(`/categories/depenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nom })
    })
  }
}

export default new AdminCategoriesService()


