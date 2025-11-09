"use client"
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { colors } from '@/styles/colors'
import AiService from '@/services/aiService'

// Composant pour formater le texte avec mise en évidence des montants et listes
const FormattedMessage = ({ text }) => {
  if (!text) return null

  // Fonction pour formater les montants (ex: "150.50 EUR" ou "250.75 USD")
  const formatAmount = (str) => {
    // Pattern pour détecter les montants avec devise: nombres avec décimales suivis d'une devise
    // Supporte aussi les montants sans décimales: "100 EUR"
    const amountPattern = /(\d+(?:[.,]\d{2,})?)\s*([A-Z]{2,4})/gi
    return str.replace(amountPattern, (match, amount, currency) => {
      return `<span class="font-semibold text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30">${amount} ${currency}</span>`
    })
  }

  // Traiter le texte ligne par ligne
  const lines = text.split('\n')
  const processed = []
  let inList = false
  let listItems = []

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    
    // Détecter les listes à puces (- ou •)
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)$/)
    // Détecter les listes numérotées
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    
    if (bulletMatch || numberedMatch) {
      // Nouvelle liste
      if (!inList) {
        if (processed.length > 0 && processed[processed.length - 1] !== '<br/>') {
          processed.push('<br/>')
        }
        inList = true
        listItems = []
      }
      // Ajouter l'item de liste
      const content = bulletMatch ? bulletMatch[1] : numberedMatch[2]
      const formattedContent = formatAmount(content)
      listItems.push(formattedContent)
    } else {
      // Fin de liste si on était dans une liste
      if (inList) {
        if (listItems.length > 0) {
          processed.push(`<ul class="list-disc space-y-1 my-2 ml-4 text-gray-800 dark:text-gray-200">${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`)
        }
        listItems = []
        inList = false
      }
      
      // Ligne vide
      if (!trimmed) {
        if (idx > 0 && processed[processed.length - 1] !== '<br/>') {
          processed.push('<br/>')
        }
      } else {
        // Paragraphe normal avec formatage des montants
        const formatted = formatAmount(trimmed)
        processed.push(`<p class="mb-2 leading-relaxed text-gray-800 dark:text-gray-200">${formatted}</p>`)
      }
    }
  })

  // Fermer la liste si elle était ouverte à la fin
  if (inList && listItems.length > 0) {
    processed.push(`<ul class="list-disc space-y-1 my-2 ml-4 text-gray-800 dark:text-gray-200">${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`)
  }

  const finalHtml = processed.join('')
  
  return (
    <div 
      className="text-xs sm:text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: finalHtml }}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}
    />
  )
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant IA pour la gestion de budget. Comment puis-je vous aider ?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const currentSpeakingMessageRef = useRef(null)

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsLoading(true)

    // Générer une réponse intelligente
    try {
      const response = await AiService.chat(currentInput)
      const botResponseText = response?.reply || response || "Désolé, je n'ai pas pu générer de réponse."
      const botResponse = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Erreur chatbot:', error)
      const errorMessage = error?.message || "Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?"
      const errorResponse = {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const SpeechSynthesis = window.speechSynthesis
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'fr-FR'

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
          setInputMessage(transcript)
          setIsRecording(false)
          setIsListening(false)
        }

        recognition.onerror = (event) => {
          console.error('Erreur de reconnaissance vocale:', event.error)
          setIsRecording(false)
          setIsListening(false)
          if (event.error === 'not-allowed') {
            alert('Permission microphone refusée. Veuillez autoriser l\'accès au microphone.')
          }
        }

        recognition.onend = () => {
          setIsRecording(false)
          setIsListening(false)
        }

        recognitionRef.current = recognition
        setSpeechSupported(true)
      }

      if (SpeechSynthesis) {
        synthRef.current = SpeechSynthesis
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current && currentSpeakingMessageRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Démarrer l'enregistrement vocal
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Erreur démarrage enregistrement:', error)
        setIsRecording(false)
      }
    }
  }

  // Arrêter l'enregistrement vocal
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      setIsListening(false)
    }
  }

  // Extraire le texte brut d'un message (sans HTML)
  const extractPlainText = (text) => {
    // Créer un élément temporaire pour extraire le texte
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = text
    return tempDiv.textContent || tempDiv.innerText || text
  }

  // Lire un message à voix haute
  const speakMessage = (text, messageId) => {
    if (!synthRef.current) return

    // Arrêter toute lecture en cours
    if (currentSpeakingMessageRef.current) {
      synthRef.current.cancel()
      setSpeakingMessageId(null)
    }

    // Extraire le texte brut pour la lecture vocale
    const plainText = extractPlainText(text)

    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.lang = 'fr-FR'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setSpeakingMessageId(messageId)
      currentSpeakingMessageRef.current = utterance
    }

    utterance.onend = () => {
      setSpeakingMessageId(null)
      currentSpeakingMessageRef.current = null
    }

    utterance.onerror = () => {
      setSpeakingMessageId(null)
      currentSpeakingMessageRef.current = null
    }

    synthRef.current.speak(utterance)
  }

  // Arrêter la lecture
  const stopSpeaking = () => {
    if (synthRef.current && currentSpeakingMessageRef.current) {
      synthRef.current.cancel()
      setSpeakingMessageId(null)
      currentSpeakingMessageRef.current = null
    }
  }

  // Lire automatiquement les nouvelles réponses du bot
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.sender === 'bot' && lastMessage.id > 1) {
        // Lire automatiquement la réponse du bot (optionnel, peut être désactivé)
        // speakMessage(lastMessage.text)
      }
    }
  }, [messages])

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}
        style={{ backgroundColor: colors.secondary }}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white mx-auto" />
        )}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 left-4 sm:bottom-20 sm:right-6 sm:left-auto z-40 w-auto sm:w-96 max-w-full sm:max-w-md h-[calc(100vh-5rem)] sm:h-[550px] md:h-[600px] max-h-[85vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div 
            className="p-3 sm:p-4 text-white flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: colors.secondary }}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">Assistant IA</h3>
                <p className="text-xs opacity-90">En ligne</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors flex-shrink-0 ml-2"
              aria-label="Fermer le chat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-900 custom-scrollbar scroll-smooth">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm'
                  }`}
                  style={message.sender === 'user' ? { backgroundColor: colors.primary } : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {message.sender === 'bot' ? (
                        <FormattedMessage text={message.text} />
                      ) : (
                        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.text}</div>
                      )}
                    </div>
                    {message.sender === 'bot' && speechSupported && (
                      <button
                        onClick={() => {
                          if (speakingMessageId === message.id && currentSpeakingMessageRef.current) {
                            stopSpeaking()
                          } else {
                            speakMessage(message.text, message.id)
                          }
                        }}
                        className="flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                        aria-label={speakingMessageId === message.id ? 'Arrêter la lecture' : 'Lire le message'}
                        title={speakingMessageId === message.id ? 'Arrêter la lecture' : 'Lire le message'}
                      >
                        {speakingMessageId === message.id ? (
                          <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className={`text-[10px] sm:text-xs mt-1 sm:mt-2 ${message.sender === 'user' ? 'opacity-80' : 'opacity-60 dark:opacity-70'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                    <span className="text-xs sm:text-sm">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-2">
              {speechSupported && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex-shrink-0 ${
                    isRecording || isListening
                      ? 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 animate-pulse'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement vocal'}
                  title={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement vocal'}
                >
                  {isRecording || isListening ? (
                    <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              )}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? "Enregistrement en cours..." : "Tapez votre message..."}
                disabled={isLoading || isRecording}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:ring-offset-gray-800 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isRecording}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex-shrink-0"
                style={{ backgroundColor: colors.secondary }}
                aria-label="Envoyer le message"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </button>
            </div>
            {isRecording && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Enregistrement en cours...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
