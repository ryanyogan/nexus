import React, { type ReactNode } from 'react';

interface QuickStartProps {
  title?: string;
  children: ReactNode;
}

/**
 * Gradient hero card for quick start sections
 */
export function QuickStart({ title = 'Quick Start', children }: QuickStartProps) {
  return (
    <div className="quickstart-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

interface StatsGridProps {
  children: ReactNode;
}

/**
 * Grid for displaying stats
 */
export function StatsGrid({ children }: StatsGridProps) {
  return <div className="stats-grid">{children}</div>;
}

interface StatItemProps {
  value: string;
  label: string;
}

/**
 * Individual stat item
 */
export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="stat-item">
      <div className="stat-item__value">{value}</div>
      <div className="stat-item__label">{label}</div>
    </div>
  );
}

interface HeroSectionProps {
  title: string;
  tagline: string;
}

/**
 * Hero section with logo and tagline
 */
export function HeroSection({ title, tagline }: HeroSectionProps) {
  return (
    <div className="hero-section">
      <div className="hero-section__logo">
        <div className="hero-section__icon">N</div>
      </div>
      <h1 className="hero-section__title">{title}</h1>
      <p className="hero-section__tagline">{tagline}</p>
    </div>
  );
}

interface ButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

/**
 * Button component
 */
export function Button({ href, variant = 'primary', children }: ButtonProps) {
  return (
    <a href={href} className={`btn btn--${variant}`}>
      {children}
    </a>
  );
}

interface ButtonGroupProps {
  children: ReactNode;
}

/**
 * Group buttons together
 */
export function ButtonGroup({ children }: ButtonGroupProps) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

export default QuickStart;
