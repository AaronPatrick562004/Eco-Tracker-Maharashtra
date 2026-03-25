// src/pages/ActivityLogger.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { Camera, Plus, CheckCircle, XCircle, Filter, Calendar, Users, School, Eye, ShieldCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  title: string;
  type: string;
  school_id: string;
  school_name: string;
  date: string;
  students_participated: number;
  photos_count: number;
  description: string;
  status: string;
  created_at: string;
}

interface School {
  id: string;
  name: string;
  district: string;
}

const activityTypes = [
  { id: 'plantation', label: 'Tree Plantation', labelMr: 'वृक्षारोपण', icon: '🌳', color: 'bg-green-100 text-green-700' },
  { id: 'water', label: 'Water Conservation', labelMr: 'जलसंधारण', icon: '💧', color: 'bg-blue-100 text-blue-700' },
  { id: 'waste', label: 'Waste Management', labelMr: 'कचरा व्यवस्थापन', icon: '♻️', color: 'bg-amber-100 text-amber-700' },
  { id: 'air', label: 'Clean Air', labelMr: 'स्वच्छ हवा', icon: '🌬️', color: 'bg-purple-100 text-purple-700' },
  { id: 'energy', label: 'Energy Saving', labelMr: 'उर्जा बचत', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
];

interface Props {
  lang: Language;
  searchQuery?: string;
}

const ActivityLogger = ({ lang, searchQuery = "" }: Props) => {
  const t = translations[lang];
  const { user, hasPermission } = useAuth();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'plantation',
    school_id: '',
    date: getTodayDate(),
    students_participated: 0,
    description: ''
  });

  const canCreate = hasPermission('create', 'activities');
  const canApprove = user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state';
  const canVerify = user?.role === 'state';
  const canReject = user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state';
  const canDelete = hasPermission('delete', 'activities');

  useEffect(() => {
    fetchData();
    
    const subscription = supabase
      .channel('activities-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchData();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
      
      if (activitiesError) throw activitiesError;
      
      const uniqueActivities = activitiesData?.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      ) || [];
      
      setActivities(uniqueActivities);
      
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, district')
        .order('name');
      
      if (schoolsError) throw schoolsError;
      
      setSchools(schoolsData || []);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
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
      
      await fetchData();
      
      const statusMessages: Record<string, string> = {
        approved: '✅ Activity approved!',
        verified: '✅ Activity verified by State Officer!',
        rejected: '❌ Activity rejected'
      };
      alert(statusMessages[newStatus] || `✅ Activity ${newStatus}!`);
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, schoolName: string) => {
    if (!canDelete) {
      alert('You do not have permission to delete activities');
      return;
    }
    
    if (user?.role === 'principal' && user?.school !== schoolName) {
      alert('You can only delete activities from your own school');
      return;
    }
    
    if (!confirm('⚠️ Are you sure you want to delete this activity? This action cannot be undone.')) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      alert('✅ Activity deleted successfully!');
      await fetchData();
    } catch (err: any) {
      alert('❌ Failed to delete: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const viewActivityDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const filteredActivities = activities.filter(activity => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesSearch = activity.title.toLowerCase().includes(query) ||
                         activity.school_name.toLowerCase().includes(query);
    const matchesType = selectedType === 'all' || activity.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'students_participated' ? parseInt(value) || 0 : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, date: selectedDate }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'plantation',
      school_id: '',
      date: getTodayDate(),
      students_participated: 0,
      description: ''
    });
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (!formData.title.trim()) throw new Error('Please enter an activity title');
      if (!formData.school_id) throw new Error('Please select a school');
      
      const selectedSchool = schools.find(s => s.id === formData.school_id);
      
      const { error } = await supabase
        .from('activities')
        .insert([{
          title: formData.title.trim(),
          type: formData.type,
          school_id: formData.school_id,
          school_name: selectedSchool?.name,
          date: formData.date,
          students_participated: formData.students_participated,
          description: formData.description.trim(),
          status: 'pending',
          created_by: user?.id,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      alert('✅ Activity submitted successfully!');
      resetForm();
      await fetchData();
      
    } catch (err: any) {
      setError(err.message);
      alert('❌ Failed to submit: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700">✅ Verified</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-700">✓ Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">⏳ Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">✗ Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeInfo = activityTypes.find(t => t.id === type);
    return (
      <Badge className={`${typeInfo?.color} hover:${typeInfo?.color}`}>
        {typeInfo?.icon} {typeInfo?.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-3 text-gray-500">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Activity Logger</h1>
          <p className="text-sm text-muted-foreground mt-1">Log and track environmental activities</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              🔍 Showing results for: "{searchQuery}"
            </p>
          )}
        </div>
        
        {canCreate && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-md"
          >
            <Plus className="w-4 h-4" />
            Log Activity
          </Button>
        )}
      </div>

      {/* Filters only - Search removed */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-1 block">Activity Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Types</option>
              {activityTypes.map(type => (
                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {/* Activities Table - Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">School</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-center px-4 py-3">Students</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-center px-4 py-3">Actions</th>
              </tr>
          </thead>
          <tbody>
            {filteredActivities.map((activity) => (
              <tr key={activity.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{activity.title}</td>
                <td className="px-4 py-3">{getTypeBadge(activity.type)}</td>
                <td className="px-4 py-3">{activity.school_name}</td>
                <td className="px-4 py-3">{new Date(activity.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">{activity.students_participated}</td>
                <td className="px-4 py-3 text-center">{getStatusBadge(activity.status)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {canApprove && (
                      <button 
                        onClick={() => updateActivityStatus(activity.id, 'approved')} 
                        disabled={actionLoading === activity.id}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {canVerify && (
                      <button 
                        onClick={() => updateActivityStatus(activity.id, 'verified')} 
                        disabled={actionLoading === activity.id}
                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Verify"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}
                    {canReject && (
                      <button 
                        onClick={() => updateActivityStatus(activity.id, 'rejected')} 
                        disabled={actionLoading === activity.id}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => viewActivityDetails(activity)} 
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {(canDelete || (user?.role === 'principal' && user?.school === activity.school_name)) && (
                      <button 
                        onClick={() => handleDelete(activity.id, activity.school_name)} 
                        disabled={actionLoading === activity.id}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-base flex-1">{activity.title}</h3>
                {getStatusBadge(activity.status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Type:</span>
                  {getTypeBadge(activity.type)}
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  <span>{activity.school_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{activity.students_participated} students</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                {canApprove && (
                  <Button 
                    onClick={() => updateActivityStatus(activity.id, 'approved')} 
                    disabled={actionLoading === activity.id}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                )}
                {canVerify && (
                  <Button 
                    onClick={() => updateActivityStatus(activity.id, 'verified')} 
                    disabled={actionLoading === activity.id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verify
                  </Button>
                )}
                {canReject && (
                  <Button 
                    onClick={() => updateActivityStatus(activity.id, 'rejected')} 
                    disabled={actionLoading === activity.id}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                )}
                <Button 
                  onClick={() => viewActivityDetails(activity)} 
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
                {(canDelete || (user?.role === 'principal' && user?.school === activity.school_name)) && (
                  <Button 
                    onClick={() => handleDelete(activity.id, activity.school_name)} 
                    disabled={actionLoading === activity.id}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-medium">
            {searchQuery ? `No activities found for "${searchQuery}"` : 'No activities found'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? 'Try a different search term' : 'Try adjusting your filters'}
          </p>
          {canCreate && !searchQuery && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Activity
            </Button>
          )}
        </div>
      )}

      {/* Activity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Log New Activity</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Activity Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Tree Plantation Drive"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Activity Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                  required
                >
                  {activityTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {lang === 'en' ? type.label : type.labelMr}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">School *</label>
                <select
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                  required
                >
                  <option value="">Select School</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.district})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    min={getTodayDate()}
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only current and future dates are allowed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Students Participated *</label>
                  <Input
                    type="number"
                    name="students_participated"
                    value={formData.students_participated}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Describe the activity..."
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                  {submitting ? 'Submitting...' : 'Submit Activity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Activity Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</label>
                <p className="text-xl font-bold text-foreground mt-1">{selectedActivity.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activity Type</label>
                  <div className="mt-1">{getTypeBadge(selectedActivity.type)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedActivity.status === 'verified' ? 'bg-green-100 text-green-700' :
                      selectedActivity.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      selectedActivity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedActivity.status === 'verified' && '✅ Verified'}
                      {selectedActivity.status === 'approved' && '✓ Approved'}
                      {selectedActivity.status === 'pending' && '⏳ Pending'}
                      {selectedActivity.status === 'rejected' && '✗ Rejected'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">School</label>
                <p className="text-base text-foreground mt-1 flex items-center gap-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  {selectedActivity.school_name}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                  <p className="text-base text-foreground mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(selectedActivity.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Students Participated</label>
                  <p className="text-base text-foreground mt-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-green-600">{selectedActivity.students_participated}</span> students
                  </p>
                </div>
              </div>
              
              {selectedActivity.description && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                  <div className="mt-2 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                      {selectedActivity.description}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedActivity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <Button 
                onClick={() => setShowDetailsModal(false)}
                variant="outline"
                className="px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogger;