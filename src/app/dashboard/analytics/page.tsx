import { createClient } from '@/lib/supabase/server'
import { BarChart3, Smartphone, MonitorSmartphone, Activity, Globe } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Obtener todos los dispositivos del usuario
  const { data: devices } = await supabase
    .from('devices')
    .select('id, tag_id, device_type')
    .eq('user_id', user?.id)

  const deviceIds = devices?.map(d => d.id) || []

  // 2. Obtener los escaneos de esos dispositivos
  let scans: any[] = []
  if (deviceIds.length > 0) {
    const { data: scansData } = await supabase
      .from('scans')
      .select('id, device_id, os, country, created_at')
      .in('device_id', deviceIds)
      .order('created_at', { ascending: false })
    
    scans = scansData || []
  }

  // 3. Procesar datos para KPIs
  const totalScans = scans.length
  
  const appleScans = scans.filter(s => s.os === 'Apple').length
  const androidScans = scans.filter(s => s.os === 'Android').length
  const otherScans = totalScans - appleScans - androidScans

  const applePercent = totalScans > 0 ? Math.round((appleScans / totalScans) * 100) : 0
  const androidPercent = totalScans > 0 ? Math.round((androidScans / totalScans) * 100) : 0

  // Escaneos por dispositivo
  const devicePerformance = devices?.map(device => {
    return {
      tag_id: device.tag_id,
      type: device.device_type,
      scans: scans.filter(s => s.device_id === device.id).length
    }
  }).sort((a, b) => b.scans - a.scans) || []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estadísticas y Analítica</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Monitorea el rendimiento de tus enlaces, QRs y placas físicas.</p>
        </div>

        {/* KPIs Principales en Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Escaneos</h3>
              <Activity className="w-5 h-5 text-black" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{totalScans}</p>
          </div>

          <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tráfico iOS</h3>
              <Smartphone className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{applePercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{appleScans} escaneos</p>
          </div>

          <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tráfico Android</h3>
              <MonitorSmartphone className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{androidPercent}%</p>
            <p className="text-xs text-gray-500 mt-0.5">{androidScans} escaneos</p>
          </div>
        </div>

        {/* Rendimiento por Dispositivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Dispositivos */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Top Dispositivos
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {devicePerformance.length === 0 ? (
                  <li className="p-4 text-gray-500 text-xs sm:text-sm text-center">No hay datos suficientes.</li>
                ) : (
                  devicePerformance.map((item, idx) => (
                    <li key={item.tag_id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-400">{idx + 1}</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">ID: {item.tag_id}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="font-bold text-black bg-gray-100 px-2.5 py-0.5 rounded-full text-xs sm:text-sm">
                        {item.scans} escaneos
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Últimos Escaneos */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" /> Actividad Reciente
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {scans.length === 0 ? (
                  <li className="p-4 text-gray-500 text-xs sm:text-sm text-center">No hay actividad reciente.</li>
                ) : (
                  scans.slice(0, 5).map((scan) => {
                    const date = new Date(scan.created_at)
                    return (
                      <li key={scan.id} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${scan.os === 'Apple' ? 'bg-gray-800' : scan.os === 'Android' ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900">{scan.os}</p>
                            <p className="text-[10px] text-gray-500">{scan.country}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-400">
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
