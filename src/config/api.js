export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    USERS: {
      REGISTER: '/users/register',
      LOGIN: '/users/login',
      VERIFY: '/users/verify'
    }
  }
}
