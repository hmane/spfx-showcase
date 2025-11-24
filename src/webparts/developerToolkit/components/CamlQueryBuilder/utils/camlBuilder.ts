// src/webparts/showcase/components/CamlQueryBuilder/utils/camlBuilder.ts

import {
  ICAMLQuery,
  ICondition,
  IConditionGroup,
  IOrderByField,
} from '../types/CamlTypes';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a condition is empty (no field selected yet)
 * A condition is considered valid as soon as a field is selected
 */
function isEmptyCondition(condition: ICondition): boolean {
  return !condition.fieldInternalName || condition.fieldInternalName.trim() === '';
}

/**
 * Check if a group has any valid (non-empty) conditions
 * A condition is valid as soon as a field is selected (value can be empty)
 */
export function hasValidConditions(group: IConditionGroup): boolean {
  const hasValidDirectConditions = group.conditions.some(c => !isEmptyCondition(c));
  const hasValidNestedConditions = group.nestedGroups.some(g => hasValidConditions(g));
  return hasValidDirectConditions || hasValidNestedConditions;
}

/**
 * Build CAML XML for a single condition
 */
function buildConditionXML(condition: ICondition, indent: string = '  '): string {
  const { operator, fieldInternalName, value, valueType, useLookupId, includeTimeValue } =
    condition;

  // Operators that don't require a value
  if (operator === 'IsNull' || operator === 'IsNotNull') {
    return `${indent}<${operator}>\n${indent}  <FieldRef Name="${fieldInternalName}"/>\n${indent}</${operator}>`;
  }

  // Handle In operator (multiple values)
  if (operator === 'In') {
    const valueString = value ?? '';
    const values = valueString.split(';').filter((v: string) => v.trim());
    // If no values, still output In with empty Values section
    const valuesXML = values.length > 0
      ? values.map((v: string) => `${indent}    <Value Type="${valueType}">${escapeXML(v.trim())}</Value>`).join('\n')
      : '';

    return `${indent}<In>\n${indent}  <FieldRef Name="${fieldInternalName}"/>\n${indent}  <Values>\n${valuesXML}\n${indent}  </Values>\n${indent}</In>`;
  }

  // Build FieldRef with optional attributes
  let fieldRef = `<FieldRef Name="${fieldInternalName}"`;
  if (useLookupId) {
    fieldRef += ' LookupId="TRUE"';
  }
  fieldRef += '/>';

  // Build Value with optional attributes
  let valueTag = `<Value Type="${valueType}"`;
  if (valueType === 'DateTime' && includeTimeValue !== undefined) {
    valueTag += ` IncludeTimeValue="${includeTimeValue ? 'TRUE' : 'FALSE'}"`;
  }

  // Handle special tokens (don't escape) - ensure value is a string first
  const valueStr = value ?? '';
  const isToken = valueStr.startsWith('<') && valueStr.endsWith('/>');
  if (isToken) {
    valueTag += `>${valueStr}</Value>`;
  } else {
    valueTag += `>${escapeXML(valueStr)}</Value>`;
  }

  return `${indent}<${operator}>\n${indent}  ${fieldRef}\n${indent}  ${valueTag}\n${indent}</${operator}>`;
}

/**
 * Build CAML XML for a condition group (handles And/Or with nesting)
 * CRITICAL: And/Or can only have 2 children, so we nest automatically
 */
