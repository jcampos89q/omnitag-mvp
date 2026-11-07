'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Landmark, 
  Check, 
  Loader2, 
  ExternalLink, 
  Banknote, 
  Smartphone 
} from 'lucide-react'
import { BusinessPaymentConfig, updateBusinessPaymentConfigAction } from './actions'
import { showToast } from '@/components/GlobalToast'

interface BusinessPaymentSettingsFormProps {
  initialConfig?: BusinessPaymentConfig | null
}

export default function BusinessPaymentSettingsForm({
  initialConfig
}: BusinessPaymentSettingsFormProps) {
  const [providerName, setProviderName] = useState(initialConfig?.provider_name || 'Tilopay / PixelPay / PayPal')
  const [checkoutUrl, setCheckoutUrl] = useState(initialConfig?.checkout_url || '')
  const [bankName, setBankName] = useState(initialConfig?.bank_name || '')
  const [bankAccountNumber, setBankAccountNumber] = useState(initialConfig?.bank_account_number || '')
  const [bankAccountHolder, setBankAccountHolder] = useState(initialConfig?.bank_account_holder || '')
  const [bankAccountIdDoc, setBankAccountIdDoc] = useState(initialConfig?.bank_account_id_doc || '')
  const [whatsappPayments, setWhatsappPayments] = useState(initialConfig?.whatsapp_payments || '')

  const [acceptCardLink, setAcceptCardLink] = useState(Boolean(initialConfig?.accept_card_link ?? true))
  const [acceptBankTransfer, setAcceptBankTransfer] = useState(Boolean(initialConfig?.accept_bank_transfer ?? true))
  const [acceptCash, setAcceptCash] = useState(Boolean(initialConfig?.accept_cash ?? true))

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.set('provider_name', providerName)
      formData.set('checkout_url', checkoutUrl)
      formData.set('bank_name', bankName)
      formData.set('bank_account_number', bankAccountNumber)
      formData.set('bank_account_holder', bankAccountHolder)
      formData.set('bank_account_id_doc', bankAccountIdDoc)
      formData.set('whatsapp_payments', whatsappPayments)
      formData.set('accept_card_link', String(acceptCardLink))
      formData.set('accept_bank_transfer', String(acceptBankTransfer))
      formData.set('accept_cash', String(acceptCash))

      await updateBusinessPaymentConfigAction(formData)
      setSavedSuccess(true)
      showToast('Pasarela y métodos de cobro guardados.', 'success')
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar tu pasarela de cobro.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Mi Pasarela y Métodos de Cobro a Clientes</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura tu propia pasarela o cuenta bancaria para cobrar tus pedidos, citas, membresías o tarjetas de regalo directamente a tus clientes.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Métodos de cobro actualizados para tus herramientas!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Canales habilitados */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition ${
            acceptCardLink ? 'border-black bg-gray-950 text-white' : 'border-gray-200 bg-gray-50 text-gray-700'
          }`}>
            <input
              type="checkbox"
              checked={acceptCardLink}
              onChange={(e) => setAcceptCardLink(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Pasarela / Link de Tarjeta</span>
          </label>

          <label className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition ${
            acceptBankTransfer ? 'border-black bg-gray-950 text-white' : 'border-gray-200 bg-gray-50 text-gray-700'
          }`}>
            <input
              type="checkbox"
              checked={acceptBankTransfer}
              onChange={(e) => setAcceptBankTransfer(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <Landmark className="w-4 h-4 shrink-0" />
            <span>Transferencia Bancaria</span>
          </label>

          <label className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 cursor-pointer transition ${
            acceptCash ? 'border-black bg-gray-950 text-white' : 'border-gray-200 bg-gray-50 text-gray-700'
          }`}>
            <input
              type="checkbox"
              checked={acceptCash}
              onChange={(e) => setAcceptCash(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <Banknote className="w-4 h-4 shrink-0" />
            <span>Efectivo en Local</span>
          </label>
        </div>

        {/* 1. Link de Pasarela Externa */}
        {acceptCardLink && (
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Pasarela de Pago con Tarjeta (Link de Checkout Propio)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Proveedor de Pasarela (Ej. BAC CompraClick, Tilopay, PixelPay, PayPal, Stripe, Hotmart)
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Ej. BAC CompraClick / PayPal"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  URL de tu Link de Cobro / Suscripción Propia
                </label>
                <input
                  type="url"
                  value={checkoutUrl}
                  onChange={(e) => setCheckoutUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Cuenta Bancaria del Negocio */}
        {acceptBankTransfer && (
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Datos Bancarios de tu Negocio (Para transferencias de tus clientes)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Banco</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ej. BAC Credomatic / Atlántida / Ficohsa"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Número de Cuenta</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Ej. 745001928"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-mono font-bold text-gray-900 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Titular de la Cuenta</label>
                <input
                  type="text"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Nombre de tu empresa o titular"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">DNI / RTN del Titular</label>
                <input
                  type="text"
                  value={bankAccountIdDoc}
                  onChange={(e) => setBankAccountIdDoc(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-mono text-gray-900 focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. WhatsApp de confirmación de cobros */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp de Caja / Recepción de Comprobantes</span>
          </label>
          <input
            type="text"
            value={whatsappPayments}
            onChange={(e) => setWhatsappPayments(e.target.value)}
            placeholder="Ej. +504 9999-9999"
            className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 focus:border-black focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Guardar Métodos de Cobro</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
