import * as React from 'react';
import { Stack } from '@fluentui/react';
import { SPACING } from '../../utils/constants';
import styles from './DemoSection.module.scss';

/**
 * Props for DemoSection component
 */
export interface IDemoSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Background color/variant */
  variant?: 'default' | 'subtle' | 'elevated' | 'bordered';
  /** Padding size */
  padding?: 'none' | 'compact' | 'comfortable' | 'spacious';
  /** Whether to show section title */
  showTitle?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Section ID for accessibility */
  id?: string;
}

/**
 * Standard demo section wrapper component
 * Provides consistent layout and spacing for all demo sections
 *
 * Features:
 * - Consistent padding and spacing
 * - Multiple visual variants
 * - Optional title and description
 * - Accessible structure
 * - Responsive design
 *
 * @example
 * ```tsx
 * <DemoSection
 *   title="Live Demo"
 *   description="Try out the component with different configurations"
 *   variant="elevated"
 *   padding="comfortable"
 * >
 *   <YourDemoComponent />
 * </DemoSection>
 * ```
 */
export const DemoSection: React.FC<IDemoSectionProps> = ({
  title,
  description,
  children,
  variant = 'default',
  padding = 'comfortable',
  showTitle = true,
  className = '',
  id,
}) => {
  /**
   * Get padding based on size
   */
  const getPadding = React.useMemo(() => {
    switch (padding) {
      case 'none':
        return 0;
      case 'compact':
        return SPACING.md;
      case 'comfortable':
        return SPACING.xl;
      case 'spacious':
        return SPACING.xxxl;
      default:
        return SPACING.xl;
    }
  }, [padding]);

  /**
   * Get variant styles
   */
  const getVariantClass = React.useMemo(() => {
    switch (variant) {
      case 'subtle':
        return styles.subtle;
      case 'elevated':
        return styles.elevated;
      case 'bordered':
        return styles.bordered;
      default:
        return styles.default;
    }
  }, [variant]);

  return (
    <section
      id={id}
      className={`${styles.demoSection} ${getVariantClass} ${className}`}
      aria-labelledby={title && showTitle ? `${id}-title` : undefined}
      style={{ padding: `${getPadding}px` }}
    >
      {/* Title and Description */}
      {showTitle && (title || description) && (
        <div className={styles.header}>
          {title && (
            <h3 id={`${id}-title`} className={styles.title}>
              {title}
            </h3>
          )}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </section>
  );
};

/**
 * DemoSection.Row - Horizontal layout helper
 */
export const DemoSectionRow: React.FC<{
  children: React.ReactNode;
  gap?: number;
  wrap?: boolean;
  verticalAlign?: 'start' | 'center' | 'end' | 'stretch';
  horizontalAlign?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}> = ({ children, gap = SPACING.lg, wrap = false, verticalAlign = 'start', horizontalAlign = 'start' }) => {
  return (
    <Stack
      horizontal
      wrap={wrap}
      verticalAlign={verticalAlign}
      horizontalAlign={horizontalAlign}
      tokens={{ childrenGap: gap }}
    >
      {children}
    </Stack>
  );
};

/**
 * DemoSection.Column - Vertical layout helper
 */
export const DemoSectionColumn: React.FC<{
  children: React.ReactNode;
  gap?: number;
  verticalAlign?: 'start' | 'center' | 'end' | 'stretch';
  horizontalAlign?: 'start' | 'center' | 'end' | 'stretch';
}> = ({ children, gap = SPACING.lg, verticalAlign = 'start', horizontalAlign = 'stretch' }) => {
  return (
    <Stack
      verticalAlign={verticalAlign}
      horizontalAlign={horizontalAlign}
      tokens={{ childrenGap: gap }}
    >
      {children}
    </Stack>
  );
};

/**
 * DemoSection.Grid - Grid layout helper
 */
export const DemoSectionGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  minColumnWidth?: number;
  className?: string;
}> = ({ children, columns = 2, gap = SPACING.lg, minColumnWidth = 300, className = '' }) => {
  return (
    <div
      className={`${styles.grid} ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: columns
          ? `repeat(${columns}, 1fr)`
          : `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

// Attach sub-components
(DemoSection as any).Row = DemoSectionRow;
(DemoSection as any).Column = DemoSectionColumn;
(DemoSection as any).Grid = DemoSectionGrid;

export default DemoSection;
