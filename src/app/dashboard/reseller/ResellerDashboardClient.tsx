'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Users,
  Palette,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Loader2,
  Globe,
  Phone,
  Link2,
  Calendar,
  Ban,
  Sparkles,
  Crown,
  ExternalLink,
  Eye,
  ArrowRight
} from 'lucide-react'
import { INDUSTRIES, SELECTABLE_INDUSTRY_IDS, SelectableIndustryId, getIndustryConfig } from '@/lib/industries'
import type { WhiteLabelBrandConfig } from '@/lib/whitelabel'
import {
  saveWhiteLabelBrandAction,
  createResellerSubClientAction,
  manageSubClientPlanAction,
  adminConfigureDistributorAction,
  adminQuickManageAgencyAction,
  switchAdminAgencyModeAction
} from './actions'
import { startImpersonation } from '@/app/dashboard/admin/impersonateActions'
import { showToast } from '@/components/GlobalToast'

export interface SubClientItem {
  id: string
  email: string
  full_name: string
  industry: string
  subscription_expires_at: string | null
  created_at: string
  parent_reseller_id?: string | null
  reseller_brand_name?: string | null
}

export interface DistributorSummaryItem {
  id: string
  email: string
  full_name: string
  brand_name: string
  logo_url?: string
  quota: number
  used_clients: number
  expires_at: string | null
  is_active: boolean
  is_owner_agency?: boolean
}

interface ResellerDashboardClientProps {
  resellerId: string
  resellerEmail: string
  isAdmin: boolean
  viewMode?: 'master' | 'agency'
  isResellerActive: boolean
  quota: number
  expiresAt: string | null
  initialBrandConfig: WhiteLabelBrandConfig
  subClients: SubClientItem[]
  allDistributors: DistributorSummaryItem[]
}

