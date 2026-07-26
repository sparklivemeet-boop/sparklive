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
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sparkliveapp.xyz'),
  title: {
    default: "SparkLive | Where Every Connection Glows",
    template: "%s | SparkLive",
  },
  description:
    "Premium social streaming platform. Go live, build communities, and earn rewards. Connect with creators and viewers worldwide.",
  keywords: [
    "social streaming",
    "live streaming",
    "creator platform",
    "social discovery",
    "premium social",
    "sparklive",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/branding/sparklive-logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/branding/sparklive-logo.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SparkLive | Where Every Connection Glows",
    description:
      "Premium social streaming, creator, and discovery platform.",
    type: "website",
    siteName: "SparkLive",
    locale: "en_US",
    images: [
      { url: "/branding/sparklive-logo.png", width: 512, height: 512, alt: "SparkLive" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkLive | Where Every Connection Glows",
    description: "Premium social streaming, creator, and discovery platform.",
    images: ["/branding/sparklive-logo.png"],
  },
  alternates: {
    canonical: "https://sparkliveapp.xyz",
    languages: {
      'en': 'https://sparkliveapp.xyz',
      'fr': 'https://sparkliveapp.xyz/fr',
      'es': 'https://sparkliveapp.xyz/es',
      'pt': 'https://sparkliveapp.xyz/pt',
      'ar': 'https://sparkliveapp.xyz/ar',
      'de': 'https://sparkliveapp.xyz/de',
      'it': 'https://sparkliveapp.xyz/it',
      'tr': 'https://sparkliveapp.xyz/tr',
      'ru': 'https://sparkliveapp.xyz/ru',
      'hi': 'https://sparkliveapp.xyz/hi',
      'ur': 'https://sparkliveapp.xyz/ur',
      'bn': 'https://sparkliveapp.xyz/bn',
      'id': 'https://sparkliveapp.xyz/id',
      'vi': 'https://sparkliveapp.xyz/vi',
      'th': 'https://sparkliveapp.xyz/th',
      'zh-Hans': 'https://sparkliveapp.xyz/zh',
      'zh-Hant': 'https://sparkliveapp.xyz/zh-TW',
      'ja': 'https://sparkliveapp.xyz/ja',
      'ko': 'https://sparkliveapp.xyz/ko',
    },
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
                      <ErrorBoundary>
                        <AppLayout>{children}</AppLayout>
                      </ErrorBoundary>
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
