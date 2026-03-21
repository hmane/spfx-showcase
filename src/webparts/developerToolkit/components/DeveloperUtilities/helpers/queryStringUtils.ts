export interface IQueryParam {
  key: string;
  name: string;
  value: string;
  decodedName: string;
  decodedValue: string;
}

export interface IQueryStringParts {
  baseUrl: string;
  queryString: string;
}

export interface IQueryStats {
  total: number;
  sharePointParams: number;
  guidValues: number;
  duplicateCount: number;
}

export function isGuid(value: string): boolean {
  return /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/.test(value);
}

export function isSharePointParam(name: string): boolean {
  const sharePointParams = [
    'List',
    'RootFolder',
    'View',
    'FilterField1',
    'FilterValue1',
    'FilterType1',
    'viewid',
    'listid',
    'id',
    'ItemId',
    'ID',
    'SourceUrl',
  ];

  return sharePointParams.some(param => param.toLowerCase() === name.toLowerCase());
}

export function extractQueryStringParts(input: string): IQueryStringParts {
  if (!input.trim()) {
    return { baseUrl: '', queryString: '' };
  }

  const trimmed = input.trim();
  if (trimmed.match(/^https?:\/\//)) {
    try {
      const url = new URL(trimmed);
      return {
        baseUrl: `${url.origin}${url.pathname}`,
        queryString: url.search.startsWith('?') ? url.search.substring(1) : url.search,
      };
    } catch {
      return { baseUrl: '', queryString: '' };
    }
  }

  if (trimmed.startsWith('?') || trimmed.startsWith('&')) {
    return { baseUrl: '', queryString: trimmed.substring(1) };
  }

  const questionMarkIndex = trimmed.indexOf('?');
  if (questionMarkIndex !== -1) {
    return {
      baseUrl: trimmed.substring(0, questionMarkIndex),
      queryString: trimmed.substring(questionMarkIndex + 1),
    };
  }

  if (trimmed.includes('=')) {
    return { baseUrl: '', queryString: trimmed };
  }

  return { baseUrl: trimmed, queryString: '' };
}

export function parseQueryString(queryString: string): IQueryParam[] {
  if (!queryString.trim()) {
    return [];
  }

  return queryString
    .split('&')
    .filter(pair => pair.trim())
    .map((pair, index) => {
      const equalIndex = pair.indexOf('=');
      const name = equalIndex === -1 ? pair : pair.substring(0, equalIndex);
      const value = equalIndex === -1 ? '' : pair.substring(equalIndex + 1);
      const nameWithSpaces = name.replace(/\+/g, ' ');
      const valueWithSpaces = value.replace(/\+/g, ' ');

      return {
        key: `param-${index}`,
        name,
        value,
        decodedName: tryDecode(nameWithSpaces),
        decodedValue: tryDecode(valueWithSpaces),
      };
    });
}

export function buildEncodedQueryString(params: IQueryParam[]): string {
  return params
    .map(param => `${encodeURIComponent(param.decodedName)}=${encodeURIComponent(param.decodedValue)}`)
    .join('&');
}

export function buildJsonObjectFromParams(params: IQueryParam[]): Record<string, string | string[]> {
  return params.reduce<Record<string, string | string[]>>((accumulator, param) => {
    const existing = accumulator[param.decodedName];

    if (existing === undefined) {
      accumulator[param.decodedName] = param.decodedValue;
    } else if (Array.isArray(existing)) {
      existing.push(param.decodedValue);
    } else {
      accumulator[param.decodedName] = [existing, param.decodedValue];
    }

    return accumulator;
  }, {});
}

export function getDuplicateParameterNames(params: IQueryParam[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  params.forEach(param => {
    counts.set(param.decodedName, (counts.get(param.decodedName) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }));
}

export function summarizeQueryParams(params: IQueryParam[]): IQueryStats {
  return {
    total: params.length,
    sharePointParams: params.filter(param => isSharePointParam(param.decodedName)).length,
    guidValues: params.filter(param => isGuid(param.decodedValue)).length,
    duplicateCount: getDuplicateParameterNames(params).length,
  };
}

function tryDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
