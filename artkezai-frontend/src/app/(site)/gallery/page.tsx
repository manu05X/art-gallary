'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import FilterBar from '@/components/gallery/FilterBar';
import { SortDropdown } from '@/components/gallery/SortDropdown';
import PaintingCard from '@/components/gallery/PaintingCard';
import { useCategories, useMediums, useCountries, usePaintings } from '@/lib/hooks/usePaintings';

const FALLBACK_PAINTING_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80';

// The UI's own sort vocabulary (SortDropdown's options) doesn't match the
// backend's sortBy values one-to-one — translate here, at the one place that
// owns this page's sort UI, rather than inside the shared API client.
function toBackendSort(uiSort: string): string {
  switch (uiSort) {
    case 'price-low':
      return 'price-asc';
    case 'price-high':
      return 'price-desc';
    case 'newest':
    default:
      return 'newest';
  }
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [activeMedium, setActiveMedium] = useState<string | undefined>();
  const [activeCountry, setActiveCountry] = useState<string | undefined>();
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useCategories();
  const { data: mediumsData } = useMediums();
  const { data: countriesData } = useCountries();

  const categories = categoriesData ?? [];
  const mediums = mediumsData ?? [];
  const countries = countriesData ?? [];

  const categoryId = categories.find((c) => c.name === activeCategory)?.id;
  const mediumId = mediums.find((m) => m.name === activeMedium)?.id;
  const countryId = countries.find((c) => c.name === activeCountry)?.id;

  const {
    data: galleryPage,
    isLoading,
    isError,
    refetch,
  } = usePaintings(
    {
      categoryId,
      mediumId,
      country: countryId, // API boundary translates this to countryId
      minPrice,
      maxPrice,
      search,
    },
    page,
    toBackendSort(sort)
  );

  const paintings = galleryPage?.data ?? [];
  const totalCount = galleryPage?.totalCount ?? 0;
  const hasFilters = !!(activeCategory || activeMedium || activeCountry || minPrice || maxPrice || search);

  // Any filter/search/sort change invalidates the current page — go back to page 1.
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeMedium, activeCountry, minPrice, maxPrice, search, sort]);

  const clearFilters = () => {
    setActiveCategory(undefined);
    setActiveMedium(undefined);
    setActiveCountry(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchInput('');
    setSearch(undefined);
  };

  const handleFilterChange = (filters: Record<string, string | number | undefined>) => {
    if ('category' in filters) setActiveCategory(filters.category as string | undefined);
    if ('medium' in filters) setActiveMedium(filters.medium as string | undefined);
    if ('country' in filters) setActiveCountry(filters.country as string | undefined);
    if ('minPrice' in filters) setMinPrice(filters.minPrice as number | undefined);
    if ('maxPrice' in filters) setMaxPrice(filters.maxPrice as number | undefined);
  };

  const applySearch = () => {
    setSearch(searchInput.trim() || undefined);
  };

  return (
    <div className="bg-dark min-h-screen pt-20">
      {/* ─── Editorial Page Intro ─── */}
      <div className="bg-gradient-to-b from-dark to-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/"
              className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
            >
              Home
            </Link>
            <span className="text-subtle text-xs">/</span>
            <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream">Gallery</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-gold" />
            <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-gold">The Full Collection</span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-cream leading-tight">
            Original Paintings
          </h1>
          <p className="font-inter text-sm text-muted mt-4 max-w-lg leading-relaxed">
            {totalCount > 0 ? (
              <>
                <span className="text-gold">{totalCount.toLocaleString()}</span> approved original{' '}
                {totalCount === 1 ? 'work' : 'works'}, curated from independent artists worldwide.
              </>
            ) : (
              'Curated original paintings from independent artists worldwide.'
            )}
          </p>
        </div>
      </div>

      {/* ─── Refine Bar ─── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <FilterBar
              filters={{
                category: activeCategory,
                medium: activeMedium,
                country: activeCountry,
                minPrice,
                maxPrice,
              }}
              onChange={handleFilterChange}
              categories={categories.map((c) => c.name)}
              mediums={mediums.map((m) => m.name)}
              countries={countries.map((c) => c.name)}
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              onSearchApply={applySearch}
            />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="font-inter text-[11px] uppercase tracking-[0.1em] text-gold hover:text-gold-hover transition-colors duration-300 whitespace-nowrap"
              >
                Clear all
              </button>
            )}
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="max-w-7xl mx-auto px-6 pb-6 flex flex-wrap items-center gap-2">
            {activeCategory && <FilterTag label={activeCategory} onRemove={() => setActiveCategory(undefined)} />}
            {activeMedium && <FilterTag label={activeMedium} onRemove={() => setActiveMedium(undefined)} />}
            {activeCountry && <FilterTag label={activeCountry} onRemove={() => setActiveCountry(undefined)} />}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <FilterTag
                label={`$${minPrice ?? 0} – $${maxPrice ?? '∞'}`}
                onRemove={() => {
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                }}
              />
            )}
            {search && (
              <FilterTag
                label={`"${search}"`}
                onRemove={() => {
                  setSearchInput('');
                  setSearch(undefined);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Gallery Grid ─── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[var(--ios-radius-xl)] skeleton" />
            ))}
          </div>
        ) : isError ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">Something went wrong</p>
            <p className="font-inter text-sm text-muted mb-6">
              We couldn&apos;t load the gallery. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : paintings.length === 0 && hasFilters ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">No paintings match your filters</p>
            <p className="font-inter text-sm text-muted mb-6">
              Try adjusting or clearing your filters to discover more art.
            </p>
            <button
              onClick={clearFilters}
              className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : paintings.length === 0 ? (
          <div className="card-surface p-16 text-center">
            <p className="font-playfair text-2xl text-cream mb-2">The gallery is just getting started</p>
            <p className="font-inter text-sm text-muted mb-6">
              No original works are live yet — approved paintings will appear here as artists join the collection.
            </p>
            <Link
              href="/auth/register"
              className="inline-block font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
            >
              Submit Your Work
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paintings.map((painting) => (
                <PaintingCard
                  key={painting.id}
                  id={painting.id}
                  title={painting.title}
                  slug={painting.slug}
                  price={painting.price}
                  currency={painting.currency}
                  primaryImageUrl={painting.primaryImageUrl || FALLBACK_PAINTING_IMAGE}
                  thumbnailUrl={painting.thumbnailUrl || undefined}
                  artist={{
                    displayName: painting.artistName,
                    slug: painting.artistSlug,
                    country: painting.countryName || '',
                  }}
                  medium={painting.mediumName || ''}
                  category={painting.categoryName || ''}
                  isOfferEnabled={painting.isOfferEnabled}
                />
              ))}
            </div>

            {/* Pagination */}
            {galleryPage && galleryPage.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={!galleryPage.hasPreviousPage}
                  className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
                  Page {page} of {galleryPage.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!galleryPage.hasNextPage}
                  className="font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Filter Tag ── */
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 ios-pill font-inter text-[11px] text-cream">
      {label}
      <button onClick={onRemove} className="text-muted hover:text-cream transition-colors duration-300">
        <X size={12} />
      </button>
    </span>
  );
}
