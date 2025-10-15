// Service pour utiliser un modèle IA gratuit via Hugging Face
class AIModelService {
  constructor() {
    this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'
    this.apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || ''
    this.fallbackService = null
  }

  // Initialiser le service de fallback
  async initFallback() {
    if (!this.fallbackService) {
      const { default: AlternativeAIService } = await import('./alternativeAIService')
      this.fallbackService = AlternativeAIService
    }
  }

  // Préparer le contexte avec les données de l'utilisateur
  prepareContext(userData) {
    const context = {
      budget: userData.budget || {},
      expenses: userData.expenses || [],
      revenues: userData.revenues || [],
      accounts: userData.accounts || [],
      goals: userData.goals || [],
      insights: userData.insights || {}
    }

    return `Contexte financier de l'utilisateur:
- Budget mensuel: ${context.budget.monthly || 'Non défini'}
- Total dépenses: ${context.expenses.total || 0}€
- Total revenus: ${context.revenues.total || 0}€
- Nombre de comptes: ${context.accounts.length}
- Objectifs: ${context.goals.length} objectifs définis
- Catégories principales: ${context.insights.topCategories?.map(c => c.categorie).join(', ') || 'Aucune'}

Tu es un assistant financier spécialisé dans la gestion de budget. Réponds aux questions de l'utilisateur en utilisant ces données réelles.`
  }

  // Appeler le modèle IA avec le contexte
  async generateResponse(userQuestion, userData) {
    try {
      // Si pas de clé API, utiliser le fallback
      if (!this.apiKey) {
        await this.initFallback()
        return this.fallbackService.generateWithRules(userQuestion, userData)
      }

      const context = this.prepareContext(userData)
      
      const prompt = `${context}

Question utilisateur: ${userQuestion}

Réponse (sois concis et utile, utilise les données réelles):`

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result[0]?.generated_text || "Désolé, je n'ai pas pu générer de réponse."
    } catch (error) {
      console.error('Erreur modèle IA:', error)
      
      // Utiliser le service de fallback
      await this.initFallback()
      return this.fallbackService.generateWithRules(userQuestion, userData)
    }
  }

  // Réponse de secours si l'IA échoue
  getFallbackResponse(question, userData) {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('budget')) {
      return `Votre budget mensuel actuel est de ${userData.budget?.monthly || 'non défini'}. Je recommande de suivre vos dépenses pour mieux le contrôler.`
    }
    
    if (lowerQuestion.includes('dépense') || lowerQuestion.includes('dépenses')) {
      return `Vos dépenses totales s'élèvent à ${userData.expenses?.total || 0}€. Vos principales catégories sont: ${userData.insights?.topCategories?.slice(0, 3).map(c => c.categorie).join(', ') || 'non définies'}.`
    }
    
    if (lowerQuestion.includes('revenu') || lowerQuestion.includes('revenus')) {
      return `Vos revenus totaux sont de ${userData.revenues?.total || 0}€. Cela représente ${userData.revenues?.length || 0} sources de revenus différentes.`
    }
    
    if (lowerQuestion.includes('compte') || lowerQuestion.includes('comptes')) {
      return `Vous avez ${userData.accounts?.length || 0} comptes enregistrés. Le solde total est de ${userData.accounts?.reduce((sum, acc) => sum + (acc.solde || 0), 0) || 0}€.`
    }
    
    if (lowerQuestion.includes('objectif') || lowerQuestion.includes('objectifs')) {
      return `Vous avez ${userData.goals?.length || 0} objectifs financiers définis. Continuez à épargner pour les atteindre !`
    }
    
    return "Je suis votre assistant financier. Posez-moi des questions sur votre budget, dépenses, revenus, comptes ou objectifs !"
  }

  // Analyser la question pour extraire l'intention
  analyzeQuestion(question) {
    const lowerQuestion = question.toLowerCase()
    
    const intents = {
      budget: ['budget', 'limite', 'plafond', 'mensuel'],
      expenses: ['dépense', 'dépenses', 'sortie', 'sorties', 'argent'],
      revenues: ['revenu', 'revenus', 'entrée', 'entrées', 'salaire'],
      accounts: ['compte', 'comptes', 'solde', 'portefeuille'],
      goals: ['objectif', 'objectifs', 'épargne', 'épargner'],
      analysis: ['analyse', 'analyser', 'comprendre', 'expliquer'],
      advice: ['conseil', 'conseils', 'aide', 'recommandation']
    }
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        return intent
      }
    }
    
    return 'general'
  }
}

export default new AIModelService()
