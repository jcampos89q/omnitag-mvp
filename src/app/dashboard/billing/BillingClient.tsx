'use client'

import { useState } from 'react'
import { 
  Building2, 
  Copy, 
  Check, 
  CheckCircle2, 
  UploadCloud, 
  Clock, 
  FileCheck, 
  Sparkles, 
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react'
import ImageUploadInput from '@/components/ImageUploadInput'
import { submitBankTransfer } from './actions'

interface BankTransfer {
  id: string
  amount: string
  reference_number: string
  receipt_url: string
  status: string
  notes?: string
  created_at: string
}

interface BillingClientProps {
  currentPlan: string
  userEmail: string
  transfers: BankTransfer[]
}

export default function BillingClient({
  currentPlan,
  userEmail,
  transfers = []
}: BillingClientProps) {
  const [receiptUrl, setReceiptUrl] = useState<string>('')
  const [referenceNumber, setReferenceNumber] = useState<string>('')
  const [currency, setCurrency] = useState<'HNL' | 'USD'>('HNL')
  const [notes, setNotes] = useState<string>('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isPro = currentPlan === 'pro'
  const pendingTransfer = transfers.find(t => t.status === 'pending')

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referenceNumber.trim()) {
      setSubmitError('Por favor ingresa el número de referencia o transacción.')
      return
    }
    if (!receiptUrl) {
      setSubmitError('Por favor sube la foto o captura del comprobante.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const formData = new FormData()
    formData.append('reference_number', referenceNumber)
    formData.append('receipt_url', receiptUrl)
    formData.append('amount', currency === 'HNL' ? 'L. 550 HNL' : '$20 USD')
    formData.append('notes', notes)

    const res = await submitBankTransfer(formData)
    setSubmitting(false)

    if (res.success) {
      setSubmitSuccess(true)
      setReferenceNumber('')
      setReceiptUrl('')
      setNotes('')
    } else {
      setSubmitError(res.error || 'Error al enviar el comprobante. Intenta nuevamente.')
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. ESTADO ACTUAL DEL PLAN */}
      <div className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Estado de tu Cuenta</span>
          <div className="flex items-center gap-2.5 mt-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              {isPro ? 'Plan PRO (Acceso Total Ilimitado)' : 'Plan Básico (Gratuito)'}
            </h2>
            {isPro ? (
              <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> PRO Activo
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Gratuito
              </span>
            )}
          </div>
        </div>

        {isPro && (
          <div className="text-xs text-gray-500 text-right">
            <p className="font-semibold text-emerald-600">✓ Todas las herramientas PRO habilitadas</p>
          </div>
        )}
      </div>

      {/* AVISO DE PAGO PENDIENTE DE REVISIÓN */}
      {pendingTransfer && !isPro && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-in fade-in">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Comprobante de Transferencia en Revisión</p>
            <p className="opacity-90 mt-0.5">
              Hemos recibido tu comprobante con referencia <b>#{pendingTransfer.reference_number}</b> por <b>{pendingTransfer.amount}</b>. La administración activará tu Plan PRO en unos minutos.
            </p>
          </div>
        </div>
      )}

      {/* 2. TABLA COMPARATIVA DE PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        {/* PLAN BÁSICO */}
        <div className="border border-gray-200 rounded-2xl p-6 sm:p-7 bg-white flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Plan Básico</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Para Iniciar</span>
            </div>
            <p className="text-gray-500 text-xs mb-4">Para profesionales que están dando sus primeros pasos.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500 text-xs ml-1">Gratis para siempre</span>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><b>1 vCard Digital</b> activa</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><b>1 Menú Digital</b> (hasta 10 platos)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><b>1 Placa NFC / QR</b> (Enlace directo a Google)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Estudio QR estándar (500px)</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span className="w-4 h-4 text-center">✕</span>
                <span className="line-through">Escudo Anti-Quejas Google</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span className="w-4 h-4 text-center">✕</span>
                <span className="line-through">Exportar CRM a Excel (CSV)</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <span className="block text-center text-xs font-bold text-gray-500 py-2">
              {!isPro ? '✓ Tu Plan Actual' : 'Incluido'}
            </span>
          </div>
        </div>

        {/* PLAN PRO */}
        <div className="border-2 border-purple-600 rounded-2xl p-6 sm:p-7 bg-white relative flex flex-col justify-between shadow-xl">
          <div className="absolute -top-3.5 right-6 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> RECOMENDADO
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Plan PRO Ilimitado</h3>
            </div>
            <p className="text-gray-500 text-xs mb-4">Todo el poder de OmniTag para hacer crecer tu negocio.</p>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-gray-900">L. 550</span>
                <span className="text-gray-500 text-xs font-medium">HNL / mes</span>
                <span className="text-gray-400 text-xs">($20 USD)</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Pago por Transferencia Bancaria (BAC Credomatic)</p>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-700 mb-6 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0 font-bold" />
                <span><b>vCards Ilimitadas</b> + Captura de Leads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0 font-bold" />
                <span><b>Menús Ilimitados</b> + Pedidos a WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0 font-bold" />
                <span><b>🛡️ Escudo Anti-Quejas</b> (5★ a Google / 1-3★ Privado)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0 font-bold" />
                <span><b>🎁 Club de Fidelización & Sellos</b> ilimitado</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0 font-bold" />
                <span><b>🎨 Estudio QR HD (2000px / SVG)</b> con Logos y Degradados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0 font-bold" />
                <span><b>📊 CRM Completo</b> con Exportación a Excel (CSV)</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            {isPro ? (
              <span className="block text-center text-xs font-bold text-purple-700 bg-purple-50 py-2.5 rounded-xl">
                ✓ Plan PRO Activo en tu cuenta
              </span>
            ) : (
              <a
                href="#metodos-pago"
                className="w-full bg-black text-white font-extrabold py-3 px-4 rounded-xl hover:bg-gray-800 transition text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Ver Datos para Transferir por BAC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. MÉTODOS DE PAGO: TRANSFERENCIA BAC CREDOMATIC */}
      {!isPro && (
        <div id="metodos-pago" className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Pago por Transferencia Bancaria (BAC Credomatic Honduras)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Realiza tu transferencia o depósito bancario y adjunta el comprobante aquí abajo para activar tu Plan PRO de inmediato.
            </p>
          </div>

          {/* Tarjeta de Datos Bancarios con Botones de Copiar */}
          <div className="bg-linear-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                  Datos de Cuenta Bancaria Oficial
                </h4>
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                BAC Credomatic
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Número de Cuenta */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Número de Cuenta (BAC):</span>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-gray-900">727138741</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('727138741', 'account')}
                  className="p-2 text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'account' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Nombre del Titular */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Titular de la Cuenta:</span>
                  <span className="font-bold text-gray-900 text-xs sm:text-sm">José Nahun Campos Caballero</span>
                </div>
              </div>

              {/* Número de Identidad */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Número de ID / DNI:</span>
                  <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">0502199000027</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('0502199000027', 'id')}
                  className="p-2 text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'id' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Monto a Transferir */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Monto a Transferir:</span>
                  <span className="font-extrabold text-emerald-700 text-sm sm:text-base">L. 550.00 HNL <span className="text-gray-400 text-xs font-normal">(o $20 USD)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Carga de Comprobante */}
          <form onSubmit={handleSubmitTransfer} className="bg-gray-50/70 p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              Notificar Pago y Adjuntar Comprobante
            </h4>

            {submitSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>¡Comprobante enviado exitosamente! La administración verificará tu transferencia y activará tu Plan PRO a la brevedad.</span>
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-semibold">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Número de Referencia / Transacción *
                </label>
                <input 
                  type="text" 
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ej. 10928374"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Moneda Transferida:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('HNL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      currency === 'HNL'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    L. 550 Lempiras
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      currency === 'USD'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    $20 Dólares
                  </button>
                </div>
              </div>
            </div>

            {/* Subida de Imagen del Comprobante */}
            <div>
              <ImageUploadInput
                name="receipt"
                label="Captura o Fotografía del Comprobante de Pago *"
                defaultValue={receiptUrl}
                shape="square"
                onImageChange={(url) => setReceiptUrl(url)}
                helpText="Sube la captura de pantalla de tu banca móvil o fotografía de la boleta de depósito."
              />
            </div>

            {/* Notas / WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Teléfono de WhatsApp o Nota Adicional (Opcional):
              </label>
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. +504 9999-9999 / Pago realizado desde banca móvil BAC"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-black text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{submitting ? 'Enviando Comprobante...' : 'Enviar Comprobante para Activación'}</span>
              </button>

              <p className="text-[11px] text-gray-400">Activación manual por el administrador en minutos.</p>
            </div>
          </form>
        </div>
      )}

      {/* 4. HISTORIAL DE TRANSFERENCIAS DEL USUARIO */}
      {transfers.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 max-w-4xl mx-auto">
          <h3 className="text-sm font-bold text-gray-900">Historial de Comprobantes Notificados</h3>
          <div className="divide-y divide-gray-100 text-xs">
            {transfers.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-800">Ref: #{t.reference_number} ({t.amount})</p>
                  <p className="text-gray-400 text-[11px]">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  t.status === 'approved' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : t.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.status === 'approved' ? '✓ Aprobado (PRO)' : t.status === 'rejected' ? '✕ Rechazado' : '⏳ En Revisión'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
