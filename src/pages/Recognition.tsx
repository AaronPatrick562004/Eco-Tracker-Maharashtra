import { useState } from "react";
import { 
  Award, 
  Trophy, 
  Medal, 
  Star, 
  Crown,
  School,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  Filter,
  Search,
  Heart,
  Share2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";

interface Recognition {
  id: string;
  title: string;
  description: string;
  recipient: string;
  recipientRole: string;
  school: string;
  schoolId: string;
  district: string;
  block: string;
  date: string;
  type: "school" | "teacher" | "student";
  category: "green" | "innovation" | "community" | "excellence";
  likes: number;
  liked?: boolean;
  image?: string;
  status: "draft" | "published" | "archived";
}

const mockRecognitions: Recognition[] = [
  {
    id: "1",
    title: "Green School of the Year",
    description: "For outstanding contribution to environmental education and sustainable practices.",
    recipient: "ZP Primary School, Shirdi",
    recipientRole: "School",
    school: "ZP Primary School, Shirdi",
    schoolId: "1",
    district: "Ahmednagar",
    block: "Shirur",
    date: "2024-03-15",
    type: "school",
    category: "green",
    likes: 234,
    liked: false,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500",
    status: "published"
  },
  {
    id: "2",
    title: "Best Eco Coordinator",
    description: "For exceptional dedication in organizing environmental activities throughout the year.",
    recipient: "Mr. Patil S.R.",
    recipientRole: "Coordinator",
    school: "ZP Primary School, Shirdi",
    schoolId: "1",
    district: "Ahmednagar",
    block: "Shirur",
    date: "2024-03-10",
    type: "teacher",
    category: "excellence",
    likes: 156,
    liked: true,
    status: "published"
  },
  {
    id: "3",
    title: "Young Environmentalist",
    description: "For leading the plastic-free campaign and inspiring fellow students.",
    recipient: "Priya Patil",
    recipientRole: "Student - Class 8",
    school: "Municipal School No. 12, Pune",
    schoolId: "2",
    district: "Pune",
    block: "Haveli",
    date: "2024-03-05",
    type: "student",
    category: "community",
    likes: 89,
    liked: false,
    status: "published"
  },
  {
    id: "4",
    title: "Innovation in Water Conservation",
    description: "Developed a low-cost rainwater harvesting system for the school.",
    recipient: "Govt. High School, Nagpur",
    recipientRole: "School",
    school: "Govt. High School, Nagpur",
    schoolId: "4",
    district: "Nagpur",
    block: "Nagpur City",
    date: "2024-02-28",
    type: "school",
    category: "innovation",
    likes: 312,
    liked: false,
    status: "published"
  },
  {
    id: "5",
    title: "Draft Recognition - Upcoming Award",
    description: "This recognition is still in draft stage.",
    recipient: "ZP School, Washim",
    recipientRole: "School",
    school: "ZP School, Washim",
    schoolId: "3",
    district: "Washim",
    block: "Washim",
    date: "2024-04-01",
    type: "school",
    category: "green",
    likes: 0,
    liked: false,
    status: "draft"
  },
];

const categoryColors = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  innovation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  community: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  excellence: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const categoryIcons = {
  green: "🌱",
  innovation: "💡",
  community: "🤝",
  excellence: "🏆",
};

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  archived: { label: "Archived", className: "bg-red-100 text-red-700" },
};

interface Props {
  lang: Language;
}

