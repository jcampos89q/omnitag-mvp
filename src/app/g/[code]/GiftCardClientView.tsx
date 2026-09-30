'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Gift, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Calendar, 
  Printer, 
  Phone, 
  Store, 
  ArrowRight,
  Receipt,
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Smartphone
} from 'lucide-react'
import { getGoogleWalletGiftCardUrl } from '@/app/dashboard/gift-cards/actions'

interface Props {
  card: any
  business: {
    name: string
    slug: string | null
    contact: any
    avatar: string | null
    logo?: string | null
  }
  redemptions: any[]
}

export default function GiftCardClientView({ card, business, redemptions }: Props) {
  const [showPin, setShowPin] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isWalletLoading, setIsWalletLoading] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)

  const isRedeemed = card.status === 'redeemed'
  const isCancelled = card.status === 'cancelled'
  const isExpired = card.expires_at && new Date() > new Date(card.expires_at)
  const isAvailable = card.status === 'active' && !isExpired

  // Teléfono de contacto para WhatsApp
  const phone = business.contact?.phone || business.contact?.whatsapp || ''
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const whatsappBookingUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${business.name}, tengo el Certificado de Regalo #${card.code} a nombre de ${card.recipient_name} y me gustaría agendar una cita para canjearlo.`)}`
    : null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(card.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  // Guardar en Google Wallet
  const handleAddToGoogleWallet = async () => {
    setIsWalletLoading(true)
    setWalletError(null)
    try {
      const origin = window.location.origin
      const res = await getGoogleWalletGiftCardUrl(card.code, origin)
      if (res.success && res.url) {
        window.open(res.url, '_blank')
      } else {
        setWalletError(res.error || 'No se pudo generar el pase de Google Wallet.')
      }
    } catch (err: any) {
      setWalletError(err.message || 'Error al conectar con Google Wallet.')
    } finally {
      setIsWalletLoading(false)
    }
  }

  // Generador de QR usando la URL del voucher
  const voucherUrl = typeof window !== 'undefined' ? window.location.href : `https://www.omnitag.site/g/${card.code}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(voucherUrl)}&format=svg&qzone=1`

  // Logo de la empresa
  const businessLogo = card.logo_url || business.logo || business.avatar

  // Fecha de expiración formateada
  const formattedExpiry = card.expires_at 
    ? new Date(card.expires_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Sin fecha de vencimiento'

  const formattedCreated = new Date(card.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })

  // Estilos y acabados según el tema de la tarjeta
  const theme = card.theme_color || '#18181b'
  const isBlackGold = theme === '#18181b' || card.card_image_url === 'luxury_gold'
  const isSpaRose = theme === '#ec4899' || card.card_image_url === 'spa_rose'
  const isEmerald = theme === '#059669' || card.card_image_url === 'emerald_botanic'
  const isChampagne = theme === '#d97706' || card.card_image_url === 'champagne'
  const isFestive = theme === '#dc2626' || card.card_image_url === 'festive_red'

  return (
    <>
      {/* ============================================================== */}
      {/* 1. VISTA DE PANTALLA DIGITAL (MÓVIL / PWA)                      */}
      {/* ============================================================== */}
      <div className="w-full max-w-md mx-auto space-y-5 print:hidden">
        {/* TARJETA FÍSICA REALISTA DE REGALO */}
        <div 
          className="w-full rounded-[26px] shadow-2xl relative overflow-hidden transition-all duration-300 transform hover:scale-[1.01] border-2 border-white/20 select-none text-white"
          style={{
            minHeight: '390px',
            backgroundColor: theme,
            backgroundImage: isBlackGold
              ? 'linear-gradient(135deg, #111113 0%, #1f1f23 35%, #2a2015 70%, #111113 100%)'
              : isSpaRose
              ? 'linear-gradient(135deg, #831843 0%, #be185d 40%, #ec4899 80%, #f472b6 100%)'
              : isEmerald
              ? 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #047857 75%, #059669 100%)'
              : isChampagne
              ? 'linear-gradient(135deg, #451a03 0%, #78350f 35%, #b45309 70%, #d97706 100%)'
              : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #dc2626 80%, #ef4444 100%)'
          }}
        >
          {/* Textura de grano y reflejos metálicos dorados */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_40%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.12)_35%,rgba(255,255,255,0.22)_40%,transparent_50%)] pointer-events-none" />

          {/* Lazo / Cinta de seda tradicional (Efecto Ribbon 3D) */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="p-6 sm:p-7 relative z-10 flex flex-col justify-between h-full min-h-[390px]">
            {/* Header de la Tarjeta */}
            <div>
              <div className="flex items-center justify-between mb-4">
                {/* Chip Inteligente EMV Dorado y Sello */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-sm flex flex-col justify-around p-1 opacity-90">
                    <div className="w-full h-px bg-amber-800/40" />
                    <div className="w-full h-px bg-amber-800/40" />
                    <div className="w-full h-px bg-amber-800/40" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200/90 drop-shadow-xs">
                    GIFT CARD
                  </span>
                </div>

                {/* Badge de Estado */}
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm ${
                  isRedeemed 
                    ? 'bg-black/60 text-gray-300 border border-white/20' 
                    : isCancelled 
                    ? 'bg-red-900/80 text-red-200 border border-red-400/30' 
                    : isExpired 
                    ? 'bg-amber-900/80 text-amber-200 border border-amber-400/30' 
                    : 'bg-white text-gray-950 font-black'
                }`}>
                  {isRedeemed ? 'Canjeada' : isCancelled ? 'Anulada' : isExpired ? 'Expirada' : 'Activa'}
                </span>
              </div>

              {/* Logo y Nombre Comercial */}
              <div className="flex items-center gap-3.5 my-3">
                {businessLogo ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/95 p-1 border-2 border-amber-300/60 shadow-lg shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={businessLogo} alt={business.name} className="object-contain w-full h-full" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/25 border-2 border-amber-300/40 flex items-center justify-center shrink-0 shadow-md">
                    <Store className="w-5 h-5 text-amber-300" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-serif font-black tracking-tight text-white drop-shadow-md leading-tight">
                    {business.name}
                  </h2>
                  <p className="text-xs font-semibold text-amber-200/90 tracking-wide">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Dedicatoria y Destinatario */}
            <div className="my-2 py-3 border-y border-white/20 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">Para:</span>
                <span className="font-serif font-black text-sm tracking-wide text-white drop-shadow-xs">
                  {card.recipient_name}
                </span>
              </div>
              {card.buyer_name && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">De:</span>
                  <span className="font-bold text-white/95">{card.buyer_name}</span>
                </div>
              )}
              {card.gift_message && (
                <p className="text-xs italic text-amber-100 bg-black/25 p-2.5 rounded-xl border border-white/10 mt-2 leading-relaxed">
                  "{card.gift_message}"
                </p>
              )}
            </div>

            {/* Saldo y Código Embossed (Relieve) */}
            <div className="pt-2 flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200/80 block">
                  {card.card_type === 'service' ? 'Servicio Incluido' : 'Saldo Disponible'}
                </span>
                <span className="text-3xl font-serif font-black tracking-tight text-white drop-shadow-md">
                  {card.card_type === 'service' 
                    ? (isRedeemed ? 'Servicio Canjeado' : card.service_name || '1x Servicio Completo')
                    : `${card.currency_symbol} ${Number(card.current_balance).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="text-right">
                {/* Código con espaciado como tarjeta bancaria */}
                <span className="text-xs font-mono font-black tracking-[0.2em] bg-black/50 backdrop-blur-sm px-3 py-1 rounded-xl text-amber-200 border border-amber-300/40 block shadow-inner">
                  {card.code}
                </span>
                <span className="text-[9px] text-white/60 font-mono mt-1 block">
                  {card.expires_at ? `Vence: ${new Date(card.expires_at).toLocaleDateString('es-HN')}` : 'Sin vencimiento'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL: GUARDAR EN GOOGLE WALLET */}
        <div className="space-y-2">
          <button
            onClick={handleAddToGoogleWallet}
            disabled={isWalletLoading}
            className="w-full bg-slate-900 hover:bg-black text-white p-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 border border-slate-700 shadow-xl hover:shadow-2xl cursor-pointer group"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <span>{isWalletLoading ? 'Generando Pase...' : 'Guardar en Google Wallet'}</span>
          </button>

          {walletError && (
            <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-800 text-center font-medium">
              {walletError}
            </p>
          )}
        </div>

        {/* CÓDIGO QR Y CANJE EN CAJA */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-5 text-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presenta este voucher al pagar</span>
            </span>
            <h4 className="text-base font-black text-gray-900">
              Escanea o dicta tu código en el local
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              El personal de {business.name} validará tu saldo al instante.
            </p>
          </div>

          {/* QR Code */}
          <div className="relative inline-block p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt={`QR Gift Card ${card.code}`}
              width={180}
              height={180}
              className="w-44 h-44 mx-auto rounded-lg"
            />
            <div className="mt-2 text-center">
              <span className="text-xs font-mono font-black text-gray-800 tracking-widest bg-white px-2.5 py-0.5 rounded border border-gray-200">
                {card.code}
              </span>
            </div>
          </div>

          {/* PIN DE SEGURIDAD (Solo si la tarjeta requiere PIN) */}
          {card.require_pin !== false ? (
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  PIN de Seguridad en Caja
                </span>
                <span className="text-base font-mono font-black text-gray-900 tracking-widest">
                  {showPin ? card.security_pin : '••••'}
                </span>
              </div>

              <button
                onClick={() => setShowPin(!showPin)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer shadow-xs"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPin ? 'Ocultar' : 'Revelar PIN'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tarjeta al portador (Sin PIN requerido en caja)</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="space-y-2.5 pt-1">
            {whatsappBookingUrl && isAvailable && (
              <a
                href={whatsappBookingUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Agendar Cita en WhatsApp</span>
              </a>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition cursor-pointer border border-amber-200 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-700" />
                <span>Imprimir Certificado</span>
              </button>
            </div>

            {business.slug && (
              <Link
                href={`/v/${business.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 transition pt-1"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Ver catálogo y servicios de {business.name}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Historial de Consumos Realizados */}
        {redemptions && redemptions.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-xs border-b border-gray-100 pb-2">
              <Receipt className="w-4 h-4 text-gray-500" />
              <span>Historial de Consumos Realizados</span>
            </div>

            <div className="space-y-2">
              {redemptions.map((r) => (
                <div key={r.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">{r.notes || 'Consumo en mostrador'}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600">
                      - {card.currency_symbol} {Number(r.amount).toFixed(2)}
                    </span>
                    <p className="text-[10px] text-gray-400">
                      Saldo restante: {card.currency_symbol} {Number(r.new_balance).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. CERTIFICADO TRADICIONAL DE LUJO IMPRIMIBLE (1 PÁGINA)       */}
      {/* Estilo Cheque / Voucher de Alta Joyería y Spa Tradicional      */}
      {/* ============================================================== */}
      <div 
        className="hidden print:block w-full max-w-[850px] mx-auto bg-[#fcfaf6] text-slate-900 p-8 rounded-none border-[8px] border-[#78350f] outline outline-2 outline-[#b45309] relative shadow-none"
        style={{
          boxSizing: 'border-box',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          fontFamily: 'serif'
        }}
      >
        {/* Filigrana Victoriana Clásica en las 4 esquinas */}
        <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-[#b45309]" />
        <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-[#b45309]" />
        <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-[#b45309]" />
        <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-[#b45309]" />

        {/* Marco interno fino con arabescos */}
        <div className="border-2 border-[#b45309]/50 p-6 space-y-5 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),transparent)]">
          {/* Encabezado del Certificado Tradicional */}
          <div className="text-center space-y-2 pb-4 border-b-2 border-[#b45309]/40">
            {businessLogo ? (
              <div className="w-16 h-16 mx-auto mb-2 rounded-xl overflow-hidden p-1.5 bg-white border-2 border-[#b45309]/40 inline-block shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={businessLogo} alt={business.name} className="object-contain w-full h-full" />
              </div>
            ) : null}

            <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-[#78350f]">
              {business.name}
            </h1>

            <div className="inline-flex items-center gap-4">
              <span className="h-0.5 w-16 bg-[#b45309]" />
              <span className="text-xs font-black tracking-[0.35em] uppercase text-[#92400e]">
                CERTIFICADO DE REGALO
              </span>
              <span className="h-0.5 w-16 bg-[#b45309]" />
            </div>

            <p className="text-xs text-slate-700 font-sans font-semibold tracking-wide">
              {card.title}
            </p>
          </div>

          {/* Cuerpo Central del Certificado Tradicional */}
          <div className="space-y-4 text-center py-2">
            <div>
              <span className="text-[11px] uppercase font-sans font-bold tracking-[0.25em] text-[#92400e] block">
                ESTE CERTIFICADO ACREDITA CON CARIÑO A:
              </span>
              <p className="text-3xl font-serif font-black text-slate-900 tracking-wide mt-1 text-center italic">
                {card.recipient_name}
              </p>
            </div>

            {card.buyer_name && (
              <p className="text-xs text-slate-700 font-sans">
                De parte de: <strong className="text-slate-900 font-bold">{card.buyer_name}</strong>
              </p>
            )}

            {card.gift_message && (
              <div className="max-w-md mx-auto bg-white/80 p-3 rounded-xl border border-[#b45309]/30 shadow-xs">
                <p className="text-xs italic text-slate-800 leading-relaxed font-serif">
                  "{card.gift_message}"
                </p>
              </div>
            )}

            {/* Recuadro Ornamental de Valor */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-sans font-bold tracking-[0.25em] text-[#92400e] block">
                VALOR DEL CERTIFICADO:
              </span>
              <div className="inline-block bg-white px-8 py-2.5 rounded-xl border-2 border-[#b45309] shadow-sm mt-1">
                <span className="text-3xl font-serif font-black text-[#78350f]">
                  {card.card_type === 'service'
                    ? (card.service_name || '1x Servicio Completo')
                    : `${card.currency_symbol} ${Number(card.current_balance).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer de Seguridad y Firma (Protección de PIN) */}
          <div className="pt-4 border-t-2 border-[#b45309]/40 grid grid-cols-3 items-center gap-4 text-left font-sans">
            {/* 1. Código QR Oficial */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="QR Voucher"
                className="w-20 h-20 border-2 border-[#b45309]/40 rounded p-1 bg-white shrink-0"
              />
              <div className="text-[10px] space-y-0.5">
                <span className="font-bold text-slate-600 block uppercase">N° Serie:</span>
                <span className="font-mono font-black text-sm text-slate-900 block">
                  {card.code}
                </span>
                <span className="text-[8px] text-slate-500 block">Escanear en mostrador</span>
              </div>
            </div>

            {/* 2. Zona de Seguridad Confidencial (El PIN NO se expone a la vista de extraños) */}
            <div className="text-center bg-white p-2.5 rounded-xl border border-[#b45309]/40">
              <div className="flex items-center justify-center gap-1 text-[#92400e] text-[9px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SEGURIDAD DE CANJE</span>
              </div>
              
              {card.require_pin !== false ? (
                <p className="text-[9px] text-slate-600 font-medium mt-1 leading-tight">
                  🔒 PIN de Seguridad confidencial enviado al móvil del titular.
                </p>
              ) : (
                <p className="text-[9px] text-emerald-800 font-bold mt-1 leading-tight">
                  ✓ Certificado oficial al portador válido con firma autorizada.
                </p>
              )}
            </div>

            {/* 3. Validez y Firma Formal */}
            <div className="text-right text-[10px] space-y-1">
              <p className="text-slate-700">
                <strong>Emisión:</strong> {formattedCreated}
              </p>
              <p className="text-slate-700">
                <strong>Vence:</strong> <span className="font-bold text-[#92400e]">{formattedExpiry}</span>
              </p>
              <div className="pt-3">
                <div className="border-b border-slate-400 w-32 ml-auto" />
                <span className="text-[8px] uppercase text-slate-500 block mt-0.5">
                  Firma o Sello Autorizado
                </span>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-500 pt-1 font-sans">
            Certificado emitido con tecnología OmniTag. Válido únicamente en establecimientos autorizados de {business.name}.
          </div>
        </div>
      </div>
    </>
  )
}
