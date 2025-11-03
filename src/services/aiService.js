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
  async chat(message, context = '') {
    return Api.request(AI.CHAT, {
      method: 'POST',
      body: JSON.stringify({ message, context })
    })
  }
}

export default new AiService()


