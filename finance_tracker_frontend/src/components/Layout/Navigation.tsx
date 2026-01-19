import React from 'react';
import {
  UserIcon,
  HomeIcon,
  TrendingUpIcon,
  TargetIcon,
  ShoppingCartIcon,
  MessageCircleIcon
} from './Icons';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'profile', icon: <UserIcon />, label: 'Profile' },
    { id: 'home', icon: <HomeIcon />, label: 'Home' },
    { id: 'expenses', icon: <TrendingUpIcon />, label: 'Expenses' },
    { id: 'savings', icon: <TargetIcon />, label: 'Savings' },
    { id: 'buy', icon: <ShoppingCartIcon />, label: 'Buy' },
    { id: 'chat', icon: <MessageCircleIcon />, label: 'Chat' },
  ];

  return (
    <div style={styles.nav}>
      <div style={styles.navContent}>
        <div style={styles.navButtons}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(activeTab === item.id ? styles.navButtonActive : {}),
                ...(item.id === 'buy' ? styles.navButtonOrange : {}),
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px',
  },
  navButtons: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '12px 0',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  navButtonActive: {
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
  },
  navButtonOrange: {
    backgroundColor: '#f97316',
    color: 'white',
    border: 'none',
  },
};

export default Navigation;