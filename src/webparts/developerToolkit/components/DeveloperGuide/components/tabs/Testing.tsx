import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

export const Testing: React.FC<ITabComponentProps> = () => {
  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <MessageBar messageBarType={MessageBarType.info}>
        Write tests to ensure code quality and prevent regressions. Aim for &gt;75% code coverage.
      </MessageBar>

      <Section title="Unit Testing with Jest" icon="TestBeaker" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Test utility functions and business logic:
          </p>
          <CodeBlock
            code={`// src/utils/formatters.test.ts
import { formatCurrency, formatDate } from './formatters';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats date in MM/DD/YYYY', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('01/15/2024');
  });
});`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      <Section title="Component Testing with React Testing Library" icon="TestPlan" defaultExpanded={true}>
        <div>
          <CodeBlock
            code={`// src/components/MyButton.test.tsx
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
            code={`// __mocks__/SPContext.ts
export const SPContext = {
  Init: jest.fn(),
  GetItems: jest.fn(),
  CreateItem: jest.fn(),
  UpdateItem: jest.fn(),
  DeleteItem: jest.fn(),
};

// In your test file
import { SPContext } from 'spfx-toolkit';

jest.mock('spfx-toolkit');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches items from SharePoint', async () => {
    const mockItems = [{ id: 1, title: 'Test' }];
    (SPContext.GetItems as jest.Mock).mockResolvedValue(mockItems);

    const result = await MyService.getItems();
    expect(result).toEqual(mockItems);
    expect(SPContext.GetItems).toHaveBeenCalledWith({
      listTitle: 'My List',
      fields: ['Id', 'Title'],
    });
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
