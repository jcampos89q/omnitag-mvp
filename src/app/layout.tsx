import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.omnitag.site'),
  title: {
    default: "OmniTag - Conecta el mundo físico con tu ecosistema digital",
    template: "%s | OmniTag"
  },
  description: "Tarjetas vCard inteligentes, menús digitales con pedidos a WhatsApp y placas Tap-to-Rate para Google Reviews.",
  openGraph: {
    title: "OmniTag - Conecta el mundo físico con tu ecosistema digital",
    description: "Tarjetas vCard inteligentes, menús digitales con pedidos a WhatsApp y placas Tap-to-Rate para Google Reviews.",
    url: 'https://www.omnitag.site',
    siteName: 'OmniTag',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-black selection:text-white">
        {children}
      </body>
    </html>
  );
}
