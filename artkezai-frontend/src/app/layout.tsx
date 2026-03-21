import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import QueryClientWrapper from '@/components/providers/QueryClientWrapper';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const playfair = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-inter">
        <ThemeProvider>
          <QueryClientWrapper>
            <Header />
            <main className="pt-24 sm:pt-28">{children}</main>
            <Footer />
          </QueryClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
