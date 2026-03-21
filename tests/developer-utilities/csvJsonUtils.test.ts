import test = require('node:test');
import assert = require('node:assert/strict');
import {
  convertCsvToJson,
  convertJsonToCsv,
  parseCsvLine,
} from '../../src/webparts/developerToolkit/components/DeveloperUtilities/helpers/csvJsonUtils';

test('parseCsvLine keeps quoted delimiters intact', () => {
  assert.deepEqual(parseCsvLine('Title,"A,B",Status', ','), ['Title', 'A,B', 'Status']);
});

test('convertCsvToJson returns warning for inconsistent row widths', () => {
  const result = convertCsvToJson('A,B\n1,2\n3', ',', true, 'objects', true);
  assert.match(result.output, /"A": "3"/);
  assert.match(result.warning || '', /different column count/i);
});

test('convertJsonToCsv groups nested values into warning output', () => {
  const result = convertJsonToCsv(
    JSON.stringify([{ Title: 'Demo', Metadata: { status: 'Active' } }]),
    ',',
    true
  );

  assert.match(result.output, /Demo/);
  assert.match(result.warning || '', /stringified into CSV cells/i);
});

test('convertJsonToCsv escapes delimiters and quotes in cell values', () => {
  const result = convertJsonToCsv(
    JSON.stringify([{ Title: 'Demo, "Alpha"' }]),
    ',',
    true
  );

  assert.equal(result.output, 'Title\n"Demo, ""Alpha"""');
});
