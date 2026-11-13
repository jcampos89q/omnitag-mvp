import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { getPartnerBrandById } from "@/lib/whitelabel";
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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const partnerId = headersList.get("x-partner-id");
  const isAgencyPortal = headersList.get("x-agency-portal") === "true";
  const customDomain = headersList.get("x-custom-domain");
  const partnerBrand = partnerId ? await getPartnerBrandById(partnerId) : null;

  const isWhiteLabelHost = Boolean(partnerBrand || isAgencyPortal || customDomain);
  const brandTitle = partnerBrand?.brand_name || (isAgencyPortal ? "Portal de Acceso" : "OmniTag");
  const baseUrl = customDomain
    ? `https://${customDomain}`
    : isAgencyPortal
    ? "https://app.omnitag.site"
    : "https://www.omnitag.site";

  return {
    metadataBase: new URL(baseUrl),
    title: isWhiteLabelHost
      ? {
          default: brandTitle,
          template: `%s | ${brandTitle}`,
        }
      : {
          default: "OmniTag - Conecta el mundo físico con tu ecosistema digital",
          template: "%s | OmniTag",
        },
    description: isWhiteLabelHost
      ? `Plataforma digital de ${brandTitle}.`
      : "Tarjetas vCard inteligentes, menús digitales con pedidos a WhatsApp y placas Tap-to-Rate para Google Reviews.",
    openGraph: {
      title: isWhiteLabelHost ? brandTitle : "OmniTag - Conecta el mundo físico con tu ecosistema digital",
      description: isWhiteLabelHost
        ? `Plataforma digital de ${brandTitle}.`
        : "Tarjetas vCard inteligentes, menús digitales con pedidos a WhatsApp y placas Tap-to-Rate para Google Reviews.",
      url: baseUrl,
      siteName: brandTitle,
      locale: "es_ES",
      type: "website",
    },
    icons: {
      icon: [
        { url: "/icon.png", type: "image/png" },
        { url: "/favicon.png", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [{ url: "/apple-icon.png", type: "image/png" }],
    },
  };
}

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
