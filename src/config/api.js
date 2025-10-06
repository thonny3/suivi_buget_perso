export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    USERS: {
      REGISTER: '/users/register',
      LOGIN: '/users/login',
      VERIFY: '/users/verify'
    },
    ACCOUNTS: {
      LIST: '/comptes',
      MY_ACCOUNTS: '/comptes/mycompte/user',
      GET_BY_ID: (id) => `/comptes/${id}`,
      CREATE: '/comptes',
      UPDATE: (id) => `/comptes/${id}`,
      DELETE: (id) => `/comptes/${id}`
    },
    SHARED_ACCOUNTS: {
      SHARE: '/comptes-partages',
      GET_BY_USER: (userId) => `/comptes-partages/user/${userId}`,
      GET_BY_ACCOUNT: (accountId) => `/comptes-partages/compte/${accountId}`,
      UPDATE_ROLE: (shareId) => `/comptes-partages/${shareId}`,
      DELETE: (shareId) => `/comptes-partages/${shareId}`
    },
    DEPENSES: {
      LIST: '/depenses',
      CREATE: '/depenses',
      UPDATE: (id) => `/depenses/${id}`,
      DELETE: (id) => `/depenses/${id}`
    }
  }
}
