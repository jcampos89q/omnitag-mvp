import { createClient } from '@/lib/supabase/server'
import { QrCode, Sparkles } from 'lucide-react'
import QRStudioClient from './QRStudioClient'

export default async function QRStudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Buscar vCard del usuario
  const { data: vcard } = await supabase
    .from('vcards')
    .select('id, slug, first_name, last_name, company_name, avatar_url')
    .eq('user_id', user?.id)
    .maybeSingle()

  // 2. Buscar Menú del usuario
  const { data: menu } = await supabase
    .from('menus')
    .select('id, slug, name, logo_url')
    .eq('user_id', user?.id)
    .maybeSingle()

  // 3. Buscar Programa de Fidelización del usuario
  const { data: loyalty } = await supabase
    .from('loyalty_programs')
    .select('id, slug, name, logo_url')
    .eq('user_id', user?.id)
    .maybeSingle()

  // 4. Buscar Dispositivos NFC / QRs
  const { data: devices } = await supabase
    .from('devices')
    .select('id, tag_id, device_type, redirect_url')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <QrCode className="w-6 h-6 text-purple-600" />
              Estudio de Códigos QR & Diseños para Impresión
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Crea códigos QR modernos con <b>estilo Instagram, degradados, puntos redondeados y tu logo en el centro</b> listos para imprimir en alta resolución (2000px).
            </p>
          </div>
        </div>

        <QRStudioClient 
          vcard={vcard}
          menu={menu}
          loyalty={loyalty}
          devices={devices || []}
        />
      </div>
    </div>
  )
}
