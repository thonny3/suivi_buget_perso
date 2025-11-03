"use client"
import { useState } from 'react'
import AiService from '@/services/aiService'

export default function AssistantChat({ initialContext = '' }) {
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
      const replyText = res?.reply || "Désolé, je n'ai pas de réponse."
      setMessages((m) => [...m, { role: 'assistant', content: replyText }])
    } catch (e) {
      setError(e?.message || 'Erreur lors de la requête IA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="text-xl font-semibold mb-3">Assistant IA</div>
      <div className="border rounded-lg p-3 h-96 overflow-y-auto bg-white">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm">Posez moi une question concernant votre budget, vos dépenses, ou des conseils.</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right my-2' : 'text-left my-2'}>
            <div className={m.role === 'user' ? 'inline-block bg-emerald-600 text-white px-3 py-2 rounded-lg' : 'inline-block bg-gray-100 text-gray-900 px-3 py-2 rounded-lg'}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left my-2">
            <div className="inline-block bg-gray-100 text-gray-500 px-3 py-2 rounded-lg">L'assistant rédige…</div>
          </div>
        )}
      </div>
      {error ? <div className="text-red-600 text-sm mt-2">{error}</div> : null}
      <form onSubmit={sendMessage} className="flex gap-2 mt-3">
        <input
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Écrivez votre message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}


