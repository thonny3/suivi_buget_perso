import Api from './apiService'
import { API_CONFIG } from '@/config/api'

const DASHBOARD = {
  SUMMARY: '/dashboard/summary'
}

class DashboardService {
  async getSummary() {
    return Api.request(DASHBOARD.SUMMARY, { method: 'GET' })
  }
}

export default new DashboardService()


