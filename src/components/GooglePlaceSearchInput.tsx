'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, CheckCircle2, Building2, Phone, X } from 'lucide-react'

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  types?: string[]
  direct_review_url: string
}

interface GooglePlaceSearchInputProps {
  onPlaceSelected: (place: PlaceDetails) => void
  initialPlace?: Partial<PlaceDetails> | null
  className?: string
}

export default function GooglePlaceSearchInput({
  onPlaceSelected,
  initialPlace,
  className = ''
}: GooglePlaceSearchInputProps) {
  const [query, setQuery] = useState('')
  const [predictions, setPredictions] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(
    initialPlace?.place_id
      ? {
          place_id: initialPlace.place_id,
          name: initialPlace.name || '',
          formatted_address: initialPlace.formatted_address || '',
          direct_review_url: initialPlace.direct_review_url || ''
        }
      : null
  )
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intentar obtener geolocalización aproximada del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // Ignorar si el usuario no da permiso
      )
    }
  }, [])

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2 || selectedPlace) {
      setPredictions([])
      setSearching(false)
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const geoParams = coords ? `&lat=${coords.lat}&lng=${coords.lng}` : ''
        const res = await fetch('/api/places/autocomplete?input=' + encodeURIComponent(query) + geoParams)
        const data = await res.json()
        setPredictions(data.predictions || [])
        setIsOpen(true)
      } catch (err) {
        console.error('Error autocomplete:', err)
        setPredictions([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, selectedPlace, coords])

  const handleSelectPrediction = async (prediction: any) => {
    setLoadingDetails(true)
    setIsOpen(false)
    try {
      const res = await fetch('/api/places/details?place_id=' + encodeURIComponent(prediction.place_id))
      const data: PlaceDetails = await res.json()
      if (data.place_id) {
        setSelectedPlace(data)
        setQuery(data.name)
        onPlaceSelected(data)
      }
    } catch (err) {
      console.error('Error fetching place details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleClear = () => {
    setSelectedPlace(null)
    setQuery('')
    setPredictions([])
  }

  return (
    <div ref={containerRef} className={`relative space-y-3 ${className}`}>
      {!selectedPlace ? (
        <div className="space-y-1.5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedPlace(null)
              }}
              onFocus={() => {
                if (predictions.length > 0) setIsOpen(true)
              }}
              placeholder="Escribe el nombre de tu negocio (ej. Nexoria, Café Welchez)..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 px-1">
            <span>💡 <b>Tip:</b> Si tu negocio no aparece de primero, agrega tu ciudad (ej. <i>"Nexoria Puerto Cortés"</i>).</span>
          </p>
        </div>
      ) : (
        /* Tarjeta de negocio seleccionado con datos auto-rellenados */
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-gray-900">{selectedPlace.name}</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Verificado en Maps
                  </span>
                </div>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{selectedPlace.formatted_address}</span>
                </p>
                {selectedPlace.formatted_phone_number && (
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{selectedPlace.formatted_phone_number}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-gray-500 hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition cursor-pointer"
            >
              Cambiar
            </button>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-gray-500">
            <span className="truncate max-w-xs font-mono text-[10px]">
              ID: {selectedPlace.place_id}
            </span>
            <a
              href={selectedPlace.direct_review_url}
              target="_blank"
              rel="noreferrer"
              className="text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1"
            >
              Probar enlace de reseña ↗
            </a>
          </div>
        </div>
      )}

      {/* Menú flotante de predicciones de Google Maps */}
      {isOpen && predictions.length > 0 && !selectedPlace && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden divide-y divide-gray-100 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          <div className="p-2 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>Resultados oficiales de Google Maps</span>
            {loadingDetails && (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Cargando...
              </span>
            )}
          </div>
          {predictions.map((item) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => handleSelectPrediction(item)}
              disabled={loadingDetails}
              className="w-full text-left p-3.5 hover:bg-amber-50/50 transition flex items-start gap-3 cursor-pointer disabled:opacity-50"
            >
              <div className="p-2 rounded-xl bg-gray-100 text-gray-600 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xs text-gray-900 truncate">
                  {item.main_text}
                </div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                  {item.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
