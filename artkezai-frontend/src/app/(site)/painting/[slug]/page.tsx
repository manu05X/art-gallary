'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Zap, MessageSquare, Shield } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import PaintingCard from '@/components/gallery/PaintingCard';
import { useAuthStore } from '@/lib/store/authStore';
import { usePainting, usePaintings } from '@/lib/hooks/usePaintings';
import { useBuyNowCheckout } from '@/lib/hooks/useCheckout';
import { useMakeOffer } from '@/lib/hooks/useOffers';
import { useCreateThread } from '@/lib/hooks/useMessages';
import { parseApiError } from '@/lib/api/utils';
import { offersApi } from '@/lib/api/offers';
import { trackEvent } from '@/lib/analytics';
import { OfferStatus, PaintingStatus, PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

const FALLBACK_PAINTING_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80';

function artistInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PaintingPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  // Arriving from "Complete Purchase" on an accepted offer: check out at the
  // agreed price instead of the list price.
  const offerIdParam = Number(searchParams.get('offerId')) || null;
  const { data: acceptedOffer } = useQuery({
    queryKey: ['offer', offerIdParam],
    queryFn: () => offersApi.getOffer(offerIdParam as number),
    enabled: !!offerIdParam && isAuthenticated && user?.role === 'buyer',
  });
  const checkoutOffer = acceptedOffer?.status === OfferStatus.ACCEPTED ? acceptedOffer : null;
  const { data: painting, isLoading: isPaintingLoading, isError: isPaintingError } = usePainting(params.slug);
  const { data: relatedPage } = usePaintings(
    {
      categoryId: painting?.categoryId,
    },
    1,
    'newest'
  );
  const buyNowMutation = useBuyNowCheckout();
  const makeOfferMutation = useMakeOffer();
  const createThreadMutation = useCreateThread();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [galleryMessage, setGalleryMessage] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shippingName: user?.displayName || '',
    shippingEmail: user?.email || '',
    shippingPhone: '',
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: '',
    paymentMethod: PaymentMethod.ONLINE,
  });

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in as buyer to continue.');
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'buyer') {
      toast.error('Only buyer accounts can purchase artworks.');
      return;
    }

    setCheckoutData((prev) => ({
      ...prev,
      shippingName: prev.shippingName || user?.displayName || '',
      shippingEmail: prev.shippingEmail || user?.email || '',
    }));
    setShowCheckout(true);
  };

  useEffect(() => {
    if (checkoutOffer) {
      setShowCheckout(true);
    }
  }, [checkoutOffer]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!painting) return;

    try {
      const order = await buyNowMutation.mutateAsync({
        paintingId: Number(painting.id),
        offerId: checkoutOffer?.id,
        shippingName: checkoutData.shippingName,
        shippingEmail: checkoutData.shippingEmail,
        shippingPhone: checkoutData.shippingPhone || undefined,
        shippingAddress1: checkoutData.shippingAddress1,
        shippingAddress2: checkoutData.shippingAddress2 || undefined,
        shippingCity: checkoutData.shippingCity,
        shippingState: checkoutData.shippingState || undefined,
        shippingZip: checkoutData.shippingZip,
        shippingCountry: checkoutData.shippingCountry,
        paymentMethod: checkoutData.paymentMethod,
      });

      setShowCheckout(false);
      trackEvent('order_created', { method: checkoutData.paymentMethod, offer: checkoutOffer ? 1 : 0 });
      if (checkoutData.paymentMethod === PaymentMethod.ONLINE) {
        toast.success('Order created. Complete your card payment.');
        router.push(`/dashboard/orders/${order.id}/pay`);
      } else {
        toast.success('Order created. Bank transfer instructions will be shared by the gallery.');
        router.push('/dashboard/orders');
      }
    } catch (error: any) {
      toast.error(parseApiError(error, 'Failed to start checkout. Please try again.').message);
    }
  };

  const handleOpenOffer = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in as buyer to make an offer.');
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'buyer') {
      toast.error('Only buyer accounts can make offers.');
      return;
    }

    setShowOffer(true);
  };

  const handleSubmitOffer = async () => {
    if (!painting) return;

    const amount = Number(offerAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid offer amount.');
      return;
    }

    try {
      await makeOfferMutation.mutateAsync({
        paintingId: Number(painting.id),
        offerAmount: amount,
        message: offerMessage || undefined,
      });
      setShowOffer(false);
      setOfferAmount('');
      setOfferMessage('');
      router.push('/dashboard/offers');
    } catch {
      // Error toast handled in hook
    }
  };

  const handleOpenMessageGallery = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to message the gallery.');
      router.push('/auth/login');
      return;
    }
    setShowMessageModal(true);
  };

  const handleSubmitMessageGallery = async () => {
    if (!painting || !galleryMessage.trim()) {
      toast.error('Please write a message first.');
      return;
    }

    try {
      await createThreadMutation.mutateAsync({
        subject: `Inquiry about ${painting.title}`,
        body: galleryMessage.trim(),
        paintingId: Number(painting.id),
      });
      setShowMessageModal(false);
      setGalleryMessage('');
      router.push('/dashboard/messages');
    } catch {
      // Error toast handled in hook
    }
  };

  if (isPaintingLoading) {
    return (
      <div className="bg-dark min-h-screen pt-20 flex items-center justify-center p-6">
        <div className="card-surface p-16 text-center">
          <p className="font-playfair text-2xl text-cream mb-2">Loading the artwork…</p>
          <p className="font-inter text-sm text-muted">Fetching details from the gallery.</p>
        </div>
      </div>
    );
  }

  if (isPaintingError || !painting) {
    return (
      <div className="bg-dark min-h-screen pt-20 flex items-center justify-center p-6">
        <div className="card-surface p-16 text-center max-w-md">
          <p className="font-playfair text-2xl text-cream mb-2">Painting not found</p>
          <p className="font-inter text-sm text-muted mb-6">
            This painting doesn&apos;t exist, or has been removed from the collection.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 font-inter text-[11px] uppercase tracking-[0.12em] text-gold border border-gold px-6 py-2.5 hover:bg-gold hover:text-dark transition-all duration-300"
          >
            <ArrowLeft size={14} />
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const related = (relatedPage?.data ?? []).filter((p) => p.slug !== painting.slug).slice(0, 4);

  const images = painting.allImages && painting.allImages.length > 0
    ? painting.allImages
    : [{ id: -1, url: FALLBACK_PAINTING_IMAGE, displayOrder: 0, isPrimary: true }];
  const currentImage = images[Math.min(selectedImage, images.length - 1)];

  const artistName = painting.artist
    ? `${painting.artist.firstName} ${painting.artist.lastName}`.trim()
    : painting.artistName;
  const artistSlug = painting.artist?.slug;
  const artistBio = painting.artist?.bio?.trim() || 'This artist has not added a bio yet.';
  const artistPhoto = painting.artist?.profileImageUrl;

  const hasDimensions = !!(painting.width && painting.height);
  const description = painting.description?.trim();

  return (
    <div className="bg-dark min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="border-b border-border px-6">
        <div className="max-w-7xl mx-auto py-5 flex items-center gap-2">
          <Link
            href="/"
            className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
          >
            Home
          </Link>
          <span className="text-subtle text-xs">/</span>
          <Link
            href="/gallery"
            className="font-inter text-[11px] uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors duration-300"
          >
            Gallery
          </Link>
          <span className="text-subtle text-xs">/</span>
          <span className="font-inter text-[11px] uppercase tracking-[0.15em] text-cream truncate max-w-[200px]">
            {painting.title}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          {/* LEFT — Artwork imagery, dominant */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="relative">
              <button
                onClick={() => setIsZoomOpen(true)}
                className="relative w-full h-[46vh] sm:h-[56vh] lg:h-[68vh] bg-surface overflow-hidden rounded-[var(--ios-radius-xl)] border border-border cursor-zoom-in block"
              >
                <Image
                  src={currentImage.url}
                  alt={painting.title}
                  fill
                  priority
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </button>
              {painting.categoryName && (
                <div className="absolute top-5 left-5 ios-glass px-3 py-1.5 rounded-full pointer-events-none">
                  <span className="font-inter text-[10px] uppercase tracking-widest text-gold">
                    {painting.categoryName}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip — only when the artwork actually has more than one image */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 relative w-20 h-20 rounded-[10px] overflow-hidden border-2 transition-colors duration-300 ${
                      i === selectedImage ? 'border-gold' : 'border-border hover:border-muted'
                    }`}
                  >
                    <Image src={img.url} alt={`${painting.title} view ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {description && (
              <AnimatedSection delay={0.2} className="mt-12">
                <h2 className="font-playfair text-2xl text-cream mb-5">About this Painting</h2>
                <p className="font-inter text-[15px] text-muted leading-8 whitespace-pre-line">{description}</p>
              </AnimatedSection>
            )}
          </motion.div>

          {/* RIGHT — Title, price, metadata, acquisition */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 lg:sticky lg:top-24 lg:h-fit"
          >
            <div className="space-y-6">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl text-cream leading-tight mb-3">
                  {painting.title}
                </h1>
                <Link
                  href={artistSlug ? `/artists/${artistSlug}` : '/artists'}
                  className="font-inter text-sm text-muted hover:text-gold transition-colors duration-300"
                >
                  by <span className="font-semibold">{artistName}</span>
                </Link>
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="font-playfair text-4xl text-gold mb-1">
                  {painting.currency} {painting.price.toLocaleString()}
                </p>
                <p className="font-inter text-[11px] uppercase tracking-widest text-muted">or make an offer</p>
              </div>

              <div className="space-y-3 py-6 border-y border-border">
                <MetaRow label="Medium" value={painting.mediumName} />
                <MetaRow label="Dimensions" value={hasDimensions ? `${painting.width} × ${painting.height} cm` : undefined} />
                <MetaRow label="Year" value={painting.yearCreated ? String(painting.yearCreated) : undefined} />
                <MetaRow label="Origin" value={painting.country} />
                <MetaRow label="Orientation" value={painting.orientation} />
                <MetaRow label="Category" value={painting.categoryName} />
              </div>

              <div className="space-y-3">
                {painting.status === PaintingStatus.SOLD ? (
                  <p className="w-full text-center font-inter uppercase tracking-widest text-[12px] py-4 border border-border rounded-full text-muted">
                    Sold
                  </p>
                ) : (
                <>
                <button
                  onClick={handleOpenCheckout}
                  className="w-full ios-button-primary font-inter uppercase tracking-widest text-[12px] py-4 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Buy Now
                </button>
                <button
                  onClick={handleOpenOffer}
                  className="w-full ios-button-secondary font-inter uppercase tracking-widest text-[12px] py-4 flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  Make an Offer
                </button>
                </>
                )}
                <button
                  onClick={handleOpenMessageGallery}
                  className="w-full border border-border text-muted font-inter text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold transition-colors duration-300 flex items-center justify-center gap-2 rounded-full"
                >
                  <MessageSquare size={15} />
                  Message Gallery
                </button>
              </div>

              <div className="flex items-center gap-2 text-muted pt-4 border-t border-border font-inter text-xs">
                <Shield size={15} className="text-gold shrink-0" />
                Secure checkout — payments protected by Stripe
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* About the Artist */}
      <section className="border-t border-border py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div className="relative h-64 md:h-80 overflow-hidden rounded-[var(--ios-radius-xl)] border border-border bg-surface flex items-center justify-center">
                {artistPhoto ? (
                  <Image src={artistPhoto} alt={artistName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <span className="font-playfair text-5xl text-gold/50">{artistInitials(artistName)}</span>
                )}
              </div>
              <div className="md:col-span-2">
                <h2 className="font-playfair text-3xl text-cream mb-4">{artistName}</h2>
                <p className="font-inter text-[15px] text-muted leading-8 mb-8">{artistBio}</p>
                <Link
                  href={artistSlug ? `/artists/${artistSlug}` : '/artists'}
                  className="inline-flex items-center gap-2 ios-button-secondary font-inter text-[11px] uppercase tracking-widest px-6 py-3"
                >
                  View Artist Profile →
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Paintings — real data, same category, same PaintingCard used site-wide */}
      {related.length > 0 && (
        <section className="bg-gradient-to-b from-dark to-surface border-t border-border py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-px bg-gold" />
                <span className="font-inter text-[10px] uppercase tracking-[0.4em] text-gold">More to Discover</span>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel, i) => (
                <AnimatedSection key={rel.id} delay={i * 0.08}>
                  <PaintingCard
                    id={rel.id}
                    title={rel.title}
                    slug={rel.slug}
                    price={rel.price}
                    currency={rel.currency}
                    primaryImageUrl={rel.primaryImageUrl || FALLBACK_PAINTING_IMAGE}
                    thumbnailUrl={rel.thumbnailUrl || undefined}
                    artist={{ displayName: rel.artistName, slug: rel.artistSlug, country: rel.countryName || '' }}
                    medium={rel.mediumName || ''}
                    category={rel.categoryName || ''}
                    isOfferEnabled={rel.isOfferEnabled}
                  />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <div className="relative w-full h-full">
            <Image src={currentImage.url} alt={painting.title} fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}

      {/* Make an Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-[var(--ios-radius-xl)] p-8 w-full max-w-md"
          >
            <h3 className="font-playfair text-2xl text-cream mb-2">Make an Offer</h3>
            <p className="font-inter text-sm text-muted mb-6">
              Listed at <span className="text-gold">{painting.currency} {painting.price.toLocaleString()}</span>
            </p>
            <input
              type="number"
              placeholder="Your offer (USD)"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full bg-dark border border-border text-cream font-inter text-sm px-4 py-3 mb-4 focus:outline-none focus:border-gold transition-colors duration-300 rounded-[14px]"
            />
            <textarea
              placeholder="Message to the gallery (optional)"
              rows={3}
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="w-full bg-dark border border-border text-cream font-inter text-sm px-4 py-3 mb-6 focus:outline-none focus:border-gold transition-colors duration-300 resize-none rounded-[14px]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitOffer}
                disabled={makeOfferMutation.isPending}
                className="flex-1 ios-button-primary font-inter uppercase tracking-widest text-[12px] py-3 disabled:opacity-60"
              >
                Submit Offer
              </button>
              <button
                onClick={() => setShowOffer(false)}
                className="flex-1 border border-border text-muted font-inter text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold transition-colors duration-300 rounded-full"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Message Gallery Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-[var(--ios-radius-xl)] p-8 w-full max-w-md"
          >
            <h3 className="font-playfair text-2xl text-cream mb-2">Message Gallery</h3>
            <p className="font-inter text-sm text-muted mb-6">
              Ask a question about <span className="text-gold">{painting.title}</span>
            </p>
            <textarea
              placeholder="Write your message"
              rows={5}
              value={galleryMessage}
              onChange={(e) => setGalleryMessage(e.target.value)}
              className="w-full bg-dark border border-border text-cream font-inter text-sm px-4 py-3 mb-6 focus:outline-none focus:border-gold transition-colors duration-300 resize-none rounded-[14px]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitMessageGallery}
                disabled={createThreadMutation.isPending}
                className="flex-1 ios-button-primary font-inter uppercase tracking-widest text-[12px] py-3 disabled:opacity-60"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 border border-border text-muted font-inter text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold transition-colors duration-300 rounded-full"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Buy Now Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.form
            onSubmit={handleCheckoutSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-[var(--ios-radius-xl)] p-8 w-full max-w-2xl my-8"
          >
            <h3 className="font-playfair text-2xl text-cream mb-2">Checkout</h3>
            <p className="font-inter text-sm text-muted mb-6">
              Complete your purchase for <span className="text-gold">{painting.title}</span>
            </p>
            <p className="font-inter text-sm text-cream mb-6">
              Total: {painting.currency}{' '}
              {(checkoutOffer?.agreedAmount ?? checkoutOffer?.counterAmount ?? checkoutOffer?.offerAmount ?? painting.price).toLocaleString()}
              {checkoutOffer && <span className="text-muted"> (your accepted offer)</span>}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <input
                required
                placeholder="Full Name"
                value={checkoutData.shippingName}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingName: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={checkoutData.shippingEmail}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingEmail: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                placeholder="Phone (optional)"
                value={checkoutData.shippingPhone}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingPhone: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="Address Line 1"
                value={checkoutData.shippingAddress1}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingAddress1: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                placeholder="Address Line 2 (optional)"
                value={checkoutData.shippingAddress2}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingAddress2: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="City"
                value={checkoutData.shippingCity}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingCity: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                placeholder="State (optional)"
                value={checkoutData.shippingState}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingState: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="ZIP / Postal Code"
                value={checkoutData.shippingZip}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingZip: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="Country"
                value={checkoutData.shippingCountry}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingCountry: e.target.value }))}
                className="w-full bg-dark border border-border text-cream px-4 py-3 rounded-[14px]"
              />
            </div>

            <div className="mb-6">
              <p className="font-inter text-[11px] uppercase tracking-widest text-subtle mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutData((prev) => ({ ...prev, paymentMethod: PaymentMethod.ONLINE }))}
                  className={`border px-4 py-3 rounded-full text-sm ${
                    checkoutData.paymentMethod === PaymentMethod.ONLINE ? 'border-gold text-gold' : 'border-border text-muted'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutData((prev) => ({ ...prev, paymentMethod: PaymentMethod.BANK_TRANSFER }))}
                  className={`border px-4 py-3 rounded-full text-sm ${
                    checkoutData.paymentMethod === PaymentMethod.BANK_TRANSFER ? 'border-gold text-gold' : 'border-border text-muted'
                  }`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={buyNowMutation.isPending}
                className="flex-1 ios-button-primary font-inter uppercase tracking-widest text-[12px] py-3 disabled:opacity-60"
              >
                {buyNowMutation.isPending ? 'Processing...' : 'Place Order'}
              </button>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="flex-1 border border-border text-muted font-inter text-[11px] uppercase tracking-widest py-3 hover:border-gold hover:text-gold transition-colors duration-300 rounded-full"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-2">
      <p className="font-inter text-[11px] uppercase tracking-widest text-subtle">{label}</p>
      <p className="font-inter text-sm text-cream">{value}</p>
    </div>
  );
}
