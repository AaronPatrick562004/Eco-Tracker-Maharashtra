// src/pages/Community.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { translations, Language } from '@/lib/translations';
import { Heart, MessageCircle, Share2, Plus, X, Maximize2, MinusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author: string;
  author_role: string;
  author_id: string;
  school: string;
  district: string;
  block: string;
  likes: number;
  comments_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  author: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface Props {
  lang: Language;
  searchQuery?: string; // ✅ Add searchQuery prop
}

const Community = ({ lang, searchQuery = "" }: Props) => {
  const t = translations[lang];
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  
  // Comments state
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });

  // Image lightbox functions
  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setImageScale(1);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setImageScale(1);
    document.body.style.overflow = 'auto';
  };

  const zoomIn = () => {
    setImageScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setImageScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Add a new comment
  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }
    
    setCommentSubmitting(true);
    
    try {
      // Insert comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          author: user?.name || user?.email,
          author_role: user?.role,
          content: newComment.trim(),
          created_at: new Date().toISOString()
        }]);
      
      if (commentError) throw commentError;
      
      // Update comments count on post
      const post = posts.find(p => p.id === postId);
      if (post) {
        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ comments_count: (post.comments_count || 0) + 1 })
          .eq('id', postId);
        
        if (updateError) throw updateError;
      }
      
      setNewComment('');
      await fetchComments(postId);
      await fetchPosts(); // Refresh to update comment count
      
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('❌ Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Share post functionality
  const handleShare = async (post: Post) => {
    const shareText = `${post.title ? `🌟 ${post.title}\n\n` : ''}${post.content}\n\n---\nShared via EcoTrack Maharashtra | Green Future Initiative`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'EcoTrack Post',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('✅ Post details copied to clipboard!');
      } catch (err) {
        alert('❌ Failed to copy');
      }
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    fetchPosts();
    
    const subscription = supabase
      .channel('posts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_posts' },
        () => fetchPosts()
      )
      .subscribe();
    
    const commentsSubscription = supabase
      .channel('comments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          if (showComments) {
            fetchComments(showComments);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('community_posts').select('*');
      
      // ✅ Role-based filtering using correct user properties from auth context
      if (user?.role === 'principal' && user?.school) {
        query = query.eq('school', user.school);
      } else if (user?.role === 'beo' && user?.block) {
        query = query.eq('block', user.block);
      } else if (user?.role === 'deo' && user?.district) {
        query = query.eq('district', user.district);
      }
      // State sees all (no filter)
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) { 
      console.error(err); 
      setError('Failed to fetch posts');
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      setError('Please add a title or content');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          title: formData.title.trim(),
          content: formData.content.trim(),
          image_url: formData.image_url || null,
          author: user?.name || user?.email,
          author_role: user?.role,
          author_id: user?.id,
          school: user?.school || '',
          district: user?.district || '',
          block: user?.block || '',
          likes: 0,
          comments_count: 0,
          status: 'active',
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowForm(false);
      setFormData({ title: '', content: '', image_url: '' });
      fetchPosts();
      alert('✅ Post created successfully!');
    } catch (err: any) { 
      setError(err.message);
      console.error('Create error:', err);
      alert('❌ Failed to create post: ' + err.message);
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleLike = async (id: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', id);
      if (error) throw error;
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    } catch (err) { 
      console.error(err); 
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'state': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'deo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'beo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'principal': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // ✅ Filter posts using searchQuery from TopBar
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return post.title?.toLowerCase().includes(query) ||
           post.content?.toLowerCase().includes(query) ||
           post.author?.toLowerCase().includes(query);
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
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground mt-1">Share and connect with the eco-community</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              🔍 Showing results for: "{searchQuery}"
            </p>
          )}
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4" /> Create Post
        </Button>
      </div>

      {/* Create Post Modal - same */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Create New Post</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                <Input 
                  placeholder="e.g., Eco-Star of the Week!" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea
                  rows={8}
                  placeholder="Share your eco-story, achievements, or announcements..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 resize-y"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload to Imgur or Supabase Storage and paste the URL here
                </p>
              </div>
              
              {formData.image_url && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="max-h-40 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(formData.image_url)}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x200/f0f0f0/666?text=Invalid+Image+URL';
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Click image to preview larger</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                  {submitting ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed - Using filteredPosts */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.author?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{post.author}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(post.author_role)}>
                          {post.author_role?.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                {post.title && (
                  <h3 className="text-lg font-semibold text-foreground mt-3">
                    {post.title}
                  </h3>
                )}
                
                {/* Content */}
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {/* Image */}
                {post.image_url && (
                  <div className="mt-4">
                    <img 
                      src={post.image_url} 
                      alt={post.title || 'Post image'} 
                      className="max-h-96 w-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                      onClick={() => openLightbox(post.image_url)}
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x200/f0f0f0/666?text=Image+Not+Found';
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> Click image to enlarge
                    </p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-6 mt-4 pt-3 border-t border-border">
                  <button 
                    onClick={() => handleLike(post.id, post.likes)} 
                    className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">{post.likes} Likes</span>
                  </button>
                  
                  {/* Comments Button */}
                  <button 
                    onClick={() => {
                      if (showComments === post.id) {
                        setShowComments(null);
                      } else {
                        setShowComments(post.id);
                        fetchComments(post.id);
                      }
                    }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments_count} Comments</span>
                  </button>
                  
                  {/* Share Button */}
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
                
                {/* Comments Section */}
                {showComments === post.id && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3">Comments</h4>
                    
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {(comments[post.id] || []).map((comment: Comment) => (
                        <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <Badge className={getRoleColor(comment.author_role)}>
                              {comment.author_role?.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      ))}
                      
                      {(!comments[post.id] || comments[post.id].length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !commentSubmitting) {
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleAddComment(post.id)}
                        disabled={commentSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {commentSubmitting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">
              {searchQuery ? `No posts found for "${searchQuery}"` : 'No posts yet'}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Be the first to share something with the community!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} className="mt-4 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal - same */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="absolute -top-12 left-0 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setImageScale(1); }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-2 text-sm transition-colors"
              >
                Reset
              </button>
            </div>
            
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] object-contain cursor-pointer"
              style={{ transform: `scale(${imageScale})`, transition: 'transform 0.2s ease' }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {imageScale !== 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {Math.round(imageScale * 100)}%
              </div>
            )}
            
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs whitespace-nowrap">
              Click outside to close • Click image to zoom
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;