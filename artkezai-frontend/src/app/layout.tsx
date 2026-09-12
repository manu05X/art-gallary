import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import QueryClientWrapper from '@/components/providers/QueryClientWrapper';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Editorial display serif — every heading across the app already uses the
// font-playfair class expecting a serif; it was loading Sora (a sans) instead.
const playfair = Playfair_Display({
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
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg' }],
  },
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
            {children}
          </QueryClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
