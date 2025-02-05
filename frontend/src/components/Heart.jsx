
import { Heart } from 'lucide-react';

export const Hearts = () => {
  // Create an array of 15 hearts with random positions and animations
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    scale: 0.5 + Math.random() * 0.5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float"
          style={{
            left: heart.left,
            top: '100%',
            animationDelay: heart.animationDelay,
            transform: `scale(${heart.scale})`
          }}
        >
          <Heart className="text-pink-400 opacity-50" />
        </div>
      ))}
    </div>
  );
};