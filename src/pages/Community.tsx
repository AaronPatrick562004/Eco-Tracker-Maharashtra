import { useState } from "react";
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
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth-context";

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  time: string;
  likes: number;
  liked?: boolean;
}

interface Post {
  id: string;
  author: string;
  authorRole: string;
  authorId: string;
  authorAvatar?: string;
  school: string;
  schoolId: string;
  district: string;
  block: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  saved?: boolean;
  reported?: boolean;
  pinned?: boolean;
  activity?: {
    type: string;
    title: string;
  };
  status: "published" | "flagged" | "hidden";
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  district: string;
  block: string;
  participants: number;
  organizer: string;
  organizerId: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  image?: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  school: string;
  district: string;
  avatar?: string;
  posts: number;
  likes: number;
  joined: string;
  status: "online" | "offline" | "away";
  badges?: string[];
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: "Mr. Patil S.R.",
    authorRole: "Coordinator",
    authorId: "user1",
    school: "ZP Primary School, Shirdi",
    schoolId: "1",
    district: "Ahmednagar",
    block: "Shirur",
    time: "2 hours ago",
    content: "We successfully planted 50 saplings in our school campus today! Students were very enthusiastic about the tree plantation drive. #EcoWarriors #TreePlantation",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500",
    likes: 24,
    comments: [
      {
        id: "c1",
        author: "Ms. Deshmukh A.V.",
        authorRole: "Teacher",
        content: "Great work! Our school also did similar activity last week.",
        time: "1 hour ago",
        likes: 5,
        liked: false
      },
      {
        id: "c2",
        author: "Mr. Jadhav R.K.",
        authorRole: "Coordinator",
        content: "Amazing! Would love to collaborate on next event.",
        time: "30 min ago",
        likes: 3,
        liked: true
      }
    ],
    liked: false,
    saved: false,
    reported: false,
    pinned: false,
    activity: {
      type: "Tree Plantation",
      title: "Tree Plantation Drive"
    },
    status: "published"
  },
  {
    id: "2",
    author: "Ms. Deshmukh A.V.",
    authorRole: "Teacher",
    authorId: "user2",
    school: "Municipal School No. 12, Pune",
    schoolId: "2",
    district: "Pune",
    block: "Haveli",
    time: "5 hours ago",
    content: "Conducted a rainwater harvesting workshop for students. They learned about water conservation techniques and built a small model. So proud of their creativity!",
    likes: 18,
    comments: [
      {
        id: "c3",
        author: "Mr. Patil S.R.",
        authorRole: "Coordinator",
        content: "That's fantastic! Can you share the workshop materials?",
        time: "3 hours ago",
        likes: 2,
        liked: false
      }
    ],
    liked: true,
    saved: true,
    reported: false,
    pinned: false,
    activity: {
      type: "Workshop",
      title: "Rainwater Harvesting Workshop"
    },
    status: "published"
  },
  {
    id: "3",
    author: "Mr. Jadhav R.K.",
    authorRole: "Coordinator",
    authorId: "user3",
    school: "ZP School, Washim",
    schoolId: "3",
    district: "Washim",
    block: "Washim",
    time: "1 day ago",
    content: "Our students collected 50 kg of plastic waste from the village and gave it for recycling. Great initiative by the Eco Club! Small steps towards a cleaner future.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500",
    likes: 32,
    comments: [],
    liked: false,
    saved: false,
    reported: false,
    pinned: true,
    activity: {
      type: "Waste Management",
      title: "Plastic Collection Drive"
    },
    status: "published"
  },
  {
    id: "4",
    author: "Admin User",
    authorRole: "State Officer",
    authorId: "admin",
    school: "Education Department",
    schoolId: "0",
    district: "Maharashtra",
    block: "State",
    time: "2 days ago",
    content: "Important Announcement: The state-level Eco Summit will be held on April 15th in Pune. All school coordinators are requested to register.",
    likes: 45,
    comments: [
      {
        id: "c4",
        author: "Ms. More L.A.",
        authorRole: "Teacher",
        content: "Where can we register?",
        time: "1 day ago",
        likes: 4,
        liked: false
      },
      {
        id: "c5",
        author: "Admin User",
        authorRole: "State Officer",
        content: "Registration link will be shared tomorrow.",
        time: "12 hours ago",
        likes: 8,
        liked: true
      }
    ],
    liked: true,
    saved: true,
    reported: false,
    pinned: true,
    status: "published"
  },
  {
    id: "5",
    author: "Mr. Shinde V.B.",
    authorRole: "Coordinator",
    authorId: "user5",
    school: "Adarsh Vidyalaya, Kolhapur",
    schoolId: "5",
    district: "Kolhapur",
    block: "Karvir",
    time: "3 days ago",
    content: "This post has been flagged for review due to inappropriate content.",
    likes: 2,
    comments: [],
    liked: false,
    saved: false,
    reported: true,
    pinned: false,
    status: "flagged"
  },
];

