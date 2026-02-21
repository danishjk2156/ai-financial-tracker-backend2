import React, { useState, useRef } from 'react';
import { PlusIcon, Trash2Icon, MicIcon } from '../Layout/Icons';
import Card from '../Common/Card';
import Button from '../Common/Button';
import type { Expense, ExpenseInput } from '../Types';
import { createExpense, deleteExpense as deleteExpenseApi, updateExpense, voiceToText } from '../../api/endpoints';

interface ExpensesPageProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
}

interface MonthlyData {
  month: string;
  year: number;
  total: number;
  dailyData: { [day: string]: number };
}


const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses, setExpenses }) => {
  const [expenseInput, setExpenseInput] = useState<string>('');
  const [newExpense, setNewExpense] = useState<ExpenseInput>({
    amount: '',
    category: 'Food',
    description: '',
    paymentMethod: 'UPI'
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editInput, setEditInput] = useState<ExpenseInput>({
    amount: '',
    category: 'Food',
    description: '',
    paymentMethod: 'UPI',
  });
  const [isListening, setIsListening] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories = ['Food', 'Travel', 'Rent', 'Education', 'Medical', 'Entertainment', 'Miscellaneous'];

  const categorizeExpense = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('food') || lower.includes('meal') || lower.includes('restaurant') || lower.includes('vegetables') || lower.includes('groceries')) return 'Food';
    if (lower.includes('uber') || lower.includes('ola') || lower.includes('auto') || lower.includes('bus') || lower.includes('train') || lower.includes('petrol')) return 'Travel';
    if (lower.includes('rent') || lower.includes('house')) return 'Rent';
    if (lower.includes('school') || lower.includes('tuition') || lower.includes('book') || lower.includes('course')) return 'Education';
    if (lower.includes('doctor') || lower.includes('medicine') || lower.includes('hospital') || lower.includes('medical')) return 'Medical';
    if (lower.includes('movie') || lower.includes('netflix') || lower.includes('game') || lower.includes('entertainment')) return 'Entertainment';
    return 'Miscellaneous';
  };

  const parseExpenseInput = (text: string) => {
    const amountMatch = text.match(/(\d+)/);
    if (!amountMatch) return null;
    
    const amount = parseInt(amountMatch[1]);
    const category = categorizeExpense(text);
    const description = text.replace(/\d+/g, '').trim();
    
    return { amount, category, description, paymentMethod: 'UPI' };
  };

  const addExpenseFromText = async () => {
    const parsed = parseExpenseInput(expenseInput);
    if (parsed) {
      const backend = await createExpense({
        amount: parsed.amount,
        category: parsed.category,
        description: parsed.description,
        payment_method: parsed.paymentMethod,
      });
      const expense: Expense = {
        id: backend.id,
        amount: backend.amount,
        category: backend.category,
        description: backend.description || '',
        paymentMethod: backend.payment_method,
        date: new Date(backend.created_at).toLocaleDateString(),
      };
      setExpenses([expense, ...expenses]);
      setExpenseInput('');
    }
  };

  const addManualExpense = async () => {
    if (newExpense.amount) {
      const backend = await createExpense({
        amount: parseInt(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        payment_method: newExpense.paymentMethod,
      });
      const expense: Expense = {
        id: backend.id,
        amount: backend.amount,
        category: backend.category,
        description: backend.description || '',
        paymentMethod: backend.payment_method,
        date: new Date(backend.created_at).toLocaleDateString(),
      };
      setExpenses([expense, ...expenses]);
      setNewExpense({ amount: '', category: 'Food', description: '', paymentMethod: 'UPI' });
    }
  };

  const deleteExpense = async (id: number) => {
    await deleteExpenseApi(id);
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const startEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditInput({
      amount: String(exp.amount),
      category: exp.category,
      description: exp.description || '',
      paymentMethod: exp.paymentMethod,
    });
  };

  const cancelEdit = () => {
    setEditingExpense(null);
  };

  const saveEdit = async () => {
    if (!editingExpense) return;

    const updated = await updateExpense(editingExpense.id, {
      amount: editInput.amount ? parseFloat(editInput.amount) : undefined,
      category: editInput.category,
      description: editInput.description,
      payment_method: editInput.paymentMethod,
    });

    setExpenses(
      expenses.map(e =>
        e.id === editingExpense.id
          ? {
              ...e,
              amount: updated.amount,
              category: updated.category,
              description: updated.description || '',
              paymentMethod: updated.payment_method,
              date: new Date(updated.created_at).toLocaleDateString(),
            }
          : e
      )
    );

    setEditingExpense(null);
  };

  const startVoiceRecognition = async () => {
    if (isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const res = await voiceToText(blob);
          const transcript = res.text || '';
          setExpenseInput(transcript);

          const parsed = parseExpenseInput(transcript);
          if (parsed) {
            setNewExpense({
              amount: parsed.amount.toString(),
              category: parsed.category,
              description: parsed.description,
              paymentMethod: parsed.paymentMethod
            });
          }
        } catch {
          // If transcription fails, just stop listening
        } finally {
          setIsListening(false);
        }
      };

      recorder.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
  };

  // Monthly spending insights
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyMap: { [key: string]: MonthlyData } = {};

    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const day = String(date.getDate()).padStart(2, '0');

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          total: 0,
          dailyData: {}
        };
      }

      monthlyMap[monthKey].total += exp.amount;
      monthlyMap[monthKey].dailyData[day] = (monthlyMap[monthKey].dailyData[day] || 0) + exp.amount;
    });

    return Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month.localeCompare(b.month);
    });
  };

  const monthlyData = getMonthlyData();
  const maxMonthlySpending = Math.max(...monthlyData.map(m => m.total), 1);

  const getSelectedMonthDailyData = () => {
    if (!selectedMonth) return null;
    const selected = monthlyData.find(m => m.month === selectedMonth);
    return selected ? selected.dailyData : null;
  };

  const todayExpenses = expenses.filter(e => e.date === new Date().toLocaleDateString());
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <Card>
        <h3 style={styles.cardHeaderTitle}>✨ Quick Add (AI-Powered)</h3>
        <p style={styles.helperText}>Just type naturally: "Spent 120 on vegetables" or "500 for auto"</p>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={expenseInput}
            onChange={(e) => setExpenseInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addExpenseFromText()}
            style={{ ...styles.input, flex: 1 }}
            placeholder="e.g., Spent 250 on lunch"
          />
          <Button onClick={addExpenseFromText}>
            <PlusIcon /> Add
          </Button>
        </div>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <PlusIcon />
          <h3 style={styles.cardHeaderTitle}>Add Expense</h3>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Amount (₹)</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              style={styles.input}
              placeholder="500"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              style={styles.input}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description (Optional)</label>
          <input
            type="text"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            style={styles.input}
            placeholder="What did you spend on?"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Payment Method</label>
          <select
            value={newExpense.paymentMethod}
            onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
            style={styles.input}
          >
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <Button onClick={addManualExpense} style={styles.primaryButtonFlex}>
            <PlusIcon /> Add Expense
          </Button>
          <button
            onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
            style={{
              ...styles.voiceButton,
              backgroundColor: isListening ? '#dc2626' : '#16a34a',
            }}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            <MicIcon size={20} />
            {isListening ? 'Stop' : 'Voice'}
          </button>
        </div>
      </Card>

      {/* Monthly Spending Insights */}
      {monthlyData.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <h3 style={styles.cardHeaderTitle}>📊 Monthly Spending Insights</h3>
          <p style={styles.helperText}>Click on a month to see daily breakdown</p>
          
          <div style={styles.monthlyChart}>
            {monthlyData.map((month) => (
              <div
                key={month.month}
                style={styles.monthBarContainer}
                onClick={() => setSelectedMonth(selectedMonth === month.month ? null : month.month)}
              >
                <div style={styles.monthBarWrapper}>
                  <div
                    style={{
                      ...styles.monthBar,
                      height: `${(month.total / maxMonthlySpending) * 200}px`,
                      backgroundColor: selectedMonth === month.month ? '#16a34a' : '#3b82f6',
                    }}
                  />
                </div>
                <div style={styles.monthLabel}>
                  <div style={styles.monthName}>{month.month.split(' ')[0]}</div>
                  <div style={styles.monthYear}>{month.month.split(' ')[1]}</div>
                  <div style={styles.monthAmount}>₹{month.total.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Breakdown */}
          {selectedMonth && getSelectedMonthDailyData() && (
            <div style={styles.dailyBreakdown}>
              <h4 style={styles.dailyTitle}>Daily Spending - {selectedMonth}</h4>
              <div style={styles.dailyChart}>
                {Object.entries(getSelectedMonthDailyData()!).map(([day, amount]) => {
                  const maxDaily = Math.max(...Object.values(getSelectedMonthDailyData()!), 1);
                  return (
                    <div key={day} style={styles.dailyBarContainer}>
                      <div style={styles.dailyBarWrapper}>
                        <div
                          style={{
                            ...styles.dailyBar,
                            height: `${(amount / maxDaily) * 150}px`,
                          }}
                        />
                      </div>
                      <div style={styles.dailyLabel}>
                        <div style={styles.dailyDay}>{day}</div>
                        <div style={styles.dailyAmount}>₹{amount}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card style={{ marginTop: '24px' }}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardHeaderTitle}>Today's Expenses</h3>
          <div style={styles.statValueBlue}>₹{todayTotal}</div>
        </div>
        <p style={styles.helperText}>{todayExpenses.length} transactions</p>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <h3 style={styles.cardHeaderTitle}>Recent Expenses</h3>

        {expenses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No expenses recorded yet</p>
            <p style={styles.helperText}>Start tracking your spending!</p>
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            {expenses.map(exp => (
              <div key={exp.id} style={styles.expenseItemLarge}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={styles.expenseCategoryBold}>{exp.category}</span>
                    <span style={styles.badge}>{exp.paymentMethod}</span>
                  </div>
                  <div style={styles.expenseDesc}>{exp.description || 'No description'}</div>
                  <div style={styles.expenseDateSmall}>{exp.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={styles.expenseAmountLarge}>₹{exp.amount}</div>
                  <button onClick={() => startEdit(exp)} style={styles.editButton}>
                    Edit
                  </button>
                  <button onClick={() => deleteExpense(exp.id)} style={styles.deleteButton}>
                    <Trash2Icon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Update Expense</h3>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  type="number"
                  value={editInput.amount}
                  onChange={(e) => setEditInput({ ...editInput, amount: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={editInput.category}
                  onChange={(e) => setEditInput({ ...editInput, category: e.target.value })}
                  style={styles.input}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                value={editInput.description}
                onChange={(e) => setEditInput({ ...editInput, description: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Method</label>
              <select
                value={editInput.paymentMethod}
                onChange={(e) => setEditInput({ ...editInput, paymentMethod: e.target.value })}
                style={styles.input}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button type="button" onClick={cancelEdit} style={styles.modalCancel}>
                Cancel
              </button>
              <button type="button" onClick={() => void saveEdit()} style={styles.modalSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  cardHeaderTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
  },
  helperText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
    marginBottom: '16px',
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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '8px',
  },
  primaryButtonFlex: {
    width: '100%',
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  statValueBlue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyText: {
    color: '#9ca3af',
    marginBottom: '16px',
  },
  expenseItemLarge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '12px',
    transition: 'background-color 0.2s',
  },
  expenseCategoryBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    fontSize: '12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  expenseDesc: {
    fontSize: '14px',
    color: '#6b7280',
  },
  expenseDateSmall: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  expenseAmountLarge: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
  },
  deleteButton: {
    padding: '8px',
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  editButton: {
    padding: '8px 10px',
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  voiceButton: {
    padding: '12px 20px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  monthlyChart: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '24px 0',
    overflowX: 'auto',
    minHeight: '280px',
  },
  monthBarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    minWidth: '80px',
  },
  monthBarWrapper: {
    height: '200px',
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '8px',
  },
  monthBar: {
    width: '50px',
    backgroundColor: '#3b82f6',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.3s',
    minHeight: '10px',
  },
  monthLabel: {
    textAlign: 'center',
  },
  monthName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '2px',
  },
  monthYear: {
    fontSize: '10px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  monthAmount: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#16a34a',
  },
  dailyBreakdown: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
  },
  dailyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '16px',
  },
  dailyChart: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: '16px 0',
    overflowX: 'auto',
    minHeight: '200px',
  },
  dailyBarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '40px',
  },
  dailyBarWrapper: {
    height: '150px',
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '8px',
  },
  dailyBar: {
    width: '30px',
    backgroundColor: '#16a34a',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s',
    minHeight: '5px',
  },
  dailyLabel: {
    textAlign: 'center',
  },
  dailyDay: {
    fontSize: '11px',
    color: '#6b7280',
    marginBottom: '2px',
  },
  dailyAmount: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#16a34a',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 60,
  },
  modal: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: 16,
    color: '#111827',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancel: {
    padding: '10px 14px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
  modalSave: {
    padding: '10px 14px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
};

export default ExpensesPage;