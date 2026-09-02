import { Metadata } from 'next'
import WifiConnectClient from './WifiConnectClient'

export const metadata: Metadata = {
  title: 'Conexión Wi-Fi • OmniTag',
  description: 'Conéctate a la red Wi-Fi de alta velocidad de forma rápida y segura.'
}

export default async function WifiPage({
  searchParams
}: {
  searchParams: Promise<{
    ssid?: string
    pass?: string
    enc?: string
    name?: string
    menu?: string
    vcard?: string
    review?: string
  }>
}) {
  const { 
    ssid = 'Red_Clientes', 
    pass = '', 
    enc = 'WPA', 
    name = 'OmniTag Wi-Fi', 
    menu = '', 
    vcard = '', 
    review = '' 
  } = await searchParams

  return (
    <WifiConnectClient
      ssid={ssid}
      password={pass}
      encryption={enc}
      businessName={name}
      menuSlug={menu}
      vcardSlug={vcard}
      reviewUrl={review}
    />
  )
}
