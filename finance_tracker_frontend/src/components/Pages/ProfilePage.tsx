import React from 'react';
import Card from '../Common/Card';
import type { Profile } from '../Types';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePageProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, setProfile }) => {
  const { user } = useAuth();

  return (
    <div style={styles.profileContainer}>
      <Card>
        <h2 style={styles.cardTitle}>Update Your Profile</h2>
        <p style={styles.cardSubtitle}>Tell us about your finances to get personalized advice</p>

        <div style={styles.formGroup}>
          <label style={styles.label}>👤 Name</label>
          <input
            type="text"
            value={user?.name || ''}
            style={{...styles.input, backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
            disabled
            readOnly
          />
          <p style={styles.helperText}>Your name (cannot be changed)</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>💰 Monthly Income</label>
          <input
            type="number"
            value={profile.monthlyIncome}
            onChange={(e) => setProfile({...profile, monthlyIncome: parseInt(e.target.value) || 0})}
            style={styles.input}
            placeholder="0"
          />
          <p style={styles.helperText}>Your total monthly income after tax</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>💸 Fixed Monthly Expenses</label>
          <input
            type="number"
            value={profile.fixedExpenses}
            onChange={(e) => setProfile({...profile, fixedExpenses: parseInt(e.target.value) || 0})}
            style={styles.input}
            placeholder="0"
          />
          <p style={styles.helperText}>Rent, EMI, school fees, utilities</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>🎯 Monthly Savings Goal</label>
          <input
            type="number"
            value={profile.savingsGoal}
            onChange={(e) => setProfile({...profile, savingsGoal: parseInt(e.target.value) || 0})}
            style={styles.input}
            placeholder="0"
          />
          <p style={styles.helperText}>How much you want to save each month</p>
        </div>

        <button style={styles.primaryButton}>Update Profile</button>
      </Card>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  profileContainer: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  helperText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default ProfilePage;