import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';
import '../globals.css';
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
  title: 'Artkezai Gallery',
};

/* Full-screen layout — no Header, no Footer, no padding */
export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-inter" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        <ThemeProvider>
          <QueryClientWrapper>
            {children}
          </QueryClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
