import { useState, useEffect } from "react";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";
import { recognitionAPI } from "@/lib/api";

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
  type: "school" | "teacher" | "student";
  category: "green" | "innovation" | "community" | "excellence";
  likes: number;
  liked?: boolean;
  image_url?: string;
  status: "draft" | "published" | "archived";
}

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

interface Props {
  lang: Language;
}

const Recognition = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newRecognition, setNewRecognition] = useState({
    title: '',
    description: '',
    recipient: '',
    recipient_role: '',
    school: '',
    district: '',
    block: '',
    date: new Date().toISOString().split('T')[0],
    type: 'school',
    category: 'green',
    image_url: ''
  });

  useEffect(() => {
    fetchRecognitions();
  }, []);

  const fetchRecognitions = async () => {
    try {
      setLoading(true);
      const data = await recognitionAPI.getAll();
      setRecognitions(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching recognitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecognitions = recognitions.filter(rec => {
    if (user?.role === 'principal' && rec.school !== user.school) return false;
    if (user?.role === 'beo' && user.block && rec.block !== user.block) return false;
    if (user?.role === 'deo' && user.district && rec.district !== user.district) return false;
    
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || rec.type === selectedType;
    const matchesCategory = selectedCategory === "all" || rec.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleLike = async (id: string) => {
    try {
      await recognitionAPI.like(id);
      setRecognitions(prev =>
        prev.map(rec =>
          rec.id === id
            ? { ...rec, liked: !rec.liked, likes: rec.liked ? rec.likes - 1 : rec.likes + 1 }
            : rec
        )
      );
    } catch (err) {
      console.error('Error liking recognition:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "en" ? "Are you sure you want to delete this recognition?" : "तुम्हाला खात्री आहे की हा सन्मान हटवायचा आहे?")) return;
    
    try {
      await recognitionAPI.delete(id);
      setRecognitions(prev => prev.filter(rec => rec.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecognition(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRecognition = async () => {
    try {
      setSubmitting(true);
      const created = await recognitionAPI.create(newRecognition);
      setRecognitions(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewRecognition({
        title: '', description: '', recipient: '', recipient_role: '',
        school: '', district: '', block: '', date: new Date().toISOString().split('T')[0],
        type: 'school', category: 'green', image_url: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
        
        {/* Create Button - Only State */}
        {user?.role === 'state' && (
          <Button 
            className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            {lang === "en" ? "New Recognition" : "नवीन सन्मान"}
          </Button>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Recognition</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newRecognition.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Green School of the Year"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={newRecognition.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe the achievement..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={newRecognition.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="school">School</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={newRecognition.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="green">Green</option>
                  <option value="innovation">Innovation</option>
                  <option value="community">Community</option>
                  <option value="excellence">Excellence</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Name *</label>
                <input
                  type="text"
                  name="recipient"
                  value={newRecognition.recipient}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Mr. Patil S.R."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Role</label>
                <input
                  type="text"
                  name="recipient_role"
                  value={newRecognition.recipient_role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Coordinator"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <input
                  type="text"
                  name="school"
                  value={newRecognition.school}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., ZP School, Shirdi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={newRecognition.district}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Ahmednagar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newRecognition.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreateRecognition}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Recognition'}
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
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Awards</p>
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
                <p className="text-xs text-muted-foreground">Schools</p>
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
                <p className="text-xs text-muted-foreground">Teachers</p>
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
                <p className="text-xs text-muted-foreground">Students</p>
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
        <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
          {lang === "en" ? "Filter" : "फिल्टर"}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div>
            <label className="text-sm font-medium block mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'school', 'teacher', 'student'].map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'green', 'innovation', 'community', 'excellence'].map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recognitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecognitions.map((recognition) => (
          <Card key={recognition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={cn("text-xs px-2 py-1 rounded-full", categoryColors[recognition.category])}>
                  {categoryIcons[recognition.category]} {
                    recognition.category.charAt(0).toUpperCase() + recognition.category.slice(1)
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
                  <p className="text-xs text-muted-foreground">{recognition.recipient_role}</p>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleLike(recognition.id)}
                >
                  <Heart className={cn("w-4 h-4 mr-1", recognition.liked && "fill-red-500 text-red-500")} />
                  {recognition.liked ? "Liked" : "Like"}
                </Button>

                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>

                {/* Edit/Delete - State only */}
                {user?.role === 'state' && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDelete(recognition.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecognitions.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-medium">No recognitions found</p>
        </div>
      )}
    </div>
  );
};

export default Recognition;