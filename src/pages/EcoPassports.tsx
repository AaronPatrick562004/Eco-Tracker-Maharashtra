import { useState, useEffect } from "react";
import { 
  Award, 
  Leaf, 
  TreePine, 
  Droplets, 
  Recycle, 
  Sun, 
  Wind,
  Calendar,
  MapPin,
  School,
  Star,
  ChevronRight,
  Download,
  Search,
  Filter,
  QrCode,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  TrendingUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";
import { ecoPassportsAPI } from "@/lib/api";

interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
  school_id: string;
  district: string;
  block: string;
  points: number;
  level: number;
  badges_count: number;
  activities_count: number;
  rank: string;
  status: "active" | "inactive";
  last_active: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  earned?: boolean;
  date?: string;
}

const rankColors = {
  Platinum: "bg-gradient-to-r from-purple-400 to-purple-600",
  Gold: "bg-gradient-to-r from-yellow-400 to-yellow-600",
  Silver: "bg-gradient-to-r from-gray-300 to-gray-400",
  Bronze: "bg-gradient-to-r from-amber-600 to-amber-800",
};

const rankIcons = {
  Platinum: "💎",
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
};

interface Props {
  lang: Language;
}

const EcoPassports = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    class: '',
    school: '',
    school_id: '',
    district: '',
    block: '',
    points: 0,
    level: 1,
    rank: 'Bronze',
    status: 'active' as const
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, badgesData] = await Promise.all([
        ecoPassportsAPI.getStudents(),
        ecoPassportsAPI.getBadges()
      ]);
      setStudents(studentsData);
      setBadges(badgesData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (user?.role === 'principal' && student.school !== user.school) return false;
    if (user?.role === 'beo' && user.block && student.block !== user.block) return false;
    if (user?.role === 'deo' && user.district && student.district !== user.district) return false;
    
    return student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           student.school.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    if (isMobile) {
      setShowStudentDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowStudentDetail(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: name === 'points' || name === 'level' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddStudent = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!newStudent.name || !newStudent.school || !newStudent.district) {
        throw new Error('Please fill in all required fields');
      }

      const created = await ecoPassportsAPI.createStudent(newStudent);
      setStudents(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewStudent({
        name: '', class: '', school: '', school_id: '', district: '', block: '',
        points: 0, level: 1, rank: 'Bronze', status: 'active'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await ecoPassportsAPI.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddPoints = async (studentId: string, points: number) => {
    try {
      const updated = await ecoPassportsAPI.addPoints(studentId, points);
      setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(updated);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">Retry</Button>
        </div>
      </div>
    );
  }

  // Mobile student detail view
  if (isMobile && showStudentDetail && selectedStudent) {
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
          <div className={cn("h-24", rankColors[selectedStudent.rank as keyof typeof rankColors])} />
          <CardContent className="relative pt-0">
            <div className="flex justify-center -mt-12 mb-4">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800">
                <AvatarFallback className="text-2xl">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedStudent.class} • {selectedStudent.school}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Badge variant="outline" className="text-sm">
                  {selectedStudent.rank} {rankIcons[selectedStudent.rank as keyof typeof rankIcons]}
                </Badge>
                <Badge variant="outline" className={cn(
                  selectedStudent.status === 'active' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-50 text-gray-700'
                )}>
                  {selectedStudent.status}
                </Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-green-600">{selectedStudent.points}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">{selectedStudent.level}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-amber-600">{selectedStudent.badges_count}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Passport
              </Button>
              
              {user?.role === 'principal' && (
                <Button 
                  className="w-full bg-blue-600"
                  onClick={() => {
                    const points = prompt('Enter points to add:');
                    if (points) handleAddPoints(selectedStudent.id, parseInt(points));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Points
                </Button>
              )}
              
              {(user?.role === 'state') && (
                <>
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Student
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleDeleteStudent(selectedStudent.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Student
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Eco-Passports
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Student eco-passports and achievements
          </p>
        </div>
        
        {/* Add Student Button - Visible to State and Principals */}
        {(user?.role === 'state' || user?.role === 'principal') && (
          <Button 
            className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Priya Patil"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <input
                  type="text"
                  name="class"
                  value={newStudent.class}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 8th"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">School *</label>
                <input
                  type="text"
                  name="school"
                  value={newStudent.school}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., ZP School, Shirdi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  value={newStudent.district}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Ahmednagar"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Block</label>
                <input
                  type="text"
                  name="block"
                  value={newStudent.block}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Shirur"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Initial Points</label>
                <input
                  type="number"
                  name="points"
                  value={newStudent.points}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Rank</label>
                <select
                  name="rank"
                  value={newStudent.rank}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={newStudent.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleAddStudent}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-lg sm:text-xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Points</p>
                <p className="text-lg sm:text-xl font-bold">
                  {students.reduce((sum, s) => sum + s.points, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Level</p>
                <p className="text-lg sm:text-xl font-bold">
                  {(students.reduce((sum, s) => sum + s.level, 0) / students.length || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Activities</p>
                <p className="text-lg sm:text-xl font-bold">
                  {students.reduce((sum, s) => sum + s.activities_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-foreground">
            Students ({filteredStudents.length})
          </h3>
          
          {filteredStudents.map((student) => (
            <Card 
              key={student.id} 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedStudent?.id === student.id && "ring-2 ring-primary"
              )}
              onClick={() => handleStudentSelect(student)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{student.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{student.school}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-green-600">{student.points} pts</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className={cn(
                        "text-xs font-medium",
                        student.rank === "Platinum" ? "text-purple-600" :
                        student.rank === "Gold" ? "text-yellow-600" :
                        student.rank === "Silver" ? "text-gray-500" : "text-amber-700"
                      )}>
                        {student.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        student.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                      <span className="text-xs text-muted-foreground">
                        {student.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No students found</p>
            </div>
          )}
        </div>

        {/* Student Details - Desktop */}
        {selectedStudent && !isMobile && (
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className={cn("h-32", rankColors[selectedStudent.rank as keyof typeof rankColors])} />
              <CardContent className="relative pt-0">
                <div className="flex justify-center -mt-16 mb-6">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800">
                    <AvatarFallback className="text-3xl">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedStudent.class} • {selectedStudent.school}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className="text-sm">
                      {selectedStudent.rank} {rankIcons[selectedStudent.rank as keyof typeof rankIcons]}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      selectedStudent.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    )}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>

                {/* Stats Grid */}
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

                {/* Progress */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3">Progress</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Next Level</span>
                          <span>{selectedStudent.points % 250} / 250</span>
                        </div>
                        <Progress value={(selectedStudent.points % 250) / 250 * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Badge Progress</span>
                          <span>{selectedStudent.badges_count} / 20</span>
                        </div>
                        <Progress value={selectedStudent.badges_count * 5} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  
                  {user?.role === 'principal' && (
                    <Button 
                      className="flex-1 bg-blue-600"
                      onClick={() => {
                        const points = prompt('Enter points to add:');
                        if (points) handleAddPoints(selectedStudent.id, parseInt(points));
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Points
                    </Button>
                  )}
                  
                  {user?.role === 'state' && (
                    <>
                      <Button variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleDeleteStudent(selectedStudent.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoPassports;