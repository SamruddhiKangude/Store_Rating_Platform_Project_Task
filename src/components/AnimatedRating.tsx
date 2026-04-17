'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedRatingProps {
  rating: number; // e.g., 3.5, 4, 5
  label?: string;
  count?: number;
}

const AnimatedRating: React.FC<AnimatedRatingProps> = ({ rating, label, count }) => {
  const [displayRating, setDisplayRating] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < rating) {
        current += 0.5;
        if (current > rating) current = rating;
        setDisplayRating(current);
      } else {
        clearInterval(interval);
      }
    }, 400); // 400ms delay for each 0.5 step (one-by-one feel)

    return () => clearInterval(interval);
  }, [rating]);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let starType = 'empty';
      if (i <= displayRating) {
        starType = 'full';
      } else if (i - 0.5 <= displayRating) {
        starType = 'half';
      }

      stars.push(
        <span
          key={i}
          className={`text-4xl transition-all duration-300 transform ${
            starType !== 'empty' ? 'text-yellow-400 scale-110' : 'text-gray-400 opacity-30 shadow-none'
          }`}
          style={{
            textShadow: starType !== 'empty' ? '0 0 15px rgba(250, 204, 21, 0.6)' : 'none',
          }}
        >
          {starType === 'full' ? '★' : starType === 'half' ? '⯪' : '★'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-sm transition-all hover:border-white/20">
      {label && <h3 className="text-white text-lg font-light tracking-wider mb-4 uppercase">{label}</h3>}
      <div className="flex gap-2 mb-4">
        {renderStars()}
      </div>
      <div className="text-white text-5xl font-bold tracking-tighter">
        {displayRating.toFixed(1)}
        <span className="text-xl text-white/40 ml-2 font-normal">/ 5.0</span>
      </div>
      {count && <p className="text-white/40 text-sm mt-2">{count} reviews</p>}
    </div>
  );
};

export default AnimatedRating;
