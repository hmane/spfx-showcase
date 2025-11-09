import { Checkbox, ProgressIndicator } from '@fluentui/react';
import * as React from 'react';
import { IChecklistProps } from '../../types/DeveloperGuideTypes';

/**
 * Checklist component with progress tracking
 */
export const Checklist: React.FC<IChecklistProps> = ({
  items,
  onItemToggle,
  showProgress = true,
}) => {
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? completedCount / totalCount : 0;

  const handleToggle = (itemId: string, checked: boolean): void => {
    if (onItemToggle) {
      onItemToggle(itemId, checked);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #edebe9',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header with progress */}
      {showProgress && (
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #edebe9',
            backgroundColor: '#faf9f8',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Setup Checklist
            </h3>
            <span
              style={{
                fontSize: '14px',
                color: '#605e5c',
                fontWeight: 500,
              }}
            >
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <ProgressIndicator
            percentComplete={progressPercent}
            barHeight={4}
            styles={{
              root: { marginTop: '8px' },
              progressBar: {
                backgroundColor: progressPercent === 1 ? '#107c10' : '#0078d4',
              },
            }}
          />
        </div>
      )}

      {/* Checklist items */}
      <div style={{ padding: '8px 0' }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '12px 16px',
              borderBottom: index < items.length - 1 ? '1px solid #edebe9' : 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f2f1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Checkbox
              checked={item.completed || false}
              onChange={(_, checked) => handleToggle(item.id, checked || false)}
              styles={{
                root: { marginRight: '12px' },
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  color: item.completed ? '#605e5c' : '#323130',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  fontWeight: item.completed ? 400 : 500,
                }}
              >
                {item.label}
              </div>
              {item.timeEstimate && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#8a8886',
                    marginTop: '4px',
                  }}
                >
                  Estimated time: {item.timeEstimate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion message */}
      {progressPercent === 1 && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#dff6dd',
            borderTop: '1px solid #edebe9',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: '#107c10',
              fontWeight: 600,
            }}
          >
            ✓ All tasks completed! Great job!
          </span>
        </div>
      )}
    </div>
  );
};
