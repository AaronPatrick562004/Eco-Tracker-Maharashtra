// src/components/TopBar.tsx
import { cn } from "@/lib/utils";
import { Bell, Globe, Search, AlertTriangle, CheckCircle, FileText, Moon, Sun, Laptop, Trash2, X, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface TopBarProps {
  lang: Language;
  onToggleLang: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  read: boolean;
  created_at: string;
}

const TopBar = ({ 
  lang, 
  onToggleLang, 
  searchQuery, 
  onSearchChange,
  onMenuClick,
  isMobile 
}: TopBarProps) => {
  const t = translations[lang];
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch real notifications from database
  useEffect(() => {
    if (!user?.id) return;
    
    fetchNotifications();
    
    // Real-time subscription for new notifications
    const subscription = supabase
      .channel('notifications-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('🔔 New notification:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.id) return;
    if (!confirm('Delete all notifications?')) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications([]);
      setShowNotifications(false);
      alert('All notifications deleted!');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      alert('Failed to delete notifications');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    setShowNotifications(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'activity':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'approval':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'alert':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600';
      case 'report':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = () => {
    if (!user?.role) return "";
    
    const roleMap: Record<string, string> = {
      'state': 'State Officer',
      'deo': 'DEO',
      'beo': 'BEO',
      'principal': 'Principal'
    };
    return roleMap[user.role] || user.role;
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left section with menu and search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick} 
            className="lg:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Search Bar - Desktop */}
        {!isMobile && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Mobile Search Button - Only show on mobile when search is closed */}
        {isMobile && !showMobileSearch && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {isMobile && showMobileSearch && (
        <div className="absolute inset-x-0 top-0 bg-card p-4 border-b border-border z-30 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowMobileSearch(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Right section with icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLang}
          className="text-xs font-semibold gap-1.5 hover:bg-muted px-2 sm:px-3"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === "en" ? "मराठी" : "English"}</span>
          <span className="sm:hidden">{lang === "en" ? "EN" : "MR"}</span>
        </Button>

        {/* Theme Toggle Button with Dropdown */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-muted transition-all duration-200"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
          >
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : theme === "light" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Laptop className="w-5 h-5" />
            )}
          </Button>

          {/* Theme Dropdown Menu */}
          {showThemeMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowThemeMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-elevated z-40 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setTheme("light");
                      setShowThemeMenu(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      theme === "light" ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    {t.light}
                  </button>
                  <button
                    onClick={() => {
                      setTheme("dark");
                      setShowThemeMenu(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      theme === "dark" ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    {t.dark}
                  </button>
                  <button
                    onClick={() => {
                      setTheme("system");
                      setShowThemeMenu(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      theme === "system" ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Laptop className="w-4 h-4" />
                    {t.system}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-muted transition-all duration-200"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
              </>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-elevated z-40 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {t.notifications}
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-medium">
                          {unreadCount} {t.new}
                        </span>
                      )}
                      {notifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={deleteAllNotifications}
                          className="h-7 w-7 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group relative",
                          !notification.read ? "bg-green-50 dark:bg-green-900/10" : ""
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            getNotificationColor(notification.type)
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm pr-16",
                              !notification.read 
                                ? "text-gray-900 dark:text-white font-medium" 
                                : "text-gray-600 dark:text-gray-300"
                            )}>
                              {notification.title || notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatTime(notification.created_at)}
                            </p>
                            {notification.link && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to view →
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute right-4 top-4 flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-full shadow-sm"
                                title="Mark as read"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-full shadow-sm"
                              title="Delete notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No notifications
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer with actions */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="flex-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Mark all as read {unreadCount > 0 ? `(${unreadCount})` : ''}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={deleteAllNotifications}
                      className="flex-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete all
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile Section */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-muted transition-all duration-200 rounded-lg"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">
                {getUserInitials()}
              </span>
            </div>
            
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getRoleDisplay()}
              </div>
            </div>
          </Button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-elevated z-40 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {user?.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors border-t border-gray-200 dark:border-gray-700 mt-2 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;