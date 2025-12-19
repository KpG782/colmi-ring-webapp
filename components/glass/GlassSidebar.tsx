/**
 * GlassSidebar Component
 * 
 * Collapsible sidebar navigation with glassmorphic styling and smooth animations.
 * Implements requirements 1.1-1.2 for responsive sidebar behavior.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, User, Settings, Activity, Heart, TrendingUp, Zap, Target, Paintbrush, MousePointer } from 'lucide-react';
import { getSidebarClasses, combineClasses } from '../../lib/design-system';
import { GlassButton } from './GlassButton';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

export interface GlassSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  navigationItems?: NavigationItem[];
  userAvatar?: string;
  userName?: string;
  className?: string;
}

/**
 * Default navigation items for the health dashboard
 */
const defaultNavigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-5 h-5" /> },
  { id: 'health', label: 'Health Metrics', icon: <Heart className="w-5 h-5" /> },
  { id: 'activity', label: 'Activity', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'sensors', label: 'Sensors', icon: <Zap className="w-5 h-5" /> },
  { id: 'gestures', label: 'Gestures', icon: <Target className="w-5 h-5" /> },
  { id: 'drawing', label: 'Drawing', icon: <Paintbrush className="w-5 h-5" /> },
  { id: 'pointer', label: '3D Pointer', icon: <MousePointer className="w-5 h-5" /> },
  { id: 'settings', label: 'Advanced', icon: <Settings className="w-5 h-5" /> },
];

/**
 * GlassSidebar component with collapsible functionality
 * 
 * Features:
 * - Smooth expand/collapse animation (Requirement 1.1)
 * - Automatic collapse on mobile with user interaction (Requirement 1.2)
 * - Glassmorphic styling with backdrop blur
 * - Full keyboard navigation support (Requirement 6.3)
 */
export function GlassSidebar({
  isCollapsed,
  onToggle,
  navigationItems = defaultNavigationItems,
  userAvatar,
  userName = 'User',
  className,
}: GlassSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState('overview');

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      // Auto-collapse after a delay on mobile
      const timer = setTimeout(() => {
        onToggle();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isCollapsed, onToggle]);

  const handleItemClick = (item: NavigationItem) => {
    setActiveItem(item.id);
    if (item.onClick) {
      item.onClick();
    }
    // Auto-collapse on mobile after selection
    if (isMobile && !isCollapsed) {
      onToggle();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  const sidebarClasses = combineClasses(
    getSidebarClasses(isCollapsed),
    className
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={sidebarClasses}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">Health Dashboard</span>
              </div>
            )}
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={onToggle}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="lg:hidden"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </GlassButton>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2" role="list">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  className={combineClasses(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
                    'hover:bg-white/50',
                    activeItem === item.id
                      ? 'bg-white/90 text-blue-600 shadow-md shadow-blue-500/10'
                      : 'text-gray-600 hover:text-gray-900',
                    isCollapsed && 'justify-center'
                  )}
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  aria-label={item.label}
                  aria-current={activeItem === item.id ? 'page' : undefined}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className={combineClasses(
            'flex items-center gap-3 p-3 rounded-xl bg-white/50',
            isCollapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Toggle button for desktop */}
      {!isMobile && (
        <button
          className={combineClasses(
            'fixed top-4 z-50 transition-all duration-300 ease-out',
            'backdrop-blur-lg bg-white/80 border border-white/20 rounded-xl p-2',
            'shadow-lg hover:shadow-xl hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2',
            isCollapsed ? 'left-4' : 'left-72'
          )}
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </>
  );
}