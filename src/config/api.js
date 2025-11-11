export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.248:3002/api',
  ENDPOINTS: {
    USERS: {
      REGISTER: '/users/register',
      LOGIN: '/users/login',
      VERIFY: '/users/verify',
      FORGOT_PASSWORD: '/users/forgot-password',
      RESET_PASSWORD: '/users/reset-password',
      FORGOT_PASSWORD_OTP: '/users/forgot-password-otp',
      RESET_PASSWORD_OTP: '/users/reset-password-otp',
      LIST: '/users',
      UPDATE: (id) => `/users/${id}`,
      DELETE: (id) => `/users/${id}`
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
    },
    REVENUS: {
      LIST: '/revenus',
      CREATE: '/revenus',
      UPDATE: (id) => `/revenus/${id}`,
      DELETE: (id) => `/revenus/${id}`
    },
    CONTRIBUTIONS: {
      GET_BY_OBJECTIF: (objectifId) => `/contributions/${objectifId}`,
      CREATE: '/contributions'
    },
    OBJECTIFS: {
      LIST: '/objectifs',
      CREATE: '/objectifs',
      UPDATE: (id) => `/objectifs/${id}`,
      DELETE: (id) => `/objectifs/${id}`
    },
    ABONNEMENTS: {
      LIST_BY_USER: (userId, includeInactive = false) => `/abonnements/${userId}?includeInactive=${includeInactive}`,
      CREATE: '/abonnements',
      UPDATE: (id) => `/abonnements/${id}`,
      DELETE: (id) => `/abonnements/${id}`,
      RENEW: '/abonnements/renew',
      SET_ACTIVE: (id) => `/abonnements/${id}/active`
    },
    TRANSFERTS: {
      COMPTE_VERS_OBJECTIF: '/transferts/compte-vers-objectif',
      OBJECTIF_VERS_COMPTE: '/transferts/objectif-vers-compte',
      COMPTE_VERS_COMPTE: '/transferts/compte-vers-compte',
      HISTORIQUE: '/transferts/historique'
    },
    AI: {
      INSIGHTS: '/ai/insights',
      PREDICT: '/ai/predict',
      RECOMMENDATIONS: '/ai/recommendations',
      CHAT: '/ai/chat'
    },
    ALERT_THRESHOLDS: {
      LIST_BY_USER: (userId) => `/alert-thresholds/${userId}`,
      GET_ONE: (userId, domain) => `/alert-thresholds/${userId}/${domain}`,
      UPSERT: '/alert-thresholds',
      DELETE_ONE: (userId, domain) => `/alert-thresholds/${userId}/${domain}`
    }
  }
}
