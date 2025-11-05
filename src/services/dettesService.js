import Api from './apiService'

const BASE = '/dettes'

class DettesService {
  async getDettes() {
    return this.list()
  }
  async list() {
    return Api.request(BASE, { method: 'GET' })
  }
  async create(payload) {
    return Api.request(BASE, { method: 'POST', body: JSON.stringify(payload) })
  }
  async update(id, payload) {
    return Api.request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  }
  async remove(id) {
    return Api.request(`${BASE}/${id}`, { method: 'DELETE' })
  }

  // Aliases to match page usage
  async createDette(payload) {
    return this.create(payload)
  }
  async updateDette(id, payload) {
    return this.update(id, payload)
  }
  async deleteDette(id) {
    return this.remove(id)
  }
  async addRemboursement(id_dette, payload) {
    return Api.request(`${BASE}/${id_dette}/remboursements`, { method: 'POST', body: JSON.stringify(payload) })
  }

  async listRemboursements(id_dette) {
    return Api.request(`${BASE}/${id_dette}/remboursements`, { method: 'GET' })
  }
}

export default new DettesService()





