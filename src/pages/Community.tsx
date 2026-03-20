import { useState, useEffect } from "react";
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Heart, 
  Eye,
  MapPin,
  Calendar,
  Award,
  ChevronRight,
  Plus,
  Image,
  ThumbsUp,
  MessageSquare,
  MoreVertical,
  Flag,
  Trash2,
  Edit,
  Pin,
  Bell,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Send,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";
import { communityAPI } from "@/lib/api";

interface Comment {
  id: string;
  author: string;
  author_role: string;
  content: string;
  time: string;
  likes: number;
  liked?: boolean;
}

interface Post {
  id: string;
  author: string;
  author_role: string;
  author_id: string;
  school: string;
  district: string;
  block: string;
  content: string;
  image_url?: string;
  likes: number;
  comments_count: number;
  pinned: boolean;
  status: "published" | "flagged" | "hidden";
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  district: string;
  participants: number;
  organizer: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

interface Member {
  id: string;
  name: string;
  role: string;
  school: string;
  district: string;
  posts: number;
  likes: number;
  status: "online" | "offline" | "away";
  badges?: string[];
}

interface Props {
  lang: Language;
}

const Community = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [members] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    image_url: '',
    school: user?.school || '',
    district: user?.district || '',
    block: user?.block || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsData, eventsData] = await Promise.all([
        communityAPI.getPosts(),
        communityAPI.getEvents()
      ]);
      setPosts(postsData);
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (post.status === 'flagged' && user?.role !== 'state') return false;
    
    if (user?.role === 'principal' && post.school !== user.school) return false;
    if (user?.role === 'beo' && user.block && post.block !== user.block) return false;
    if (user?.role === 'deo' && user.district && post.district !== user.district) return false;
    
    return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleLike = async (postId: string) => {
    try {
      await communityAPI.likePost(postId);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post?')) return;
    
    try {
      await communityAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePost = async () => {
    try {
      setSubmitting(true);
      if (!newPost.content.trim()) {
        throw new Error('Please enter some content');
      }

      const created = await communityAPI.createPost({
        ...newPost,
        author: user?.name,
        author_role: user?.role,
        author_id: user?.id
      });
      
      setPosts(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewPost({
        content: '',
        image_url: '',
        school: user?.school || '',
        district: user?.district || '',
        block: user?.block || ''
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
            Community
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Connect, share, and learn from others
          </p>
        </div>
        
        {/* Create Post Button - Everyone can create */}
        <Button 
          className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          Create Post
        </Button>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Post</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <Textarea
                  name="content"
                  value={newPost.content}
                  onChange={handleInputChange}
                  placeholder="What would you like to share?"
                  rows={5}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Image URL (optional)</label>
                <Input
                  type="text"
                  name="image_url"
                  value={newPost.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">School</label>
                  <Input
                    type="text"
                    name="school"
                    value={newPost.school}
                    onChange={handleInputChange}
                    placeholder="Your school"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">District</label>
                  <Input
                    type="text"
                    name="district"
                    value={newPost.district}
                    onChange={handleInputChange}
                    placeholder="Your district"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreatePost}
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Create Post'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-blue-500" />
            <p className="text-lg sm:text-xl font-bold">150</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-green-500" />
            <p className="text-lg sm:text-xl font-bold">{posts.length}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-amber-500" />
            <p className="text-lg sm:text-xl font-bold">{events.length}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {/* Pinned Posts */}
          {filteredPosts.filter(p => p.pinned).map((post) => (
            <Card key={post.id} className="border-2 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{post.author?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{post.author}</h4>
                          <Pin className="w-3 h-3 text-amber-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {post.school} • {post.district}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm mt-3">{post.content}</p>

                    {post.image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img src={post.image_url} alt="Post" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </button>
                      
                      {user?.role === 'state' && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex items-center gap-1 text-sm text-red-600 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Regular Posts */}
          {filteredPosts.filter(p => !p.pinned).map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{post.author?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{post.author}</h4>
                        <p className="text-xs text-muted-foreground">
                          {post.school} • {post.district}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm mt-3">{post.content}</p>

                    {post.image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img src={post.image_url} alt="Post" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                      </button>
                      
                      {(user?.role === 'state' || post.author_id === user?.id) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex items-center gap-1 text-sm text-red-600 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg text-center min-w-[80px]">
                    <p className="text-sm font-bold text-green-600">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {new Date(event.date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <Badge className={cn(
                      "mt-1",
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {event.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.participants} participants
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold">User {i}</h4>
                  <p className="text-xs text-muted-foreground">School Coordinator</p>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;