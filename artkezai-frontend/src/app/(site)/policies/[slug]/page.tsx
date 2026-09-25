import ContentPageView from '@/components/content/ContentPageView';

// Footer policy links use short slugs; the seeded content pages use these.
const SLUG_ALIASES: Record<string, string> = {
  shipping: 'shipping-policy',
  returns: 'returns-policy',
};

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ContentPageView slug={SLUG_ALIASES[slug] ?? slug} />;
}
