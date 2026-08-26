'use client'

import { MessageCircle, MessageSquare, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ShareButtons({ slug, name }: { slug: string, name: string }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    // Generar la URL absoluta de forma dinámica en el cliente
    setUrl(`${window.location.origin}/v/${slug}`)
  }, [slug])

  const message = `¡Hola! Aquí tienes mi tarjeta de presentación digital: ${url}`

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
      // Fallback si no soporta API nativa (PC de escritorio antiguo)
      navigator.clipboard.writeText(url)
      alert("¡Enlace copiado al portapapeles!")
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
      <button 
        onClick={handleNativeShare}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors shadow-sm w-full sm:w-auto"
      >
        <Share2 className="w-5 h-5" />
        Compartir esta vCard
      </button>
    </div>
  )
}
