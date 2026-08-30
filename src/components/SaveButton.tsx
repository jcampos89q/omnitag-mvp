'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface SaveButtonProps {
  label?: string
  loadingLabel?: string
  className?: string
  icon?: React.ReactNode
  onClick?: () => void
}

export default function SaveButton({
  label = 'Guardar Cambios',
  loadingLabel = 'Guardando cambios...',
  className = 'bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all cursor-pointer text-sm flex items-center gap-2',
  icon,
  onClick
}: SaveButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      className={`${className} ${pending ? 'opacity-80 cursor-wait pointer-events-none scale-[0.99]' : 'hover:scale-[1.01]'}`}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {icon || <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{label}</span>
        </>
      )}
    </button>
  )
}
