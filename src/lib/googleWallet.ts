import crypto from 'crypto'

/**
 * Utilidad criptográfica para codificación Base64URL según estándar RFC 7515
 */
function base64url(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 * Limpia y normaliza cadenas para usarse como identificadores válidos en Google Wallet
 * (Solo caracteres alfanuméricos, guiones y guiones bajos)
 */
function sanitizeWalletId(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
}

/**
 * Valida y asegura un formato hexadecimal de color válido para Google Wallet (ej. #1E293B)
 */
function sanitizeHexColor(color?: string): string {
  if (!color) return '#0F172A'
  const hex = color.trim()
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return hex
  }
  return '#0F172A'
}

/**
 * Firma un JWT con algoritmo RS256 para Google Wallet API
 */
export function signGoogleWalletJwt(
  payload: any,
  serviceAccountEmail: string,
  privateKey: string
): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signatureInput)

  // Limpieza y formateo robusto de la clave privada (comillas, saltos escapados, etc.)
  let formattedKey = (privateKey || '').trim()
  if (
    (formattedKey.startsWith('"') && formattedKey.endsWith('"')) ||
    (formattedKey.startsWith("'") && formattedKey.endsWith("'"))
  ) {
    formattedKey = formattedKey.slice(1, -1).trim()
  }
  formattedKey = formattedKey
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const signature = signer.sign(formattedKey)
  const encodedSignature = base64url(signature)

  return `${signatureInput}.${encodedSignature}`
}

function getProxiedImageUrl(url?: string): string {
  if (!url || !url.startsWith('http')) {
    return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop&q=85'
  }
  if (url.includes('unsplash.com')) {
    return url
  }
  // Si la imagen proviene de Supabase o servicios externos que bloquean crawlers de Google (x-robots-tag),
  // se sirve a través de nuestro proxy oficial en omnitag.site
  if (url.includes('supabase.co') || !url.includes('omnitag.site')) {
    return `https://www.omnitag.site/api/wallet/image-proxy?url=${encodeURIComponent(url)}`
  }
  return url
}

export interface LoyaltyPassParams {
  programId: string
  programSlug: string
  businessName: string
  rewardTitle: string
  logoUrl?: string
  primaryColor?: string
  totalStampsRequired: number
  customerPhone: string
  customerName?: string
  currentStamps: number
  publicUrl: string
  latitude?: number
  longitude?: number
}

export interface VCardPassParams {
  vcardId: string
  vcardSlug: string
  fullName: string
  jobTitle?: string
  companyName?: string
  phone?: string
  email?: string
  address?: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  primaryColor?: string
  publicUrl: string
  latitude?: number
  longitude?: number
}

/**
 * Genera el enlace oficial de "Añadir a Google Wallet" para una Tarjeta de Fidelización
 */
