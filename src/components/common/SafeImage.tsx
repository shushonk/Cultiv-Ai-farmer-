import React, { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCrop?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<Props> = ({
  src,
  alt,
  fallbackCrop = 'Crop Specimen',
  fallbackTitle,
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false);

  // High quality SVG Data URI for leaf foliage fallback
  const defaultSvgFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="400" height="300" fill="%230b1324"/><path d="M 200 40 C 110 100 80 200 200 260 C 320 200 290 100 200 40 Z" fill="%2310b981" opacity="0.2" stroke="%2334d399" stroke-width="3"/><path d="M 200 40 L 200 260 M 200 100 L 140 140 M 200 140 L 260 180 M 200 180 L 150 220 M 200 210 L 250 240" stroke="%2334d399" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="160" cy="120" r="14" fill="%23f59e0b" opacity="0.6"/><circle cx="160" cy="120" r="8" fill="%23ef4444" opacity="0.8"/><circle cx="230" cy="180" r="18" fill="%23f59e0b" opacity="0.6"/><circle cx="230" cy="180" r="10" fill="%23ef4444" opacity="0.8"/><text x="200" y="280" font-family="sans-serif" font-size="12" font-weight="bold" fill="%2394a3b8" text-anchor="middle">${encodeURIComponent(fallbackCrop || 'Foliage Specimen')}</text></svg>`;

  if (!src || error) {
    return (
      <div className={`relative bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center overflow-hidden ${className}`}>
        <img
          src={defaultSvgFallback}
          alt={alt || fallbackCrop}
          className="w-full h-full object-cover"
        />
        {fallbackTitle && (
          <span className="absolute bottom-2 left-2 right-2 text-[10px] bg-slate-900/90 text-slate-300 px-2 py-1 rounded border border-slate-700 truncate shadow">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || fallbackCrop}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
};
