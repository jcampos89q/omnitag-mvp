'use client'

import { useState, useRef } from 'react'
import { UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react'

interface ImageUploadInputProps {
  name: string
  label: string
  defaultValue?: string | null
  shape?: 'circle' | 'banner' | 'square'
  helpText?: string
  placeholder?: string
}

export default function ImageUploadInput({
  name,
  label,
  defaultValue = '',
  shape = 'square',
  helpText,
  placeholder = 'https://...',
}: ImageUploadInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultValue || null)
  const [isUrlMode, setIsUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState(defaultValue || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setUrlValue('')
    }
  }

  const handleClear = () => {
    setPreviewUrl(null)
    setUrlValue('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUrlValue(val)
    setPreviewUrl(val || null)
  }

  // Preview container aspect ratio / shape classes
  const getShapeClasses = () => {
    switch (shape) {
      case 'circle':
        return 'w-24 h-24 rounded-full'
      case 'banner':
        return 'w-full h-32 rounded-lg'
      case 'square':
      default:
        return 'w-24 h-24 rounded-xl'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          {isUrlMode ? (
            <>
              <UploadCloud className="w-3.5 h-3.5" /> Subir archivo local
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" /> Usar enlace URL
            </>
          )}
        </button>
      </div>

      {isUrlMode ? (
        <div className="space-y-2">
          <input
            type="url"
            name={`${name}_url`}
            value={urlValue}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none"
          />
          {previewUrl && (
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className={`${getShapeClasses()} bg-gray-200 overflow-hidden shrink-0 border border-gray-300 flex items-center justify-center`}>
                <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Quitar imagen
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/70 hover:bg-gray-50 transition-colors">
          {/* Vista previa o placeholder */}
          <div
            className={`${getShapeClasses()} bg-white shadow-sm overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center relative group`}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex-1 space-y-1.5 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                name={`${name}_file`}
                id={`${name}_file`}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:text-black transition"
              >
                <UploadCloud className="w-4 h-4 text-gray-500" />
                {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </button>

              {previewUrl && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md font-medium transition"
                >
                  Eliminar
                </button>
              )}
            </div>

            {/* Hidden fallback for current existing URL */}
            <input type="hidden" name={`${name}_url`} value={urlValue || (previewUrl?.startsWith('http') ? previewUrl : '')} />

            <p className="text-[11px] text-gray-500">
              {helpText || 'Formatos: JPG, PNG, WEBP o GIF (máx. 5MB).'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
