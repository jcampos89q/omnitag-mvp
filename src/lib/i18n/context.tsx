'use client'

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Locale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALES } from './config'
import { getDictionary, Dictionary } from './dictionaries'

interface I18nContextType {
  locale: Locale
  setLocale: (newLocale: Locale) => void
  dict: Dictionary
  t: (path: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE)
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Sincronizar atributo lang del <html> en el cliente
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const dict = getDictionary(locale)

  const setLocale = (newLocale: Locale) => {
    if (!LOCALES.includes(newLocale) || newLocale === locale) return

    setLocaleState(newLocale)

    // Guardar en cookies para futuras peticiones HTTP y middleware
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = newLocale
    }

    // Refrescar Server Components con el nuevo idioma
    startTransition(() => {
      router.refresh()
    })
  }

  // Función t auxiliar para resolver claves por puntos: t('hero.titleLine1')
  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.')
    let current: any = dict
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return fallback || path
      }
    }
    return typeof current === 'string' ? current : fallback || path
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, dict, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    // Si se utiliza fuera del provider, fallback seguro a español
    const dict = getDictionary(DEFAULT_LOCALE)
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      dict,
      t: (path: string, fallback?: string) => fallback || path,
    }
  }
  return context
}

export function useLocale() {
  const { locale, setLocale } = useTranslation()
  return { locale, setLocale }
}
