import { createClient } from '@/lib/supabase/server'
import { BarChart3, Smartphone, MonitorSmartphone, Activity, Globe, UserCircle, Coffee, Gift, QrCode } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener todas las visitas y escaneos de todos los recursos del usuario (vCards, Menús, Fidelización, Placas)
  const { data: scansData } = await supabase
    .from('scans')
    .select('id, device_id, vcard_id, menu_id, loyalty_program_id, source_type, os, country, scanned_at')
    .order('scanned_at', { ascending: false })

  const scans = scansData || []

  // 2. Procesar datos para KPIs
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
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Estadísticas y Analítica en Tiempo Real
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Monitorea en tiempo real todas las visitas y escaneos a tus <b>vCards, Menús Digitales, Programas de Fidelización y Placas NFC/QR</b>.
          </p>
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
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700">{androidPercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{androidScans} visitas de móviles Android</p>
          </div>

          <div className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tráfico Desktop / PC</h3>
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-700">{desktopPercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{desktopScans} visitas desde ordenador</p>
          </div>
        </div>

        {/* Desglose de Rendimiento por Canal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tráfico por Tipo de Producto */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-700" /> Desglose por Servicio
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">vCards Digitales</h4>
                    <p className="text-[10px] text-gray-500">Visitas a tu perfil personal/empresa</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-gray-900">{vcardScans} vistas</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Menús & Catálogos</h4>
                    <p className="text-[10px] text-gray-500">Visitas a carta y catálogo interactivo</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-gray-900">{menuScans} vistas</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Club de Fidelización</h4>
                    <p className="text-[10px] text-gray-500">Tarjetas de sellos abiertas por clientes</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-gray-900">{loyaltyScans} vistas</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Placas NFC & Tap-to-Rate</h4>
                    <p className="text-[10px] text-gray-500">Taps y escaneos a placas físicas</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-gray-900">{deviceScans} escaneos</span>
              </div>
            </div>
          </div>

          {/* Últimos Escaneos y Visitas en Vivo */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-700" /> Registro de Actividad Reciente
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <ul className="divide-y divide-gray-100 max-h-[340px] overflow-y-auto">
                {scans.length === 0 ? (
                  <li className="p-8 text-gray-400 text-xs sm:text-sm text-center">
                    Aún no hay visitas registradas. Comparte tus enlaces o escanea tus placas para comenzar.
                  </li>
                ) : (
                  scans.slice(0, 10).map((scan) => {
                    const date = new Date(scan.scanned_at)
                    const sourceLabel = 
                      scan.source_type === 'vcard' || scan.vcard_id ? '📇 vCard' :
                      scan.source_type === 'menu' || scan.menu_id ? '🍽️ Menú' :
                      scan.source_type === 'loyalty' || scan.loyalty_program_id ? '🎁 Fidelización' :
                      '📱 Placa NFC / QR'

                    return (
                      <li key={scan.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            scan.os === 'Apple' ? 'bg-black' : 
                            scan.os === 'Android' ? 'bg-emerald-500' : 
                            'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-bold text-gray-900">{sourceLabel} ({scan.os})</p>
                            <p className="text-[10px] text-gray-500">{scan.country || 'Desconocido'}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
