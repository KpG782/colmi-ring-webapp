/**
 * MetricDisplay Component
 * 
 * Displays health metrics with proper typography hierarchy and status indicators.
 * Implements requirements 7.1-7.3 for metric display styling.
 */

'use client';

import React from 'react';
import { getMetricValueClasses, getMetricLabelClasses, getStatusIndicatorClasses, combineClasses } from '../../lib/design-system';
import { MiniChart } from './MiniChart';

export interface MetricDisplayProps {
  value: number | string | null;
  unit: string;
  label: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  miniChart?: boolean;
  chartData?: number[];
  chartColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  className?: string;
  'aria-label'?: string;
}

/**
 * MetricDisplay component with glassmorphic styling
 * 
 * Features:
 * - text-5xl font-bold for primary values (Requirement 7.1)
 * - text-sm uppercase tracking-wide for labels (Requirement 7.2)
 * - w-3 h-3 rounded-full status indicators with pulse (Requirement 7.3)
 * - Subtle gradient backgrounds behind metrics (Requirement 7.4)
 */
export function MetricDisplay({
  value,
  unit,
  label,
  status = 'neutral',
  trend,
  miniChart = false,
  chartData,
  chartColor,
  className,
  'aria-label': ariaLabel,
}: MetricDisplayProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatValue = (val: number | string | null): string => {
    if (val === null || val === undefined) return '--';
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val.toString();
  };

  const getChartColor = (): 'blue' | 'purple' | 'emerald' | 'amber' | 'red' => {
    if (chartColor) return chartColor;
    
    switch (status) {
      case 'success':
        return 'emerald';
      case 'warning':
        return 'amber';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div 
      className={combineClasses('relative', className)}
      aria-label={ariaLabel || `${label}: ${formatValue(value)} ${unit}`}
    >
      {/* Mini chart background (subtle gradient) */}
      {miniChart && (
        <MiniChart
          data={chartData}
          type={chartData && chartData.length > 0 ? 'area' : 'gradient'}
          color={getChartColor()}
          animated={value !== null}
        />
      )}
      
      {/* Header with label and status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={combineClasses(getMetricLabelClasses(), 'text-gray-600')}>
          {label}
        </h3>
        <div className="flex items-center gap-2">
          {trend && getTrendIcon()}
          <div 
            className={getStatusIndicatorClasses(status)}
            aria-label={`Status: ${status}`}
          />
        </div>
      </div>

      {/* Main metric value */}
      <div className="text-center mb-2">
        <div className={combineClasses(getMetricValueClasses(), 'mb-1')}>
          {formatValue(value)}
        </div>
        <div className={combineClasses(getMetricLabelClasses(), 'text-gray-500')}>
          {unit}
        </div>
      </div>

      {/* Additional status text */}
      {value !== null && status !== 'neutral' && (
        <div className="text-center">
          <span className={combineClasses(
            'text-xs font-medium px-2 py-1 rounded-full',
            status === 'success' && 'bg-emerald-100 text-emerald-700',
            status === 'warning' && 'bg-amber-100 text-amber-700',
            status === 'error' && 'bg-red-100 text-red-700'
          )}>
            {status === 'success' && 'Normal'}
            {status === 'warning' && 'Elevated'}
            {status === 'error' && 'High'}
          </span>
        </div>
      )}
    </div>
  );
}