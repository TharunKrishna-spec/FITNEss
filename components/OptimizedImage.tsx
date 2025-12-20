import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' 
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setLoaded(true);
    }
  };

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        loading="lazy"
      />
      {error && (
        <div className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg">
          <ImageOff size={16} className="text-slate-400" />
        </div>
      )}
    </div>
  );
};