const mockEvents: Event[] = [
  {
    id: "1",
    title: "State Level Eco Summit",
    description: "Annual meeting of all Eco Club coordinators to share best practices and plan for the upcoming year. Keynote speakers, workshops, and networking opportunities.",
    date: "2024-04-15",
    location: "Pune",
    district: "Pune",
    block: "Haveli",
    participants: 250,
    organizer: "State Education Department",
    organizerId: "admin",
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500"
  },
  {
    id: "2",
    title: "Tree Plantation Week",
    description: "Join us for a week-long tree plantation drive across all schools in the district. Saplings will be provided by the Forest Department.",
    date: "2024-03-25",
    location: "Multiple Locations",
    district: "Ahmednagar",
    block: "All Blocks",
    participants: 5000,
    organizer: "Forest Department",
    organizerId: "dept1",
    status: "upcoming"
  },
  {
    id: "3",
    title: "Water Conservation Workshop",
    description: "Learn about rainwater harvesting and water saving techniques for schools. Hands-on demonstration and material provided.",
    date: "2024-03-30",
    location: "ZP Office, Nashik",
    district: "Nashik",
    block: "Nashik",
    participants: 100,
    organizer: "Groundwater Survey Department",
    organizerId: "dept2",
    status: "upcoming"
  },
  {
    id: "4",
    title: "Plastic-Free Campus Drive",
    description: "Ongoing initiative to make schools plastic-free. Join the movement!",
    date: "2024-03-01",
    location: "All Schools",
    district: "Pune",
    block: "All Blocks",
    participants: 1500,
    organizer: "Pune ZP",
    organizerId: "deo1",
    status: "ongoing"
  },
  {
    id: "5",
    title: "Clean Air Awareness Campaign",
    description: "Completed campaign with great success. Report available.",
    date: "2024-02-15",
    location: "Nagpur",
    district: "Nagpur",
    block: "Nagpur City",
    participants: 800,
    organizer: "Nagpur Municipal Corporation",
    organizerId: "deo2",
    status: "completed"
  },
];

const mockMembers: Member[] = [
  {
    id: "1",
    name: "Mr. Patil S.R.",
    role: "Coordinator",
    school: "ZP Primary School, Shirdi",
    district: "Ahmednagar",
    posts: 23,
    likes: 156,
    joined: "Jan 2024",
    status: "online",
    badges: ["Top Contributor", "Eco Warrior"]
  },
  {
    id: "2",
    name: "Ms. Deshmukh A.V.",
    role: "Teacher",
    school: "Municipal School No. 12, Pune",
    district: "Pune",
    posts: 15,
    likes: 98,
    joined: "Feb 2024",
    status: "online",
    badges: ["Workshop Leader"]
  },
  {
    id: "3",
    name: "Mr. Jadhav R.K.",
    role: "Coordinator",
    school: "ZP School, Washim",
    district: "Washim",
    posts: 31,
    likes: 203,
    joined: "Dec 2023",
    status: "offline",
    badges: ["Top Contributor", "Activity Champion"]
  },
  {
    id: "4",
    name: "Admin User",
    role: "State Officer",
    school: "Education Department",
    district: "Maharashtra",
    posts: 45,
    likes: 567,
    joined: "Jan 2024",
    status: "online",
    badges: ["Admin", "Moderator"]
  },
  {
    id: "5",
    name: "Ms. More L.A.",
    role: "Teacher",
    school: "Navodaya Vidyalaya, Satara",
    district: "Satara",
    posts: 8,
    likes: 42,
    joined: "Mar 2024",
    status: "away",
    badges: ["New Member"]
  },
];

interface Props {
  lang: Language;
}

