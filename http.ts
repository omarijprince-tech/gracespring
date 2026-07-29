import "./globals.css";
import ConvexClientProvider from "../components/ConvexClientProvider";
import { LanguageProvider } from "../lib/lang-context";
import { CartProvider } from "../lib/cart-context";
import CartDrawer from "../components/CartDrawer";
import LanguageGate from "../components/LanguageGate";
import Toast from "../components/Toast";

export const metadata = {
  title: "Grace Spring Water — 5-Gallon Water Delivery in NJ & NYC",
  description: "Grace Spring delivers 5-gallon bottles of alkaline, purified, and natural spring water to homes and offices across northern New Jersey and the five NYC boroughs. Buy a cooler, get 5 bottles + a stand free. Monthly refill reminders — no auto-charge.",
  icons: { icon: "/assets/logo-mark.png", apple: "/assets/logo-mark.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&family=Anton&family=Yellowtail&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ConvexClientProvider>
          <LanguageProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <Toast />
              <LanguageGate />
            </CartProvider>
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
