import React from 'react';
import { useSelector } from 'react-redux';
import { Camera, LogOut } from 'lucide-react';

// Added onLogout prop here 👇
const Header = ({ onNavigate, onLogout }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Area */}
        <div 
          onClick={() => onNavigate?.('home')} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg hidden sm:block">Ingredient Co-Pilot</h1>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name}
          </span>
          <button 
            onClick={onLogout} // 👈 Now calls the function passed from App.js
            className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;