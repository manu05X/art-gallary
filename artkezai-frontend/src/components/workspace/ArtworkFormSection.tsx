interface ArtworkFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * One titled section of the artwork submission form (Phase 2.4) — used for
 * Artwork Identity, Imagery, Details & Dimensions, Classification, and
 * Pricing. Introduced only because the same title+description+spacing
 * pattern repeats five times on one page.
 */
export default function ArtworkFormSection({ title, description, children }: ArtworkFormSectionProps) {
  return (
    <div className="pb-8 mb-8 border-b border-workspace-border last:border-b-0 last:mb-0 last:pb-0">
      <h2 className="font-playfair text-lg text-brand mb-1">{title}</h2>
      <p className="font-inter text-sm text-gray-500 mb-5">{description || ' '}</p>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
