import Api from './apiService'

const BASE = '/investissements'

class InvestissementsService {
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

  async listRevenus(id_investissement) {
    return Api.request(`${BASE}/${id_investissement}/revenus`, { method: 'GET' })
  }
  async addRevenu(id_investissement, payload) {
    return Api.request(`${BASE}/${id_investissement}/revenus`, { method: 'POST', body: JSON.stringify(payload) })
  }

  async listDepenses(id_investissement) {
    return Api.request(`${BASE}/${id_investissement}/depenses`, { method: 'GET' })
  }
  async addDepense(id_investissement, payload) {
    return Api.request(`${BASE}/${id_investissement}/depenses`, { method: 'POST', body: JSON.stringify(payload) })
  }
}

export default new InvestissementsService()


