import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import QueryClientWrapper from '@/components/providers/QueryClientWrapper';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Artkezai',
    default: 'Artkezai — Original Paintings Marketplace',
  },
  description:
    'A curated marketplace for original paintings from independent artists worldwide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-inter">
        <QueryClientWrapper>
          <Header />
          <main>{children}</main>
          <Footer />
        </QueryClientWrapper>
      </body>
    </html>
  );
}
