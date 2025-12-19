/**
 * FloatingTabNavigation Component
 * 
 * Floating tab navigation with glass effects and smooth animations.
 * Implements requirements 5.1-5.5 for floating navigation with glass styling.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getFloatingNavClasses, getNavTabClasses, combineClasses } from '../../lib/design-system';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface FloatingTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'desktop' | 'mobile';
  className?: string;
}

/**
 * FloatingTabNavigation component with glass effects and slide indicator
 * 
 * Features:
 * - Glass effect styling with backdrop blur (Requirement 5.1)
 * - Active tab with bg-white/90 and shadow (Requirement 5.2)
 * - Icons + text on desktop, icons only on mobile (Requirements 5.3, 5.4)
 * - Smooth slide indicator animation (Requirement 5.5)
 */
export function FloatingTabNavigation({
  tabs,
  activeTab,
  onChange,
  variant = 'desktop',
  className,
}: FloatingTabNavigationProps) {
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Update slide indicator position
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const containerElement = containerRef.current;

    if (activeTabElement && containerElement) {
      const containerRect = containerElement.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;

      setIndicatorStyle({
        transform: `translateX(${left}px)`,
        width: `${width}px`,
      });
    }
  }, [activeTab, tabs]);

  const handleTabClick = (tabId: string) => {
    onChange(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(tabId);
    }
    
    // Arrow key navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      let nextIndex;
      
      if (e.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }
      
      const nextTab = tabs[nextIndex];
      if (nextTab) {
        onChange(nextTab.id);
        tabRefs.current[nextTab.id]?.focus();
      }
    }
  };

  const isMobile = variant === 'mobile';

  return (
    <div className={combineClasses('relative mb-8', className)}>
      <nav 
        ref={containerRef}
        className={combineClasses(
          getFloatingNavClasses(),
          'relative overflow-x-auto scrollbar-hide',
          'mx-auto max-w-fit' // Center the navigation
        )}
        role="tablist"
        aria-label="Dashboard navigation"
      >
        {/* Slide Indicator */}
        <div
          className="absolute bottom-2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 ease-out"
          style={indicatorStyle}
          aria-hidden="true"
        />

        {/* Tab Buttons */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                className={getNavTabClasses(isActive)}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                aria-label={`${tab.label}${tab.badge ? ` (${tab.badge} items)` : ''}`}
              >
                {/* Icon */}
                {tab.icon && (
                  <span className="flex-shrink-0" aria-hidden="true">
                    {tab.icon}
                  </span>
                )}
                
                {/* Label - show on desktop, hide on mobile */}
                {!isMobile && (
                  <span className="font-medium whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
                
                {/* Badge */}
                {tab.badge && (
                  <span 
                    className={combineClasses(
                      'text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center',
                      isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    )}
                    aria-label={`${tab.badge} items`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile label display */}
      {isMobile && (
        <div className="text-center mt-3 px-2">
          <span className="text-sm font-medium text-gray-600 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </span>
        </div>
      )}
    </div>
  );
}