export default function ResellerDashboardClient({
  resellerId,
  resellerEmail,
  isAdmin,
  viewMode = 'agency',
  isResellerActive,
  quota,
  expiresAt,
  initialBrandConfig,
  subClients,
  allDistributors
}: ResellerDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'clients' | 'brand'>('clients')
  const [copiedLink, setCopiedLink] = useState(false)
  const [loadingAgencyId, setLoadingAgencyId] = useState<string | null>(null)
  const [showNewAgencyPassword, setShowNewAgencyPassword] = useState(false)

  // Estado formulario crear sub-cliente
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [newClientIndustry, setNewClientIndustry] = useState<SelectableIndustryId>('restaurant')

  // Estado formulario marca blanca
  const [savingBrand, setSavingBrand] = useState(false)
  const [brandName, setBrandName] = useState(initialBrandConfig.brand_name || '')
  const [logoUrl, setLogoUrl] = useState(initialBrandConfig.logo_url || '')

  // Estado acciones sobre sub-clientes
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null)

  // Estado formulario Super Admin para alta de distribuidor
  const [savingDistributor, setSavingDistributor] = useState(false)

  const [copiedLoginLink, setCopiedLoginLink] = useState(false)

  const partnerRegisterUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/register?partner=${resellerId}`
    : `https://www.omnitag.site/register?partner=${resellerId}`

  const partnerLoginUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/login?partner=${resellerId}`
    : `https://www.omnitag.site/login?partner=${resellerId}`

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(partnerRegisterUrl)
    setCopiedLink(true)
    showToast('Enlace de registro Marca Blanca copiado al portapapeles', 'success')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyLoginLink = () => {
    navigator.clipboard.writeText(partnerLoginUrl)
    setCopiedLoginLink(true)
    showToast('Portal de Acceso de tu Agencia copiado al portapapeles', 'success')
    setTimeout(() => setCopiedLoginLink(false), 2500)
  }

  const handleCreateSubClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreatingClient(true)
    try {
      const formData = new FormData(e.currentTarget)
      formData.set('industry', newClientIndustry)
      const res = await createResellerSubClientAction(formData)
      showToast(`Cliente ${res.email} creado con éxito bajo tu Marca Blanca`, 'success')
      setShowCreateForm(false)
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error al crear el sub-cliente', 'error')
    } finally {
      setCreatingClient(false)
    }
  }

  const handleManageClientPlan = async (clientId: string, actionType: 'add_30' | 'add_365' | 'suspend') => {
    setLoadingClientId(clientId)
    try {
      const fd = new FormData()
      fd.set('client_id', clientId)
      fd.set('action_type', actionType)
      await manageSubClientPlanAction(fd)
      showToast('Suscripción del cliente actualizada correctamente', 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'No se pudo actualizar el cliente', 'error')
    } finally {
      setLoadingClientId(null)
    }
  }

  const handleSaveBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingBrand(true)
    try {
      const formData = new FormData(e.currentTarget)
      await saveWhiteLabelBrandAction(formData)
      showToast('Configuración de Marca Blanca guardada con éxito', 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error al guardar tu Marca Blanca', 'error')
    } finally {
      setSavingBrand(false)
    }
  }

  const handleAdminSaveDistributor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingDistributor(true)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await adminConfigureDistributorAction(formData)
      showToast(`Suscriptor Agencia ${res.email} actualizado (Cupo: ${res.quota} clientes)`, 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error al configurar la agencia', 'error')
    } finally {
      setSavingDistributor(false)
    }
  }

  const handleQuickAgencyManage = async (
    agencyId: string,
    actionType: 'add_30' | 'add_365' | 'suspend' | 'set_quota',
    newQuota?: number
  ) => {
    setLoadingAgencyId(agencyId)
    try {
      const fd = new FormData()
      fd.set('agency_id', agencyId)
      fd.set('action_type', actionType)
      if (newQuota) fd.set('quota', String(newQuota))
      await adminQuickManageAgencyAction(fd)
      showToast('Suscripción de la Agencia actualizada con éxito', 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'No se pudo actualizar la Agencia', 'error')
    } finally {
      setLoadingAgencyId(null)
    }
  }

  const handleSwitchRoleMode = async (enableAgencyMode: boolean) => {
    setLoadingAgencyId('role_switch')
    try {
      await switchAdminAgencyModeAction(enableAgencyMode)
      router.push(enableAgencyMode ? '/dashboard/reseller?view=agency' : '/dashboard/reseller?view=master')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'No se pudo cambiar el modo de vista', 'error')
    } finally {
      setLoadingAgencyId(null)
    }
  }

  const handleEnterAgencyConsole = async (dist: DistributorSummaryItem) => {
    if (dist.id === resellerId) {
      await handleSwitchRoleMode(true)
      return
    }
    setLoadingAgencyId(dist.id)
    try {
      await startImpersonation(dist.id)
    } catch (err: any) {
      showToast(err.message || 'Error al entrar a la consola de la agencia', 'error')
      setLoadingAgencyId(null)
    }
  }

  const isMasterMode = Boolean(isAdmin && viewMode === 'master')

  return (
    <div className="space-y-6">
      {/* CUADRÍCULA VISUAL DE ACCESO RÁPIDO MASTER (CUANDO ESTÁS EN PANEL ADMIN) */}
      {isMasterMode && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => handleSwitchRoleMode(false)}
            className="p-4 rounded-2xl border-2 border-purple-600 bg-gradient-to-b from-purple-50/90 to-white text-left space-y-2 shadow-2xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-xs sm:text-sm text-gray-950">Suscriptores Agencias</p>
              <p className="text-[11px] text-gray-500">{allDistributors.length} agencias activas</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchRoleMode(true)}
            className="p-4 rounded-2xl border border-gray-200 hover:border-indigo-400 bg-gradient-to-b from-indigo-50/60 to-white text-left space-y-2 transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-xs sm:text-sm text-gray-950">Mi Propia Agencia</p>
              <p className="text-[11px] text-gray-500">Usados: {subClients.length} / {quota} cupos</p>
            </div>
          </button>

          <Link
            href="/dashboard/admin"
            className="p-4 rounded-2xl border border-gray-200 hover:border-blue-400 bg-gradient-to-b from-blue-50/60 to-white text-left space-y-2 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-xs sm:text-sm text-gray-950">Usuarios & Pagos</p>
              <p className="text-[11px] text-gray-500">Base de datos global</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin?tab=nfc-batches"
            className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/60 to-white text-left space-y-2 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-xs sm:text-sm text-gray-950">Lotes Tarjetas NFC</p>
              <p className="text-[11px] text-gray-500">Generar e imprimir lotes</p>
            </div>
          </Link>
        </div>
      )}

      {/* CUADRÍCULA VISUAL DE NAVEGACIÓN PARA EL PARTNER (CUANDO ESTÁS EN TU CONSOLA DE AGENCIA) */}
      {!isMasterMode && (
        <div className="space-y-3">
          {isAdmin && (
            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-2xl px-4 py-2.5">
              <span className="text-xs font-bold text-purple-900">
                🏢 Estás viendo tu Consola de Partner / Agencia Suscriptora (tal como la ve quien te compra una licencia)
              </span>
              <button
                type="button"
                disabled={loadingAgencyId === 'role_switch'}
                onClick={() => handleSwitchRoleMode(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition cursor-pointer shrink-0"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Volver a Panel Admin Master</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                activeTab === 'clients' && !showCreateForm
                  ? 'border-2 border-indigo-600 bg-gradient-to-b from-indigo-50/90 to-white shadow-xs'
                  : 'border-gray-200 hover:border-indigo-300 bg-white hover:shadow-xs'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-gray-950">Cartera de Clientes</p>
                <p className="text-[11px] text-gray-500">{subClients.length} de {quota} cupos activos</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('clients')
                setShowCreateForm(true)
              }}
              className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                activeTab === 'clients' && showCreateForm
                  ? 'border-2 border-emerald-600 bg-gradient-to-b from-emerald-50/90 to-white shadow-xs'
                  : 'border-gray-200 hover:border-emerald-300 bg-white hover:shadow-xs'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-gray-950">Nuevo Sub-Cliente</p>
                <p className="text-[11px] text-gray-500">Crear negocio y asignar giro</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('brand')}
              className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                activeTab === 'brand'
                  ? 'border-2 border-purple-600 bg-gradient-to-b from-purple-50/90 to-white shadow-xs'
                  : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-xs'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-gray-950">Mi Marca & Precios</p>
                <p className="text-[11px] text-gray-500">Logo, pasarela y cuánto cobras</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="p-4 rounded-2xl border border-gray-200 hover:border-amber-400 bg-gradient-to-b from-amber-50/50 to-white text-left space-y-2 transition cursor-pointer hover:shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                {copiedLink ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-black text-xs sm:text-sm text-gray-950">
                  {copiedLink ? '¡Link Copiado!' : 'Link de Registro'}
                </p>
                <p className="text-[11px] text-gray-500">Copiar invitación con tu marca</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Encabezado Principal diferenciado según el modo */}
      <div className={`rounded-3xl p-6 sm:p-8 shadow-xl border text-white ${
        isMasterMode
          ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-purple-500/30'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-extrabold uppercase tracking-wider">
              {isMasterMode ? <Crown className="w-3.5 h-3.5 text-amber-300" /> : <Building2 className="w-3.5 h-3.5" />}
              <span>
                {isMasterMode
                  ? 'Panel Master OmniTag • Administración de Suscriptores Marca Blanca'
                  : 'Consola de Agencia Suscriptora • Marca Blanca'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isMasterMode
                ? 'Suscriptores de Marca Blanca & Agencias'
                : `Mi Agencia: ${initialBrandConfig.brand_name || 'Configura tu Marca'}`}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isMasterMode
                ? 'Administra todas las Agencias suscritas a OmniTag (incluida tu propia cuenta de Agencia como un suscriptor más). Asigna cupos de 10, 25 o 100 clientes, renueva vigencias o crea nuevas agencias.'
                : 'Administra tu propia cartera de clientes, tu logo y tu pasarela de cobro exactamente igual que cualquier suscriptor de Marca Blanca.'}
            </p>
          </div>

          {/* Tarjeta de Cupo */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[230px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              {isMasterMode ? 'Agencias Registradas' : 'Tu Cupo de Agencia'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">
                {isMasterMode ? allDistributors.length : subClients.length}
              </span>
              <span className="text-sm font-bold text-slate-300">
                / {isMasterMode ? 'Agencias' : `${quota} clientes`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {isMasterMode
                  ? 'Control Global de Licencias'
                  : isResellerActive
                  ? expiresAt
                    ? `Vigente hasta ${new Date(expiresAt).toLocaleDateString()}`
                    : 'Suscripción de Agencia Activa'
                  : 'Suscripción de Agencia Vencida'}
              </span>
            </div>
          </div>
        </div>

        {/* Enlaces de Invitación y Portal de Acceso de Marca Blanca */}
        {!isMasterMode && (
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Portal de Acceso / Login de tus Clientes: </span>
                Tus clientes entrarán desde aquí viendo tu marca y sin enlaces a OmniTag:
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/15 rounded-xl px-3 py-1.5">
                <code className="text-xs text-emerald-300 truncate max-w-[200px] sm:max-w-xs">
                  {partnerLoginUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyLoginLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {copiedLoginLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLoginLink ? 'Copiado' : 'Copiar Login'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Link de Registro Directo: </span>
                Para que nuevos negocios se registren bajo tu marca:
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/15 rounded-xl px-3 py-1.5">
                <code className="text-xs text-indigo-200 truncate max-w-[200px] sm:max-w-xs">
                  {partnerRegisterUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copiado' : 'Copiar Registro'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pestañas de Navegación (Solo para la vista de Mi Agencia) */}
      {!isMasterMode && (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Mis Sub-Clientes ({subClients.length} / {quota})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'brand'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            Configurar Mi Marca Blanca & Pasarela
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 1: PANEL MASTER DE SUSCRIPTORES DE MARCA BLANCA / AGENCIAS      */}
      {/* ===================================================================== */}
      {isMasterMode && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-purple-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md mb-1">
                  <Crown className="w-3.5 h-3.5" /> Alta / Renovación de Suscriptor de Agencia
                </span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Crear Nueva Agencia o Actualizar Suscriptor Existente
                </h2>
                <p className="text-xs text-gray-500">
                  Puedes ingresar tu propio correo (<code>{resellerEmail}</code>) o el de cualquier agencia para asignarle su plan (10, 25 o 100 clientes). Si el correo no existe, marca "Es una cuenta nueva" para crearla al instante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAgencyPassword(!showNewAgencyPassword)}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl transition cursor-pointer shrink-0"
              >
                {showNewAgencyPassword ? 'Ocultar campos de cuenta nueva' : '+ Crear Cuenta de Agencia desde Cero'}
              </button>
            </div>

            <form onSubmit={handleAdminSaveDistributor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Correo de la Agencia Suscriptora *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="agencia@ejemplo.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Plan / Cupo de Clientes
                  </label>
                  <select
                    name="quota"
                    defaultValue="25"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                  >
                    <option value="10">Starter Partner (10 Clientes)</option>
                    <option value="25">Agency Partner (25 Clientes)</option>
                    <option value="100">Country Partner (100 Clientes)</option>
                    <option value="500">Master Partner (500 Clientes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Vigencia Suscripción
                  </label>
                  <select
                    name="duration_days"
                    defaultValue="30"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                  >
                    <option value="30">+30 Días (Mensual)</option>
                    <option value="90">+90 Días (Trimestral)</option>
                    <option value="365">+365 Días (1 Año)</option>
                  </select>
                </div>

                <div>
                  <input type="hidden" name="enable_reseller" value="true" />
                  <button
                    type="submit"
                    disabled={savingDistributor}
                    className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingDistributor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Guardar Agencia</span>
                  </button>
                </div>
              </div>

              {showNewAgencyPassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nombre Comercial / Marca Blanca Inicial
                    </label>
                    <input
                      type="text"
                      name="brand_name"
                      placeholder="Ej. Mi Agencia Digital"
                      className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Contraseña Inicial (Si el correo aún no existe)
                    </label>
                    <input
                      type="text"
                      name="password"
                      defaultValue="Agencia2026*"
                      minLength={6}
                      className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Tabla de Suscriptores de Marca Blanca (Incluida la cuenta de Agencia del Dueño) */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Suscriptores de Marca Blanca & Agencias ({allDistributors.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Tu propia cuenta de Agencia aparece en esta lista y se administra con los mismos botones que cualquier suscriptor.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase text-gray-500">
                    <th className="py-3 px-4">Suscriptor / Agencia</th>
                    <th className="py-3 px-4">Marca Blanca</th>
                    <th className="py-3 px-4">Plan / Cupo Usado</th>
                    <th className="py-3 px-4">Vencimiento</th>
                    <th className="py-3 px-4 text-right">Administrar como Suscriptor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {allDistributors.map((dist) => (
                    <tr key={dist.id} className={dist.is_owner_agency ? 'bg-purple-50/40 hover:bg-purple-50/70' : 'hover:bg-gray-50/70'}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">{dist.full_name || 'Sin nombre'}</p>
                          {dist.is_owner_agency && (
                            <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
                              Tu Cuenta de Agencia
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{dist.email}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {dist.logo_url ? (
                            <img src={dist.logo_url} alt={dist.brand_name} className="w-6 h-6 rounded object-contain border border-gray-200" />
                          ) : (
                            <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                          )}
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">{dist.brand_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                            {dist.used_clients} / {dist.quota} clientes
                          </span>
                          <select
                            value={dist.quota}
                            disabled={loadingAgencyId === dist.id}
                            onChange={(e) => handleQuickAgencyManage(dist.id, 'set_quota', Number(e.target.value))}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white font-semibold text-gray-700 cursor-pointer"
                            title="Cambiar plan de cupos"
                          >
                            <option value={10}>Plan 10</option>
                            <option value={25}>Plan 25</option>
                            <option value={100}>Plan 100</option>
                            <option value={500}>Plan 500</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        {dist.expires_at ? (
                          <span className={`font-bold ${dist.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                            {dist.is_active ? 'Activo hasta: ' : 'Vencido: '}
                            {new Date(dist.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Activo</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            disabled={loadingAgencyId === dist.id}
                            onClick={() => handleQuickAgencyManage(dist.id, 'add_30')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer"
                            title="Activar +30 días"
                          >
                            +30d
                          </button>
                          <button
                            type="button"
                            disabled={loadingAgencyId === dist.id}
                            onClick={() => handleQuickAgencyManage(dist.id, 'add_365')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                            title="Activar +1 Año"
                          >
                            +1 Año
                          </button>
                          <button
                            type="button"
                            disabled={loadingAgencyId === dist.id}
                            onClick={() => handleQuickAgencyManage(dist.id, 'suspend')}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
                            title="Pausar suscripción de Agencia"
                          >
                            Pausar
                          </button>
                          <button
                            type="button"
                            disabled={loadingAgencyId === dist.id}
                            onClick={() => handleEnterAgencyConsole(dist)}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                            title="Abrir consola de esta Agencia"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{dist.is_owner_agency ? 'Ir a Mi Agencia' : 'Abrir Agencia'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 2: CONSOLA INDIVIDUAL DE "MI AGENCIA" (COMO UN SUSCRIPTOR MÁS)  */}
      {/* ===================================================================== */}
      {!isMasterMode && activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cartera de Clientes bajo tu Marca</h2>
              <p className="text-xs text-gray-500">
                Crea cuentas para tus clientes con su giro de negocio ya asignado y bloqueado. Ellos verán tu marca <strong>{initialBrandConfig.brand_name || 'personalizada'}</strong> en todo su panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              {showCreateForm ? 'Cerrar Formulario' : 'Crear Nuevo Sub-Cliente'}
            </button>
          </div>

          {showCreateForm && (
            <form
              onSubmit={handleCreateSubClient}
              className="bg-white rounded-2xl border-2 border-indigo-600/20 p-6 shadow-md space-y-5 animate-in fade-in duration-150"
            >
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Alta Directa de Cliente (Con Giro Bloqueado)</h3>
                <p className="text-xs text-gray-500">
                  El cliente entrará directamente con las herramientas exclusivas del giro que elijas aquí (y bloqueo de cambio por 30 días).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Negocio / Cliente *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="Ej. Barbería Los Reyes"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Correo de Acceso *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="cliente@negocio.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña Inicial *</label>
                  <input
                    type="text"
                    name="password"
                    required
                    minLength={6}
                    defaultValue="Cliente2026*"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tiempo de Plan Inicial *</label>
                  <select
                    name="plan_days"
                    defaultValue="30"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                  >
                    <option value="14">14 Días (Prueba Gratis)</option>
                    <option value="30">30 Días (Plan Mensual)</option>
                    <option value="365">365 Días (Plan Anual / Tarjeta NFC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Selecciona el Giro Oficial del Negocio (Aísla los módulos del cliente) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {SELECTABLE_INDUSTRY_IDS.map((indId) => {
                    const cfg = INDUSTRIES[indId]
                    const selected = newClientIndustry === indId
                    return (
                      <button
                        key={indId}
                        type="button"
                        onClick={() => setNewClientIndustry(indId)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <p className="text-xs font-extrabold text-gray-900">{cfg.shortName}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{cfg.tagline}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingClient}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingClient ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Crear Cuenta del Cliente
                </button>
              </div>
            </form>
          )}

          {/* Tabla de Sub-Clientes */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            {subClients.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-800">Aún no tienes sub-clientes registrados</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Usa el botón <strong>"Crear Nuevo Sub-Cliente"</strong> o comparte tu enlace de registro de Marca Blanca para empezar a vender suscripciones bajo tu propia marca.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase text-gray-500">
                      <th className="py-3 px-4">Cliente / Negocio</th>
                      <th className="py-3 px-4">Giro Configurado</th>
                      <th className="py-3 px-4">Vencimiento</th>
                      <th className="py-3 px-4 text-right">Acciones de Suscripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {subClients.map((client) => {
                      const indCfg = getIndustryConfig(client.industry)
                      const isExpired = client.subscription_expires_at
                        ? new Date(client.subscription_expires_at) <= new Date()
                        : false

                      return (
                        <tr key={client.id} className="hover:bg-gray-50/60">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900">{client.full_name || 'Cliente'}</p>
                            <p className="text-xs text-gray-500">{client.email}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${indCfg.badgeClass}`}>
                              {indCfg.shortName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {client.subscription_expires_at ? (
                              <span className={`text-xs font-bold ${isExpired ? 'text-red-600' : 'text-emerald-700'}`}>
                                {isExpired ? 'Vencido: ' : 'Activo hasta: '}
                                {new Date(client.subscription_expires_at).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Sin fecha</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={loadingClientId === client.id}
                                onClick={() => handleManageClientPlan(client.id, 'add_30')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer"
                                title="Activar +30 días"
                              >
                                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                                +30d
                              </button>
                              <button
                                type="button"
                                disabled={loadingClientId === client.id}
                                onClick={() => handleManageClientPlan(client.id, 'add_365')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                                title="Activar +1 Año"
                              >
                                +1 Año
                              </button>
                              <button
                                type="button"
                                disabled={loadingClientId === client.id}
                                onClick={() => handleManageClientPlan(client.id, 'suspend')}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
                                title="Suspender acceso"
                              >
                                <Ban className="w-3.5 h-3.5 inline mr-1" />
                                Pausar
                              </button>
                              <button
                                type="button"
                                disabled={loadingClientId === client.id}
                                onClick={async () => {
                                  setLoadingClientId(client.id)
                                  try {
                                    await startImpersonation(client.id)
                                  } catch (err: any) {
                                    showToast(err.message || 'No se pudo abrir el panel del cliente', 'error')
                                    setLoadingClientId(null)
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                                title="Entrar al panel de negocio de este cliente para configurar su menú, citas o QR"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Abrir Negocio</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURACIÓN DE MARCA BLANCA Y PASARELA DEL DISTRIBUIDOR */}
      {!isMasterMode && activeTab === 'brand' && (
        <form onSubmit={handleSaveBrand} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Identidad de Marca Blanca & Pasarela de Cobro a tus Clientes</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Todo lo que configures aquí reemplazará el nombre, logo y página de suscripción para todos tus sub-clientes.
              </p>
            </div>
            {/* Vista Previa de Cabecera */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="w-7 h-7 object-contain rounded" />
              ) : (
                <Building2 className="w-6 h-6 text-indigo-600" />
              )}
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Vista Previa Navbar</p>
                <p className="text-sm font-black text-gray-900">{brandName || 'Mi Marca SaaS'}</p>
              </div>
            </div>
          </div>

          {/* 1. Identidad Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nombre de tu Marca / Plataforma *
              </label>
              <input
                type="text"
                name="brand_name"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ej. TapCard Pro"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                URL de tu Logo (PNG/SVG transparente)
              </label>
              <input
                type="url"
                name="logo_url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://midominio.com/logo.png"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Sitio Web de tu Agencia (Opcional)
              </label>
              <input
                type="url"
                name="website_url"
                defaultValue={initialBrandConfig.website_url || ''}
                placeholder="https://miagencianfc.com"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Cómo te pagan TUS sub-clientes a ti */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Tus Links de Suscripción y Precios (Para cobrarle a tus Sub-Clientes)
              </h3>
              <p className="text-xs text-gray-500">
                Cuando uno de tus sub-clientes entre a la sección <strong>Suscripción</strong> para renovar su plan, verá tus precios y tus propios links de pago (Hotmart, Stripe, PayPal, Tilopay, etc.).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tu Precio Mensual (USD)</label>
                <input
                  type="text"
                  name="price_monthly"
                  defaultValue={initialBrandConfig.price_monthly || '19'}
                  placeholder="19"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tu Link de Cobro Mensual (Hotmart, Stripe, Tilopay, PayPal...)
                </label>
                <input
                  type="url"
                  name="checkout_monthly_url"
                  defaultValue={initialBrandConfig.checkout_monthly_url || ''}
                  placeholder="https://pay.hotmart.com/TU_LINK_MENSUAL"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tu Precio Anual (USD)</label>
                <input
                  type="text"
                  name="price_yearly"
                  defaultValue={initialBrandConfig.price_yearly || '190'}
                  placeholder="190"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tu Link de Cobro Anual
                </label>
                <input
                  type="url"
                  name="checkout_yearly_url"
                  defaultValue={initialBrandConfig.checkout_yearly_url || ''}
                  placeholder="https://pay.hotmart.com/TU_LINK_ANUAL"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Datos Bancarios y WhatsApp de Soporte del Distribuidor */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Soporte y Transferencia Bancaria Directa a tu Agencia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp de Soporte de tu Agencia</label>
                <input
                  type="text"
                  name="support_whatsapp"
                  defaultValue={initialBrandConfig.support_whatsapp || ''}
                  placeholder="+504 9999-9999"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Banco para Transferencias (Opcional)</label>
                <input
                  type="text"
                  name="bank_name"
                  defaultValue={initialBrandConfig.bank_name || ''}
                  placeholder="Ej. BAC Credomatic / Bancolombia / BBVA"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Número de Cuenta</label>
                <input
                  type="text"
                  name="bank_account_number"
                  defaultValue={initialBrandConfig.bank_account_number || ''}
                  placeholder="Ej. 755259922"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Titular de la Cuenta</label>
                <input
                  type="text"
                  name="bank_account_holder"
                  defaultValue={initialBrandConfig.bank_account_holder || ''}
                  placeholder="Nombre o Razón Social"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Identificación / RTN / NIT</label>
                <input
                  type="text"
                  name="bank_account_id_doc"
                  defaultValue={initialBrandConfig.bank_account_id_doc || ''}
                  placeholder="Documento fiscal"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ocultar sello OmniTag</label>
                <select
                  name="hide_omnitag_branding"
                  defaultValue={initialBrandConfig.hide_omnitag_branding !== false ? 'true' : 'false'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="true">Sí, ocultar OmniTag en mis clientes</option>
                  <option value="false">No, mantener sello estándar</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={savingBrand}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Guardar Mi Marca Blanca
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
