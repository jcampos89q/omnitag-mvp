import { createClient } from '@/lib/supabase/server'
import DashboardNavbar from '@/components/DashboardNavbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Navegación Responsive (TopBar + Drawer + Desktop Sidebar + Mobile Bottom Quick Bar) */}
      <DashboardNavbar userEmail={user?.email} />

      {/* Contenido Principal con padding seguro para la barra inferior en móviles */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
