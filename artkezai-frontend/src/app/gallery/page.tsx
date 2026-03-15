'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterPanel from '@/components/gallery/FilterPanel';
import { SortDropdown } from '@/components/gallery/SortDropdown';

/* ── Static painting data ── */
const paintings = [
  {
    id: '1',
    title: 'Amber Reverie',
    slug: 'amber-reverie',
    price: 1200,
    artistName: 'Elena Morozova',
    medium: 'Oil on Canvas',
    category: 'Abstract',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
  },
  {
    id: '2',
    title: 'Twilight Over the Valley',
    slug: 'twilight-over-the-valley',
    price: 2400,
    artistName: 'James Whitfield',
    medium: 'Acrylic on Canvas',
    category: 'Landscape',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80',
  },
  {
    id: '3',
    title: 'Silent Conversation',
    slug: 'silent-conversation',
    price: 800,
    artistName: 'Priya Sharma',
    medium: 'Watercolor',
    category: 'Portrait',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
  },
  {
    id: '4',
    title: 'Golden Hour Fields',
    slug: 'golden-hour-fields',
    price: 3100,
    artistName: 'James Whitfield',
    medium: 'Oil on Canvas',
    category: 'Landscape',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80',
  },
  {
    id: '5',
    title: 'Fractured Light',
    slug: 'fractured-light',
    price: 1800,
    artistName: 'Elena Morozova',
    medium: 'Mixed Media',
    category: 'Abstract',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80',
  },
  {
    id: '6',
    title: 'The Red Door',
    slug: 'the-red-door',
    price: 950,
    artistName: 'Priya Sharma',
    medium: 'Acrylic on Canvas',
    category: 'Still Life',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  },
  {
    id: '7',
    title: 'Whispers of Dawn',
    slug: 'whispers-of-dawn',
    price: 2200,
    artistName: 'Elena Morozova',
    medium: 'Oil on Canvas',
    category: 'Abstract',
    image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600&q=80',
  },
  {
    id: '8',
    title: 'Solitude',
    slug: 'solitude',
    price: 1450,
    artistName: 'James Whitfield',
    medium: 'Watercolor',
    category: 'Landscape',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80',
  },
  {
    id: '9',
    title: 'Urban Pulse',
    slug: 'urban-pulse',
    price: 3400,
    artistName: 'Priya Sharma',
    medium: 'Mixed Media',
    category: 'Abstract',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600&q=80',
  },
];

const categories = ['Abstract', 'Landscape', 'Portrait', 'Still Life'];
const mediums = ['Oil on Canvas', 'Acrylic on Canvas', 'Watercolor', 'Mixed Media'];

export default function GalleryPage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [activeMedium, setActiveMedium] = useState<string | undefined>();
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  /* ── Filtering ── */
  const filtered = paintings.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeMedium && p.medium !== activeMedium) return false;
    if (minPrice && p.price < minPrice) return false;
    if (maxPrice && p.price > maxPrice) return false;
    return true;
  });

  /* ── Sorting ── */
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    return 0; // newest / featured — keep original order
  });

  const hasFilters = !!(activeCategory || activeMedium || minPrice || maxPrice);

  const clearFilters = () => {
    setActiveCategory(undefined);
    setActiveMedium(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  const handleFilterChange = (filters: Record<string, string | number | undefined>) => {
    if ('category' in filters) setActiveCategory(filters.category as string | undefined);
    if ('medium' in filters) setActiveMedium(filters.medium as string | undefined);
    if ('minPrice' in filters) setMinPrice(filters.minPrice as number | undefined);
    if ('maxPrice' in filters) setMaxPrice(filters.maxPrice as number | undefined);
  };

  return (
    <div className="bg-dark min-h-screen pt-20">
      {/* ─── Page Header ─── */}
      <div className="bg-gradient-to-b from-dark to-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/"
              className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
            >
              Home
            </Link>
            <span className="text-subtle text-xs">/</span>
            <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream">
              Gallery
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-cream">
            Original Paintings
          </h1>
          <p className="font-inter text-sm text-muted mt-3 max-w-lg">
            Browse our curated collection of original paintings from independent artists worldwide.
          </p>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar — Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel
                filters={{
                  category: activeCategory,
                  medium: activeMedium,
                  minPrice,
                  maxPrice,
                }}
                onChange={handleFilterChange}
                onClear={clearFilters}
                categories={categories}
                mediums={mediums}
                countries={[]}
              />
            </div>
          </aside>

          {/* Gallery Area */}
          <div className="lg:col-span-3">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
              <div>
                <p className="font-playfair text-2xl text-gold">{sorted.length}</p>
                <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
                  paintings found
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-4 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
                >
                  <SlidersHorizontal size={14} />
                  Filter
                </button>

                <SortDropdown value={sort} onChange={setSort} />
              </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeCategory && (
                  <FilterTag
                    label={activeCategory}
                    onRemove={() => setActiveCategory(undefined)}
                  />
                )}
                {activeMedium && (
                  <FilterTag
                    label={activeMedium}
                    onRemove={() => setActiveMedium(undefined)}
                  />
                )}
                {(minPrice || maxPrice) && (
                  <FilterTag
                    label={`$${minPrice || 0} – $${maxPrice || '∞'}`}
                    onRemove={() => {
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                    }}
                  />
                )}
                <button
                  onClick={clearFilters}
                  className="font-inter text-[11px] text-gold hover:text-gold-hover transition-colors duration-300 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Painting Grid */}
            {sorted.length === 0 ? (
              <div className="card-surface p-16 text-center">
                <p className="font-playfair text-2xl text-cream mb-2">No paintings found</p>
                <p className="font-inter text-sm text-muted mb-6">
                  Try adjusting your filters to discover more art.
                </p>
                <button
                  onClick={clearFilters}
                  className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((painting) => (
                  <PaintingCard key={painting.id} painting={painting} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-dark border-t border-border z-50 lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-2xl text-cream">Filters</h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-muted hover:text-cream transition-colors duration-300"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                filters={{
                  category: activeCategory,
                  medium: activeMedium,
                  minPrice,
                  maxPrice,
                }}
                onChange={(f) => {
                  handleFilterChange(f);
                  setMobileFilterOpen(false);
                }}
                onClear={() => {
                  clearFilters();
                  setMobileFilterOpen(false);
                }}
                categories={categories}
                mediums={mediums}
                countries={[]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Filter Tag ── */
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border font-inter text-[11px] text-cream">
      {label}
      <button
        onClick={onRemove}
        className="text-muted hover:text-cream transition-colors duration-300"
      >
        <X size={12} />
      </button>
    </span>
  );
}

/* ── Painting Card ── */
function PaintingCard({
  painting,
}: {
  painting: {
    id: string;
    title: string;
    slug: string;
    price: number;
    artistName: string;
    medium: string;
    category: string;
    image: string;
  };
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/painting/${painting.slug}`}>
      <div
        className="card-surface overflow-hidden group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface">
          <Image
            src={painting.image}
            alt={painting.title}
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
                {painting.medium}
              </span>
              <span className="font-playfair text-sm text-gold">
                ${painting.price.toLocaleString()}
              </span>
            </div>
            <span className="font-inter text-[10px] uppercase tracking-[0.15em] text-gold">
              View Painting →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-playfair text-sm text-cream leading-snug line-clamp-2 mb-1">
            {painting.title}
          </h3>
          <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
            {painting.artistName}
          </p>
        </div>
      </div>
    </Link>
  );
}
