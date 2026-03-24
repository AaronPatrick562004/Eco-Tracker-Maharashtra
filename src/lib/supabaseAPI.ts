// src/lib/supabaseAPI.ts
import { supabase } from './supabase'; // ✅ This was missing!

// ==================== AUTH API ====================
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new Error('Invalid credentials');
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    return { user };
  },
  
  logout: () => {
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// ==================== SCHOOLS API ====================
export const schoolsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (school: any) => {
    const { data, error } = await supabase
      .from('schools')
      .insert([school])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

// ==================== ACTIVITIES API ====================
export const activitiesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (activity: any) => {
    const user = authAPI.getCurrentUser();
    const { data, error } = await supabase
      .from('activities')
      .insert([{ ...activity, created_by: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  approve: async (id: string) => {
    const user = authAPI.getCurrentUser();
    const { data, error } = await supabase
      .from('activities')
      .update({ 
        status: 'approved', 
        approved_by: user?.id, 
        approved_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  reject: async (id: string) => {
    const { data, error } = await supabase
      .from('activities')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

// ==================== MONITOR API ====================
export const monitorAPI = {
  getBlocks: async () => {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  getCompliance: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, district, block, compliance, status')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  getSchools: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};

// ==================== RECOGNITION API ====================
export const recognitionAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('recognitions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('recognitions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (recognition: any) => {
    const { data, error } = await supabase
      .from('recognitions')
      .insert([recognition])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('recognitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('recognitions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
  
  like: async (id: string) => {
    const { data: recognition } = await supabase
      .from('recognitions')
      .select('likes')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('recognitions')
      .update({ likes: (recognition?.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ==================== ECO-PASSPORTS API ====================
export const ecoPassportsAPI = {
  getStudents: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('points', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  getStudentById: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getBadges: async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  createStudent: async (student: any) => {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateStudent: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  addPoints: async (studentId: string, points: number) => {
    const { data: student } = await supabase
      .from('students')
      .select('points')
      .eq('id', studentId)
      .single();
    
    const { data, error } = await supabase
      .from('students')
      .update({ points: (student?.points || 0) + points })
      .eq('id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  awardBadge: async (studentId: string, badgeId: string) => {
    const { data, error } = await supabase
      .from('student_badges')
      .insert([{ student_id: studentId, badge_id: badgeId }])
      .select();
    
    if (error) throw error;
    return data;
  },
  
  deleteStudent: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getDashboard: async () => {
    const [schoolsCount, activitiesCount, atRiskCount] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('compliance', 'red')
    ]);
    
    return {
      totalSchools: schoolsCount.count || 0,
      totalActivities: activitiesCount.count || 0,
      complianceRate: 78.3,
      schoolsAtRisk: atRiskCount.count || 0
    };
  },
  
  getDistricts: async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('district');
    
    if (error) throw error;
    
    const districtMap = new Map();
    data?.forEach(school => {
      const district = school.district;
      districtMap.set(district, (districtMap.get(district) || 0) + 1);
    });
    
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
    let colorIndex = 0;
    
    return Array.from(districtMap.entries()).map(([name, count]) => ({
      name,
      schools: count,
      activities: 0,
      compliance: 0,
      students: 0,
      blocks: 0,
      trend: 'stable' as const
    }));
  },
  
  getBlocks: async () => {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  getTrends: async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('date');
    
    if (error) throw error;
    
    const monthMap = new Map();
    data?.forEach(activity => {
      const month = new Date(activity.date).toLocaleString('default', { month: 'short' });
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      activities: monthMap.get(month) || 0,
      compliance: 70,
      schools: 0
    }));
  },
  
  getActivityTypes: async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('type');
    
    if (error) throw error;
    
    const typeMap = new Map();
    data?.forEach(activity => {
      const type = activity.type;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    
    const total = data?.length || 1;
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-yellow-500', 'bg-purple-500'];
    const icons = [Leaf, Droplets, Recycle, Sun, Wind];
    let colorIndex = 0;
    
    return Array.from(typeMap.entries()).map(([type, count]) => ({
      type: type === 'plantation' ? 'Tree Plantation' :
            type === 'water' ? 'Water Conservation' :
            type === 'waste' ? 'Waste Management' :
            type === 'air' ? 'Clean Air' :
            type === 'energy' ? 'Energy Saving' : type,
      icon: icons[colorIndex % icons.length],
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[colorIndex++ % colors.length],
      trend: 5
    }));
  },
  
  export: async (format: string) => {
    const { data, error } = await supabase
      .from('schools')
      .select('*');
    
    if (error) throw error;
    return data;
  }
};

// ==================== COMMUNITY API ====================
export const communityAPI = {
  getPosts: async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  getPostById: async (id: string) => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  createPost: async (post: any) => {
    const user = authAPI.getCurrentUser();
    const { data, error } = await supabase
      .from('community_posts')
      .insert([{ ...post, author_id: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updatePost: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  likePost: async (id: string) => {
    const { data: post } = await supabase
      .from('community_posts')
      .select('likes')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('community_posts')
      .update({ likes: (post?.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  unlikePost: async (id: string) => {
    const { data: post } = await supabase
      .from('community_posts')
      .select('likes')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('community_posts')
      .update({ likes: Math.max(0, (post?.likes || 0) - 1) })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deletePost: async (id: string) => {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
  
  addComment: async (postId: string, content: string) => {
    const user = authAPI.getCurrentUser();
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([{ post_id: postId, author: user?.name, content }])
      .select()
      .single();
    
    if (commentError) throw commentError;
    
    const { data: post } = await supabase
      .from('community_posts')
      .select('comments_count')
      .eq('id', postId)
      .single();
    
    await supabase
      .from('community_posts')
      .update({ comments_count: (post?.comments_count || 0) + 1 })
      .eq('id', postId);
    
    return comment;
  },
  
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  deleteComment: async (postId: string, commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    
    const { data: post } = await supabase
      .from('community_posts')
      .select('comments_count')
      .eq('id', postId)
      .single();
    
    await supabase
      .from('community_posts')
      .update({ comments_count: Math.max(0, (post?.comments_count || 0) - 1) })
      .eq('id', postId);
    
    return { success: true };
  },
  
  getEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  createEvent: async (event: any) => {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateEvent: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteEvent: async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

// ==================== RESOLUTIONS API ====================
export const resolutionsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('resolutions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  getRecent: async () => {
    const { data, error } = await supabase
      .from('resolutions')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('resolutions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (resolution: any) => {
    const { data, error } = await supabase
      .from('resolutions')
      .insert([resolution])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('resolutions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('resolutions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
  
  download: async (id: string) => {
    const resolution = await resolutionsAPI.getById(id);
    return resolution;
  }
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: async () => {
    const [schoolsCount, activitiesCount, atRiskCount] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('activities').select('*', { count: 'exact', head: true }),
      supabase.from('schools').select('*', { count: 'exact', head: true }).eq('compliance', 'red')
    ]);
    
    return {
      totalSchools: schoolsCount.count || 0,
      totalActivities: activitiesCount.count || 0,
      complianceRate: 78.3,
      schoolsAtRisk: atRiskCount.count || 0
    };
  },
  
  getMetrics: async () => {
    return await dashboardAPI.getStats();
  },
  
  getRecentActivities: async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  }
};

// ==================== USERS API ====================
export const usersAPI = {
  getProfile: async () => {
    const user = authAPI.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateProfile: async (updates: any) => {
    const user = authAPI.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  changePassword: async (oldPassword: string, newPassword: string) => {
    return { success: true };
  }
};

// ==================== BADGES API ====================
export const badgesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (badge: any) => {
    const { data, error } = await supabase
      .from('badges')
      .insert([badge])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('badges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

// Import icons for analytics
import { Leaf, Droplets, Recycle, Sun, Wind } from "lucide-react";