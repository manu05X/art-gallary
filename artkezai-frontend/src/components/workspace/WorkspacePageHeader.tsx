interface WorkspacePageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Shared page header for workspace pages (Phase 2.3) — both /artist/listings
 * and /admin/moderation repeated the same title/subtitle block verbatim.
 *
 * Note: intentionally does NOT reuse the Phase 2.1 `.text-eyebrow` primitive
 * for the eyebrow line — that class resolves color from the theme-reactive
 * `--color-muted` token (tuned for the dark glass pages, and washed out on
 * a white workspace card since dark is the site-wide default theme). Uses a
 * fixed gray instead, appropriate for this always-light context.
 */
export default function WorkspacePageHeader({ eyebrow, title, description, action }: WorkspacePageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-playfair text-2xl sm:text-3xl text-brand">{title}</h1>
        {description && <p className="font-inter text-sm text-gray-600 mt-2">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
