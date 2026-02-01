import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { CartProvider } from "@/contexts/cart-context";
import { OrderProvider } from "@/contexts/order-context";
import { AddressProvider } from "@/contexts/address-context";
import { ToastProvider } from "@/contexts/toast-context";
import { ProductProvider } from "@/contexts/product-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";
import { NotificationHandler } from "@/components/NotificationHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zcloths.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zcloths - Premium Indian Menswear",
    template: "%s | Zcloths",
  },
  description: "Discover premium Indian menswear at Zcloths. Shop kurtas, sherwanis, hoodies, shirts and more. Handcrafted clothing with traditional aesthetics and modern design.",
  keywords: ["Indian menswear", "kurtas", "sherwanis", "ethnic wear", "men's fashion", "traditional clothing", "premium clothing", "hoodies", "shirts"],
  authors: [{ name: "Zcloths" }],
  creator: "Zcloths",
  publisher: "Zcloths",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Zcloths",
    title: "Zcloths - Premium Indian Menswear",
    description: "Discover premium Indian menswear. Kurtas, sherwanis, hoodies, and more. Handcrafted with traditional aesthetics.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zcloths - Premium Indian Menswear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zcloths - Premium Indian Menswear",
    description: "Discover premium Indian menswear. Kurtas, sherwanis, hoodies, and more.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#E85D04",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for E-commerce */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              name: "Zcloths",
              description: "Premium Indian menswear collection",
              url: siteUrl,
              logo: `${siteUrl}/icons/icon-512x512.png`,
              priceRange: "₹₹",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
              sameAs: [
                // Add social media links here
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <NotificationHandler />
            <ProductProvider>
              <WishlistProvider>
                <CartProvider>
                  <AddressProvider>
                    <OrderProvider>
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </OrderProvider>
                  </AddressProvider>
                </CartProvider>
              </WishlistProvider>
            </ProductProvider>
          </ToastProvider>
        </AuthProvider>
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
