'use client'

import { useState, useRef } from 'react'
import { UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadInputProps {
  name: string
  label: string
  defaultValue?: string | null
  shape?: 'circle' | 'banner' | 'square'
  helpText?: string
  placeholder?: string
}

/**
 * Optimiza y comprime imágenes en el navegador antes de subirlas a Supabase Storage
 */
async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

export default function ImageUploadInput({
  name,
  label,
  defaultValue = '',
  shape = 'square',
  helpText,
  placeholder = 'https://...',
}: ImageUploadInputProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(defaultValue || '')
  const [isUrlMode, setIsUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState(defaultValue || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      // 1. Vista previa inmediata
      const localPreview = URL.createObjectURL(file)
      setCurrentUrl(localPreview)

      // 2. Comprimir imagen para optimizar carga (evita errores de peso en Vercel)
      const compressedBlob = await compressImage(file, 1920, 0.85)

      // 3. Subir directo a Supabase Storage desde el cliente
      const supabase = createClient()
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 25)
      
      const filePath = `uploads/${Date.now()}_${sanitizedName}.jpg`

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('omnitag_media')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadErr) {
        console.error('Error subiendo imagen a Supabase Storage:', uploadErr)
        throw new Error(uploadErr.message)
      }

      // 4. Obtener URL pública definitiva
      const { data: publicData } = supabase.storage
        .from('omnitag_media')
        .getPublicUrl(filePath)

      const finalPublicUrl = publicData.publicUrl
      setCurrentUrl(finalPublicUrl)
      setUrlValue(finalPublicUrl)
      setUploadSuccess(true)
    } catch (err: any) {
      console.error('Error en subida de imagen:', err)
      setUploadError(err.message || 'No se pudo subir la imagen. Intenta con otra.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setCurrentUrl('')
    setUrlValue('')
    setUploadError(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUrlValue(val)
    setCurrentUrl(val)
  }

  // Preview container aspect ratio / shape classes
  const getShapeClasses = () => {
    switch (shape) {
      case 'circle':
        return 'w-20 h-20 sm:w-24 sm:h-24 rounded-full'
      case 'banner':
        return 'w-full h-28 sm:h-32 rounded-xl'
      case 'square':
      default:
        return 'w-20 h-20 sm:w-24 sm:h-24 rounded-xl'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
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
            className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-black focus:outline-none"
          />
          {currentUrl && (
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
              <div className={`${getShapeClasses()} bg-gray-200 overflow-hidden shrink-0 border border-gray-300 flex items-center justify-center`}>
                <img src={currentUrl} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Quitar imagen
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/70 hover:bg-gray-50 transition-colors">
          {/* Vista previa o placeholder */}
          <div
            className={`${getShapeClasses()} bg-white shadow-xs overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center relative group`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-1 text-black p-2 text-center">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-bold">Subiendo...</span>
              </div>
            ) : currentUrl ? (
              <>
                <img src={currentUrl} alt="Vista previa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-gray-800 border border-gray-300 rounded-lg shadow-xs hover:bg-gray-50 hover:text-black transition cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo imagen...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-gray-500" />
                    {currentUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </>
                )}
              </button>

              {currentUrl && !isUploading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition cursor-pointer"
                >
                  Eliminar
                </button>
              )}

              {uploadSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Imagen lista
                </span>
              )}
            </div>

            {/* Hidden Input que contiene la URL real subida a Supabase */}
            <input
              type="hidden"
              name={`${name}_url`}
              value={currentUrl}
            />

            {uploadError ? (
              <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
              </p>
            ) : (
              <p className="text-[11px] text-gray-500">
                {helpText || 'JPG, PNG, WEBP o GIF. Se comprime y optimiza automáticamente.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
