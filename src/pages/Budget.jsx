import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { budgetAPI, transactionAPI } from '../api/axios';
import BudgetModal from '../components/BudgetModal';
import BudgetComparisonChart from '../components/charts/BudgetComparisonChart';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [currentExpenses, setCurrentExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
    fetchCurrentBudget();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getAll();
      setBudgets(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    }
  };

  const fetchCurrentBudget = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const response = await budgetAPI.getCurrentMonth();
      setCurrentBudget(response.data);

      // Fetch current month expenses
      const transResponse = await transactionAPI.getAll({
        type: 'expense',
        start_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        end_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`,
      });

      const expenses = (transResponse.data.results || []).reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );
      setCurrentExpenses(expenses);
    } catch (error) {
      console.error('Failed to fetch current budget:', error);
      setCurrentBudget(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await budgetAPI.delete(id);
      fetchBudgets();
      if (currentBudget?.id === id) {
        setCurrentBudget(null);
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
      alert('Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingBudget(null);
    fetchBudgets();
    fetchCurrentBudget();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const budgetPercentage = currentBudget
    ? (currentExpenses / parseFloat(currentBudget.amount)) * 100
    : 0;

  const remaining = currentBudget ? parseFloat(currentBudget.amount) - currentExpenses : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-1">Set and track your monthly budgets</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Set Budget
        </button>
      </div>

      {/* Current Month Budget Card */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : currentBudget ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {getMonthName(currentBudget.month)} {currentBudget.year}
              </h2>
              <p className="text-indigo-100">Your current monthly budget</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(currentBudget)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(currentBudget.id)}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-indigo-100 text-sm mb-1">Budget Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(currentBudget.amount)}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-indigo-100 text-sm mb-1">Spent</p>
              <p className="text-3xl font-bold">{formatCurrency(currentExpenses)}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-indigo-100 text-sm mb-1">Remaining</p>
              <p className={`text-3xl font-bold ${remaining < 0 ? 'text-red-300' : ''}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className="text-sm font-bold">{budgetPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full transition-all ${
                  budgetPercentage > 100
                    ? 'bg-red-400'
                    : budgetPercentage > 80
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {budgetPercentage > 100 ? (
            <div className="mt-6 flex items-start gap-3 bg-red-500 bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-red-300 border-opacity-30">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Budget Exceeded</p>
                <p className="text-sm text-indigo-100 mt-1">
                  You've exceeded your budget by {formatCurrency(Math.abs(remaining))}. Consider reviewing your expenses.
                </p>
              </div>
            </div>
          ) : budgetPercentage > 80 ? (
            <div className="mt-6 flex items-start gap-3 bg-yellow-500 bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-yellow-300 border-opacity-30">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Approaching Limit</p>
                <p className="text-sm text-indigo-100 mt-1">
                  You're close to your budget limit. Only {formatCurrency(remaining)} remaining.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex items-start gap-3 bg-green-500 bg-opacity-20 backdrop-blur-sm p-4 rounded-xl border border-green-300 border-opacity-30">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">On Track</p>
                <p className="text-sm text-indigo-100 mt-1">
                  You're managing your budget well. Keep it up!
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Budget Set</h3>
          <p className="text-gray-600 mb-6">
            Set a budget for this month to start tracking your expenses
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Set Budget Now
          </button>
        </div>
      )}

      {/* Budget vs Expenses Chart */}
      {currentBudget && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Expenses</h3>
          <BudgetComparisonChart
            budget={parseFloat(currentBudget.amount)}
            expenses={currentExpenses}
          />
        </div>
      )}

      {/* All Budgets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Budgets</h3>
        </div>
        {budgets.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No budgets found. Create your first budget to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMonthName(budget.month)} {budget.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(budget.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {modalOpen && <BudgetModal budget={editingBudget} onClose={handleModalClose} />}
    </div>
  );
}

export default Budget;