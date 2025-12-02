import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Card, Button, Input, Alert } from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

ChartJS.register(ArcElement, Tooltip, Legend);

function BudgetTracker() {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'Income',
    amount: '',
    category: '',
    date: '',
    description: '',
  });
  const [error, setError] = useState('');

  // Fetch transactions on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view transactions');
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTransactions(response.data))
      .catch((err) => setError(err.response?.data?.error || 'Error fetching transactions'));
  }, []);

  // Handle form input changes
  const handleTransactionChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  // Handle adding a new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.date) return;
    const token = localStorage.getItem('token');
    const transaction = {
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/transactions`,
        transaction,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions([...transactions, response.data]);
      setNewTransaction({ type: 'Income', amount: '', category: '', date: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding transaction');
    }
  };

  // Calculate summary
  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  // Calculate spending by category for the pie chart (only for expenses)
  const expenseCategories = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

  const pieChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  // Forecast (static for now)
  const forecast = netBalance > 0 ? `You’ll have ${netBalance} ETB by month-end.` : 'You’re overspending!';

  return (
    <div className="text-text-primary animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-text-primary animate-fade-in-down">Budget Tracker</h2>
      <Alert type="error" message={error} />

      {/* Input Form */}
      <Card stagger={1} className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Add Transaction</h3>
        <form onSubmit={handleAddTransaction}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="transaction-type" className="block text-sm text-text-muted mb-2">
                Type
              </label>
              <select
                id="transaction-type"
                name="type"
                value={newTransaction.type}
                onChange={handleTransactionChange}
                className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <Input
              type="number"
              id="transaction-amount"
              name="amount"
              label="Amount (ETB)"
              value={newTransaction.amount}
              onChange={handleTransactionChange}
              placeholder="Enter amount"
              stagger={2}
              animated={false}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="transaction-category" className="block text-sm text-text-muted mb-2">
                Category
              </label>
              <select
                id="transaction-category"
                name="category"
                value={newTransaction.category}
                onChange={handleTransactionChange}
                className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select category</option>
                {newTransaction.type === 'Income' ? (
                  <>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Other Income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other Expense">Other Expense</option>
                  </>
                )}
              </select>
            </div>
            <Input
              type="date"
              id="transaction-date"
              name="date"
              label="Date"
              value={newTransaction.date}
              onChange={handleTransactionChange}
              stagger={4}
              animated={false}
            />
          </div>
          <Input
            type="text"
            id="transaction-description"
            name="description"
            label="Description (Optional)"
            value={newTransaction.description}
            onChange={handleTransactionChange}
            placeholder="Enter description"
            stagger={1}
            animated={false}
          />
          <Button
            type="submit"
            fullWidth
            animated={false}
          >
            Add Transaction
          </Button>
        </form>
      </Card>

      {/* Spending Overview */}
      <Card stagger={2} className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Spending Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-elevated border border-border p-4 rounded-lg hover-lift transition-smooth animate-fade-in-scale stagger-1">
            <h4 className="text-lg font-bold text-text-primary">Total Income</h4>
            <p className="text-2xl text-success">{totalIncome} ETB</p>
          </div>
          <div className="bg-surface-elevated border border-border p-4 rounded-lg hover-lift transition-smooth animate-fade-in-scale stagger-2">
            <h4 className="text-lg font-bold text-text-primary">Total Expenses</h4>
            <p className="text-2xl text-error">{totalExpenses} ETB</p>
          </div>
          <div className="bg-surface-elevated border border-border p-4 rounded-lg hover-lift transition-smooth animate-fade-in-scale stagger-3">
            <h4 className="text-lg font-bold text-text-primary">Net Balance</h4>
            <p className={`text-2xl ${netBalance >= 0 ? 'text-success' : 'text-error'}`}>
              {netBalance} ETB
            </p>
          </div>
        </div>
        {Object.keys(expenseCategories).length > 0 ? (
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-center">No expenses to display in the pie chart.</p>
        )}
      </Card>

      {/* Forecast */}
      <Card stagger={3} className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Forecast</h3>
        <p className="text-text-muted">{forecast}</p>
      </Card>

      {/* Transaction List */}
      <Card stagger={4}>
        <h3 className="text-xl font-bold mb-4 text-text-primary">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted border-b border-divider">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id} className="border-t border-divider hover:bg-surface-hover transition-smooth animate-fade-in-scale stagger-1">
                  <td className="py-2 text-text-primary">{transaction.date}</td>
                  <td className="py-2">
                    <span
                      className={
                        transaction.type === 'Income' ? 'text-success' : 'text-error'
                      }
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-2 text-text-primary">{transaction.amount} ETB</td>
                  <td className="py-2 text-text-primary">{transaction.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default BudgetTracker;