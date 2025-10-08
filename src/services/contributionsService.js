import api from './apiService'
import { API_CONFIG } from '@/config/api'

const { CONTRIBUTIONS } = API_CONFIG.ENDPOINTS

const contributionsService = {
  async listByObjectif(objectifId) {
    return api.request(CONTRIBUTIONS.GET_BY_OBJECTIF(objectifId), { method: 'GET' })
  },

  async create(payload) {
    return api.request(CONTRIBUTIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export default contributionsService