export function generateLoyaltyWalletUrl(params: LoyaltyPassParams): {
  success: boolean
  url?: string
  error?: string
  isDemo?: boolean
} {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  const clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY

  if (!issuerId || !clientEmail || !privateKey) {
    // Si aún no se configuran las credenciales en .env, devolvemos un enlace descriptivo de demostración
    return {
      success: false,
      isDemo: true,
      error: 'Google Wallet no configurado: faltan credenciales (GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_CLIENT_EMAIL, GOOGLE_WALLET_PRIVATE_KEY).'
    }
  }

  try {
    const classSuffix = sanitizeWalletId(`loyalty_${params.programSlug}_v4`)
    const objectSuffix = sanitizeWalletId(
      `loyalty_${params.programSlug}_${params.customerPhone.replace(/\D/g, '') || 'client'}_v4`
    )

    const classId = `${issuerId}.${classSuffix}`
    const objectId = `${issuerId}.${objectSuffix}`

    const brandColor = sanitizeHexColor(params.primaryColor || '#D97706')
    const defaultLoyaltyLogo = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop&q=85'
    const logoUri = getProxiedImageUrl(params.logoUrl || defaultLoyaltyLogo)
    const defaultLoyaltyHero = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1032&h=336&fit=crop&q=85'
    const heroUri = getProxiedImageUrl(defaultLoyaltyHero)

    // 1. Plantilla de Clase (Class)
    const loyaltyClass: any = {
      id: classId,
      issuerName: params.businessName || 'OmniTag Rewards',
      programName: params.rewardTitle || 'Club de Recompensas',
      programLogo: {
        sourceUri: {
          uri: logoUri
        },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Logo de ${params.businessName}`
          }
        }
      },
      heroImage: {
        sourceUri: { uri: heroUri },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Club VIP ${params.businessName}`
          }
        }
      },
      hexBackgroundColor: brandColor,
      reviewStatus: 'UNDER_REVIEW'
    }

    // Geolocalización / Geofencing para notificar en pantalla de bloqueo al pasar cerca
    if (params.latitude && params.longitude) {
      loyaltyClass.locations = [
        {
          kind: 'walletobjects#latLongPoint',
          latitude: params.latitude,
          longitude: params.longitude
        }
      ]
    }

    // 2. Instancia del Cliente (Object)
    const loyaltyObject: any = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      hexBackgroundColor: brandColor,
      accountId: params.customerPhone || 'Cliente VIP',
      accountName: params.customerName || 'Miembro del Club',
      loyaltyPoints: {
        label: 'Sellos Acumulados',
        balance: {
          string: `${params.currentStamps} de ${params.totalStampsRequired} sellos ⭐`
        }
      },
      heroImage: {
        sourceUri: { uri: heroUri },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Club VIP ${params.businessName}`
          }
        }
      },
      barcode: {
        type: 'QR_CODE',
        value: params.publicUrl,
        alternateText: 'Presentar para acumular sellos'
      },
      textModulesData: [
        {
          header: '🎁 Premio por Completar',
          body: params.rewardTitle
        },
        {
          header: '⭐ Progreso del Club',
          body: `Llevas ${params.currentStamps} de ${params.totalStampsRequired} sellos acumulados en tus visitas.`
        }
      ],
      linksModuleData: {
        uris: [
          {
            uri: params.publicUrl,
            description: 'Ver mi tarjeta en línea'
          }
        ]
      }
    }

    const now = Math.floor(Date.now() / 1000)
    const claims = {
      iss: clientEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      origins: [
        'https://omnitag.site',
        'https://www.omnitag.site',
        'http://localhost:3000'
      ],
      payload: {
        loyaltyClasses: [loyaltyClass],
        loyaltyObjects: [loyaltyObject]
      }
    }

    const token = signGoogleWalletJwt(claims, clientEmail, privateKey)
    return {
      success: true,
      url: `https://pay.google.com/gp/v/save/${token}`
    }
  } catch (err: any) {
    console.error('Error generando Google Wallet Loyalty Pass:', err)
    return {
      success: false,
      error: err.message || 'Error al firmar el pase de fidelización.'
    }
  }
}

/**
 * Genera el enlace oficial de "Añadir a Google Wallet" para una vCard (Tarjeta de Presentación)
 */
