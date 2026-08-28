import { AlertCircle, HelpCircle } from 'lucide-react'
import { formatFriendlyError } from '@/lib/errors'

interface FriendlyErrorAlertProps {
  error?: string | null
  title?: string
  className?: string
}

export default function FriendlyErrorAlert({
  error,
  title = 'Necesitamos revisar un detalle',
  className = ''
}: FriendlyErrorAlertProps) {
  if (!error) return null

  const friendlyMessage = formatFriendlyError(error)

  return (
    <div className={`p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 shadow-xs space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
          {title}
        </h4>
      </div>
      
      <p className="text-xs text-amber-900 font-medium pl-8 leading-relaxed">
        {friendlyMessage}
      </p>
    </div>
  )
}
