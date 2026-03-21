import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

export const Testing: React.FC<ITabComponentProps> = () => {
  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <MessageBar messageBarType={MessageBarType.info}>
        Test deterministic logic first. In this solution, lightweight helper tests plus TypeScript
        and bundle validation give the best return for most developer utilities and generators.
      </MessageBar>

      <Section title="Current Repo Workflow" icon="TestBeaker" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Prefer pure helper modules for parsing, formatting, and schema generation logic. This
            repo already uses a lightweight Node test runner flow for that kind of code:
          </p>
          <CodeBlock
            code={`// tests/developer-utilities/queryStringUtils.test.ts
import test = require('node:test');
import assert = require('node:assert/strict');
import {
  buildEncodedQueryString,
  parseQueryString,
  summarizeQueryParams,
} from '../../src/webparts/developerToolkit/components/DeveloperUtilities/helpers/queryStringUtils';

test('buildEncodedQueryString encodes decoded values consistently', () => {
  const params = parseQueryString('RootFolder=Shared+Documents/Team A&FilterValue1=Active Items');
  const encoded = buildEncodedQueryString(params);

  assert.equal(
    encoded,
    'RootFolder=Shared%20Documents%2FTeam%20A&FilterValue1=Active%20Items'
  );
});

test('summarizeQueryParams counts SharePoint params', () => {
  const params = parseQueryString('List=%7Bguid%7D&ID=5&tag=one&tag=two');
  const stats = summarizeQueryParams(params);

  assert.equal(stats.sharePointParams, 2);
  assert.equal(stats.duplicateCount, 1);
});`}
            language="typescript"
            showLineNumbers={false}
          />

          <CodeBlock
            code={`# Fast validation loop
npx tsc --noEmit
npm run test:utilities
npm run build`}
            language="bash"
            filename="Validation Commands"
            showLineNumbers={false}
          />
        </div>
      </Section>

      <Section title="Component Testing" icon="TestPlan" defaultExpanded={true}>
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            For UI-heavy flows, keep the logic outside the component where possible and test the
            rendering layer separately with your preferred React test stack.
          </p>
          <CodeBlock
            code={`// Example only - use your team's preferred React test setup
// src/components/MyButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyButton } from './MyButton';

describe('MyButton', () => {
  it('renders with text', () => {
    render(<MyButton text="Click me" onClick={jest.fn()} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MyButton text="Click" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<MyButton text="Click" disabled={true} onClick={jest.fn()} />);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      <Section title="Mocking SharePoint APIs" icon="CloudAdd" defaultExpanded={true}>
        <div>
          <CodeBlock
            code={`// Example only - adjust the mock shape to the API you use
// __mocks__/SPContext.ts
export const SPContext = {
  smart: jest.fn(),
  development: jest.fn(),
  production: jest.fn(),
  sp: {
    web: {
      lists: {
        getByTitle: jest.fn(),
      },
    },
  },
};

// In your test file
import { SPContext } from 'spfx-toolkit/utilities/context';

jest.mock('spfx-toolkit/utilities/context');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches items from SharePoint', async () => {
    const mockItems = [{ id: 1, title: 'Test' }];
    const items = { select: jest.fn().mockReturnThis(), top: jest.fn().mockResolvedValue(mockItems) };
    const list = { items };
    (SPContext.sp.web.lists.getByTitle as jest.Mock).mockReturnValue(list);

    const result = await MyService.getItems();
    expect(result).toEqual(mockItems);
    expect(SPContext.sp.web.lists.getByTitle).toHaveBeenCalledWith('My List');
  });
});`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      <Section title="Coverage Goals" icon="BullseyeTarget" defaultExpanded={false}>
        <div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Overall: &gt;75% coverage</li>
            <li style={{ marginBottom: '8px' }}>Utilities & Services: &gt;90% coverage</li>
            <li style={{ marginBottom: '8px' }}>Components: &gt;70% coverage</li>
            <li style={{ marginBottom: '8px' }}>Focus on testing business logic and critical paths</li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
