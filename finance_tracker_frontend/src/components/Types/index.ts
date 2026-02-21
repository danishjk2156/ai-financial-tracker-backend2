export interface Profile {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsGoal: number;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface OnlineProduct {
  title: string;
  price: string;
  source: string;
  rating: string | number;
  reviews: string | number;
}

export interface AnalysisResult {
  productName: string;
  offline: number;
  bestPrice: number;
  savings: number;
  advice: string;
  onlineResults: OnlineProduct[];
}

export interface ExpenseInput {
  amount: string;
  category: string;
  description: string;
  paymentMethod: string;
}

export interface BuyForm {
  productName: string;
  offlinePrice: string;
}
// Add these to existing interfaces
export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}