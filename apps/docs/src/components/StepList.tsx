import React, { type ReactNode } from 'react';

interface StepListProps {
  children: ReactNode;
}

/**
 * Container for numbered steps
 */
export function StepList({ children }: StepListProps) {
  return <ol className="step-list">{children}</ol>;
}

interface StepProps {
  title: string;
  children: ReactNode;
}

/**
 * Individual step with auto-numbering
 */
export function Step({ title, children }: StepProps) {
  return (
    <li className="step-list__item">
      <div className="step-list__content">
        <div className="step-list__title">{title}</div>
        <div className="step-list__description">{children}</div>
      </div>
    </li>
  );
}

export default StepList;
