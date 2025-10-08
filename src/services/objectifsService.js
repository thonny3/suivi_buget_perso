import api from './apiService'
import { API_CONFIG } from '@/config/api'

const { OBJECTIFS } = API_CONFIG.ENDPOINTS

const objectifsService = {
  async list() {
    return api.request(OBJECTIFS.LIST, { method: 'GET' })
  },

  async create(payload) {
    return api.request(OBJECTIFS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async update(id, payload) {
    return api.request(OBJECTIFS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async remove(id) {
    return api.request(OBJECTIFS.DELETE(id), {
      method: 'DELETE',
    })
  },
}

export default objectifsService


