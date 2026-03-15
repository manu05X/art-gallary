'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Artist {
  displayName: string;
  slug: string;
  country: string;
}

interface PaintingCardProps {
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

export default function PaintingCard({
  title,
  slug,
  price,
  currency,
  primaryImageUrl,
  thumbnailUrl,
  artist,
  medium,
  isOfferEnabled,
}: PaintingCardProps) {
  const [hovered, setHovered] = useState(false);
  const imageUrl = thumbnailUrl || primaryImageUrl;

  return (
    <Link href={`/painting/${slug}`}>
      <div
        className="card-surface overflow-hidden cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={`object-cover transition-transform duration-700 ease-out ${
              hovered ? 'scale-105' : 'scale-100'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Hover overlay */}
          <div
            className={`absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgba(15,15,15,0.95)] to-transparent flex flex-col justify-end p-4 transition-all duration-500 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-muted">
                {medium}
              </span>
              <span className="font-playfair text-sm text-gold">
                {currency} {price.toLocaleString()}
              </span>
            </div>

            {isOfferEnabled && (
              <span className="inline-block border border-gold text-gold px-2 py-1 font-inter text-[10px] uppercase tracking-wider w-fit mb-1">
                Offers welcome
              </span>
            )}

            <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-gold">
              View Painting →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-playfair text-sm text-cream leading-snug line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
            {artist.displayName}
          </p>
        </div>
      </div>
    </Link>
  );
}
