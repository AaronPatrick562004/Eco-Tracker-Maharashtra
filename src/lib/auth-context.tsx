// src/lib/auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'state' | 'deo' | 'beo' | 'principal';
  district?: string;
  block?: string;
  school?: string;
  school_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string, resource: string) => boolean;
  loading: boolean;
}

// Permission matrix based on roles
// State: Full access to everything
// DEO: District level access
// BEO: Block level access  
// Principal: School level access
const permissions: Record<string, Record<string, string[]>> = {
  // STATE OFFICER - Full access to everything
  state: {
    resolutions: ['create', 'read', 'update', 'delete'],
    schools: ['create', 'read', 'update', 'delete'],
    activities: ['create', 'read', 'update', 'delete', 'approve'],
    blocks: ['create', 'read', 'update', 'delete'],
    recognitions: ['create', 'read', 'update', 'delete'],
    students: ['create', 'read', 'update', 'delete'],
    districts: ['create', 'read', 'update', 'delete'],
    monthly_trends: ['create', 'read', 'update', 'delete'],
    community: ['create', 'read', 'update', 'delete', 'moderate'],
    comments: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
  },
  
  // DEO (District Education Officer) - District level access
  deo: {
    resolutions: ['read'],
    schools: ['read', 'update'],
    activities: ['read', 'approve'],
    blocks: ['read'],
    recognitions: ['create', 'read', 'update'],
    students: ['read'],
    districts: ['read'],
    monthly_trends: ['read'],
    community: ['read', 'create', 'moderate'],
    comments: ['read', 'create'],
    users: ['read'],
  },
  
  // BEO (Block Education Officer) - Block level access
  beo: {
    resolutions: ['read'],
    schools: ['read', 'update'],
    activities: ['read', 'approve'],
    blocks: ['read'],
    recognitions: ['create', 'read'],
    students: ['read'],
    districts: ['read'],
    monthly_trends: ['read'],
    community: ['read', 'create'],
    comments: ['read', 'create'],
    users: ['read'],
  },
  
  // PRINCIPAL - School level access
  principal: {
    resolutions: ['read'],
    schools: ['read'],
    activities: ['create', 'read', 'update'],
    blocks: ['read'],
    recognitions: ['read'],
    students: ['read', 'update'],
    districts: ['read'],
    monthly_trends: ['read'],
    community: ['create', 'read', 'update'],
    comments: ['create', 'read'],
    users: ['read'],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('ecotrack_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('ecotrack_user');
      }
    }
    setLoading(false);
  }, []);

  const hasPermission = (action: string, resource: string): boolean => {
    if (!user) {
      console.log('No user logged in');
      return false;
    }
    
    const userPermissions = permissions[user.role]?.[resource];
    if (!userPermissions) {
      console.log(`No permissions defined for role: ${user.role}, resource: ${resource}`);
      return false;
    }
    
    const hasPerm = userPermissions.includes(action);
    console.log(`Permission check: role=${user.role}, resource=${resource}, action=${action}, result=${hasPerm}`);
    return hasPerm;
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      // Fetch user from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error('User not found. Please check your email.');
      }
      
      if (!data) {
        throw new Error('Invalid email or password');
      }
      
      // For demo purposes, password is not stored.
      // In production, use Supabase Auth for password management.
      // For now, any password works with valid email.
      
      const userData: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        district: data.district,
        block: data.block,
        school: data.school_name,
        school_id: data.school_id
      };
      
      console.log('Login successful:', userData);
      
      setUser(userData);
      localStorage.setItem('ecotrack_user', JSON.stringify(userData));
      
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Login failed. Please try again.');
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    setUser(null);
    localStorage.removeItem('ecotrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};