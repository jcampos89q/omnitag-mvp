export interface ThemeConfig {
  preset?: string
  primary_color: string
  bg_color: string
  card_bg: string
  text_color: string
  muted_text_color: string
  font_family: 'jakarta' | 'outfit' | 'space_grotesk' | 'playfair' | 'poppins'
  border_style: 'rounded' | 'pill' | 'square' | 'glass'
  is_dark: boolean
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  previewColors: [string, string, string] // [bg, card, primary]
  config: ThemeConfig
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  nexoria_tech: {
    id: 'nexoria_tech',
    name: 'Nexoria Tech (Neón Oscuro)',
    description: 'Estética futurista, fondo oscuro profundo con acentos esmeralda y ciberpunk.',
    previewColors: ['#090D16', '#111827', '#10B981'],
    config: {
      preset: 'nexoria_tech',
      primary_color: '#10B981',
      bg_color: '#090D16',
      card_bg: '#111827',
      text_color: '#F9FAFB',
      muted_text_color: '#9CA3AF',
      font_family: 'space_grotesk',
      border_style: 'rounded',
      is_dark: true
    }
  },
  luxury_gold: {
    id: 'luxury_gold',
    name: 'Luxury Gold (Elegancia & Lujo)',
    description: 'Negro azabache con toques de oro y tipografía de alta gama.',
    previewColors: ['#050505', '#141414', '#D97706'],
    config: {
      preset: 'luxury_gold',
      primary_color: '#D97706',
      bg_color: '#050505',
      card_bg: '#141414',
      text_color: '#FAF8F5',
      muted_text_color: '#A8A29E',
      font_family: 'playfair',
      border_style: 'rounded',
      is_dark: true
    }
  },
  minimal_white: {
    id: 'minimal_white',
    name: 'Minimal White (Estilo Apple)',
    description: 'Blanco puro, contrastes limpios y diseño ultra legible y minimalista.',
    previewColors: ['#F8FAFC', '#FFFFFF', '#0F172A'],
    config: {
      preset: 'minimal_white',
      primary_color: '#0F172A',
      bg_color: '#F8FAFC',
      card_bg: '#FFFFFF',
      text_color: '#0F172A',
      muted_text_color: '#64748B',
      font_family: 'jakarta',
      border_style: 'rounded',
      is_dark: false
    }
  },
  corporate_blue: {
    id: 'corporate_blue',
    name: 'Ocean Corporate (Empresarial)',
    description: 'Azul marino profesional con acentos vivos que inspiran confianza.',
    previewColors: ['#0F172A', '#1E293B', '#2563EB'],
    config: {
      preset: 'corporate_blue',
      primary_color: '#2563EB',
      bg_color: '#0F172A',
      card_bg: '#1E293B',
      text_color: '#F8FAFC',
      muted_text_color: '#94A3B8',
      font_family: 'outfit',
      border_style: 'rounded',
      is_dark: true
    }
  },
  warm_bistro: {
    id: 'warm_bistro',
    name: 'Warm Bistró & Café (Cálido)',
    description: 'Tonos crema, terracota y madera, ideal para gastronomía y diseño artesanal.',
    previewColors: ['#FBF8F3', '#FFFFFF', '#B45309'],
    config: {
      preset: 'warm_bistro',
      primary_color: '#B45309',
      bg_color: '#FBF8F3',
      card_bg: '#FFFFFF',
      text_color: '#292524',
      muted_text_color: '#78716C',
      font_family: 'playfair',
      border_style: 'rounded',
      is_dark: false
    }
  },
  sunset_creative: {
    id: 'sunset_creative',
    name: 'Sunset Creative (Moderno & Creativo)',
    description: 'Degradados sutiles en violeta y rosa para marcas creativas y dinámicas.',
    previewColors: ['#FAF5FF', '#FFFFFF', '#9333EA'],
    config: {
      preset: 'sunset_creative',
      primary_color: '#9333EA',
      bg_color: '#FAF5FF',
      card_bg: '#FFFFFF',
      text_color: '#1E1B4B',
      muted_text_color: '#6B7280',
      font_family: 'poppins',
      border_style: 'rounded',
      is_dark: false
    }
  }
}

