// src/pages/SchoolPortal.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { 
  Plus, MapPin, Phone, Mail, Users, 
  CheckCircle, AlertTriangle, XCircle, School, ChevronRight, 
  Edit, Trash2, Eye, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface School {
  id: string;
  name: string;
  udise: string;
  district: string;
  block: string;
  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;
  students_count: number;
  status: "active" | "pending" | "inactive";
  compliance: "green" | "amber" | "red";
  created_at: string;
}

interface SchoolFormData {
  name: string;
  udise: string;
  district: string;
  block: string;
  coordinator_name: string;
  coordinator_phone: string;
  coordinator_email: string;
  students_count: number;
  status: "active" | "pending" | "inactive";
  compliance: "green" | "amber" | "red";
}

const statusConfig = {
  active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400" },
};

const complianceConfig = {
  green: { label: "Compliant", icon: CheckCircle, color: "text-green-600" },
  amber: { label: "Partial", icon: AlertTriangle, color: "text-yellow-600" },
  red: { label: "At Risk", icon: XCircle, color: "text-red-600" },
};

interface Props {
  lang: Language;
  searchQuery?: string; // ✅ Add searchQuery prop
}

const SchoolPortal = ({ lang, searchQuery = "" }: Props) => {
  const t = translations[lang];
  const { user, hasPermission } = useAuth();
  
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ❌ REMOVED local searchQuery state - using prop instead
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    udise: '',
    district: '',
    block: '',
    coordinator_name: '',
    coordinator_phone: '',
    coordinator_email: '',
    students_count: 0,
    status: 'active',
    compliance: 'green'
  });

  const canCreate = hasPermission('create', 'schools');
  const canEdit = hasPermission('update', 'schools');
  const canDelete = hasPermission('delete', 'schools');

  useEffect(() => {
    fetchSchools();
    
    const subscription = supabase
      .channel('schools-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schools' },
        () => {
          fetchSchools();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('schools').select('*');
      
      if (user?.role === 'principal' && user?.school) {
        query = query.eq('name', user.school);
      } else if (user?.role === 'beo' && user?.block) {
        query = query.eq('block', user.block);
      } else if (user?.role === 'deo' && user?.district) {
        query = query.eq('district', user.district);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setSchools(data || []);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'students_count' ? parseInt(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      udise: '',
      district: '',
      block: '',
      coordinator_name: '',
      coordinator_phone: '',
      coordinator_email: '',
      students_count: 0,
      status: 'active',
      compliance: 'green'
    });
  };

  const handleAddSchool = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      if (!formData.name.trim()) throw new Error('School name is required');
      if (!formData.udise.trim()) throw new Error('UDISE code is required');
      if (!formData.district.trim()) throw new Error('District is required');
      if (!formData.block.trim()) throw new Error('Block is required');
      
      const { error } = await supabase
        .from('schools')
        .insert([{
          name: formData.name.trim(),
          udise: formData.udise.trim(),
          district: formData.district.trim(),
          block: formData.block.trim(),
          coordinator_name: formData.coordinator_name,
          coordinator_phone: formData.coordinator_phone,
          coordinator_email: formData.coordinator_email,
          students_count: formData.students_count,
          status: formData.status,
          compliance: formData.compliance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      alert('✅ School added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchSchools();
      
    } catch (err: any) {
      setError(err.message);
      alert('❌ Failed to add school: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: formData.name,
          udise: formData.udise,
          district: formData.district,
          block: formData.block,
          coordinator_name: formData.coordinator_name,
          coordinator_phone: formData.coordinator_phone,
          coordinator_email: formData.coordinator_email,
          students_count: formData.students_count,
          status: formData.status,
          compliance: formData.compliance,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSchool.id);
      
      if (error) throw error;
      
      alert('✅ School updated successfully!');
      setShowEditModal(false);
      setEditingSchool(null);
      resetForm();
      fetchSchools();
      
    } catch (err: any) {
      setError(err.message);
      alert('❌ Failed to update school: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school? This will also delete all associated activities and student records.')) return;
    
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      if (selectedSchool?.id === id) {
        setSelectedSchool(null);
      }
      alert('✅ School deleted successfully!');
      fetchSchools();
      
    } catch (err: any) {
      setError(err.message);
      alert('❌ Failed to delete school: ' + err.message);
    }
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      udise: school.udise,
      district: school.district,
      block: school.block,
      coordinator_name: school.coordinator_name || '',
      coordinator_phone: school.coordinator_phone || '',
      coordinator_email: school.coordinator_email || '',
      students_count: school.students_count,
      status: school.status,
      compliance: school.compliance
    });
    setShowEditModal(true);
  };

  const handleVerifySchool = async (id: string, compliance: 'green' | 'amber' | 'red') => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ 
          compliance, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      alert(`✅ School marked as ${compliance}!`);
      fetchSchools();
      
    } catch (err: any) {
      alert('❌ Failed to update compliance');
    }
  };

  const getComplianceIcon = (compliance: string) => {
    const config = complianceConfig[compliance as keyof typeof complianceConfig];
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  // ✅ Filter schools using searchQuery from TopBar
  const filteredSchools = schools.filter(school => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return school.name.toLowerCase().includes(query) ||
           school.udise.includes(query) ||
           school.district.toLowerCase().includes(query);
  });

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    if (window.innerWidth < 1024) {
      setShowMobileDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileDetail(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mobile detail view
  if (showMobileDetail && selectedSchool) {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>Back to list</span>
        </button>

        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-lg">{selectedSchool.name}</h3>
              {getComplianceIcon(selectedSchool.compliance)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">UDISE: {selectedSchool.udise}</p>
          </div>
          
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground">{selectedSchool.block}</p>
                  <p className="text-muted-foreground text-xs">{selectedSchool.district}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">{selectedSchool.coordinator_name || 'Not assigned'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">{selectedSchool.coordinator_phone || 'Not available'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground break-all">{selectedSchool.coordinator_email || 'Not available'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Students</p>
                <p className="text-sm font-semibold text-foreground">{selectedSchool.students_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1", statusConfig[selectedSchool.status].className)}>
                  {statusConfig[selectedSchool.status].label}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
              
              {canEdit && (
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600"
                  onClick={() => handleEditSchool(selectedSchool)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit School
                </Button>
              )}
              
              {(user?.role === 'beo' || user?.role === 'deo' || user?.role === 'state') && (
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerifySchool(selectedSchool.id, 'green')}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Green
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => handleVerifySchool(selectedSchool.id, 'amber')}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Amber
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleVerifySchool(selectedSchool.id, 'red')}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Red
                  </Button>
                </div>
              )}
              
              {canDelete && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleDeleteSchool(selectedSchool.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete School
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">School Portal</h1>
          <p className="text-muted-foreground mt-1">Manage school registrations and coordinator details</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              🔍 Showing results for: "{searchQuery}"
            </p>
          )}
        </div>
        
        {canCreate && (
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add School
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <School className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Schools</p>
                <p className="text-xl font-bold">{schools.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{schools.filter(s => s.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-100">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{schools.filter(s => s.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gray-100">
                <XCircle className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inactive</p>
                <p className="text-xl font-bold">{schools.filter(s => s.status === 'inactive').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ❌ REMOVED PAGE SEARCH BOX */}

      {/* Schools Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3">School Name</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">UDISE</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">District</th>
                <th className="text-center px-4 py-3 hidden sm:table-cell">Students</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Eco</th>
                <th className="text-center px-4 py-3">Actions</th>
               </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school) => (
                  <tr
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    className="border-t hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium">
                      {school.name}
                      <span className="block text-xs text-muted-foreground font-mono sm:hidden mt-0.5">
                        {school.udise}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                      {school.udise}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {school.district}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground text-xs hidden sm:table-cell">
                      {school.students_count}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusConfig[school.status].className)}>
                        {statusConfig[school.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getComplianceIcon(school.compliance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(canEdit || (user?.role === 'principal' && school.name === user?.school)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSchool(school);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSchool(school.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          
          {filteredSchools.length === 0 && (
            <div className="text-center py-12">
              <School className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-medium">
                {searchQuery ? `No schools found for "${searchQuery}"` : 'No schools found'}
              </p>
              {canCreate && !searchQuery && (
                <Button 
                  onClick={() => setShowAddModal(true)} 
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First School
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* School Detail Panel (Desktop) */}
      {selectedSchool && !showMobileDetail && (
        <div className="bg-card rounded-xl border border-border p-5 mt-4">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{selectedSchool.name}</h3>
            {getComplianceIcon(selectedSchool.compliance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">UDISE: {selectedSchool.udise}</p>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{selectedSchool.block}, {selectedSchool.district}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{selectedSchool.coordinator_name || 'Not assigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{selectedSchool.coordinator_phone || 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="break-all">{selectedSchool.coordinator_email || 'Not available'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="font-semibold">{selectedSchool.students_count}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", statusConfig[selectedSchool.status].className)}>
                {statusConfig[selectedSchool.status].label}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Button>
            {canEdit && (
              <Button 
                variant="outline" 
                className="flex-1 border-blue-600 text-blue-600"
                onClick={() => handleEditSchool(selectedSchool)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => handleDeleteSchool(selectedSchool.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Add School Modal - same */}
      {showAddModal && (
        // ... keep existing modal code (unchanged)
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal content - keep as is */}
        </div>
      )}

      {/* Edit School Modal - same */}
      {showEditModal && editingSchool && (
        // ... keep existing modal code (unchanged)
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Modal content - keep as is */}
        </div>
      )}
    </div>
  );
};

export default SchoolPortal;