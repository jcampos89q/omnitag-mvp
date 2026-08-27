'use client'

import { Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ShareButtons({ 
  slug, 
  name,
  isDark = false 
}: { 
  slug: string
  name: string
  isDark?: boolean 
}) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}/v/${slug}`)
  }, [slug])

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tarjeta de ${name}`,
          text: 'Guarda mi tarjeta de presentación digital',
          url,
        })
      } catch (err) {
        console.log('Error compartiendo:', err)
      }
    } else {
      navigator.clipboard.writeText(url)
      alert("¡Enlace copiado al portapapeles!")
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-black/5 flex justify-center">
      <button 
        type="button"
        onClick={handleNativeShare}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs w-full sm:w-auto cursor-pointer ${
          isDark 
            ? 'bg-white/10 text-white hover:bg-white/20' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        <Share2 className="w-4 h-4" />
        Compartir este Perfil
      </button>
    </div>
  )
}
