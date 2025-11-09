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
    const values = value.split(';').filter((v: string) => v.trim());
    const valuesXML = values
      .map((v: string) => `${indent}    <Value Type="${valueType}">${escapeXML(v.trim())}</Value>`)
      .join('\n');

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

  // Handle special tokens (don't escape)
  const isToken = value.startsWith('<') && value.endsWith('/>');
  if (isToken) {
    valueTag += `>${value}</Value>`;
  } else {
    valueTag += `>${escapeXML(value)}</Value>`;
  }

  return `${indent}<${operator}>\n${indent}  ${fieldRef}\n${indent}  ${valueTag}\n${indent}</${operator}>`;
}

/**
 * Build CAML XML for a condition group (handles And/Or with nesting)
 * CRITICAL: And/Or can only have 2 children, so we nest automatically
 */
function buildGroupXML(group: IConditionGroup, indent: string = '  '): string {
  const { operator, conditions, nestedGroups } = group;

  // Combine conditions and nested groups into a single array
  const allChildren: (ICondition | IConditionGroup)[] = [...conditions, ...nestedGroups];

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

  // Where clause
  if (query.where && (query.where.conditions.length > 0 || query.where.nestedGroups.length > 0)) {
    const whereXML = buildGroupXML(query.where, '      ');
    queryParts.push('    <Where>');
    queryParts.push(whereXML);
    queryParts.push('    </Where>');
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
 */
export function validateCAMLQuery(query: ICAMLQuery): string[] {
  const errors: string[] = [];

  // Validate conditions
  if (query.where) {
    validateGroup(query.where, errors);
  }

  // Validate OrderBy fields
  if (query.orderBy) {
    query.orderBy.forEach((field, index) => {
      if (!field.fieldInternalName || field.fieldInternalName.trim() === '') {
        errors.push(`OrderBy field #${index + 1} has no field name`);
      }
    });
  }

  // Validate ViewFields
  if (query.viewFields) {
    query.viewFields.forEach((field, index) => {
      if (!field || field.trim() === '') {
        errors.push(`ViewField #${index + 1} is empty`);
      }
    });
  }

  // Validate RowLimit
  if (query.rowLimit !== undefined && query.rowLimit !== null) {
    if (query.rowLimit < 1) {
      errors.push('RowLimit must be at least 1');
    }
    if (query.rowLimit > 5000) {
      errors.push('RowLimit should not exceed 5000 (list view threshold)');
    }
  }

  return errors;
}

function validateGroup(group: IConditionGroup, errors: string[]): void {
  // Validate conditions
  group.conditions.forEach((condition, index) => {
    if (!condition.fieldInternalName || condition.fieldInternalName.trim() === '') {
      errors.push(`Condition #${index + 1} has no field selected`);
    }

    if (!condition.operator) {
      errors.push(`Condition #${index + 1} has no operator selected`);
    }

    // Check if operator requires a value
    const requiresValue = !['IsNull', 'IsNotNull'].includes(condition.operator);
    if (requiresValue && (condition.value === undefined || condition.value === null || condition.value === '')) {
      errors.push(`Condition #${index + 1} requires a value for operator ${condition.operator}`);
    }

    // Validate Boolean values
    if (condition.valueType === 'Boolean' && condition.value !== '0' && condition.value !== '1') {
      errors.push(
        `Condition #${index + 1}: Boolean values must be 0 or 1, not "true" or "false"`
      );
    }

    // Validate In operator
    if (condition.operator === 'In') {
      const values = String(condition.value).split(';').filter(v => v.trim());
      if (values.length === 0) {
        errors.push(`Condition #${index + 1}: In operator requires at least one value`);
      }
      if (values.length > 500) {
        errors.push(`Condition #${index + 1}: In operator supports maximum 500 values`);
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
