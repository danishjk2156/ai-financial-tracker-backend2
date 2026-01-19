import React, { createContext, useContext, useState } from 'react';
import type { User } from '../components/Types';
import type { ReactNode } from 'react';
import { mockUsers } from '../mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState(mockUsers);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = users.find(
          u => u.email === email && u.password === password
        );
        
        if (foundUser) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword as User);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if user already exists
        if (users.some(u => u.email === email)) {
          resolve(false);
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          email,
          password,
          name,
          profile: {
            monthlyIncome: 0,
            fixedExpenses: 0,
            savingsGoal: 0
          },
          expenses: []
        };

        setUsers([...users, newUser]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pwd, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        resolve(true);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check for stored user on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
