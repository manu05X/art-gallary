import Link from 'next/link';

const footerLinks = {
  Explore: [
    { label: 'Gallery', href: '/gallery' },
    { label: 'Artists', href: '/artists' },
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
  ],
  Account: [
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/register' },
    { label: 'Collector Dashboard', href: '/dashboard' },
    { label: 'Artist Portal', href: '/artist' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms of Service', href: '/policies/terms' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-transparent border-t border-border/70 px-6 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="ios-card p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-5 gap-12 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-playfair text-xl tracking-[0.12em] text-cream font-semibold">ARTKEZAI</span>
              <span className="block font-inter text-[9px] uppercase tracking-[0.16em] text-muted mt-0.5">Gallery</span>
            </Link>
            <p className="font-inter text-[13px] text-muted leading-7 max-w-xs">
              A curated marketplace for original paintings. We connect independent artists with collectors around the world.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full ios-pill flex items-center justify-center">
                <div className="w-2 h-2 bg-gold rounded-full" />
              </div>
              <span className="font-inter text-[11px] text-muted">Independent artists. Original works only.</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-inter text-[10px] uppercase tracking-[0.12em] text-subtle mb-5 font-semibold">{group}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-inter text-[13px] text-muted hover:text-gold transition-colors duration-200 inline-flex px-3 py-2 rounded-xl hover:bg-white/30 dark:hover:bg-white/5">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="ios-glass rounded-[18px] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-[11px] text-subtle">
            © {currentYear} Artkezai. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-gold/60 rounded-full" />
            <p className="font-inter text-[11px] text-subtle">
              Original art. Verified authenticity. Fair for artists.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
