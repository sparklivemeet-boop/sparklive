import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { I18nProvider } from "@/lib/i18n/context";
import { CANONICAL_DOMAIN, generateHreflangHtml } from "@/lib/i18n/seo";
import { ContentCreationProvider } from "@/components/create/ContentCreationContext";
import { cookies } from "next/headers";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SparkLive | Where Every Connection Glows",
  description:
    "Discover people, swipe through profiles, follow creators, chat, join live streams, watch short videos, receive notifications, build communities, earn rewards, and manage your profile and wallet.",
  keywords: [
    "social streaming",
    "live streaming",
    "creator platform",
    "social discovery",
    "premium social",
    "sparklive",
  ],
  openGraph: {
    title: "SparkLive | Where Every Connection Glows",
    description:
      "Premium social streaming, creator, and discovery platform.",
    type: "website",
    siteName: "SparkLive",
    locale: "en_US",
    alternateLocale: ["fr_FR", "es_ES", "pt_BR", "ar_SA", "de_DE", "it_IT", "tr_TR", "ru_RU", "hi_IN", "ur_PK", "bn_BD", "id_ID", "vi_VN", "th_TH", "zh_CN", "zh_TW", "ja_JP", "ko_KR"],
  },
  alternates: {
    canonical: CANONICAL_DOMAIN,
    languages: {
      "en": `${CANONICAL_DOMAIN}`,
      "fr": `${CANONICAL_DOMAIN}/fr`,
      "es": `${CANONICAL_DOMAIN}/es`,
      "pt": `${CANONICAL_DOMAIN}/pt`,
      "ar": `${CANONICAL_DOMAIN}/ar`,
      "de": `${CANONICAL_DOMAIN}/de`,
      "it": `${CANONICAL_DOMAIN}/it`,
      "tr": `${CANONICAL_DOMAIN}/tr`,
      "ru": `${CANONICAL_DOMAIN}/ru`,
      "hi": `${CANONICAL_DOMAIN}/hi`,
      "ur": `${CANONICAL_DOMAIN}/ur`,
      "bn": `${CANONICAL_DOMAIN}/bn`,
      "id": `${CANONICAL_DOMAIN}/id`,
      "vi": `${CANONICAL_DOMAIN}/vi`,
      "th": `${CANONICAL_DOMAIN}/th`,
      "zh-Hans": `${CANONICAL_DOMAIN}/zh`,
      "zh-Hant": `${CANONICAL_DOMAIN}/zh-TW`,
      "ja": `${CANONICAL_DOMAIN}/ja`,
      "ko": `${CANONICAL_DOMAIN}/ko`,
      "x-default": `${CANONICAL_DOMAIN}`,
    },
  },
  other: {
    "theme-color": "#0a0a0a",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect language and direction from cookie for SSR
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const dir = cookieStore.get('NEXT_DIR')?.value || 'ltr';

  return (
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for critical origins */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//api.sparkliveapp.xyz" />
        <link rel="dns-prefetch" href="//cdn.sparkliveapp.xyz" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical font */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* SEO hreflang tags */}
        {generateHreflangHtml('')}
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SparkLive",
              description: "Premium social streaming, creator, and discovery platform.",
              url: `${CANONICAL_DOMAIN}/${locale === 'en' ? '' : locale}`,
              inLanguage: locale,
              applicationCategory: "SocialNetworking",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col antialiased">
        <I18nProvider>
          <AccessibilityProvider>
            <ThemeProvider>
              <AuthProvider>
                <ToastProvider>
                  <ContentCreationProvider>
                    <div id="main-content" tabIndex={-1}>
                      <AppLayout>{children}</AppLayout>
                    </div>
                  </ContentCreationProvider>
                </ToastProvider>
              </AuthProvider>
            </ThemeProvider>
          </AccessibilityProvider>
        </I18nProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
