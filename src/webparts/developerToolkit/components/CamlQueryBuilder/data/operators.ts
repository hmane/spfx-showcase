// src/webparts/showcase/components/CamlQueryBuilder/data/operators.ts

import { CAMLOperator, FieldType, IOperatorInfo, ISpecialValue } from '../types/CamlTypes';

export const OPERATOR_INFO: Record<CAMLOperator, IOperatorInfo> = {
  Eq: {
    value: 'Eq',
    label: 'Equals',
    description: 'Field equals value',
    requiresValue: true,
  },
  Neq: {
    value: 'Neq',
    label: 'Not Equal',
    description: 'Field does not equal value',
    requiresValue: true,
  },
  Gt: {
    value: 'Gt',
    label: 'Greater Than',
    description: 'Field is greater than value',
    requiresValue: true,
  },
  Lt: {
    value: 'Lt',
    label: 'Less Than',
    description: 'Field is less than value',
    requiresValue: true,
  },
  Geq: {
    value: 'Geq',
    label: 'Greater Than or Equal',
    description: 'Field is greater than or equal to value',
    requiresValue: true,
  },
  Leq: {
    value: 'Leq',
    label: 'Less Than or Equal',
    description: 'Field is less than or equal to value',
    requiresValue: true,
  },
  Contains: {
    value: 'Contains',
    label: 'Contains',
    description: 'Field contains substring',
    requiresValue: true,
  },
  BeginsWith: {
    value: 'BeginsWith',
    label: 'Begins With',
    description: 'Field starts with value',
    requiresValue: true,
  },
  IsNull: {
    value: 'IsNull',
    label: 'Is Empty',
    description: 'Field is null or empty',
    requiresValue: false,
  },
  IsNotNull: {
    value: 'IsNotNull',
    label: 'Is Not Empty',
    description: 'Field is not null or empty',
    requiresValue: false,
  },
  In: {
    value: 'In',
    label: 'In (Multiple Values)',
    description: 'Field is one of multiple values (max 500)',
    requiresValue: true,
  },
  Includes: {
    value: 'Includes',
    label: 'Includes',
    description: 'Multi-value field includes value',
    requiresValue: true,
  },
  NotIncludes: {
    value: 'NotIncludes',
    label: 'Not Includes',
    description: 'Multi-value field does not include value',
    requiresValue: true,
  },
  Membership: {
    value: 'Membership',
    label: 'Membership',
    description: 'Check user group membership',
    requiresValue: true,
  },
};

export const FIELD_TYPE_OPERATORS: Record<FieldType, CAMLOperator[]> = {
  Text: ['Eq', 'Neq', 'Contains', 'BeginsWith', 'IsNull', 'IsNotNull'],
  Note: ['Eq', 'Neq', 'Contains', 'BeginsWith', 'IsNull', 'IsNotNull'],
  Number: ['Eq', 'Neq', 'Gt', 'Lt', 'Geq', 'Leq', 'IsNull', 'IsNotNull'],
  Currency: ['Eq', 'Neq', 'Gt', 'Lt', 'Geq', 'Leq', 'IsNull', 'IsNotNull'],
  Integer: ['Eq', 'Neq', 'Gt', 'Lt', 'Geq', 'Leq', 'IsNull', 'IsNotNull'],
  Counter: ['Eq', 'Neq', 'Gt', 'Lt', 'Geq', 'Leq'],
  DateTime: ['Eq', 'Neq', 'Gt', 'Lt', 'Geq', 'Leq', 'IsNull', 'IsNotNull'],
  Boolean: ['Eq', 'Neq'],
  User: ['Eq', 'Neq', 'Contains', 'IsNull', 'IsNotNull', 'Membership'],
  Lookup: ['Eq', 'Neq', 'Contains', 'In', 'IsNull', 'IsNotNull'],
  Choice: ['Eq', 'Neq', 'In', 'IsNull', 'IsNotNull'],
  MultiChoice: ['Includes', 'NotIncludes', 'IsNull', 'IsNotNull'],
  URL: ['Eq', 'Neq', 'Contains', 'BeginsWith', 'IsNull', 'IsNotNull'],
  Guid: ['Eq', 'Neq', 'IsNull', 'IsNotNull'],
  TaxonomyFieldType: ['Eq', 'Neq', 'IsNull', 'IsNotNull'],
  TaxonomyFieldTypeMulti: ['Includes', 'NotIncludes', 'IsNull', 'IsNotNull'],
};

export const SPECIAL_VALUES: Record<string, ISpecialValue[]> = {
  DateTime: [
    {
      label: '[Today]',
      value: '<Today/>',
      description: 'Current date (no time)',
      type: 'token',
    },
    {
      label: '[Today] - 7 days',
      value: '<Today OffsetDays="-7"/>',
      description: 'One week ago',
      type: 'token',
    },
    {
      label: '[Today] + 7 days',
      value: '<Today OffsetDays="7"/>',
      description: 'One week from now',
      type: 'token',
    },
    {
      label: '[Now]',
      value: '<Now/>',
      description: 'Current date and time',
      type: 'token',
    },
  ],
  User: [
    {
      label: '[Current User ID]',
      value: '<UserID/>',
      description: 'ID of current user',
      type: 'token',
    },
    {
      label: '[Me]',
      value: '[Me]',
      description: 'Current user (text)',
      type: 'token',
    },
  ],
  Number: [],
  Text: [],
};

export function getOperatorsForFieldType(fieldType: FieldType): CAMLOperator[] {
  return FIELD_TYPE_OPERATORS[fieldType] || ['Eq', 'Neq', 'IsNull', 'IsNotNull'];
}

export function getValueTypeForFieldType(fieldType: FieldType): string {
  const typeMap: Record<FieldType, string> = {
    Text: 'Text',
    Note: 'Text',
    Number: 'Number',
    Currency: 'Currency',
    Integer: 'Integer',
    Counter: 'Integer',
    DateTime: 'DateTime',
    Boolean: 'Boolean',
    User: 'User',
    Lookup: 'Lookup',
    Choice: 'Choice',
    MultiChoice: 'Choice',
    URL: 'Text',
    Guid: 'Guid',
    TaxonomyFieldType: 'Text',
    TaxonomyFieldTypeMulti: 'Text',
  };
  return typeMap[fieldType] || 'Text';
}

export function getSpecialValuesForFieldType(fieldType: FieldType): ISpecialValue[] {
  if (fieldType === 'DateTime') {
    return SPECIAL_VALUES.DateTime;
  }
  if (fieldType === 'User') {
    return SPECIAL_VALUES.User;
  }
  return [];
}
