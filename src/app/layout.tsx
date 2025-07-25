
"use client";
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { AuctionProvider } from '@/context/AuctionContext';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AuctionProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <Toaster />
          </AuctionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
