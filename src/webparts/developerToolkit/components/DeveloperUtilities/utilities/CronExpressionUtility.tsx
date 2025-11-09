// src/components/DeveloperUtilities/utilities/CronExpressionUtility.tsx

import {
  Dropdown,
  IDropdownOption,
  Label,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  TextField,
  DefaultButton,
  IconButton,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { BaseUtilityProps } from '../types/UtilityTypes';

type ScheduleType = 'preset' | 'simple' | 'advanced';

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export const CronExpressionUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'Cron Expression Generator',
  shortcut = 'Ctrl+Shift+R',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [scheduleType, setScheduleType] = useState<ScheduleType>('preset');
  const [cronParts, setCronParts] = useState<CronParts>({
    minute: '0',
    hour: '0',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });
  const [customExpression, setCustomExpression] = useState<string>('');

  // Simple builder states
  const [frequency, setFrequency] = useState<string>('daily');
  const [time, setTime] = useState<string>('00:00');
  const [dayInterval, setDayInterval] = useState<string>('1');
  const [selectedDays, setSelectedDays] = useState<string>('*');

  // Common presets
  const presets: Array<{ label: string; expression: string; description: string }> = useMemo(
    () => [
      { label: 'Every minute', expression: '* * * * *', description: 'Runs every minute' },
      { label: 'Every 5 minutes', expression: '*/5 * * * *', description: 'Runs every 5 minutes' },
      {
        label: 'Every 15 minutes',
        expression: '*/15 * * * *',
        description: 'Runs every 15 minutes',
      },
      { label: 'Every hour', expression: '0 * * * *', description: 'Runs at minute 0 of every hour' },
      { label: 'Every 6 hours', expression: '0 */6 * * *', description: 'Runs every 6 hours' },
      {
        label: 'Daily at midnight',
        expression: '0 0 * * *',
        description: 'Runs at 00:00 every day',
      },
      { label: 'Daily at 8 AM', expression: '0 8 * * *', description: 'Runs at 08:00 every day' },
      { label: 'Daily at 6 PM', expression: '0 18 * * *', description: 'Runs at 18:00 every day' },
      {
        label: 'Weekdays at 9 AM',
        expression: '0 9 * * 1-5',
        description: 'Runs at 09:00 Monday-Friday',
      },
      {
        label: 'Every Monday at 9 AM',
        expression: '0 9 * * 1',
        description: 'Runs at 09:00 every Monday',
      },
      { label: 'First of month', expression: '0 0 1 * *', description: 'Runs at midnight on day 1' },
      { label: 'Every 2 days', expression: '0 0 */2 * *', description: 'Runs every 2 days at midnight' },
    ],
    []
  );

  // Frequency options for simple builder
  const frequencyOptions: IDropdownOption[] = useMemo(
    () => [
      { key: 'minute', text: 'Every X minutes' },
      { key: 'hourly', text: 'Every X hours' },
      { key: 'daily', text: 'Every X days' },
      { key: 'weekly', text: 'Weekly on specific days' },
      { key: 'monthly', text: 'Monthly on specific day' },
    ],
    []
  );

  // Simplified dropdown options for advanced mode
  const minuteOptions: IDropdownOption[] = useMemo(
    () => [
      { key: '*', text: 'Every minute' },
      { key: '*/5', text: 'Every 5 minutes' },
      { key: '*/10', text: 'Every 10 minutes' },
      { key: '*/15', text: 'Every 15 minutes' },
      { key: '*/30', text: 'Every 30 minutes' },
      { key: '0', text: 'At minute 0' },
      { key: '15', text: 'At minute 15' },
      { key: '30', text: 'At minute 30' },
      { key: '45', text: 'At minute 45' },
    ],
    []
  );

  const hourOptions: IDropdownOption[] = useMemo(
    () => [
      { key: '*', text: 'Every hour' },
      { key: '*/2', text: 'Every 2 hours' },
      { key: '*/3', text: 'Every 3 hours' },
      { key: '*/4', text: 'Every 4 hours' },
      { key: '*/6', text: 'Every 6 hours' },
      { key: '*/12', text: 'Every 12 hours' },
      { key: '0', text: '12 AM (midnight)' },
      { key: '6', text: '6 AM' },
      { key: '8', text: '8 AM' },
      { key: '9', text: '9 AM' },
      { key: '12', text: '12 PM (noon)' },
      { key: '17', text: '5 PM' },
      { key: '18', text: '6 PM' },
      { key: '20', text: '8 PM' },
    ],
    []
  );

  const dayOfMonthOptions: IDropdownOption[] = useMemo(
    () => [
      { key: '*', text: 'Every day' },
      { key: '*/2', text: 'Every 2 days' },
      { key: '*/3', text: 'Every 3 days' },
      { key: '1', text: '1st of month' },
      { key: '15', text: '15th of month' },
      { key: 'L', text: 'Last day of month' },
    ],
    []
  );

  const monthOptions: IDropdownOption[] = useMemo(
    () => [
      { key: '*', text: 'Every month' },
      { key: '*/2', text: 'Every 2 months' },
      { key: '*/3', text: 'Every 3 months (quarterly)' },
      { key: '*/6', text: 'Every 6 months' },
      { key: '1', text: 'January' },
      { key: '4', text: 'April' },
      { key: '7', text: 'July' },
      { key: '10', text: 'October' },
    ],
    []
  );

  const dayOfWeekOptions: IDropdownOption[] = useMemo(
    () => [
      { key: '*', text: 'Any day' },
      { key: '1-5', text: 'Weekdays (Mon-Fri)' },
      { key: '0,6', text: 'Weekends (Sat-Sun)' },
      { key: '0', text: 'Sunday' },
      { key: '1', text: 'Monday' },
      { key: '2', text: 'Tuesday' },
      { key: '3', text: 'Wednesday' },
      { key: '4', text: 'Thursday' },
      { key: '5', text: 'Friday' },
      { key: '6', text: 'Saturday' },
    ],
    []
  );

  // Build cron expression from simple builder
  const buildSimpleCron = useCallback((): string => {
    const [hour, minute] = time.split(':');

    switch (frequency) {
      case 'minute': {
        const interval = dayInterval || '5';
        return `*/${interval} * * * *`;
      }
      case 'hourly': {
        const interval = dayInterval || '1';
        return `0 */${interval} * * *`;
      }
      case 'daily': {
        const interval = dayInterval || '1';
        if (interval === '1') {
          return `${minute} ${hour} * * *`;
        }
        return `${minute} ${hour} */${interval} * *`;
      }
      case 'weekly': {
        return `${minute} ${hour} * * ${selectedDays}`;
      }
      case 'monthly': {
        const day = dayInterval || '1';
        return `${minute} ${hour} ${day} * *`;
      }
      default:
        return `${minute} ${hour} * * *`;
    }
  }, [frequency, time, dayInterval, selectedDays]);

  // Build cron expression based on mode
  const cronExpression = useMemo(() => {
    if (scheduleType === 'simple') {
      return buildSimpleCron();
    } else if (scheduleType === 'advanced') {
      return `${cronParts.minute} ${cronParts.hour} ${cronParts.dayOfMonth} ${cronParts.month} ${cronParts.dayOfWeek}`;
    }
    return customExpression || '0 0 * * *';
  }, [scheduleType, cronParts, customExpression, buildSimpleCron]);

  // Parse and describe cron expression
  const describeCron = useCallback((expr: string): string => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return 'Invalid cron expression (must have 5 parts)';

    const [min, hr, dom, mon, dow] = parts;
    const description: string[] = [];

    // Minute
    if (min === '*') {
      description.push('every minute');
    } else if (min.startsWith('*/')) {
      description.push(`every ${min.substring(2)} minutes`);
    } else {
      description.push(`at minute ${min}`);
    }

    // Hour
    if (hr === '*') {
      description.push('of every hour');
    } else if (hr.startsWith('*/')) {
      description.push(`of every ${hr.substring(2)} hours`);
    } else {
      const hour = parseInt(hr, 10);
      const ampm = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      description.push(`at ${displayHour}:00 ${ampm}`);
    }

    // Day of month
    if (dom !== '*') {
      if (dom.startsWith('*/')) {
        description.push(`every ${dom.substring(2)} days`);
      } else {
        description.push(`on day ${dom} of the month`);
      }
    }

    // Month
    if (mon !== '*') {
      const monthNames = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      if (mon.startsWith('*/')) {
        description.push(`every ${mon.substring(2)} months`);
      } else {
        const monthNum = parseInt(mon, 10);
        description.push(`in ${monthNames[monthNum]}`);
      }
    }

    // Day of week
    if (dow !== '*') {
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      if (dow === '1-5') {
        description.push('on weekdays');
      } else if (dow === '0,6') {
        description.push('on weekends');
      } else if (dow.includes(',')) {
        const days = dow.split(',').map(d => dayNames[parseInt(d, 10)]);
        description.push(`on ${days.join(', ')}`);
      } else if (dow.includes('-')) {
        const [start, end] = dow.split('-').map(d => parseInt(d, 10));
        description.push(`on ${dayNames[start]} through ${dayNames[end]}`);
      } else {
        const dayNum = parseInt(dow, 10);
        description.push(`on ${dayNames[dayNum]}`);
      }
    }

    return 'Runs ' + description.join(' ');
  }, []);


  // Handle field changes for advanced mode
  const handleFieldChange = useCallback((field: keyof CronParts, value: string): void => {
    setCronParts(prev => ({ ...prev, [field]: value }));
  }, []);

  // Load preset
  const loadPreset = useCallback((expression: string): void => {
    setCustomExpression(expression);
    setScheduleType('preset');
  }, []);

  // Parse expression to parts for understanding
  const parseExpression = useCallback((expression: string): void => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length === 5) {
      setCronParts({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      });
    }
  }, []);

  // Copy expression
  const copyExpression = useCallback(async (): Promise<void> => {
    await copyToClipboard(cronExpression);
  }, [cronExpression, copyToClipboard]);

  // Clear all
  const clearAll = useCallback((): void => {
    setCronParts({
      minute: '0',
      hour: '0',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });
    setCustomExpression('');
    setScheduleType('preset');
    setFrequency('daily');
    setTime('00:00');
    setDayInterval('1');
    setSelectedDays('*');
  }, []);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+shift+r', copyExpression);

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [copyExpression, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'copy',
        label: 'Copy',
        icon: 'Copy',
        onClick: copyExpression,
        variant: 'primary',
        tooltip: 'Copy cron expression',
      },
    ],
    [copyExpression]
  );

  const description = useMemo(() => describeCron(cronExpression), [cronExpression, describeCron]);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 15 }}>
          {/* Mode Selector */}
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton
              text='Quick Presets'
              onClick={() => setScheduleType('preset')}
              primary={scheduleType === 'preset'}
              styles={{ root: { minWidth: 100 } }}
            />
            <DefaultButton
              text='Simple Builder'
              onClick={() => setScheduleType('simple')}
              primary={scheduleType === 'simple'}
              styles={{ root: { minWidth: 100 } }}
            />
            <DefaultButton
              text='Advanced'
              onClick={() => setScheduleType('advanced')}
              primary={scheduleType === 'advanced'}
              styles={{ root: { minWidth: 100 } }}
            />
          </Stack>

          {/* Preset Mode */}
          {scheduleType === 'preset' && (
            <div>
              <Label>Select a common schedule:</Label>
              <Stack tokens={{ childrenGap: 8 }}>
                {presets.map(preset => (
                  <div
                    key={preset.expression}
                    onClick={() => loadPreset(preset.expression)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: customExpression === preset.expression ? '#e6f2ff' : '#f8f9fa',
                      border: customExpression === preset.expression ? '2px solid #0078d4' : '1px solid #e1e5e9',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (customExpression !== preset.expression) {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseLeave={e => {
                      if (customExpression !== preset.expression) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                      {preset.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{preset.description}</div>
                    <div
                      style={{
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '11px',
                        color: '#0078d4',
                        marginTop: '4px',
                      }}
                    >
                      {preset.expression}
                    </div>
                  </div>
                ))}
              </Stack>
            </div>
          )}

          {/* Simple Builder Mode */}
          {scheduleType === 'simple' && (
            <Stack tokens={{ childrenGap: 12 }}>
              <Dropdown
                label='How often should it run?'
                options={frequencyOptions}
                selectedKey={frequency}
                onChange={(ev, option) => setFrequency(option?.key as string)}
              />

              {frequency === 'minute' && (
                <TextField
                  label='Every X minutes'
                  type='number'
                  value={dayInterval}
                  onChange={(ev, value) => setDayInterval(value || '5')}
                  min='1'
                  max='59'
                  description='How many minutes between runs (1-59)'
                />
              )}

              {frequency === 'hourly' && (
                <TextField
                  label='Every X hours'
                  type='number'
                  value={dayInterval}
                  onChange={(ev, value) => setDayInterval(value || '1')}
                  min='1'
                  max='23'
                  description='How many hours between runs (1-23)'
                />
              )}

              {frequency === 'daily' && (
                <>
                  <TextField
                    label='Every X days'
                    type='number'
                    value={dayInterval}
                    onChange={(ev, value) => setDayInterval(value || '1')}
                    min='1'
                    max='31'
                    description='How many days between runs (1-31). Example: 2 = every other day'
                  />
                  <TextField
                    label='At what time?'
                    type='time'
                    value={time}
                    onChange={(ev, value) => setTime(value || '00:00')}
                    description='24-hour format (e.g., 20:00 for 8 PM)'
                  />
                </>
              )}

              {frequency === 'weekly' && (
                <>
                  <Dropdown
                    label='On which days?'
                    options={dayOfWeekOptions}
                    selectedKey={selectedDays}
                    onChange={(ev, option) => setSelectedDays(option?.key as string)}
                  />
                  <TextField
                    label='At what time?'
                    type='time'
                    value={time}
                    onChange={(ev, value) => setTime(value || '00:00')}
                    description='24-hour format (e.g., 20:00 for 8 PM)'
                  />
                </>
              )}

              {frequency === 'monthly' && (
                <>
                  <TextField
                    label='On which day of the month?'
                    type='number'
                    value={dayInterval}
                    onChange={(ev, value) => setDayInterval(value || '1')}
                    min='1'
                    max='31'
                    description='Day of month (1-31)'
                  />
                  <TextField
                    label='At what time?'
                    type='time'
                    value={time}
                    onChange={(ev, value) => setTime(value || '00:00')}
                    description='24-hour format (e.g., 20:00 for 8 PM)'
                  />
                </>
              )}
            </Stack>
          )}

          {/* Advanced Mode */}
          {scheduleType === 'advanced' && (
            <Stack tokens={{ childrenGap: 10 }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                Fine-tune each part of the cron expression:
              </div>
              <Dropdown
                label='Minute (0-59)'
                options={minuteOptions}
                selectedKey={cronParts.minute}
                onChange={(ev, option) => handleFieldChange('minute', option?.key as string)}
              />
              <Dropdown
                label='Hour (0-23)'
                options={hourOptions}
                selectedKey={cronParts.hour}
                onChange={(ev, option) => handleFieldChange('hour', option?.key as string)}
              />
              <Dropdown
                label='Day of Month (1-31)'
                options={dayOfMonthOptions}
                selectedKey={cronParts.dayOfMonth}
                onChange={(ev, option) => handleFieldChange('dayOfMonth', option?.key as string)}
              />
              <Dropdown
                label='Month (1-12)'
                options={monthOptions}
                selectedKey={cronParts.month}
                onChange={(ev, option) => handleFieldChange('month', option?.key as string)}
              />
              <Dropdown
                label='Day of Week (0-6, 0=Sunday)'
                options={dayOfWeekOptions}
                selectedKey={cronParts.dayOfWeek}
                onChange={(ev, option) => handleFieldChange('dayOfWeek', option?.key as string)}
              />
            </Stack>
          )}

          {/* Generated Expression Display */}
          <div
            style={{
              padding: '14px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              border: '2px solid #0078d4',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#003a6b', fontWeight: 600 }}>
                Generated Cron Expression
              </h4>
              <IconButton
                iconProps={{ iconName: 'Copy' }}
                title='Copy expression'
                onClick={copyExpression}
                styles={{ root: { height: 24 } }}
              />
            </div>
            <div
              style={{
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '16px',
                fontWeight: 600,
                padding: '10px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '10px',
                border: '1px solid #b3d6fc',
              }}
              onClick={copyExpression}
              title='Click to copy'
            >
              {cronExpression}
            </div>
            <div style={{ fontSize: '12px', color: '#003a6b', lineHeight: '1.5' }}>
              <strong>Meaning:</strong> {description}
            </div>
          </div>

          {/* Parse/Understand Expression */}
          <div>
            <Label>Paste a cron expression to understand it:</Label>
            <TextField
              placeholder='Paste cron expression here (e.g., 0 20 */2 * *)'
              value={scheduleType === 'preset' ? customExpression : ''}
              onChange={(ev, value) => {
                setCustomExpression(value || '');
                parseExpression(value || '');
              }}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '13px',
                },
              }}
            />
            {customExpression && scheduleType === 'preset' && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#fff4e6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: '1px solid #ffd480',
                }}
              >
                <strong>This expression means:</strong> {describeCron(customExpression)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <PrimaryButton
              text='Copy Expression'
              iconProps={{ iconName: 'Copy' }}
              onClick={copyExpression}
              title={`Copy cron expression (${shortcut})`}
            />
            <DefaultButton
              text='Reset'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear and reset to defaults'
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

          {/* Quick Reference */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e1e5e9',
            }}
          >
            <strong>Cron Format:</strong> minute hour day-of-month month day-of-week
            <br />
            <strong>Special chars:</strong> * (any) / (step) - (range) , (list)
            <br />
            <strong>Example:</strong> 0 20 */2 * * = Every 2 days at 8 PM (20:00)
          </div>
        </Stack>
      </Content>
    </Card>
  );
};
