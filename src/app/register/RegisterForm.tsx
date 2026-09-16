'use client'

import { useState } from 'react'
import { signup } from '@/app/auth/actions'
import { 
  UserCheck, 
  Building2, 
  Briefcase, 
  Stethoscope, 
  Scale, 
  Home, 
  TrendingUp, 
  ShoppingBag, 
  Palette, 
  Code, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Utensils,
  Scissors
} from 'lucide-react'

const professionalIndustries = [
  { id: 'health', name: 'Salud, Medicina & Odontología', icon: Stethoscope },
  { id: 'legal', name: 'Legal, Abogados & Notarios', icon: Scale },
  { id: 'real_estate', name: 'Bienes Raíces & Inmobiliaria', icon: Home },
  { id: 'finance', name: 'Finanzas, Seguros & Consultoría', icon: TrendingUp },
  { id: 'sales', name: 'Ventas & Asesores Comerciales', icon: Briefcase },
  { id: 'tech', name: 'Tecnología, Marketing & Freelance', icon: Code },
  { id: 'architecture', name: 'Arquitectura, Diseño & Construcción', icon: Palette },
  { id: 'beauty', name: 'Belleza, Estilistas & Spas', icon: Sparkles },
  { id: 'other', name: 'Otro Rubro Profesional', icon: UserCheck },
]

const businessIndustries = [
  { id: 'restaurant', name: 'Restaurante, Cafetería o Bar', icon: Utensils },
  { id: 'salon', name: 'Salón de Belleza o Barbería', icon: Scissors },
  { id: 'health', name: 'Clínica o Centro de Salud', icon: Stethoscope },
  { id: 'retail', name: 'Tienda, Comercio o Retail', icon: ShoppingBag },
  { id: 'general', name: 'Empresa de Servicios Generales', icon: Building2 },
]

export default function RegisterForm({ 
  token,
  error,
  message
}: { 
  token?: string
  error?: string
  message?: string
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<'professional' | 'business'>('professional')
  const [industry, setIndustry] = useState(token ? 'health' : 'health')
  const [professionTitle, setProfessionTitle] = useState('')

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || password.length < 6) return
    setStep(2)
  }

  return (
    <div>
      {/* Banner si viene de una tarjeta NFC física */}
      {token && (
        <div className="mb-6 bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500 text-white p-3.5 rounded-2xl shadow-md text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="uppercase tracking-wider text-[10px] text-amber-100">Tarjeta NFC Detectada</div>
            <div className="text-white">¡Activarás 1 Año Completo de Membresía PRO con este registro!</div>
          </div>
        </div>
      )}

      {/* Indicador de pasos */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 1 ? 'bg-black text-white' : 'bg-emerald-500 text-white'
          }`}>
            1
          </span>
          <span className="text-xs font-bold text-gray-700">Tus Datos</span>
        </div>
        <div className="h-0.5 w-12 bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </span>
          <span className="text-xs font-bold text-gray-700">Tu Rubro</span>
        </div>
      </div>

      <form action={signup} className="space-y-4">
        {/* Token oculto si existe */}
        {token && <input type="hidden" name="card_token" value={token} />}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Nombre completo
              </label>
              <input
                name="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Dr. Carlos Mendoza"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Contraseña (mínimo 6 caracteres)
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black focus:outline-none transition shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={!fullName.trim() || !email.trim() || password.length < 6}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              <span>Continuar al Paso 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            {/* Inputs ocultos del paso 1 */}
            <input type="hidden" name="full_name" value={fullName} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="account_type" value={accountType} />
            <input type="hidden" name="industry" value={industry} />

            {/* Selector de Tipo de Cuenta */}
            {!token && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  ¿Cómo utilizarás OmniTag?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('professional')
                      setIndustry('health')
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-2 transition cursor-pointer ${
                      accountType === 'professional'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <div>
                      <div className="font-extrabold text-xs">Profesional</div>
                      <div className={`text-[11px] leading-tight ${accountType === 'professional' ? 'text-gray-300' : 'text-gray-500'}`}>
                        vCard, CRM y Tarjeta NFC
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('business')
                      setIndustry('restaurant')
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col items-start gap-2 transition cursor-pointer ${
                      accountType === 'business'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <div>
                      <div className="font-extrabold text-xs">Negocio / Empresa</div>
                      <div className={`text-[11px] leading-tight ${accountType === 'business' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Menús, Sellos, Citas
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Selector de Rubro / Industria */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                {accountType === 'professional' ? 'Selecciona tu Rubro o Profesión' : 'Giro de tu Negocio'}
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-black focus:outline-none transition bg-white text-gray-900 shadow-2xs"
              >
                {accountType === 'professional'
                  ? professionalIndustries.map((item) => (
                      <option key={item.id} value={item.id} className="text-gray-900 bg-white">
                        {item.name}
                      </option>
                    ))
                  : businessIndustries.map((item) => (
                      <option key={item.id} value={item.id} className="text-gray-900 bg-white">
                        {item.name}
                      </option>
                    ))}
              </select>
            </div>

            {/* Cargo o Especialidad */}
            {accountType === 'professional' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tu Cargo o Especialidad (Opcional)
                </label>
                <input
                  name="profession_title"
                  type="text"
                  value={professionTitle}
                  onChange={(e) => setProfessionTitle(e.target.value)}
                  placeholder="Ej. Cirujano Dentista, Abogado Laboral, Broker"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-black focus:outline-none transition shadow-2xs"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Atrás</span>
              </button>

              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-extrabold text-white hover:bg-gray-800 transition cursor-pointer shadow-md"
              >
                <span>{token ? 'Comenzar & Activar 1 Año PRO' : 'Crear Mi Cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
