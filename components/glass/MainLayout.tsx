/**
 * MainLayout Component
 * 
 * Main layout wrapper with glassmorphic styling and responsive behavior.
 * Implements requirements 1.3-1.5 for layout constraints and responsive design.
 */

'use client';

import React, { useState } from 'react';
import { getMainContentClasses, combineClasses } from '../../lib/design-system';
import { GlassSidebar } from './GlassSidebar';

export interface MainLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  background?: 'gradient' | 'solid';
  className?: string;
  sidebarProps?: {
    navigationItems?: any[];
    userAvatar?: string;
    userName?: string;
  };
}

/**
 * MainLayout component with responsive sidebar and content area
 * 
 * Features:
 * - max-width-7xl with appropriate padding (Requirement 1.3)
 * - Responsive layout integrity across breakpoints (Requirement 1.5)
 * - Smooth sidebar transitions with 300ms ease-out
 * - Proper content spacing and visual hierarchy
 */
export function MainLayout({
  header,
  children,
  background = 'gradient',
  className,
  sidebarProps,
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const mainContentClasses = combineClasses(
    getMainContentClasses(sidebarCollapsed),
    'space-section', // Use consistent section spacing
    className
  );

  return (
    <div className="min-h-screen relative">
      {/* Sidebar */}
      <GlassSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        navigationItems={sidebarProps?.navigationItems}
        userAvatar={sidebarProps?.userAvatar}
        userName={sidebarProps?.userName}
      />

      {/* Main Content Area */}
      <main className={mainContentClasses}>
        {/* Header */}
        <header className="mb-8">
          {header}
        </header>

        {/* Content */}
        <div className="space-component">
          {children}
        </div>
      </main>
    </div>
  );
}