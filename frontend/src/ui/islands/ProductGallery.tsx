import { useState } from 'react';

export interface ProductGalleryProps {
  /** Tomas de la galería: foto principal, en uso, detalle, video, comparativa. */
  shots: string[];
  badge?: string;
}

/** Galería de la ficha: imagen grande + miniaturas (placeholders hasta tener fotos reales). */
export default function ProductGallery({ shots, badge }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      <div className="ph relative h-[360px] md:h-[520px]" role="img" aria-label={shots[current]} data-testid="gallery-main">
        {badge && <span className="absolute top-3.5 left-3.5 bg-brand-blue text-white text-[13px] font-bold px-2.5 py-1 rounded-lg">{badge}</span>}
        [{shots[current]}]
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        {shots.map((shot, i) => (
          <button
            key={shot}
            type="button"
            aria-label={shot}
            aria-pressed={current === i}
            onClick={() => setCurrent(i)}
            className={`ph h-[84px] cursor-pointer ${current === i ? 'border-2 border-solid border-brand-blue' : ''}`}
          >
            {shot.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
