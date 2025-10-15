import Api from './apiService'
import aiService from './aiService'
import { API_CONFIG } from '@/config/api'
import aiModelService from './aiModelService'

class ChatbotService {
  // Analyser l'intention de l'utilisateur pour l'application de budget
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase()
    
    // Intentions spécifiques à l'application de budget
    if (lowerMessage.includes('budget') || lowerMessage.includes('limite') || lowerMessage.includes('plafond')) {
      return 'budget'
    }
    if (lowerMessage.includes('dépense') || lowerMessage.includes('dépenses') || lowerMessage.includes('argent') || lowerMessage.includes('sortie')) {
      return 'expenses'
    }
    if (lowerMessage.includes('revenu') || lowerMessage.includes('revenus') || lowerMessage.includes('entrée') || lowerMessage.includes('entrées') || lowerMessage.includes('salaire') || lowerMessage.includes('salaires')) {
      return 'revenues'
    }
    if (lowerMessage.includes('recommandation') || lowerMessage.includes('conseil') || lowerMessage.includes('aide') || lowerMessage.includes('optimiser')) {
      return 'recommendations'
    }
    if (lowerMessage.includes('prévision') || lowerMessage.includes('prédiction') || lowerMessage.includes('futur') || lowerMessage.includes('prochain')) {
      return 'prediction'
    }
    if (lowerMessage.includes('catégorie') || lowerMessage.includes('catégories') || lowerMessage.includes('type')) {
      return 'categories'
    }
    if (lowerMessage.includes('total') || lowerMessage.includes('somme') || lowerMessage.includes('montant') || lowerMessage.includes('bilan')) {
      return 'summary'
    }
    if (lowerMessage.includes('compte') || lowerMessage.includes('comptes') || lowerMessage.includes('portefeuille')) {
      return 'accounts'
    }
    if (lowerMessage.includes('objectif') || lowerMessage.includes('objectifs') || lowerMessage.includes('épargne')) {
      return 'goals'
    }
    if (lowerMessage.includes('transfert') || lowerMessage.includes('transferts') || lowerMessage.includes('virement')) {
      return 'transfers'
    }
    if (lowerMessage.includes('dette') || lowerMessage.includes('dettes') || lowerMessage.includes('remboursement')) {
      return 'debts'
    }
    
