// src/pages/GovernmentResolutions.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { FileText, Download, Calendar, Tag, Search, Filter, Eye, Bookmark, Plus, Edit, Trash2, X } from 'lucide-react';
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
];

const filterCategories = ["All", "Policy", "Guidelines", "Regulation", "Scheme", "Circular"];

interface Props {
  lang: Language;
}

const GovernmentResolutions = ({ lang }: Props) => {
  const t = translations[lang];
  const { user, hasPermission } = useAuth();
  
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResolution, setEditingResolution] = useState<Resolution | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewResolution, setPreviewResolution] = useState<Resolution | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
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

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('resolutions')
        .insert([{
          title: formData.title,
          number: formData.number,
          date: formData.date,
          department: formData.department,
          category: formData.category,
          description: formData.description,
          file_url: formData.file_url,
          tags: formData.tags.split(',').map(t => t.trim()),
          downloads: 0,
          is_new: true,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowCreateModal(false);
      setFormData({
        title: '', number: '', date: new Date().toISOString().split('T')[0],
        department: '', category: 'Policy', description: '', file_url: '', tags: ''
      });
      fetchResolutions();
      alert('✅ Resolution added!');
    } catch (err: any) {
      alert('❌ Failed to add resolution');
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
          title: formData.title,
          number: formData.number,
          date: formData.date,
          department: formData.department,
          category: formData.category,
          description: formData.description,
          file_url: formData.file_url,
          tags: formData.tags.split(',').map(t => t.trim()),
        })
        .eq('id', editingResolution.id);
      
      if (error) throw error;
      
      setShowEditModal(false);
      setEditingResolution(null);
      fetchResolutions();
      alert('✅ Resolution updated!');
    } catch (err: any) {
      alert('❌ Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resolution?')) return;
    try {
      const { error } = await supabase.from('resolutions').delete().eq('id', id);
      if (error) throw error;
      fetchResolutions();
      alert('✅ Resolution deleted');
    } catch (err: any) {
      alert('❌ Failed to delete');
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
      // Increment download count in database
      const { error } = await supabase
        .from('resolutions')
        .update({ downloads: (resolution.downloads || 0) + 1 })
        .eq('id', resolution.id);
      
      if (error) throw error;
      
      // If there's a file URL, open it in new tab
      if (resolution.file_url) {
        window.open(resolution.file_url, '_blank');
        alert(`📄 Downloading: ${resolution.title}`);
      } else {
        // If no file URL, create a text file with resolution details
        const content = `
RESOLUTION DETAILS
==================
Title: ${resolution.title}
Number: ${resolution.number}
Date: ${resolution.date}
Department: ${resolution.department}
Category: ${resolution.category}
Tags: ${resolution.tags?.join(', ') || 'None'}

DESCRIPTION:
${resolution.description}

----------------------------------------
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
      
      // Refresh to update download count
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
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         res.number.toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-2xl font-bold">Government Resolutions</h1>
          <p className="text-muted-foreground mt-1">Official circulars and guidelines for schools</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-green-600">
            <Plus className="w-4 h-4" /> New Resolution
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-blue-100"><FileText className="w-4 h-4 text-blue-600" /></div><div><p className="text-xs">Total GRs</p><p className="text-xl font-bold">{resolutions.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-green-100"><Tag className="w-4 h-4 text-green-600" /></div><div><p className="text-xs">Categories</p><p className="text-xl font-bold">{filterCategories.length - 1}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-amber-100"><Download className="w-4 h-4 text-amber-600" /></div><div><p className="text-xs">Downloads</p><p className="text-xl font-bold">{resolutions.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-purple-100"><Calendar className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs">This Month</p><p className="text-xl font-bold">{resolutions.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length}</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterCategories.map(cat => (
          <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search resolutions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Resolutions List */}
      <div className="space-y-3">
        {filteredResolutions.map(res => (
          <Card key={res.id} className="hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div><h3 className="font-semibold">{res.title}</h3><p className="text-sm text-muted-foreground mt-1 line-clamp-2">{res.description}</p></div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleBookmark(res.id)}><Bookmark className={bookmarked.includes(res.id) ? "fill-current text-yellow-500" : ""} /></Button>
                      {canEdit && <Button variant="ghost" size="sm" onClick={() => handleEdit(res)}><Edit className="w-4 h-4" /></Button>}
                      {canDelete && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(res.id)}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{res.number}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(res.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{res.department}</span>
                    <span className="flex items-center gap-1"><Download className="w-3 h-3" />{res.downloads} downloads</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {res.tags?.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {/* Preview Button - WORKING */}
                    <Button size="sm" variant="outline" onClick={() => handlePreview(res)}>
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>
                    {/* Download Button - WORKING */}
                    <Button size="sm" variant="outline" onClick={() => handleDownload(res)}>
                      <Download className="w-4 h-4 mr-1" /> Download ({res.downloads})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Resolution Preview</h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    previewResolution.category === 'Policy' ? 'bg-blue-100 text-blue-700' :
                    previewResolution.category === 'Guidelines' ? 'bg-green-100 text-green-700' :
                    previewResolution.category === 'Regulation' ? 'bg-red-100 text-red-700' :
                    previewResolution.category === 'Scheme' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {previewResolution.category}
                  </span>
                  {previewResolution.is_new && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">New</span>
                  )}
                </div>
                <h1 className="text-2xl font-bold">{previewResolution.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Resolution No: {previewResolution.number}
                </p>
              </div>
              
              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(previewResolution.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{previewResolution.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                  <p className="font-medium">{previewResolution.downloads}</p>
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
              
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{previewResolution.description}</p>
                </div>
              </div>
              
              {/* File Link */}
              {previewResolution.file_url && (
                <div>
                  <h3 className="font-semibold mb-2">Attached File</h3>
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
              
              {/* Footer */}
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
              <h3 className="text-xl font-bold">Create Resolution</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Environmental Education Mandate for All Schools" required />
                <p className="text-xs text-muted-foreground mt-1">Enter a clear, descriptive title for the resolution</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number *</label>
                  <Input name="number" value={formData.number} onChange={handleInputChange} placeholder="e.g., GR-2024-01-001" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Education Department" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800">
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full p-3 border rounded-lg resize-y" placeholder="Enter detailed description of the resolution..." />
                <p className="text-xs text-muted-foreground mt-1">Provide a comprehensive description of the resolution's purpose, scope, and implementation guidelines</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">File URL</label>
                <Input name="file_url" value={formData.file_url} onChange={handleInputChange} placeholder="https://example.com/resolution.pdf" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="education, environment, policy" />
                <p className="text-xs text-muted-foreground mt-1">Add relevant keywords to help with search</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-green-600">{submitting ? 'Saving...' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Resolution</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number *</label>
                  <Input name="number" value={formData.number} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g., Education Department" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800">
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full p-3 border rounded-lg resize-y" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">File URL</label>
                <Input name="file_url" value={formData.file_url} onChange={handleInputChange} placeholder="https://example.com/resolution.pdf" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="education, environment, policy" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={submitting} className="bg-green-600">{submitting ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentResolutions;