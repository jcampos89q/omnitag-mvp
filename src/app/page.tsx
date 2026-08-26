import Link from 'next/link'
import { Smartphone, Star, Coffee, ArrowRight, Zap, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navegación */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Smartphone className="w-8 h-8 text-black" />
          <span className="text-2xl font-bold tracking-tight">OmniTag</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-black font-medium transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all">
            Empezar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" /> La plataforma "Todo en Uno"
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
            Conecta el mundo físico <br className="hidden md:block"/> con tu ecosistema digital.
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-3xl mx-auto">
            Tarjetas de presentación inteligentes, recolectores de reseñas de Google y menús digitales interactivos. Todo gestionado desde un único panel con tecnología NFC y QR dinámicos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              Comenzar tu prueba gratuita <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Todo lo que necesitas para crecer tu negocio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Identidad (vCards)</h3>
                <p className="text-gray-500 leading-relaxed">
                  Crea perfiles profesionales y comparte tu contacto en segundos usando tecnología NFC. El cliente guarda tus datos con un solo toque.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reputación (Tap-to-Rate)</h3>
                <p className="text-gray-500 leading-relaxed">
                  Redirige a tus clientes satisfechos directamente a Google Reviews en milisegundos y dispara tu calificación local.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                  <Coffee className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">HORECA (Menús)</h3>
                <p className="text-gray-500 leading-relaxed">
                  Menús digitales dinámicos. Cambia precios al instante o esconde productos agotados sin necesidad de reimprimir tus QRs.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="py-24 text-center px-6">
          <h2 className="text-3xl font-bold mb-6">¿Listo para dar el salto tecnológico?</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">Únete a cientos de freelancers, restaurantes y clínicas que ya están optimizando su presencia con OmniTag.</p>
          <Link href="/register" className="inline-block bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all">
            Crear cuenta gratuita ahora
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600 font-medium">Seguridad a nivel bancario. Cancelación en cualquier momento.</span>
        </div>
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} OmniTag. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
