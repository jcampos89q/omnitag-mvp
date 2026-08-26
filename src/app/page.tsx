import Link from 'next/link'
import { Smartphone, Star, Coffee, ArrowRight, Zap, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navegación Responsiva */}
      <nav className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg">
            O
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">OmniTag</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/login" 
            className="text-xs sm:text-sm text-gray-600 hover:text-black font-medium px-3 py-2 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            className="bg-black text-white text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-xs"
          >
            Empezar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold mb-6">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> La plataforma "Todo en Uno"
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Conecta el mundo físico <br className="hidden sm:block"/> con tu ecosistema digital.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tarjetas de presentación inteligentes (vCards), recolectores de reseñas de Google y menús interactivos gestionados desde un único panel con tecnología NFC y QR dinámicos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-medium text-base sm:text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Comenzar prueba gratuita <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50/80 py-16 sm:py-24 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 text-gray-900">
              Todo lo que necesitas para hacer crecer tu negocio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Feature 1 */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 text-blue-600">
                  <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Identidad (vCards)</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Crea perfiles profesionales y comparte tu contacto en segundos con tecnología NFC. El cliente guarda tus datos con un solo toque.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-5 text-yellow-600">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Reputación (Tap-to-Rate)</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Redirige a clientes satisfechos directo a Google Reviews y filtra quejas privadas antes de que afecten tu reputación en línea.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-5 text-orange-600">
                  <Coffee className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">HORECA (Menús)</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Menús digitales dinámicos con fotos y pedidos a WhatsApp. Modifica platillos o precios en tiempo real sin reimprimir QRs.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="py-16 sm:py-24 text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">¿Listo para dar el salto tecnológico?</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Únete a cientos de profesionales, clínicas y restaurantes que ya están optimizando su presencia con OmniTag.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-black text-white px-8 py-3.5 rounded-full font-medium text-sm sm:text-base hover:bg-gray-800 transition-all shadow-md"
          >
            Crear cuenta gratuita ahora
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Seguridad y cifrado a nivel bancario.</span>
        </div>
        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} OmniTag. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
