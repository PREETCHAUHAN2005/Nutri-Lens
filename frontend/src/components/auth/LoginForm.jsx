import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { Loader, LogIn } from 'lucide-react';

const LoginForm = ({ onSwitchToSignup }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(login(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {typeof error === 'string' ? error : 'Login failed'}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors"
      >
        {loading ? <Loader className="animate-spin w-5 h-5" /> : <LogIn className="w-5 h-5" />}
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <p className="text-center text-sm text-gray-600">
        New here? <button type="button" onClick={onSwitchToSignup} className="text-primary-600 font-semibold hover:underline">Create account</button>
      </p>
    </form>
  );
};

export default LoginForm;