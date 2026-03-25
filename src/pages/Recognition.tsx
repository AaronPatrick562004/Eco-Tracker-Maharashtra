// src/pages/Recognition.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { Award, Heart, Share2, Plus, Edit, Trash2, X, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Recognition {
  id: string;
  title: string;
  description: string;
  recipient: string;
  recipient_role: string;
  school: string;
  district: string;
  block: string;
  date: string;
  type: string;
  category: string;
  likes: number;
  created_at: string;
}

interface Props {
  lang: Language;
}

const Recognition = ({ lang }: Props) => {
  const t = translations[lang];
  const { user, hasPermission } = useAuth();
  
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    recipient: '', 
    recipient_role: '', 
    school: '', 
    district: '',
    block: '',
    date: getTodayDate(), 
    type: 'teacher', 
    category: 'green'
  });

  // ✅ FIX: Direct role-based permissions for recognition
  const canCreate = user?.role === 'state' || 
                    user?.role === 'deo' || 
                    user?.role === 'beo' ||
                    user?.role === 'principal';
  
  const canDelete = user?.role === 'state' || 
                    user?.role === 'deo' || 
                    user?.role === 'beo';
  
  const canEdit = user?.role === 'state' || 
                  user?.role === 'deo' || 
                  user?.role === 'beo';

  useEffect(() => {
    fetchRecognitions();
    
    const subscription = supabase
      .channel('recognitions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'recognitions' },
        () => fetchRecognitions()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRecognitions = async () => {
    try {
      setLoading(true);
      let query = supabase.from('recognitions').select('*');
      
      // ✅ Role-based filtering
      if (user?.role === 'principal' && user?.school) {
        query = query.eq('school', user.school);
      } else if (user?.role === 'beo' && user?.block) {
        query = query.eq('block', user.block);
      } else if (user?.role === 'deo' && user?.district) {
        query = query.eq('district', user.district);
      }
      // State sees all (no filter)
      
      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      setRecognitions(data || []);
    } catch (err) { 
      console.error(err); 
      setError('Failed to fetch recognitions');
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, date: selectedDate }));
  };

  // ✅ Open form with pre-filled data based on user role
  const openCreateForm = () => {
    // Reset form first
    setFormData({
      title: '', 
      description: '', 
      recipient: '', 
      recipient_role: '', 
      school: '', 
      district: '',
      block: '',
      date: getTodayDate(), 
      type: 'teacher', 
      category: 'green'
    });
    
    // Pre-fill based on user role
    if (user?.role === 'principal' && user?.school) {
      setFormData(prev => ({
        ...prev,
        school: user.school || '',
        district: user.district || '',
        block: user.block || ''
      }));
    } else if (user?.role === 'beo' && user?.block) {
      setFormData(prev => ({
        ...prev,
        block: user.block || '',
        district: user.district || ''
      }));
    } else if (user?.role === 'deo' && user?.district) {
      setFormData(prev => ({
        ...prev,
        district: user.district || ''
      }));
    }
    
    setShowForm(true);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.recipient.trim()) throw new Error('Recipient name is required');
      
      // ✅ Prevent DEO from creating for other districts
      if (user?.role === 'deo' && formData.district !== user.district) {
        throw new Error(`You can only create recognitions for ${user.district} district`);
      }
      
      // ✅ Prevent BEO from creating for other blocks
      if (user?.role === 'beo' && formData.block !== user.block) {
        throw new Error(`You can only create recognitions for ${user.block} block`);
      }
      
      // ✅ Prevent Principal from creating for other schools
      if (user?.role === 'principal' && formData.school !== user.school) {
        throw new Error(`You can only create recognitions for ${user.school}`);
      }
      
      const { error } = await supabase
        .from('recognitions')
        .insert([{ 
          ...formData, 
          likes: 0, 
          created_at: new Date().toISOString() 
        }]);
      
      if (error) throw error;
      
      setShowForm(false);
      setFormData({
        title: '', description: '', recipient: '', recipient_role: '', 
        school: '', district: '', block: '', date: getTodayDate(), 
        type: 'teacher', category: 'green'
      });
      fetchRecognitions();
      alert('✅ Recognition added successfully!');
    } catch (err: any) { 
      setError(err.message);
      alert('❌ Failed to add: ' + err.message);
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id: string, recognition: Recognition) => {
    // ✅ Prevent DEO from deleting other districts
    if (user?.role === 'deo' && recognition.district !== user.district) {
      alert('❌ You can only delete recognitions from your own district!');
      return;
    }
    
    // ✅ Prevent BEO from deleting other blocks
    if (user?.role === 'beo' && recognition.block !== user.block) {
      alert('❌ You can only delete recognitions from your own block!');
      return;
    }
    
    // ✅ Prevent Principal from deleting other schools
    if (user?.role === 'principal' && recognition.school !== user.school) {
      alert('❌ You can only delete recognitions from your own school!');
      return;
    }
    
    if (!confirm('Delete this recognition?')) return;
    
    try {
      const { error } = await supabase
        .from('recognitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchRecognitions();
      alert('✅ Deleted successfully!');
    } catch (err) { 
      alert('❌ Failed to delete'); 
    }
  };

  const handleLike = async (id: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('recognitions')
        .update({ likes: currentLikes + 1 })
        .eq('id', id);
      if (error) throw error;
      setRecognitions(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleShare = async (recognition: Recognition) => {
    const shareText = `${recognition.title}\n\n${recognition.description}\n\n🏆 Awarded to: ${recognition.recipient} (${recognition.recipient_role})\n🏫 School: ${recognition.school}\n📍 District: ${recognition.district}\n\n✨ Recognized by EcoTrack Maharashtra`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recognition.title,
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('✅ Recognition details copied to clipboard!');
      } catch (err) {
        alert('❌ Failed to copy');
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'green': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'innovation': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'community': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'excellence': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'green': return '🌱';
      case 'innovation': return '💡';
      case 'community': return '🤝';
      case 'excellence': return '🏆';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recognition & Awards</h1>
          <p className="text-muted-foreground mt-1">Celebrating excellence in environmental education</p>
        </div>
        {canCreate && (
          <Button 
            onClick={openCreateForm}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4" /> Add Recognition
          </Button>
        )}
      </div>

      {/* Add Recognition Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Recognition</h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Green School of the Year"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 resize-y"
                  placeholder="Describe the achievement..."
                />
              </div>

              {/* Recipient Name and Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="recipient"
                    value={formData.recipient}
                    onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                    placeholder="e.g., Mr. Patil S.R."
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <Input
                    name="recipient_role"
                    value={formData.recipient_role}
                    onChange={(e) => setFormData({...formData, recipient_role: e.target.value})}
                    placeholder="e.g., Coordinator, Principal, Student"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* School, District, Block */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    School
                  </label>
                  {/* ✅ Make School field read-only for Principal (auto-filled) */}
                  {user?.role === 'principal' ? (
                    <Input
                      value={user?.school || formData.school}
                      disabled
                      className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  ) : (
                    <Input
                      name="school"
                      value={formData.school}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      placeholder="e.g., ZP Primary School, Shirdi"
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  )}
                  {user?.role === 'principal' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-set to: {user?.school || 'your school'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    District
                  </label>
                  {/* ✅ Make District field read-only for BEO and Principal */}
                  {(user?.role === 'beo' || user?.role === 'principal') ? (
                    <Input
                      value={user?.district || formData.district}
                      disabled
                      className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  ) : (
                    <Input
                      name="district"
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                      placeholder="e.g., Ahmednagar"
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  )}
                  {(user?.role === 'beo' || user?.role === 'principal') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-set to: {user?.district || 'your district'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Block
                  </label>
                  {/* ✅ Make Block field read-only for BEO and Principal */}
                  {(user?.role === 'beo' || user?.role === 'principal') ? (
                    <Input
                      value={user?.block || formData.block}
                      disabled
                      className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  ) : (
                    <Input
                      name="block"
                      value={formData.block}
                      onChange={(e) => setFormData({...formData, block: e.target.value})}
                      placeholder="e.g., Haveli"
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  )}
                  {(user?.role === 'beo' || user?.role === 'principal') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-set to: {user?.block || 'your block'}
                    </p>
                  )}
                </div>
              </div>

              {/* Date, Type, Category - FIXED Date Picker */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    min={getTodayDate()}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only current and future dates are allowed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 cursor-pointer"
                  >
                    <option value="school">🏫 School</option>
                    <option value="teacher">👨‍🏫 Teacher</option>
                    <option value="student">👩‍🎓 Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 cursor-pointer"
                  >
                    <option value="green">🌱 Green</option>
                    <option value="innovation">💡 Innovation</option>
                    <option value="community">🤝 Community</option>
                    <option value="excellence">🏆 Excellence</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                  {submitting ? 'Adding...' : 'Add Recognition'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recognitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recognitions.map(rec => (
          <Card key={rec.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge className={getCategoryColor(rec.category)}>
                  {getCategoryIcon(rec.category)} {rec.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(rec.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mt-2">{rec.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 my-2">{rec.description}</p>
              <div className="flex items-center gap-3 my-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {rec.type === 'school' ? '🏫' : rec.type === 'teacher' ? '👨‍🏫' : '👩‍🎓'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{rec.recipient}</p>
                  <p className="text-xs text-muted-foreground">{rec.recipient_role}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {rec.district}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {rec.likes}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleLike(rec.id, rec.likes)}
                >
                  <Heart className="w-4 h-4 mr-1" /> Like
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleShare(rec)}
                >
                  <Share2 className="w-4 h-4 mr-1" /> Share
                </Button>
                {canDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(rec.id, rec)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {recognitions.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-medium">No recognitions yet</p>
          {canCreate && (
            <Button 
              onClick={openCreateForm} 
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Recognition
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Recognition;