export function generateVCardWalletUrl(params: VCardPassParams): {
  success: boolean
  url?: string
  error?: string
  isDemo?: boolean
} {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  const clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY

  if (!issuerId || !clientEmail || !privateKey) {
    return {
      success: false,
      isDemo: true,
      error: 'Google Wallet no configurado: faltan credenciales en variables de entorno.'
    }
  }

  try {
    const classSuffix = sanitizeWalletId(`vcard_${params.vcardSlug}_v4`)
    const objectSuffix = sanitizeWalletId(`vcard_${params.vcardSlug}_obj_v4`)

    const classId = `${issuerId}.${classSuffix}`
    const objectId = `${issuerId}.${objectSuffix}`

    const brandColor = sanitizeHexColor(params.primaryColor || '#0F172A')
    const defaultAvatar = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop&q=85'
    const logoUri = getProxiedImageUrl(params.avatarUrl || params.coverUrl || defaultAvatar)
    const defaultVCardCover = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1032&h=336&fit=crop&q=85'
    const coverUri = getProxiedImageUrl(params.coverUrl || defaultVCardCover)

    const displayName = params.companyName || params.fullName || 'OmniTag'
    const displaySubtitle = params.jobTitle || 'Contacto Profesional'

    // 1. Generic Class
    const genericClass: any = {
      id: classId,
      issuerName: displayName,
      logo: {
        sourceUri: {
          uri: logoUri
        },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Logo de ${displayName}`
          }
        }
      },
      heroImage: {
        sourceUri: {
          uri: coverUri
        },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Portada de ${displayName}`
          }
        }
      },
      hexBackgroundColor: brandColor,
      reviewStatus: 'UNDER_REVIEW'
    }

    if (params.latitude && params.longitude) {
      genericClass.locations = [
        {
          kind: 'walletobjects#latLongPoint',
          latitude: params.latitude,
          longitude: params.longitude
        }
      ]
    }

    // 2. Generic Object
    const textModules: any[] = []

    if (params.phone) {
      textModules.push({
        header: '📱 Teléfono / WhatsApp',
        body: params.phone
      })
    }

    if (params.email) {
      textModules.push({
        header: '✉️ Correo Electrónico',
        body: params.email
      })
    }

    if (params.address) {
      textModules.push({
        header: '📍 Ubicación / Dirección',
        body: params.address
      })
    }

    if (params.bio) {
      textModules.push({
        header: 'ℹ️ Sobre Nosotros',
        body: params.bio.length > 250 ? `${params.bio.slice(0, 247)}...` : params.bio
      })
    }

    const links: any[] = [
      {
        uri: params.publicUrl,
        description: 'Ver Perfil Digital Oficial'
      }
    ]

    if (params.phone) {
      const cleanPhone = params.phone.replace(/\D/g, '')
      if (cleanPhone) {
        links.push({
          uri: `https://wa.me/${cleanPhone}`,
          description: 'Escribir a WhatsApp'
        })
      }
    }

    const genericObject: any = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      hexBackgroundColor: brandColor,
      cardTitle: {
        defaultValue: {
          language: 'es',
          value: `${displayName} • Contacto Oficial`
        }
      },
      header: {
        defaultValue: {
          language: 'es',
          value: params.fullName
        }
      },
      subheader: {
        defaultValue: {
          language: 'es',
          value: displaySubtitle
        }
      },
      logo: {
        sourceUri: {
          uri: logoUri
        },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Logo de ${displayName}`
          }
        }
      },
      heroImage: {
        sourceUri: {
          uri: coverUri
        },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Portada de ${displayName}`
          }
        }
      },
      barcode: {
        type: 'QR_CODE',
        value: params.publicUrl,
        alternateText: 'Escanear para abrir contacto'
      },
      textModulesData: textModules,
      linksModuleData: {
        uris: links
      }
    }

    const now = Math.floor(Date.now() / 1000)
    const claims = {
      iss: clientEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      origins: [
        'https://omnitag.site',
        'https://www.omnitag.site',
        'http://localhost:3000'
      ],
      payload: {
        genericClasses: [genericClass],
        genericObjects: [genericObject]
      }
    }

    const token = signGoogleWalletJwt(claims, clientEmail, privateKey)
    return {
      success: true,
      url: `https://pay.google.com/gp/v/save/${token}`
    }
  } catch (err: any) {
    console.error('Error generando Google Wallet vCard Pass:', err)
    return {
      success: false,
      error: err.message || 'Error al firmar el pase de vCard.'
    }
  }
}

/**
/**
 * Colección de banners de alta resolución para pases de Google Wallet según la temática
 */
const THEME_HERO_IMAGES: Record<string, string> = {
  luxury_gold: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1032&h=336&fit=crop&q=85', // Oro y destellos negros de lujo
  spa_rose: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1032&h=336&fit=crop&q=85', // Spa sereno con piedras y flores rosas
  emerald_botanic: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1032&h=336&fit=crop&q=85', // Piedras de spa zen esmeralda y bambú
  champagne: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1032&h=336&fit=crop&q=85', // Tonos dorados champagne de celebración
  festive_red: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1032&h=336&fit=crop&q=85', // Lazo festivo rojo rubí de regalo
}

/**
 * Genera un pase nativo de Google Wallet (Gift Card / Voucher Pass)
 */
