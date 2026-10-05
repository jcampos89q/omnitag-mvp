import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, name, phone, table } = body

    if (!slug || !name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'El nombre y número de WhatsApp son obligatorios.' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const cleanName = name.trim()
    const supabase = await createClient()

    // 1. Obtener la Ruleta por Slug
    const { data: wheel, error: wheelErr } = await supabase
      .from('prize_wheels')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (wheelErr || !wheel) {
      return NextResponse.json(
        { error: 'Ruleta no encontrada.' },
        { status: 404 }
      )
    }

    // 2. Validar Estado y Horario / Calendario de la Ruleta
    if (!wheel.is_active) {
      return NextResponse.json(
        { error: wheel.paused_message || 'La ruleta de premios está temporalmente en pausa.' },
        { status: 403 }
      )
    }

    // Validar modo de programación
    const now = new Date()
    if (wheel.schedule_mode === 'days_of_week') {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const currentDay = days[now.getDay()]
      const activeDays = Array.isArray(wheel.active_days) ? wheel.active_days : []
      if (!activeDays.includes(currentDay)) {
        return NextResponse.json(
          { error: 'La ruleta no está disponible el día de hoy. ¡Vuelve en nuestros días de promoción!' },
          { status: 403 }
        )
      }
    } else if (wheel.schedule_mode === 'date_range') {
      if (wheel.start_date && now < new Date(wheel.start_date)) {
        return NextResponse.json(
          { error: 'Esta promoción aún no ha comenzado.' },
          { status: 403 }
        )
      }
      if (wheel.end_date && now > new Date(wheel.end_date)) {
        return NextResponse.json(
          { error: 'Esta promoción especial ya ha finalizado.' },
          { status: 403 }
        )
      }
    }

    // 3. Validar Cooldown de 24 horas y Límites vía RPC seguro
    const cooldownHours = wheel.cooldown_hours || 24
    const { data: eligibility } = await supabase.rpc('check_wheel_spin_eligibility', {
      p_wheel_id: wheel.id,
      p_phone: cleanPhone,
      p_cooldown_hours: cooldownHours
    })

    if (eligibility && !eligibility.eligible) {
      return NextResponse.json(
        { error: 'Ya participaste recientemente con este número. Podrás girar de nuevo en tu próxima visita.' },
        { status: 429 }
      )
    }

    // 4. Obtener Premios Activos de la Ruleta
    const { data: items, error: itemsErr } = await supabase
      .from('prize_wheel_items')
      .select('*')
      .eq('wheel_id', wheel.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (itemsErr || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'No hay premios configurados en esta ruleta.' },
        { status: 400 }
      )
    }

    // 5. Escudo Anti-Sobregiros (Verificar stock diario de cada premio)
    const spinsCountByItem: Record<string, number> = eligibility?.spins_today_by_item || {}

    // Filtrar premios disponibles según stock diario
    const eligibleItems = items.map(item => {
      if (item.max_daily_stock !== null && item.max_daily_stock !== undefined) {
        const usedToday = spinsCountByItem[item.id] || 0
        if (usedToday >= item.max_daily_stock) {
          return { ...item, probability_weight: 0 } // Stock agotado hoy
        }
      }
      return item
    }).filter(item => item.probability_weight > 0)

    const candidatePool = eligibleItems.length > 0 ? eligibleItems : items

    // 6. Cálculo Criptográfico Ponderado en Servidor
    const totalWeight = candidatePool.reduce((sum, item) => sum + item.probability_weight, 0)
    let randomNum = crypto.randomInt(0, Math.max(totalWeight, 1))

    let selectedItem = candidatePool[0]
    for (const item of candidatePool) {
      if (randomNum < item.probability_weight) {
        selectedItem = item
        break
      }
      randomNum -= item.probability_weight
    }

    // Encontrar el índice original en la lista completa para el puntero de la animación
    const originalIndex = items.findIndex(it => it.id === selectedItem.id)
    const winningIndex = originalIndex >= 0 ? originalIndex : 0

    // 7. Generar Código de Cupón Único
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase()
    const tablePrefix = table ? `M${table.toString().replace(/\D/g, '')}` : 'VIP'
    const couponCode = `OMNI-${tablePrefix}-${randomSuffix}`
    const expiresAt = new Date(Date.now() + 2 * 3600 * 1000).toISOString() // Válido 2 horas

    // 8. Registrar el Giro en la Base de Datos
    const { error: spinInsertErr } = await supabase
      .from('prize_wheel_spins')
      .insert({
        wheel_id: wheel.id,
        item_id: selectedItem.id,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        coupon_code: couponCode,
        status: 'pending',
        expires_at: expiresAt
      })

    if (spinInsertErr) {
      console.error('Error recording spin:', spinInsertErr)
    }

    // 9. Sincronización Automática con el CRM (Tabla leads)
    try {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id, notes')
        .eq('user_id', wheel.user_id)
        .eq('phone', cleanPhone)
        .maybeSingle()

      const newNote = `[${new Date().toLocaleDateString('es-ES')}] Ganó premio en Ruleta: ${selectedItem.label} (Cupón: ${couponCode})`

      if (existingLead) {
        await supabase
          .from('leads')
          .update({
            name: cleanName,
            notes: existingLead.notes ? `${existingLead.notes}\n${newNote}` : newNote
          })
          .eq('id', existingLead.id)
      } else {
        await supabase
          .from('leads')
          .insert({
            user_id: wheel.user_id,
            name: cleanName,
            phone: cleanPhone,
            source: 'ruleta_premios',
            notes: newNote
          })
      }
    } catch (crmErr) {
      console.error('CRM Sync warning:', crmErr)
    }

    // 10. Si el premio es "+1 Sello Extra", sincronizar con Fidelización
    if (selectedItem.reward_type === 'stamp') {
      try {
        const { data: program } = await supabase
          .from('loyalty_programs')
          .select('id, total_stamps_required')
          .eq('user_id', wheel.user_id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        if (program) {
          const { data: member } = await supabase
            .from('loyalty_members')
            .select('id, current_stamps')
            .eq('program_id', program.id)
            .eq('customer_phone', cleanPhone)
            .maybeSingle()

          const stampsToAdd = selectedItem.stamp_count || 1

          if (member) {
            const nextStamps = (member.current_stamps || 0) + stampsToAdd
            await supabase
              .from('loyalty_members')
              .update({
                current_stamps: nextStamps,
                customer_name: cleanName,
                last_stamp_at: new Date().toISOString()
              })
              .eq('id', member.id)
          } else {
            await supabase
              .from('loyalty_members')
              .insert({
                program_id: program.id,
                customer_name: cleanName,
                customer_phone: cleanPhone,
                current_stamps: stampsToAdd,
                last_stamp_at: new Date().toISOString()
              })
          }
        }
      } catch (loyaltyErr) {
        console.error('Loyalty stamp sync warning:', loyaltyErr)
      }
    }

    // 11. Generar automáticamente Gift Card / Certificado Digital Oficial para el Premio
    let generatedGiftCard: any = null
    try {
      const cleanCoupon = (couponCode || '').replace(/[^A-Z0-9]/gi, '').slice(0, 4)
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      const gcCode = `RUL-${cleanCoupon || randomSuffix}`
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString()

      const isService = selectedItem.reward_type === 'free_item'
      const title = `Premio Ruleta: ${selectedItem.label}`

      // Si el texto incluye valor monetario (ej: $10, L. 200, 150)
      let rewardAmount = 0
      const matchNumber = selectedItem.label.match(/\d+/)
      if (matchNumber && !isService) {
        rewardAmount = parseFloat(matchNumber[0]) || 0
      }

      const { data: newGc } = await supabase
        .from('gift_cards')
        .insert({
          user_id: wheel.user_id,
          code: gcCode,
          security_pin: pinCode,
          title,
          card_type: isService ? 'service' : 'amount',
          service_name: isService ? selectedItem.label : null,
          initial_amount: rewardAmount,
          current_balance: rewardAmount,
          currency: 'HNL',
          currency_symbol: 'L.',
          status: 'active',
          buyer_name: 'Ruleta de la Fortuna VIP',
          recipient_name: cleanName,
          recipient_phone: cleanPhone,
          gift_message: `¡Felicidades ${cleanName}! Has ganado este premio girando la Ruleta de la Fortuna.`,
          theme_color: selectedItem.bg_color || '#d97706',
          expires_at: expiresAt,
          source: 'prize_wheel',
          source_id: wheel.id
        })
        .select()
        .maybeSingle()

      if (newGc) {
        generatedGiftCard = newGc
      }
    } catch (gcErr) {
      console.error('Error generando gift card desde la ruleta:', gcErr)
    }

    return NextResponse.json({
      success: true,
      winningIndex,
      couponCode,
      prize: {
        id: selectedItem.id,
        label: selectedItem.label,
        icon: selectedItem.icon,
        reward_type: selectedItem.reward_type,
        stamp_count: selectedItem.stamp_count,
        gift_card_code: generatedGiftCard?.code || couponCode,
        gift_card_url: generatedGiftCard ? `/g/${generatedGiftCard.code}` : null,
        security_pin: generatedGiftCard?.security_pin || null
      },
      expiresAt
    })
  } catch (err: any) {
    console.error('Wheel Spin Error:', err)
    return NextResponse.json(
      { error: err.message || 'Error interno al procesar el giro.' },
      { status: 500 }
    )
  }
}
