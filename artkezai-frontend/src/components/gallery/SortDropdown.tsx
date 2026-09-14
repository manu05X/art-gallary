'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SortDropdownProps {
  value: string;
  onChange: (sort: string) => void;
}

// Only sorts the backend genuinely implements (see toBackendSort in
// gallery/page.tsx) — no "Featured" option, since there is no backend
// featured algorithm and pretending otherwise would be misleading.
const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || 'Sort by';

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ios-pill flex items-center gap-2 px-4 py-2.5 font-inter text-[11px] uppercase tracking-[0.1em] whitespace-nowrap text-muted hover:text-cream transition-colors duration-300"
      >
        {selectedLabel}
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-dark border border-border rounded-[14px] shadow-[var(--ios-shadow-lg)] z-30 py-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 font-inter text-[13px] transition-colors duration-200 ${
                value === opt.value
                  ? 'text-gold bg-surface'
                  : 'text-muted hover:text-cream hover:bg-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
