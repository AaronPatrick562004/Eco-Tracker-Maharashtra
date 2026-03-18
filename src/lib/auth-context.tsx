import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user roles
export type UserRole = 'state' | 'deo' | 'beo' | 'principal' | null;

// Define user interface with role
export interface User {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
  district?: string;
  block?: string;
  school?: string;
  schoolCode?: string;
  createdAt?: string; // Added createdAt as optional property
}

// Demo accounts with different roles
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'State Officer',
    email: 'state.officer@maharashtra.gov.in',
    role: 'state',
    district: 'All Districts',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'District Education Officer (Pune)',
    email: 'deo.pune@maharashtra.gov.in',
    role: 'deo',
    district: 'Pune',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Block Education Officer (Shirur)',
    email: 'beo.shirur@maharashtra.gov.in',
    role: 'beo',
    district: 'Pune',
    block: 'Shirur',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Principal - ZPPS Shirur',
    email: 'principal.zpps@maharashtra.gov.in',
    role: 'principal',
    district: 'Pune',
    block: 'Shirur',
    school: 'ZPPS Shirur',
    schoolCode: '27120100101',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

interface AuthContextType {
  user: User | null;
  users: User[];
  demoAccounts: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('eco-track-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load registered users from localStorage
    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with demo users for demo mode
      localStorage.setItem('registeredUsers', JSON.stringify(DEMO_USERS));
      setUsers(DEMO_USERS);
      setIsDemoMode(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check demo accounts first (password is ignored for demo)
    const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (demoUser) {
      setUser(demoUser);
      localStorage.setItem('eco-track-user', JSON.stringify(demoUser));
      setIsLoading(false);
      setIsDemoMode(true);
      return { success: true };
    }
    
    // Check registered users (for backward compatibility)
    const savedUsers = localStorage.getItem('registeredUsers');
    const registeredUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Find user with matching email (password check removed for demo)
    const registeredUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (registeredUser) {
      setUser(registeredUser);
      localStorage.setItem('eco-track-user', JSON.stringify(registeredUser));
      setIsLoading(false);
      return { success: true };
    }
    
    setIsLoading(false);
    return { 
      success: false, 
      error: 'Invalid email. Use any demo account: state.officer@maharashtra.gov.in, deo.pune@maharashtra.gov.in, beo.shirur@maharashtra.gov.in, or principal.zpps@maharashtra.gov.in' 
    };
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole = 'principal'
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing users
    const savedUsers = localStorage.getItem('registeredUsers');
    const registeredUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Check if user already exists (including demo accounts)
    if (registeredUsers.some(u => u.email === email) || DEMO_USERS.some(u => u.email === email)) {
      setIsLoading(false);
      return { 
        success: false, 
        message: "User with this email already exists" 
      };
    }
    
    // Validate password strength
    if (password.length < 6) {
      setIsLoading(false);
      return { 
        success: false, 
        message: "Password must be at least 6 characters long" 
      };
    }
    
    // Create new user with role
    const newUser: User = { 
      id: Date.now().toString(),
      name, 
      email, 
      role: role || 'principal',
      district: 'Not Assigned',
      createdAt: new Date().toISOString() 
    };
    
    // Save to "database"
    const updatedUsers = [...registeredUsers, newUser];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    setIsLoading(false);
    return { 
      success: true, 
      message: "Account created successfully! Please login." 
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eco-track-user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      demoAccounts: DEMO_USERS,
      login, 
      signup, 
      logout, 
      isLoading,
      isDemoMode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};