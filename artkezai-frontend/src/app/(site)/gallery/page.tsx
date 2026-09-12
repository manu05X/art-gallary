'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterPanel from '@/components/gallery/FilterPanel';
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
    case 'featured': // no backend concept of "featured" yet — fall back to newest
    case 'newest':
    default:
      return 'newest';
  }
}

export default function GalleryPage() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
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
                  country: activeCountry,
                  minPrice,
                  maxPrice,
                }}
                onChange={handleFilterChange}
                onClear={clearFilters}
                categories={categories.map((c) => c.name)}
                mediums={mediums.map((m) => m.name)}
                countries={countries.map((c) => c.name)}
              />
            </div>
          </aside>

          {/* Gallery Area */}
          <div className="lg:col-span-3">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
              <div>
                <p className="font-playfair text-2xl text-gold">{galleryPage?.totalCount ?? 0}</p>
                <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted">
                  paintings found
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onBlur={applySearch}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applySearch();
                  }}
                  placeholder="Search paintings..."
                  className="bg-surface border border-border text-cream placeholder:text-subtle px-3 py-2.5 font-inter text-sm focus:outline-none focus:border-gold transition-colors duration-300 w-40 sm:w-56"
                />

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
                {activeCountry && (
                  <FilterTag
                    label={activeCountry}
                    onRemove={() => setActiveCountry(undefined)}
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
                {search && (
                  <FilterTag
                    label={`"${search}"`}
                    onRemove={() => {
                      setSearchInput('');
                      setSearch(undefined);
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
            {isLoading ? (
              <div className="card-surface p-16 text-center">
                <p className="font-playfair text-2xl text-cream mb-2">Loading paintings…</p>
                <p className="font-inter text-sm text-muted">Fetching the latest approved artwork.</p>
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
            ) : paintings.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  country: activeCountry,
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
                categories={categories.map((c) => c.name)}
                mediums={mediums.map((m) => m.name)}
                countries={countries.map((c) => c.name)}
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
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 ios-pill font-inter text-[11px] text-cream">
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
