import { createClient } from '@/lib/supabase/server'
import DashboardNavbar from '@/components/DashboardNavbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin || false
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Navegación Responsive (TopBar + Drawer + Desktop Sidebar + Mobile Bottom Quick Bar) */}
      <DashboardNavbar userEmail={user?.email} isAdmin={isAdmin} />

      {/* Contenido Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
