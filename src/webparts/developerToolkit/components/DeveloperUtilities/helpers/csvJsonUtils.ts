export type JsonOutputFormat = 'objects' | 'arrays';

export interface ICsvJsonConversionResult {
  output: string;
  warning?: string;
}

export function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

export function convertCsvToJson(
  csv: string,
  delimiter: string,
  hasHeaders: boolean,
  outputFormat: JsonOutputFormat,
  prettyPrint: boolean
): ICsvJsonConversionResult {
  if (!csv.trim()) {
    return { output: '' };
  }

  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return { output: '[]' };
  }

  const result: Array<Record<string, string> | string[]> = [];
  let headers: string[] = [];

  if (hasHeaders) {
    headers = parseCsvLine(lines[0], delimiter);
    lines.shift();
  }

  const expectedColumnCount = hasHeaders
    ? headers.length
    : parseCsvLine(lines[0] || '', delimiter).length;

  const inconsistentRows = lines
    .filter(line => line.trim())
    .filter(line => parseCsvLine(line, delimiter).length !== expectedColumnCount);

  lines.forEach(line => {
    if (!line.trim()) {
      return;
    }

    const values = parseCsvLine(line, delimiter);
    if (outputFormat === 'objects' && hasHeaders) {
      const item: Record<string, string> = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      result.push(item);
      return;
    }

    result.push(values);
  });

  return {
    output: prettyPrint ? JSON.stringify(result, null, 2) : JSON.stringify(result),
    warning:
      inconsistentRows.length > 0
        ? `${inconsistentRows.length} row(s) had a different column count and were normalized to match the detected structure.`
        : undefined,
  };
}

export function convertJsonToCsv(
  json: string,
  delimiter: string,
  includeHeader: boolean
): ICsvJsonConversionResult {
  if (!json.trim()) {
    return { output: '' };
  }

  const data = JSON.parse(json) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects or arrays');
  }

  if (data.length === 0) {
    return { output: '' };
  }

  const lines: string[] = [];
  let nestedValueCount = 0;

  const escapeValue = (value: unknown): string => {
    if (value && typeof value === 'object') {
      nestedValueCount += 1;
    }

    const normalized = value === null || value === undefined ? '' : String(value);
    if (normalized.includes(delimiter) || normalized.includes('"') || normalized.includes('\n')) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }

    return normalized;
  };

  const isArrayOfObjects = typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0]);

  if (isArrayOfObjects) {
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const keys = Array.from(allKeys);
    if (includeHeader) {
      lines.push(keys.map(escapeValue).join(delimiter));
    }

    data.forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const record = item as Record<string, unknown>;
        lines.push(keys.map(key => escapeValue(record[key])).join(delimiter));
      }
    });
  } else {
    data.forEach(item => {
      if (Array.isArray(item)) {
        lines.push(item.map(escapeValue).join(delimiter));
      }
    });
  }

  return {
    output: lines.join('\n'),
    warning:
      nestedValueCount > 0
        ? `Nested object or array values were stringified into CSV cells (${nestedValueCount} value(s)).`
        : undefined,
  };
}
