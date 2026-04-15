import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FinanceProvider } from "@/components/finance-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { messages } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: messages.en.app.metadataTitle,
  description: messages.en.app.metadataDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Универсальный CSP: разрешает скрипты Next.js и работу через протокол file:// */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="
            default-src 'self' file: data:; 
            script-src 'self' 'unsafe-inline' 'unsafe-eval' file:; 
            style-src 'self' 'unsafe-inline' file:; 
            connect-src 'self' ws://localhost:3000 http://localhost:3000 file:; 
            img-src 'self' blob: data: file:;
            font-src 'self' data: file:;
            object-src 'none';
          " 
        />
      </head>
      <body className="min-h-full">
        <SettingsProvider>
          <FinanceProvider>
            {children}
          </FinanceProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}