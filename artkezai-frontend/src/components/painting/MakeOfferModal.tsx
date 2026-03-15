'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

interface PaintingInfo {
  id: string;
  title: string;
  price: number;
  currency: string;
}

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  painting: PaintingInfo;
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  painting,
}: MakeOfferModalProps) {
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [offerId, setOfferId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerAmount) {
      toast.error('Please enter an offer amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paintingId: painting.id,
          offerAmount: parseFloat(offerAmount),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit offer');
      }

      const data = await response.json();
      setOfferId(data.id);
      setIsSuccess(true);
      toast.success('Offer submitted successfully');

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setOfferAmount('');
        setMessage('');
      }, 3000);
    } catch (error) {
      toast.error('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setOfferAmount('');
      setMessage('');
      setIsSuccess(false);
      setOfferId('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1710] border border-[#2E2A22] max-w-md w-full p-10"
          >
            <AnimatePresence>
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                    }}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C] text-[#0F0F0F]"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>

                  <div>
                    <h3 className="font-display text-xl text-[#F5F0E8] mb-2">
                      Offer Submitted
                    </h3>
                    <p className="font-sans text-sm text-[#8A8070]">
                      Your offer ID: <span className="text-[#C9A84C] font-500">{offerId}</span>
                    </p>
                  </div>

                  <p className="font-sans text-xs text-[#5A5548]">
                    The artist will review your offer within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div>
                    <h2 className="font-display text-2xl text-[#F5F0E8] mb-1">
                      Make an Offer
                    </h2>
                    <p className="font-sans text-sm text-[#8A8070]">
                      {painting.title}
                    </p>
                  </div>

                  {/* Offer Input */}
                  <div>
                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#5A5548] block mb-3">
                      Your Offer
                    </label>
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-xs text-[#5A5548]">
                        {painting.currency}
                      </span>
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className="flex-1 font-display text-4xl text-[#C9A84C] bg-transparent border-b border-[#C9A84C] pb-2 text-center placeholder-[#5A5548] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#5A5548] block mb-3">
                      Message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the artist about your interest..."
                      rows={3}
                      className="w-full bg-[#0F0F0F] border border-[#2E2A22] text-[#F5F0E8] px-4 py-3 font-sans text-sm placeholder-[#5A5548] focus:outline-none focus:border-[#C9A84C] transition-colors duration-200 resize-none"
                    />
                  </div>

                  {/* Note */}
                  <div className="pt-4 border-t border-[#2E2A22]">
                    <p className="font-sans text-xs text-[#5A5548]">
                      Offer expires in <span className="text-[#C9A84C]">72 hours</span> ·{' '}
                      <a
                        href="#"
                        className="text-[#C9A84C] hover:text-[#d4b363] transition-colors"
                      >
                        View offer policy
                      </a>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !offerAmount}
                    className="w-full bg-[#C9A84C] text-[#0F0F0F] font-display uppercase tracking-wider py-3 h-12 font-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4b363] transition-colors duration-200"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full font-sans text-xs uppercase tracking-wider text-[#8A8070] hover:text-[#F5F0E8] transition-colors duration-200 py-2"
                  >
                    Cancel
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
