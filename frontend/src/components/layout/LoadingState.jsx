import React from 'react';
import { Loader } from 'lucide-react';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;