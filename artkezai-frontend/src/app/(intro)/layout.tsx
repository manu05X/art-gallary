import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artkezai Gallery',
};

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