function buildGroupXML(group: IConditionGroup, indent: string = '  '): string {
  const { operator, conditions, nestedGroups } = group;

  // Filter out empty conditions (where field is not selected)
  const validConditions = conditions.filter(c => c.fieldInternalName && c.fieldInternalName.trim() !== '');

  // Combine valid conditions and nested groups into a single array
  const allChildren: (ICondition | IConditionGroup)[] = [...validConditions, ...nestedGroups];

  if (allChildren.length === 0) {
    return '';
  }

  // Single child - no logical operator needed
  if (allChildren.length === 1) {
    const child = allChildren[0];
    if ('operator' in child && 'conditions' in child) {
      // It's a nested group
      return buildGroupXML(child, indent);
    } else {
      // It's a condition
      return buildConditionXML(child as ICondition, indent);
    }
  }

  // Two children - simple And/Or
  if (allChildren.length === 2) {
    const child1 = allChildren[0];
    const child2 = allChildren[1];

    const child1XML =
      'operator' in child1 && 'conditions' in child1
        ? buildGroupXML(child1 as IConditionGroup, indent + '  ')
        : buildConditionXML(child1 as ICondition, indent + '  ');

    const child2XML =
      'operator' in child2 && 'conditions' in child2
        ? buildGroupXML(child2 as IConditionGroup, indent + '  ')
        : buildConditionXML(child2 as ICondition, indent + '  ');

    return `${indent}<${operator}>\n${child1XML}\n${child2XML}\n${indent}</${operator}>`;
  }

  // Three or more children - nest recursively
  // Pattern: <Op> child1 <Op> child2 <Op> ... childN </Op> </Op> </Op>
  const firstChild = allChildren[0];
  const remainingChildren = allChildren.slice(1);

  const firstChildXML =
    'operator' in firstChild && 'conditions' in firstChild
      ? buildGroupXML(firstChild as IConditionGroup, indent + '  ')
      : buildConditionXML(firstChild as ICondition, indent + '  ');

  // Create a temporary group for remaining children
  const remainingGroup: IConditionGroup = {
    id: generateId(),
    operator,
    conditions: remainingChildren.filter(
      c => !('operator' in c && 'conditions' in c)
    ) as ICondition[],
    nestedGroups: remainingChildren.filter(
      c => 'operator' in c && 'conditions' in c
    ) as IConditionGroup[],
  };

  const remainingXML = buildGroupXML(remainingGroup, indent + '  ');

  return `${indent}<${operator}>\n${firstChildXML}\n${remainingXML}\n${indent}</${operator}>`;
}

/**
 * Build OrderBy XML
 */
function buildOrderByXML(orderBy: IOrderByField[], indent: string = '    '): string {
  if (orderBy.length === 0) {
    return '';
  }

  const fieldsXML = orderBy
    .map(
      field =>
        `${indent}  <FieldRef Name="${field.fieldInternalName}" Ascending="${field.ascending ? 'TRUE' : 'FALSE'}"/>`
    )
    .join('\n');

  return `${indent}<OrderBy>\n${fieldsXML}\n${indent}</OrderBy>`;
}

/**
 * Build ViewFields XML
 */
function buildViewFieldsXML(viewFields: string[], indent: string = '  '): string {
  if (viewFields.length === 0) {
    return '';
  }

  const fieldsXML = viewFields
    .map(field => `${indent}  <FieldRef Name="${field}"/>`)
    .join('\n');

  return `${indent}<ViewFields>\n${fieldsXML}\n${indent}</ViewFields>`;
}

/**
 * Build complete CAML Query XML
 */
export function buildCAMLQuery(query: ICAMLQuery): string {
  const parts: string[] = ['<View>'];

  // Build Query section
  const queryParts: string[] = ['  <Query>'];

  // Where clause - only add if there are valid (non-empty) conditions
  if (query.where && hasValidConditions(query.where)) {
    const whereXML = buildGroupXML(query.where, '      ');
    // Only add Where clause if we have actual content
    if (whereXML && whereXML.trim()) {
      queryParts.push('    <Where>');
      queryParts.push(whereXML);
      queryParts.push('    </Where>');
    }
  }

  // OrderBy clause
  if (query.orderBy && query.orderBy.length > 0) {
    queryParts.push(buildOrderByXML(query.orderBy));
  }

  queryParts.push('  </Query>');
  parts.push(...queryParts);

  // ViewFields
  if (query.viewFields && query.viewFields.length > 0) {
    parts.push(buildViewFieldsXML(query.viewFields));
  }

  // RowLimit
  if (query.rowLimit && query.rowLimit > 0) {
    parts.push(`  <RowLimit>${query.rowLimit}</RowLimit>`);
  }

  parts.push('</View>');

  return parts.join('\n');
}

