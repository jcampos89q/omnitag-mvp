'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Check, 
  Zap, 
  Sparkles, 
  Building2, 
  Copy, 
  CheckCircle2, 
  UploadCloud, 
  Clock, 
  AlertCircle,
  FileCheck,
  ExternalLink,
  ChevronRight,
  ShieldCheck
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
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank')
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
      setSubmitError('Por favor sube la foto o comprobante del pago.')
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
              <span className="text-gray-500 text-xs"> / Gratis para siempre</span>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 1 vCard Digital activa</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 1 Menú / Catálogo (Hasta 10 productos)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 1 Placa / Enlace directo a Google Reviews</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Estudio QR estándar (500px)</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="w-4 h-4 text-center">✕</span> Sin escudo anti-quejas ni sellos</li>
            </ul>
          </div>

          <button 
            disabled={!isPro}
            className="w-full py-2.5 rounded-xl font-bold text-xs border border-gray-200 text-gray-500 disabled:opacity-60 bg-gray-50"
          >
            {!isPro ? 'Plan Actual' : 'Plan Básico'}
          </button>
        </div>

        {/* PLAN PRO */}
        <div className="border-2 border-black rounded-2xl p-6 sm:p-7 bg-white flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl tracking-wider">
            ⭐ RECOMENDADO
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-lg font-extrabold text-gray-900">Plan PRO Ilimitado</h3>
            </div>
            <p className="text-gray-500 text-xs mb-4">El ecosistema completo para multiplicar clientes y ventas.</p>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">L. 550</span>
                <span className="text-sm text-gray-500 font-medium">HNL / mes</span>
                <span className="text-xs text-gray-400">(o $20 USD / mes)</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-800 font-medium mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black font-bold shrink-0" />
                <span>vCards, Menús y Placas <b>Ilimitadas</b></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black font-bold shrink-0" />
                <span><b>Escudo Inteligente de Reseñas de Google</b> (5★ vs Buzón Privado)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black font-bold shrink-0" />
                <span><b>Club de Fidelización & Tarjeta de Sellos</b> para clientes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black font-bold shrink-0" />
                <span><b>Estudio QR HD (2000px)</b> con degradados Instagram y Logos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black font-bold shrink-0" />
                <span><b>CRM & Exportación a Excel (CSV)</b> para WhatsApp Marketing</span>
              </li>
            </ul>
          </div>

          {isPro ? (
            <div className="w-full bg-emerald-50 text-emerald-800 font-bold py-2.5 rounded-xl border border-emerald-200 text-xs text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Suscripción PRO Activa</span>
            </div>
          ) : (
            <a
              href="#metodos-pago"
              className="w-full bg-black text-white font-extrabold py-3 rounded-xl hover:bg-gray-800 transition text-xs sm:text-sm text-center shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Mejorar a PRO por L. 550 / $20</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* 3. MÉTODOS DE PAGO Y FORMULARIO DE TRANSFERENCIA BAC */}
      {!isPro && (
        <div id="metodos-pago" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Opciones de Pago para Activar tu Plan PRO
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Elige cómo deseas realizar tu pago mensual (L. 550 HNL o $20 USD):
            </p>
          </div>

          {/* Selector de Método */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                paymentMethod === 'bank'
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <Building2 className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <h4 className="font-bold text-sm">Transferencia Bancaria / ACH (BAC)</h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Paga en Lempiras (L. 550) o Dólares ($20) mediante transferencia o depósito bancario.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                paymentMethod === 'card'
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <CreditCard className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
              <div>
                <h4 className="font-bold text-sm">Tarjeta de Débito / Crédito (Online)</h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Pago recurrente automático con Visa, Mastercard o American Express ($20 USD).
                </p>
              </div>
            </button>
          </div>

          {/* OPCIÓN 1: TRANSFERENCIA BANCARIA BAC */}
          {paymentMethod === 'bank' && (
            <div className="space-y-6 pt-2 animate-in fade-in">
              {/* Tarjeta de Datos Bancarios con Botones de Copiar */}
              <div className="bg-linear-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                      Datos de Cuenta Bancaria Oficial (Honduras)
                    </h3>
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
                      placeholder="Ej. 984521034 o REF-1234"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Moneda Transferida
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                    >
                      <option value="HNL">Lempiras (L. 550 HNL)</option>
                      <option value="USD">Dólares ($20 USD)</option>
                    </select>
                  </div>
                </div>

                {/* Subida del Comprobante */}
                <div>
                  <ImageUploadInput
                    name="receipt"
                    label="Foto o Captura del Comprobante / Recibo de Transferencia *"
                    defaultValue={receiptUrl}
                    onImageChange={(url) => setReceiptUrl(url)}
                    helpText="Sube la captura de pantalla de la banca en línea de BAC o la foto del comprobante."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número de Teléfono / WhatsApp o Notas adicionales (Opcional):
                  </label>
                  <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. +504 9988-7766 - Pago realizado desde banca móvil BAC"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-black text-white font-extrabold py-3 px-6 rounded-xl hover:bg-gray-800 transition text-xs sm:text-sm shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{submitting ? 'Enviando Comprobante...' : 'Enviar Comprobante para Activación'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OPCIÓN 2: TARJETA DE CRÉDITO ONLINE */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 pt-2 animate-in fade-in">
              <div className="p-5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs sm:text-sm text-blue-900 space-y-2">
                <p className="font-bold">Pago en línea con Tarjeta Internacional ($20 USD / mes):</p>
                <p className="opacity-80">
                  Procesamiento seguro encriptado con Stripe. Tu plan se activará inmediatamente en el segundo en que completes el pago.
                </p>
              </div>

              <form action="/api/stripe/checkout" method="POST">
                <button 
                  type="submit" 
                  className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceder al Pago Seguro con Tarjeta ($20 USD)</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
