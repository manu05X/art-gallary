"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './WaveGallery.module.css';

const MIDJOURNEY_IMAGES = [
  'https://cdn.midjourney.com/b4f5c014-d534-476c-916d-7f9addc9eb19/0_0.png',
  'https://cdn.midjourney.com/7e50b758-693d-4710-a4fb-d7c94a6ebd1f/0_0.png',
  'https://cdn.midjourney.com/3994c537-cbdf-4b64-8787-687d655e3af9/0_0.png',
  'https://cdn.midjourney.com/4cda6391-7160-4cde-85a0-4d8a076b6832/0_0.png',
  'https://cdn.midjourney.com/0a17fedc-5a8e-42e4-8d2d-d46674b4ca5e/0_0.png',
  'https://cdn.midjourney.com/f9ceb9f8-f7a8-4bf8-bcf9-0120cf04f935/0_0.png',
  'https://cdn.midjourney.com/8e45e246-d424-40e7-a2c3-c4e0ac82162f/0_0.png',
  'https://cdn.midjourney.com/6e325959-82f9-46f1-9f68-8c19a283c3be/0_0.png',
] as const;

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=80',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=900&q=80',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=900&q=80',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=900&q=80',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=900&q=80',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=900&q=80',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&q=80',
] as const;

const SLOTS = 12;

type WaveGalleryProps = {
  variant?: 'section' | 'editorial';
};

export function WaveGallery({ variant = 'section' }: WaveGalleryProps) {
  const [blockedIndices, setBlockedIndices] = useState<Record<number, boolean>>({});

  const images = useMemo(
    () => Array.from({ length: SLOTS }, (_, index) => MIDJOURNEY_IMAGES[index % MIDJOURNEY_IMAGES.length]),
    [],
  );

  const getImageSrc = (index: number, primary: string) => {
    if (blockedIndices[index]) {
      return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    }
    return primary;
  };

  const handleImageError = (index: number) => {
    setBlockedIndices((current) => (current[index] ? current : { ...current, [index]: true }));
  };

  const isEditorial = variant === 'editorial';

  return (
    <section
      className={`${styles.section} ${isEditorial ? styles.sectionEditorial : ''}`}
      aria-label="Wave gallery showcase"
    >
      <div className={`${styles.frame} ${isEditorial ? styles.frameEditorial : ''}`}>
        {images.map((src, index) => (
          <figure
            key={`${src}-${index}`}
            className={`${styles.item} ${isEditorial ? styles.itemEditorial : ''}`}
            style={
              {
                '--page-tilt': `${((index % 5) - 2) * 1.5}deg`,
                '--page-drop': `${Math.abs((index % 5) - 2) * 2.5}px`,
              } as React.CSSProperties
            }
          >
            <Image
              src={getImageSrc(index, src)}
              alt={`Wave artwork ${index + 1}`}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 42vw, (max-width: 1200px) 22vw, 15vw"
              onError={() => handleImageError(index)}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
