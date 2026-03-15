'use client';

import PaintingCard from './PaintingCard';

interface Artist {
  displayName: string;
  slug: string;
  country: string;
}

interface Painting {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  primaryImageUrl: string;
  thumbnailUrl?: string;
  artist: Artist;
  medium: string;
  category: string;
  isOfferEnabled?: boolean;
}

interface MasonryGridProps {
  paintings: Painting[];
  isLoading?: boolean;
}

export default function MasonryGrid({ paintings, isLoading = false }: MasonryGridProps) {
  if (isLoading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`skeleton break-inside-avoid ${
              i % 3 === 0 ? 'h-96' : i % 3 === 1 ? 'h-[480px]' : 'h-[400px]'
            }`}
          />
        ))}
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h3 className="font-playfair text-2xl text-cream mb-3 italic">No paintings found</h3>
        <p className="font-inter text-sm text-muted">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {paintings.map((painting) => (
        <div key={painting.id} className="break-inside-avoid">
          <PaintingCard {...painting} />
        </div>
      ))}
    </div>
  );
}