/**
 * Build WHERE clause only (for embedding in existing queries)
 */
export function buildWhereClause(group: IConditionGroup): string {
  if (!group || (group.conditions.length === 0 && group.nestedGroups.length === 0)) {
    return '';
  }

  const whereContent = buildGroupXML(group, '  ');
  return `<Where>\n${whereContent}\n</Where>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  if (typeof str !== 'string') {
    return String(str);
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validate CAML query structure
 * Only validates conditions that have a field selected (ignores empty placeholder conditions)
 */
export function validateCAMLQuery(query: ICAMLQuery): string[] {
  const errors: string[] = [];

  // Validate conditions - only if there are non-empty conditions
  if (query.where && hasValidConditions(query.where)) {
    validateGroup(query.where, errors);
  }

  // Validate OrderBy fields
  if (query.orderBy) {
    query.orderBy.forEach((field, index) => {
      if (!field.fieldInternalName || field.fieldInternalName.trim() === '') {
        errors.push(`Sort field #${index + 1} has no field selected`);
      }
    });
  }

  // Validate ViewFields - silently ignore empty ones
  if (query.viewFields) {
    const emptyFields = query.viewFields.filter(f => !f || f.trim() === '');
    if (emptyFields.length > 0) {
      errors.push(`${emptyFields.length} ViewField(s) are empty`);
    }
  }

  // Validate RowLimit
  if (query.rowLimit !== undefined && query.rowLimit !== null) {
    if (query.rowLimit < 1) {
      errors.push('Row limit must be at least 1');
    }
    if (query.rowLimit > 5000) {
      errors.push('Row limit exceeds 5000 (SharePoint list view threshold)');
    }
  }

  return errors;
}

function validateGroup(group: IConditionGroup, errors: string[]): void {
  // Validate only non-empty conditions (conditions with a field selected)
  group.conditions
    .filter(c => !isEmptyCondition(c)) // Skip empty conditions
    .forEach((condition) => {
      const conditionNum = group.conditions.indexOf(condition) + 1;

      if (!condition.operator) {
        errors.push(`Condition #${conditionNum}: No operator selected`);
      }

      // Empty values are valid for most operators (searching for empty field values)
      // Only "In" operator requires at least one value to make sense

      // Validate Boolean values - only if value is provided
      if (condition.valueType === 'Boolean' && condition.value && condition.value !== '0' && condition.value !== '1') {
        errors.push(
          `Condition #${conditionNum}: Boolean value must be 0 (No) or 1 (Yes)`
        );
      }

      // Validate In operator - requires at least one value
      if (condition.operator === 'In') {
        const values = String(condition.value ?? '').split(';').filter(v => v.trim());
        if (values.length === 0) {
          errors.push(`Condition #${conditionNum}: "In" operator requires at least one value`);
        }
        if (values.length > 500) {
          errors.push(`Condition #${conditionNum}: "In" operator supports max 500 values (found ${values.length})`);
        }
      }
    });

  // Validate nested groups recursively
  group.nestedGroups.forEach(nestedGroup => {
    validateGroup(nestedGroup, errors);
  });
}

/**
 * Create empty condition
 */
export function createEmptyCondition(): ICondition {
  return {
    id: generateId(),
    fieldInternalName: '',
    fieldType: 'Text',
    operator: 'Eq',
    value: '',
    valueType: 'Text',
  };
}

/**
 * Create empty condition group
 */
export function createEmptyGroup(operator: 'AND' | 'OR' = 'AND'): IConditionGroup {
  return {
    id: generateId(),
    operator,
    conditions: [createEmptyCondition()],
    nestedGroups: [],
  };
}
