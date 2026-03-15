# Component Reference - Artkezai Dark Art Gallery UI

## Export Statements

All components are default exports ready for immediate import:

### Layout Components
```typescript
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
```

### Provider Components
```typescript
import QueryClientWrapper from '@/components/providers/QueryClientWrapper';
import LenisProvider from '@/components/providers/LenisProvider';
```

### UI Animation Components
```typescript
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';
```

### Gallery Components
```typescript
import PaintingCard from '@/components/gallery/PaintingCard';
import FilterPanel from '@/components/gallery/FilterPanel';
import MasonryGrid from '@/components/gallery/MasonryGrid';
```

### Painting Detail Components
```typescript
import ImageViewer from '@/components/painting/ImageViewer';
import MakeOfferModal from '@/components/painting/MakeOfferModal';
```

### State Management
```typescript
import { useAuthStore } from '@/lib/store/authStore';
```

## Component Props

### Header
```typescript
// No props needed - uses usePathname and useAuthStore internally
<Header />
```

### Footer
```typescript
// No props needed - renders static content
<Footer />
```

### AnimatedSection
```typescript
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}
```

### AnimatedText
```typescript
interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
}
```

### PaintingCard
```typescript
interface PaintingCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  primaryImageUrl: string;
  thumbnailUrl?: string;
  artist: {
    displayName: string;
    slug: string;
    country: string;
  };
  medium: string;
  category: string;
  isOfferEnabled?: boolean;
}
```

### FilterPanel
```typescript
interface FilterPanelProps {
  filters: GalleryFilters;
  onChange: (filters: Partial<GalleryFilters>) => void;
  onClear: () => void;
  categories: string[];
  mediums: string[];
  countries: string[];
  isLoading?: boolean;
}

interface GalleryFilters {
  category?: string;
  medium?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}
```

### MasonryGrid
```typescript
interface MasonryGridProps {
  paintings: Painting[];
  isLoading?: boolean;
}
```

### ImageViewer
```typescript
interface ImageViewerProps {
  images: ImageItem[];
  title: string;
}

interface ImageItem {
  url: string;
  thumbnailUrl?: string;
  id: string;
  isPrimary?: boolean;
}
```

### MakeOfferModal
```typescript
interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  painting: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
}
```

## Store Hooks

### useAuthStore
```typescript
const authStore = useAuthStore();

// Properties
authStore.user // AuthUser | null
authStore.isAuthenticated // boolean

// Methods
authStore.login(user) // Set user and authenticated state
authStore.logout() // Clear auth state
authStore.setUser(user) // Update user only

// AuthUser interface
interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'buyer' | 'artist' | 'admin';
  avatar?: string;
}
```

## CSS Classes

### Available Classes
```css
.font-display /* Playfair Display font */
.font-sans /* Inter font */
.gold-line /* 1px gold horizontal line */
.card-surface /* Dark surface with border */
.text-gradient-gold /* Gold gradient text effect */
.skeleton /* Loading shimmer animation */
```

### Custom Properties
```css
--bg-primary: #0F0F0F
--bg-surface: #1A1710
--bg-surface-hover: #1E1B14
--border-color: #2E2A22
--accent-gold: #C9A84C
--accent-gold-muted: rgba(201, 168, 76, 0.12)
--text-primary: #F5F0E8
--text-muted: #8A8070
--text-subtle: #5A5548
```

## Usage Examples

### Gallery Page
```typescript
import PaintingCard from '@/components/gallery/PaintingCard';
import FilterPanel from '@/components/gallery/FilterPanel';
import MasonryGrid from '@/components/gallery/MasonryGrid';
import { useState } from 'react';

export default function GalleryPage() {
  const [filters, setFilters] = useState({});
  
  return (
    <div className="flex gap-8 px-6 py-8">
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({})}
        categories={['Abstract', 'Portrait']}
        mediums={['Oil', 'Acrylic']}
        countries={['USA', 'UK']}
      />
      <MasonryGrid paintings={paintings} />
    </div>
  );
}
```

### Painting Detail Page
```typescript
import ImageViewer from '@/components/painting/ImageViewer';
import MakeOfferModal from '@/components/painting/MakeOfferModal';
import { useState } from 'react';

export default function PaintingPage() {
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto">
      <ImageViewer images={images} title={painting.title} />
      
      <button onClick={() => setIsOfferOpen(true)}>
        Make Offer
      </button>
      
      <MakeOfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        painting={painting}
      />
    </div>
  );
}
```

### Animated Section
```typescript
import AnimatedSection from '@/components/ui/AnimatedSection';

<AnimatedSection direction="up" delay={0.2}>
  <h2>Featured Collection</h2>
</AnimatedSection>
```

## No Configuration Required
All components are fully self-contained:
- No environment variables needed
- No additional setup required beyond npm install
- All styling uses Tailwind + CSS custom properties
- All animations use Framer Motion + Lenis
- Ready to use immediately in any Next.js 14 project
