import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'
import ErrorBoundary from '@/components/ErrorBoundary';

//const inter = Inter({ subsets: ['latin'] });
const jost = Jost({ subsets: ['latin'] }); 

export const metadata: Metadata = {
  title: 'DMM - Dezenformasyonla Mücadele Merkezi',
  description: 'Dezinformasyon vakalarının takip ve yönetim sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={jost.className} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}