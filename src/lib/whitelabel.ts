import { getAdminClient } from '@/lib/supabase/admin'

export interface WhiteLabelBrandConfig {
  brand_name: string
  logo_url?: string
  primary_color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'blue'
  website_url?: string
  support_whatsapp?: string
  support_email?: string
  checkout_monthly_url?: string
  checkout_yearly_url?: string
  price_monthly?: string
  price_yearly?: string
  bank_name?: string
  bank_account_number?: string
  bank_account_holder?: string
  bank_account_id_doc?: string
  hide_omnitag_branding?: boolean
}

export interface ResellerStatus {
  isReseller: boolean
  resellerQuota: number
  resellerExpiresAt: string | null
  isResellerActive: boolean
  brandConfig: WhiteLabelBrandConfig
  parentResellerId: string | null
}

export const DEFAULT_OMNITAG_BRAND: WhiteLabelBrandConfig = {
  brand_name: 'OmniTag',
  logo_url: '/logo-light.png',
  primary_color: 'indigo',
  website_url: '/',
  hide_omnitag_branding: false,
}

/**
 * Resuelve la configuración de Marca Blanca y estado de Distribuidor para un usuario:
 * - Si el usuario es Super Admin o cliente directo de OmniTag -> devuelve la marca OmniTag (a menos que sea él mismo un Distribuidor con marca propia).
 * - Si el usuario es un Sub-Cliente de un Distribuidor (`parent_reseller_id`) -> hereda automáticamente la marca, logo, links de cobro y soporte de su Distribuidor.
 * - Si el usuario es un Distribuidor (`is_reseller`) -> usa su propia marca configurada y expone su cupo de clientes.
 */
export async function resolveUserWhiteLabel(userId?: string | null, isAdmin = false): Promise<{
  activeBrand: WhiteLabelBrandConfig
  isWhiteLabeledClient: boolean
  isReseller: boolean
  isResellerActive: boolean
  resellerQuota: number
  resellerExpiresAt: string | null
  ownBrandConfig: WhiteLabelBrandConfig
  parentResellerId: string | null
}> {
  const defaultResult = {
    activeBrand: DEFAULT_OMNITAG_BRAND,
    isWhiteLabeledClient: false,
    isReseller: isAdmin,
    isResellerActive: isAdmin,
    resellerQuota: isAdmin ? 9999 : 0,
    resellerExpiresAt: null,
    ownBrandConfig: DEFAULT_OMNITAG_BRAND,
    parentResellerId: null,
  }

  if (!userId) return defaultResult

  try {
    const adminClient = getAdminClient()
    const { data: authData } = await adminClient.auth.admin.getUserById(userId)
    const meta = authData?.user?.user_metadata || {}

    const isReseller = Boolean(isAdmin || meta.is_reseller)
    const resellerQuota = isAdmin ? 9999 : Number(meta.reseller_quota || (meta.is_reseller ? 25 : 0))
    const resellerExpiresAt = (meta.reseller_expires_at as string) || null
    const now = new Date()
    const isResellerActive = Boolean(
      isAdmin ||
      (isReseller && (!resellerExpiresAt || new Date(resellerExpiresAt) > now))
    )

    const ownBrandConfig: WhiteLabelBrandConfig = {
      ...DEFAULT_OMNITAG_BRAND,
      ...(meta.white_label_config || {}),
    }

    const parentResellerId = (meta.parent_reseller_id as string) || null

    // 1. Si el usuario es sub-cliente de un Distribuidor, hereda la marca del Distribuidor
    if (parentResellerId && !isAdmin) {
      const { data: parentAuth } = await adminClient.auth.admin.getUserById(parentResellerId)
      const parentMeta = parentAuth?.user?.user_metadata || {}
      if (parentMeta?.white_label_config?.brand_name) {
        const inheritedBrand: WhiteLabelBrandConfig = {
          ...DEFAULT_OMNITAG_BRAND,
          ...parentMeta.white_label_config,
          hide_omnitag_branding: true,
        }
        return {
          activeBrand: inheritedBrand,
          isWhiteLabeledClient: true,
          isReseller,
          isResellerActive,
          resellerQuota,
          resellerExpiresAt,
          ownBrandConfig,
          parentResellerId,
        }
      }
    }

    // 2. Si el usuario es un Distribuidor (y NO es el Super Admin de OmniTag), ve su propia marca en su panel si ya la configuró
    if (isReseller && !isAdmin && ownBrandConfig.brand_name && ownBrandConfig.brand_name !== 'OmniTag') {
      return {
        activeBrand: {
          ...ownBrandConfig,
          hide_omnitag_branding: true,
        },
        isWhiteLabeledClient: true,
        isReseller,
        isResellerActive,
        resellerQuota,
        resellerExpiresAt,
        ownBrandConfig,
        parentResellerId,
      }
    }

    // 3. Super Admin de OmniTag o cliente directo de OmniTag -> ve la marca oficial OmniTag
    return {
      activeBrand: DEFAULT_OMNITAG_BRAND,
      isWhiteLabeledClient: false,
      isReseller,
      isResellerActive,
      resellerQuota,
      resellerExpiresAt,
      ownBrandConfig,
      parentResellerId,
    }
  } catch {
    return defaultResult
  }
}

/**
 * Obtiene la configuración de marca pública de un Distribuidor por su ID (para /register?partner=ID)
 */
export async function getPartnerBrandById(partnerId?: string | null): Promise<WhiteLabelBrandConfig | null> {
  if (!partnerId) return null
  try {
    const adminClient = getAdminClient()
    const { data: authData } = await adminClient.auth.admin.getUserById(partnerId)
    const meta = authData?.user?.user_metadata || {}
    if (!meta.is_reseller) return null

    const cfg = meta.white_label_config as WhiteLabelBrandConfig | undefined
    return {
      ...DEFAULT_OMNITAG_BRAND,
      ...(cfg || {}),
      brand_name: cfg?.brand_name || authData?.user?.user_metadata?.full_name || 'Partner Autorizado',
      hide_omnitag_branding: true,
    }
  } catch {
    return null
  }
}
