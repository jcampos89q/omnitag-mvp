'use client'

import { useLocale } from '@/lib/i18n/context'
import { Globe } from 'lucide-react'

interface LanguageSelectorProps {
  variant?: 'pill' | 'minimal' | 'footer' | 'dark'
  className?: string
}

export default function LanguageSelector({
  variant = 'pill',
  className = '',
}: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale()

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 ${className}`}
        title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        aria-label="Cambiar idioma / Switch language"
      >
        <Globe className="w-3.5 h-3.5 text-gray-500" />
        <span className="uppercase">{locale}</span>
      </button>
    )
  }

  if (variant === 'dark') {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-gray-400 ml-1.5 mr-0.5" />
        <button
          type="button"
          onClick={() => setLocale('es')}
          className={`px-2 py-0.5 rounded-lg transition cursor-pointer text-[11px] font-black ${
            locale === 'es'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ES
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`px-2 py-0.5 rounded-lg transition cursor-pointer text-[11px] font-black ${
            locale === 'en'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-gray-600 ${className}`}>
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="font-bold text-gray-700">Idioma / Language:</span>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setLocale('es')}
            className={`px-2.5 py-1 rounded-md text-xs font-black transition cursor-pointer ${
              locale === 'es'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Español
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`px-2.5 py-1 rounded-md text-xs font-black transition cursor-pointer ${
              locale === 'en'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            English
          </button>
        </div>
      </div>
    )
  }

  // Default 'pill' variant
  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-xl border border-gray-200 bg-gray-50/90 shadow-2xs text-xs font-bold ${className}`}
      role="group"
      aria-label="Selector de idioma / Language selector"
    >
      <Globe className="w-3.5 h-3.5 text-gray-400 ml-1.5 mr-1" />
      <button
        type="button"
        onClick={() => setLocale('es')}
        className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] font-black ${
          locale === 'es'
            ? 'bg-white text-gray-950 shadow-xs border border-gray-200/80'
            : 'text-gray-500 hover:text-gray-900'
        }`}
        title="Español"
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded-lg transition cursor-pointer text-[11px] font-black ${
          locale === 'en'
            ? 'bg-white text-gray-950 shadow-xs border border-gray-200/80'
            : 'text-gray-500 hover:text-gray-900'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  )
}
