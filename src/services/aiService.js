import Api from './apiService'
import { API_CONFIG } from '@/config/api'

const { AI } = API_CONFIG.ENDPOINTS

class AiService {
  async getInsights() {
    return Api.request(AI.INSIGHTS, { method: 'GET' })
  }
  async getPrediction() {
    return Api.request(AI.PREDICT, { method: 'GET' })
  }
  async getRecommendations() {
    return Api.request(AI.RECOMMENDATIONS, { method: 'GET' })
  }
}

export default new AiService()


