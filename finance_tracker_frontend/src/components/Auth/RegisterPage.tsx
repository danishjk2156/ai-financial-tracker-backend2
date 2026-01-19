import React, { useState } from 'react';
import { WalletIcon, UserIcon, MailIcon, LockIcon, ArrowLeftIcon } from '../Layout/Icons';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const success = await register(formData.name, formData.email, formData.password);
    setLoading(false);

    if (success) {
      onRegisterSuccess();
    } else {
      setError('Email already registered');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <WalletIcon size={40} />
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join PaisaWise to manage your finances</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorAlert}>
              <div style={styles.errorIcon}>!</div>
              <span>{error}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <UserIcon size={16} />
              <span style={{ marginLeft: '8px' }}>Full Name</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              placeholder="Enter your name"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <MailIcon size={16} />
              <span style={{ marginLeft: '8px' }}>Email Address</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <LockIcon size={16} />
              <span style={{ marginLeft: '8px' }}>Password</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.input}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <LockIcon size={16} />
              <span style={{ marginLeft: '8px' }}>Confirm Password</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              style={styles.input}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <button
            type="button"
            onClick={onSwitchToLogin}
            style={styles.switchButton}
          >
            <ArrowLeftIcon size={16} />
            <span style={{ marginLeft: '8px' }}>Back to Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    width: '80px',
    height: '80px',
    backgroundColor: '#16a34a',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#dc2626',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '8px 0',
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 16px',
    color: '#9ca3af',
    fontSize: '14px',
  },
  switchButton: {
    backgroundColor: 'white',
    color: '#374151',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    border: '2px solid #d1d5db',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
};

export default RegisterPage;