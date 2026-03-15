import Link from 'next/link';

const footerLinks = {
  explore: [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Artists', href: '/artists' },
    { label: 'Categories', href: '/categories' },
    { label: 'How It Works', href: '/how-it-works' },
  ],
  policies: [
    { label: 'Shipping', href: '/policies/shipping-policy' },
    { label: 'Returns', href: '/policies/returns-policy' },
    { label: 'Authenticity', href: '/policies/authenticity' },
    { label: 'Terms', href: '/policies/terms' },
    { label: 'Privacy', href: '/policies/privacy' },
  ],
  contact: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'About', href: '/about' },
    { label: 'Why Artkezai', href: '/why-artkezai' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top */}
        <div className="mb-14 pb-10 border-b border-border">
          <span className="font-playfair text-lg tracking-[0.2em] text-cream">
            ARTKEZAI
          </span>
          <p className="font-inter text-sm text-muted mt-3 max-w-md">
            Original paintings. Authentic stories. Yours to own.
          </p>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-14">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-inter text-[10px] uppercase tracking-[0.2em] text-cream mb-5 font-semibold">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-inter text-xs text-muted hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-inter text-[11px] text-subtle">
            © 2026 Artkezai. All rights reserved.
          </p>
          <p className="font-inter text-[11px] text-subtle">
            Every painting ships with a Certificate of Authenticity.
          </p>
        </div>
      </div>
    </footer>
  );
}
