import React from 'react';

const InsightCard = ({ icon, title, children, color = 'blue' }) => {
  // Map color props to Tailwind classes
  const styles = {
    green: 'bg-green-50 border-green-200 text-green-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  };

  const iconColors = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
  };

  return (
    <div className={`rounded-xl shadow-sm border-l-4 p-5 ${styles[color] || styles.blue}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={iconColors[color] || iconColors.blue}>{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
};

export default InsightCard;