import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import HomePage from './components/Pages/HomePage';
import ProfilePage from './components/Pages/ProfilePage';
import ExpensesPage from './components/Pages/ExpensesPage';
import SavingsPage from './components/Pages/SavingsPage';
import BuyPage from './components/Pages/BuyPage';
import ChatPage from './components/Pages/ChatPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import type { Profile, Expense, ChatMessage } from './components/Types';

// Main App Component that uses Auth
const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showLogin, setShowLogin] = useState<'login' | 'register' | null>(isAuthenticated ? null : 'login');
  
  // Use user data from auth context
  const [profile, setProfile] = useState<Profile>(
    user?.profile || {
      monthlyIncome: 0,
      fixedExpenses: 0,
      savingsGoal: 0
    }
  );

  const [expenses, setExpenses] = useState<Expense[]>(user?.expenses || []);

  // Sync profile and expenses when user changes
  useEffect(() => {
    if (user) {
      setProfile(user.profile || {
        monthlyIncome: 0,
        fixedExpenses: 0,
        savingsGoal: 0
      });
      setExpenses(user.expenses || []);
    }
  }, [user]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Namaste! 🙏\n\nI'm your personal finance buddy. I can help you with:\n\n• Saving tips - Simple ways to save money daily\n• Budget check - See if you're on track\n• Spending advice - Where you can cut costs\n• Purchase decisions - Should you buy it?\n\nAsk me anything about your money!" }
  ]);

  // Handle successful login/register
  const handleAuthSuccess = () => {
    setShowLogin(null);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowLogin('login');
    setActiveTab('home');
  };

  // If not authenticated, show auth pages
  if (!isAuthenticated) {
    if (showLogin === 'login') {
      return (
        <LoginPage 
          onSwitchToRegister={() => setShowLogin('register')}
          onLoginSuccess={handleAuthSuccess}
        />
      );
    }
    return (
      <RegisterPage 
        onSwitchToLogin={() => setShowLogin('login')}
        onRegisterSuccess={handleAuthSuccess}
      />
    );
  }

  // Main authenticated app
  return (
    <div style={styles.container}>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          overflow-x: hidden;
        }
      `}</style>

      <Header />
      <div style={styles.userBar}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>👋 Welcome, {user?.name}</span>
          <span style={styles.userEmail}>{user?.email}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={styles.mainContent}>
        {activeTab === 'profile' && (
          <ProfilePage profile={profile} setProfile={setProfile} />
        )}

        {activeTab === 'home' && (
          <HomePage profile={profile} expenses={expenses} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesPage expenses={expenses} setExpenses={setExpenses} />
        )}

        {activeTab === 'savings' && (
          <SavingsPage profile={profile} expenses={expenses} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'buy' && (
          <BuyPage profile={profile} expenses={expenses} />
        )}

        {activeTab === 'chat' && (
          <ChatPage 
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            profile={profile}
            expenses={expenses}
          />
        )}
      </div>
    </div>
  );
};

// Main App wrapper with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)',
  },
  userBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mainContent: {
    width: '100%',
    padding: '32px 16px',
  },
};

export default App;