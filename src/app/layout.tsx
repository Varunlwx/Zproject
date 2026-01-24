import type { Metadata } from "next";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zcloths - Indian Menswear",
  description: "Premium Indian menswear collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
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
      </body>
    </html>
  );
}
