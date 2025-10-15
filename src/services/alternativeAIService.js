// Configuration alternative avec modèle IA local ou autre service gratuit
class AlternativeAIService {
  constructor() {
    // Option 1: Utiliser un modèle local avec Transformers.js
    this.useLocalModel = false
    
    // Option 2: Utiliser un autre service IA gratuit
    this.alternativeUrl = 'https://api.openai.com/v1/chat/completions'
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  }

  // Méthode avec modèle local (Transformers.js)
  async generateWithLocalModel(question, context) {
    // Cette méthode nécessiterait l'installation de @xenova/transformers
    // et l'utilisation d'un modèle local comme DistilBERT
    return "Modèle local non configuré. Utilisez Hugging Face API."
  }

  // Méthode avec service alternatif gratuit
  async generateWithAlternative(question, context) {
    try {
      const prompt = `Tu es un assistant financier. Réponds à cette question en utilisant les données fournies:

Contexte: ${JSON.stringify(context)}
Question: ${question}

Réponse (sois concis et utile):`

      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7
          }
        })
      })

      const result = await response.json()
      return result[0]?.generated_text || "Réponse non disponible"
    } catch (error) {
      console.error('Erreur service alternatif:', error)
      return "Service IA temporairement indisponible"
    }
  }

  // Méthode de fallback avec règles simples
  generateWithRules(question, context) {
    const lowerQuestion = question.toLowerCase()
    
    // Règles basées sur les mots-clés et les données
    if (lowerQuestion.includes('budget') && context.budget?.monthly) {
      return `Votre budget mensuel recommandé est de ${context.budget.monthly.toFixed(2)}€. Vos dépenses actuelles sont de ${context.expenses?.avgMonthly?.toFixed(2) || 0}€ par mois.`
    }
    
    if (lowerQuestion.includes('dépense') && context.expenses?.total) {
      return `Vos dépenses totales sont de ${context.expenses.total.toFixed(2)}€. Vos principales catégories sont: ${context.expenses.categories?.slice(0, 3).map(c => c.categorie).join(', ') || 'non définies'}.`
    }
    
    if (lowerQuestion.includes('revenu') && context.revenues?.total) {
      return `Vos revenus totaux sont de ${context.revenues.total.toFixed(2)}€ provenant de ${context.revenues.length} sources différentes.`
    }
    
    if (lowerQuestion.includes('compte') && context.accounts?.total) {
      return `Vous avez ${context.accounts.length} comptes avec un solde total de ${context.accounts.total.toFixed(2)}€.`
    }
    
    if (lowerQuestion.includes('objectif') && context.goals?.length) {
      return `Vous avez ${context.goals.length} objectifs financiers. Vous avez épargné ${context.goals.saved.toFixed(2)}€ sur ${context.goals.total.toFixed(2)}€ au total.`
    }
    
    // Réponse générique intelligente
    return `Basé sur vos données financières: vous avez ${context.revenues?.length || 0} sources de revenus, ${context.accounts?.length || 0} comptes, et ${context.goals?.length || 0} objectifs d'épargne. Comment puis-je vous aider davantage ?`
  }
}

export default new AlternativeAIService()
