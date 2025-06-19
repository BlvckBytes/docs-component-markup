import React from 'react';

type ColorSquareProps = {
  color: string;
};

const ColorSquare: React.FC<ColorSquareProps> = ({ color }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '1.3rem',
        height: '1.3rem',
        backgroundColor: color,
        borderRadius: '0.3rem',
        verticalAlign: 'middle',
      }}
      aria-label={`Color square: ${color}`}
      title={color}
    />
  );
};

export default ColorSquare;
