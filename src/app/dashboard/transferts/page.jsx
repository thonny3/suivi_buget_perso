"use client"
import React, { useEffect, useState } from 'react'
import transfertsService from '@/services/transfertsService'
import accountsService from '@/services/accountsService'
import objectifsService from '@/services/objectifsService'
import { colors } from '@/styles/colors'

export default function TransfertsPage() {
  const [comptes, setComptes] = useState([])
  const [objectifs, setObjectifs] = useState([])
  const [type, setType] = useState('compte_to_compte')
  const [source, setSource] = useState('')
  const [cible, setCible] = useState('')
  const [montant, setMontant] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [historique, setHistorique] = useState([])
  const [loadError, setLoadError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError('')
        const [accRes, hist] = await Promise.all([
          accountsService.getMyAccounts(),
          transfertsService.historique({ limit: 20 })
        ])
        if (accRes.success) {
          setComptes(Array.isArray(accRes.data) ? accRes.data : [])
        } else {
          setComptes([])
          setLoadError(accRes.error || 'Impossible de charger vos comptes')
        }
        setHistorique(Array.isArray(hist) ? hist : [])
        const objs = await objectifsService.list()
        setObjectifs(Array.isArray(objs) ? objs : (Array.isArray(objs?.data) ? objs.data : []))
      } catch (e) {
        setLoadError(e?.message || 'Erreur de chargement')
      }
    }
    load()
  }, [])

  const submit = async () => {
    try {
      setLoading(true)
      setMessage('')
      const m = parseFloat(montant)
      if (!m || m <= 0) throw new Error('Montant invalide')
      if (type === 'compte_to_compte') {
        await transfertsService.compteVersCompte({ id_compte_source: Number(source), id_compte_cible: Number(cible), montant: m })
      } else if (type === 'compte_to_objectif') {
        await transfertsService.compteVersObjectif({ id_compte: Number(source), id_objectif: Number(cible), montant: m })
      } else if (type === 'objectif_to_compte') {
        await transfertsService.objectifVersCompte({ id_compte: Number(cible), id_objectif: Number(source), montant: m })
      }
      setMessage('Transfert effectué')
      setMontant('')
      setSource('')
      setCible('')
      // Rafraîchir l'historique, les comptes et les objectifs pour mettre à jour soldes et pourcentages
      const [hist, accRes, objs] = await Promise.all([
        transfertsService.historique({ limit: 20 }),
        accountsService.getMyAccounts(),
        objectifsService.list()
      ])
      setHistorique(Array.isArray(hist) ? hist : [])
      if (accRes?.success) setComptes(Array.isArray(accRes.data) ? accRes.data : [])
      setObjectifs(Array.isArray(objs) ? objs : (Array.isArray(objs?.data) ? objs.data : []))
    } catch (e) {
      setMessage(e?.message || 'Erreur transfert')
    } finally {
      setLoading(false)
    }
  }

  const comptesOptions = Array.isArray(comptes) ? comptes : []
  const objectifsOptions = Array.isArray(objectifs) ? objectifs : []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Transferts</h1>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Effectuer un transfert</h2>
            <p className="text-sm text-gray-500">Déplacer des fonds entre vos comptes et objectifs</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            Nouveau transfert
          </button>
        </div>
        {message && <div className="mt-3 text-sm text-gray-700">{message}</div>}
        {loadError && <div className="mt-2 text-xs text-red-600">{loadError}</div>}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Historique</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Source</th>
                <th className="py-2">Cible</th>
                <th className="py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((h) => (
                <tr key={h.id || `${h.type}-${h.date_transfert}-${Math.random()}`} className="border-t border-gray-100">
                  <td className="py-2">{new Date(h.date_transfert).toLocaleString('fr-FR')}</td>
                  <td className="py-2">{h.type}</td>
                  <td className="py-2">{h.source_nom || '-'}</td>
                  <td className="py-2">{h.cible_nom || '-'}</td>
                  <td className="py-2 text-right">{Number(h.montant).toFixed(2)}€</td>
                </tr>
              ))}
              {(!historique || historique.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">Aucun transfert</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Nouveau transfert</h3>
              <p className="text-sm text-gray-500">Remplissez le formulaire ci-dessous</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select value={type} onChange={(e) => { setType(e.target.value); setSource(''); setCible('') }} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="compte_to_compte">Compte ➜ Compte</option>
                  <option value="compte_to_objectif">Compte ➜ Objectif</option>
                  <option value="objectif_to_compte">Objectif ➜ Compte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Source</label>
                {type === 'objectif_to_compte' ? (
                  <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" disabled={!objectifsOptions.length}>
                    <option value="">Sélectionner</option>
                    {objectifsOptions.map(o => (
                      <option key={o.id_objectif || o.id} value={o.id_objectif || o.id}>{o.nom}</option>
                    ))}
                  </select>
                ) : (
                  <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" disabled={!comptesOptions.length}>
                    <option value="">Sélectionner</option>
                    {comptesOptions.map(c => (
                      <option key={c.id_compte || c.id} value={c.id_compte || c.id}>{c.nom} ({(parseFloat(c.solde)||0).toFixed(2)}€)</option>
                    ))}
                  </select>
                )}
                {source && (
                  <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-800">
                    {type === 'objectif_to_compte' ? (
                      (() => {
                        const o = objectifsOptions.find(x => String(x.id_objectif||x.id) === String(source))
                        return (
                          <div className="flex items-baseline justify-between">
                            <div className="font-medium text-gray-900">{o?.nom || 'Objectif'}</div>
                            <div className="text-right">
                              <div className="text-[13px] text-gray-500">Montant actuel</div>
                              <div className="text-lg font-semibold text-emerald-700">{(parseFloat(o?.montant_actuel)||0).toFixed(2)}€</div>
                              {typeof o?.montant_total !== 'undefined' && (
                                <div className="text-[12px] text-gray-500">/ {(parseFloat(o?.montant_total)||0).toFixed(2)}€</div>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      (() => {
                        const c = comptesOptions.find(x => String(x.id_compte||x.id) === String(source))
                        return (
                          <div className="flex items-baseline justify-between">
                            <div className="font-medium text-gray-900">{c?.nom || 'Compte'}</div>
                            <div className="text-right">
                              <div className="text-[13px] text-gray-500">Solde</div>
                              <div className="text-xl font-semibold text-emerald-700">{(parseFloat(c?.solde)||0).toFixed(2)}€</div>
                            </div>
                          </div>
                        )
                      })()
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Cible</label>
                {type === 'compte_to_objectif' ? (
                  <select value={cible} onChange={(e) => setCible(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" disabled={!objectifsOptions.length}>
                    <option value="">Sélectionner</option>
                    {objectifsOptions.map(o => (
                      <option key={o.id_objectif || o.id} value={o.id_objectif || o.id}>{o.nom}</option>
                    ))}
                  </select>
                ) : (
                  <select value={cible} onChange={(e) => setCible(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" disabled={!comptesOptions.length}>
                    <option value="">Sélectionner</option>
                    {comptesOptions.map(c => (
                      <option key={c.id_compte || c.id} value={c.id_compte || c.id}>{c.nom} ({(parseFloat(c.solde)||0).toFixed(2)}€)</option>
                    ))}
                  </select>
                )}
                {cible && (
                  <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-800">
                    {type === 'compte_to_objectif' ? (
                      (() => {
                        const o = objectifsOptions.find(x => String(x.id_objectif||x.id) === String(cible))
                        return (
                          <div className="flex items-baseline justify-between">
                            <div className="font-medium text-gray-900">{o?.nom || 'Objectif'}</div>
                            <div className="text-right">
                              <div className="text-[13px] text-gray-500">Montant actuel</div>
                              <div className="text-lg font-semibold text-emerald-700">{(parseFloat(o?.montant_actuel)||0).toFixed(2)}€</div>
                              {typeof o?.montant_total !== 'undefined' && (
                                <div className="text-[12px] text-gray-500">/ {(parseFloat(o?.montant_total)||0).toFixed(2)}€</div>
                              )}
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      (() => {
                        const c = comptesOptions.find(x => String(x.id_compte||x.id) === String(cible))
                        return (
                          <div className="flex items-baseline justify-between">
                            <div className="font-medium text-gray-900">{c?.nom || 'Compte'}</div>
                            <div className="text-right">
                              <div className="text-[13px] text-gray-500">Solde</div>
                              <div className="text-xl font-semibold text-emerald-700">{(parseFloat(c?.solde)||0).toFixed(2)}€</div>
                            </div>
                          </div>
                        )
                      })()
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Montant</label>
                <input type="number" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"/>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                disabled={loading || !source || !cible || !montant}
                onClick={async () => {
                  await submit()
                  if (!loadError) setIsModalOpen(false)
                }}
                className={`px-5 py-2 rounded-lg text-white ${(!source || !cible || !montant) ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: colors.secondary }}
                onMouseEnter={(e) => { if (source && cible && montant) e.target.style.backgroundColor = colors.secondaryDark }}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
              >
                {loading ? 'Transfert...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


