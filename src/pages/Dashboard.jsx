import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '../api/axios';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      name: 'Total Income',
      value: formatCurrency(data?.total_income || 0),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      name: 'Total Expenses',
      value: formatCurrency(data?.total_expenses || 0),
      icon: TrendingDown,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    {
      name: 'Balance',
      value: formatCurrency(data?.balance || 0),
      icon: Wallet,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your financial status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Status */}
      {data?.monthly_budget && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Budget</h3>
            <span className="text-sm text-gray-600">
              {formatCurrency(data.budget_remaining || 0)} remaining
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (data.budget_percentage || 0) > 100
                    ? 'bg-red-500'
                    : (data.budget_percentage || 0) > 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(data.budget_percentage || 0, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{(data.budget_percentage || 0).toFixed(1)}% used</span>
              <span>Budget: {formatCurrency(data.monthly_budget)}</span>
            </div>
          </div>
          {(data.budget_percentage || 0) > 100 && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>You've exceeded your monthly budget by {formatCurrency(Math.abs(data.budget_remaining || 0))}</span>
            </div>
          )}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
          {data?.income_by_category?.length > 0 ? (
            <PieChart
              data={data.income_by_category.map(item => ({
                label: item.category__name,
                value: parseFloat(item.total)
              }))}
              colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No income data available
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {data?.expenses_by_category?.length > 0 ? (
            <PieChart
              data={data.expenses_by_category.map(item => ({
                label: item.category__name,
                value: parseFloat(item.total)
              }))}
              colors={['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e']}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expense data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
        {data?.monthly_trend?.length > 0 ? (
          <BarChart data={data.monthly_trend} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No trend data available
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;