import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'white' | 'danger';
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  style,
  type = 'button',
  disabled = false,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'dark':
        return styles.darkButton;
      case 'white':
        return styles.whiteButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...getVariantStyle(), ...style }}
    >
      {children}
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  primaryButton: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
  darkButton: {
    backgroundColor: '#111827',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
  whiteButton: {
    backgroundColor: 'white',
    color: '#f97316',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'background-color 0.2s',
  },
};

export default Button;