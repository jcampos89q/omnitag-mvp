'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadMediaFile } from '@/lib/supabase/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserPlanInfo } from '@/lib/plans'
import { formatScheduleSummaryText } from '@/lib/schedule'

export async function saveVCard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Verificar si el usuario tiene Plan PRO para permitir captura de leads
  const { isPro } = await getUserPlanInfo(supabase, user.id)

  let avatarUrl = (formData.get('avatar_url') as string)?.trim() || null
  let coverUrl = (formData.get('cover_url') as string)?.trim() || null

  try {
    const cardType = (formData.get('card_type') as string) || 'personal'
    const firstName = (formData.get('first_name') as string)?.trim()
    const lastName = (formData.get('last_name') as string)?.trim()
    const jobTitle = (formData.get('job_title') as string)?.trim()
    const companyName = (formData.get('company_name') as string)?.trim()
    const bio = (formData.get('bio') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()
    const email = (formData.get('email') as string)?.trim()
    
    // Archivos de imagen por fallback si fuera necesario
    const avatarFile = formData.get('avatar_file') as File | null
    const coverFile = formData.get('cover_file') as File | null

    if (!avatarUrl && avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
      try {
        const uploadedAvatar = await uploadMediaFile(supabase, avatarFile, 'avatars', user.id)
        if (uploadedAvatar) avatarUrl = uploadedAvatar
      } catch (uploadErr: any) {
        console.error("Error al subir avatar:", uploadErr)
      }
    }

    if (!coverUrl && coverFile && coverFile instanceof File && coverFile.size > 0) {
      try {
        const uploadedCover = await uploadMediaFile(supabase, coverFile, 'covers', user.id)
        if (uploadedCover) coverUrl = uploadedCover
      } catch (uploadErr: any) {
        console.error("Error al subir portada:", uploadErr)
      }
    }

    // Datos corporativos, horarios y de negocio
    const businessHoursInput = (formData.get('business_hours') as string)?.trim() || ''
    const businessAddress = (formData.get('business_address') as string)?.trim() || ''
    const googleMapsUrl = (formData.get('google_maps_url') as string)?.trim() || ''
    const ctaText = (formData.get('cta_text') as string)?.trim() || ''
    const ctaUrl = (formData.get('cta_url') as string)?.trim() || ''
    const businessCategory = (formData.get('business_category') as string)?.trim() || 'corporate'
    const showMenu = formData.get('show_menu') === 'on'
    const showAppointments = formData.get('show_appointments') === 'on'
    const showLoyalty = formData.get('show_loyalty') === 'on'
    const showReviews = formData.get('show_reviews') === 'on'
    const showHours = formData.get('show_hours') === 'on'

    // Extracción estructurada del horario semanal si fue configurado
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
    const daysConfig: Record<string, { enabled: boolean; open: string; close: string }> = {}
    let hasWeeklyScheduleForm = false

    dayKeys.forEach(day => {
      if (formData.has(`${day}_open`)) {
        hasWeeklyScheduleForm = true
      }
      const enabled = formData.get(`${day}_enabled`) === 'on'
      const open = (formData.get(`${day}_open`) as string) || '08:00 AM'
      const close = (formData.get(`${day}_close`) as string) || '07:00 PM'
      daysConfig[day] = { enabled, open, close }
    })

    const lunchEnabled = formData.get('lunch_break_enabled') === 'on'
    const lunchStart = (formData.get('lunch_break_start') as string) || '12:00 PM'
    const lunchEnd = (formData.get('lunch_break_end') as string) || '01:00 PM'

    const schedule_config = hasWeeklyScheduleForm ? {
      slot_interval: 30,
      lunch_break: {
        enabled: lunchEnabled,
        start: lunchStart,
        end: lunchEnd
      },
      days: daysConfig
    } : undefined

    const calculatedSummary = schedule_config ? formatScheduleSummaryText(schedule_config as any) : ''
    const finalHours = calculatedSummary || businessHoursInput

    const business_info = {
      category: businessCategory,
      hours: finalHours,
      show_hours: showHours,
      schedule_config: schedule_config || null,
      address: businessAddress,
      maps_url: googleMapsUrl,
      cta_text: ctaText,
      cta_url: ctaUrl,
      show_menu: showMenu,
      show_appointments: showAppointments,
      show_loyalty: showLoyalty,
      show_reviews: showReviews
    }

    // Sincronizar schedule_config con el módulo de citas si existe
    if (schedule_config) {
      await supabase
        .from('appointment_businesses')
        .update({
          schedule_config,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    }

    // Redes y contacto
    const instagram = (formData.get('instagram') as string)?.trim()
    const linkedin = (formData.get('linkedin') as string)?.trim()
    const website = (formData.get('website') as string)?.trim()
    const facebook = (formData.get('facebook') as string)?.trim()
    const tiktok = (formData.get('tiktok') as string)?.trim()

    // REGLA FREEMIUM: La captura de leads sólo se activa si el usuario es PRO
    const leadCaptureEnabled = isPro ? (formData.get('lead_capture_enabled') === 'on') : false

    // Tema visual, tipografía y paleta de colores
    const themePreset = (formData.get('theme_preset') as string) || 'minimal_white'
    const themePrimary = (formData.get('theme_primary_color') as string) || (formData.get('color') as string) || '#0F172A'
    const themeBg = (formData.get('theme_bg_color') as string) || '#F8FAFC'
    const themeCardBg = (formData.get('theme_card_bg') as string) || '#FFFFFF'
    const themeText = (formData.get('theme_text_color') as string) || '#0F172A'
    const themeFont = (formData.get('theme_font_family') as string) || 'jakarta'
    const themeBorder = (formData.get('theme_border_style') as string) || 'rounded'
    const themeIsDark = formData.get('theme_is_dark') === 'true'

    const theme = {
      preset: themePreset,
      color: themePrimary,
      primary_color: themePrimary,
      bg_color: themeBg,
      card_bg: themeCardBg,
      text_color: themeText,
      font_family: themeFont,
      border_style: themeBorder,
      is_dark: themeIsDark
    }

    const contact_info = {
      phone,
      email,
      instagram,
      linkedin,
      website,
      facebook,
      tiktok
    }

    // Check if vcard exists for this user
    const { data: existingVcard } = await supabase
      .from('vcards')
      .select('id, slug')
      .eq('user_id', user.id)
      .maybeSingle()

    // Generate clean slug if new
    const baseSlug = (firstName || companyName || 'usuario')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')

    const slug = existingVcard 
      ? existingVcard.slug 
      : `${baseSlug}-${Date.now().toString().slice(-4)}`

    const payload = {
      card_type: cardType,
      first_name: firstName || companyName || 'Perfil Digital',
      last_name: lastName || null,
      job_title: jobTitle || null,
      company_name: companyName || null,
      bio: bio || null,
      business_info,
      contact_info,
      theme,
      avatar_url: avatarUrl,
      cover_url: coverUrl,
      lead_capture_enabled: leadCaptureEnabled,
      is_active: true
    }

    if (existingVcard) {
      const { error } = await supabase
        .from('vcards')
        .update(payload)
        .eq('id', existingVcard.id)
        
      if (error) {
        console.error("Error updating vCard:", error)
        redirect('/dashboard/vcard?error=' + encodeURIComponent(error.message))
      }
    } else {
      const { error } = await supabase
        .from('vcards')
        .insert({
          user_id: user.id,
          slug,
          ...payload
        })
        
      if (error) {
        console.error("Error inserting vCard:", error)
        redirect('/dashboard/vcard?error=' + encodeURIComponent(error.message))
      }
    }

    revalidatePath('/dashboard/vcard')
    revalidatePath('/', 'layout')
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err
    }
    console.error("Error guardando vCard:", err)
    redirect('/dashboard/vcard?error=' + encodeURIComponent(err.message || 'Error al guardar'))
  }

  redirect('/dashboard/vcard?success=true')
}
