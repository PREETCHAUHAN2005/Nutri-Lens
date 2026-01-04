import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/slices/authSlice';
import { Loader, UserPlus } from 'lucide-react';

const SignupForm = ({ onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(register(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {typeof error === 'string' ? error : 'Registration failed'}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors"
      >
        {loading ? <Loader className="animate-spin w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account? <button type="button" onClick={onSwitchToLogin} className="text-primary-600 font-semibold hover:underline">Log in</button>
      </p>
    </form>
  );
};

export default SignupForm;