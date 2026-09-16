import { createClient } from '@/lib/supabase/server'
import DashboardNavbar from '@/components/DashboardNavbar'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'
import PwaInstallPrompt from '@/components/PwaInstallPrompt'
import GlobalToast from '@/components/GlobalToast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let userIndustry = 'general'
  let accountType = 'professional'

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin, industry, account_type')
        .eq('id', user.id)
        .maybeSingle()
      isAdmin = Boolean(profile?.is_admin)
      userIndustry = profile?.industry || 'general'
      accountType = profile?.account_type || 'professional'
    } catch {
      isAdmin = false
      userIndustry = 'general'
      accountType = 'professional'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Notificaciones Flotantes Globales de Éxito / Error */}
      <GlobalToast />

      {/* Navegación Responsive (TopBar + Drawer + Desktop Sidebar + Mobile Bottom Quick Bar) */}
      <DashboardNavbar 
        userEmail={user?.email} 
        userId={user?.id} 
        isAdmin={isAdmin} 
        userIndustry={userIndustry} 
        accountType={accountType}
      />

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Banner de Instalación PWA (Agregar a pantalla de inicio) */}
          <PwaInstallPrompt />

          {/* Banner de Activación de Notificaciones Push Flotantes */}
          <PushNotificationPrompt userId={user?.id} />

          {children}
        </div>
      </main>
    </div>
  )
}
