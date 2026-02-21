import React from 'react';
import { TargetIcon, SparklesIcon, CheckIcon } from '../Layout/Icons';
import Card from '../Common/Card';
import Button from '../Common/Button';
import type { Profile, Expense } from '../Types';

interface SavingsPageProps {
  profile: Profile;
  expenses: Expense[];
  setActiveTab: (tab: string) => void;
}

const SavingsPage: React.FC<SavingsPageProps> = ({ profile, expenses, setActiveTab }) => {
  const availableToSave = profile.monthlyIncome - profile.fixedExpenses -
    expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div>
      <div style={styles.statsGrid}>
        <Card>
          <div style={styles.helperText}>Savings Goal</div>
          <div style={styles.statValueLarge}>₹{profile.savingsGoal.toLocaleString()}</div>
          <div style={styles.helperText}>Monthly target</div>
        </Card>

        <Card>
          <div style={styles.helperText}>Current Savings</div>
          <div style={styles.statValueGreen}>₹{availableToSave.toLocaleString()}</div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min((availableToSave / profile.savingsGoal) * 100, 100)}%`
            }}></div>
          </div>
          <div style={styles.helperText}>{Math.round((availableToSave / profile.savingsGoal) * 100)}% of goal</div>
        </Card>

      </div>

      <Card style={{ marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <TargetIcon />
          <h3 style={styles.cardHeaderTitle}>Savings Breakdown</h3>
        </div>
        <p style={styles.helperText}>Track your savings progress this month</p>

        <div style={{ marginTop: '16px' }}>
          <div style={styles.breakdownItem}>
            <span>Available Income</span>
            <span style={styles.breakdownValue}>₹{availableToSave.toLocaleString()}</span>
          </div>

          <div style={styles.breakdownItem}>
            <span>Variable Spending</span>
            <span style={styles.breakdownValueRed}>-₹{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
          </div>

          <div style={styles.savingsResultCard}>
            <div>
              <div style={styles.savingsResultTitle}>Net Savings</div>
              <div style={styles.savingsResultSubtitle}>Remaining this month</div>
            </div>
            <div style={styles.savingsResultAmount}>
              ₹{availableToSave.toLocaleString()}
            </div>
          </div>

          {availableToSave >= profile.savingsGoal && (
            <div style={styles.successAlert}>
              <CheckIcon /> <span style={{ fontWeight: 500 }}>Goal Met! 🎉</span>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <SparklesIcon />
          <h3 style={styles.cardHeaderTitle}>AI Savings Tips</h3>
        </div>
        <p style={styles.insightText}>Personalized advice to boost your savings</p>
        <Button variant="dark" onClick={() => setActiveTab('chat')}>
          <SparklesIcon /> Get Personalized Savings Tips
        </Button>
      </Card>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  helperText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  statValueLarge: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '8px 0',
  },
  statValueGreen: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#16a34a',
    margin: '8px 0',
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    height: '8px',
    margin: '12px 0',
  },
  progressFill: {
    backgroundColor: '#16a34a',
    height: '8px',
    borderRadius: '9999px',
    transition: 'width 0.3s',
  },
  progressFillOrange: {
    backgroundColor: '#f97316',
    height: '8px',
    borderRadius: '9999px',
    transition: 'width 0.3s',
  },
  alertBlue: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '24px',
    color: '#1e3a8a',
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: '8px',
  },
  alertText: {
    fontSize: '14px',
    color: '#1e40af',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  cardHeaderTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '12px',
    color: '#374151',
  },
  breakdownValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  breakdownValueRed: {
    fontWeight: 'bold',
    color: '#dc2626',
  },
  savingsResultCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  savingsResultTitle: {
    fontWeight: 'bold',
    color: '#166534',
  },
  savingsResultSubtitle: {
    fontSize: '14px',
    color: '#15803d',
  },
  savingsResultAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#16a34a',
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#166534',
  },
  insightText: {
    color: '#374151',
    marginBottom: '16px',
  },
};

export default SavingsPage;