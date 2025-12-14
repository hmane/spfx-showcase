// src/webparts/developerToolkit/components/CamlQueryBuilder/utils/camlParser.ts

import {
  ICAMLQuery,
  ICondition,
  IConditionGroup,
  IOrderByField,
  CAMLOperator,
  CAMLValueType,
} from '../types/CamlTypes';
import { generateId } from './camlBuilder';

export interface IParseResult {
  success: boolean;
  query?: ICAMLQuery;
  error?: string;
  warnings?: string[];
}

/**
 * Parse CAML XML string into structured query object
 */
export function parseCAMLXML(camlXML: string): IParseResult {
  const warnings: string[] = [];

  try {
    // Clean and normalize the XML
    const cleanXML = camlXML.trim();
    if (!cleanXML) {
      return { success: false, error: 'Empty CAML XML provided' };
    }

    // Parse XML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanXML, 'application/xml');

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return {
        success: false,
        error: `XML parsing error: ${parseError.textContent?.substring(0, 200)}`,
      };
    }

    // Find the root element - could be View, Query, or Where
    const viewElement = doc.querySelector('View');
    const queryElement = doc.querySelector('Query');
    const whereElement = doc.querySelector('Where');

    // Initialize query parts
    let rootGroup: IConditionGroup | undefined;
    let orderBy: IOrderByField[] = [];
    let viewFields: string[] = [];
    let rowLimit: number | null = null;

    // Parse Where clause
    const whereClause = viewElement?.querySelector('Where') ||
                        queryElement?.querySelector('Where') ||
                        whereElement;

    if (whereClause && whereClause.children.length > 0) {
      const parseResult = parseWhereElement(whereClause, warnings);
      if (parseResult) {
        rootGroup = parseResult;
      }
    }

    // Parse OrderBy
    const orderByElement = viewElement?.querySelector('OrderBy') ||
                           queryElement?.querySelector('OrderBy');
    if (orderByElement) {
      orderBy = parseOrderByElement(orderByElement);
    }

    // Parse ViewFields
    const viewFieldsElement = viewElement?.querySelector('ViewFields');
    if (viewFieldsElement) {
      viewFields = parseViewFieldsElement(viewFieldsElement);
    }

    // Parse RowLimit
    const rowLimitElement = viewElement?.querySelector('RowLimit');
    if (rowLimitElement) {
      const limitText = rowLimitElement.textContent?.trim();
      if (limitText) {
        const parsed = parseInt(limitText, 10);
        if (!isNaN(parsed) && parsed > 0) {
          rowLimit = parsed;
        }
      }
    }

    // Build result
    const query: ICAMLQuery = {
      where: rootGroup || createEmptyGroup(),
      orderBy,
      viewFields,
      rowLimit,
    };

    return {
      success: true,
      query,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse CAML: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Parse Where element and return condition group
 */
function parseWhereElement(whereElement: Element, warnings: string[]): IConditionGroup | undefined {
  // Get the first child element (should be And, Or, or a condition operator)
  const firstChild = whereElement.children[0];
  if (!firstChild) {
    return undefined;
  }

  return parseElement(firstChild, warnings);
}

/**
 * Parse an element recursively (can be And, Or, or a condition)
 */
function parseElement(element: Element, warnings: string[]): IConditionGroup | undefined {
  const tagName = element.tagName;

  // Handle logical operators (And, Or)
  if (tagName === 'And' || tagName === 'Or') {
    return parseLogicalGroup(element, tagName as 'And' | 'Or', warnings);
  }

  // Handle condition operators
  if (isConditionOperator(tagName)) {
    const condition = parseConditionElement(element, tagName as CAMLOperator, warnings);
    if (condition) {
      // Wrap single condition in a group
      return {
        id: generateId(),
        operator: 'AND',
        conditions: [condition],
        nestedGroups: [],
      };
    }
  }

  warnings.push(`Unknown element: ${tagName}`);
  return undefined;
}

/**
 * Parse And/Or logical group
 */
function parseLogicalGroup(
  element: Element,
  operator: 'And' | 'Or',
  warnings: string[]
): IConditionGroup {
  const group: IConditionGroup = {
    id: generateId(),
    operator: operator === 'And' ? 'AND' : 'OR',
    conditions: [],
    nestedGroups: [],
  };

  // Process each child element
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    const childTagName = child.tagName;

    if (childTagName === 'And' || childTagName === 'Or') {
      // Nested logical group
      const nestedGroup = parseLogicalGroup(child, childTagName as 'And' | 'Or', warnings);
      group.nestedGroups.push(nestedGroup);
    } else if (isConditionOperator(childTagName)) {
      // Condition
      const condition = parseConditionElement(child, childTagName as CAMLOperator, warnings);
      if (condition) {
        group.conditions.push(condition);
      }
    } else {
      warnings.push(`Unexpected element in ${operator}: ${childTagName}`);
    }
  }

  return group;
}

/**
 * Parse a condition element (Eq, Neq, Contains, etc.)
 */
function parseConditionElement(
  element: Element,
  operator: CAMLOperator,
  warnings: string[]
): ICondition | undefined {
  // Get FieldRef
  const fieldRef = element.querySelector('FieldRef');
  if (!fieldRef) {
    warnings.push(`${operator} element missing FieldRef`);
    return undefined;
  }

  const fieldName = fieldRef.getAttribute('Name');
  if (!fieldName) {
    warnings.push(`FieldRef missing Name attribute`);
    return undefined;
  }

  // Check for LookupId attribute
  const lookupIdAttr = fieldRef.getAttribute('LookupId');
  const useLookupId = lookupIdAttr?.toUpperCase() === 'TRUE';

  // Get Value element (not required for IsNull/IsNotNull)
  const valueElement = element.querySelector('Value');
  let value: string = '';
  let valueType: CAMLValueType = 'Text';
  let includeTimeValue: boolean | undefined;

  if (valueElement) {
    // Get value type
    const typeAttr = valueElement.getAttribute('Type');
    if (typeAttr) {
      valueType = typeAttr as CAMLValueType;
    }

    // Check for IncludeTimeValue
    const includeTimeAttr = valueElement.getAttribute('IncludeTimeValue');
    if (includeTimeAttr) {
      includeTimeValue = includeTimeAttr.toUpperCase() === 'TRUE';
    }

    // Get value content - check for special tokens like <Today/>, <UserID/>
    const innerXML = valueElement.innerHTML.trim();
    if (innerXML.startsWith('<') && innerXML.endsWith('/>')) {
      // It's a special token
      value = innerXML;
    } else {
      value = unescapeXML(valueElement.textContent || '');
    }
  }

  // Handle In operator (multiple values)
  if (operator === 'In') {
    const valuesElement = element.querySelector('Values');
    if (valuesElement) {
      const valueElements = valuesElement.querySelectorAll('Value');
      const values: string[] = [];
      valueElements.forEach(ve => {
        const v = unescapeXML(ve.textContent || '');
        if (v) values.push(v);
        // Get type from first value
        if (values.length === 1) {
          const type = ve.getAttribute('Type');
          if (type) valueType = type as CAMLValueType;
        }
      });
      value = values.join(';');
    }
  }

  return {
    id: generateId(),
    fieldInternalName: fieldName,
    fieldType: 'Text', // Will be updated when matched with actual field
    operator,
    value,
    valueType,
    useLookupId,
    includeTimeValue,
  };
}

/**
 * Parse OrderBy element
 */
function parseOrderByElement(orderByElement: Element): IOrderByField[] {
  const orderBy: IOrderByField[] = [];

  const fieldRefs = orderByElement.querySelectorAll('FieldRef');
  fieldRefs.forEach(fieldRef => {
    const name = fieldRef.getAttribute('Name');
    if (name) {
      const ascending = fieldRef.getAttribute('Ascending')?.toUpperCase() !== 'FALSE';
      orderBy.push({
        fieldInternalName: name,
        ascending,
      });
    }
  });

  return orderBy;
}

/**
 * Parse ViewFields element
 */
function parseViewFieldsElement(viewFieldsElement: Element): string[] {
  const fields: string[] = [];

  const fieldRefs = viewFieldsElement.querySelectorAll('FieldRef');
  fieldRefs.forEach(fieldRef => {
    const name = fieldRef.getAttribute('Name');
    if (name) {
      fields.push(name);
    }
  });

  return fields;
}

/**
 * Check if tag name is a valid condition operator
 */
function isConditionOperator(tagName: string): boolean {
  const operators: string[] = [
    'Eq', 'Neq', 'Gt', 'Lt', 'Geq', 'Leq',
    'Contains', 'BeginsWith',
    'IsNull', 'IsNotNull',
    'In', 'Includes', 'NotIncludes',
    'Membership', 'DateRangesOverlap',
  ];
  return operators.includes(tagName);
}

/**
 * Create empty condition group
 */
function createEmptyGroup(): IConditionGroup {
  return {
    id: generateId(),
    operator: 'AND',
    conditions: [{
      id: generateId(),
      fieldInternalName: '',
      fieldType: 'Text',
      operator: 'Eq',
      value: '',
      valueType: 'Text',
    }],
    nestedGroups: [],
  };
}

/**
 * Unescape XML entities
 */
function unescapeXML(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Validate and match parsed conditions with available fields
 */
export function matchConditionsWithFields(
  query: ICAMLQuery,
  availableFields: { internalName: string; typeAsString: string }[]
): { query: ICAMLQuery; unmatchedFields: string[] } {
  const unmatchedFields: string[] = [];
  const fieldMap = new Map(availableFields.map(f => [f.internalName.toLowerCase(), f]));

  function updateCondition(condition: ICondition): ICondition {
    const field = fieldMap.get(condition.fieldInternalName.toLowerCase());
    if (field) {
      return {
        ...condition,
        fieldInternalName: field.internalName, // Use correct casing
        fieldType: field.typeAsString as any,
      };
    } else {
      if (!unmatchedFields.includes(condition.fieldInternalName)) {
        unmatchedFields.push(condition.fieldInternalName);
      }
      return condition;
    }
  }

  function updateGroup(group: IConditionGroup): IConditionGroup {
    return {
      ...group,
      conditions: group.conditions.map(updateCondition),
      nestedGroups: group.nestedGroups.map(updateGroup),
    };
  }

  const updatedQuery: ICAMLQuery = {
    ...query,
    where: query.where ? updateGroup(query.where) : undefined,
  };

  return { query: updatedQuery, unmatchedFields };
}
