/**
 * Traductor inteligente de errores técnicos a mensajes amigables y comprensibles para el usuario
 */
export function formatFriendlyError(error: unknown): string {
  if (!error) return 'Ocurrió un error inesperado. Por favor intenta de nuevo.'

  const msg = typeof error === 'string' 
    ? error 
    : (error as any)?.message || String(error)

  const lower = msg.toLowerCase()

  // 1. Errores de Base de Datos y Campos Vacíos (Constraints)
  if (lower.includes('null value in column "first_name"') || lower.includes('first_name')) {
    return 'Por favor ingresa el nombre de tu perfil o negocio para poder continuar.'
  }
  if (lower.includes('null value in column') || lower.includes('not-null constraint')) {
    return 'Hay campos obligatorios sin completar. Por favor revisa los datos ingresados.'
  }
  if (lower.includes('unique constraint') || lower.includes('duplicate key') || lower.includes('already exists')) {
    return 'El nombre o enlace ingresado ya está registrado. Intenta con un nombre diferente o añade un distintivo.'
  }

  // 2. Errores de Autenticación y Cuentas
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'El correo o la contraseña son incorrectos. Por favor verifica tus datos o usa la opción "¿Olvidaste tu contraseña?".'
  }
  if (lower.includes('user already registered') || lower.includes('email already in use')) {
    return 'Este correo ya tiene una cuenta registrada. Puedes iniciar sesión directamente.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada o carpeta de spam.'
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'La contraseña debe tener al menos 6 caracteres para mayor seguridad.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Has realizado varias solicitudes seguidas. Por seguridad, por favor espera 1 minuto antes de reintentar.'
  }

  // 3. Errores de Archivos e Imágenes
  if (lower.includes('file too large') || lower.includes('payload too large') || lower.includes('maximum size')) {
    return 'La imagen seleccionada supera el tamaño máximo permitido. Por favor elige una foto de hasta 5MB.'
  }
  if (lower.includes('unsupported media') || lower.includes('invalid file type')) {
    return 'El formato de archivo no es compatible. Por favor sube una imagen en formato JPG, PNG o WebP.'
  }

  // 4. Errores de Planes y Límites Freemium
  if (lower.includes('plan pro') || lower.includes('upgrade to pro')) {
    return 'Esta función requiere una suscripción activa al Plan PRO.'
  }

  // 5. Errores de Red o Conexión
  if (lower.includes('network') || lower.includes('fetch failed') || lower.includes('timeout')) {
    return 'Inconveniente de conexión con el servidor. Verifica tu conexión a internet e inténtalo nuevamente.'
  }

  // Fallback amigable
  return 'No pudimos procesar tu solicitud. Por favor revisa los datos ingresados e intenta nuevamente.'
}
