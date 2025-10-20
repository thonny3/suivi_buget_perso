import Api from '@/services/apiService'
import { API_CONFIG } from '@/config/api'

const BASE = API_CONFIG.ENDPOINTS.USERS

class AdminUsersService {
  async list() {
    return Api.request(BASE.LIST || '/users', { method: 'GET' })
  }

  async setActive(userId, actif) {
    return Api.request((BASE.UPDATE || ((id)=>`/users/${id}`))(userId), {
      method: 'PUT',
      body: JSON.stringify({ actif })
    })
  }

  async delete(userId) {
    return Api.request((BASE.DELETE || ((id)=>`/users/${id}`))(userId), {
      method: 'DELETE'
    })
  }
}

export default new AdminUsersService()


