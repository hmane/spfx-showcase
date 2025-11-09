import { IconButton, SearchBox, Stack } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { ICommandPaletteProps } from '../../types/DeveloperGuideTypes';

/**
 * Command palette component for displaying commands with copy functionality
 */
export const CommandPalette: React.FC<ICommandPaletteProps> = ({
  commands,
  title = 'Commands',
  searchable = true,
  grouped = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const handleCopy = async (command: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (error) {
      console.error('Failed to copy command:', error);
    }
  };

  // Filter commands based on search query
  const filteredCommands = commands.filter(cmd =>
    cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cmd.category && cmd.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group commands by category if grouped is enabled
  const groupedCommands = grouped
    ? filteredCommands.reduce((acc, cmd) => {
        const category = cmd.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(cmd);
        return acc;
      }, {} as Record<string, typeof commands>)
    : { [title]: filteredCommands };

  return (
    <div
      style={{
        border: '1px solid #edebe9',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header with search */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #edebe9',
          backgroundColor: '#faf9f8',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
          {title}
        </h3>
        {searchable && (
          <SearchBox
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(_, newValue) => setSearchQuery(newValue || '')}
            styles={{
              root: { width: '100%' },
            }}
          />
        )}
      </div>

      {/* Commands list */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {Object.keys(groupedCommands).length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: '#605e5c',
              fontSize: '14px',
            }}
          >
            No commands found
          </div>
        ) : (
          Object.entries(groupedCommands).map(([category, categoryCommands]) => (
            <div key={category}>
              {grouped && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f3f2f1',
                    borderBottom: '1px solid #edebe9',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#323130',
                  }}
                >
                  {category}
                </div>
              )}
              <Stack tokens={{ childrenGap: 0 }}>
                {categoryCommands.map((cmd, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom:
                        index < categoryCommands.length - 1 ? '1px solid #edebe9' : 'none',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f2f1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                          fontSize: '13px',
                          color: '#0078d4',
                          marginBottom: '4px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {cmd.command}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#605e5c',
                        }}
                      >
                        {cmd.description}
                      </div>
                    </div>
                    <IconButton
                      iconProps={{
                        iconName: copiedCommand === cmd.command ? 'CheckMark' : 'Copy',
                      }}
                      title={copiedCommand === cmd.command ? 'Copied!' : 'Copy command'}
                      onClick={() => handleCopy(cmd.command)}
                      styles={{
                        root: {
                          marginLeft: '12px',
                          color: copiedCommand === cmd.command ? '#107c10' : '#605e5c',
                        },
                        rootHovered: {
                          backgroundColor: '#edebe9',
                        },
                      }}
                    />
                  </div>
                ))}
              </Stack>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
