import React, { useState, useEffect } from 'react';
import { SendIcon, SparklesIcon } from '../Layout/Icons';
import type { ChatMessage, Profile, Expense } from '../Types';
import ConsentModal from '../Common/ConsentModal';

interface ChatPageProps {
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  profile: Profile;
  expenses: Expense[];
}

const CONSENT_STORAGE_KEY = 'paisawise_ai_consent';

const ChatPage: React.FC<ChatPageProps> = ({ chatMessages, setChatMessages, profile, expenses }) => {
  const [chatInput, setChatInput] = useState<string>('');
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  // Check consent status on mount - show modal if not accepted
  useEffect(() => {
    const consentStatus = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (consentStatus === 'accepted') {
      // Consent already accepted, don't show modal
      setHasConsent(true);
      setShowConsentModal(false);
    } else {
      // No consent or previously denied - show modal
      setShowConsentModal(true);
      setHasConsent(false);
    }
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    setHasConsent(true);
    setShowConsentModal(false);
  };

  const handleDenyConsent = () => {
    // Remove consent from storage so it asks again next time
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setHasConsent(false);
    setShowConsentModal(false);
  };

  const quickQuestions = [
    "How to save ₹100 daily?",
    "Can I afford this purchase?",
    "Am I overspending?",
    "Is my budget safe?",
    "Emergency fund tips?",
    "How to cut expenses?"
  ];

  const getAIResponse = (message: string): string => {
    // If user denied consent, provide limited responses
    if (hasConsent === false) {
      return "I'd love to help you with personalized financial advice, but I need your consent to access your financial data. Please refresh the page and allow data access when prompted, or use the general tips below:\n\n• Track your daily expenses\n• Set monthly savings goals\n• Review your spending regularly\n• Build an emergency fund\n• Avoid unnecessary purchases";
    }

    const lower = message.toLowerCase();
    const availableToSave = profile.monthlyIncome - profile.fixedExpenses - 
      expenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (lower.includes('save') && lower.includes('100')) {
      return "Here's how to save ₹100 daily:\n\n• Skip one chai/coffee outside (₹20)\n• Cook lunch at home instead of ordering (₹60)\n• Use bus instead of auto once (₹20)\n\nTotal saved: ₹100/day = ₹3,000/month = ₹36,000/year! 🎯";
    }
    
    if (lower.includes('afford') || lower.includes('purchase')) {
      return `Based on your finances:\n\n✅ Monthly Income: ₹${profile.monthlyIncome}\n✅ Available to Save: ₹${availableToSave}\n\nFor purchases under ₹${Math.floor(availableToSave * 0.3)}, you're safe!\n\nFor anything above, consider:\n• Is it urgent?\n• Can you wait for a sale?\n• Do you have an alternative?`;
    }
    
    if (lower.includes('overspending') || lower.includes('spending')) {
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percentOfIncome = ((totalExpenses / profile.monthlyIncome) * 100).toFixed(1);
      
      if (totalExpenses > profile.monthlyIncome - profile.fixedExpenses) {
        return `⚠️ Warning! Your variable expenses are ₹${totalExpenses}.\n\nYou're spending ${percentOfIncome}% of your income. Try to:\n• Track daily expenses\n• Reduce outside food\n• Use public transport\n• Postpone non-essential purchases`;
      } else {
        return `✅ Good news! Your spending is under control.\n\nVariable expenses: ₹${totalExpenses} (${percentOfIncome}% of income)\n\nKeep up the good habits! 💪`;
      }
    }
    
    if (lower.includes('budget') || lower.includes('safe')) {
      return `Your Budget Health:\n\n💰 Income: ₹${profile.monthlyIncome}\n🏠 Fixed: ₹${profile.fixedExpenses}\n💸 Variable: ₹${expenses.reduce((sum, exp) => sum + exp.amount, 0)}\n✨ Can Save: ₹${availableToSave}\n\n${availableToSave >= profile.savingsGoal ? '✅ You can meet your savings goal!' : '⚠️ Tight budget! Try reducing variable expenses.'}`;
    }
    
    if (lower.includes('emergency')) {
      const targetFund = profile.fixedExpenses * 6;
      return `Emergency Fund Guide:\n\n🎯 Target: 6 months expenses = ₹${targetFund}\n\nTip: Financial experts recommend keeping 3-6 months of expenses as an emergency fund. Start saving today to build your emergency fund!`;
    }
    
    if (lower.includes('cut') || lower.includes('reduce') || lower.includes('expense')) {
      return "Top 5 Ways to Cut Expenses:\n\n1️⃣ Cook at home - Save ₹3,000/month\n2️⃣ Cancel unused subscriptions - Save ₹500/month\n3️⃣ Use public transport - Save ₹2,000/month\n4️⃣ Buy groceries in bulk - Save ₹800/month\n5️⃣ Reduce electricity usage - Save ₹400/month\n\nTotal potential savings: ₹6,700/month! 🎉";
    }
    
    return "I can help you with:\n\n• How to save money daily\n• Budget analysis\n• Purchase decisions\n• Expense reduction tips\n• Emergency fund planning\n\nWhat would you like to know?";
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      // Don't allow sending messages if consent modal is showing
      if (showConsentModal) {
        return;
      }

      const userMessage: ChatMessage = { sender: 'user', text: chatInput };
      setChatMessages([...chatMessages, userMessage]);
      
      setTimeout(() => {
        const response = getAIResponse(chatInput);
        const aiMessage: ChatMessage = { sender: 'ai', text: response };
        setChatMessages(prev => [...prev, aiMessage]);
      }, 500);
      
      setChatInput('');
    }
  };

  const handleQuickQuestion = (question: string) => {
    setChatInput(question);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div style={styles.profileContainer}>
      {showConsentModal && (
        <ConsentModal 
          onAccept={handleAcceptConsent}
          onDeny={handleDenyConsent}
        />
      )}
      <div style={styles.chatContainer}>
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderFlex}>
            <div style={styles.chatAvatar}>
              <SparklesIcon />
            </div>
            <div>
              <h3 style={styles.chatTitle}>AI Money Coach</h3>
              <p style={styles.chatSubtitle}>Ask me anything about your finances</p>
            </div>
          </div>
        </div>

        <div style={styles.quickQuestions}>
          <p style={styles.quickQuestionsLabel}>Quick questions:</p>
          <div style={styles.quickQuestionsFlex}>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                style={styles.quickQuestionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.chatMessages}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={msg.sender === 'user' ? styles.messageRight : styles.messageLeft}>
              <div style={msg.sender === 'user' ? styles.messageUser : styles.messageAi}>
                <p style={{ whiteSpace: 'pre-line', fontSize: '14px' }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.chatInput}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ ...styles.input, flex: 1 }}
              placeholder={showConsentModal ? "Please respond to the consent request first..." : "Ask me anything about your money..."}
              disabled={showConsentModal}
            />
            <button 
              onClick={sendMessage} 
              style={{...styles.sendButton, opacity: showConsentModal ? 0.5 : 1, cursor: showConsentModal ? 'not-allowed' : 'pointer'}}
              disabled={showConsentModal}
            >
              <SendIcon />
            </button>
          </div>
          <p style={styles.chatHint}>Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  profileContainer: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  chatContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
  },
  chatHeader: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '24px',
  },
  chatHeaderFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatAvatar: {
    width: '48px',
    height: '48px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#16a34a',
  },
  chatTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  chatSubtitle: {
    fontSize: '14px',
    color: '#bbf7d0',
  },
  quickQuestions: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  quickQuestionsLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '12px',
  },
  quickQuestionsFlex: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'flex-start',
  },
  quickQuestionButton: {
    flexShrink: 0,
    fontSize: '13px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    padding: '10px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    color: '#374151',
    fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageLeft: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  messageRight: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageAi: {
    maxWidth: '80%',
    borderRadius: '16px',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    color: '#111827',
  },
  messageUser: {
    maxWidth: '80%',
    borderRadius: '16px',
    padding: '12px 16px',
    backgroundColor: '#16a34a',
    color: 'white',
  },
  chatInput: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white',
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
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
  sendButton: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  chatHint: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
  },
};

export default ChatPage;