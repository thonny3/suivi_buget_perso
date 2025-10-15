"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Search, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import apiService from '@/services/apiService'
import { API_CONFIG } from '@/config/api'

// Utilise Recharts (déjà présent dans le projet) pour un graphique plus lisible
function CurrencyYAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-6} y={0} textAnchor="end" dominantBaseline="central" fill="#6b7280" fontSize="12">
        {Number(payload.value).toLocaleString('fr-FR')}
      </text>
    </g>
  )
}

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // all | income | expense | transfer
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [currency, setCurrency] = useState('EUR')
  const [userFilter, setUserFilter] = useState('all')

  useEffect(() => {
    try {
      // Priorité à la devise stockée dans l'objet user
      const rawUser = localStorage.getItem('user')
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser)
          const code = (user?.devise || '').toString().trim().toUpperCase()
          if (code) {
            setCurrency(code)
            return
          }
        } catch {}
      }

      // Fallback: anciennes clés directes dans localStorage
      const stored = localStorage.getItem('devise') || localStorage.getItem('currency') || localStorage.getItem('currencyCode')
      if (stored && typeof stored === 'string') {
        setCurrency(stored.toUpperCase())
      }
    } catch {}
  }, [])

  const fetchTransactions = async () => {
    try {
      setError('')
      setLoading(true)
      const res = await apiService.request('/transactions', { method: 'GET' })
      setTransactions(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e?.message || 'Erreur lors du chargement des transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filtered = useMemo(() => {
    const normalized = (value) => (value || '').toString().trim().toLowerCase()
    const parseDate = (v) => {
      const raw = v || (typeof v === 'number' ? v : null)
      const d = new Date(raw)
      return isNaN(d.getTime()) ? null : d
    }

    return transactions.filter((t) => {
      // text search
      if (search) {
        const hay = JSON.stringify(t).toLowerCase()
        if (!hay.includes(search.toLowerCase())) return false
      }

      // type filter (use unified classifier)
      if (typeFilter !== 'all') {
        const kind = getTxKind(t)
        if (kind !== typeFilter) return false
      }

      // user filter
      if (userFilter !== 'all') {
        if (String(t.id_user ?? '') !== String(userFilter)) return false
      }

      // date range filter
      const txDate = parseDate(t.date || t.date_transaction || t.date_revenu || t.date_depense)
      if (dateFrom) {
        const from = parseDate(dateFrom)
        if (from && txDate && txDate < new Date(from.toDateString())) return false
      }
      if (dateTo) {
        const to = parseDate(dateTo)
        if (to && txDate && txDate > new Date(new Date(to.toDateString()).getTime() + 24*60*60*1000 - 1)) return false
      }

      return true
    })
  }, [transactions, search, typeFilter, dateFrom, dateTo, userFilter])

  // Réinitialiser la pagination lorsque les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [search, typeFilter, dateFrom, dateTo, userFilter])

  const userOptions = useMemo(() => {
    const map = new Map()
    for (const t of transactions) {
      const id = t.id_user
      if (!id) continue
      const prenom = t.user_prenom || ''
      const nom = t.user_nom || ''
      const email = t.user_email || ''
      const label = (prenom || nom) ? `${prenom} ${nom}`.trim() : (email || `ID ${id}`)
      if (!map.has(String(id))) map.set(String(id), { id: String(id), label })
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [transactions])

  const formatDateFr = (v) => {
    if (!v) return ''
    try { return new Date(v).toLocaleDateString('fr-FR') } catch { return '' }
  }

  const getCurrencySymbol = (code) => {
    const c = (code || '').toUpperCase()
    if (c === 'MGA') return 'Ar'
    if (c === 'EUR') return '€'
    if (c === 'USD') return '$'
    if (c === 'XOF') return 'CFA'
    return c || '€'
  }

  const formatAmount = (v, code = currency) => {
    const n = Number(v || 0)
    return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${getCurrencySymbol(code)}`
  }

  // Affichage sans devise et sans décimales (ex: 831 230)
  const formatPlainAmount = (v) => {
    const n = Number(v || 0)
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  // Affichage sans décimales + devise utilisateur (ex: 831 230 Ar ou 831 230 XOF)
  const formatPlainAmountWithDevise = (v) => {
    const base = formatPlainAmount(v)
    const code = (currency || '').toUpperCase()
    const suffix = code === 'MGA' ? 'Ar' : (code || '')
    return suffix ? `${base} ${suffix}` : base
  }

  const getType = (t) => {
    // Essaie d'inférer un type lisible si fourni par l'API
    return (t?.type || t?.transaction_type || t?.categorie || 'Transaction').toString()
  }

  // Détermine le type logique pour le style (income/expense/transfer)
  function getTxKind(t) {
    const rawAmount = Number(t.montant ?? t.amount ?? 0)
    const apiType = (t?.type || t?.transaction_type || t?.categorie || '').toString().toLowerCase()
    const isTransfer = apiType.includes('transf') || apiType.includes('virement')
    if (isTransfer) return 'transfer'
    const isContribution = apiType.includes('contrib')
    if (isContribution) return 'contribution'
    const isExpenseByType = apiType.includes('depens') || apiType.includes('expense') || apiType.includes('charge')
    if (isExpenseByType) return 'expense'
    const isIncomeByType = apiType.includes('revenu') || apiType.includes('income') || apiType.includes('recette')
    if (isIncomeByType) return 'income'
    return rawAmount < 0 ? 'expense' : 'income'
  }

  // Stats + graphique (Revenus, Dépenses, Contributions)
  const monthlySeries = useMemo(() => {
    const map = new Map()
    const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = (d) => d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    const parseDate = (v) => {
      const d = new Date(v)
      return isNaN(d.getTime()) ? null : d
    }
    for (const t of filtered) {
      const d = parseDate(t.date || t.date_transaction || t.date_revenu || t.date_depense)
      if (!d) continue
      const k = toKey(d)
      const item = map.get(k) || { label: label(d), income: 0, expense: 0, contribution: 0 }
      const amt = Number(t.montant ?? t.amount ?? 0)
      const kind = getTxKind(t)
      if (kind === 'expense') item.expense += Math.abs(amt)
      else if (kind === 'contribution') item.contribution += Math.abs(amt)
      else if (kind === 'income') item.income += Math.abs(amt)
      map.set(k, item)
    }
    const arr = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
    return arr.slice(-6) // last 6 months present
  }, [filtered])

  const totals = useMemo(() => {
    let income = 0, expense = 0, contribution = 0
    for (const t of filtered) {
      const amt = Number(t.montant ?? t.amount ?? 0)
      const kind = getTxKind(t)
      if (kind === 'expense') expense += Math.abs(amt)
      else if (kind === 'contribution') contribution += Math.abs(amt)
      else if (kind === 'income') income += Math.abs(amt)
    }
    return { income, expense, contribution, balance: income - expense }
  }, [filtered])

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const pageStart = (currentPage - 1) * itemsPerPage
  const pageEnd = pageStart + itemsPerPage
  const pageItems = filtered.slice(pageStart, pageEnd)
  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toutes les transactions</h1>
          <p className="text-gray-600 mt-1">Consultez l'historique de vos mouvements</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (source, compte, catégorie, etc.)"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full md:w-auto flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tous les types</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
              <option value="contribution">Contributions</option>
              <option value="transfer">Transferts</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full md:w-auto flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tous les utilisateurs</option>
              {userOptions.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Du"
              />
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Au"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500">Revenus</div>
          <div className="text-2xl font-semibold text-green-600">{formatPlainAmountWithDevise(totals.income)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500">Dépenses</div>
          <div className="text-2xl font-semibold text-red-600">{formatPlainAmountWithDevise(totals.expense)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500">Contributions</div>
          <div className="text-2xl font-semibold text-indigo-600">{formatPlainAmountWithDevise(totals.contribution)}</div>
        </div>
      </div>

      {/* Graphique Recharts (6 derniers mois présents) */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="mb-2 font-medium text-gray-800">Évolution mensuelle (Revenus vs Dépenses vs Contributions)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={<CurrencyYAxisTick />} />
              <Tooltip formatter={(value) => {
                const base = Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
                const code = (currency || '').toUpperCase()
                const suffix = code === 'MGA' ? 'Ar' : (code || '')
                return suffix ? `${base} ${suffix}` : base
              }} />
              <Legend />
              <Bar dataKey="income" name="Revenus" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="contribution" name="Contributions" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Source/Description</th>
                <th className="text-left p-4 font-medium text-gray-700">Compte</th>
                <th className="text-left p-4 font-medium text-gray-700">Utilisateur</th>
                <th className="text-right p-4 font-medium text-gray-700">Montant</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-gray-500" colSpan={6}>Aucune transaction trouvée</td>
                </tr>
              ) : (
                pageItems.map((t, idx) => (
                  <tr key={t.id_transaction ?? t.id ?? `${pageStart + idx}`} className={(pageStart + idx) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDateFr(t.date || t.date_transaction || t.date_revenu || t.date_depense)}
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const kind = getTxKind(t)
                        const isExpense = kind === 'expense'
                        const isIncome = kind === 'income'
                        const isContribution = kind === 'contribution'
                        const icon = isExpense
                          ? <ArrowDownRight className="w-4 h-4 text-red-600" />
                          : (isContribution
                              ? <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                              : <ArrowUpRight className="w-4 h-4 text-green-600" />)
                        return (
                          <div className="flex items-center gap-2 text-gray-800">
                            {icon}
                            <span className={`font-medium ${isExpense ? 'text-red-600' : (isContribution ? 'text-indigo-600' : (isIncome ? 'text-green-600' : 'text-gray-700'))}`}>{getType(t)}</span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="p-4 text-gray-800">{t.source || t.description || ''}</td>
                    <td className="p-4 text-gray-600">{t.compte || t.compte_nom || t.account_name || ''}</td>
                    <td className="p-4">
                      {(() => {
                        const u = { prenom: t.user_prenom, nom: t.user_nom, email: t.user_email, image: t.user_image }
                        const displayName = (u.prenom || u.nom) ? `${u.prenom || ''} ${u.nom || ''}`.trim() : (u.email || '')
                        const initial = (u.prenom || u.nom || u.email || 'U').toString().trim().charAt(0).toUpperCase()
                        const img = u.image
                        const url = (() => {
                          if (!img) return null
                          if (/^https?:\/\//i.test(img)) return img
                          const API_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api$/, '')
                          const cleaned = img.replace(/^\/+/, '')
                          return cleaned.toLowerCase().startsWith('uploads/') ? `${API_ORIGIN}/${cleaned}` : `${API_ORIGIN}/uploads/${cleaned}`
                        })()
                        return (
                          <div className="flex items-center gap-2">
                            {url ? (
                              <img src={url} alt={displayName} className="w-6 h-6 rounded-full object-cover border" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            ) : (
                              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center border">
                                <span className="text-emerald-700 text-xs font-medium">{initial}</span>
                              </div>
                            )}
                            <span className="text-sm text-gray-700">{displayName || `ID: ${t.id_user || ''}`}</span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="p-4 text-right">
                      {(() => {
                        const kind = getTxKind(t)
                        const isExpense = kind === 'expense'
                        const isIncome = kind === 'income'
                        const isContribution = kind === 'contribution'
                        return (
                          <span className={`font-semibold ${isExpense ? 'text-red-600' : (isContribution ? 'text-indigo-600' : (isIncome ? 'text-green-600' : 'text-gray-700'))}`}>
                            {formatPlainAmountWithDevise(t.montant ?? t.amount)}
                          </span>
                        )
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-600">
          {totalItems === 0 ? '0 résultat' : (
            <>Affichage {pageStart + 1}-{Math.min(pageEnd, totalItems)} sur {totalItems}</>
          )}
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Précédent
          </button>
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            // Affiche jusqu'à 5 boutons (1..min(5,totalPages)) pour rester simple
            const p = i + 1
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-3 py-2 rounded-lg border ${currentPage === p ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-700'}`}
              >
                {p}
              </button>
            )
          })}
          {totalPages > 5 && (
            <span className="px-2 text-gray-500">…</span>
          )}
          <button
            className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => goToPage(currentPage - 1 + 2 - 1)}
            disabled={currentPage >= totalPages}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}


