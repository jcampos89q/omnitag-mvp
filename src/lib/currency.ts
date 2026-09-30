export interface CurrencyOption {
  code: string
  symbol: string
  label: string
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'HNL', symbol: 'L.', label: 'Lempiras Hondureños (L. / HNL)' },
  { code: 'USD', symbol: '$', label: 'Dólares Estadounidenses ($ / USD)' },
  { code: 'EUR', symbol: '€', label: 'Euros (€ / EUR)' },
  { code: 'GTQ', symbol: 'Q', label: 'Quetzales Guatemaltecos (Q / GTQ)' },
  { code: 'NIO', symbol: 'C$', label: 'Córdobas Nicaragüenses (C$ / NIO)' },
  { code: 'CRC', symbol: '₡', label: 'Colones Costarricenses (₡ / CRC)' },
  { code: 'MXN', symbol: '$', label: 'Pesos Mexicanos ($ / MXN)' },
]

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0] // Lempiras por defecto

export function formatMoney(
  amount: number | string | null | undefined, 
  symbol: string = 'L.'
): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0
  const formatted = num.toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${symbol || 'L.'} ${formatted}`
}

export function getCurrencySymbol(codeOrSymbol?: string | null): string {
  if (!codeOrSymbol) return 'L.'
  const found = SUPPORTED_CURRENCIES.find(
    c => c.code.toUpperCase() === codeOrSymbol.toUpperCase() || c.symbol === codeOrSymbol
  )
  return found ? found.symbol : codeOrSymbol
}
