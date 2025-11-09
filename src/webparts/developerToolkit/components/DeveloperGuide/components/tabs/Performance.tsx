import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

export const Performance: React.FC<ITabComponentProps> = () => {
  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <MessageBar messageBarType={MessageBarType.info}>
        Optimize your SPFx solutions for fast load times and smooth user experience.
      </MessageBar>

      <Section title="Bundle Size Optimization" icon="FileCode" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Keep your bundle size small for faster loading:
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Run <code>npm run stats</code> to analyze bundle size</li>
            <li style={{ marginBottom: '8px' }}>Import only what you need from large libraries</li>
            <li style={{ marginBottom: '8px' }}>Use dynamic imports for heavy components</li>
            <li style={{ marginBottom: '8px' }}>Avoid including entire icon libraries</li>
          </ul>
          <CodeBlock
            code={`// ❌ Bad - imports entire library
import * as _ from 'lodash';

// ✅ Good - import specific functions
import debounce from 'lodash/debounce';

// ✅ Dynamic import for heavy component
const HeavyChart = React.lazy(() => import('./HeavyChart'));

<React.Suspense fallback={<Spinner />}>
  <HeavyChart />
</React.Suspense>`}
            language="typescript"
            showLineNumbers={false}
          />
        </div>
      </Section>

      <Section title="React Performance" icon="Rocket" defaultExpanded={true}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Memoization</h4>
          <CodeBlock
            code={`// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize entire component
export const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});`}
            language="typescript"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Virtual Scrolling</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            For lists with 100+ items, use virtualization to render only visible items.
          </p>
        </div>
      </Section>

      <Section title="SharePoint API Optimization" icon="Database" defaultExpanded={true}>
        <div>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>Use batch operations for multiple updates</li>
            <li style={{ marginBottom: '8px' }}>Implement pagination with top and skip parameters</li>
            <li style={{ marginBottom: '8px' }}>Select only required fields</li>
            <li style={{ marginBottom: '8px' }}>Cache data when appropriate</li>
            <li style={{ marginBottom: '8px' }}>Use OData filters to reduce data transfer</li>
          </ul>
        </div>
      </Section>
    </Stack>
  );
};
