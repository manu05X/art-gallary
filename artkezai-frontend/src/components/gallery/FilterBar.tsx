'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/* ────────────────────────────────────────────────
   Single-select dropdown pill — same open/close and
   outside-click pattern as the sort control, reused
   for Category / Medium / Country so the three read
   as one family of controls instead of three widgets.
   ──────────────────────────────────────────────── */
function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected?: string;
  onSelect: (value: string | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`ios-pill flex items-center gap-2 px-4 py-2.5 font-inter text-[11px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-300 ${
          selected ? 'text-gold' : 'text-muted hover:text-cream'
        }`}
      >
        {selected || label}
        <ChevronDown size={13} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 max-h-72 overflow-y-auto bg-dark border border-border rounded-[14px] shadow-[var(--ios-shadow-lg)] z-30 py-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(selected === opt ? undefined : opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 font-inter text-[13px] transition-colors duration-200 ${
                selected === opt ? 'text-gold bg-surface' : 'text-muted hover:text-cream hover:bg-surface'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Price range popover ── */
function PriceDropdown({
  minPrice,
  maxPrice,
  onApply,
}: {
  minPrice?: number;
  maxPrice?: number;
  onApply: (min: number | undefined, max: number | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [min, setMin] = useState(minPrice?.toString() || '');
  const [max, setMax] = useState(maxPrice?.toString() || '');
  const ref = useRef<HTMLDivElement>(null);
  const hasValue = minPrice !== undefined || maxPrice !== undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMin(minPrice?.toString() || '');
    setMax(maxPrice?.toString() || '');
  }, [minPrice, maxPrice]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`ios-pill flex items-center gap-2 px-4 py-2.5 font-inter text-[11px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-300 ${
          hasValue ? 'text-gold' : 'text-muted hover:text-cream'
        }`}
      >
        {hasValue ? `$${minPrice ?? 0} – $${maxPrice ?? '∞'}` : 'Price'}
        <ChevronDown size={13} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-dark border border-border rounded-[14px] shadow-[var(--ios-shadow-lg)] z-30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="font-inter text-[9px] uppercase tracking-[0.2em] text-subtle block mb-1.5">Min USD</label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
                className="w-full bg-surface border border-border text-cream px-2.5 py-2 font-inter text-sm focus:outline-none focus:border-gold transition-colors duration-300 rounded-[8px]"
              />
            </div>
            <div className="flex-1">
              <label className="font-inter text-[9px] uppercase tracking-[0.2em] text-subtle block mb-1.5">Max USD</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="Any"
                className="w-full bg-surface border border-border text-cream px-2.5 py-2 font-inter text-sm focus:outline-none focus:border-gold transition-colors duration-300 rounded-[8px]"
              />
            </div>
          </div>
          <button
            onClick={() => {
              onApply(min ? parseInt(min, 10) : undefined, max ? parseInt(max, 10) : undefined);
              setIsOpen(false);
            }}
            className="w-full mt-4 font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-4 py-2 hover:bg-gold hover:text-dark transition-all duration-300 rounded-[8px]"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export interface FilterBarState {
  category?: string;
  medium?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface FilterBarProps {
  filters: FilterBarState;
  onChange: (filters: Partial<FilterBarState>) => void;
  categories: string[];
  mediums: string[];
  countries: string[];
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchApply: () => void;
}

/* ────────────────────────────────────────────────
   Horizontal "Refine" bar — replaces the sidebar +
   mobile drawer with one responsive control row that
   wraps/scrolls instead of being re-laid-out for
   mobile, per the editorial-catalogue direction.
   ──────────────────────────────────────────────── */
export default function FilterBar({
  filters,
  onChange,
  categories,
  mediums,
  countries,
  searchInput,
  onSearchInputChange,
  onSearchApply,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative flex-1 sm:max-w-xs">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onBlur={onSearchApply}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearchApply();
          }}
          placeholder="Search the collection…"
          className="w-full bg-surface border border-border text-cream placeholder:text-subtle pl-9 pr-3 py-2.5 font-inter text-sm focus:outline-none focus:border-gold transition-colors duration-300 rounded-[10px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <FilterDropdown
          label="Category"
          options={categories}
          selected={filters.category}
          onSelect={(v) => onChange({ category: v })}
        />
        <FilterDropdown
          label="Medium"
          options={mediums}
          selected={filters.medium}
          onSelect={(v) => onChange({ medium: v })}
        />
        <FilterDropdown
          label="Country"
          options={countries}
          selected={filters.country}
          onSelect={(v) => onChange({ country: v })}
        />
        <PriceDropdown
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onApply={(min, max) => onChange({ minPrice: min, maxPrice: max })}
        />
      </div>
    </div>
  );
}
