export type Locale = 'es' | 'en'

export const DEFAULT_LOCALE: Locale = 'es'
export const LOCALES: Locale[] = ['es', 'en']
export const LOCALE_COOKIE_NAME = 'omnitag_locale'

/**
 * Códigos de país ISO Alpha-2 donde el idioma predominante es el español.
 * Si la petición proviene de cualquiera de estos países, se asigna 'es'.
 * De cualquier otro país (EE. UU., Canadá, Reino Unido, Europa no hispana, etc.), se asigna 'en'.
 */
export const SPANISH_COUNTRIES = new Set([
  'ES', // España
  'MX', // México
  'HN', // Honduras
  'GT', // Guatemala
  'SV', // El Salvador
  'NI', // Nicaragua
  'CR', // Costa Rica
  'PA', // Panamá
  'CO', // Colombia
  'VE', // Venezuela
  'EC', // Ecuador
  'PE', // Perú
  'BO', // Bolivia
  'CL', // Chile
  'AR', // Argentina
  'UY', // Uruguay
  'PY', // Paraguay
  'DO', // República Dominicana
  'PR', // Puerto Rico
  'CU', // Cuba
  'GQ', // Guinea Ecuatorial
])

export interface HeaderLike {
  get(name: string): string | null
}

export interface CookieLike {
  get(name: string): { value: string } | undefined
}

/**
 * Detecta el idioma óptimo para la petición analizando:
 * 1. Cookie explícita del usuario (omnitag_locale o NEXT_LOCALE)
 * 2. Cabeceras de geolocalización por país (Vercel, Cloudflare, etc.)
 * 3. Cabecera Accept-Language del navegador
 * 4. Fallback por defecto ('es')
 */
export function detectLocaleFromHeaders(
  headers: HeaderLike,
  cookies?: CookieLike
): Locale {
  // 1. Elección manual previa del usuario guardada en cookies
  const cookieLocale = cookies?.get(LOCALE_COOKIE_NAME)?.value || cookies?.get('NEXT_LOCALE')?.value
  if (cookieLocale === 'es' || cookieLocale === 'en') {
    return cookieLocale
  }

  // 2. Detección automática por región geográfica (Vercel IP Country, Cloudflare, etc.)
  const country = (
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    headers.get('x-country-code') ||
    headers.get('x-geo-country') ||
    ''
  ).trim().toUpperCase()

  if (country) {
    if (SPANISH_COUNTRIES.has(country)) {
      return 'es'
    } else {
      return 'en'
    }
  }

  // 3. Detección por cabecera Accept-Language del navegador
  const acceptLang = (headers.get('accept-language') || '').toLowerCase()
  if (acceptLang) {
    const parts = acceptLang.split(',').map(part => {
      const [lang, qVal] = part.trim().split(';q=')
      const q = qVal ? parseFloat(qVal) : 1.0
      return { lang: lang.trim(), q: isNaN(q) ? 1.0 : q }
    }).sort((a, b) => b.q - a.q)

    for (const item of parts) {
      if (item.lang.startsWith('es')) return 'es'
      if (item.lang.startsWith('en')) return 'en'
    }
  }

  return DEFAULT_LOCALE
}
