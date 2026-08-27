'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  Building2, 
  User, 
  Mail, 
  Calendar,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react'
import { approveBankTransferAction, rejectBankTransferAction } from '../billing/actions'

export interface AdminBankTransfer {
  id: string
  user_id: string
  workspace_id?: string
  amount: string
  reference_number: string
  receipt_url: string
  bank_name: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  user_email: string
  user_name?: string
}

export default function AdminBankTransfers({ 
  transfers 
}: { 
  transfers: AdminBankTransfer[] 
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleApprove = async (transferId: string) => {
    if (!confirm('¿Estás seguro de que deseas aprobar este pago y activar el Plan PRO para este usuario?')) {
      return
    }
    setLoadingId(transferId)
    await approveBankTransferAction(transferId)
    setLoadingId(null)
  }

  const handleReject = async (transferId: string) => {
    const reason = prompt('Motivo del rechazo (opcional):', 'Referencia no encontrada o monto incorrecto')
    if (reason === null) return
    setLoadingId(transferId)
    await rejectBankTransferAction(transferId, reason)
    setLoadingId(null)
  }

  const pendingCount = transfers.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            Comprobantes de Pago Bancario (BAC / ACH)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Verifica los comprobantes enviados por los clientes y activa sus suscripciones PRO manualmente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
            {pendingCount} Pendiente{pendingCount !== 1 ? 's' : ''} de Aprobación
          </span>
        </div>
      </div>

      {transfers.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800">No hay transferencias registradas</p>
          <p className="text-xs text-gray-400 mt-1">Los pagos por transferencia que suban los clientes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transfers.map((t) => {
            const isPending = t.status === 'pending'
            const isApproved = t.status === 'approved'

            return (
              <div 
                key={t.id} 
                className={`bg-white p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between space-y-4 ${
                  isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-gray-900">
                          Ref: #{t.reference_number}
                        </span>
                        <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {t.amount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      {isPending && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprobado
                        </span>
                      )}
                      {t.status === 'rejected' && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-900 flex items-center gap-1 border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" /> Rechazado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Datos del Usuario */}
                  <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      {t.user_name || 'Usuario OmniTag'}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {t.user_email}
                    </p>
                    {t.notes && (
                      <p className="text-gray-500 italic pt-1 border-t border-gray-200/60 mt-1">
                        Notas: "{t.notes}"
                      </p>
                    )}
                  </div>

                  {/* Comprobante de Pago */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Comprobante Adjunto:
                    </span>
                    {t.receipt_url ? (
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(t.receipt_url)}
                        className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span>Ver Foto / Comprobante de Transferencia</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin imagen adjunta</span>
                    )}
                  </div>
                </div>

                {/* Botones de Aprobación */}
                {isPending && (
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loadingId === t.id}
                      onClick={() => handleApprove(t.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{loadingId === t.id ? 'Aprobando...' : 'Aprobar y Activar PRO'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === t.id}
                      onClick={() => handleReject(t.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal para ver imagen del comprobante en tamaño completo */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">Comprobante de Pago</h4>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-xl p-2">
              <img 
                src={selectedReceipt} 
                alt="Comprobante de Transferencia" 
                className="max-w-full h-auto object-contain rounded-lg shadow-xs" 
              />
            </div>

            <div className="flex justify-end pt-1">
              <a 
                href={selectedReceipt} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Abrir imagen original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
