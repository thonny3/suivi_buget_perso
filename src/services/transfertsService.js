import apiService from './apiService'
import { API_CONFIG } from '@/config/api'

class TransfertsService {
  async compteVersObjectif({ id_compte, id_objectif, montant }) {
    return apiService.request(API_CONFIG.ENDPOINTS.TRANSFERTS.COMPTE_VERS_OBJECTIF, {
      method: 'POST',
      body: JSON.stringify({ id_compte, id_objectif, montant })
    })
  }

  async objectifVersCompte({ id_compte, id_objectif, montant }) {
    return apiService.request(API_CONFIG.ENDPOINTS.TRANSFERTS.OBJECTIF_VERS_COMPTE, {
      method: 'POST',
      body: JSON.stringify({ id_compte, id_objectif, montant })
    })
  }

  async compteVersCompte({ id_compte_source, id_compte_cible, montant }) {
    return apiService.request(API_CONFIG.ENDPOINTS.TRANSFERTS.COMPTE_VERS_COMPTE, {
      method: 'POST',
      body: JSON.stringify({ id_compte_source, id_compte_cible, montant })
    })
  }

  async historique({ limit = 50 } = {}) {
    const url = `${API_CONFIG.ENDPOINTS.TRANSFERTS.HISTORIQUE}?limit=${limit}`
    return apiService.request(url, { method: 'GET' })
  }
}

export default new TransfertsService()


