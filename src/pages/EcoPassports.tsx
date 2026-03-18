import { useState } from "react";
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
  TrendingUp
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

interface Student {
  id: string;
  name: string;
  class: string;
  school: string;
  schoolId: string;
  district: string;
  block: string;
  avatar?: string;
  points: number;
  level: number;
  badges: number;
  activities: number;
  rank: string;
  status: "active" | "inactive";
  lastActive?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  earned: boolean;
  date?: string;
  studentId?: string;
}

interface Activity {
  id: string;
  title: string;
  points: number;
  date: string;
  type: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Priya Patil",
    class: "8th",
    school: "ZP Primary School, Shirdi",
    schoolId: "1",
    district: "Ahmednagar",
    block: "Shirur",
    points: 1250,
    level: 5,
    badges: 8,
    activities: 15,
    rank: "Gold",
    status: "active",
    lastActive: "2024-03-15"
  },
  {
    id: "2",
    name: "Rahul Deshmukh",
    class: "9th",
    school: "Municipal School No. 12, Pune",
    schoolId: "2",
    district: "Pune",
    block: "Haveli",
    points: 980,
    level: 4,
    badges: 6,
    activities: 12,
    rank: "Silver",
    status: "active",
    lastActive: "2024-03-14"
  },
  {
    id: "3",
    name: "Sneha Jadhav",
    class: "7th",
    school: "ZP School, Washim",
    schoolId: "3",
    district: "Washim",
    block: "Washim",
    points: 750,
    level: 3,
    badges: 4,
    activities: 8,
    rank: "Bronze",
    status: "active",
    lastActive: "2024-03-10"
  },
  {
    id: "4",
    name: "Amit Kulkarni",
    class: "10th",
    school: "Govt. High School, Nagpur",
    schoolId: "4",
    district: "Nagpur",
    block: "Nagpur City",
    points: 1500,
    level: 6,
    badges: 10,
    activities: 20,
    rank: "Platinum",
    status: "active",
    lastActive: "2024-03-16"
  },
  {
    id: "5",
    name: "Riya Sharma",
    class: "6th",
    school: "Kendriya Vidyalaya, Thane",
    schoolId: "6",
    district: "Thane",
    block: "Thane",
    points: 450,
    level: 2,
    badges: 3,
    activities: 5,
    rank: "Bronze",
    status: "inactive",
    lastActive: "2024-02-28"
  },
];

const mockBadges: Badge[] = [
  {
    id: "1",
    name: "Tree Planter",
    description: "Participated in 5 tree plantation drives",
    icon: TreePine,
    color: "bg-green-500",
    earned: true,
    date: "2024-02-15",
    studentId: "1"
  },
  {
    id: "2",
    name: "Water Saver",
    description: "Completed water conservation workshop",
    icon: Droplets,
    color: "bg-blue-500",
    earned: true,
    date: "2024-01-20",
    studentId: "1"
  },
  {
    id: "3",
    name: "Recycling Hero",
    description: "Collected 50kg of waste for recycling",
    icon: Recycle,
    color: "bg-amber-500",
    earned: true,
    date: "2024-03-10",
    studentId: "1"
  },
  {
    id: "4",
    name: "Energy Champion",
    description: "Reduced school energy consumption by 10%",
    icon: Sun,
    color: "bg-yellow-500",
    earned: false
  },
  {
    id: "5",
    name: "Clean Air Advocate",
    description: "Organized clean air awareness campaign",
    icon: Wind,
    color: "bg-purple-500",
    earned: false
  },
];

