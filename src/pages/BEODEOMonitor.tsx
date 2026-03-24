// src/pages/BEODEOMonitor.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { School, CheckCircle, AlertTriangle, XCircle, Activity, Eye, Edit, X, MapPin, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Block {
  id: string;
  name: string;
  district: string;
}

interface School {
  id: string;
  name: string;
  udise: string;
  district: string;
  block: string;
  compliance: string;
  students_count: number;
  coordinator_name: string;
}

interface BlockStats {
  name: string;
  district: string;
  total_schools: number;
  compliant_schools: number;
  at_risk_schools: number;
  completion_rate: number;
}

interface Props {
  lang: Language;
}

const BEODEOMonitor = ({ lang }: Props) => {
  const t = translations[lang];
  const { user } = useAuth();
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    udise: '',
    district: '',
    block: '',
    compliance: '',
    students_count: 0,
    coordinator_name: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewingSchool, setViewingSchool] = useState<School | null>(null);

  const canEdit = user?.role === 'state' || user?.role === 'deo' || user?.role === 'beo';
  const canEditAll = user?.role === 'state';

  // CALCULATE BLOCK STATISTICS - Shows ALL blocks from database
  const blockStats = useMemo(() => {
    const stats: BlockStats[] = [];
    
    // Create a map for ALL blocks from the blocks table
    const blockMap = new Map<string, {
      district: string;
      total: number;
      compliant: number;
      atRisk: number;
    }>();
    
    // First, add ALL blocks from the blocks table
    blocks.forEach(block => {
      blockMap.set(block.name, {
        district: block.district,
        total: 0,
        compliant: 0,
        atRisk: 0
      });
    });
    
    // Then, count schools for each block
    schools.forEach(school => {
      const blockData = blockMap.get(school.block);
      if (blockData) {
        blockData.total++;
        if (school.compliance === 'green') {
          blockData.compliant++;
        }
        if (school.compliance === 'red') {
          blockData.atRisk++;
        }
      } else {
        // If a school's block doesn't exist in blocks table, add it
        blockMap.set(school.block, {
          district: school.district,
          total: 1,
          compliant: school.compliance === 'green' ? 1 : 0,
          atRisk: school.compliance === 'red' ? 1 : 0
        });
      }
    });
    
    // Convert to array and calculate completion rate
    blockMap.forEach((data, blockName) => {
      const completionRate = data.total > 0 ? (data.compliant / data.total) * 100 : 0;
      
      stats.push({
        name: blockName,
        district: data.district,
        total_schools: data.total,
        compliant_schools: data.compliant,
        at_risk_schools: data.atRisk,
        completion_rate: completionRate
      });
    });
    
    return stats.sort((a, b) => a.name.localeCompare(b.name));
  }, [blocks, schools]);

  useEffect(() => {
    fetchData();
    
    const blocksSubscription = supabase
      .channel('blocks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blocks' },
        () => fetchData()
      )
      .subscribe();
    
    const schoolsSubscription = supabase
      .channel('schools-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schools' },
        () => fetchData()
      )
      .subscribe();
    
    return () => {
      blocksSubscription.unsubscribe();
      schoolsSubscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL blocks - NO ROLE FILTERING to get all blocks
      // This ensures we get ALL blocks from the database
      const { data: blocksData, error: blocksError } = await supabase
        .from('blocks')
        .select('id, name, district')
        .order('district', { ascending: true })
        .order('name', { ascending: true });
      
      if (blocksError) throw blocksError;
      
      // Fetch schools with role-based filtering
      let schoolsQuery = supabase.from('schools').select('*');
      
      if (user?.role === 'beo' && user?.block) {
        schoolsQuery = schoolsQuery.eq('block', user.block);
      } else if (user?.role === 'deo' && user?.district) {
        schoolsQuery = schoolsQuery.eq('district', user.district);
      }
      
      const { data: schoolsData, error: schoolsError } = await schoolsQuery.order('name');
      
      if (schoolsError) throw schoolsError;
      
      console.log("📊 Total blocks in database:", blocksData?.length);
      console.log("📊 Blocks:", blocksData?.map(b => b.name));
      console.log("🏫 Total schools:", schoolsData?.length);
      console.log("🏫 Schools by block:", schoolsData?.reduce((acc, s) => {
        acc[s.block] = (acc[s.block] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      setBlocks(blocksData || []);
      setSchools(schoolsData || []);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchool = (school: School) => {
    setViewingSchool(school);
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setEditFormData({
      name: school.name,
      udise: school.udise,
      district: school.district,
      block: school.block,
      compliance: school.compliance,
      students_count: school.students_count,
      coordinator_name: school.coordinator_name || ''
    });
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: editFormData.name,
          udise: editFormData.udise,
          district: editFormData.district,
          block: editFormData.block,
          compliance: editFormData.compliance,
          students_count: editFormData.students_count,
          coordinator_name: editFormData.coordinator_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSchool.id);
      
      if (error) throw error;
      
      alert('✅ School updated successfully!');
      setEditingSchool(null);
      fetchData();
      
    } catch (err: any) {
      alert('❌ Failed to update school');
      console.error('Update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplianceChange = async (id: string, newCompliance: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ 
          compliance: newCompliance,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      alert(`✅ School marked as ${newCompliance.toUpperCase()}!`);
      fetchData();
      
    } catch (err: any) {
      alert('❌ Failed to update compliance');
    }
  };

  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case 'green':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Compliant</span>;
      case 'amber':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Partial</span>;
      case 'red':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">At Risk</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{compliance}</span>;
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'green': return 'text-green-600';
      case 'amber': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceText = (compliance: string) => {
    switch (compliance) {
      case 'green': return 'Compliant ✓';
      case 'amber': return 'Partial ⚠️';
      case 'red': return 'At Risk 🔴';
      default: return compliance;
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         school.udise.includes(searchQuery);
    const matchesBlock = selectedBlock === 'all' || school.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  const totalSchools = schools.length;
  const compliantSchools = schools.filter(s => s.compliance === 'green').length;
  const atRiskSchools = schools.filter(s => s.compliance === 'red').length;
  const complianceRate = totalSchools > 0 ? (compliantSchools / totalSchools) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">BEO/DEO Monitor</h1>
        <p className="text-muted-foreground mt-1">Monitor school compliance and activities</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <School className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Schools</p>
                <p className="text-xl font-bold">{totalSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compliant</p>
                <p className="text-xl font-bold">{compliantSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">At Risk</p>
                <p className="text-xl font-bold">{atRiskSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compliance Rate</p>
                <p className="text-xl font-bold">{complianceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Compliance</span>
            <span className="text-sm font-medium">{complianceRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${complianceRate}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Blocks Overview - Shows ALL blocks from database */}
      {blockStats.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Blocks Overview</h2>
            <p className="text-sm text-muted-foreground">
              Showing {blockStats.length} block{blockStats.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blockStats.map((block) => (
              <Card key={block.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{block.name}</h3>
                      <p className="text-sm text-muted-foreground">{block.district}</p>
                    </div>
                    {block.total_schools === 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                        No Schools
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{block.total_schools}</p>
                      <p className="text-xs text-muted-foreground">Schools</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{block.compliant_schools}</p>
                      <p className="text-xs text-muted-foreground">Compliant</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{block.at_risk_schools}</p>
                      <p className="text-xs text-muted-foreground">At Risk</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completion Rate</span>
                      <span>{block.completion_rate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-500 ${
                          block.completion_rate >= 75 ? 'bg-green-500' :
                          block.completion_rate >= 50 ? 'bg-yellow-500' :
                          block.completion_rate > 0 ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${block.completion_rate}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Schools List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Schools List</h2>
        
        <div className="flex gap-3">
          <Input
            placeholder="Search by school name or UDISE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-card"
          >
            <option value="all">All Blocks</option>
            {blockStats.map(block => (
              <option key={block.name} value={block.name}>{block.name}</option>
            ))}
          </select>
        </div>
        
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3">School Name</th>
                  <th className="text-left px-4 py-3">UDISE</th>
                  <th className="text-left px-4 py-3">Block</th>
                  <th className="text-center px-4 py-3">Students</th>
                  <th className="text-center px-4 py-3">Compliance</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{school.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{school.udise}</td>
                      <td className="px-4 py-3">{school.block}</td>
                      <td className="px-4 py-3 text-center">{school.students_count}</td>
                      <td className="px-4 py-3 text-center">{getComplianceBadge(school.compliance)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleViewSchool(school)}
                            title="View School Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {canEdit && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleEditSchool(school)}
                              title="Edit School"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <School className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-foreground">No schools found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View School Modal */}
      {viewingSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <School className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">School Details</h3>
              </div>
              <button 
                onClick={() => setViewingSchool(null)} 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {viewingSchool.name}
                </h4>
                {viewingSchool.udise && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    UDISE: {viewingSchool.udise}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">District</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {viewingSchool.district || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Block</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {viewingSchool.block || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Students</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {viewingSchool.students_count?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {viewingSchool.compliance === 'green' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                  {viewingSchool.compliance === 'amber' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                  {viewingSchool.compliance === 'red' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Compliance Status</p>
                    <p className={`text-base font-medium ${getComplianceColor(viewingSchool.compliance)}`}>
                      {getComplianceText(viewingSchool.compliance)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg md:col-span-2">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Coordinator</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {viewingSchool.coordinator_name || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setViewingSchool(null)}>Close</Button>
              {canEdit && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    handleEditSchool(viewingSchool);
                    setViewingSchool(null);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit School
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit School Modal */}
      {editingSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit School</h3>
              <button onClick={() => setEditingSchool(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School Name</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UDISE Code</label>
                  <Input
                    value={editFormData.udise}
                    onChange={(e) => setEditFormData({...editFormData, udise: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                  <Input
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({...editFormData, district: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Block</label>
                  <Input
                    value={editFormData.block}
                    onChange={(e) => setEditFormData({...editFormData, block: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Count</label>
                  <Input
                    type="number"
                    value={editFormData.students_count}
                    onChange={(e) => setEditFormData({...editFormData, students_count: parseInt(e.target.value) || 0})}
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compliance Status</label>
                  <select
                    value={editFormData.compliance}
                    onChange={(e) => setEditFormData({...editFormData, compliance: e.target.value})}
                    className="w-full p-2.5 border-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    style={{
                      borderColor: editFormData.compliance === 'green' ? '#22c55e' : 
                                   editFormData.compliance === 'amber' ? '#eab308' : 
                                   editFormData.compliance === 'red' ? '#ef4444' : '#d1d5db'
                    }}
                  >
                    <option value="green">🟢 Green (Compliant)</option>
                    <option value="amber">🟡 Amber (Partial)</option>
                    <option value="red">🔴 Red (At Risk)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coordinator Name</label>
                  <Input
                    value={editFormData.coordinator_name}
                    onChange={(e) => setEditFormData({...editFormData, coordinator_name: e.target.value})}
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="Enter coordinator name"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditingSchool(null)}>Cancel</Button>
              <Button onClick={handleUpdateSchool} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BEODEOMonitor;