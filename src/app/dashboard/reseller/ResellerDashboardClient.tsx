'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  ExternalLink
} from 'lucide-react'
import { INDUSTRIES, SELECTABLE_INDUSTRY_IDS, SelectableIndustryId, getIndustryConfig } from '@/lib/industries'
import type { WhiteLabelBrandConfig } from '@/lib/whitelabel'
import {
  saveWhiteLabelBrandAction,
  createResellerSubClientAction,
  manageSubClientPlanAction,
  adminConfigureDistributorAction
} from './actions'
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
}

interface ResellerDashboardClientProps {
  resellerId: string
  resellerEmail: string
  isAdmin: boolean
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
  isResellerActive,
  quota,
  expiresAt,
  initialBrandConfig,
  subClients,
  allDistributors
}: ResellerDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'clients' | 'brand' | 'master'>(isAdmin ? 'master' : 'clients')
  const [copiedLink, setCopiedLink] = useState(false)

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

  const partnerRegisterUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/register?partner=${resellerId}`
    : `https://www.omnitag.site/register?partner=${resellerId}`

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(partnerRegisterUrl)
    setCopiedLink(true)
    showToast('Enlace de registro Marca Blanca copiado al portapapeles', 'success')
    setTimeout(() => setCopiedLink(false), 2500)
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
      showToast(`Distribuidor ${res.email} actualizado (Cupo: ${res.quota} clientes)`, 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Error al configurar el distribuidor', 'error')
    } finally {
      setSavingDistributor(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              {isAdmin ? 'OmniTag Master SaaS • Control de Distribuidores' : 'Licencia de Agencia & Distribuidor Marca Blanca'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isAdmin
                ? 'Red de Distribuidores & Marca Blanca'
                : `Consola de Agencia: ${initialBrandConfig.brand_name || 'Mi Marca'}`}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isAdmin
                ? 'Tú mantienes el control total bajo la marca oficial OmniTag y vendes suscripciones de Distribuidor (Marca Blanca) para que otras agencias revendan el sistema con su propio logo y precios.'
                : 'Personaliza tu propio logo, nombre comercial y pasarela de cobro. Todos los clientes que registres verán únicamente tu marca en su panel.'}
            </p>
          </div>

          {/* Tarjeta de Cupo de Licencias */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shrink-0 min-w-[230px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              {isAdmin ? 'Distribuidores Activos' : 'Cupo de Clientes Activos'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">
                {isAdmin ? allDistributors.length : subClients.length}
              </span>
              <span className="text-sm font-bold text-slate-300">
                / {isAdmin ? 'Ilimitado (Master)' : `${quota} licencias`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {isAdmin
                  ? 'Marca Master: OmniTag'
                  : isResellerActive
                  ? 'Suscripción Partner Activa'
                  : 'Suscripción Partner Vencida'}
              </span>
            </div>
          </div>
        </div>

        {/* Enlace de Invitación Marca Blanca */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white">Tu Link de Registro Marca Blanca: </span>
            Comparte este link para que tus clientes se registren viendo tu marca y queden vinculados a tu cartera:
          </div>
          <div className="flex items-center gap-2 bg-black/40 border border-white/15 rounded-xl px-3 py-2">
            <code className="text-xs text-indigo-200 truncate max-w-[260px] sm:max-w-xs">
              {partnerRegisterUrl}
            </code>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copiado' : 'Copiar Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'master'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Crown className="w-4 h-4" />
            👑 Distribuidores OmniTag ({allDistributors.length})
          </button>
        )}

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
          Sub-Clientes de Agencia ({subClients.length})
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
          Configurar Marca Blanca & Pasarela de Agencia
        </button>
      </div>

      {/* TAB MASTER (SOLO SUPER ADMIN DE OMNITAG) */}
      {isAdmin && activeTab === 'master' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md mb-1.5">
                  <Crown className="w-3.5 h-3.5" /> Exclusivo Super Admin OmniTag
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  Autorizar o Renovar Distribuidor (Marca Blanca)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tu panel principal sigue siendo <strong>OmniTag</strong>. Aquí puedes activar a cualquier cliente que te compre la licencia de Distribuidor (o se activará automáticamente vía Webhook de Hotmart si el nombre del plan incluye la palabra <code>Distribuidor</code> o <code>Agencia</code>).
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminSaveDistributor} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Correo del Usuario Distribuidor
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
                  Cupo Máx. de Clientes
                </label>
                <select
                  name="quota"
                  defaultValue="25"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                >
                  <option value="10">10 Sub-Clientes (Starter)</option>
                  <option value="25">25 Sub-Clientes (Agency)</option>
                  <option value="50">50 Sub-Clientes (Pro Agency)</option>
                  <option value="100">100 Sub-Clientes (Enterprise)</option>
                  <option value="500">500 Sub-Clientes (Country Partner)</option>
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
                  <option value="365">+365 Días (Anual)</option>
                </select>
              </div>

              <div>
                <input type="hidden" name="enable_reseller" value="true" />
                <button
                  type="submit"
                  disabled={savingDistributor}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingDistributor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Activar Partner
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Distribuidores Activos */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                Distribuidores Marca Blanca Registrados ({allDistributors.length})
              </h3>
            </div>

            {allDistributors.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Aún no has activado distribuidores externos. Usa el formulario superior para convertir a un usuario en Distribuidor Marca Blanca.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase text-gray-500">
                      <th className="py-3 px-4">Distribuidor</th>
                      <th className="py-3 px-4">Marca Blanca Configurada</th>
                      <th className="py-3 px-4">Sub-Clientes Usados</th>
                      <th className="py-3 px-4">Vencimiento Partner</th>
                      <th className="py-3 px-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {allDistributors.map((dist) => (
                      <tr key={dist.id} className="hover:bg-gray-50/70">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{dist.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500">{dist.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {dist.logo_url ? (
                              <img src={dist.logo_url} alt={dist.brand_name} className="w-6 h-6 rounded object-contain border border-gray-200" />
                            ) : (
                              <Building2 className="w-5 h-5 text-indigo-600" />
                            )}
                            <span className="font-bold text-indigo-950">{dist.brand_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                            {dist.used_clients} / {dist.quota} cuentas
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600">
                          {dist.expires_at ? new Date(dist.expires_at).toLocaleDateString() : 'Sin límite'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {dist.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
                              Vencido
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: GESTIÓN DE SUB-CLIENTES DEL DISTRIBUIDOR */}
      {activeTab === 'clients' && (
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
      {activeTab === 'brand' && (
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
