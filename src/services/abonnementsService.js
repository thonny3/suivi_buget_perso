import apiService from './apiService'
import { API_CONFIG } from '@/config/api'

class AbonnementsService {
  async listByUser(userId, { includeInactive = false } = {}) {
    return apiService.request(API_CONFIG.ENDPOINTS.ABONNEMENTS.LIST_BY_USER(userId, includeInactive), { method: 'GET' })
  }

  async create(payload) {
    // payload: { id_user, nom, montant, frequence|fréquence, prochaine_echeance, rappel, icon?, couleur? }
    return apiService.request(API_CONFIG.ENDPOINTS.ABONNEMENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async update(id, payload) {
    return apiService.request(API_CONFIG.ENDPOINTS.ABONNEMENTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async remove(id) {
    return apiService.request(API_CONFIG.ENDPOINTS.ABONNEMENTS.DELETE(id), { method: 'DELETE' })
  }

  async renew({ id_abonnement, id_compte }) {
    return apiService.request(API_CONFIG.ENDPOINTS.ABONNEMENTS.RENEW, {
      method: 'POST',
      body: JSON.stringify({ id_abonnement, id_compte })
    })
  }

  async setActive(id, actif) {
    return apiService.request(API_CONFIG.ENDPOINTS.ABONNEMENTS.SET_ACTIVE(id), {
      method: 'PATCH',
      body: JSON.stringify({ actif: !!actif })
    })
  }
}

export default new AbonnementsService()


