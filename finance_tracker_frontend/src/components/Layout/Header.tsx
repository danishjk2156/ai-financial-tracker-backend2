import React from 'react';
import { WalletIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.headerFlex}>
          <div style={styles.logo}>
            <WalletIcon size={32} />
          </div>
          <div>
            <h1 style={styles.title}>PaisaWise</h1>
            <p style={styles.subtitle}>Your AI-powered money guide for smart savings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e5e7eb',
  },
  headerContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  headerFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  logo: {
    width: '56px',
    height: '56px',
    backgroundColor: '#16a34a',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

export default Header;