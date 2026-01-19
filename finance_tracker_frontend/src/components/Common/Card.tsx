import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, style, className }) => {
  return (
    <div style={{ ...styles.card, ...style }} className={className}>
      {children}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    padding: '32px',
  },
};

export default Card;