export const FONT_OPTIONS = [
  { id: 'jakarta', name: 'Plus Jakarta Sans (Limpia & SaaS)', fontClass: 'font-sans', googleFont: 'Plus+Jakarta+Sans:wght@400;600;700;800' },
  { id: 'outfit', name: 'Outfit (Geométrica & Elegante)', fontClass: 'font-outfit', googleFont: 'Outfit:wght@400;600;700;800' },
  { id: 'space_grotesk', name: 'Space Grotesk (Tech & Futurista)', fontClass: 'font-mono', googleFont: 'Space+Grotesk:wght@400;600;700' },
  { id: 'playfair', name: 'Playfair Display (Serif de Lujo)', fontClass: 'font-serif', googleFont: 'Playfair+Display:wght@400;600;700;900' },
  { id: 'poppins', name: 'Poppins (Comercial & Amigable)', fontClass: 'font-sans', googleFont: 'Poppins:wght@400;500;600;700' },
]

export const BORDER_OPTIONS = [
  { id: 'rounded', name: 'Curvas Suaves (2xl)', radiusClass: 'rounded-2xl', buttonRadius: 'rounded-xl' },
  { id: 'pill', name: 'Borde Píldora (Pill)', radiusClass: 'rounded-3xl', buttonRadius: 'rounded-full' },
  { id: 'square', name: 'Esquinas Cuadradas (Clean)', radiusClass: 'rounded-none', buttonRadius: 'rounded-none' },
  { id: 'glass', name: 'Efecto Cristal (Glassmorphism)', radiusClass: 'rounded-2xl backdrop-blur-md', buttonRadius: 'rounded-xl' },
]

/**
 * Resuelve una configuración de tema garantizando valores predeterminados seguros
 */
export function resolveTheme(rawTheme: any): ThemeConfig {
  if (!rawTheme || typeof rawTheme !== 'object') {
    return THEME_PRESETS.minimal_white.config
  }

  // Si tiene un preset específico
  if (rawTheme.preset && THEME_PRESETS[rawTheme.preset]) {
    const base = THEME_PRESETS[rawTheme.preset].config
    return {
      ...base,
      ...rawTheme,
      primary_color: rawTheme.primary_color || rawTheme.color || base.primary_color,
      bg_color: rawTheme.bg_color || base.bg_color,
      card_bg: rawTheme.card_bg || base.card_bg,
      text_color: rawTheme.text_color || base.text_color,
      muted_text_color: rawTheme.muted_text_color || base.muted_text_color,
      font_family: rawTheme.font_family || base.font_family,
      border_style: rawTheme.border_style || base.border_style,
      is_dark: typeof rawTheme.is_dark === 'boolean' ? rawTheme.is_dark : base.is_dark,
    }
  }

  // Si tiene solo color heredado (retrocompatibilidad)
  const legacyColor = rawTheme.color || '#0F172A'
  return {
    preset: 'custom',
    primary_color: rawTheme.primary_color || legacyColor,
    bg_color: rawTheme.bg_color || '#F8FAFC',
    card_bg: rawTheme.card_bg || '#FFFFFF',
    text_color: rawTheme.text_color || '#0F172A',
    muted_text_color: rawTheme.muted_text_color || '#64748B',
    font_family: rawTheme.font_family || 'jakarta',
    border_style: rawTheme.border_style || 'rounded',
    is_dark: Boolean(rawTheme.is_dark),
  }
}

/**
 * Obtiene la URL de Google Fonts para inyectar la tipografía en la cabecera
 */
export function getGoogleFontUrl(fontFamily: ThemeConfig['font_family']): string {
  const font = FONT_OPTIONS.find(f => f.id === fontFamily) || FONT_OPTIONS[0]
  return `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`
}

/**
 * Obtiene el family css inline para la tipografía
 */
export function getFontFamilyCss(fontFamily: ThemeConfig['font_family']): string {
  switch (fontFamily) {
    case 'space_grotesk':
      return `'Space Grotesk', system-ui, sans-serif`
    case 'playfair':
      return `'Playfair Display', Georgia, serif`
    case 'outfit':
      return `'Outfit', system-ui, sans-serif`
    case 'poppins':
      return `'Poppins', system-ui, sans-serif`
    case 'jakarta':
    default:
      return `'Plus Jakarta Sans', system-ui, sans-serif`
  }
}
