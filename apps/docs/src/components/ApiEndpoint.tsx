import React from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiEndpointProps {
  method: HttpMethod;
  path: string;
}

/**
 * API endpoint display with method badge
 */
export function ApiEndpoint({ method, path }: ApiEndpointProps) {
  const methodLower = method.toLowerCase();
  
  return (
    <div className="api-method">
      <span className={`api-method__badge api-method__badge--${methodLower}`}>
        {method}
      </span>
      <code className="api-method__path">{path}</code>
    </div>
  );
}

interface ApiParamProps {
  name: string;
  type: string;
  required?: boolean;
  children: React.ReactNode;
}

/**
 * API parameter documentation
 */
export function ApiParam({ name, type, required = false, children }: ApiParamProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <code style={{ fontWeight: 600 }}>{name}</code>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ifm-font-color-secondary)' }}>
          {type}
        </span>
        {required && (
          <span style={{ 
            fontSize: '0.6875rem', 
            padding: '0.125rem 0.375rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderRadius: '0.25rem',
            fontWeight: 500,
            textTransform: 'uppercase'
          }}>
            required
          </span>
        )}
      </div>
      <div style={{ color: 'var(--ifm-font-color-secondary)', fontSize: '0.9375rem' }}>
        {children}
      </div>
    </div>
  );
}

interface ApiResponseProps {
  status: number;
  description?: string;
  children?: React.ReactNode;
}

/**
 * API response documentation
 */
export function ApiResponse({ status, description, children }: ApiResponseProps) {
  const isSuccess = status >= 200 && status < 300;
  const isError = status >= 400;
  
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ 
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          fontFamily: 'var(--ifm-font-family-monospace)',
          background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          color: isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6'
        }}>
          {status}
        </span>
        {description && (
          <span style={{ color: 'var(--ifm-font-color-secondary)', fontSize: '0.9375rem' }}>
            {description}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default ApiEndpoint;
