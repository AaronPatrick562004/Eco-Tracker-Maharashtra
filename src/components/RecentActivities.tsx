// src/components/RecentActivities.tsx
import React from 'react';

export interface Activity {
  id: string;
  title: string;
  type: string;
  school_name: string;
  date: string;
  students_participated: number;
  status: string;
  created_at?: string;
  description?: string;
  photos_count?: number;
}

interface RecentActivitiesProps {
  activities: Activity[];
  loading?: boolean;
  title?: string;
  onActivityClick?: (activity: Activity) => void;
  maxItems?: number;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities = [], 
  loading = false, 
  title = "Recent Activities",
  onActivityClick,
  maxItems
}) => {
  // Limit activities if maxItems is provided
  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

  const getStatusColor = (status: string): string => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'verified':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'flagged':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string): string => {
    const normalizedType = type?.toLowerCase() || '';
    switch (normalizedType) {
      case 'plantation':
        return '🌳';
      case 'water':
        return '💧';
      case 'waste':
        return '♻️';
      case 'energy':
        return '⚡';
      case 'air':
        return '🌬️';
      default:
        return '📋';
    }
  };

  const getStatusText = (status: string): string => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'verified':
        return 'Verified';
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'flagged':
        return 'Flagged';
      default:
        return status || 'Pending';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date unavailable';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayActivities || displayActivities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No activities yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Add your first activity to see it here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {activities.length > (maxItems || 10) && (
          <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            View All
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div 
            key={activity.id} 
            className={`border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0 ${
              onActivityClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg p-2 -mx-2' : ''
            }`}
            onClick={() => onActivityClick?.(activity)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xl flex-shrink-0" role="img" aria-label={activity.type}>
                    {getTypeIcon(activity.type)}
                  </span>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {activity.school_name}
                </p>
                
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    📅 {formatDate(activity.date)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    👥 {activity.students_participated} students
                  </span>
                  {activity.photos_count && activity.photos_count > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      📷 {activity.photos_count} photos
                    </span>
                  )}
                </div>
                
                {activity.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {activity.description}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(activity.status)}`}>
                  {getStatusText(activity.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;