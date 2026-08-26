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
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas y Analítica</h1>
          <p className="text-gray-500 mt-1">Monitorea el rendimiento de tus enlaces, QRs y placas físicas.</p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Escaneos</h3>
              <Activity className="w-5 h-5 text-black" />
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{totalScans}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tráfico iOS (Apple)</h3>
              <Smartphone className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{applePercent}%</p>
            <p className="text-sm text-gray-500 mt-1">{appleScans} escaneos</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tráfico Android</h3>
              <MonitorSmartphone className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{androidPercent}%</p>
            <p className="text-sm text-gray-500 mt-1">{androidScans} escaneos</p>
          </div>
        </div>

        {/* Rendimiento por Dispositivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Dispositivos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Top Dispositivos
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {devicePerformance.length === 0 ? (
                  <li className="p-4 text-gray-500 text-sm text-center">No hay datos suficientes.</li>
                ) : (
                  devicePerformance.map((item, idx) => (
                    <li key={item.tag_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-gray-400">{idx + 1}</span>
                        <div>
                          <p className="font-bold text-gray-900">ID: {item.tag_id}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{item.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="font-bold text-black bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {item.scans}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Últimos Escaneos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" /> Actividad Reciente
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {scans.length === 0 ? (
                  <li className="p-4 text-gray-500 text-sm text-center">No hay actividad reciente.</li>
                ) : (
                  scans.slice(0, 5).map((scan) => {
                    const date = new Date(scan.created_at)
                    return (
                      <li key={scan.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${scan.os === 'Apple' ? 'bg-gray-800' : scan.os === 'Android' ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{scan.os}</p>
                            <p className="text-xs text-gray-500">{scan.country}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
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
