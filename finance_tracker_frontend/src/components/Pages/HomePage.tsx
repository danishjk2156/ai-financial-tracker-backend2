import React from 'react';
import { TrendingUpIcon, AlertCircleIcon, CheckIcon, SparklesIcon, ShoppingCartIcon } from '../Layout/Icons';
import Card from '../Common/Card';
import Button from '../Common/Button';
import type { Profile, Expense } from '../Types';

interface HomePageProps {
  profile: Profile;
  expenses: Expense[];
  setActiveTab: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ profile, expenses, setActiveTab }) => {
  const availableToSave = profile.monthlyIncome - profile.fixedExpenses - 
    expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getMonthlyInsights = (): string => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory && topCategory[1] > 5000) {
      return `You spent ₹${topCategory[1]} on ${topCategory[0]} this month. Reducing it by 20% can save ₹${Math.floor(topCategory[1] * 0.2)}.`;
    }
    
    return "Track more expenses to get personalized insights!";
  };

  return (
    <div>
      <div style={styles.overviewCard}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>
              <TrendingUpIcon />
              <span style={{ marginLeft: '8px' }}>Monthly Income</span>
            </div>
            <div style={styles.statValueGreen}>₹{profile.monthlyIncome.toLocaleString()}</div>
          </div>
          <div>
            <div style={styles.statLabel}>
              <AlertCircleIcon />
              <span style={{ marginLeft: '8px' }}>Total Expenses</span>
            </div>
            <div style={styles.statValueOrange}>
              ₹{(profile.fixedExpenses + expenses.reduce((s, e) => s + e.amount, 0)).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={styles.savingsCard}>
          <div style={styles.savingsHeader}>
            <span style={styles.savingsLabel}>Available to Save</span>
            <span style={styles.savingsValue}>₹{availableToSave.toLocaleString()}</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min((availableToSave / profile.savingsGoal) * 100, 100)}%`
            }}></div>
          </div>
          <p style={styles.progressText}>
            {availableToSave >= profile.savingsGoal ? (
              <>
                <CheckIcon /> Savings goal achieved! 🎉
              </>
            ) : (
              `${Math.round((availableToSave / profile.savingsGoal) * 100)}% of goal`
            )}
          </p>
        </div>
      </div>

      <Card style={{ marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <SparklesIcon />
          <h3 style={styles.cardHeaderTitle}>This Month's Spending</h3>
        </div>

        {expenses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No expenses recorded this month</p>
            <Button onClick={() => setActiveTab('expenses')}>
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div>
            {expenses.slice(0, 5).map(exp => (
              <div key={exp.id} style={styles.expenseItem}>
                <div>
                  <div style={styles.expenseCategory}>{exp.category}</div>
                  <div style={styles.expenseDesc}>{exp.description || 'No description'}</div>
                </div>
                <div style={styles.expenseRight}>
                  <div style={styles.expenseAmount}>₹{exp.amount}</div>
                  <div style={styles.expenseDate}>{exp.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <SparklesIcon />
          <h3 style={styles.cardHeaderTitle}>Smart Tips for You</h3>
        </div>
        <p style={styles.insightText}>{getMonthlyInsights()}</p>
        <Button variant="dark" onClick={() => setActiveTab('chat')}>
          <SparklesIcon /> Get Personalized Savings Tips
        </Button>
      </Card>

      <div style={styles.buyBanner}>
        <div style={styles.buyBannerHeader}>
          <ShoppingCartIcon />
          <h3 style={styles.buyBannerTitle}>Before You Buy - Check Here!</h3>
        </div>
        <p style={styles.buyBannerText}>Compare prices online before making any purchase</p>
        <Button variant="white" onClick={() => setActiveTab('buy')}>
          Compare Prices Now
        </Button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overviewCard: {
    background: 'linear-gradient(to right, #f0fdf4, #eff6ff)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #bbf7d0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  statLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValueGreen: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#16a34a',
  },
  statValueOrange: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#f97316',
  },
  savingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
  },
  savingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  savingsLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  savingsValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#16a34a',
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    height: '12px',
    marginBottom: '8px',
  },
  progressFill: {
    backgroundColor: '#16a34a',
    height: '12px',
    borderRadius: '9999px',
    transition: 'width 0.3s',
  },
  progressText: {
    fontSize: '14px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
  emptyState: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyText: {
    color: '#9ca3af',
    marginBottom: '16px',
  },
  expenseItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  expenseCategory: {
    fontWeight: 500,
    color: '#111827',
  },
  expenseDesc: {
    fontSize: '14px',
    color: '#6b7280',
  },
  expenseRight: {
    textAlign: 'right',
  },
  expenseAmount: {
    fontWeight: 'bold',
    color: '#111827',
  },
  expenseDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  insightText: {
    color: '#374151',
    marginBottom: '16px',
  },
  buyBanner: {
    background: 'linear-gradient(to right, #f97316, #dc2626)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    marginTop: '24px',
  },
  buyBannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  buyBannerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  buyBannerText: {
    marginBottom: '16px',
    opacity: 0.9,
  },
};

export default HomePage;