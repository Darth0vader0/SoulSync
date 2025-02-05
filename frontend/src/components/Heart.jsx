import React from 'react';
import { Heart } from 'lucide-react';

export const Hearts = () => {
  // Create an array of hearts with random positions and animations
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 10}s`,
    size: Math.random() * 30 + 16, // Random size between 16px and 32px
    opacity: Math.random() * 0.5 + 0.5 // Random opacity between 0.3 and 0.8
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float"
          style={{
            left: heart.left,
            bottom: '-20px', // Start slightly below the viewport
            animationDelay: heart.animationDelay,
            width: `${heart.size}px`,
            height: `${heart.size}px`
          }}
        >
          <Heart 
            className="text-red-600" 
            style={{ 
              opacity: heart.opacity,
              width: '100%',
              height: '100%'
            }} 
          />
        </div>
      ))}
    </div>
  );
};