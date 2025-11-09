import { Icon } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import { IFolderNode, IFolderTreeProps } from '../../types/DeveloperGuideTypes';

/**
 * Folder tree component for displaying project structure
 */
export const FolderTree: React.FC<IFolderTreeProps> = ({
  tree,
  onNodeClick,
  expandAll = false,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    expandAll ? new Set([tree.path || tree.name]) : new Set()
  );

  const toggleNode = (nodePath: string): void => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  };

  const getFileIcon = (node: IFolderNode): string => {
    if (node.icon) {
      return node.icon;
    }

    if (node.type === 'folder') {
      return 'FabricFolder';
    }

    // Determine icon based on file extension
    const extension = node.name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      ts: 'TypeScriptLanguage',
      tsx: 'TypeScriptLanguage',
      js: 'JSCodeBadge',
      jsx: 'JSCodeBadge',
      json: 'FileCode',
      css: 'CSSLanguage',
      scss: 'CSSLanguage',
      html: 'FileHTML',
      md: 'MarkDownLanguage',
      png: 'FileImage',
      jpg: 'FileImage',
      svg: 'FileImage',
      xml: 'FileCode',
      yml: 'FileCode',
      yaml: 'FileCode',
    };

    return iconMap[extension || ''] || 'Page';
  };

  const renderNode = (node: IFolderNode, level: number = 0): React.ReactElement => {
    const nodePath = node.path || node.name;
    const isExpanded = expandedNodes.has(nodePath);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    return (
      <div key={nodePath}>
        {/* Node */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px 6px ' + (12 + indent) + 'px',
            cursor: hasChildren || onNodeClick ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: '13px',
          }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(nodePath);
            }
            if (onNodeClick) {
              onNodeClick(node);
            }
          }}
          onMouseEnter={(e) => {
            if (hasChildren || onNodeClick) {
              e.currentTarget.style.backgroundColor = '#f3f2f1';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Chevron for folders */}
          {hasChildren && (
            <Icon
              iconName={isExpanded ? 'ChevronDown' : 'ChevronRight'}
              styles={{
                root: {
                  fontSize: '12px',
                  marginRight: '4px',
                  color: '#605e5c',
                },
              }}
            />
          )}

          {/* Icon */}
          <Icon
            iconName={getFileIcon(node)}
            styles={{
              root: {
                fontSize: '16px',
                marginRight: '8px',
                color: node.type === 'folder' ? '#FFB900' : '#0078d4',
              },
            }}
          />

          {/* Name */}
          <span
            style={{
              color: '#323130',
              fontWeight: node.type === 'folder' ? 500 : 400,
            }}
          >
            {node.name}
          </span>

          {/* Description */}
          {node.description && (
            <span
              style={{
                marginLeft: '8px',
                color: '#605e5c',
                fontSize: '12px',
                fontStyle: 'italic',
              }}
            >
              - {node.description}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
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
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #edebe9',
          backgroundColor: '#faf9f8',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Project Structure
      </div>

      {/* Tree */}
      <div style={{ padding: '8px 0', maxHeight: '600px', overflowY: 'auto' }}>
        {renderNode(tree)}
      </div>
    </div>
  );
};
