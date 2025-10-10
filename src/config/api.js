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
      RECOMMENDATIONS: '/ai/recommendations'
    }
  }
}
