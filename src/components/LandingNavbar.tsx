'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Menu, 
  X, 
  CreditCard, 
  Sparkles,
  UtensilsCrossed,
  Scissors,
  Star,
  Gift,
  HelpCircle,
  Tag
} from 'lucide-react'

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      <nav className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            src="/logo-light.png"
            alt="OmniTag"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition group-hover:scale-105"
            priority
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-950">OmniTag</span>
        </Link>

        {/* Links de Navegación en Desktop */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-gray-600">
          <a href="#restaurantes" className="hover:text-black transition flex items-center gap-1">
            <span>🍽️ Menús</span>
          </a>
          <a href="#citas" className="hover:text-black transition flex items-center gap-1">
            <span>💈 Citas</span>
          </a>
          <a href="#reputacion" className="hover:text-black transition flex items-center gap-1">
            <span>⭐ Reseñas Google</span>
          </a>
          <a href="#fidelizacion" className="hover:text-black transition flex items-center gap-1">
            <span>🎁 Sellos</span>
          </a>
          <a href="#estudio-qr" className="hover:text-black transition flex items-center gap-1">
            <span>🎨 QRs & Wi-Fi</span>
          </a>
          <Link href="/tienda" className="text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tienda NFC</span>
          </Link>
          <a href="#precios" className="text-purple-700 hover:text-purple-900 transition flex items-center gap-1 font-extrabold">
            <Tag className="w-3.5 h-3.5" />
            <span>Precios</span>
          </a>
          <a href="#faq" className="hover:text-black transition">FAQ</a>
        </div>

        {/* Botones de Acción en Desktop & Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link 
            href="/login" 
            className="text-xs sm:text-sm text-gray-700 hover:text-black font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            className="bg-black text-white text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-extrabold hover:bg-gray-800 transition shadow-xs flex items-center gap-1.5"
          >
            <span>10 Días Gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Botón Hamburger en Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable en Móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <a 
              href="#restaurantes" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
            >
              <span>🍽️ Menús QR</span>
            </a>
            <a 
              href="#citas" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
            >
              <span>💈 Citas 24/7</span>
            </a>
            <a 
              href="#reputacion" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
            >
              <span>⭐ Reseñas Google</span>
            </a>
            <a 
              href="#fidelizacion" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
            >
              <span>🎁 Sellos & Premios</span>
            </a>
            <a 
              href="#estudio-qr" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
            >
              <span>🎨 QRs Dinámicos</span>
            </a>
            <Link 
              href="/tienda" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-black"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tienda NFC</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
            <a 
              href="#precios" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-purple-700 flex items-center gap-1 font-extrabold"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Ver Planes & Precios</span>
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600"
            >
              Preguntas Frecuentes
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
