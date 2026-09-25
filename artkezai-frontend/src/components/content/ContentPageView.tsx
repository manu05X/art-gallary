'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/lib/api/content';

// Renders an admin-managed content page (policies, Why Artkezai). The body is
// HTML written by gallery admins through the content API, not by members.
export default function ContentPageView({ slug }: { slug: string }) {
  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['content-page', slug],
    queryFn: () => contentApi.getPage(slug),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-dark pt-32 pb-24 px-4">
      <article className="max-w-3xl mx-auto">
        {isLoading && <p className="font-inter text-muted">Loading…</p>}
        {isError && (
          <div>
            <h1 className="font-playfair text-4xl text-cream mb-4">Page not found</h1>
            <Link href="/" className="font-inter text-gold hover:underline">
              Return home
            </Link>
          </div>
        )}
        {page && (
          <>
            <h1 className="font-playfair text-4xl md:text-5xl text-cream mb-8">{page.title}</h1>
            <div
              className="font-inter text-cream/80 leading-relaxed space-y-4 [&_a]:text-gold [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
            <p className="font-inter text-xs text-muted mt-12">
              Last updated {new Date(page.updatedAt).toLocaleDateString()}
            </p>
          </>
        )}
      </article>
    </div>
  );
}
