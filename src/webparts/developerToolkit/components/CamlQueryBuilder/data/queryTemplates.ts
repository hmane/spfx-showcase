// src/webparts/showcase/components/CamlQueryBuilder/data/queryTemplates.ts

import { IQueryTemplate } from '../types/CamlTypes';
import { generateId } from '../utils/camlBuilder';

export const QUERY_TEMPLATES: IQueryTemplate[] = [
  // ===== DATE & TIME =====
  {
    id: 'due-this-week',
    name: 'Items Due This Week',
    description: 'Items with due date between today and 7 days from now',
    category: 'DateTime',
    requiredFields: ['DueDate'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'DueDate',
          fieldType: 'DateTime',
          operator: 'Geq',
          value: '<Today/>',
          valueType: 'DateTime',
          includeTimeValue: false,
        },
        {
          id: generateId(),
          fieldInternalName: 'DueDate',
          fieldType: 'DateTime',
          operator: 'Leq',
          value: '<Today OffsetDays="7"/>',
          valueType: 'DateTime',
          includeTimeValue: false,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'DueDate', ascending: true }],
    rowLimit: 100,
  },
  {
    id: 'created-last-30-days',
    name: 'Created in Last 30 Days',
    description: 'Items created within the past month',
    category: 'DateTime',
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Created',
          fieldType: 'DateTime',
          operator: 'Geq',
          value: '<Today OffsetDays="-30"/>',
          valueType: 'DateTime',
          includeTimeValue: false,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Created', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'modified-today',
    name: 'Modified Today',
    description: 'Items modified today',
    category: 'DateTime',
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Modified',
          fieldType: 'DateTime',
          operator: 'Geq',
          value: '<Today/>',
          valueType: 'DateTime',
          includeTimeValue: false,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Modified', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'overdue-items',
    name: 'Overdue Items',
    description: 'Items with due date in the past',
    category: 'DateTime',
    requiredFields: ['DueDate'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'DueDate',
          fieldType: 'DateTime',
          operator: 'Lt',
          value: '<Today/>',
          valueType: 'DateTime',
          includeTimeValue: false,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'DueDate', ascending: true }],
    rowLimit: 100,
  },

  // ===== USER-BASED =====
  {
    id: 'my-items',
    name: 'My Items (Assigned To Me)',
    description: 'Items assigned to current user',
    category: 'User',
    requiredFields: ['AssignedTo'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'AssignedTo',
          fieldType: 'User',
          operator: 'Eq',
          value: '<UserID/>',
          valueType: 'Integer',
          useLookupId: true,
          useUserID: true,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Created', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'created-by-me',
    name: 'Created By Me',
    description: 'Items created by current user',
    category: 'User',
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Author',
          fieldType: 'User',
          operator: 'Eq',
          value: '<UserID/>',
          valueType: 'Integer',
          useLookupId: true,
          useUserID: true,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Created', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'pending-approvals',
    name: 'My Pending Approvals',
    description: 'Items pending approval from current user',
    category: 'User',
    requiredFields: ['Approver', 'Status'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Approver',
          fieldType: 'User',
          operator: 'Eq',
          value: '<UserID/>',
          valueType: 'Integer',
          useLookupId: true,
          useUserID: true,
        },
        {
          id: generateId(),
          fieldInternalName: 'Status',
          fieldType: 'Choice',
          operator: 'Eq',
          value: 'Pending Approval',
          valueType: 'Text',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Created', ascending: true }],
    rowLimit: 100,
  },

  // ===== STATUS & FILTERING =====
  {
    id: 'active-items',
    name: 'Active Items',
    description: 'Items with Status = Active',
    category: 'Status',
    requiredFields: ['Status'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Status',
          fieldType: 'Choice',
          operator: 'Eq',
          value: 'Active',
          valueType: 'Text',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Modified', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'multiple-status',
    name: 'Multiple Status Values',
    description: 'Items with Status = Active, Pending, or In Progress',
    category: 'Status',
    requiredFields: ['Status'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Status',
          fieldType: 'Choice',
          operator: 'In',
          value: 'Active;Pending;In Progress',
          valueType: 'Text',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Modified', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'not-completed',
    name: 'Not Completed',
    description: 'Items where Status is not Completed',
    category: 'Status',
    requiredFields: ['Status'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Status',
          fieldType: 'Choice',
          operator: 'Neq',
          value: 'Completed',
          valueType: 'Text',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Modified', ascending: false }],
    rowLimit: 100,
  },

  // ===== COMPLEX QUERIES =====
  {
    id: 'high-priority-overdue',
    name: 'High Priority & Overdue',
    description: 'High priority items that are overdue',
    category: 'Complex',
    requiredFields: ['Priority', 'DueDate'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Priority',
          fieldType: 'Choice',
          operator: 'Eq',
          value: 'High',
          valueType: 'Text',
        },
        {
          id: generateId(),
          fieldInternalName: 'DueDate',
          fieldType: 'DateTime',
          operator: 'Lt',
          value: '<Today/>',
          valueType: 'DateTime',
          includeTimeValue: false,
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'DueDate', ascending: true }],
    rowLimit: 50,
  },
  {
    id: 'active-assigned-due',
    name: 'Active, Assigned to Me, Due This Week',
    description: 'Complex query combining status, assignment, and due date',
    category: 'Complex',
    requiredFields: ['Status', 'AssignedTo', 'DueDate'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Status',
          fieldType: 'Choice',
          operator: 'Eq',
          value: 'Active',
          valueType: 'Text',
        },
        {
          id: generateId(),
          fieldInternalName: 'AssignedTo',
          fieldType: 'User',
          operator: 'Eq',
          value: '<UserID/>',
          valueType: 'Integer',
          useLookupId: true,
          useUserID: true,
        },
      ],
      nestedGroups: [
        {
          id: generateId(),
          operator: 'AND',
          conditions: [
            {
              id: generateId(),
              fieldInternalName: 'DueDate',
              fieldType: 'DateTime',
              operator: 'Geq',
              value: '<Today/>',
              valueType: 'DateTime',
              includeTimeValue: false,
            },
            {
              id: generateId(),
              fieldInternalName: 'DueDate',
              fieldType: 'DateTime',
              operator: 'Leq',
              value: '<Today OffsetDays="7"/>',
              valueType: 'DateTime',
              includeTimeValue: false,
            },
          ],
          nestedGroups: [],
        },
      ],
    },
    orderBy: [{ fieldInternalName: 'DueDate', ascending: true }],
    rowLimit: 100,
  },
  {
    id: 'price-range',
    name: 'Price Range (500-1000)',
    description: 'Items with price between 500 and 1000',
    category: 'Complex',
    requiredFields: ['Price'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Price',
          fieldType: 'Currency',
          operator: 'Geq',
          value: '500',
          valueType: 'Currency',
        },
        {
          id: generateId(),
          fieldInternalName: 'Price',
          fieldType: 'Currency',
          operator: 'Leq',
          value: '1000',
          valueType: 'Currency',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Price', ascending: true }],
    rowLimit: 100,
  },

  // ===== OTHER =====
  {
    id: 'has-attachments',
    name: 'Items with Attachments',
    description: 'Items that have attachments',
    category: 'Other',
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Attachments',
          fieldType: 'Boolean',
          operator: 'Eq',
          value: '1',
          valueType: 'Boolean',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Modified', ascending: false }],
    rowLimit: 100,
  },
  {
    id: 'no-description',
    name: 'Items with Empty Description',
    description: 'Items where description field is empty',
    category: 'Other',
    requiredFields: ['Description'],
    query: {
      id: generateId(),
      operator: 'AND',
      conditions: [
        {
          id: generateId(),
          fieldInternalName: 'Description',
          fieldType: 'Note',
          operator: 'IsNull',
          value: '',
          valueType: 'Text',
        },
      ],
      nestedGroups: [],
    },
    orderBy: [{ fieldInternalName: 'Created', ascending: false }],
    rowLimit: 100,
  },
];

export function getTemplatesByCategory(
  category: IQueryTemplate['category']
): IQueryTemplate[] {
  return QUERY_TEMPLATES.filter(t => t.category === category);
}

export function getTemplateById(id: string): IQueryTemplate | undefined {
  return QUERY_TEMPLATES.find(t => t.id === id);
}
