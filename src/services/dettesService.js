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
}

export default new DettesService()





