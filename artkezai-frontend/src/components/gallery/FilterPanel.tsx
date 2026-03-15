'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface GalleryFilters {
  category?: string;
  medium?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface FilterPanelProps {
  filters: GalleryFilters;
  onChange: (filters: Partial<GalleryFilters>) => void;
  onClear: () => void;
  categories: string[];
  mediums: string[];
  countries: string[];
}

export default function FilterPanel({
  filters,
  onChange,
  onClear,
  categories,
  mediums,
  countries,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    medium: true,
    country: true,
    price: true,
  });

  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '');

  const hasActiveFilters =
    filters.category || filters.medium || filters.country || filters.minPrice || filters.maxPrice;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceApply = () => {
    onChange({
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-inter text-[10px] uppercase tracking-[0.3em] text-subtle font-semibold">
          Refine
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="font-inter text-[11px] text-gold hover:text-gold-hover transition-colors duration-300 uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      <div className="gold-line mb-6" />

      {/* Category */}
      <FilterSection
        title="Category"
        expanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        {categories.map((item) => (
          <FilterOption
            key={item}
            label={item}
            selected={filters.category === item}
            onClick={() => onChange({ category: filters.category === item ? undefined : item })}
          />
        ))}
      </FilterSection>

      {/* Medium */}
      <FilterSection
        title="Medium"
        expanded={expandedSections.medium}
        onToggle={() => toggleSection('medium')}
      >
        {mediums.map((item) => (
          <FilterOption
            key={item}
            label={item}
            selected={filters.medium === item}
            onClick={() => onChange({ medium: filters.medium === item ? undefined : item })}
          />
        ))}
      </FilterSection>

      {/* Country (only if provided) */}
      {countries.length > 0 && (
        <FilterSection
          title="Country"
          expanded={expandedSections.country}
          onToggle={() => toggleSection('country')}
        >
          {countries.map((item) => (
            <FilterOption
              key={item}
              label={item}
              selected={filters.country === item}
              onClick={() => onChange({ country: filters.country === item ? undefined : item })}
            />
          ))}
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          <div>
            <label className="font-inter text-[10px] uppercase tracking-[0.2em] text-subtle block mb-2">
              USD Min
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceApply}
              placeholder="0"
              className="w-full bg-surface border border-border text-cream px-3 py-2 font-inter text-sm focus:outline-none focus:border-gold transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-inter text-[10px] uppercase tracking-[0.2em] text-subtle block mb-2">
              USD Max
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceApply}
              placeholder="999999"
              className="w-full bg-surface border border-border text-cream px-3 py-2 font-inter text-sm focus:outline-none focus:border-gold transition-colors duration-300"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

/* ── Collapsible Section ── */
function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 font-inter text-[10px] uppercase tracking-[0.3em] text-subtle hover:text-cream transition-colors duration-300"
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div className="border-b border-border mb-3" />
      {expanded && <div className="space-y-1.5 mb-4">{children}</div>}
    </div>
  );
}

/* ── Filter Option ── */
function FilterOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 text-left py-1 font-inter text-sm transition-colors duration-300 ${
        selected ? 'text-cream' : 'text-muted hover:text-cream'
      }`}
    >
      {selected && <span className="text-gold">•</span>}
      <span>{label}</span>
    </button>
  );
}
