import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Sparkles, CheckCircle, ArrowRight, ShieldAlert, LogIn, UserPlus } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function NfcClaimOrRedirectPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const cleanToken = token.trim()
  const supabase = await createClient()

  // 1. Buscar la tarjeta en la base de datos
  const { data: card } = await supabase
    .from('nfc_cards')
    .select('*, nfc_batches(batch_name)')
    .eq('card_token', cleanToken)
    .maybeSingle()

  // Si la tarjeta no existe
  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">Tarjeta No Reconocida</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            El código <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{cleanToken}</span> no está registrado en el sistema o fue deshabilitado.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition"
          >
            Ir a OmniTag Inicio
          </Link>
        </div>
      </div>
    )
  }

  // 2. Si la tarjeta YA ESTÁ ACTIVA -> Redirigir a la vCard del dueño
  if (card.status === 'active' && card.claimed_by_user_id) {
    // Buscar la vCard activa del usuario
    const { data: vcard } = await supabase
      .from('vcards')
      .select('slug, id')
      .eq('user_id', card.claimed_by_user_id)
      .eq('is_active', true)
      .maybeSingle()

    // Registrar métrica de escaneo NFC en segundo plano
    try {
      await supabase.from('scans').insert({
        target_user_id: card.claimed_by_user_id,
        vcard_id: vcard?.id || null,
        source_type: 'nfc',
        scanned_at: new Date().toISOString()
      })
    } catch {
      // No bloquear la redirección si falla el analytics
    }

    if (vcard?.slug) {
      redirect(`/v/${vcard.slug}`)
    } else {
      redirect(`/dashboard/vcard`)
    }
  }

  // 3. Si la tarjeta está "unclaimed" -> Pantalla de Activación
  const { data: { user } } = await supabase.auth.getUser()

  // Server Action para vincular al usuario actualmente autenticado
  async function claimForCurrentUser() {
    'use server'
    const s = await createClient()
    const { data: { user: currentUser } } = await s.auth.getUser()
    if (!currentUser) redirect(`/login?next=/t/${cleanToken}`)

    const planDays = card.plan_duration_days || 365
    const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString()

    // 1. Asignar tarjeta al usuario
    await s
      .from('nfc_cards')
      .update({
        status: 'active',
        claimed_by_user_id: currentUser.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', card.id)

    // 2. Extender suscripción por 1 año
    await s
      .from('users')
      .update({
        subscription_expires_at: expiresAt,
        plan_status: 'pro_annual'
      })
      .eq('id', currentUser.id)

    revalidatePath('/', 'layout')
    redirect('/dashboard/vcard?nfc_activated=true')
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      {/* Contenedor Principal */}
      <div className="max-w-md w-full bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Badge superior */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-amber-400 to-orange-500 text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>Activación de Tarjeta NFC</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
            ¡Bienvenido a tu Tarjeta Inteligente!
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Esta tarjeta física incluye <span className="text-amber-400 font-bold">1 Año Completo de Membresía PRO</span> con tu vCard y CRM de prospectos.
          </p>
        </div>

        {/* Tarjeta Visual de Representación */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-tr from-gray-800 via-gray-900 to-black p-5 border border-white/15 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-black font-black flex items-center justify-center text-sm">
                O
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">OmniTag NFC</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 bg-white/10 px-2 py-0.5 rounded">
              {cleanToken}
            </span>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Beneficio</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1">
                <span>365 Días PRO</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Opciones según si ya está autenticado o no */}
        {user ? (
          <div className="space-y-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs">
              <span className="text-gray-400">Sesión iniciada como:</span>
              <div className="font-bold text-white text-sm truncate mt-0.5">{user.email}</div>
            </div>

            <form action={claimForCurrentUser}>
              <button
                type="submit"
                className="w-full bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Vincular a mi Cuenta & Activar 1 Año</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center">
              <Link
                href={`/register?token=${cleanToken}`}
                className="text-xs text-gray-400 hover:text-white transition"
              >
                ¿Prefieres crear una cuenta nueva? Haz clic aquí
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <Link
              href={`/register?token=${cleanToken}`}
              className="w-full bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta & Activar Mi Tarjeta</span>
            </Link>

            <Link
              href={`/login?next=/t/${cleanToken}`}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-2xl border border-white/10 transition flex items-center justify-center gap-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Ya tengo cuenta: Iniciar Sesión para Vincular</span>
            </Link>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-400">
            Tarjeta programada y protegida contra reescritura. Redirección en la nube activa las 24 horas.
          </p>
        </div>

      </div>
    </div>
  )
}
