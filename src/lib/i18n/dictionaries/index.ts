import { es } from './es'
import { en } from './en'
import type { Locale } from '../config'

export const dictionaries = {
  es,
  en,
}

export type Dictionary = typeof es

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.es
}
