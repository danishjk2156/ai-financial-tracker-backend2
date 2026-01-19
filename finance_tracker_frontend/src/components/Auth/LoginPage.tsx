import React, { useState } from 'react';
import { WalletIcon, MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from '../Layout/Icons';
import { useAuth } from '../../contexts/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToRegister,
  onLoginSuccess,
}) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(credentials.email, credentials.password);
    setLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <>
      <style>{`
        .login-container {
          position: fixed;
          inset: 0;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          overflow: auto;
        }
        .login-card {
          background-color: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          padding: 40px;
          width: 90%;
          max-width: 460px;
        }
        .login-form-section {
          width: 100%;
        }
        .login-visual-section {
          display: none;
        }
        @media (min-width: 1024px) {
          .login-container {
            padding: 0;
            height: 100vh;
          }
          .login-card {
            max-width: 1200px;
            width: 100%;
            height: 100vh;
            padding: 0;
            display: flex;
            flex-direction: row;
            overflow: hidden;
            border-radius: 0;
          }
          .login-form-section {
            flex: 1;
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow-y: auto;
          }
          .login-form-section > div {
            width: 100%;
            max-width: 400px;
          }
          .login-form-section form {
            width: 100%;
          }
          .login-visual-section {
            display: flex;
            flex: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            color: white;
          }
        }
      `}</style>
      <div className="login-container">
        <div className="login-card">
          <div className="login-form-section">
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <WalletIcon size={40} />
          </div>
          <h1 style={styles.title}>Welcome to PaisaWise</h1>
          <p style={styles.subtitle}>Sign in to manage your finances</p>
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
              <MailIcon size={16} />
              <span style={{ marginLeft: 8 }}>Email Address</span>
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <LockIcon size={16} />
              <span style={{ marginLeft: 8 }}>Password</span>
            </label>
            <div style={styles.passwordInputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                style={styles.passwordInput}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <button
            type="button"
            onClick={onSwitchToRegister}
            style={styles.switchButton}
          >
            <UserIcon size={16} />
            <span style={{ marginLeft: 8 }}>Create New Account</span>
          </button>
        </form>
          </div>
          <div className="login-visual-section">
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...styles.logo, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '32px' }}>
                <WalletIcon size={60} />
              </div>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>
                PaisaWise
              </h1>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
                Your Personal Finance Manager
              </p>
              <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
                <p>✓ Track your expenses</p>
                <p>✓ Manage your savings</p>
                <p>✓ Get financial advice</p>
                <p>✓ Make smart decisions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px',
    width: '100%',
  },
  logo: {
    width: '80px',
    height: '80px',
    backgroundColor: '#16a34a',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
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
    width: '100%',
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
    outline: 'none',
    boxSizing: 'border-box',
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
    padding: '14px 48px 14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'color 0.2s',
    zIndex: 1,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
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
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  divider: {
    textAlign: 'center',
    margin: '10px 0',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: '14px',
  },
  switchButton: {
    backgroundColor: '#ffffff',
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
  },
};

export default LoginPage;
