'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  MessageSquare,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { useAuthStore } from '@/lib/store/authStore';
import { usePainting, usePaintings } from '@/lib/hooks/usePaintings';
import { useBuyNowCheckout } from '@/lib/hooks/useCheckout';
import { useMakeOffer } from '@/lib/hooks/useOffers';
import { useCreateThread } from '@/lib/hooks/useMessages';
import { parseApiError } from '@/lib/api/utils';
import { PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

const FALLBACK_PAINTING_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80';
const FALLBACK_ARTIST_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80';

export default function PaintingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!painting) return;

    try {
      const result = await buyNowMutation.mutateAsync({
        paintingId: Number(painting.id),
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

      if (checkoutData.paymentMethod === PaymentMethod.ONLINE) {
        toast.success('Order created. Payment intent is ready.');
        if (result.paymentIntent?.clientSecret) {
          toast.success(`Client secret generated: ${result.paymentIntent.clientSecret.slice(0, 14)}...`);
        }
      } else {
        toast.success('Order created. Bank transfer instructions will be shared by gallery.');
      }

      setShowCheckout(false);
      router.push('/dashboard/orders');
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
      <div className="bg-[var(--color-dark)] min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ios-card p-10 text-center max-w-md"
        >
          <p className="font-playfair text-2xl text-[var(--color-cream)] mb-4">Loading painting...</p>
          <p className="font-inter text-sm text-[var(--color-muted)]">
            Fetching latest artwork details from the gallery.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isPaintingError || !painting) {
    return (
      <div className="bg-[var(--color-dark)] min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ios-card p-10 text-center max-w-md"
        >
          <p className="font-playfair text-2xl text-[var(--color-cream)] mb-4">Painting not found</p>
          <p className="font-inter text-sm text-[var(--color-muted)] mb-6">
            The painting you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 ios-button-secondary font-inter text-xs uppercase tracking-widest px-6 py-3"
          >
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>
        </motion.div>
      </div>
    );
  }

  const related = (relatedPage?.data ?? [])
    .filter((p) => p.slug !== painting.slug)
    .slice(0, 4);
  const mainImage = painting.primaryImage?.url || painting.allImages?.[0]?.url || FALLBACK_PAINTING_IMAGE;
  const artistName = painting.artist
    ? `${painting.artist.firstName} ${painting.artist.lastName}`.trim()
    : painting.artistName;
  const artistSlug = painting.artist?.slug;
  const artistBio = painting.artist?.bio || 'This artist has not added a bio yet.';

  return (
    <div className="bg-[var(--color-dark)] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
          >
            <ArrowLeft size={13} />
            Gallery
          </Link>
          <span className="text-[var(--color-border)] text-xs">/</span>
          <span className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-cream)] truncate max-w-[200px]">
            {painting.title}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

          {/* LEFT — Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="relative w-full aspect-[4/5] bg-[var(--color-surface)] overflow-hidden group rounded-[var(--ios-radius-xl)] border border-[var(--color-border)]">
              <Image
                src={mainImage}
                alt={painting.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-4 border border-[color-mix(in_srgb,var(--color-gold)_30%,transparent)] pointer-events-none" />
              <div className="absolute top-6 left-6 bg-[color-mix(in_srgb,var(--color-dark)_84%,transparent)] backdrop-blur-sm border border-[var(--color-border)] px-3 py-1.5 rounded-full">
                <span className="font-inter text-[10px] uppercase tracking-widest text-[var(--color-gold)]">
                  {painting.categoryName}
                </span>
              </div>
            </div>

            {/* About this painting */}
            <AnimatedSection delay={0.3} className="mt-12">
              <h2 className="font-playfair text-2xl text-[var(--color-cream)] mb-5">About this Painting</h2>
              <p className="font-inter text-[15px] text-[var(--color-muted)] leading-8">
                {painting.description}
              </p>
            </AnimatedSection>
          </motion.div>

          {/* RIGHT — Sticky info panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:h-fit"
          >
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl text-[var(--color-cream)] leading-tight mb-3">
                  {painting.title}
                </h1>
                <Link
                  href={artistSlug ? `/artists/${artistSlug}` : '/artists'}
                  className="font-inter text-sm text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
                >
                  by <span className="font-semibold">{artistName}</span>
                </Link>
              </div>

              <div className="h-px bg-[var(--color-border)]" />

              {/* Price */}
              <div>
                <p className="font-playfair text-4xl text-[var(--color-gold)] mb-1">
                  ${painting.price.toLocaleString()}
                </p>
                <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                  {painting.currency} · or make an offer
                </p>
              </div>

              {/* Metadata */}
              <div className="space-y-3 py-6 border-y border-[var(--color-border)]">
                <MetaRow label="Medium" value={painting.mediumName} />
                <MetaRow label="Dimensions" value={`${painting.width} × ${painting.height} cm`} />
                <MetaRow label="Year" value={String(painting.yearCreated)} />
                <MetaRow label="Origin" value={painting.country} />
                <MetaRow label="Orientation" value={painting.orientation} />
                <MetaRow label="Category" value={painting.categoryName} />
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full ios-button-primary font-playfair uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Buy Now
                </button>
                <button
                  onClick={handleOpenOffer}
                  className="w-full ios-button-secondary font-playfair uppercase tracking-widest text-sm py-4 flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Make an Offer
                </button>
                <button
                  onClick={handleOpenMessageGallery}
                  className="w-full border border-[var(--color-border)] text-[var(--color-muted)] font-inter text-xs uppercase tracking-widest py-3 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors flex items-center justify-center gap-2 rounded-full"
                >
                  <MessageSquare size={16} />
                  Message Gallery
                </button>
              </div>

              {/* Trust signals */}
              <div className="space-y-3 pt-4 border-t border-[var(--color-border)] text-xs">
                <div className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Shield size={15} className="text-[var(--color-gold)] shrink-0" />
                  Secure checkout — all transactions protected
                </div>
                <div className="flex items-center gap-2 text-[var(--color-muted)]">
                  <RotateCcw size={15} className="text-[var(--color-gold)] shrink-0" />
                  Certificate of authenticity included
                </div>
                <div className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Truck size={15} className="text-[var(--color-gold)] shrink-0" />
                  Professional art shipping arranged
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* About the Artist */}
      <section className="border-t border-[var(--color-border)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div className="relative h-80 overflow-hidden group rounded-[var(--ios-radius-xl)] border border-[var(--color-border)]">
                <Image
                  src={painting.artist?.profileImageUrl || FALLBACK_ARTIST_IMAGE}
                  alt={artistName}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="font-playfair text-3xl text-[var(--color-cream)] mb-2">
                  {artistName}
                </h2>
                <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)] mb-6">
                  From {painting.country}
                </p>
                <p className="font-inter text-[15px] text-[var(--color-muted)] leading-8 mb-8">
                  {artistBio}
                </p>
                <Link
                  href={artistSlug ? `/artists/${artistSlug}` : '/artists'}
                  className="inline-flex items-center gap-2 ios-button-secondary font-inter text-xs uppercase tracking-widest px-6 py-3"
                >
                  View Artist Profile →
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Paintings */}
      {related.length > 0 && (
        <section className="bg-gradient-to-b from-[var(--color-dark)] to-[var(--color-surface)] border-t border-[var(--color-border)] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection delay={0.1}>
              <h2 className="font-playfair text-3xl text-[var(--color-cream)] mb-10">You Might Also Like</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel, i) => (
                <AnimatedSection key={rel.id} delay={i * 0.1}>
                  <Link href={`/painting/${rel.slug}`}>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden group cursor-pointer rounded-[var(--ios-radius-lg)]">
                      <div className="relative w-full aspect-[3/4] overflow-hidden">
                        <Image
                          src={rel.primaryImage?.url || FALLBACK_PAINTING_IMAGE}
                          alt={rel.title}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      </div>
                      <div className="p-4 space-y-1">
                        <h3 className="font-playfair text-sm text-[var(--color-cream)]">{rel.title}</h3>
                        <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                          {rel.artistName}
                        </p>
                        <p className="font-inter text-sm text-[var(--color-gold)]">
                          ${rel.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Make an Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--ios-radius-xl)] p-8 w-full max-w-md"
          >
            <h3 className="font-playfair text-2xl text-[var(--color-cream)] mb-2">Make an Offer</h3>
            <p className="font-inter text-sm text-[var(--color-muted)] mb-6">
              Listed at{' '}
              <span className="text-[var(--color-gold)]">${painting.price.toLocaleString()}</span>
            </p>
            <input
              type="number"
              placeholder="Your offer (USD)"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] font-inter text-sm px-4 py-3 mb-4 focus:outline-none focus:border-[var(--color-gold)] transition-colors rounded-[14px]"
            />
            <textarea
              placeholder="Message to the gallery (optional)"
              rows={3}
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] font-inter text-sm px-4 py-3 mb-6 focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none rounded-[14px]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitOffer}
                disabled={makeOfferMutation.isPending}
                className="flex-1 ios-button-primary font-playfair uppercase tracking-widest text-sm py-3 disabled:opacity-60"
              >
                Submit Offer
              </button>
              <button
                onClick={() => setShowOffer(false)}
                className="flex-1 border border-[var(--color-border)] text-[var(--color-muted)] font-inter text-xs uppercase tracking-widest py-3 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors rounded-full"
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
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--ios-radius-xl)] p-8 w-full max-w-md"
          >
            <h3 className="font-playfair text-2xl text-[var(--color-cream)] mb-2">Message Gallery</h3>
            <p className="font-inter text-sm text-[var(--color-muted)] mb-6">
              Ask a question about <span className="text-[var(--color-gold)]">{painting.title}</span>
            </p>
            <textarea
              placeholder="Write your message"
              rows={5}
              value={galleryMessage}
              onChange={(e) => setGalleryMessage(e.target.value)}
              className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] font-inter text-sm px-4 py-3 mb-6 focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none rounded-[14px]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitMessageGallery}
                disabled={createThreadMutation.isPending}
                className="flex-1 ios-button-primary font-playfair uppercase tracking-widest text-sm py-3 disabled:opacity-60"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 border border-[var(--color-border)] text-[var(--color-muted)] font-inter text-xs uppercase tracking-widest py-3 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors rounded-full"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Buy Now Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <motion.form
            onSubmit={handleCheckoutSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--ios-radius-xl)] p-8 w-full max-w-2xl"
          >
            <h3 className="font-playfair text-2xl text-[var(--color-cream)] mb-2">Checkout</h3>
            <p className="font-inter text-sm text-[var(--color-muted)] mb-6">
              Complete your purchase for{' '}
              <span className="text-[var(--color-gold)]">{painting.title}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <input
                required
                placeholder="Full Name"
                value={checkoutData.shippingName}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingName: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={checkoutData.shippingEmail}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingEmail: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                placeholder="Phone (optional)"
                value={checkoutData.shippingPhone}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingPhone: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="Address Line 1"
                value={checkoutData.shippingAddress1}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingAddress1: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                placeholder="Address Line 2 (optional)"
                value={checkoutData.shippingAddress2}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingAddress2: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="City"
                value={checkoutData.shippingCity}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingCity: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                placeholder="State (optional)"
                value={checkoutData.shippingState}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingState: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="ZIP / Postal Code"
                value={checkoutData.shippingZip}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingZip: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
              <input
                required
                placeholder="Country"
                value={checkoutData.shippingCountry}
                onChange={(e) => setCheckoutData((prev) => ({ ...prev, shippingCountry: e.target.value }))}
                className="w-full bg-[var(--color-dark)] border border-[var(--color-border)] text-[var(--color-cream)] px-4 py-3 rounded-[14px]"
              />
            </div>

            <div className="mb-6">
              <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-subtle)] mb-2">
                Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutData((prev) => ({ ...prev, paymentMethod: PaymentMethod.ONLINE }))}
                  className={`border px-4 py-3 rounded-full text-sm ${
                    checkoutData.paymentMethod === PaymentMethod.ONLINE
                      ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted)]'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutData((prev) => ({ ...prev, paymentMethod: PaymentMethod.BANK_TRANSFER }))}
                  className={`border px-4 py-3 rounded-full text-sm ${
                    checkoutData.paymentMethod === PaymentMethod.BANK_TRANSFER
                      ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted)]'
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
                className="flex-1 ios-button-primary font-playfair uppercase tracking-widest text-sm py-3 disabled:opacity-60"
              >
                {buyNowMutation.isPending ? 'Processing...' : 'Place Order'}
              </button>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="flex-1 border border-[var(--color-border)] text-[var(--color-muted)] font-inter text-xs uppercase tracking-widest py-3 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors rounded-full"
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2">
      <p className="font-inter text-[11px] uppercase tracking-widest text-[var(--color-subtle)]">{label}</p>
      <p className="font-inter text-sm text-[var(--color-cream)]">{value}</p>
    </div>
  );
}
