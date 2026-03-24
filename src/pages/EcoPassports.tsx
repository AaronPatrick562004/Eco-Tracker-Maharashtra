// src/pages/EcoPassports.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { Award, Users, Star, BookOpen, Plus, Edit, Trash2, X, Search, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Student {
  id: string;
  name: string;
  class: string;
  school_name: string;
  district: string;
  block: string;
  points: number;
  level: number;
  badges_count: number;
  activities_count: number;
  rank: string;
  status: string;
}

interface Props {
  lang: Language;
}

const EcoPassports = ({ lang }: Props) => {
  const t = translations[lang];
  const { user, hasPermission } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    school_name: '',
    district: '',
    block: '',
    points: 0,
    rank: 'Bronze'
  });

  // ✅ FIX 1: Direct role-based permissions (bypass hasPermission)
  const canCreate = user?.role === 'state' || 
                    user?.role === 'deo' || 
                    user?.role === 'beo' ||
                    user?.role === 'principal';
  
  const canUpdate = user?.role === 'state' || 
                    user?.role === 'deo' || 
                    user?.role === 'beo';
  
  const canDelete = user?.role === 'state' || 
                    user?.role === 'deo' || 
                    user?.role === 'beo';

  // ✅ FIX 2: Auto-fill district and block based on user role
  useEffect(() => {
    if (user?.role === 'beo' && user?.block) {
      setFormData(prev => ({
        ...prev,
        district: user.district || '',
        block: user.block || ''
      }));
    } else if (user?.role === 'deo' && user?.district) {
      setFormData(prev => ({
        ...prev,
        district: user.district || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchStudents();
    
    const subscription = supabase
      .channel('students-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' },
        () => fetchStudents()
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = supabase.from('students').select('*');
      
      if (user?.role === 'principal' && user?.school) {
        query = query.eq('school_name', user.school);
      } else if (user?.role === 'beo' && user?.block) {
        query = query.eq('block', user.block);
      } else if (user?.role === 'deo' && user?.district) {
        query = query.eq('district', user.district);
      }
      // State sees all (no filter)
      
      const { data, error } = await query.order('points', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err) { 
      console.error(err); 
      setError('Failed to fetch students');
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (!formData.name.trim()) throw new Error('Student name is required');
      if (!formData.school_name.trim()) throw new Error('School is required');
      if (!formData.district.trim()) throw new Error('District is required');
      
      // ✅ FIX 3: Validation for BEO - block must match their block
      if (user?.role === 'beo' && formData.block !== user.block) {
        throw new Error(`You can only add students for ${user.block} block`);
      }
      
      // ✅ FIX 4: Validation for DEO - district must match their district
      if (user?.role === 'deo' && formData.district !== user.district) {
        throw new Error(`You can only add students for ${user.district} district`);
      }
      
      const level = Math.floor(formData.points / 250) + 1;
      const { error } = await supabase
        .from('students')
        .insert([{ 
          name: formData.name.trim(),
          class: formData.class,
          school_name: formData.school_name.trim(),
          district: formData.district.trim(),
          block: formData.block,
          points: formData.points,
          level: level,
          rank: formData.rank,
          status: 'active',
          badges_count: 0,
          activities_count: 0,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowForm(false);
      // Reset form but preserve auto-fill for BEO/DEO
      setFormData({ 
        name: '', 
        class: '', 
        school_name: '', 
        district: user?.role === 'beo' ? (user.district || '') : '',
        block: user?.role === 'beo' ? (user.block || '') : '',
        points: 0, 
        rank: 'Bronze' 
      });
      await fetchStudents();
      alert('✅ Student added successfully!');
    } catch (err: any) { 
      setError(err.message);
      alert('❌ Failed to add: ' + err.message);
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleAddPoints = async (id: string, currentPoints: number) => {
    const pointsToAdd = prompt('Enter points to add:', '50');
    if (!pointsToAdd) return;
    
    const newPoints = currentPoints + parseInt(pointsToAdd);
    const newLevel = Math.floor(newPoints / 250) + 1;
    let newRank = 'Bronze';
    if (newPoints >= 1000) newRank = 'Platinum';
    else if (newPoints >= 500) newRank = 'Gold';
    else if (newPoints >= 250) newRank = 'Silver';
    
    try {
      const { error } = await supabase
        .from('students')
        .update({ 
          points: newPoints, 
          level: newLevel, 
          rank: newRank
        })
        .eq('id', id);
      
      if (error) throw error;
      await fetchStudents();
      alert(`✅ Added ${pointsToAdd} points! New total: ${newPoints} points`);
    } catch (err) { 
      alert('❌ Failed to add points'); 
    }
  };

  const confirmDelete = (student: Student) => {
    // ✅ FIX 5: Validate delete permissions
    if (user?.role === 'beo' && student.block !== user.block) {
      alert('❌ You can only delete students from your own block!');
      return;
    }
    if (user?.role === 'deo' && student.district !== user.district) {
      alert('❌ You can only delete students from your own district!');
      return;
    }
    
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentToDelete.id);
      
      if (error) throw error;
      
      if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
      }
      
      await fetchStudents();
      alert(`✅ Student "${studentToDelete.name}" deleted successfully!`);
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    } catch (err: any) { 
      alert('❌ Failed to delete: ' + err.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  // ========== GENERATE DISTRICT REPORT FUNCTIONALITY ==========
  const generateDistrictReport = async () => {
    try {
      alert('📊 Generating report...');
      
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) throw error;
      
      if (!studentsData || studentsData.length === 0) {
        alert('No student data available for report');
        return;
      }
      
      const totalStudents = studentsData.length;
      const totalPoints = studentsData.reduce((sum, s) => sum + s.points, 0);
      const averagePoints = totalPoints / totalStudents;
      const platinumCount = studentsData.filter(s => s.rank === 'Platinum').length;
      const goldCount = studentsData.filter(s => s.rank === 'Gold').length;
      const silverCount = studentsData.filter(s => s.rank === 'Silver').length;
      const bronzeCount = studentsData.filter(s => s.rank === 'Bronze').length;
      
      const schoolsMap = new Map();
      studentsData.forEach(s => {
        if (!schoolsMap.has(s.school_name)) {
          schoolsMap.set(s.school_name, { 
            name: s.school_name, 
            students: 0, 
            points: 0,
            topStudent: { name: '', points: 0 }
          });
        }
        const school = schoolsMap.get(s.school_name);
        school.students++;
        school.points += s.points;
        if (s.points > school.topStudent.points) {
          school.topStudent = { name: s.name, points: s.points };
        }
      });
      
      const schoolStats = Array.from(schoolsMap.values()).sort((a, b) => b.points - a.points);
      
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();
      
      const reportContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          ECOTRACK MAHARASHTRA                                ║
║                    ECO-PASSPORT REPORT                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

Report Generated By: ${user?.name || user?.email || 'Officer'}
Designation: ${user?.role === 'state' ? 'State Officer' : 
              user?.role === 'deo' ? 'District Education Officer (DEO)' : 
              user?.role === 'beo' ? 'Block Education Officer (BEO)' : 'Officer'}
${user?.role === 'state' ? 'Scope: Entire Maharashtra' : 
  user?.role === 'deo' ? `District: ${user?.district}` : 
  user?.role === 'beo' ? `Block: ${user?.block}` : ''}
Date: ${reportDate}
Time: ${reportTime}

╔══════════════════════════════════════════════════════════════════════════════╗
║                          EXECUTIVE SUMMARY                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  Total Students:                ${totalStudents.toString().padStart(10)}                  │
│  Total Points Earned:           ${totalPoints.toString().padStart(10)}                  │
│  Average Points per Student:    ${averagePoints.toFixed(1).toString().padStart(10)}                  │
└─────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                          RANK DISTRIBUTION                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  💎 Platinum (1000+ pts):     ${platinumCount.toString().padStart(10)} students (${((platinumCount/totalStudents)*100).toFixed(1)}%)  │
│  🥇 Gold (500-999 pts):       ${goldCount.toString().padStart(10)} students (${((goldCount/totalStudents)*100).toFixed(1)}%)  │
│  🥈 Silver (250-499 pts):     ${silverCount.toString().padStart(10)} students (${((silverCount/totalStudents)*100).toFixed(1)}%)  │
│  🥉 Bronze (0-249 pts):       ${bronzeCount.toString().padStart(10)} students (${((bronzeCount/totalStudents)*100).toFixed(1)}%)  │
└─────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                          SCHOOL PERFORMANCE                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

${schoolStats.slice(0, 10).map((school, index) => `
${index + 1}. ${school.name}
   ┌─────────────────────────────────────────────────────────────────────────┐
   │  Students: ${school.students}  │  Total Points: ${school.points}  │  Avg Points: ${(school.points/school.students).toFixed(1)}  │
   └─────────────────────────────────────────────────────────────────────────┘
   🏆 Top Student: ${school.topStudent.name} (${school.topStudent.points} pts)
`).join('\n')}

╔══════════════════════════════════════════════════════════════════════════════╗
║  This report was generated automatically by EcoTrack Maharashtra.           ║
╚══════════════════════════════════════════════════════════════════════════════╝

EcoTrack Maharashtra - Green Future Initiative
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoPassport_Report_${reportDate.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`✅ Report generated successfully!`);
    
  } catch (error) {
    console.error('Error generating report:', error);
    alert('❌ Failed to generate report');
  }
};

  // ========== DOWNLOAD PASSPORT FUNCTIONALITY ==========
  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Platinum': return '💎';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      default: return '🥉';
    }
  };

  const getProgressBar = (points: number, rank: string) => {
    let nextThreshold = 0;
    
    switch (rank) {
      case 'Bronze':
        nextThreshold = 250;
        break;
      case 'Silver':
        nextThreshold = 500;
        break;
      case 'Gold':
        nextThreshold = 1000;
        break;
      case 'Platinum':
        return '  ★ PLATINUM ACHIEVED! MAX LEVEL ★';
    }
    
    const pointsInCurrentRank = rank === 'Bronze' ? points : 
                                 rank === 'Silver' ? points - 250 :
                                 rank === 'Gold' ? points - 500 : points;
    const progress = Math.min(100, Math.floor((pointsInCurrentRank / nextThreshold) * 100));
    
    const barLength = 30;
    const filled = Math.floor((progress / 100) * barLength);
    const empty = barLength - filled;
    
    return `  [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}% (${pointsInCurrentRank}/${nextThreshold} pts)`;
  };

  const getNextRank = (rank: string) => {
    switch (rank) {
      case 'Bronze': return 'Silver (250 pts)';
      case 'Silver': return 'Gold (500 pts)';
      case 'Gold': return 'Platinum (1000 pts)';
      case 'Platinum': return 'MAX LEVEL ACHIEVED!';
      default: return 'Unknown';
    }
  };

  const getPointsToNextRank = (points: number, rank: string) => {
    switch (rank) {
      case 'Bronze': return `${250 - points} points to Silver`;
      case 'Silver': return `${500 - points} points to Gold`;
      case 'Gold': return `${1000 - points} points to Platinum`;
      case 'Platinum': return '0 - Max level achieved!';
      default: return 'Unknown';
    }
  };

  const handleDownloadPassport = (student: Student) => {
    const passportContent = `
╔══════════════════════════════════════════════════════════════╗
║                    ECOTRACK MAHARASHTRA                      ║
║                    ECO PASSPORT                              ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│                    STUDENT DETAILS                          │
├─────────────────────────────────────────────────────────────┤
│  Student Name: ${student.name}                              │
│  Class: ${student.class || 'Not specified'}                 │
│  School: ${student.school_name}                             │
│  District: ${student.district}                              │
│  Block: ${student.block || 'Not specified'}                 │
├─────────────────────────────────────────────────────────────┤
│                    ACHIEVEMENTS                             │
├─────────────────────────────────────────────────────────────┤
│  Total Points: ${student.points}                            │
│  Current Level: ${student.level}                            │
│  Rank: ${student.rank} ${getRankIcon(student.rank)}         │
│  Badges Earned: ${student.badges_count}                     │
│  Activities Completed: ${student.activities_count}          │
├─────────────────────────────────────────────────────────────┤
│                    RANK PROGRESS                            │
├─────────────────────────────────────────────────────────────┤
│  ${getProgressBar(student.points, student.rank)}           │
│                                                             │
│  Next Rank: ${getNextRank(student.rank)}                    │
│  Points Needed: ${getPointsToNextRank(student.points, student.rank)} │
└─────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║  This passport certifies that the above student is an       ║
║  active participant in environmental conservation efforts   ║
║  through EcoTrack Maharashtra.                              ║
║                                                             ║
║  Issued on: ${new Date().toLocaleDateString()}              ║
║  Valid until: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()} ║
╚══════════════════════════════════════════════════════════════╝

EcoTrack Maharashtra - Green Future Initiative
  `;

    const blob = new Blob([passportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g, '_')}_Eco_Passport.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`📄 Eco Passport downloaded for ${student.name}!`);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Platinum': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Gold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Silver': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const getRankIconDisplay = (rank: string) => {
    switch (rank) {
      case 'Platinum': return '💎';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      default: return '🥉';
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.school_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eco-Passports</h1>
          <p className="text-muted-foreground mt-1">Student eco-passports and achievements</p>
        </div>
        <div className="flex gap-2">
          {/* Export Report Button - Visible for DEO and State */}
          {(user?.role === 'deo' || user?.role === 'state') && (
            <Button 
              onClick={generateDistrictReport} 
              variant="outline"
              className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          )}
          {/* ✅ Add Student Button - Now visible for ALL officers */}
          {canCreate && (
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Points</p>
                <p className="text-xl font-bold">{students.reduce((sum, s) => sum + s.points, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Level</p>
                <p className="text-xl font-bold">{(students.reduce((sum, s) => sum + s.level, 0) / students.length || 0).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Activities</p>
                <p className="text-xl font-bold">{students.reduce((sum, s) => sum + s.activities_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search students by name or school..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pl-9 w-full" 
        />
      </div>

      {/* Main Content */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-foreground mb-2">
              Students ({filteredStudents.length})
            </h3>
            
            {filteredStudents.map(s => (
              <Card 
                key={s.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedStudent?.id === s.id ? 'ring-2 ring-primary' : ''}`} 
                onClick={() => setSelectedStudent(s)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600">
                      <AvatarFallback className="text-white font-bold">
                        {s.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.school_name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{s.points} pts</span>
                        <span className={`text-xs font-medium ${getRankColor(s.rank)}`}>
                          {getRankIconDisplay(s.rank)} {s.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Student Details Panel */}
          {selectedStudent && (
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedStudent.name}</h2>
                      <p className="text-muted-foreground mt-1">
                        {selectedStudent.class} • {selectedStudent.school_name}
                      </p>
                    </div>
                    <Badge className={getRankColor(selectedStudent.rank)}>
                      {getRankIconDisplay(selectedStudent.rank)} {selectedStudent.rank}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedStudent.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedStudent.level}</p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{selectedStudent.badges_count}</p>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{selectedStudent.activities_count}</p>
                      <p className="text-xs text-muted-foreground">Activities</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownloadPassport(selectedStudent)}
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Passport
                    </Button>
                    {canUpdate && (
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleAddPoints(selectedStudent.id, selectedStudent.points)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Points
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => confirmDelete(selectedStudent)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Student
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/30 rounded-lg text-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery 
              ? `No results found for "${searchQuery}". Try a different search term.` 
              : 'Add your first student to start tracking their eco-journey and achievements.'}
          </p>
          {canCreate && !searchQuery && (
            <Button 
              onClick={() => setShowForm(true)} 
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Student
            </Button>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Add New Student</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student Name *</label>
                <Input 
                  placeholder="e.g., Priya Patil" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <Input 
                  placeholder="e.g., 8th" 
                  value={formData.class} 
                  onChange={(e) => setFormData({...formData, class: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School *</label>
                <Input 
                  placeholder="e.g., ZP School, Shirdi" 
                  value={formData.school_name} 
                  onChange={(e) => setFormData({...formData, school_name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District *</label>
                <Input 
                  placeholder="e.g., Pune" 
                  value={formData.district} 
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  disabled={user?.role === 'beo' || user?.role === 'deo'}
                  className={user?.role === 'beo' || user?.role === 'deo' ? "bg-gray-100" : ""}
                />
                {(user?.role === 'beo' || user?.role === 'deo') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-set to: {user?.district || 'your district'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Block</label>
                <Input 
                  placeholder="e.g., Shirur" 
                  value={formData.block} 
                  onChange={(e) => setFormData({...formData, block: e.target.value})}
                  disabled={user?.role === 'beo'}
                  className={user?.role === 'beo' ? "bg-gray-100" : ""}
                />
                {user?.role === 'beo' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-set to: {user?.block || 'your block'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Points</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.points} 
                  onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rank</label>
                <select 
                  value={formData.rank} 
                  onChange={(e) => setFormData({...formData, rank: e.target.value})} 
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="Bronze">🥉 Bronze (0-249 pts)</option>
                  <option value="Silver">🥈 Silver (250-499 pts)</option>
                  <option value="Gold">🥇 Gold (500-999 pts)</option>
                  <option value="Platinum">💎 Platinum (1000+ pts)</option>
                </select>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Confirm Delete</h3>
            </div>
            
            <p className="text-muted-foreground mb-2">
              Are you sure you want to delete <strong className="text-foreground">{studentToDelete.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone. All data associated with this student will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Yes, Delete Student'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoPassports;