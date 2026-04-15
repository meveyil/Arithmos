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
      <meta 
  httpEquiv="Content-Security-Policy" 
  content="
    default-src 'self'; 
    script-src 'self'; 
    style-src 'self' 'unsafe-inline'; 
    connect-src 'none'; 
    object-src 'none'; 
    frame-src 'none';
    base-uri 'self';
    form-action 'self';
  " 
/>
       <meta 
  httpEquiv="Content-Security-Policy" 
  content="
    default-src 'self'; 
    script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
    style-src 'self' 'unsafe-inline'; 
    connect-src 'self' ws://localhost:3000 http://localhost:3000;
    img-src 'self' blob: data:;
  " 
/>
      </head>
      <body className="min-h-full">
        <SettingsProvider>
          <FinanceProvider>{children}</FinanceProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
