import { headers } from 'next/headers'
import { Locale, DEFAULT_LOCALE } from './config'
import { getDictionary, Dictionary } from './dictionaries'

/**
 * Obtiene el idioma detectado para el Server Component actual mediante cabeceras del middleware
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const headersList = await headers()
    const localeHeader = headersList.get('x-locale')
    if (localeHeader === 'es' || localeHeader === 'en') {
      return localeHeader
    }
  } catch {
    // Fuera de contexto de request
  }
  return DEFAULT_LOCALE
}

/**
 * Obtiene el diccionario correspondiente al idioma del Server Component actual
 */
export async function getServerDictionary(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getServerLocale()
  const dict = getDictionary(locale)
  return { locale, dict }
}
