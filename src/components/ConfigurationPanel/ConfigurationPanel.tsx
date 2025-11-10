import * as React from 'react';
import { IconButton, Stack } from '@fluentui/react';
import { COLORS, SPACING, ICONS } from '../../utils/constants';
import styles from './ConfigurationPanel.module.scss';

/**
 * Props for ConfigurationPanel component
 */
export interface IConfigurationPanelProps {
  /** Title displayed in panel header */
  title?: string;
  /** Whether the panel is open/expanded */
  isOpen: boolean;
  /** Callback when panel is toggled */
  onToggle: () => void;
  /** Panel content (configuration controls) */
  children: React.ReactNode;
  /** Panel variant/color theme */
  variant?: 'default' | 'primary' | 'info' | 'success' | 'warning';
  /** Whether to show the toggle button */
  showToggle?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Collapsible configuration panel component
 * Provides consistent UI for demo configuration across all showcases
 *
 * Features:
 * - Collapsible/expandable
 * - Multiple color variants
 * - Consistent spacing and styling
 * - Smooth animations
 * - Accessible (keyboard navigation, ARIA labels)
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <ConfigurationPanel
 *   title="Demo Configuration"
 *   isOpen={isOpen}
 *   onToggle={() => setIsOpen(!isOpen)}
 *   variant="primary"
 * >
 *   <Toggle label="Show Title" checked={showTitle} onChange={handleChange} />
 *   <Dropdown label="Size" options={sizeOptions} selectedKey={selectedSize} />
 * </ConfigurationPanel>
 * ```
 */
export const ConfigurationPanel: React.FC<IConfigurationPanelProps> = ({
  title = 'Configuration',
  isOpen,
  onToggle,
  children,
  variant = 'default',
  showToggle = true,
  className = '',
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  /**
   * Get variant colors
   */
  const getVariantColors = React.useMemo(() => {
    switch (variant) {
      case 'primary':
        return {
          background: COLORS.primary,
          text: COLORS.white,
        };
      case 'info':
        return {
          background: COLORS.info,
          text: COLORS.white,
        };
      case 'success':
        return {
          background: COLORS.success,
          text: COLORS.white,
        };
      case 'warning':
        return {
          background: COLORS.warning,
          text: COLORS.white,
        };
      default:
        return {
          background: COLORS.gray20,
          text: COLORS.gray110,
        };
    }
  }, [variant]);

  /**
   * Keyboard accessibility - toggle on Enter/Space
   */
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  }, [onToggle]);

  return (
    <div
      ref={panelRef}
      className={`${styles.configPanel} ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div
        className={styles.header}
        style={{
          background: getVariantColors.background,
          color: getVariantColors.text,
        }}
        onClick={showToggle ? onToggle : undefined}
        onKeyDown={showToggle ? handleKeyDown : undefined}
        tabIndex={showToggle ? 0 : undefined}
        role={showToggle ? 'button' : undefined}
        aria-expanded={showToggle ? isOpen : undefined}
        aria-controls={showToggle ? 'config-content' : undefined}
      >
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: SPACING.sm }}>
            <IconButton
              iconProps={{ iconName: ICONS.settings }}
              styles={{
                root: { color: getVariantColors.text },
                icon: { fontSize: 16 },
              }}
              disabled
              ariaLabel="Configuration icon"
            />
            <span className={styles.title}>{title}</span>
          </Stack>

          {showToggle && (
            <IconButton
              iconProps={{ iconName: isOpen ? ICONS.collapse : ICONS.expand }}
              title={isOpen ? 'Collapse' : 'Expand'}
              ariaLabel={isOpen ? 'Collapse configuration panel' : 'Expand configuration panel'}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              styles={{
                root: { color: getVariantColors.text },
                icon: { fontSize: 14 },
                rootHovered: { background: 'rgba(255, 255, 255, 0.1)' },
                rootPressed: { background: 'rgba(255, 255, 255, 0.2)' },
              }}
            />
          )}
        </Stack>
      </div>

      {/* Content */}
      {isOpen && (
        <div
          id="config-content"
          className={styles.content}
          role="group"
          aria-label={`${title} options`}
        >
          <Stack tokens={{ childrenGap: SPACING.lg }}>
            {children}
          </Stack>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;
