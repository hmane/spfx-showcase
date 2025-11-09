// src/DeveloperUtilities/data/columnFormatterTemplates.ts

export type FieldType =
  | 'Text'
  | 'Number'
  | 'Date'
  | 'Person'
  | 'Choice'
  | 'YesNo'
  | 'Hyperlink'
  | 'Multi-Choice';

export type TemplateCategory =
  | 'Status Indicators'
  | 'Data Visualizations'
  | 'Person Formatting'
  | 'Action Buttons';

export interface TemplateParameter {
  name: string;
  label: string;
  type: 'color' | 'text' | 'number' | 'icon' | 'field';
  defaultValue: string;
  description?: string;
}

export interface ColumnFormatterTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  fieldType: FieldType;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  parameters: TemplateParameter[];
  requiredFields: string[];
  json: string;
  previewImage?: string;
}

export const COLUMN_FORMATTER_TEMPLATES: ColumnFormatterTemplate[] = [
  // ===== STATUS INDICATORS =====
  {
    id: 'traffic-light-status',
    name: 'Traffic Light Status (RAG)',
    description:
      'Red, Amber, Green status indicator based on choice field. Most popular template for project status tracking.',
    category: 'Status Indicators',
    fieldType: 'Choice',
    complexity: 'Beginner',
    parameters: [
      { name: 'redValue', label: 'Red Value', type: 'text', defaultValue: 'At Risk' },
      { name: 'yellowValue', label: 'Yellow Value', type: 'text', defaultValue: 'Warning' },
      { name: 'greenValue', label: 'Green Value', type: 'text', defaultValue: 'On Track' },
      { name: 'redColor', label: 'Red Color', type: 'color', defaultValue: '#d13438' },
      { name: 'yellowColor', label: 'Yellow Color', type: 'color', defaultValue: '#ffc83d' },
      { name: 'greenColor', label: 'Green Color', type: 'color', defaultValue: '#107c10' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "background-color": "=if(@currentField == '{{redValue}}', '{{redColor}}', if(@currentField == '{{yellowValue}}', '{{yellowColor}}', if(@currentField == '{{greenValue}}', '{{greenColor}}', '#edebe9')))",
    "color": "#ffffff",
    "padding": "4px 12px",
    "border-radius": "12px",
    "display": "inline-block",
    "font-weight": "600",
    "font-size": "11px"
  },
  "txtContent": "@currentField"
}`,
  },
  {
    id: 'status-badges',
    name: 'Status Badges',
    description: 'Colored pill-shaped badges with customizable colors for different status values.',
    category: 'Status Indicators',
    fieldType: 'Choice',
    complexity: 'Beginner',
    parameters: [
      {
        name: 'completedValue',
        label: 'Completed Value',
        type: 'text',
        defaultValue: 'Completed',
      },
      { name: 'inProgressValue', label: 'In Progress Value', type: 'text', defaultValue: 'In Progress' },
      { name: 'notStartedValue', label: 'Not Started Value', type: 'text', defaultValue: 'Not Started' },
      { name: 'completedColor', label: 'Completed Color', type: 'color', defaultValue: '#107c10' },
      {
        name: 'inProgressColor',
        label: 'In Progress Color',
        type: 'color',
        defaultValue: '#0078d4',
      },
      {
        name: 'notStartedColor',
        label: 'Not Started Color',
        type: 'color',
        defaultValue: '#605e5c',
      },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "background-color": "=if(@currentField == '{{completedValue}}', '{{completedColor}}', if(@currentField == '{{inProgressValue}}', '{{inProgressColor}}', if(@currentField == '{{notStartedValue}}', '{{notStartedColor}}', '#8a8886')))",
    "color": "#ffffff",
    "padding": "6px 16px",
    "border-radius": "16px",
    "display": "inline-block",
    "font-weight": "500",
    "text-align": "center",
    "min-width": "80px"
  },
  "txtContent": "@currentField"
}`,
  },
  {
    id: 'severity-indicator',
    name: 'Severity Indicator',
    description: 'Priority/severity indicator using SharePoint built-in severity classes for consistency.',
    category: 'Status Indicators',
    fieldType: 'Choice',
    complexity: 'Beginner',
    parameters: [
      { name: 'blockedValue', label: 'Blocked/Critical Value', type: 'text', defaultValue: 'Critical' },
      { name: 'highValue', label: 'High Value', type: 'text', defaultValue: 'High' },
      { name: 'mediumValue', label: 'Medium Value', type: 'text', defaultValue: 'Medium' },
      { name: 'lowValue', label: 'Low Value', type: 'text', defaultValue: 'Low' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "attributes": {
    "class": "=if(@currentField == '{{blockedValue}}', 'sp-field-severity--blocked', if(@currentField == '{{highValue}}', 'sp-field-severity--severeWarning', if(@currentField == '{{mediumValue}}', 'sp-field-severity--warning', if(@currentField == '{{lowValue}}', 'sp-field-severity--low', 'sp-field-severity--good'))))"
  },
  "children": [
    {
      "elmType": "span",
      "style": {
        "display": "inline-block",
        "padding": "0 4px"
      },
      "attributes": {
        "iconName": "=if(@currentField == '{{blockedValue}}', 'Blocked', if(@currentField == '{{highValue}}', 'Warning', if(@currentField == '{{mediumValue}}', 'Error', if(@currentField == '{{lowValue}}', 'Info', 'CheckMark'))))"
      }
    },
    {
      "elmType": "span",
      "txtContent": "@currentField"
    }
  ]
}`,
  },
  {
    id: 'icon-status',
    name: 'Icon-Based Status',
    description: 'Status displayed with icons only, great for compact views.',
    category: 'Status Indicators',
    fieldType: 'Choice',
    complexity: 'Beginner',
    parameters: [
      { name: 'completeValue', label: 'Complete Value', type: 'text', defaultValue: 'Complete' },
      { name: 'pendingValue', label: 'Pending Value', type: 'text', defaultValue: 'Pending' },
      { name: 'failedValue', label: 'Failed Value', type: 'text', defaultValue: 'Failed' },
      { name: 'completeIcon', label: 'Complete Icon', type: 'icon', defaultValue: 'CheckMark' },
      { name: 'pendingIcon', label: 'Pending Icon', type: 'icon', defaultValue: 'Clock' },
      { name: 'failedIcon', label: 'Failed Icon', type: 'icon', defaultValue: 'StatusErrorFull' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "color": "=if(@currentField == '{{completeValue}}', '#107c10', if(@currentField == '{{pendingValue}}', '#ffc83d', if(@currentField == '{{failedValue}}', '#d13438', '#605e5c')))",
    "font-size": "20px"
  },
  "attributes": {
    "iconName": "=if(@currentField == '{{completeValue}}', '{{completeIcon}}', if(@currentField == '{{pendingValue}}', '{{pendingIcon}}', if(@currentField == '{{failedValue}}', '{{failedIcon}}', 'Unknown')))",
    "title": "@currentField"
  }
}`,
  },

  // ===== DATA VISUALIZATIONS =====
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    description: 'Visual progress bar with conditional coloring based on percentage complete.',
    category: 'Data Visualizations',
    fieldType: 'Number',
    complexity: 'Intermediate',
    parameters: [
      { name: 'maxValue', label: 'Maximum Value', type: 'number', defaultValue: '100' },
      { name: 'lowThreshold', label: 'Low Threshold (%)', type: 'number', defaultValue: '33' },
      { name: 'midThreshold', label: 'Mid Threshold (%)', type: 'number', defaultValue: '66' },
      { name: 'lowColor', label: 'Low Color', type: 'color', defaultValue: '#d13438' },
      { name: 'midColor', label: 'Mid Color', type: 'color', defaultValue: '#ffc83d' },
      { name: 'highColor', label: 'High Color', type: 'color', defaultValue: '#107c10' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "width": "100%",
    "background-color": "#edebe9",
    "border-radius": "4px",
    "overflow": "hidden"
  },
  "children": [
    {
      "elmType": "div",
      "style": {
        "width": "=if(@currentField >= {{maxValue}}, '100%', (@currentField / {{maxValue}}) * 100 + '%')",
        "height": "24px",
        "background-color": "=if(@currentField <= {{lowThreshold}}, '{{lowColor}}', if(@currentField <= {{midThreshold}}, '{{midColor}}', '{{highColor}}'))",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "color": "#ffffff",
        "font-weight": "600",
        "font-size": "11px",
        "min-width": "32px",
        "transition": "width 0.3s ease"
      },
      "txtContent": "=@currentField + '%'"
    }
  ]
}`,
  },
  {
    id: 'data-bars',
    name: 'Data Bars',
    description: 'Excel-style data bars that scale based on the maximum value in the column.',
    category: 'Data Visualizations',
    fieldType: 'Number',
    complexity: 'Intermediate',
    parameters: [
      { name: 'maxValue', label: 'Maximum Value', type: 'number', defaultValue: '100' },
      { name: 'barColor', label: 'Bar Color', type: 'color', defaultValue: '#0078d4' },
      { name: 'showValue', label: 'Show Value', type: 'text', defaultValue: 'true' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "attributes": {
    "class": "sp-field-dataBars"
  },
  "style": {
    "width": "100%"
  },
  "children": [
    {
      "elmType": "div",
      "style": {
        "background-color": "{{barColor}}",
        "width": "=if(@currentField >= {{maxValue}}, '100%', (@currentField / {{maxValue}}) * 100 + '%')",
        "height": "20px",
        "border-radius": "2px",
        "display": "flex",
        "align-items": "center",
        "padding-left": "4px"
      },
      "children": [
        {
          "elmType": "span",
          "style": {
            "color": "#ffffff",
            "font-weight": "500",
            "font-size": "11px"
          },
          "txtContent": "@currentField"
        }
      ]
    }
  ]
}`,
  },
  {
    id: 'donut-chart',
    name: 'Donut Chart',
    description: 'SVG-based donut chart for percentage visualization.',
    category: 'Data Visualizations',
    fieldType: 'Number',
    complexity: 'Advanced',
    parameters: [
      { name: 'size', label: 'Chart Size (px)', type: 'number', defaultValue: '50' },
      { name: 'fillColor', label: 'Fill Color', type: 'color', defaultValue: '#0078d4' },
      { name: 'bgColor', label: 'Background Color', type: 'color', defaultValue: '#edebe9' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "display": "flex",
    "align-items": "center",
    "gap": "8px"
  },
  "children": [
    {
      "elmType": "svg",
      "attributes": {
        "viewBox": "0 0 36 36"
      },
      "style": {
        "width": "{{size}}px",
        "height": "{{size}}px",
        "transform": "rotate(-90deg)"
      },
      "children": [
        {
          "elmType": "path",
          "attributes": {
            "d": "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831",
            "fill": "none",
            "stroke": "{{bgColor}}",
            "stroke-width": "3"
          }
        },
        {
          "elmType": "path",
          "attributes": {
            "d": "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831",
            "fill": "none",
            "stroke": "{{fillColor}}",
            "stroke-width": "3",
            "stroke-dasharray": "=@currentField + ' 100'"
          }
        }
      ]
    },
    {
      "elmType": "div",
      "style": {
        "font-weight": "600",
        "font-size": "13px"
      },
      "txtContent": "=@currentField + '%'"
    }
  ]
}`,
  },
  {
    id: 'step-progress',
    name: 'Step Progress Indicator',
    description: 'Shows progress through stages with icons (completed/current/remaining).',
    category: 'Data Visualizations',
    fieldType: 'Choice',
    complexity: 'Intermediate',
    parameters: [
      { name: 'step1', label: 'Step 1 Name', type: 'text', defaultValue: 'Planning' },
      { name: 'step2', label: 'Step 2 Name', type: 'text', defaultValue: 'In Progress' },
      { name: 'step3', label: 'Step 3 Name', type: 'text', defaultValue: 'Review' },
      { name: 'step4', label: 'Step 4 Name', type: 'text', defaultValue: 'Complete' },
      { name: 'completeColor', label: 'Complete Color', type: 'color', defaultValue: '#107c10' },
      { name: 'currentColor', label: 'Current Color', type: 'color', defaultValue: '#0078d4' },
      { name: 'pendingColor', label: 'Pending Color', type: 'color', defaultValue: '#edebe9' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "display": "flex",
    "gap": "8px",
    "align-items": "center"
  },
  "children": [
    {
      "elmType": "div",
      "style": {
        "width": "24px",
        "height": "24px",
        "border-radius": "50%",
        "background-color": "{{completeColor}}",
        "color": "#ffffff",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "font-size": "12px"
      },
      "attributes": {
        "iconName": "CheckMark",
        "title": "{{step1}}"
      }
    },
    {
      "elmType": "div",
      "style": {
        "width": "24px",
        "height": "24px",
        "border-radius": "50%",
        "background-color": "=if(@currentField == '{{step1}}', '{{pendingColor}}', '{{completeColor}}')",
        "color": "=if(@currentField == '{{step1}}', '#605e5c', '#ffffff')",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "font-size": "12px"
      },
      "attributes": {
        "iconName": "=if(@currentField == '{{step1}}', 'CircleRing', 'CheckMark')",
        "title": "{{step2}}"
      }
    },
    {
      "elmType": "div",
      "style": {
        "width": "24px",
        "height": "24px",
        "border-radius": "50%",
        "background-color": "=if(@currentField == '{{step1}}' || @currentField == '{{step2}}', '{{pendingColor}}', '{{completeColor}}')",
        "color": "=if(@currentField == '{{step1}}' || @currentField == '{{step2}}', '#605e5c', '#ffffff')",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "font-size": "12px"
      },
      "attributes": {
        "iconName": "=if(@currentField == '{{step1}}' || @currentField == '{{step2}}', 'CircleRing', 'CheckMark')",
        "title": "{{step3}}"
      }
    },
    {
      "elmType": "div",
      "style": {
        "width": "24px",
        "height": "24px",
        "border-radius": "50%",
        "background-color": "=if(@currentField == '{{step4}}', '{{completeColor}}', '{{pendingColor}}')",
        "color": "=if(@currentField == '{{step4}}', '#ffffff', '#605e5c')",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "font-size": "12px"
      },
      "attributes": {
        "iconName": "=if(@currentField == '{{step4}}', 'CheckMark', 'CircleRing')",
        "title": "{{step4}}"
      }
    }
  ]
}`,
  },

  // ===== PERSON FORMATTING =====
  {
    id: 'person-circle',
    name: 'Person Profile Picture',
    description: 'Circular profile picture for person/group fields.',
    category: 'Person Formatting',
    fieldType: 'Person',
    complexity: 'Beginner',
    parameters: [
      { name: 'size', label: 'Picture Size (px)', type: 'number', defaultValue: '32' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "display": "flex",
    "align-items": "center",
    "gap": "8px"
  },
  "children": [
    {
      "elmType": "img",
      "attributes": {
        "src": "=getUserImage(@currentField.email, '{{size}}')",
        "title": "@currentField.title"
      },
      "style": {
        "width": "{{size}}px",
        "height": "{{size}}px",
        "border-radius": "50%",
        "object-fit": "cover"
      }
    },
    {
      "elmType": "div",
      "txtContent": "@currentField.title"
    }
  ]
}`,
  },
  {
    id: 'person-card',
    name: 'Person Card with Details',
    description: 'Profile picture with name and email in card format.',
    category: 'Person Formatting',
    fieldType: 'Person',
    complexity: 'Intermediate',
    parameters: [
      { name: 'pictureSize', label: 'Picture Size (px)', type: 'number', defaultValue: '40' },
      { name: 'bgColor', label: 'Background Color', type: 'color', defaultValue: '#f3f2f1' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "display": "flex",
    "align-items": "center",
    "gap": "12px",
    "padding": "8px",
    "background-color": "{{bgColor}}",
    "border-radius": "4px"
  },
  "children": [
    {
      "elmType": "img",
      "attributes": {
        "src": "=getUserImage(@currentField.email, '{{pictureSize}}')",
        "title": "@currentField.title"
      },
      "style": {
        "width": "{{pictureSize}}px",
        "height": "{{pictureSize}}px",
        "border-radius": "50%",
        "object-fit": "cover"
      }
    },
    {
      "elmType": "div",
      "children": [
        {
          "elmType": "div",
          "style": {
            "font-weight": "600",
            "font-size": "13px"
          },
          "txtContent": "@currentField.title"
        },
        {
          "elmType": "div",
          "style": {
            "font-size": "11px",
            "color": "#605e5c"
          },
          "txtContent": "@currentField.email"
        }
      ]
    }
  ]
}`,
  },
  {
    id: 'current-user-highlight',
    name: 'Highlight Current User',
    description: 'Highlights the row if the person field matches the logged-in user.',
    category: 'Person Formatting',
    fieldType: 'Person',
    complexity: 'Intermediate',
    parameters: [
      {
        name: 'highlightColor',
        label: 'Highlight Color',
        type: 'color',
        defaultValue: '#deecf9',
      },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "display": "flex",
    "align-items": "center",
    "gap": "8px",
    "padding": "4px 8px",
    "background-color": "=if(@currentField.email == @me, '{{highlightColor}}', 'transparent')",
    "border-radius": "4px",
    "font-weight": "=if(@currentField.email == @me, '600', '400')"
  },
  "children": [
    {
      "elmType": "img",
      "attributes": {
        "src": "=getUserImage(@currentField.email, '24')",
        "title": "@currentField.title"
      },
      "style": {
        "width": "24px",
        "height": "24px",
        "border-radius": "50%",
        "object-fit": "cover"
      }
    },
    {
      "elmType": "div",
      "txtContent": "@currentField.title"
    },
    {
      "elmType": "div",
      "style": {
        "display": "=if(@currentField.email == @me, 'inline', 'none')",
        "margin-left": "4px",
        "color": "#0078d4",
        "font-size": "11px"
      },
      "txtContent": "(You)"
    }
  ]
}`,
  },

  // ===== ACTION BUTTONS =====
  {
    id: 'approve-reject-buttons',
    name: 'Approve/Reject Buttons',
    description: 'Quick action buttons to update status field with setValue action.',
    category: 'Action Buttons',
    fieldType: 'Choice',
    complexity: 'Advanced',
    parameters: [
      { name: 'statusField', label: 'Status Field Name', type: 'field', defaultValue: 'Status' },
      { name: 'approveValue', label: 'Approve Value', type: 'text', defaultValue: 'Approved' },
      { name: 'rejectValue', label: 'Reject Value', type: 'text', defaultValue: 'Rejected' },
    ],
    requiredFields: ['{{statusField}}'],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "style": {
    "display": "flex",
    "gap": "8px"
  },
  "children": [
    {
      "elmType": "button",
      "txtContent": "Approve",
      "customRowAction": {
        "action": "setValue",
        "actionInput": {
          "{{statusField}}": "{{approveValue}}"
        }
      },
      "style": {
        "background-color": "#107c10",
        "color": "#ffffff",
        "border": "none",
        "padding": "6px 16px",
        "border-radius": "4px",
        "cursor": "pointer",
        "font-weight": "500",
        "font-size": "12px"
      },
      "attributes": {
        "title": "Approve this item"
      }
    },
    {
      "elmType": "button",
      "txtContent": "Reject",
      "customRowAction": {
        "action": "setValue",
        "actionInput": {
          "{{statusField}}": "{{rejectValue}}"
        }
      },
      "style": {
        "background-color": "#d13438",
        "color": "#ffffff",
        "border": "none",
        "padding": "6px 16px",
        "border-radius": "4px",
        "cursor": "pointer",
        "font-weight": "500",
        "font-size": "12px"
      },
      "attributes": {
        "title": "Reject this item"
      }
    }
  ]
}`,
  },
  {
    id: 'toggle-button',
    name: 'Toggle Status Button',
    description: 'Single button that toggles between two status values.',
    category: 'Action Buttons',
    fieldType: 'Choice',
    complexity: 'Advanced',
    parameters: [
      { name: 'statusField', label: 'Status Field Name', type: 'field', defaultValue: 'Status' },
      { name: 'value1', label: 'First Value', type: 'text', defaultValue: 'Active' },
      { name: 'value2', label: 'Second Value', type: 'text', defaultValue: 'Inactive' },
      { name: 'value1Color', label: 'First Value Color', type: 'color', defaultValue: '#107c10' },
      { name: 'value2Color', label: 'Second Value Color', type: 'color', defaultValue: '#605e5c' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "button",
  "txtContent": "=if(@currentField == '{{value1}}', '{{value1}}', '{{value2}}')",
  "customRowAction": {
    "action": "setValue",
    "actionInput": {
      "{{statusField}}": "=if(@currentField == '{{value1}}', '{{value2}}', '{{value1}}')"
    }
  },
  "style": {
    "background-color": "=if(@currentField == '{{value1}}', '{{value1Color}}', '{{value2Color}}')",
    "color": "#ffffff",
    "border": "none",
    "padding": "8px 16px",
    "border-radius": "4px",
    "cursor": "pointer",
    "font-weight": "600",
    "font-size": "12px",
    "min-width": "80px"
  },
  "attributes": {
    "title": "=if(@currentField == '{{value1}}', 'Click to mark as {{value2}}', 'Click to mark as {{value1}}')"
  }
}`,
  },
  {
    id: 'launch-flow-button',
    name: 'Launch Power Automate Flow',
    description: 'Button that triggers a Power Automate flow when clicked.',
    category: 'Action Buttons',
    fieldType: 'Text',
    complexity: 'Advanced',
    parameters: [
      { name: 'flowId', label: 'Flow GUID', type: 'text', defaultValue: 'YOUR-FLOW-GUID-HERE' },
      { name: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Run Flow' },
      { name: 'buttonColor', label: 'Button Color', type: 'color', defaultValue: '#0078d4' },
      { name: 'buttonIcon', label: 'Button Icon', type: 'icon', defaultValue: 'Flow' },
    ],
    requiredFields: [],
    json: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "button",
  "customRowAction": {
    "action": "executeFlow",
    "actionParams": "{\\"id\\":\\"{{flowId}}\\", \\"headerText\\":\\"Run Flow\\", \\"runFlowButtonText\\":\\"Execute\\"}"
  },
  "style": {
    "background-color": "{{buttonColor}}",
    "color": "#ffffff",
    "border": "none",
    "padding": "8px 16px",
    "border-radius": "4px",
    "cursor": "pointer",
    "font-weight": "500",
    "font-size": "12px",
    "display": "flex",
    "align-items": "center",
    "gap": "6px"
  },
  "children": [
    {
      "elmType": "span",
      "attributes": {
        "iconName": "{{buttonIcon}}"
      },
      "style": {
        "font-size": "14px"
      }
    },
    {
      "elmType": "span",
      "txtContent": "{{buttonText}}"
    }
  ]
}`,
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): ColumnFormatterTemplate[] {
  return COLUMN_FORMATTER_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by field type
 */
export function getTemplatesByFieldType(fieldType: FieldType): ColumnFormatterTemplate[] {
  return COLUMN_FORMATTER_TEMPLATES.filter(t => t.fieldType === fieldType);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ColumnFormatterTemplate | undefined {
  return COLUMN_FORMATTER_TEMPLATES.find(t => t.id === id);
}

/**
 * Replace template parameters in JSON
 */
export function applyParametersToTemplate(
  template: ColumnFormatterTemplate,
  parameters: Record<string, string>
): string {
  let json = template.json;

  // Replace all {{paramName}} with actual values
  Object.entries(parameters).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    json = json.replace(regex, value);
  });

  return json;
}
