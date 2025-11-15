import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { categoryAPI } from '../api/axios';
import CategoryModal from '../components/CategoryModal';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filter, setFilter] = useState('all'); // all, income, expense

  useEffect(() => {
    fetchCategories();
  }, [filter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await categoryAPI.getAll(params);
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await categoryAPI.delete(id);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. It may be in use by existing transactions.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
    fetchCategories();
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your income and expenses</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 border border-gray-100 inline-flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Categories
        </button>
        <button
          onClick={() => setFilter('income')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'income'
              ? 'bg-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setFilter('expense')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'expense'
              ? 'bg-red-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Expense
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Categories */}
          {(filter === 'all' || filter === 'income') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Income Categories ({incomeCategories.length})
                </h3>
              </div>
              <div className="p-6">
                {incomeCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No income categories yet</p>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="mt-2 text-indigo-600 hover:text-indigo-700"
                    >
                      Create your first one
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomeCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-xs text-gray-500">
                              Created {new Date(category.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expense Categories */}
          {(filter === 'all' || filter === 'expense') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Expense Categories ({expenseCategories.length})
                </h3>
              </div>
              <div className="p-6">
                {expenseCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No expense categories yet</p>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="mt-2 text-indigo-600 hover:text-indigo-700"
                    >
                      Create your first one
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenseCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-xs text-gray-500">
                              Created {new Date(category.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default Categories;