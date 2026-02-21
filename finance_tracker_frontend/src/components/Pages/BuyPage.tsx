import React, { useState } from 'react';
import { ShoppingCartIcon, SparklesIcon, CheckIcon } from '../Layout/Icons';
import Card from '../Common/Card';
import Button from '../Common/Button';
import type { AnalysisResult, BuyForm, Profile, Expense } from '../Types';
import { analyzePurchase as apiAnalyzePurchase } from '../../api/endpoints';

const parsePrice = (priceStr: string): number => {
  if (!priceStr || priceStr === 'Not listed') return Infinity;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? Infinity : num;
};

interface BuyPageProps {
  profile: Profile;
  expenses: Expense[];
}

const BuyPage: React.FC<BuyPageProps> = ({ }) => {
  const [buyForm, setBuyForm] = useState<BuyForm>({
    productName: '',
    offlinePrice: ''
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyzePurchase = async () => {
    if (!buyForm.productName || !buyForm.offlinePrice) return;
    setLoading(true);

    try {
      const offlinePrice = parseFloat(buyForm.offlinePrice);
      const res = await apiAnalyzePurchase(buyForm.productName, offlinePrice);

      const onlineResults = res.online_results || [];

      // Calculate best price and savings locally from the search results
      let bestOnlinePrice = Infinity;
      onlineResults.forEach(item => {
        const p = parsePrice(item.price);
        if (p < bestOnlinePrice) bestOnlinePrice = p;
      });

      // If no valid online prices, assume offline is best or handle appropriately
      if (bestOnlinePrice === Infinity) bestOnlinePrice = offlinePrice;

      const savings = Math.max(0, offlinePrice - bestOnlinePrice);

      setAnalysisResult({
        productName: res.product,
        offline: res.offline_price,
        bestPrice: bestOnlinePrice,
        savings: savings,
        advice: res.ai_decision,
        onlineResults: onlineResults // map backend types if needed, but they match our Interface
      });
    } catch (error) {
      console.error("Failed to analyze purchase:", error);
      // Optional: set error state
    } finally {
      setLoading(false);
    }
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

          <Button variant="dark" onClick={handleAnalyzePurchase} disabled={loading}>
            <SparklesIcon /> {loading ? 'Analyzing...' : 'Analyze Purchase'}
          </Button>
        </div>
      </Card>

      {analysisResult && (
        <Card style={{ marginTop: '24px' }}>
          <h3 style={styles.cardHeaderTitle}>Price Comparison for {analysisResult.productName}</h3>


          <div style={{ ...styles.statsGrid, marginTop: '24px', marginBottom: '24px' }}>
            {analysisResult.onlineResults && analysisResult.onlineResults.length > 0 ? (
              analysisResult.onlineResults.slice(0, 3).map((item, index) => (
                <div key={index} style={styles.priceCard}>
                  <div style={styles.helperText}>{item.source || 'Online Store'}</div>
                  <div style={styles.priceValue}>{item.price}</div>
                  <div style={styles.priceDelivery}>
                    {item.rating && item.rating !== 'No rating data' ? `★ ${item.rating}` : 'No rating'}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.priceCard}>
                <div style={styles.helperText}>Online</div>
                <div style={styles.priceValue}>No results found</div>
              </div>
            )}

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