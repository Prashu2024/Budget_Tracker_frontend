import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { categoryAPI } from '../api/axios';

function CategoryModal({ category, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (category) {
        await categoryAPI.update(category.id, formData);
      } else {
        await categoryAPI.create(formData);
      }
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.name?.[0] 
        || err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.message 
        || 'Failed to save category';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  formData.type === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  formData.type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Groceries, Salary, Entertainment"
              required
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              Choose a descriptive name for your category
            </p>
          </div>

          {!category && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Create categories that match your spending habits. 
                Common examples: Salary, Freelance, Groceries, Transportation, Entertainment, Utilities.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;