const mockActivities: Activity[] = [
  { id: "1", title: "Tree Plantation Drive", points: 50, date: "2024-03-15", type: "plantation" },
  { id: "2", title: "Water Conservation Workshop", points: 30, date: "2024-03-10", type: "water" },
  { id: "3", title: "Plastic Collection Drive", points: 40, date: "2024-03-05", type: "waste" },
  { id: "4", title: "Solar Energy Awareness", points: 35, date: "2024-02-28", type: "energy" },
  { id: "5", title: "Clean Air Survey", points: 25, date: "2024-02-20", type: "air" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);

  // Filter students based on role
  const filteredStudents = mockStudents.filter(student => {
    if (user?.role === 'principal') {
      return student.school === user.school;
    }
    if (user?.role === 'beo' && user?.block) {
      return student.block === user.block;
    }
    if (user?.role === 'deo' && user?.district) {
      return student.district === user.district;
    }
    return true; // State sees all
  }).filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    if (isMobile) {
      setShowStudentDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowStudentDetail(false);
    setShowAddPoints(false);
  };

  const handleAddPoints = () => {
    // In real app, this would update the database
    alert(`Added ${pointsToAdd} points to ${selectedStudent?.name}`);
    setShowAddPoints(false);
    setPointsToAdd(0);
  };

  // Get student's badges
  const getStudentBadges = (studentId: string) => {
    return mockBadges.filter(b => b.studentId === studentId || !b.studentId);
  };

  // Mobile student detail view
  if (isMobile && showStudentDetail && selectedStudent) {
    const studentBadges = getStudentBadges(selectedStudent.id);
    
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>{lang === "en" ? "Back to list" : "यादीकडे परत"}</span>
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {selectedStudent.rank} {rankIcons[selectedStudent.rank as keyof typeof rankIcons]}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  selectedStudent.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                )}>
                  {selectedStudent.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Add Points Section - Only Principal for their students */}
            {user?.role === 'principal' && selectedStudent.school === user?.school && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                {showAddPoints ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Points to add"
                      value={pointsToAdd}
                      onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                      className="bg-white"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-green-600" onClick={handleAddPoints}>
                        Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddPoints(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600"
                    onClick={() => setShowAddPoints(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Points
                  </Button>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-green-600">{selectedStudent.points}</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Points" : "गुण"}</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">{selectedStudent.level}</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Level" : "स्तर"}</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-amber-600">{selectedStudent.badges}</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Badges" : "बॅज"}</p>
              </div>
            </div>

            {/* Progress to Next Level */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm">
                {lang === "en" ? "Progress to Next Level" : "पुढील स्तरापर्यंत प्रगती"}
              </h4>
              <Progress value={(selectedStudent.points % 250) / 250 * 100} className="h-2" />
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {250 - (selectedStudent.points % 250)} {lang === "en" ? "points to Level" : "गुण बाकी स्तर"} {selectedStudent.level + 1}
              </p>
            </div>

            {/* Badges Section */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3">{lang === "en" ? "Badges" : "बॅज"}</h4>
              <div className="grid grid-cols-3 gap-2">
                {studentBadges.slice(0, 6).map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div 
                      key={badge.id} 
                      className={cn(
                        "p-2 rounded-lg text-center transition-opacity",
                        badge.earned ? "bg-muted/30" : "opacity-30"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center", badge.color)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-medium truncate">{badge.name}</p>
                    </div>
                  );
                })}
              </div>
              {studentBadges.length > 6 && (
                <Button variant="link" size="sm" className="w-full mt-1">
                  View all {studentBadges.length} badges
                </Button>
              )}
            </div>

            {/* Recent Activities */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3">{lang === "en" ? "Recent Activities" : "अलीकडील उपक्रम"}</h4>
              <div className="space-y-2">
                {mockActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-lg">
                    <span>{activity.title}</span>
                    <span className="text-green-600 font-medium">+{activity.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons - Role Based */}
            <div className="flex flex-col gap-2">
              {/* Download - Everyone */}
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {lang === "en" ? "Download Passport" : "पासपोर्ट डाउनलोड करा"}
              </Button>

              {/* Edit - Principal for their students, State for all */}
              {(user?.role === 'state' || 
                (user?.role === 'principal' && selectedStudent.school === user?.school)) && (
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  {lang === "en" ? "Edit Student" : "विद्यार्थी संपादित करा"}
                </Button>
              )}

              {/* Delete - State only */}
              {user?.role === 'state' && (
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {lang === "en" ? "Delete Student" : "विद्यार्थी हटवा"}
                </Button>
              )}

              {/* Export Data - DEO/State */}
              {(user?.role === 'deo' || user?.role === 'state') && (
                <Button variant="outline" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {lang === "en" ? "Export Data" : "डेटा निर्यात करा"}
                </Button>
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
            {t.ecoPassports}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Student eco-passports and achievements" : "विद्यार्थी इको-पासपोर्ट आणि उपलब्धी"}
          </p>
        </div>
        
        {/* Role-based header buttons */}
        <div className="flex gap-2">
          {/* Add Student - State only */}
          {user?.role === 'state' && (
            <Button className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              {lang === "en" ? "Add Student" : "विद्यार्थी जोडा"}
            </Button>
          )}
          
          {/* Scan QR - All roles */}
          <Button variant="outline" size="icon">
            <QrCode className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats - Filtered by role */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Active Students" : "सक्रिय विद्यार्थी"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {filteredStudents.filter(s => s.status === 'active').length}
                </p>
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
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Total Points" : "एकूण गुण"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {filteredStudents.reduce((sum, s) => sum + s.points, 0).toLocaleString()}
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
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Avg. Level" : "सरासरी स्तर"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {(filteredStudents.reduce((sum, s) => sum + s.level, 0) / filteredStudents.length || 0).toFixed(1)}
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
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Activities" : "उपक्रम"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {filteredStudents.reduce((sum, s) => sum + s.activities, 0)}
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
            placeholder={lang === "en" ? "Search students..." : "विद्यार्थी शोधा..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-foreground">
            {lang === "en" ? "Students" : "विद्यार्थी"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredStudents.length})
            </span>
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
                    {/* Status indicator - visible to all */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        student.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                      <span className="text-xs text-muted-foreground">
                        {student.status === 'active' ? 'Active' : 'Inactive'}
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
              <p className="text-sm">{lang === "en" ? "No students found" : "कोणतेही विद्यार्थी आढळले नाहीत"}</p>
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
                      {selectedStudent.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Add Points Section - Only Principal for their students */}
                {user?.role === 'principal' && selectedStudent.school === user?.school && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Add Points</h4>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Points"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                      <Button className="bg-blue-600" onClick={handleAddPoints}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedStudent.points}</p>
                    <p className="text-xs text-muted-foreground">{lang === "en" ? "Points" : "गुण"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.level}</p>
                    <p className="text-xs text-muted-foreground">{lang === "en" ? "Level" : "स्तर"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{selectedStudent.badges}</p>
                    <p className="text-xs text-muted-foreground">{lang === "en" ? "Badges" : "बॅज"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedStudent.activities}</p>
                    <p className="text-xs text-muted-foreground">{lang === "en" ? "Activities" : "उपक्रम"}</p>
                  </div>
                </div>

                {/* Progress and Recent Activity */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3">{lang === "en" ? "Progress" : "प्रगती"}</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{lang === "en" ? "Next Level" : "पुढील स्तर"}</span>
                          <span>{selectedStudent.points % 250} / 250</span>
                        </div>
                        <Progress value={(selectedStudent.points % 250) / 250 * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{lang === "en" ? "Badge Progress" : "बॅज प्रगती"}</span>
                          <span>{selectedStudent.badges} / 20</span>
                        </div>
                        <Progress value={selectedStudent.badges * 5} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">{lang === "en" ? "Recent Activity" : "अलीकडील उपक्रम"}</h4>
                    <div className="space-y-2">
                      {mockActivities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-lg">
                          <span>{activity.title}</span>
                          <span className="text-green-600 font-medium">+{activity.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">{lang === "en" ? "Badges" : "बॅज"}</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {getStudentBadges(selectedStudent.id).map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <div 
                          key={badge.id} 
                          className={cn(
                            "p-3 rounded-lg text-center transition-opacity",
                            badge.earned ? "bg-muted/30" : "opacity-30"
                          )}
                          title={badge.description}
                        >
                          <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center", badge.color)}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-xs font-medium truncate">{badge.name}</p>
                          {badge.earned && badge.date && (
                            <p className="text-xs text-muted-foreground mt-1">{badge.date}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons - Role Based */}
                <div className="flex gap-3">
                  {/* Download - Everyone */}
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    {lang === "en" ? "Download" : "डाउनलोड"}
                  </Button>

                  {/* Share/QR - Everyone */}
                  <Button variant="outline" className="flex-1">
                    <QrCode className="w-4 h-4 mr-2" />
                    {lang === "en" ? "Share" : "शेअर"}
                  </Button>

                  {/* Edit - Principal (their students) / State (all) */}
                  {(user?.role === 'state' || 
                    (user?.role === 'principal' && selectedStudent.school === user?.school)) && (
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}

                  {/* Delete - State only */}
                  {user?.role === 'state' && (
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}

                  {/* Export Data - DEO/State */}
                  {(user?.role === 'deo' || user?.role === 'state') && (
                    <Button variant="outline" className="flex-1">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Export
                    </Button>
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