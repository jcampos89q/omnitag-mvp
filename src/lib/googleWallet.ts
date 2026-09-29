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
    return 'https://www.omnitag.site/logo-light.png'
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
    const classSuffix = sanitizeWalletId(`loyalty_${params.programSlug}_v2`)
    const objectSuffix = sanitizeWalletId(
      `loyalty_${params.programSlug}_${params.customerPhone.replace(/\D/g, '') || 'client'}`
    )

    const classId = `${issuerId}.${classSuffix}`
    const objectId = `${issuerId}.${objectSuffix}`

    const brandColor = sanitizeHexColor(params.primaryColor)
    const logoUri = getProxiedImageUrl(params.logoUrl)

    // 1. Plantilla de Clase (Class)
    const loyaltyClass: any = {
      id: classId,
      issuerName: params.businessName || 'OmniTag',
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
      hexBackgroundColor: brandColor,
      reviewStatus: 'UNDER_REVIEW'
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
          header: 'Progreso del Club',
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
    const classSuffix = sanitizeWalletId(`vcard_${params.vcardSlug}_v2`)
    const objectSuffix = sanitizeWalletId(`vcard_${params.vcardSlug}_obj_v2`)

    const classId = `${issuerId}.${classSuffix}`
    const objectId = `${issuerId}.${objectSuffix}`

    const brandColor = sanitizeHexColor(params.primaryColor)
    const logoUri = getProxiedImageUrl(params.avatarUrl || params.coverUrl)
    const coverUri = params.coverUrl ? getProxiedImageUrl(params.coverUrl) : ''

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
      hexBackgroundColor: brandColor,
      reviewStatus: 'UNDER_REVIEW'
    }

    // 2. Generic Object
    const textModules: any[] = []

    if (params.phone) {
      textModules.push({
        header: 'Teléfono / WhatsApp',
        body: params.phone
      })
    }

    if (params.email) {
      textModules.push({
        header: 'Correo Electrónico',
        body: params.email
      })
    }

    if (params.address) {
      textModules.push({
        header: 'Ubicación / Dirección',
        body: params.address
      })
    }

    if (params.bio) {
      textModules.push({
        header: 'Sobre Nosotros',
        body: params.bio.length > 250 ? `${params.bio.slice(0, 247)}...` : params.bio
      })
    }

    const links: any[] = [
      {
        uri: params.publicUrl,
        description: 'Ver Perfil Digital'
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
          value: displayName
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

    // Si la tarjeta tiene imagen de portada panorámica, se agrega como Hero Banner de Google Wallet
    if (coverUri) {
      genericObject.heroImage = {
        sourceUri: {
          uri: coverUri
        },
        contentDescription: {
          defaultValue: {
            language: 'es',
            value: `Portada de ${displayName}`
          }
        }
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
