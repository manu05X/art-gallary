'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageItem {
  url: string;
  thumbnailUrl?: string;
  id: string;
  isPrimary?: boolean;
}

interface ImageViewerProps {
  images: ImageItem[];
  title: string;
}

export default function ImageViewer({ images, title }: ImageViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    images.findIndex((img) => img.isPrimary) || 0
  );
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        onClick={() => setIsZoomOpen(true)}
        className="relative w-full bg-[#0F0F0F] cursor-zoom-in overflow-hidden"
        style={{ height: '70vh' }}
      >
        <Image
          src={currentImage.url}
          alt={title}
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <motion.button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 relative border-2 transition-all duration-300 ${
              index === selectedIndex
                ? 'border-[#C9A84C]'
                : 'border-[#2E2A22] hover:border-[#5A5548]'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative w-20 h-20">
              <Image
                src={image.thumbnailUrl || image.url}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomOpen(false)}
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.95)] backdrop-blur-sm flex items-center justify-center"
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#F5F0E8] hover:text-[#C9A84C] transition-colors duration-200"
            >
              <X size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full h-full flex items-center justify-center p-6"
            >
              <Image
                src={currentImage.url}
                alt={title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
