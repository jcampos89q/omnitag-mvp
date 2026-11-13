import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { getPublicBrandForOwner } from '@/lib/whitelabel'

/**
 * Texto "Digitalizado por <Marca>" para páginas públicas.
 * Muestra la marca de la Agencia cuando el negocio pertenece a un Sub-Cliente de Marca Blanca,
 * de modo que los clientes finales nunca vean "OmniTag" en negocios de agencias.
 */
export default async function PublicPoweredBy({
  ownerId,
  prefix = 'Digitalizado por',
}: {
  ownerId?: string | null
  prefix?: string
}) {
  const brand = await getPublicBrandForOwner(ownerId)
  return (
    <>
      {prefix} <span className="font-bold">{brand.brandName}</span>
    </>
  )
}

/**
 * Enlace "¿Eres el dueño? Inicia sesión" que envía al portal de login correcto
 * (portal de la Agencia para sub-clientes, login OmniTag para clientes directos).
 */
export async function OwnerLoginLink({
  ownerId,
  next,
  className,
  style,
  children,
}: {
  ownerId?: string | null
  next: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const brand = await getPublicBrandForOwner(ownerId)
  const href = brand.partnerId
    ? `/login?partner=${encodeURIComponent(brand.partnerId)}&next=${encodeURIComponent(next)}`
    : `/login?next=${encodeURIComponent(next)}`
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  )
}
