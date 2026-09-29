import crypto from 'crypto'

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Sanitiza identificadores según el estándar de Google Wallet
 */
function sanitizeWalletId(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
}

/**
 * Codificación Base64URL según estándar RFC 7515
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
 * Obtiene un token de acceso OAuth2 con alcance wallet_object.issuer
 * con almacenamiento en caché automático en memoria.
 */
export async function getGoogleWalletAccessToken(): Promise<{
  token?: string
  error?: string
}> {
  const clientEmail = process.env.GOOGLE_WALLET_CLIENT_EMAIL
  let privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY

  if (!clientEmail || !privateKey) {
    return { error: 'Credenciales de Google Wallet no configuradas en variables de entorno.' }
  }

  const now = Math.floor(Date.now() / 1000)

  // Reusar token en caché si aún le quedan más de 5 minutos de vida
  if (cachedToken && cachedToken.expiresAt > now + 300) {
    return { token: cachedToken.token }
  }

  try {
    // Normalizar clave privada
    let formattedKey = privateKey.trim()
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

    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))
    const signatureInput = `${encodedHeader}.${encodedPayload}`

    const signer = crypto.createSign('RSA-SHA256')
    signer.update(signatureInput)
    const signature = signer.sign(formattedKey)
    const jwt = `${signatureInput}.${base64url(signature)}`

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    const data = await response.json()
    if (!response.ok || !data.access_token) {
      console.error('Error obteniendo token OAuth2 de Google Wallet:', data)
      return { error: data.error_description || data.error || 'Error al autenticar con Google Cloud.' }
    }

    cachedToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600),
    }

    return { token: data.access_token }
  } catch (err: any) {
    console.error('Error generando OAuth2 JWT:', err)
    return { error: err.message || 'Error en la firma criptográfica para Google Wallet.' }
  }
}

/**
 * Envía un mensaje Push masivo (Broadcast) a todos los clientes que guardaron el pase
 */
export async function sendLoyaltyPushMessage(params: {
  programSlug: string
  title: string
  body: string
}): Promise<{
  success: boolean
  error?: string
  needsApiEnable?: boolean
  data?: any
}> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  if (!issuerId) {
    return { success: false, error: 'Falta configurar GOOGLE_WALLET_ISSUER_ID.' }
  }

  const { token, error: tokenError } = await getGoogleWalletAccessToken()
  if (tokenError || !token) {
    return { success: false, error: tokenError || 'No se pudo obtener autorización de Google.' }
  }

  const classSuffix = sanitizeWalletId(`loyalty_${params.programSlug}_v2`)
  const classId = `${issuerId}.${classSuffix}`

  try {
    const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${encodeURIComponent(classId)}/addMessage`
    const payload = {
      message: {
        header: params.title,
        body: params.body,
        kind: 'walletobjects#message',
        messageType: 'TEXT',
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await res.json()

    if (!res.ok) {
      const errorMsg = result?.error?.message || 'Error desconocido de Google Wallet API'
      const isApiDisabled = result?.error?.status === 'PERMISSION_DENIED' && errorMsg.includes('Google Wallet API has not been used')
      return {
        success: false,
        error: errorMsg,
        needsApiEnable: isApiDisabled,
        data: result,
      }
    }

    return { success: true, data: result }
  } catch (err: any) {
    console.error('Error enviando mensaje push a Google Wallet:', err)
    return { success: false, error: err.message || 'Fallo de conexión al enviar el mensaje push.' }
  }
}

/**
 * Actualiza los sellos de un cliente en su Google Wallet en tiempo real (disparando actualización en su móvil)
 */
export async function updateLoyaltyMemberStamps(params: {
  programSlug: string
  customerPhone: string
  newStamps: number
  totalRequired: number
  rewardTitle: string
}): Promise<{
  success: boolean
  error?: string
  data?: any
}> {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  if (!issuerId) return { success: false, error: 'Issuer ID no configurado.' }

  const { token, error: tokenError } = await getGoogleWalletAccessToken()
  if (tokenError || !token) return { success: false, error: tokenError }

  const objectSuffix = sanitizeWalletId(
    `loyalty_${params.programSlug}_${params.customerPhone.replace(/\D/g, '') || 'client'}`
  )
  const objectId = `${issuerId}.${objectSuffix}`

  try {
    const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(objectId)}`
    const patchPayload = {
      loyaltyPoints: {
        label: 'Sellos Acumulados',
        balance: {
          string: `${params.newStamps} de ${params.totalRequired} sellos ⭐`,
        },
      },
      textModulesData: [
        {
          header: '🎁 Premio por Completar',
          body: params.rewardTitle,
        },
        {
          header: 'Progreso del Club',
          body: `Llevas ${params.newStamps} de ${params.totalRequired} sellos acumulados en tus visitas.`,
        },
      ],
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchPayload),
    })

    const result = await res.json()
    if (!res.ok) {
      // Si el objeto aún no existe en Google Wallet (porque el usuario no ha pulsado Guardar en su teléfono), no es un error crítico
      return { success: false, error: result?.error?.message, data: result }
    }

    return { success: true, data: result }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
