import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ssid = searchParams.get('ssid') || 'WiFi_Clientes'
  const pass = searchParams.get('pass') || ''
  const enc = searchParams.get('enc') || 'WPA'

  const uuid1 = crypto.randomUUID()
  const uuid2 = crypto.randomUUID()

  const encryptionType = enc === 'nopass' ? 'None' : enc === 'WEP' ? 'WEP' : 'WPA'

  const mobileConfigXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadDisplayName</key>
    <string>Wi-Fi: ${ssid}</string>
    <key>PayloadIdentifier</key>
    <string>com.omnitag.wifi.${encodeURIComponent(ssid)}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuid1}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>AutoJoin</key>
            <true/>
            <key>EncryptionType</key>
            <string>${encryptionType}</string>
            <key>HIDDEN_NETWORK</key>
            <false/>
            ${pass ? `<key>Password</key><string>${pass.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string>` : ''}
            <key>PayloadDescription</key>
            <string>Conexión automática a la red Wi-Fi ${ssid}</string>
            <key>PayloadDisplayName</key>
            <string>Wi-Fi: ${ssid}</string>
            <key>PayloadIdentifier</key>
            <string>com.omnitag.wifi.${encodeURIComponent(ssid)}.network</string>
            <key>PayloadType</key>
            <string>com.apple.wifi.managed</string>
            <key>PayloadUUID</key>
            <string>${uuid2}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>SSID_STR</key>
            <string>${ssid.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string>
        </dict>
    </array>
</dict>
</plist>`

  return new NextResponse(mobileConfigXml, {
    headers: {
      'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
      'Content-Disposition': `attachment; filename="wifi_${encodeURIComponent(ssid)}.mobileconfig"`
    }
  })
}
