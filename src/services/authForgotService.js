import Api from '@/services/apiService'
import { API_CONFIG } from '@/config/api'

const { USERS } = API_CONFIG.ENDPOINTS

class AuthForgotService {
  async forgotPassword(email) {
    return Api.request(USERS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async resetPassword(token, newPassword) {
    return Api.request(USERS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    })
  }

  async requestOtp(email) {
    return Api.request(USERS.FORGOT_PASSWORD_OTP, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async resetWithOtp(email, code, newPassword) {
    return Api.request(USERS.RESET_PASSWORD_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword })
    })
  }
}

export default new AuthForgotService()


