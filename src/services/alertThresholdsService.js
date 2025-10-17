import api from './apiService'

const BASE = '/alert-thresholds'

const alertThresholdsService = {
  async listByUser(userId) {
    return api.request(`${BASE}/${userId}`, { method: 'GET' })
  },
  async getOne(userId, domain) {
    return api.request(`${BASE}/${userId}/${domain}`, { method: 'GET' })
  },
  async upsert({ id_user, domain, value, info }) {
    return api.request(`${BASE}`, {
      method: 'POST',
      body: JSON.stringify({ id_user, domain, value, info })
    })
  },
  async remove(userId, domain) {
    return api.request(`${BASE}/${userId}/${domain}`, { method: 'DELETE' })
  }
}

export default alertThresholdsService


