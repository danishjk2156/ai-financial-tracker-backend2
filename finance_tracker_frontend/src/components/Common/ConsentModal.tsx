import React from 'react';

interface ConsentModalProps {
  onAccept: () => void;
  onDeny: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ onAccept, onDeny }) => {
  return (
    <>
      <div style={styles.overlay} onClick={onDeny} />
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.iconContainer}>
            <span style={styles.icon}>🔒</span>
          </div>
          <h2 style={styles.title}>Data Usage Consent</h2>
        </div>
        
        <div style={styles.modalBody}>
          <p style={styles.description}>
            To provide you with personalized financial advice, our AI assistant needs access to your financial data including:
          </p>
          
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span> Monthly income and expenses
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span> Savings goals
            </li>
            <li style={styles.listItem}>
              <span style={styles.bullet}>•</span> Transaction history
            </li>
          </ul>
          
          <p style={styles.note}>
            <strong>Your data is safe:</strong> All information is processed locally and never shared with third parties. You can deny access and still use the app, but AI features will be limited.
          </p>
        </div>
        
        <div style={styles.modalFooter}>
          <button 
            onClick={onDeny} 
            style={styles.denyButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Deny
          </button>
          <button 
            onClick={onAccept} 
            style={styles.acceptButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          >
            Allow & Continue
          </button>
        </div>
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    width: '90%',
    zIndex: 9999,
    padding: '32px',
  },
  modalHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  iconContainer: {
    marginBottom: '16px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  modalBody: {
    marginBottom: '24px',
  },
  description: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 16px 0',
  },
  listItem: {
    fontSize: '14px',
    color: '#374151',
    padding: '8px 0',
    paddingLeft: '24px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
  },
  bullet: {
    position: 'absolute',
    left: 0,
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  note: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.6',
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '8px',
    margin: 0,
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  denyButton: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  acceptButton: {
    padding: '12px 24px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default ConsentModal;
