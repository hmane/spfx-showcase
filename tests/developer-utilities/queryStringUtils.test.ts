import test = require('node:test');
import assert = require('node:assert/strict');
import {
  buildEncodedQueryString,
  buildJsonObjectFromParams,
  extractQueryStringParts,
  getDuplicateParameterNames,
  parseQueryString,
  summarizeQueryParams,
} from '../../src/webparts/developerToolkit/components/DeveloperUtilities/helpers/queryStringUtils';

test('extractQueryStringParts handles full urls', () => {
  const result = extractQueryStringParts('https://contoso.sharepoint.com/sites/demo?List=123&ID=4');
  assert.equal(result.baseUrl, 'https://contoso.sharepoint.com/sites/demo');
  assert.equal(result.queryString, 'List=123&ID=4');
});

test('buildJsonObjectFromParams preserves duplicate keys as arrays', () => {
  const params = parseQueryString('tag=one&tag=two&ID=5');
  const jsonObject = buildJsonObjectFromParams(params);

  assert.deepEqual(jsonObject.tag, ['one', 'two']);
  assert.equal(jsonObject.ID, '5');
});

test('summarizeQueryParams counts sharepoint params and duplicates', () => {
  const params = parseQueryString('List=%7Bguid%7D&ID=5&tag=one&tag=two');
  const stats = summarizeQueryParams(params);
  const duplicates = getDuplicateParameterNames(params);

  assert.equal(stats.sharePointParams, 2);
  assert.equal(stats.duplicateCount, 1);
  assert.deepEqual(duplicates, [{ name: 'tag', count: 2 }]);
});

test('buildEncodedQueryString encodes decoded values consistently', () => {
  const params = parseQueryString('RootFolder=Shared+Documents/Team A&FilterValue1=Active Items');
  const encoded = buildEncodedQueryString(params);

  assert.equal(
    encoded,
    'RootFolder=Shared%20Documents%2FTeam%20A&FilterValue1=Active%20Items'
  );
});
