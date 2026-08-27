'use client'

import { useState } from 'react'
import { THEME_PRESETS, FONT_OPTIONS, BORDER_OPTIONS, ThemeConfig, resolveTheme } from '@/lib/themes'
import { Sparkles, Palette, Type, Square, Sliders, Check } from 'lucide-react'

interface ThemeSelectorProps {
  initialTheme?: any
  fieldNamePrefix?: string
}

export default function ThemeSelector({
  initialTheme,
  fieldNamePrefix = 'theme',
}: ThemeSelectorProps) {
  const resolved = resolveTheme(initialTheme)
  const [activePreset, setActivePreset] = useState<string>(resolved.preset || 'minimal_white')
  const [primaryColor, setPrimaryColor] = useState<string>(resolved.primary_color)
  const [bgColor, setBgColor] = useState<string>(resolved.bg_color)
  const [cardBg, setCardBg] = useState<string>(resolved.card_bg)
  const [textColor, setTextColor] = useState<string>(resolved.text_color)
  const [fontFamily, setFontFamily] = useState<ThemeConfig['font_family']>(resolved.font_family)
  const [borderStyle, setBorderStyle] = useState<ThemeConfig['border_style']>(resolved.border_style)
  const [isDark, setIsDark] = useState<boolean>(resolved.is_dark)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSelectPreset = (presetId: string) => {
    const preset = THEME_PRESETS[presetId]
    if (!preset) return
    setActivePreset(presetId)
    setPrimaryColor(preset.config.primary_color)
    setBgColor(preset.config.bg_color)
    setCardBg(preset.config.card_bg)
    setTextColor(preset.config.text_color)
    setFontFamily(preset.config.font_family)
    setBorderStyle(preset.config.border_style)
    setIsDark(preset.config.is_dark)
  }

  return (
    <div className="space-y-6">
      {/* 1. Presets de Temas (1 Clic) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Plantillas de Diseño Preconfiguradas
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(THEME_PRESETS).map((preset) => {
            const isSelected = activePreset === preset.id
            const [bg, card, primary] = preset.previewColors

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isSelected 
                    ? 'border-black ring-2 ring-black/10 bg-white shadow-md' 
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {/* Mini maqueta visual del tema */}
                <div 
                  className="w-full h-16 rounded-xl p-2 mb-2.5 flex flex-col justify-between shadow-inner border border-black/5"
                  style={{ backgroundColor: bg }}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primary }} />
                    <div className="w-8 h-2 rounded-full opacity-40" style={{ backgroundColor: primary }} />
                  </div>
                  <div 
                    className="w-full h-6 rounded-lg p-1 flex items-center gap-1.5"
                    style={{ backgroundColor: card }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                    <div className="w-12 h-1.5 rounded-sm bg-gray-400/40" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 line-clamp-1">{preset.name.split('(')[0]}</span>
                  {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{preset.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Selector de Tipografía */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-blue-600" />
          Tipografía de Marca
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => {
                setFontFamily(font.id as any)
                setActivePreset('custom')
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                fontFamily === font.id
                  ? 'border-black bg-black text-white shadow-xs'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{font.name}</p>
                <p className={`text-xs mt-0.5 ${fontFamily === font.id ? 'text-gray-300' : 'text-gray-400'}`}>
                  OmniTag Demo 123
                </p>
              </div>
              {fontFamily === font.id && <Check className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Selector de Estilo de Bordes y Acabados */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Square className="w-4 h-4 text-emerald-600" />
          Estilo de Tarjetas y Botones
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BORDER_OPTIONS.map((border) => (
            <button
              key={border.id}
              type="button"
              onClick={() => {
                setBorderStyle(border.id as any)
                setActivePreset('custom')
              }}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                borderStyle === border.id
                  ? 'border-black bg-black text-white shadow-xs font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium'
              }`}
            >
              <span className="text-xs">{border.name.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Personalización Avanzada de Colores (Desplegable) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1.5 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          {showAdvanced ? 'Ocultar ajuste fino de colores' : 'Ajustar colores personalizados (Fondo, Botones, Textos)'}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-150">
            {/* Color Primario / Botones */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Color de Acento / Botones</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-full text-xs font-mono uppercase rounded-lg border border-gray-300 bg-white px-2 py-1.5"
                />
              </div>
            </div>

            {/* Fondo de Pantalla */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Color de Fondo Exterior</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-full text-xs font-mono uppercase rounded-lg border border-gray-300 bg-white px-2 py-1.5"
                />
              </div>
            </div>

            {/* Fondo de la Tarjeta */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Fondo de la Tarjeta / Menú</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cardBg}
                  onChange={(e) => {
                    setCardBg(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={cardBg}
                  onChange={(e) => {
                    setCardBg(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-full text-xs font-mono uppercase rounded-lg border border-gray-300 bg-white px-2 py-1.5"
                />
              </div>
            </div>

            {/* Color del Texto */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">Color del Texto</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="w-full text-xs font-mono uppercase rounded-lg border border-gray-300 bg-white px-2 py-1.5"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden inputs para enviar la configuración completa dentro del Formulario */}
      <input type="hidden" name={`${fieldNamePrefix}_preset`} value={activePreset} />
      <input type="hidden" name={`${fieldNamePrefix}_primary_color`} value={primaryColor} />
      <input type="hidden" name={`${fieldNamePrefix}_bg_color`} value={bgColor} />
      <input type="hidden" name={`${fieldNamePrefix}_card_bg`} value={cardBg} />
      <input type="hidden" name={`${fieldNamePrefix}_text_color`} value={textColor} />
      <input type="hidden" name={`${fieldNamePrefix}_font_family`} value={fontFamily} />
      <input type="hidden" name={`${fieldNamePrefix}_border_style`} value={borderStyle} />
      <input type="hidden" name={`${fieldNamePrefix}_is_dark`} value={isDark ? 'true' : 'false'} />
      {/* Campo legado color para compatibilidad previa */}
      <input type="hidden" name="color" value={primaryColor} />
    </div>
  )
}
