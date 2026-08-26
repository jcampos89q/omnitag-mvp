import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">¡Hola! 👋</h1>
      <p className="text-gray-600 mb-8">
        Bienvenido a tu panel de control, {user.email}.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-100 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Tu Identidad Digital</h3>
          <p className="text-gray-500 text-sm mb-4">Configura tu tarjeta de presentación virtual y compártela fácilmente.</p>
          <a href="/dashboard/vcard" className="text-sm font-medium text-black hover:underline">Ir a Mi vCard &rarr;</a>
        </div>
        <div className="p-6 border border-gray-100 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Reseñas y Tap-to-Rate</h3>
          <p className="text-gray-500 text-sm mb-4">Gestiona tus dispositivos físicos NFC y códigos QR para Google Reviews.</p>
          <a href="/dashboard/devices" className="text-sm font-medium text-black hover:underline">Ver Dispositivos &rarr;</a>
        </div>
      </div>
    </div>
  )
}
