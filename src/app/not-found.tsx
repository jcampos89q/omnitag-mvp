import Link from 'next/link'
import { Calendar, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto text-2xl">
          🔍
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Página no encontrada</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            El perfil, menú o servicio de citas que buscas no está disponible o el enlace ha cambiado.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 bg-white text-black font-extrabold py-3 px-4 rounded-xl text-xs hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Inicio OmniTag</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-slate-800 text-gray-200 font-bold py-3 px-4 rounded-xl text-xs hover:bg-slate-700 transition border border-slate-700 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Mi Panel</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
