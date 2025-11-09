"use client"
import { useState } from 'react'
import AiService from '@/services/aiService'
import { useLanguage } from '@/context/LanguageContext'

export default function AssistantChat({ initialContext = '' }) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage(e) {
    e?.preventDefault?.()
    setError('')
    const content = String(input || '').trim()
    if (!content) return
    const userMsg = { role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await AiService.chat(content, initialContext)
      const replyText = res?.reply || t('ia.noResponse')
      setMessages((m) => [...m, { role: 'assistant', content: replyText }])
    } catch (e) {
      setError(e?.message || t('ia.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('ia.chatTitle')}</div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 h-96 overflow-y-auto bg-white dark:bg-gray-800 custom-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-sm">{t('ia.placeholder')}</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right my-2' : 'text-left my-2'}>
            <div className={m.role === 'user' ? 'inline-block bg-emerald-600 dark:bg-emerald-500 text-white px-3 py-2 rounded-lg' : 'inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg'}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left my-2">
            <div className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-3 py-2 rounded-lg">{t('ia.typing')}</div>
          </div>
        )}
      </div>
      {error ? <div className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</div> : null}
      <form onSubmit={sendMessage} className="flex gap-2 mt-3">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          placeholder={t('ia.inputPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('ia.send')}
        </button>
      </form>
    </div>
  )
}


