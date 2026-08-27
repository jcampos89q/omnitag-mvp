import { createClient } from '@/lib/supabase/server'
import { BarChart3, Smartphone, MonitorSmartphone, Activity, Globe, UserCircle, Coffee, Gift, QrCode, Sparkles, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener plan del usuario
  const { data: workspaceMember } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(plan)')
    .eq('user_id', user?.id)
    .maybeSingle()

  const isPro = (workspaceMember?.workspaces as any)?.plan === 'pro'

  // 2. Obtener todas las visitas y escaneos de todos los recursos del usuario
  const { data: scansData } = await supabase
    .from('scans')
    .select('id, device_id, vcard_id, menu_id, loyalty_program_id, source_type, os, country, scanned_at, user_agent')
    .order('scanned_at', { ascending: false })

  const scans = scansData || []

  // 3. Procesar datos para KPIs
  const totalScans = scans.length
  
  const appleScans = scans.filter(s => s.os === 'Apple').length
  const androidScans = scans.filter(s => s.os === 'Android').length
  const desktopScans = scans.filter(s => s.os === 'Windows' || s.os === 'Desktop' || s.os === 'Linux').length

  const applePercent = totalScans > 0 ? Math.round((appleScans / totalScans) * 100) : 0
  const androidPercent = totalScans > 0 ? Math.round((androidScans / totalScans) * 100) : 0
  const desktopPercent = totalScans > 0 ? Math.round((desktopScans / totalScans) * 100) : 0

  // Desglose por tipo de recurso
  const vcardScans = scans.filter(s => s.source_type === 'vcard' || s.vcard_id).length
  const menuScans = scans.filter(s => s.source_type === 'menu' || s.menu_id).length
  const loyaltyScans = scans.filter(s => s.source_type === 'loyalty' || s.loyalty_program_id).length
  const deviceScans = scans.filter(s => s.source_type === 'nfc_device' || s.device_id).length

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Estadísticas y Analítica en Tiempo Real
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Monitorea en tiempo real todas las visitas y escaneos a tus <b>vCards, Menús Digitales, Programas de Fidelización y Placas NFC/QR</b>.
            </p>
          </div>

          {!isPro && (
            <Link
              href="/dashboard/billing"
              className="bg-linear-to-r from-amber-500 to-purple-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desbloquear Analítica PRO</span>
            </Link>
          )}
        </div>

        {/* KPIs Principales en Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Tráfico / Vistas</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{totalScans}</p>
            <p className="text-xs text-gray-400 mt-1">Visitas y escaneos acumulados</p>
          </div>

          <div className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tráfico iOS (Apple)</h3>
              <Smartphone className="w-5 h-5 text-gray-800" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{applePercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{appleScans} visitas de iPhones / iPads</p>
          </div>

          <div className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tráfico Android</h3>
              <MonitorSmartphone className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{androidPercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{androidScans} visitas móviles Android</p>
          </div>

          <div className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Computadoras (Desktop)</h3>
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{desktopPercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{desktopScans} visitas desde navegadores PC</p>
          </div>
        </div>

        {/* Tráfico Desglosado por Recursos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
            <UserCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-blue-950">{vcardScans}</p>
            <p className="text-[11px] font-semibold text-blue-700">Visitas a vCards</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <Coffee className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-amber-950">{menuScans}</p>
            <p className="text-[11px] font-semibold text-amber-700">Vistas a Menús</p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
            <Gift className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-purple-950">{loyaltyScans}</p>
            <p className="text-[11px] font-semibold text-purple-700">Sellos Fidelización</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
            <QrCode className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-emerald-950">{deviceScans}</p>
            <p className="text-[11px] font-semibold text-emerald-700">Placas NFC / QRs</p>
          </div>
        </div>

        {/* LOG DETALLADO DE ESCANEOS EN VIVO */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Registro Detallado de Visitas y Dispositivos ({scans.length})
          </h2>

          {scans.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border border-gray-100 rounded-2xl bg-gray-50/50">
              <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No hay registros de tráfico todavía</p>
              <p className="text-xs text-gray-400 mt-1">Comparte tus enlaces o acerca tu móvil a tus placas NFC para ver el tráfico en vivo.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="divide-y divide-gray-100">
                  {scans.slice(0, isPro ? 50 : 5).map((scan) => (
                    <div key={scan.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          scan.os === 'Apple' ? 'bg-gray-100 text-gray-900' : scan.os === 'Android' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {scan.os === 'Apple' ? 'iOS' : scan.os === 'Android' ? 'AND' : 'PC'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-gray-900">{scan.user_agent?.split('|')[0] || scan.os}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                              {scan.source_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            País: {scan.country || 'Desconocido'} • {new Date(scan.scanned_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isPro && scans.length > 5 && (
                <div className="mt-4 p-5 bg-linear-to-r from-purple-50 to-amber-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Visualiza el historial ilimitado con OmniTag PRO
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      El Plan Básico muestra las últimas 5 visitas. Mejora a PRO por L. 550 / $20 para ver analítica completa de todos tus clientes.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/billing"
                    className="bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Mejorar a PRO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