export function createGoogleWalletGiftCardPass(params: {
  card: {
    code: string
    title: string
    card_type: string
    service_name?: string | null
    current_balance: number
    currency_symbol?: string
    recipient_name: string
    buyer_name?: string | null
    gift_message?: string | null
    theme_color?: string
    card_image_url?: string | null
    expires_at?: string | null
  }
  businessName: string
  logoUrl?: string | null
  publicUrl: string
}): {
  success: boolean
  url?: string
  error?: string
} {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  const clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY

  if (!issuerId || !clientEmail || !privateKey) {
    return {
      success: false,
      error: 'Credenciales de Google Wallet no configuradas.'
    }
  }

  try {
    const classSuffix = sanitizeWalletId(`giftcard_${params.card.code}_v4`)
    const objectSuffix = sanitizeWalletId(`giftcard_${params.card.code}_obj_v4`)
    const classId = `${issuerId}.${classSuffix}`
    const objectId = `${issuerId}.${objectSuffix}`

    const brandColor = sanitizeHexColor(params.card.theme_color || '#78350F')

    // Logo oficial del negocio o fallback de regalo de lujo
    const defaultGiftLogo = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop&q=85'
    const rawLogo = (params.logoUrl && params.logoUrl.startsWith('http')) ? params.logoUrl : defaultGiftLogo
    const logoUri = getProxiedImageUrl(rawLogo)

    // Hero banner temático para Google Wallet
    const themeKey = params.card.card_image_url || 'luxury_gold'
    const rawHero = (params.card.card_image_url && params.card.card_image_url.startsWith('http'))
      ? params.card.card_image_url
      : (THEME_HERO_IMAGES[themeKey] || THEME_HERO_IMAGES.luxury_gold)
    const heroUri = getProxiedImageUrl(rawHero)

    const genericClass: any = {
      id: classId,
      issuerName: params.businessName || 'OmniTag Gift Card',
      reviewStatus: 'UNDER_REVIEW',
      hexBackgroundColor: brandColor,
      logo: {
        sourceUri: { uri: logoUri },
        contentDescription: { defaultValue: { language: 'es', value: `Logo de ${params.businessName}` } }
      }
    }

    const valueDisplay = params.card.card_type === 'service'
      ? (params.card.service_name || '1x Servicio Completo')
      : `${params.card.currency_symbol || 'L.'} ${Number(params.card.current_balance).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`

    const genericObject: any = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      hexBackgroundColor: brandColor,
      cardTitle: {
        defaultValue: {
          language: 'es',
          value: `${params.businessName} • Gift Card`
        }
      },
      subheader: {
        defaultValue: {
          language: 'es',
          value: `Para: ${params.card.recipient_name}`
        }
      },
      header: {
        defaultValue: {
          language: 'es',
          value: valueDisplay
        }
      },
      logo: {
        sourceUri: { uri: logoUri },
        contentDescription: { defaultValue: { language: 'es', value: `Logo de ${params.businessName}` } }
      },
      heroImage: {
        sourceUri: { uri: heroUri },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Tarjeta de Regalo ${params.businessName}`
          }
        }
      },
      barcode: {
        type: 'QR_CODE',
        value: params.publicUrl,
        alternateText: params.card.code
      },
      textModulesData: [
        {
          header: '🎁 De parte de',
          body: params.card.buyer_name || 'Un ser querido'
        },
        {
          header: '💬 Dedicatoria',
          body: params.card.gift_message || '¡Disfruta mucho tu regalo!'
        },
        {
          header: '💳 N° de Serie / Código',
          body: params.card.code
        },
        {
          header: '📅 Vencimiento',
          body: params.card.expires_at 
            ? new Date(params.card.expires_at).toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Sin fecha de vencimiento (Válido siempre)'
        },
        {
          header: 'ℹ️ Instrucciones de Canje',
          body: `Presenta este pase o su código QR en caja al pagar tus servicios en ${params.businessName}.`
        }
      ],
      linksModuleData: {
        uris: [
          {
            uri: params.publicUrl,
            description: 'Ver voucher oficial y saldo en vivo'
          }
        ]
      }
    }

    const now = Math.floor(Date.now() / 1000)
    const claims = {
      iss: clientEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: now,
      origins: [
        'https://omnitag.site',
        'https://www.omnitag.site',
        'http://localhost:3000'
      ],
      payload: {
        genericClasses: [genericClass],
        genericObjects: [genericObject]
      }
    }

    const token = signGoogleWalletJwt(claims, clientEmail, privateKey)
    return {
      success: true,
      url: `https://pay.google.com/gp/v/save/${token}`
    }
  } catch (err: any) {
    console.error('Error generando Google Wallet Gift Card Pass:', err)
    return {
      success: false,
      error: err.message || 'Error al firmar el pase de Google Wallet.'
    }
  }
}

