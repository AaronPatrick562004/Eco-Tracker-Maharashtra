// src/pages/GovernmentResolutions.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { FileText, Download, Calendar, Tag, Filter, Eye, Bookmark, Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Resolution {
  id: string;
  title: string;
  number: string;
  date: string;
  department: string;
  category: string;
  description: string;
  file_url: string;
  downloads: number;
  tags: string[];
  is_new: boolean;
  created_at: string;
}

const categories = [
  { value: "Policy", label: "📋 Policy", color: "bg-blue-100 text-blue-700" },
  { value: "Guidelines", label: "📘 Guidelines", color: "bg-green-100 text-green-700" },
  { value: "Regulation", label: "⚖️ Regulation", color: "bg-red-100 text-red-700" },
  { value: "Scheme", label: "🎯 Scheme", color: "bg-purple-100 text-purple-700" },
  { value: "Circular", label: "📢 Circular", color: "bg-amber-100 text-amber-700" },
  { value: "Recognition", label: "🏆 Recognition", color: "bg-pink-100 text-pink-700" },
];

const filterCategories = ["All", "Policy", "Guidelines", "Regulation", "Scheme", "Circular", "Recognition"];

interface Props {
  lang: Language;
  searchQuery?: string;
}

const GovernmentResolutions = ({ lang, searchQuery = "" }: Props) => {
  const t = translations[lang];
  const { user, hasPermission } = useAuth();
  
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResolution, setEditingResolution] = useState<Resolution | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewResolution, setPreviewResolution] = useState<Resolution | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    date: getTodayDate(),
    department: '',
    category: 'Policy',
    description: '',
    file_url: '',
    tags: ''
  });

  const canCreate = hasPermission('create', 'resolutions');
  const canEdit = hasPermission('update', 'resolutions');
  const canDelete = hasPermission('delete', 'resolutions');

  useEffect(() => {
    fetchResolutions();
    
    const subscription = supabase
      .channel('resolutions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'resolutions' },
        () => {
          fetchResolutions();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchResolutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resolutions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setResolutions(data || []);
    } catch (err: any) {
      console.error('Error fetching resolutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, date: selectedDate }));
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.number.trim()) {
      alert('Please enter a resolution number');
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('resolutions')
        .insert([{
          title: formData.title.trim(),
          number: formData.number.trim(),
          date: formData.date,
          department: formData.department.trim(),
          category: formData.category,
          description: formData.description.trim(),
          file_url: formData.file_url.trim(),
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          downloads: 0,
          is_new: true,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowCreateModal(false);
      setFormData({
        title: '', number: '', date: getTodayDate(),
        department: '', category: 'Policy', description: '', file_url: '', tags: ''
      });
      fetchResolutions();
      alert('✅ Resolution added successfully!');
    } catch (err: any) {
      console.error('Create error:', err);
      alert('❌ Failed to add resolution: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingResolution) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('resolutions')
        .update({
          title: formData.title.trim(),
          number: formData.number.trim(),
          date: formData.date,
          department: formData.department.trim(),
          category: formData.category,
          description: formData.description.trim(),
          file_url: formData.file_url.trim(),
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        })
        .eq('id', editingResolution.id);
      
      if (error) throw error;
      
      setShowEditModal(false);
      setEditingResolution(null);
      fetchResolutions();
      alert('✅ Resolution updated successfully!');
    } catch (err: any) {
      alert('❌ Failed to update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resolution?')) return;
    try {
      const { error } = await supabase.from('resolutions').delete().eq('id', id);
      if (error) throw error;
      fetchResolutions();
      alert('✅ Resolution deleted successfully');
    } catch (err: any) {
      alert('❌ Failed to delete: ' + err.message);
    }
  };

  const handleEdit = (resolution: Resolution) => {
    setEditingResolution(resolution);
    setFormData({
      title: resolution.title,
      number: resolution.number,
      date: resolution.date,
      department: resolution.department,
      category: resolution.category,
      description: resolution.description,
      file_url: resolution.file_url || '',
      tags: resolution.tags?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  const handlePreview = (resolution: Resolution) => {
    setPreviewResolution(resolution);
    setShowPreviewModal(true);
  };

  const handleDownload = async (resolution: Resolution) => {
    try {
      const { error } = await supabase
        .from('resolutions')
        .update({ downloads: (resolution.downloads || 0) + 1 })
        .eq('id', resolution.id);
      
      if (error) throw error;
      
      if (resolution.file_url) {
        window.open(resolution.file_url, '_blank');
        alert(`📄 Downloading: ${resolution.title}`);
      } else {
        const content = `
╔══════════════════════════════════════════════════════════════╗
║                    GOVERNMENT RESOLUTION                      ║
║                    ECOTRACK MAHARASHTRA                      ║
╚══════════════════════════════════════════════════════════════╝

Title: ${resolution.title}
Number: ${resolution.number}
Date: ${resolution.date}
Department: ${resolution.department}
Category: ${resolution.category}
Tags: ${resolution.tags?.join(', ') || 'None'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESCRIPTION:
${resolution.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Downloaded from EcoTrack Maharashtra
Date: ${new Date().toLocaleString()}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resolution.number}_${resolution.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`✅ Downloaded: ${resolution.title}`);
      }
      
      fetchResolutions();
      
    } catch (err: any) {
      console.error('Download error:', err);
      alert('❌ Failed to download');
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const filteredResolutions = resolutions.filter(res => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesSearch = res.title.toLowerCase().includes(query) ||
                         res.number.toLowerCase().includes(query) ||
                         res.description?.toLowerCase().includes(query) ||
                         res.department?.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-2xl font-bold text-foreground">Government Resolutions</h1>
          <p className="text-muted-foreground mt-1">Official circulars and guidelines for schools</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              🔍 Showing results for: "{searchQuery}"
            </p>
          )}
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4" /> New Resolution
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total GRs</p>
                <p className="text-xl font-bold text-foreground">{resolutions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categories</p>
                <p className="text-xl font-bold text-foreground">{filterCategories.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Downloads</p>
                <p className="text-xl font-bold text-foreground">{resolutions.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-foreground">{resolutions.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterCategories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? "bg-primary text-primary-foreground" : ""}
          >
            {cat === "Recognition" ? "🏆 Recognition" : cat}
          </Button>
        ))}
      </div>

      {/* Resolutions List */}
      <div className="space-y-3">
        {filteredResolutions.length > 0 ? (
          filteredResolutions.map(res => (
            <Card key={res.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{res.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{res.description}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleBookmark(res.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarked.includes(res.id) ? "fill-current text-yellow-500" : ""}`} />
                        </Button>
                        {canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(res)} className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(res.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {res.number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(res.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {res.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {res.downloads || 0} downloads
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {res.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(res)}>
                        <Eye className="w-4 h-4 mr-1" /> Preview
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(res)}>
                        <Download className="w-4 h-4 mr-1" /> Download ({res.downloads || 0})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">
              {searchQuery ? `No resolutions found for "${searchQuery}"` : 'No resolutions found'}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first government resolution'}
            </p>
            {canCreate && !searchQuery && (
              <Button onClick={() => setShowCreateModal(true)} className="mt-4 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Resolution
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Resolution Preview</h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categories.find(c => c.value === previewResolution.category)?.color || "bg-gray-100"}>
                    {previewResolution.category === "Recognition" ? "🏆" : ""} {previewResolution.category}
                  </Badge>
                  {previewResolution.is_new && (
                    <Badge className="bg-green-100 text-green-700">New</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{previewResolution.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Resolution No: {previewResolution.number}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{new Date(previewResolution.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{previewResolution.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                  <p className="font-medium text-foreground">{previewResolution.downloads}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewResolution.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <div className="bg-muted/20 rounded-lg p-4 whitespace-pre-wrap text-muted-foreground">
                  {previewResolution.description}
                </div>
              </div>
              
              {previewResolution.file_url && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Attached File</h3>
                  <a 
                    href={previewResolution.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Full Document
                  </a>
                </div>
              )}
              
              <div className="border-t pt-4 text-xs text-muted-foreground">
                <p>Source: EcoTrack Maharashtra, Government of Maharashtra</p>
                <p>Last Updated: {new Date(previewResolution.created_at).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close</Button>
              <Button onClick={() => handleDownload(previewResolution)} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Create Resolution</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Title *</label>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Environmental Education Mandate for All Schools"
                  className="w-full bg-white dark:bg-gray-800 text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter a clear, descriptive title for the resolution</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Number *</label>
                  <Input 
                    name="number" 
                    value={formData.number} 
                    onChange={handleInputChange} 
                    placeholder="e.g., GR-2024-01-001"
                    className="w-full bg-white dark:bg-gray-800 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Date</label>
                  <Input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleDateChange}
                    min={getTodayDate()}
                    className="w-full bg-white dark:bg-gray-800 text-foreground cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only current and future dates are allowed
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Department</label>
                  <Input 
                    name="department" 
                    value={formData.department} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Education Department"
                    className="w-full bg-white dark:bg-gray-800 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Category</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-foreground"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={8} 
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-foreground resize-y focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter the full text of the government resolution here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">File URL</label>
                <Input 
                  name="file_url" 
                  value={formData.file_url} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/resolution.pdf"
                  className="w-full bg-white dark:bg-gray-800 text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Tags (comma separated)</label>
                <Input 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleInputChange} 
                  placeholder="education, environment, policy"
                  className="w-full bg-white dark:bg-gray-800 text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Add relevant keywords to help with search</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                {submitting ? 'Creating...' : 'Create Resolution'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Edit Resolution</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Title *</label>
                <Input name="title" value={formData.title} onChange={handleInputChange} className="w-full" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Number *</label>
                  <Input name="number" value={formData.number} onChange={handleInputChange} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Date</label>
                  <Input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleDateChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Department</label>
                  <Input name="department" value={formData.department} onChange={handleInputChange} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800">
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={8} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-foreground resize-y" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">File URL</label>
                <Input name="file_url" value={formData.file_url} onChange={handleInputChange} placeholder="https://example.com/resolution.pdf" className="w-full" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Tags (comma separated)</label>
                <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="education, environment, policy" className="w-full" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentResolutions;