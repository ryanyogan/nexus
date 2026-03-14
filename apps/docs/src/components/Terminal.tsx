import React, { useState, type ReactNode } from 'react';

interface TerminalProps {
  title?: string;
  children: ReactNode;
}

/**
 * Terminal component with Catppuccin Mocha styling
 * Linux-style terminal header
 */
export function Terminal({ title = 'Terminal', children }: TerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Extract text content from children
    const content = extractTextContent(children);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal">
      <div className="terminal__header">
        <div className="terminal__buttons">
          <span className="terminal__button terminal__button--close" />
          <span className="terminal__button terminal__button--minimize" />
          <span className="terminal__button terminal__button--maximize" />
        </div>
        <span className="terminal__title">{title}</span>
        <button 
          className="terminal__copy" 
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="terminal__content">
        <code>{children}</code>
      </pre>
    </div>
  );
}

interface LineProps {
  children?: ReactNode;
  prompt?: boolean;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta' | 'gray';
  dim?: boolean;
  bold?: boolean;
}

/**
 * Terminal line component
 */
export function Line({ 
  children, 
  prompt = false, 
  color, 
  dim = false,
  bold = false 
}: LineProps) {
  const classes = [
    'terminal__line',
    prompt && 'terminal__line--prompt',
    color && `terminal__text--${color}`,
    dim && 'terminal__text--dim',
    bold && 'terminal__text--bold',
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}{'\n'}</span>;
}

interface TextProps {
  children: ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta' | 'gray';
  dim?: boolean;
  bold?: boolean;
}

/**
 * Inline text with color
 */
export function Text({ children, color, dim, bold }: TextProps) {
  const classes = [
    color && `terminal__text--${color}`,
    dim && 'terminal__text--dim',
    bold && 'terminal__text--bold',
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}

/**
 * Check mark (green)
 */
export function Check({ children }: { children?: ReactNode }) {
  return <span className="terminal__check">✓ {children}</span>;
}

/**
 * Cross mark (red)
 */
export function Cross({ children }: { children?: ReactNode }) {
  return <span className="terminal__cross">✗ {children}</span>;
}

/**
 * Warning mark (yellow)
 */
export function Warning({ children }: { children?: ReactNode }) {
  return <span className="terminal__warning">⚠ {children}</span>;
}

/**
 * Info mark (blue)
 */
export function Info({ children }: { children?: ReactNode }) {
  return <span className="terminal__info">ℹ {children}</span>;
}

/**
 * Star mark (for welcome messages)
 */
export function Star({ children }: { children?: ReactNode }) {
  return <span className="terminal__text--cyan">★ {children}</span>;
}

// Helper to extract text content from React children
function extractTextContent(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join('');
  }
  
  if (React.isValidElement(node) && node.props.children) {
    return extractTextContent(node.props.children);
  }
  
  return '';
}

export default Terminal;
