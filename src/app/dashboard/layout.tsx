import { createClient } from '@/lib/supabase/server'
import DashboardNavbar from '@/components/DashboardNavbar'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'
import PwaInstallPrompt from '@/components/PwaInstallPrompt'
import GlobalToast from '@/components/GlobalToast'
import ImpersonationBanner from '@/components/ImpersonationBanner'
import { headers } from 'next/headers'
import { getEffectiveUser } from '@/lib/auth/effectiveUser'
import { getUserPlanInfo } from '@/lib/plans'
import AccountLockedPaywall from '@/components/AccountLockedPaywall'
import IndustryOnboardingGate from '@/components/IndustryOnboardingGate'
import { hasLockedValidIndustry, normalizeIndustry, SelectableIndustryId } from '@/lib/industries'
import { resolveUserWhiteLabel } from '@/lib/whitelabel'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { user: effectiveUser, realAdmin, isImpersonating } = await getEffectiveUser(supabase)

  // Rol de admin del usuario autenticado real
  const realUserId = realAdmin?.id || effectiveUser?.id || ''
  const { data: realProfile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', realUserId)
    .maybeSingle()

  const realIsAdmin = Boolean(realProfile?.is_admin)

  // Obtener estado del plan del usuario efectivo y su configuración de Marca Blanca / Distribuidor
  const [planInfo, whiteLabelInfo] = await Promise.all([
    getUserPlanInfo(supabase, effectiveUser?.id),
    resolveUserWhiteLabel(effectiveUser?.id, realIsAdmin && !isImpersonating)
  ])

  // Detectar si está en la página de facturación para permitirle pagar
  const headersList = await headers()
  const currentPath = headersList.get('x-current-path') || ''
  const isBillingRoute = currentPath.startsWith('/dashboard/billing')

  // Una cuenta está bloqueada si:
  // 1. Su prueba expiró (isExpired = true)
  // 2. NO es Administrador
  // 3. NO es una sesión de soporte técnico donde el Admin está inspeccionando
  const isAccountLocked = Boolean(planInfo.isExpired) && !realIsAdmin && !isImpersonating

  // Si la cuenta no tiene aún un giro válido configurado (ej. vino con 'general', 'establishment' o vacío),
  // exigir la configuración obligatoria del giro antes de mostrar el panel
  const needsIndustryOnboarding = Boolean(
    effectiveUser && 
    !realIsAdmin && 
    !hasLockedValidIndustry(effectiveUser.industry)
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Banner de Modo Soporte Técnico / Impersonación */}
      {isImpersonating && effectiveUser && (
        <ImpersonationBanner impersonatedUser={effectiveUser} />
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Notificaciones Flotantes Globales de Éxito / Error */}
        <GlobalToast />

        {/* Navegación Responsive (TopBar + Drawer + Desktop Sidebar + Mobile Bottom Quick Bar) */}
        <DashboardNavbar 
          userEmail={effectiveUser?.email || undefined} 
          userId={effectiveUser?.id || undefined} 
          isAdmin={realIsAdmin && !isImpersonating} 
          isReseller={whiteLabelInfo.isReseller}
          userIndustry={effectiveUser?.industry || 'professional'} 
          accountType={effectiveUser?.account_type || 'professional'}
          planInfo={planInfo}
          whiteLabelBrand={whiteLabelInfo.activeBrand}
          isWhiteLabeledClient={whiteLabelInfo.isWhiteLabeledClient}
        />

        {/* Contenido Principal */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 w-full overflow-x-hidden">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {/* Banner de Instalación PWA (Agregar a pantalla de inicio) */}
            <PwaInstallPrompt />

            {/* Banner de Activación de Notificaciones Push Flotantes */}
            <PushNotificationPrompt userId={effectiveUser?.id} />

            {/* 1. Si no ha configurado su giro de negocio oficial, mostrar Onboarding Obligatorio */}
            {needsIndustryOnboarding ? (
              <IndustryOnboardingGate 
                userEmail={effectiveUser?.email || ''} 
                suggestedIndustry={normalizeIndustry(effectiveUser?.industry) as SelectableIndustryId}
              />
            ) : isAccountLocked && !isBillingRoute ? (
              /* 2. Si la cuenta está vencida y no está en Facturación, mostrar pantalla de bloqueo */
              <AccountLockedPaywall 
                userEmail={effectiveUser?.email || ''} 
                expiresAt={planInfo.expiresAt} 
              />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