const Recognition = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [recognitions, setRecognitions] = useState<Recognition[]>(mockRecognitions);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter recognitions based on role
  const filteredRecognitions = recognitions.filter(rec => {
    // Role-based visibility
    if (user?.role === 'principal') {
      // Principal only sees their school's recognitions
      if (rec.school !== user.school) return false;
      // Principal only sees published recognitions
      if (rec.status !== 'published') return false;
    }
    
    if (user?.role === 'beo' && user?.block) {
      // BEO only sees their block's recognitions
      if (rec.block !== user.block) return false;
    }
    
    if (user?.role === 'deo' && user?.district) {
      // DEO only sees their district's recognitions
      if (rec.district !== user.district) return false;
    }
    
    // Apply search filters
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || rec.type === selectedType;
    const matchesCategory = selectedCategory === "all" || rec.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleLike = (id: string) => {
    setRecognitions(prev =>
      prev.map(rec =>
        rec.id === id
          ? { ...rec, liked: !rec.liked, likes: rec.liked ? rec.likes - 1 : rec.likes + 1 }
          : rec
      )
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === "en" ? "Are you sure you want to delete this recognition?" : "तुम्हाला खात्री आहे की हा सन्मान हटवायचा आहे?")) {
      setRecognitions(prev => prev.filter(rec => rec.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: "draft" | "published" | "archived") => {
    setRecognitions(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, status: newStatus } : rec
      )
    );
  };

  // Create form for new recognition (State only)
  if (showCreateForm && user?.role === 'state') {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <button
          onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>{lang === "en" ? "Back to recognitions" : "सन्मानांकडे परत"}</span>
        </button>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "en" ? "Create New Recognition" : "नवीन सन्मान तयार करा"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Title</label>
                <Input placeholder="e.g., Green School of the Year" />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <Input placeholder="Describe the achievement..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full p-2 rounded-lg border border-border bg-background">
                    <option value="green">Green</option>
                    <option value="innovation">Innovation</option>
                    <option value="community">Community</option>
                    <option value="excellence">Excellence</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select className="w-full p-2 rounded-lg border border-border bg-background">
                    <option value="school">School</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Recipient</label>
                <Input placeholder="Name of recipient" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">School</label>
                <Input placeholder="School name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">District</label>
                  <Input placeholder="District" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Block</label>
                  <Input placeholder="Block" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <select className="w-full p-2 rounded-lg border border-border bg-background">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  {lang === "en" ? "Create Recognition" : "सन्मान तयार करा"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  {lang === "en" ? "Cancel" : "रद्द करा"}
                </Button>
              </div>
            </form>
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
            {t.recognition}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Celebrating excellence in environmental education" : "पर्यावरण शिक्षणातील उत्कृष्टतेचा सन्मान"}
          </p>
        </div>
        
        {/* Role-based header buttons */}
        <div className="flex gap-2">
          {/* ✅ STATE can create new recognitions */}
          {user?.role === 'state' && (
            <Button 
              className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4" />
              {lang === "en" ? "New Recognition" : "नवीन सन्मान"}
            </Button>
          )}
          
          {/* ✅ DEO/STATE can export */}
          {(user?.role === 'deo' || user?.role === 'state') && (
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              {lang === "en" ? "Export" : "निर्यात करा"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats - Filtered by role */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Total Awards" : "एकूण पुरस्कार"}</p>
                <p className="text-lg sm:text-xl font-bold">{filteredRecognitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <School className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Schools" : "शाळा"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {filteredRecognitions.filter(r => r.type === 'school').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Teachers" : "शिक्षक"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {filteredRecognitions.filter(r => r.type === 'teacher').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Students" : "विद्यार्थी"}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {filteredRecognitions.filter(r => r.type === 'student').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "en" ? "Search recognitions..." : "सन्मान शोधा..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button 
          variant="outline" 
          className="gap-2 w-full sm:w-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          {lang === "en" ? "Filter" : "फिल्टर"}
        </Button>
      </div>

      {/* Filter Options - Collapsible */}
      {showFilters && (
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div>
            <label className="text-sm font-medium block mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedType === "all" ? "default" : "outline"}
                onClick={() => setSelectedType("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={selectedType === "school" ? "default" : "outline"}
                onClick={() => setSelectedType("school")}
              >
                Schools
              </Button>
              <Button
                size="sm"
                variant={selectedType === "teacher" ? "default" : "outline"}
                onClick={() => setSelectedType("teacher")}
              >
                Teachers
              </Button>
              <Button
                size="sm"
                variant={selectedType === "student" ? "default" : "outline"}
                onClick={() => setSelectedType("student")}
              >
                Students
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={selectedCategory === "green" ? "default" : "outline"}
                onClick={() => setSelectedCategory("green")}
              >
                🌱 Green
              </Button>
              <Button
                size="sm"
                variant={selectedCategory === "innovation" ? "default" : "outline"}
                onClick={() => setSelectedCategory("innovation")}
              >
                💡 Innovation
              </Button>
              <Button
                size="sm"
                variant={selectedCategory === "community" ? "default" : "outline"}
                onClick={() => setSelectedCategory("community")}
              >
                🤝 Community
              </Button>
              <Button
                size="sm"
                variant={selectedCategory === "excellence" ? "default" : "outline"}
                onClick={() => setSelectedCategory("excellence")}
              >
                🏆 Excellence
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recognitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecognitions.map((recognition) => (
          <Card key={recognition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {recognition.image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={recognition.image} 
                  alt={recognition.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              {/* Status Badge - Only visible to State */}
              {user?.role === 'state' && (
                <div className="flex justify-end mb-2">
                  <select
                    value={recognition.status}
                    onChange={(e) => handleStatusChange(recognition.id, e.target.value as any)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border-0",
                      statusConfig[recognition.status].className
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <span className={cn("text-xs px-2 py-1 rounded-full", categoryColors[recognition.category])}>
                  {categoryIcons[recognition.category]} {
                    lang === "en" 
                      ? recognition.category.charAt(0).toUpperCase() + recognition.category.slice(1)
                      : recognition.category === "green" ? "हरित"
                      : recognition.category === "innovation" ? "नवकल्पना"
                      : recognition.category === "community" ? "समुदाय"
                      : "उत्कृष्टता"
                  }
                </span>
                <span className="text-xs text-muted-foreground">{recognition.date}</span>
              </div>

              <h3 className="font-semibold text-foreground mb-1">{recognition.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recognition.description}</p>

              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {recognition.type === "school" ? "🏫" :
                     recognition.type === "teacher" ? "👨‍🏫" : "👩‍🎓"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{recognition.recipient}</p>
                  <p className="text-xs text-muted-foreground">{recognition.recipientRole}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {recognition.district}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {recognition.likes}
                </span>
              </div>

              {/* Action Buttons - Role Based */}
              <div className="flex flex-wrap gap-2">
                {/* Like button - Everyone */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleLike(recognition.id)}
                >
                  <Heart className={cn("w-4 h-4 mr-1", recognition.liked && "fill-red-500 text-red-500")} />
                  {recognition.liked ? (lang === "en" ? "Liked" : "आवडले") : (lang === "en" ? "Like" : "आवडले")}
                </Button>

                {/* Share button - Everyone */}
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-1" />
                  {lang === "en" ? "Share" : "शेअर"}
                </Button>

                {/* Edit button - STATE only */}
                {user?.role === 'state' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}

                {/* Delete button - STATE only */}
                {user?.role === 'state' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDelete(recognition.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>

              {/* Draft indicator - visible to all but only for draft status */}
              {recognition.status === 'draft' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs flex items-center gap-1 text-amber-600">
                    <Clock className="w-3 h-3" />
                    {lang === "en" ? "Draft - Not published yet" : "मसुदा - अद्याप प्रकाशित केलेले नाही"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecognitions.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-medium">
            {lang === "en" ? "No recognitions found" : "कोणतेही सन्मान आढळले नाहीत"}
          </p>
          {user?.role === 'state' && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {lang === "en" ? "Create First Recognition" : "पहिला सन्मान तयार करा"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Recognition;