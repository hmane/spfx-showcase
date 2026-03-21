// src/components/DeveloperUtilities/utilities/ColorConverterUtility.tsx

import {
  DefaultButton,
  IconButton,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Slider,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

interface ColorFormats {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export const ColorConverterUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'Color Converter',
  shortcut = 'Ctrl+K',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputColor, setInputColor] = useState<string>('#3b82f6');
  const [rgbColor, setRgbColor] = useState<RGBColor>({ r: 59, g: 130, b: 246, a: 1 });
  const [isValidColor, setIsValidColor] = useState<boolean>(true);

  // Convert RGB to HEX
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    const toHex = (n: number): string => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Convert RGB to HSL
  const rgbToHsl = useCallback((r: number, g: number, b: number): HSLColor => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      a: 1,
    };
  }, []);

  // Convert RGB to HSV
  const rgbToHsv = useCallback((r: number, g: number, b: number): HSVColor => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }, []);

  // Convert HEX to RGB
  const hexToRgb = useCallback((hex: string): RGBColor | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : null;
  }, []);

  // Parse various color formats
  const parseColor = useCallback(
    (color: string): RGBColor | null => {
      const trimmed = color.trim();

      // HEX
      if (/^#?[0-9A-Fa-f]{6}$/.test(trimmed)) {
        return hexToRgb(trimmed);
      }

      // RGB/RGBA
      const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1], 10),
          g: parseInt(rgbMatch[2], 10),
          b: parseInt(rgbMatch[3], 10),
          a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
        };
      }

      // HSL (convert to RGB)
      const hslMatch = trimmed.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
      if (hslMatch) {
        const h = parseInt(hslMatch[1], 10) / 360;
        const s = parseInt(hslMatch[2], 10) / 100;
        const l = parseInt(hslMatch[3], 10) / 100;
        const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;

        const hue2rgb = (p: number, q: number, t: number): number => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        return {
          r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
          g: Math.round(hue2rgb(p, q, h) * 255),
          b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
          a,
        };
      }

      return null;
    },
    [hexToRgb]
  );

  // Generate all color formats
  const colorFormats = useMemo((): ColorFormats => {
    const hex = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
    const hsl = rgbToHsl(rgbColor.r, rgbColor.g, rgbColor.b);
    const hsv = rgbToHsv(rgbColor.r, rgbColor.g, rgbColor.b);

    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`,
      rgba: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${rgbColor.a})`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    };
  }, [rgbColor, rgbToHex, rgbToHsl, rgbToHsv]);

  // Process color input
  const processColor = useCallback(
    (color: string): void => {
      const parsed = parseColor(color);
      if (parsed) {
        setRgbColor(parsed);
        setIsValidColor(true);
      } else {
        setIsValidColor(false);
      }
    },
    [parseColor]
  );

  // Debounced input processing
  const debouncedProcess = useDebounce((color: string) => {
    processColor(color);
  }, 200);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputColor(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Handle slider changes
  const handleRedChange = useCallback((value: number): void => {
    setRgbColor(prev => ({ ...prev, r: value }));
  }, []);

  const handleGreenChange = useCallback((value: number): void => {
    setRgbColor(prev => ({ ...prev, g: value }));
  }, []);

  const handleBlueChange = useCallback((value: number): void => {
    setRgbColor(prev => ({ ...prev, b: value }));
  }, []);

  const handleAlphaChange = useCallback((value: number): void => {
    setRgbColor(prev => ({ ...prev, a: value }));
  }, []);

  // Copy format to clipboard
  const copyFormat = useCallback(
    async (format: string, label: string): Promise<void> => {
      await copyToClipboard(format, `${label} copied!`);
    },
    [copyToClipboard]
  );

  // Clear all
  const clearAll = useCallback((): void => {
    setInputColor('');
    setRgbColor({ r: 0, g: 0, b: 0, a: 1 });
    setIsValidColor(true);
  }, []);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+k', () => {
      const textField = document.querySelector(`#${id} input`) as HTMLInputElement;
      if (textField) {
        textField.focus();
      }
    });

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [id, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'copy-hex',
        label: 'Copy HEX',
        icon: 'Copy',
        onClick: () => copyFormat(colorFormats.hex, 'HEX'),
        variant: 'primary',
        tooltip: 'Copy HEX color',
      },
    ],
    [colorFormats.hex, copyFormat]
  );

  // Calculate contrast ratio for accessibility
  const getContrastRatio = useCallback((rgb: RGBColor): { white: number; black: number } => {
    const getLuminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(rgb.r, rgb.g, rgb.b);
    const whiteContrast = (1 + 0.05) / (l1 + 0.05);
    const blackContrast = (l1 + 0.05) / (0 + 0.05);

    return {
      white: Math.round(whiteContrast * 100) / 100,
      black: Math.round(blackContrast * 100) / 100,
    };
  }, []);

  const contrastRatio = useMemo(() => getContrastRatio(rgbColor), [rgbColor, getContrastRatio]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Input */}
          <div>
            <Label required>Color Input</Label>
            <TextField
              placeholder='Enter color (HEX, RGB, HSL)...'
              value={inputColor}
              onChange={handleInputChange}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '13px',
                },
                fieldGroup: {
                  borderColor: !isValidColor ? '#d13438' : undefined,
                },
              }}
              ariaLabel='Color input'
            />
            {!isValidColor && inputColor && (
              <div style={{ color: '#d13438', fontSize: '11px', marginTop: '4px' }}>
                Invalid color format
              </div>
            )}
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Direct Input</h4>
            <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
              <TextField
                label='HEX'
                placeholder='#3b82f6'
                value={colorFormats.hex}
                onChange={(ev, value) => {
                  if (value) {
                    setInputColor(value);
                    processColor(value);
                  }
                }}
                styles={{
                  root: { width: '120px' },
                  field: { fontFamily: 'Consolas, Monaco, monospace', fontSize: '12px' },
                }}
                prefix='#'
              />
              <Stack.Item grow>
                <Label>RGB Values</Label>
                <Stack horizontal tokens={{ childrenGap: 4 }}>
                  <TextField
                    placeholder='R'
                    value={rgbColor.r.toString()}
                    onChange={(ev, value) => {
                      const num = parseInt(value || '0', 10);
                      if (!isNaN(num) && num >= 0 && num <= 255) {
                        handleRedChange(num);
                      }
                    }}
                    styles={{
                      root: { width: '55px' },
                      field: {
                        textAlign: 'center',
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '11px',
                      },
                    }}
                    ariaLabel='Red'
                  />
                  <TextField
                    placeholder='G'
                    value={rgbColor.g.toString()}
                    onChange={(ev, value) => {
                      const num = parseInt(value || '0', 10);
                      if (!isNaN(num) && num >= 0 && num <= 255) {
                        handleGreenChange(num);
                      }
                    }}
                    styles={{
                      root: { width: '55px' },
                      field: {
                        textAlign: 'center',
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '11px',
                      },
                    }}
                    ariaLabel='Green'
                  />
                  <TextField
                    placeholder='B'
                    value={rgbColor.b.toString()}
                    onChange={(ev, value) => {
                      const num = parseInt(value || '0', 10);
                      if (!isNaN(num) && num >= 0 && num <= 255) {
                        handleBlueChange(num);
                      }
                    }}
                    styles={{
                      root: { width: '55px' },
                      field: {
                        textAlign: 'center',
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '11px',
                      },
                    }}
                    ariaLabel='Blue'
                  />
                </Stack>
              </Stack.Item>
            </Stack>
          </div>
          
          {/* Color Preview */}
          <div>
            <Label>Color Preview</Label>
            <div
              style={{
                width: '100%',
                height: '100px',
                backgroundColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a})`,
                border: '1px solid #e1e5e9',
                borderRadius: '4px',
                position: 'relative',
                backgroundImage:
                  'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${rgbColor.a})`,
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
          {/* RGB Sliders */}
          <Stack tokens={{ childrenGap: 8 }}>
            <div>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <Stack.Item grow>
                  <Label>Red: {rgbColor.r}</Label>
                  <Slider
                    min={0}
                    max={255}
                    value={rgbColor.r}
                    onChange={handleRedChange}
                    showValue={false}
                    styles={{
                      slideBox: {
                        background: `linear-gradient(to right, rgb(0, ${rgbColor.g}, ${rgbColor.b}), rgb(255, ${rgbColor.g}, ${rgbColor.b}))`,
                      },
                    }}
                  />
                </Stack.Item>
                <TextField
                  value={rgbColor.r.toString()}
                  onChange={(ev, value) => {
                    const num = parseInt(value || '0', 10);
                    if (!isNaN(num) && num >= 0 && num <= 255) {
                      handleRedChange(num);
                    }
                  }}
                  styles={{
                    root: { width: '60px' },
                    field: { textAlign: 'center', fontFamily: 'Consolas, Monaco, monospace' },
                  }}
                  ariaLabel='Red value'
                />
              </Stack>
            </div>
            <div>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <Stack.Item grow>
                  <Label>Green: {rgbColor.g}</Label>
                  <Slider
                    min={0}
                    max={255}
                    value={rgbColor.g}
                    onChange={handleGreenChange}
                    showValue={false}
                    styles={{
                      slideBox: {
                        background: `linear-gradient(to right, rgb(${rgbColor.r}, 0, ${rgbColor.b}), rgb(${rgbColor.r}, 255, ${rgbColor.b}))`,
                      },
                    }}
                  />
                </Stack.Item>
                <TextField
                  value={rgbColor.g.toString()}
                  onChange={(ev, value) => {
                    const num = parseInt(value || '0', 10);
                    if (!isNaN(num) && num >= 0 && num <= 255) {
                      handleGreenChange(num);
                    }
                  }}
                  styles={{
                    root: { width: '60px' },
                    field: { textAlign: 'center', fontFamily: 'Consolas, Monaco, monospace' },
                  }}
                  ariaLabel='Green value'
                />
              </Stack>
            </div>
            <div>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <Stack.Item grow>
                  <Label>Blue: {rgbColor.b}</Label>
                  <Slider
                    min={0}
                    max={255}
                    value={rgbColor.b}
                    onChange={handleBlueChange}
                    showValue={false}
                    styles={{
                      slideBox: {
                        background: `linear-gradient(to right, rgb(${rgbColor.r}, ${rgbColor.g}, 0), rgb(${rgbColor.r}, ${rgbColor.g}, 255))`,
                      },
                    }}
                  />
                </Stack.Item>
                <TextField
                  value={rgbColor.b.toString()}
                  onChange={(ev, value) => {
                    const num = parseInt(value || '0', 10);
                    if (!isNaN(num) && num >= 0 && num <= 255) {
                      handleBlueChange(num);
                    }
                  }}
                  styles={{
                    root: { width: '60px' },
                    field: { textAlign: 'center', fontFamily: 'Consolas, Monaco, monospace' },
                  }}
                  ariaLabel='Blue value'
                />
              </Stack>
            </div>
            <div>
              <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='end'>
                <Stack.Item grow>
                  <Label>Alpha: {rgbColor.a}</Label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={rgbColor.a}
                    onChange={handleAlphaChange}
                    showValue={false}
                  />
                </Stack.Item>
                <TextField
                  value={rgbColor.a.toFixed(2)}
                  onChange={(ev, value) => {
                    const num = parseFloat(value || '0');
                    if (!isNaN(num) && num >= 0 && num <= 1) {
                      handleAlphaChange(num);
                    }
                  }}
                  styles={{
                    root: { width: '60px' },
                    field: { textAlign: 'center', fontFamily: 'Consolas, Monaco, monospace' },
                  }}
                  ariaLabel='Alpha value'
                />
              </Stack>
            </div>
          </Stack>

          {/* Color Formats */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Color Formats</h4>
            <Stack tokens={{ childrenGap: 8 }}>
              {Object.entries(colorFormats).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #e1e5e9',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong
                      style={{
                        fontSize: '12px',
                        minWidth: '60px',
                        color: '#323130',
                        textTransform: 'uppercase',
                      }}
                    >
                      {key}:
                    </strong>
                    <code
                      style={{
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '12px',
                        marginLeft: '8px',
                      }}
                    >
                      {value}
                    </code>
                  </div>
                  <IconButton
                    iconProps={{ iconName: 'Copy' }}
                    title={`Copy ${key.toUpperCase()}`}
                    ariaLabel={`Copy ${key} format`}
                    onClick={() => copyFormat(value, key.toUpperCase())}
                    styles={{
                      root: {
                        marginLeft: '8px',
                        minWidth: '24px',
                        width: '24px',
                        height: '24px',
                      },
                    }}
                  />
                </div>
              ))}
            </Stack>
          </div>
          {/* Contrast Checker */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>WCAG Contrast Ratio</h4>
            <Stack horizontal tokens={{ childrenGap: 16 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`,
                    color: '#ffffff',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  On White: {contrastRatio.white}:1
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    {contrastRatio.white >= 4.5
                      ? 'AA ✓'
                      : contrastRatio.white >= 3
                      ? 'AA Large ✓'
                      : 'Fail ✗'}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`,
                    color: '#000000',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  On Black: {contrastRatio.black}:1
                  <div style={{ fontSize: '10px', marginTop: '4px' }}>
                    {contrastRatio.black >= 4.5
                      ? 'AA ✓'
                      : contrastRatio.black >= 3
                      ? 'AA Large ✓'
                      : 'Fail ✗'}
                  </div>
                </div>
              </div>
            </Stack>
          </div>
          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Copy HEX'
              iconProps={{ iconName: 'Copy' }}
              onClick={() => copyFormat(colorFormats.hex, 'HEX')}
              title='Copy HEX color'
            />
            <DefaultButton
              text='Copy RGB'
              iconProps={{ iconName: 'Copy' }}
              onClick={() => copyFormat(colorFormats.rgb, 'RGB')}
              title='Copy RGB color'
            />
            <DefaultButton
              text='Clear'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear color'
            />
          </Stack>
          {/* Success Messages */}
          {showMessage && (
            <MessageBar
              messageBarType={
                copyMessage.includes('Failed') ? MessageBarType.error : MessageBarType.success
              }
              isMultiline={false}
              onDismiss={clearMessage}
              dismissButtonAriaLabel='Close'
              role='alert'
              aria-live='polite'
            >
              {copyMessage}
            </MessageBar>
          )}
          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Supports HEX, RGB, RGBA, HSL, HSLA formats • Press {shortcut} to focus input • WCAG
            contrast ratios included
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
