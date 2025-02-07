import { useState, useEffect } from 'react';

const FloatingPiece = ({ piece, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);
  const [direction, setDirection] = useState({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + direction.x;
        const newY = prev.y + direction.y;

        // Bounce off walls
        if (newX <= 0 || newX >= 90) {
          setDirection(d => ({ ...d, x: -d.x }));
        }
        if (newY <= 0 || newY >= 90) {
          setDirection(d => ({ ...d, y: -d.y }));
        }

        return {
          x: Math.max(0, Math.min(90, newX)),
          y: Math.max(0, Math.min(90, newY))
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      className="absolute opacity-10 transition-transform duration-300 ease-in-out"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%) rotate(var(--rotation))',
        '--rotation': `${Math.atan2(direction.y, direction.x)}rad`
      }}
    >
      {piece}
    </div>
  );
};

const ChessBackground = () => {
  const pieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const initialPositions = pieces.map(() => ({
    x: Math.random() * 90,
    y: Math.random() * 90
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece, index) => (
        <FloatingPiece
          key={index}
          piece={<span className="text-4xl">{piece}</span>}
          initialPosition={initialPositions[index]}
        />
      ))}
    </div>
  );
};

export default ChessBackground;