const Community = ({ lang }: Props) => {
  const t = translations[lang];
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [members] = useState<Member[]>(mockMembers);
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showCommentBox, setShowCommentBox] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  // Filter posts based on role and search
  const filteredPosts = posts
    .filter(post => {
      // Don't show flagged posts to regular users
      if (post.status === "flagged" && user?.role !== 'state') return false;
      
      // Role-based visibility
      if (user?.role === 'principal') {
        return post.school === user.school || post.pinned;
      }
      if (user?.role === 'beo' && user?.block) {
        return post.block === user.block || post.pinned;
      }
      if (user?.role === 'deo' && user?.district) {
        return post.district === user.district || post.pinned;
      }
      return true; // State sees all
    })
    .filter(post => {
      if (!searchQuery) return true;
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.school.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter(post => {
      if (selectedDistrict === "all") return true;
      return post.district === selectedDistrict;
    });

  const filteredEvents = events.filter(event => {
    if (user?.role === 'principal') {
      return event.district === user.district;
    }
    if (user?.role === 'beo' && user?.block) {
      return event.block === user.block || event.block === "All Blocks";
    }
    if (user?.role === 'deo' && user?.district) {
      return event.district === user.district;
    }
    return true;
  });

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
  };

  const handleReport = (postId: string) => {
    if (window.confirm(lang === "en" ? "Report this post?" : "ही पोस्ट रिपोर्ट करायची?")) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, reported: true, status: "flagged" } : post
        )
      );
    }
  };

  const handlePin = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, pinned: !post.pinned } : post
      )
    );
  };

  const handleDelete = (postId: string) => {
    if (window.confirm(lang === "en" ? "Delete this post?" : "ही पोस्ट हटवायची?")) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
  };

  const handleHide = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, status: "hidden" } : post
      )
    );
  };

  const handleAddComment = (postId: string) => {
    if (!newComment[postId]?.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: user?.name || "User",
      authorRole: user?.role || "User",
      content: newComment[postId],
      time: "just now",
      likes: 0,
      liked: false
    };

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    setNewComment(prev => ({ ...prev, [postId]: "" }));
    setShowCommentBox(null);
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(c =>
                c.id === commentId
                  ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
                  : c
              )
            }
          : post
      )
    );
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (window.confirm(lang === "en" ? "Delete this comment?" : "ही टिप्पणी हटवायची?")) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
            : post
        )
      );
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    if (isMobile) {
      setShowPostDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowPostDetail(false);
    setSelectedPost(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "upcoming": return "bg-blue-100 text-blue-700";
      case "ongoing": return "bg-green-100 text-green-700";
      case "completed": return "bg-gray-100 text-gray-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch(status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-gray-400";
      case "away": return "bg-yellow-500";
      default: return "bg-gray-400";
    }
  };

  // Mobile post detail view
  if (isMobile && showPostDetail && selectedPost) {
    return (
      <div className="p-4 space-y-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>{lang === "en" ? "Back to feed" : "फीडकडे परत"}</span>
        </button>

        <Card>
          <CardContent className="p-4">
            {/* Author Info */}
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{selectedPost.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedPost.author}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedPost.school} • {selectedPost.district}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedPost.pinned && (
                      <Pin className="w-4 h-4 text-amber-500" />
                    )}
                    {selectedPost.status === "flagged" && (
                      <Flag className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Activity Tag */}
                {selectedPost.activity && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-2">
                    <Award className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">{selectedPost.activity.title}</span>
                  </div>
                )}

                {/* Content */}
                <p className="text-sm mt-3">{selectedPost.content}</p>

                {/* Image */}
                {selectedPost.image && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img 
                      src={selectedPost.image} 
                      alt="Post" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground mt-2">{selectedPost.time}</p>

                {/* Like/Save Count */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{selectedPost.likes} likes</span>
                  <span>{selectedPost.comments.length} comments</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={cn(
                      "flex items-center gap-1 text-sm transition-colors",
                      selectedPost.liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", selectedPost.liked && "fill-current")} />
                    <span>Like</span>
                  </button>
                  <button
                    onClick={() => setShowCommentBox(selectedPost.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comment</span>
                  </button>
                  <button
                    onClick={() => handleSave(selectedPost.id)}
                    className={cn(
                      "flex items-center gap-1 text-sm transition-colors",
                      selectedPost.saved ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Save</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ml-auto">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Admin Actions - State only */}
                {user?.role === 'state' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" variant="outline" onClick={() => handlePin(selectedPost.id)}>
                      <Pin className="w-4 h-4 mr-1" />
                      {selectedPost.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReport(selectedPost.id)}>
                      <Flag className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedPost.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleHide(selectedPost.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Hide
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-4 space-y-3">
              <h5 className="font-semibold text-sm">Comments ({selectedPost.comments.length})</h5>
              
              {selectedPost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/30 p-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleLikeComment(selectedPost.id, comment.id)}
                          className={cn(
                            "text-xs flex items-center gap-1",
                            comment.liked ? "text-red-500" : "text-muted-foreground"
                          )}
                        >
                          <Heart className={cn("w-3 h-3", comment.liked && "fill-current")} />
                          {comment.likes}
                        </button>
                        {(user?.role === 'state' || comment.author === user?.name) && (
                          <button
                            onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                            className="text-xs text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              {showCommentBox === selectedPost.id ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newComment[selectedPost.id] || ""}
                    onChange={(e) => setNewComment({ ...newComment, [selectedPost.id]: e.target.value })}
                    placeholder={lang === "en" ? "Write a comment..." : "टिप्पणी लिहा..."}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleAddComment(selectedPost.id)}>
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCommentBox(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setShowCommentBox(selectedPost.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create Post Form
  if (showCreatePost) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <button
          onClick={() => setShowCreatePost(false)}
          className="flex items-center gap-2 text-muted-foreground mb-2"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span>{lang === "en" ? "Back to community" : "समुदायाकडे परत"}</span>
        </button>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "en" ? "Create New Post" : "नवीन पोस्ट तयार करा"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder={lang === "en" ? "What would you like to share?" : "तुम्हाला काय शेअर करायचे आहे?"}
                rows={5}
                className="w-full"
              />
              
              <div>
                <label className="text-sm font-medium block mb-2">Add Image (Optional)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Related Activity (Optional)</label>
                <select className="w-full p-2 rounded-lg border border-border bg-background">
                  <option value="">None</option>
                  <option value="plantation">Tree Plantation</option>
                  <option value="water">Water Conservation</option>
                  <option value="waste">Waste Management</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  {lang === "en" ? "Post" : "पोस्ट करा"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  {lang === "en" ? "Cancel" : "रद्द करा"}
                </Button>
              </div>
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
            {t.community}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {lang === "en" ? "Connect, share, and learn from others" : "इतरांशी कनेक्ट व्हा, शेअर करा आणि शिका"}
          </p>
        </div>
        
        {/* Role-based header buttons */}
        <div className="flex gap-2">
          {/* Create Post - Everyone */}
          <Button 
            className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={() => setShowCreatePost(true)}
          >
            <Plus className="w-4 h-4" />
            {lang === "en" ? "Create Post" : "पोस्ट तयार करा"}
          </Button>

          {/* Moderation Tools - State only */}
          {user?.role === 'state' && (
            <Button variant="outline" className="gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Moderate</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Everyone sees */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-blue-500" />
            <p className="text-lg sm:text-xl font-bold">{members.length}</p>
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Members" : "सदस्य"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-green-500" />
            <p className="text-lg sm:text-xl font-bold">{posts.filter(p => p.status === "published").length}</p>
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Posts" : "पोस्ट"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-amber-500" />
            <p className="text-lg sm:text-xl font-bold">{events.length}</p>
            <p className="text-xs text-muted-foreground">{lang === "en" ? "Events" : "कार्यक्रम"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "en" ? "Search posts, events, members..." : "पोस्ट, कार्यक्रम, सदस्य शोधा..."}
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

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">District</label>
                <select 
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="all">All Districts</option>
                  <option value="Pune">Pune</option>
                  <option value="Ahmednagar">Ahmednagar</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Thane">Thane</option>
                  <option value="Nashik">Nashik</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Sort By</label>
                <select className="w-full p-2 rounded-lg border border-border bg-background">
                  <option>Latest</option>
                  <option>Most Liked</option>
                  <option>Most Commented</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Time</label>
                <select className="w-full p-2 rounded-lg border border-border bg-background">
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="feed" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="feed">{lang === "en" ? "Feed" : "फीड"}</TabsTrigger>
          <TabsTrigger value="events">{lang === "en" ? "Events" : "कार्यक्रम"}</TabsTrigger>
          <TabsTrigger value="members">{lang === "en" ? "Members" : "सदस्य"}</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {/* Pinned Posts - Show first */}
          {filteredPosts.filter(p => p.pinned).map((post) => (
            <Card key={post.id} className="border-2 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                    </div>

                    {/* Activity Tag */}
                    {post.activity && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-2">
                        <Award className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">{post.activity.title}</span>
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-sm mt-2 cursor-pointer" onClick={() => handlePostClick(post)}>
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>

                    {/* Image */}
                    {post.image && (
                      <div className="mt-2 rounded-lg overflow-hidden cursor-pointer" onClick={() => handlePostClick(post)}>
                        <img 
                          src={post.image} 
                          alt="Post" 
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors",
                          post.liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", post.liked && "fill-current")} />
                        <span>{post.likes}</span>
                      </button>
                      <button
                        onClick={() => setShowCommentBox(post.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                      </button>
                      <button
                        onClick={() => handleSave(post.id)}
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors",
                          post.saved ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
                        )}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handlePostClick(post)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>

                    {/* Quick Comment */}
                    {showCommentBox === post.id && (
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                          placeholder={lang === "en" ? "Write a comment..." : "टिप्पणी लिहा..."}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddComment(post.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Last comment preview */}
                    {post.comments.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">{post.comments[0].author}:</span> {post.comments[0].content.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Regular Posts */}
          {filteredPosts.filter(p => !p.pinned && p.status === "published").map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{post.author}</h4>
                        <p className="text-xs text-muted-foreground">
                          {post.school} • {post.district}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                    </div>

                    {/* Activity Tag */}
                    {post.activity && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-2">
                        <Award className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">{post.activity.title}</span>
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-sm mt-2 cursor-pointer" onClick={() => handlePostClick(post)}>
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>

                    {/* Image */}
                    {post.image && (
                      <div className="mt-2 rounded-lg overflow-hidden cursor-pointer" onClick={() => handlePostClick(post)}>
                        <img 
                          src={post.image} 
                          alt="Post" 
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors",
                          post.liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", post.liked && "fill-current")} />
                        <span>{post.likes}</span>
                      </button>
                      <button
                        onClick={() => setShowCommentBox(post.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                      </button>
                      <button
                        onClick={() => handleSave(post.id)}
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors",
                          post.saved ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
                        )}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handlePostClick(post)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>

                    {/* Quick Comment */}
                    {showCommentBox === post.id && (
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                          placeholder={lang === "en" ? "Write a comment..." : "टिप्पणी लिहा..."}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleAddComment(post.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Last comment preview */}
                    {post.comments.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">{post.comments[0].author}:</span> {post.comments[0].content.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Flagged Posts - Only visible to State */}
          {user?.role === 'state' && filteredPosts.filter(p => p.status === "flagged").length > 0 && (
            <>
              <h4 className="font-semibold text-red-600 mt-4 mb-2">Flagged Posts (Moderation Queue)</h4>
              {filteredPosts.filter(p => p.status === "flagged").map((post) => (
                <Card key={post.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{post.author}</h4>
                            <p className="text-xs text-muted-foreground">
                              {post.school} • {post.district}
                            </p>
                          </div>
                          <Badge variant="destructive">Flagged</Badge>
                        </div>

                        <p className="text-sm mt-2">{post.content}</p>

                        {/* Admin Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" className="bg-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline">
                            <Ban className="w-4 h-4 mr-1" />
                            Ban User
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Load More */}
          <Button variant="outline" className="w-full">
            {lang === "en" ? "Load More Posts" : "अधिक पोस्ट लोड करा"}
          </Button>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4 mt-4">
          {filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center min-w-[80px]">
                    <p className="text-sm font-bold text-green-600">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {new Date(event.date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{event.title}</h4>
                        <Badge className={cn("mt-1", getStatusColor(event.status))}>
                          {event.status}
                        </Badge>
                      </div>
                      {event.image && (
                        <img src={event.image} alt={event.title} className="w-16 h-16 rounded-lg object-cover" />
                      )}
                    </div>
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
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {lang === "en" ? "Organized by: " : "आयोजक: "}{event.organizer}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          {lang === "en" ? "Details" : "तपशील"}
                        </Button>
                        {event.status === "upcoming" && (
                          <Button size="sm">
                            {lang === "en" ? "Register" : "नोंदणी करा"}
                          </Button>
                        )}
                      </div>
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
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="relative">
                    <div className={cn(
                      "absolute top-0 right-0 w-2 h-2 rounded-full",
                      getMemberStatusColor(member.status)
                    )} />
                    <div className="text-center">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarFallback className="text-xl">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">{member.school}</p>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {member.badges?.map((badge, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-center gap-4 mt-3 text-xs">
                        <div>
                          <p className="font-medium">{member.posts}</p>
                          <p className="text-muted-foreground">Posts</p>
                        </div>
                        <div>
                          <p className="font-medium">{member.likes}</p>
                          <p className="text-muted-foreground">Likes</p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>

                      {/* Admin Actions - State only */}
                      {user?.role === 'state' && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="ghost" className="flex-1">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="flex-1 text-red-600">
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
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