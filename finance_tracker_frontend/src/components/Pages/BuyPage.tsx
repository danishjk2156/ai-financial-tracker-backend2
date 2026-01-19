import React, { useState } from 'react';
import { ShoppingCartIcon, SparklesIcon, CheckIcon } from '../Layout/Icons';
import Card from '../Common/Card';
import Button from '../Common/Button';
import type { AnalysisResult, BuyForm, Profile, Expense } from '../Types';

interface BuyPageProps {
  profile: Profile;
  expenses: Expense[];
}

const BuyPage: React.FC<BuyPageProps> = ({ profile, expenses }) => {
  const [buyForm, setBuyForm] = useState<BuyForm>({
    productName: '',
    offlinePrice: ''
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzePurchase = () => {
    if (!buyForm.productName || !buyForm.offlinePrice) return;

    const availableToSave = profile.monthlyIncome - profile.fixedExpenses - 
      expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const offlinePrice = parseInt(buyForm.offlinePrice);
    const amazonPrice = Math.floor(offlinePrice * (0.85 + Math.random() * 0.1));
    const flipkartPrice = Math.floor(offlinePrice * (0.87 + Math.random() * 0.1));
    
    const savings = offlinePrice - Math.min(amazonPrice, flipkartPrice);
    const percentOfBudget = ((offlinePrice / availableToSave) * 100).toFixed(1);
    
    let aiAdvice = '';
    if (savings > 200) {
      aiAdvice = `💡 You're paying ₹${savings} extra offline!\n\n`;
    }
    
    if (parseFloat(percentOfBudget) > 30) {
      aiAdvice += `⚠️ This purchase is ${percentOfBudget}% of your monthly savings budget.\n\nConsider:\n• Is this urgent?\n• Can you wait for a sale?\n• Do you have alternatives?`;
    } else {
      aiAdvice += `✅ This purchase fits your budget (${percentOfBudget}% of savings).\n\nBuying online can save you ₹${savings}. Delivery in 2-3 days.`;
    }

    setAnalysisResult({
      productName: buyForm.productName,
      offline: offlinePrice,
      amazon: amazonPrice,
      flipkart: flipkartPrice,
      bestPrice: Math.min(amazonPrice, flipkartPrice),
      savings: savings,
      advice: aiAdvice
    });
  };

  return (
    <div style={styles.profileContainer}>
      <Card>
        <div style={styles.cardHeader}>
          <ShoppingCartIcon />
          <h2 style={styles.cardTitle}>Smart Buy Assistant</h2>
        </div>
        <p style={styles.cardSubtitle}>Compare prices and get AI-powered buying advice before you purchase</p>

        <div style={{ marginTop: '32px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Name</label>
            <input
              type="text"
              value={buyForm.productName}
              onChange={(e) => setBuyForm({ ...buyForm, productName: e.target.value })}
              style={styles.input}
              placeholder="e.g., Samsung Galaxy M34, Nike Running Shoes"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Offline Store Price (₹)</label>
            <input
              type="number"
              value={buyForm.offlinePrice}
              onChange={(e) => setBuyForm({ ...buyForm, offlinePrice: e.target.value })}
              style={styles.input}
              placeholder="5000"
            />
            <p style={styles.helperText}>Price you saw at local store/shop</p>
          </div>

          <Button variant="dark" onClick={analyzePurchase}>
            <SparklesIcon /> Analyze Purchase
          </Button>
        </div>
      </Card>

      {analysisResult && (
        <Card style={{ marginTop: '24px' }}>
          <h3 style={styles.cardHeaderTitle}>Price Comparison for {analysisResult.productName}</h3>

          <div style={{ ...styles.statsGrid, marginTop: '24px', marginBottom: '24px' }}>
            <div style={styles.priceCard}>
              <div style={styles.helperText}>Amazon</div>
              <div style={styles.priceValue}>₹{analysisResult.amazon.toLocaleString()}</div>
              <div style={styles.priceDelivery}>Delivery: 2-3 days</div>
            </div>

            <div style={styles.priceCard}>
              <div style={styles.helperText}>Flipkart</div>
              <div style={styles.priceValue}>₹{analysisResult.flipkart.toLocaleString()}</div>
              <div style={styles.priceDelivery}>Delivery: 2-4 days</div>
            </div>

            <div style={styles.priceCardOrange}>
              <div style={styles.priceLabel}>Offline price</div>
              <div style={styles.priceValueOrange}>₹{analysisResult.offline.toLocaleString()}</div>
              <div style={styles.priceDeliveryOrange}>Immediate</div>
            </div>
          </div>

          <div style={styles.successCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckIcon />
              <span style={styles.successTitle}>Best Price: ₹{analysisResult.bestPrice.toLocaleString()}</span>
            </div>
            <p style={styles.successText}>Save ₹{analysisResult.savings} by buying online!</p>
          </div>

          <div style={styles.alertBlue}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flexShrink: 0, marginTop: '4px' }}>
                <SparklesIcon />
              </div>
              <div>
                <h4 style={styles.alertTitle}>AI Buying Advice</h4>
                <p style={{ ...styles.alertText, whiteSpace: 'pre-line' }}>{analysisResult.advice}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  profileContainer: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
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
  cardHeaderTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  priceCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
  },
  priceValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '8px 0',
  },
  priceDelivery: {
    fontSize: '12px',
    color: '#6b7280',
  },
  priceCardOrange: {
    border: '2px solid #f97316',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#fff7ed',
  },
  priceLabel: {
    fontSize: '14px',
    color: '#c2410c',
  },
  priceValueOrange: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#9a3412',
    margin: '8px 0',
  },
  priceDeliveryOrange: {
    fontSize: '12px',
    color: '#ea580c',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #16a34a',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  successTitle: {
    fontWeight: 'bold',
    color: '#166534',
  },
  successText: {
    color: '#15803d',
    fontWeight: 500,
  },
  alertBlue: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '24px',
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
};

export default BuyPage;