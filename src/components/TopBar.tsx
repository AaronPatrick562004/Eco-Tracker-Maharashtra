import { cn } from "@/lib/utils";
import { Bell, Globe, Search, AlertTriangle, CheckCircle, FileText, Moon, Sun, Laptop, Trash2, X, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { translations, Language } from "@/lib/translations";
import { useTheme } from "@/lib/theme-provider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface TopBarProps {
  lang: Language;
  onToggleLang: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
  link?: string;
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
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      message: "New activity logged by ZP School, Shirdi", 
      time: "5 min ago", 
      read: false,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      link: "/activity-logger"
    },
    { 
      id: 2, 
      message: "Compliance report ready for Pune district", 
      time: "1 hour ago", 
      read: false,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      link: "/monitor"
    },
    { 
      id: 3, 
      message: "3 schools at risk in Washim", 
      time: "3 hours ago", 
      read: true,
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      link: "/analytics"
    },
    { 
      id: 4, 
      message: "Monthly summary available", 
      time: "1 day ago", 
      read: true,
      icon: FileText,
      color: "text-gray-500 dark:text-gray-400",
      link: "/analytics"
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all notifications?")) {
      setNotifications([]);
      setShowNotifications(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }
    
    // Navigate to the link if exists
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Close the notifications dropdown
    setShowNotifications(false);
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    setNotifications(prevNotifications =>
      prevNotifications.filter(n => n.id !== notificationId)
    );
  };

  const handleClearAll = () => {
    if (notifications.length > 0) {
      if (window.confirm("Delete all notifications?")) {
        setNotifications([]);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    
    const roleMap = {
      'state': 'State Officer',
      'deo': 'DEO',
      'beo': 'BEO',
      'principal': 'Principal'
    };
    return roleMap[user.role];
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
                          onClick={handleClearAll}
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
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
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
                              !notification.read 
                                ? "bg-green-100 dark:bg-green-900/30" 
                                : "bg-gray-100 dark:bg-gray-700"
                            )}>
                              <Icon className={cn(
                                "w-4 h-4",
                                notification.color
                              )} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm pr-16",
                                !notification.read 
                                  ? "text-gray-900 dark:text-white font-medium" 
                                  : "text-gray-600 dark:text-gray-300"
                              )}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notification.time}
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
                                  onClick={(e) => handleMarkAsRead(e, notification.id)}
                                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-full shadow-sm"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotification(e, notification.id)}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-full shadow-sm"
                                title="Delete notification"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
                      onClick={handleMarkAllAsRead}
                      className="flex-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Mark all as read {unreadCount > 0 ? `(${unreadCount})` : ''}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleDeleteAll}
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
            {/* User Avatar with Initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">
                {getUserInitials()}
              </span>
            </div>
            
            {/* User Info - Hide on very small screens */}
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
                {/* User Info Header */}
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

                {/* Menu Items */}
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