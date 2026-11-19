import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { getPartnerBrandById } from "@/lib/whitelabel";
import { I18nProvider } from "@/lib/i18n/context";
import { Locale, DEFAULT_LOCALE } from "@/lib/i18n/config";
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
  const locale = (headersList.get("x-locale") as Locale) || DEFAULT_LOCALE;
  const isEn = locale === "en";
  const partnerBrand = partnerId ? await getPartnerBrandById(partnerId) : null;

  const isWhiteLabelHost = Boolean(partnerBrand || isAgencyPortal || customDomain);
  const brandTitle = partnerBrand?.brand_name || (isAgencyPortal ? (isEn ? "Access Portal" : "Portal de Acceso") : "OmniTag");
  const baseUrl = customDomain
    ? `https://${customDomain}`
    : isAgencyPortal
    ? "https://app.omnitag.site"
    : "https://www.omnitag.site";

  const defaultTitle = isEn
    ? "OmniTag - Cloud SaaS Platform for Digital Marketing & Customer Loyalty"
    : "OmniTag - Plataforma SaaS de Marketing y Fidelización Digital";

  const defaultDescription = isEn
    ? "Cloud SaaS software for interactive digital menus, 24/7 appointment booking, discount coupons, and smart Google Maps review filtering."
    : "Software SaaS en la nube para menús digitales interactivos, agendas de citas, cupones y captación inteligente de reseñas en Google.";

  return {
    metadataBase: new URL(baseUrl),
    title: isWhiteLabelHost
      ? {
          default: brandTitle,
          template: `%s | ${brandTitle}`,
        }
      : {
          default: defaultTitle,
          template: `%s | OmniTag`,
        },
    description: isWhiteLabelHost
      ? isEn ? `Digital platform by ${brandTitle}.` : `Plataforma digital de ${brandTitle}.`
      : defaultDescription,
    openGraph: {
      title: isWhiteLabelHost ? brandTitle : defaultTitle,
      description: isWhiteLabelHost
        ? isEn ? `Digital platform by ${brandTitle}.` : `Plataforma digital de ${brandTitle}.`
        : defaultDescription,
      url: baseUrl,
      siteName: brandTitle,
      locale: isEn ? "en_US" : "es_ES",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-black selection:text-white">
        <I18nProvider initialLocale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