    return 'general'
  }

  // Générer une réponse basée sur l'intention et les données de l'application
  async generateResponse(message, intent) {
    try {
      switch (intent) {
        case 'budget':
          return await this.handleBudgetQuery(message)
        
        case 'expenses':
          return await this.handleExpensesQuery(message)
        
        case 'revenues':
          return await this.handleRevenuesQuery(message)
        
        case 'recommendations':
          return await this.handleRecommendationsQuery(message)
        
        case 'prediction':
          return await this.handlePredictionQuery(message)
        
        case 'categories':
          return await this.handleCategoriesQuery(message)
        
        case 'summary':
          return await this.handleSummaryQuery(message)
        
        case 'accounts':
          return await this.handleAccountsQuery(message)
        
        case 'goals':
          return await this.handleGoalsQuery(message)
        
        case 'transfers':
          return await this.handleTransfersQuery(message)
        
        case 'debts':
          return await this.handleDebtsQuery(message)
        
        default:
          return this.handleGeneralQuery(message)
      }
    } catch (error) {
      console.error('Erreur génération réponse chatbot:', error)
      return "Désolé, je rencontre un problème technique avec vos données financières. Pouvez-vous reformuler votre question ?"
    }
  }

  async handleBudgetQuery(message) {
    const insights = await aiService.getInsights()
    const avgMonthly = insights.avgMonthly || 0
    
    return `📊 **Votre situation budgétaire :**
    
• Dépenses totales : ${insights.total?.toFixed(2) || 0}€
• Moyenne mensuelle : ${avgMonthly.toFixed(2)}€
• Top catégorie : ${insights.topCategories?.[0]?.categorie || 'N/A'} (${insights.topCategories?.[0]?.total?.toFixed(2) || 0}€)

💡 **Conseil budget :** Je recommande de fixer une limite mensuelle de ${(avgMonthly * 0.9).toFixed(2)}€ pour mieux contrôler vos dépenses.`
  }

  async handleExpensesQuery(message) {
    try {
      const insights = await aiService.getInsights()
      
      if (!insights.topCategories || insights.topCategories.length === 0) {
        return "📈 **Vos dépenses :** Aucune donnée de dépenses trouvée. Commencez par ajouter quelques transactions pour que je puisse vous donner des insights !"
      }

      const lowerMessage = message.toLowerCase()
      
      // Réponse spécifique selon la question
      if (lowerMessage.includes('catégorie') || lowerMessage.includes('catégories') || lowerMessage.includes('type') || lowerMessage.includes('types')) {
        return `📊 **Catégories de dépenses :**
        
${insights.topCategories.map((cat, index) => `${index + 1}. **${cat.categorie}** : ${cat.total.toFixed(2)}€`).join('\n')}

💰 **Total dépensé :** ${insights.total?.toFixed(2) || 0}€`
      }
      
      if (lowerMessage.includes('total') || lowerMessage.includes('somme') || lowerMessage.includes('montant')) {
        return `💰 **Total de vos dépenses :**
        
• **Montant total :** ${insights.total?.toFixed(2) || 0}€
• **Moyenne mensuelle :** ${insights.avgMonthly?.toFixed(2) || 0}€
• **Nombre de catégories :** ${insights.topCategories.length}`
      }
      
      if (lowerMessage.includes('liste') || lowerMessage.includes('détail') || lowerMessage.includes('tout')) {
        return `📋 **Liste complète des catégories de dépenses :**
        
${insights.topCategories.map((cat, index) => `${index + 1}. **${cat.categorie}** : ${cat.total.toFixed(2)}€`).join('\n')}

💰 **Total dépensé :** ${insights.total?.toFixed(2) || 0}€`
      }

      // Réponse par défaut
      let response = "📈 **Analyse de vos dépenses :**\n\n"
      
      insights.topCategories.forEach((cat, index) => {
        response += `${index + 1}. **${cat.categorie}** : ${cat.total.toFixed(2)}€\n`
      })
      
      response += `\n💡 **Total dépensé :** ${insights.total?.toFixed(2) || 0}€`
      
      return response
    } catch (error) {
      console.error('Erreur récupération dépenses:', error)
      return "Désolé, je n'arrive pas à récupérer vos dépenses. Vérifiez que vous êtes connecté et que l'API fonctionne."
    }
  }

  async handleRecommendationsQuery(message) {
    const recommendations = await aiService.getRecommendations()
    
    if (!recommendations.recommendations || recommendations.recommendations.length === 0) {
      return "💡 **Recommandations :** Ajoutez plus de données de dépenses pour recevoir des recommandations personnalisées !"
    }

    let response = "💡 **Mes recommandations pour vous :**\n\n"
    
    recommendations.recommendations.forEach((rec, index) => {
      response += `${index + 1}. ${rec.message}\n`
    })
    
    return response
  }

  async handlePredictionQuery(message) {
    const prediction = await aiService.getPrediction()
    
    return `🔮 **Prévision du prochain mois :**
    
• Montant prévu : ${prediction.prediction?.toFixed(2) || 0}€
• Niveau de confiance : ${Math.round((prediction.confidence || 0) * 100)}%

${prediction.confidence > 0.7 ? '✅ Prévision fiable basée sur votre historique' : '⚠️ Prévision peu fiable - ajoutez plus de données'}`
  }

  async handleCategoriesQuery(message) {
    const insights = await aiService.getInsights()
    
    if (!insights.topCategories || insights.topCategories.length === 0) {
      return "📊 **Catégories :** Aucune catégorie de dépenses trouvée. Ajoutez des transactions pour voir l'analyse par catégorie !"
    }

    let response = "📊 **Vos catégories de dépenses :**\n\n"
    
    insights.topCategories.forEach((cat, index) => {
      const percentage = ((cat.total / insights.total) * 100).toFixed(1)
      response += `${index + 1}. **${cat.categorie}** : ${cat.total.toFixed(2)}€ (${percentage}%)\n`
    })
    
    return response
  }

  async handleSummaryQuery(message) {
    const insights = await aiService.getInsights()
    
    return `📋 **Résumé de votre situation financière :**
    
💰 **Dépenses totales :** ${insights.total?.toFixed(2) || 0}€
📅 **Moyenne mensuelle :** ${insights.avgMonthly?.toFixed(2) || 0}€
🏆 **Catégorie principale :** ${insights.topCategories?.[0]?.categorie || 'N/A'}

${insights.topCategories?.length > 0 ? `📊 **Top 3 catégories :**\n${insights.topCategories.slice(0, 3).map((cat, i) => `${i + 1}. ${cat.categorie}: ${cat.total.toFixed(2)}€`).join('\n')}` : ''}`
  }

  // Nouvelles méthodes pour les fonctionnalités de l'application
  async handleRevenuesQuery(message) {
    try {
      const revenues = await Api.request(API_CONFIG.ENDPOINTS.REVENUS.LIST, { method: 'GET' })
      
      if (!revenues || revenues.length === 0) {
        return `💰 **Vos revenus :**
        
Aucun revenu enregistré pour le moment.

💡 **Conseil :** Commencez par ajouter vos revenus (salaire, freelance, etc.) pour avoir une vue complète de vos finances !`
      }
      
      const totalRevenues = revenues.reduce((sum, rev) => sum + (Number(rev.montant) || 0), 0)
      const lowerMessage = message.toLowerCase()
      
      // Réponse spécifique selon la question
      if (lowerMessage.includes('catégorie') || lowerMessage.includes('catégories') || lowerMessage.includes('type') || lowerMessage.includes('types')) {
        // Grouper par catégorie de revenus
        const categories = {}
        revenues.forEach(rev => {
          const cat = rev.categorie_nom || 'Non catégorisé'
          categories[cat] = (categories[cat] || 0) + Number(rev.montant || 0)
        })
        
        return `📊 **Catégories de revenus :**
        
${Object.entries(categories).map(([cat, total]) => `• **${cat}** : ${total.toFixed(2)}€`).join('\n')}

💰 **Total par catégorie :** ${Object.values(categories).reduce((sum, val) => sum + val, 0).toFixed(2)}€`
      }
      
      if (lowerMessage.includes('total') || lowerMessage.includes('somme') || lowerMessage.includes('montant')) {
        return `💰 **Total de vos revenus :**
        
• **Montant total :** ${totalRevenues.toFixed(2)}€
• **Nombre de revenus :** ${revenues.length}
• **Moyenne par revenu :** ${revenues.length > 0 ? (totalRevenues / revenues.length).toFixed(2) : 0}€`
      }
      
      if (lowerMessage.includes('liste') || lowerMessage.includes('détail') || lowerMessage.includes('tout')) {
        return `📋 **Liste complète de vos revenus :**
        
${revenues.map((rev, index) => `${index + 1}. **${rev.source || 'Revenu'}** : ${Number(rev.montant || 0).toFixed(2)}€${rev.date_revenu ? ` (${new Date(rev.date_revenu).toLocaleDateString('fr-FR')})` : ''}`).join('\n')}

💰 **Total :** ${totalRevenues.toFixed(2)}€`
      }
      
      // Réponse par défaut
      return `💰 **Vos revenus :**
      
• Total des revenus : ${totalRevenues.toFixed(2)}€
• Nombre de revenus : ${revenues.length}
• Moyenne par revenu : ${revenues.length > 0 ? (totalRevenues / revenues.length).toFixed(2) : 0}€

${revenues.length > 0 ? `📊 **Détail récent :**\n${revenues.slice(0, 3).map(rev => `• ${rev.source || 'Revenu'}: ${Number(rev.montant || 0).toFixed(2)}€`).join('\n')}` : ''}

💡 **Conseil :** Gardez une trace de tous vos revenus pour mieux planifier votre budget !`
    } catch (error) {
      console.error('Erreur récupération revenus:', error)
      return "Désolé, je n'arrive pas à récupérer vos revenus. Vérifiez que vous êtes connecté et que l'API fonctionne."
    }
  }

  async handleAccountsQuery(message) {
    try {
      const accounts = await Api.request(API_CONFIG.ENDPOINTS.ACCOUNTS.LIST, { method: 'GET' })
      
      if (!accounts || accounts.length === 0) {
        return `🏦 **Vos comptes :**
        
Aucun compte enregistré pour le moment.

💡 **Conseil :** Créez votre premier compte (compte courant, épargne, etc.) pour commencer à gérer vos finances !`
      }
      
      const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.solde) || 0), 0)
      
      return `🏦 **Vos comptes :**
      
• Nombre de comptes : ${accounts.length}
• Solde total : ${totalBalance.toFixed(2)}€
• Comptes actifs : ${accounts.filter(acc => Number(acc.solde) > 0).length}

${accounts.length > 0 ? `📊 **Détail :**\n${accounts.map(acc => `• ${acc.nom}: ${Number(acc.solde || 0).toFixed(2)}€`).join('\n')}` : ''}`
    } catch (error) {
      console.error('Erreur récupération comptes:', error)
      return "Désolé, je n'arrive pas à récupérer vos comptes. Vérifiez que vous êtes connecté et que l'API fonctionne."
    }
  }

  async handleGoalsQuery(message) {
    try {
      const goals = await Api.request(API_CONFIG.ENDPOINTS.OBJECTIFS.LIST, { method: 'GET' })
      
      if (!goals || goals.length === 0) {
        return `🎯 **Vos objectifs financiers :**
        
Aucun objectif défini pour le moment.

💡 **Conseil :** Créez vos premiers objectifs d'épargne (vacances, achat, urgence) pour mieux planifier vos finances !`
      }
      
      const totalGoals = goals.reduce((sum, goal) => sum + (Number(goal.montant_cible) || 0), 0)
      const totalSaved = goals.reduce((sum, goal) => sum + (Number(goal.montant_actuel) || 0), 0)
      
      return `🎯 **Vos objectifs financiers :**
      
• Nombre d'objectifs : ${goals.length}
• Montant total cible : ${totalGoals.toFixed(2)}€
• Montant déjà épargné : ${totalSaved.toFixed(2)}€
• Progression globale : ${totalGoals > 0 ? ((totalSaved / totalGoals) * 100).toFixed(1) : 0}%

${goals.length > 0 ? `📈 **Détail :**\n${goals.slice(0, 3).map(goal => `• ${goal.nom}: ${Number(goal.montant_actuel || 0).toFixed(2)}€ / ${Number(goal.montant_cible || 0).toFixed(2)}€`).join('\n')}` : ''}`
    } catch (error) {
      console.error('Erreur récupération objectifs:', error)
      return "Désolé, je n'arrive pas à récupérer vos objectifs. Vérifiez que vous êtes connecté et que l'API fonctionne."
    }
  }

  async handleTransfersQuery(message) {
    try {
      const transfers = await Api.request(API_CONFIG.ENDPOINTS.TRANSFERTS.HISTORIQUE, { method: 'GET' })
      
      if (!transfers || transfers.length === 0) {
        return `🔄 **Vos transferts :**
        
Aucun transfert enregistré pour le moment.

💡 **Conseil :** Utilisez les transferts pour déplacer de l'argent entre vos comptes ou vers vos objectifs d'épargne !`
      }
      
      return `🔄 **Vos transferts récents :**
      
• Nombre de transferts : ${transfers.length}
• Derniers mouvements : ${transfers.slice(0, 3).map(t => `\n• ${t.type || 'Transfert'}: ${Number(t.montant || 0).toFixed(2)}€`).join('')}

💡 **Conseil :** Les transferts vous aident à optimiser la répartition de vos fonds entre comptes et objectifs.`
    } catch (error) {
      console.error('Erreur récupération transferts:', error)
      return "Désolé, je n'arrive pas à récupérer vos transferts. Vérifiez que vous êtes connecté et que l'API fonctionne."
    }
  }

  async handleDebtsQuery(message) {
    try {
      const debts = await Api.request(API_CONFIG.ENDPOINTS.DETTES?.LIST || '/dettes', { method: 'GET' })
      
      if (!debts || debts.length === 0) {
        return `💳 **Vos dettes :**
        
Aucune dette enregistrée pour le moment.

💡 **Conseil :** C'est parfait ! Continuez à gérer vos finances sans dettes pour maintenir une situation saine.`
      }
      
      const totalDebts = debts.reduce((sum, debt) => sum + (Number(debt.montant) || 0), 0)
      
      return `💳 **Vos dettes :**
      
• Nombre de dettes : ${debts.length}
• Montant total dû : ${totalDebts.toFixed(2)}€
• Dettes en cours : ${debts.filter(d => d.statut === 'en_cours').length}

${debts.length > 0 ? `📋 **Détail :**\n${debts.slice(0, 3).map(debt => `• ${debt.description || 'Dette'}: ${Number(debt.montant || 0).toFixed(2)}€`).join('\n')}` : ''}

💡 **Conseil :** Priorisez le remboursement des dettes à taux élevé pour optimiser vos finances.`
    } catch (error) {
      console.error('Erreur récupération dettes:', error)
      return "Désolé, je n'arrive pas à récupérer vos dettes. Vérifiez que vous êtes connecté et que l'API fonctionne."
    }
  }

  handleGeneralQuery(message) {
    const responses = [
      "Bonjour ! Je suis votre assistant spécialisé dans la gestion de budget MyJalako. Je peux vous aider avec vos dépenses, revenus, comptes, objectifs, et transferts !",
      "Comment puis-je vous aider avec votre budget aujourd'hui ? Je connais parfaitement votre application MyJalako !",
      "Je suis votre assistant financier personnel ! Posez-moi des questions sur vos dépenses, revenus, comptes, ou objectifs d'épargne.",
      "Parlez-moi de vos finances ! Je peux analyser vos données MyJalako et vous donner des conseils personnalisés basés sur vos vraies transactions.",
      "Que souhaitez-vous savoir sur votre budget ? Je peux vous parler de vos dépenses, revenus, comptes, objectifs, transferts, ou dettes !"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Méthode principale pour traiter un message avec IA dynamique
  async processMessage(message) {
    try {
      // Récupérer toutes les données de l'utilisateur
      const userData = await this.gatherUserData()
      
      // Utiliser le modèle IA pour générer une réponse dynamique
      const aiResponse = await aiModelService.generateResponse(message, userData)
      
      return aiResponse
    } catch (error) {
      console.error('Erreur traitement message IA:', error)
      
      // Fallback vers l'ancien système si l'IA échoue
      const intent = this.analyzeIntent(message)
      return await this.generateResponse(message, intent)
    }
  }

  // Rassembler toutes les données utilisateur pour le contexte IA
  async gatherUserData() {
    try {
      const [insights, revenues, accounts, goals, expenses] = await Promise.all([
        aiService.getInsights().catch(() => ({})),
        Api.request(API_CONFIG.ENDPOINTS.REVENUS.LIST, { method: 'GET' }).catch(() => []),
        Api.request(API_CONFIG.ENDPOINTS.ACCOUNTS.LIST, { method: 'GET' }).catch(() => []),
        Api.request(API_CONFIG.ENDPOINTS.OBJECTIFS.LIST, { method: 'GET' }).catch(() => []),
        Api.request(API_CONFIG.ENDPOINTS.DEPENSES.LIST, { method: 'GET' }).catch(() => [])
      ])

      return {
        insights,
        revenues: {
          data: revenues,
          total: revenues.reduce((sum, rev) => sum + (Number(rev.montant) || 0), 0),
          length: revenues.length
        },
        accounts: {
          data: accounts,
          total: accounts.reduce((sum, acc) => sum + (Number(acc.solde) || 0), 0),
          length: accounts.length
        },
        goals: {
          data: goals,
          total: goals.reduce((sum, goal) => sum + (Number(goal.montant_cible) || 0), 0),
          saved: goals.reduce((sum, goal) => sum + (Number(goal.montant_actuel) || 0), 0),
          length: goals.length
        },
        expenses: {
          data: expenses,
          total: insights.total || 0,
          avgMonthly: insights.avgMonthly || 0,
          categories: insights.topCategories || []
        },
        budget: {
          monthly: insights.avgMonthly || 0
        }
      }
    } catch (error) {
      console.error('Erreur récupération données utilisateur:', error)
      return {}
    }
  }
}

export default new ChatbotService()
