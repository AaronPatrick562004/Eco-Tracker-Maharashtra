// src/components/MetricCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon | string;
  color: string;
  trend?: number;
  trendLabel?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  trendLabel = 'from last month' 
}) => {
  // Helper to render icon with proper typing
  const renderIcon = () => {
    if (typeof icon === 'string') {
      // If icon is a string (emoji or text), render as span
      return <span className="text-2xl" role="img" aria-label={title}>{icon}</span>;
    }
    // If icon is a LucideIcon component
    const IconComponent = icon;
    return <IconComponent className="w-6 h-6" aria-hidden="true" />;
  };

  // Format trend display
  const formatTrend = () => {
    if (trend === undefined) return null;
    const isPositive = trend >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    return (
      <p className={`text-sm mt-2 ${colorClass}`}>
        {arrow} {Math.abs(trend)}% {trendLabel}
      </p>
    );
  };

  // Get background color classes based on color prop
  const getBgColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'bg-blue-500': 'bg-blue-500 dark:bg-blue-600',
      'bg-green-500': 'bg-green-500 dark:bg-green-600',
      'bg-purple-500': 'bg-purple-500 dark:bg-purple-600',
      'bg-red-500': 'bg-red-500 dark:bg-red-600',
      'bg-yellow-500': 'bg-yellow-500 dark:bg-yellow-600',
      'bg-indigo-500': 'bg-indigo-500 dark:bg-indigo-600',
      'bg-pink-500': 'bg-pink-500 dark:bg-pink-600',
    };
    return colorMap[color] || color;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
          {formatTrend()}
        </div>
        <div className={`${getBgColorClass(color)} text-white p-3 rounded-full flex items-center justify-center flex-shrink-0 ml-4`}>
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;