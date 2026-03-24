// src/pages/Index.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { CheckCircle, XCircle, ShieldCheck, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStats {
  totalSchools: number;
  totalActivities: number;
  complianceRate: number;
  schoolsAtRisk: number;
  pendingApprovals: number;
  greenSchools: number;
  amberSchools: number;
}

interface RecentActivity {
  id: string;
  title: string;
  type: string;
  school_name: string;
  date: string;
  students_participated: number;
  status: string;
  created_at: string;
}

interface Props {
  lang: Language;
}

const Index = ({ lang }: Props) => {
  const t = translations[lang];
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalActivities: 0,
    complianceRate: 0,
    schoolsAtRisk: 0,
    pendingApprovals: 0,
    greenSchools: 0,
    amberSchools: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<RecentActivity | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const canApprove = user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state';
  const canVerify = user?.role === 'state';
  const canReject = user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state';

  useEffect(() => {
    fetchDashboardData();
    
    const subscription = supabase
      .channel('dashboard-activities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('compliance');
      
      if (schoolsError) throw schoolsError;
      
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });
      
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });
      
      const { count: pendingApprovals } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      const greenSchools = schools?.filter(s => s.compliance === 'green').length || 0;
      const amberSchools = schools?.filter(s => s.compliance === 'amber').length || 0;
      const atRiskSchools = schools?.filter(s => s.compliance === 'red').length || 0;
      const complianceRate = (totalSchools || 0) > 0 ? (greenSchools / (totalSchools || 1)) * 100 : 0;
      
      setStats({
        totalSchools: totalSchools || 0,
        totalActivities: totalActivities || 0,
        complianceRate: Math.round(complianceRate * 10) / 10,
        schoolsAtRisk: atRiskSchools,
        pendingApprovals: pendingApprovals || 0,
        greenSchools,
        amberSchools
      });
      
      const { data: recent } = await supabase
        .from('activities')
        .select('id, title, type, school_name, date, students_participated, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setRecentActivities(recent || []);
      
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateActivityStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('activities')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchDashboardData();
      
      const statusMessages: Record<string, string> = {
        approved: '✅ Activity approved!',
        verified: '✅ Activity verified by State Officer!',
        rejected: '❌ Activity rejected'
      };
      alert(statusMessages[newStatus] || `✅ Activity ${newStatus}!`);
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const viewActivityDetails = (activity: RecentActivity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'approved':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button onClick={fetchDashboardData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">EcoTrack Maharashtra</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name || 'User'} ({user?.role?.toUpperCase() || 'Guest'})
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Schools" value={stats.totalSchools} icon="🏫" color="bg-blue-500" />
        <StatCard title="Total Activities" value={stats.totalActivities} icon="🌱" color="bg-green-500" />
        <StatCard title="Compliance Rate" value={`${stats.complianceRate}%`} icon="📊" color="bg-purple-500" />
        <StatCard title="Schools at Risk" value={stats.schoolsAtRisk} icon="⚠️" color="bg-red-500" />
      </div>

      {/* Compliance Summary */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-3">Compliance Summary</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600">Green (Compliant)</span>
              <span>{stats.greenSchools} schools</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.greenSchools / stats.totalSchools) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-600">Amber (Partial)</span>
              <span>{stats.amberSchools} schools</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.amberSchools / stats.totalSchools) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-600">Red (At Risk)</span>
              <span>{stats.schoolsAtRisk} schools</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.schoolsAtRisk / stats.totalSchools) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold mb-4">Recent Eco Activities</h3>
        {recentActivities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activities yet</p>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="border-b border-border pb-4 last:border-b-0">
                {/* Activity Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.school_name}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>📅 {new Date(activity.date).toLocaleDateString()}</span>
                      <span>👥 {activity.students_participated} students</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
                
                {/* Status Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
                  
                  {/* Approve Button */}
                  {canApprove && (
                    <button
                      onClick={() => updateActivityStatus(activity.id, 'approved')}
                      disabled={actionLoading === activity.id}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                  )}
                  
                  {/* Verify Button */}
                  {canVerify && (
                    <button
                      onClick={() => updateActivityStatus(activity.id, 'verified')}
                      disabled={actionLoading === activity.id}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Verify
                    </button>
                  )}
                  
                  {/* Reject Button */}
                  {canReject && (
                    <button
                      onClick={() => updateActivityStatus(activity.id, 'rejected')}
                      disabled={actionLoading === activity.id}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  )}
                  
                  {/* View Button - WORKING NOW */}
                  <button
                    onClick={() => viewActivityDetails(activity)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Activity Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-lg font-semibold">{selectedActivity.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="capitalize">{selectedActivity.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className={`capitalize font-medium ${
                    selectedActivity.status === 'verified' ? 'text-green-600' :
                    selectedActivity.status === 'approved' ? 'text-blue-600' :
                    selectedActivity.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedActivity.status}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">School</label>
                <p>{selectedActivity.school_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p>{new Date(selectedActivity.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Students Participated</label>
                  <p>{selectedActivity.students_participated} students</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p>{new Date(selectedActivity.created_at).toLocaleString()}</p>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`${color} text-white p-3 rounded-full text-xl`}>{icon}</div>
    </div>
  </div>
);

export default Index;