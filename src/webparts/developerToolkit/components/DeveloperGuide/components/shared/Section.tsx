import { Icon, IconButton } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';

export interface ISectionProps {
  title: string;
  icon?: string;
  description?: string;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible section component for organizing content
 */
export const Section: React.FC<ISectionProps> = ({
  title,
  icon,
  description,
  defaultExpanded = true,
  collapsible = true,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = (): void => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      style={{
        marginBottom: '16px',
        border: '1px solid #edebe9',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: isExpanded ? '#faf9f8' : '#ffffff',
          cursor: collapsible ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
          borderBottom: isExpanded ? '1px solid #edebe9' : 'none',
        }}
        onClick={toggleExpanded}
        onMouseEnter={(e) => {
          if (collapsible) {
            e.currentTarget.style.backgroundColor = '#f3f2f1';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isExpanded ? '#faf9f8' : '#ffffff';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {/* Icon */}
          {icon && (
            <Icon
              iconName={icon}
              styles={{
                root: {
                  fontSize: '20px',
                  marginRight: '12px',
                  color: '#0078d4',
                },
              }}
            />
          )}

          {/* Title and description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#323130',
              }}
            >
              {title}
            </h3>
            {description && (
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: '#605e5c',
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Expand/collapse button */}
        {collapsible && (
          <IconButton
            iconProps={{
              iconName: isExpanded ? 'ChevronUp' : 'ChevronDown',
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
            styles={{
              root: {
                color: '#605e5c',
              },
              rootHovered: {
                backgroundColor: '#edebe9',
              },
            }}
          />
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          style={{
            padding: '20px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
