import * as React from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { ShowcaseHero } from './ShowcaseHero';
import { ShowcaseKeyFeatures, ShowcaseFeature } from './ShowcaseKeyFeatures';
import { ShowcaseCodeSample } from './ShowcaseCodeSample';
import {
  extractField,
  compareItems,
  BATCH_CONSTANTS
} from 'spfx-toolkit/lib/utilities';
import { TextField, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Dropdown, IDropdownOption } from '@fluentui/react';

const FEATURES: ShowcaseFeature[] = [
  {
    icon: '📦',
    title: 'Batch Operations',
    description: 'Execute multiple SharePoint operations efficiently with automatic batching, retry logic, and progress tracking',
    color: '#0078d4'
  },
  {
    icon: '🔍',
    title: 'Field Extraction',
    description: 'Type-safe field value extraction with support for complex field types (User, Lookup, Taxonomy, etc.)',
    color: '#107c10'
  },
  {
    icon: '✏️',
    title: 'Item Updates',
    description: 'Simplified list item updates with automatic validation, ETag handling, and change detection',
    color: '#ff8c00'
  },
  {
    icon: '🔄',
    title: 'Data Transformation',
    description: 'Transform SharePoint list items with field mapping, type conversion, and default value support',
    color: '#5c2d91'
  },
  {
    icon: '⚡',
    title: 'Performance',
    description: 'Optimized for high-volume operations with configurable batch sizes and parallel execution',
    color: '#d13438'
  },
  {
    icon: '🛡️',
    title: 'Error Handling',
    description: 'Robust error handling with detailed error messages, validation, and automatic retry mechanisms',
    color: '#008272'
  }
];

const BATCH_BUILDER_EXAMPLE = `import { createBatchBuilder } from 'spfx-toolkit/lib/utilities/batchBuilder';
import { SPContext } from 'spfx-toolkit/lib/utilities/context';

async function batchCreateItems() {
  const sp = SPContext.get().sp;

  const builder = createBatchBuilder(sp, {
    batchSize: 100,
    continueOnError: true,
    enableLogging: true
  });

  // Add multiple operations
  const listBuilder = builder.forList('Tasks');

  for (let i = 0; i < 500; i++) {
    listBuilder.add({
      Title: \`Task \${i}\`,
      Status: 'Not Started',
      Priority: 'Normal'
    });
  }

  // Execute all operations
  const result = await builder.execute();

  console.log(\`Created \${result.successCount} items\`);
  console.log(\`Failed: \${result.errorCount}\`);

  return result;
}`;

const EXTRACTOR_EXAMPLE = `import { createSPExtractor, extractField } from 'spfx-toolkit/lib/utilities/listItemHelper';

interface Task {
  id: number;
  title: string;
  assignedTo: string;
  dueDate: Date;
  priority: string;
}

async function getTaskData(itemId: number): Promise<Task> {
  const sp = SPContext.get().sp;
  const item = await sp.web.lists.getByTitle('Tasks').items.getById(itemId)();

  // Create extractor
  const extractor = createSPExtractor(item);

  // Extract fields with type safety
  return {
    id: extractor.number('Id'),
    title: extractor.string('Title'),
    assignedTo: extractor.user('AssignedTo', 'displayName'),
    dueDate: extractor.date('DueDate'),
    priority: extractor.choice('Priority', 'Normal')
  };
}

// Quick extraction for single fields
const quickExtract = (item: any) => {
  const title = extractField<string>(item, 'Title', 'string', 'Untitled');
  const count = extractField<number>(item, 'Count', 'number', 0);
  const isActive = extractField<boolean>(item, 'IsActive', 'boolean', false);

  return { title, count, isActive };
};`;

const UPDATER_EXAMPLE = `import { createSPUpdater, quickUpdate, compareItems } from 'spfx-toolkit/lib/utilities/listItemHelper';

async function updateTaskItem(itemId: number, updates: any) {
  const sp = SPContext.get().sp;
  const list = sp.web.lists.getByTitle('Tasks');

  // Get current item
  const currentItem = await list.items.getById(itemId)();

  // Compare changes
  const comparison = compareItems(currentItem, updates);

  if (!comparison.hasChanges) {
    console.log('No changes detected');
    return;
  }

  console.log('Changed fields:', comparison.changedFields);

  // Create updater
  const updater = createSPUpdater(currentItem);

  // Add updates with validation
  updater.setField('Title', updates.Title);
  updater.setField('Status', updates.Status);
  updater.setField('Priority', updates.Priority);

  // Get update payload
  const updatePayload = updater.getUpdates();

  // Execute update
  await list.items.getById(itemId).update(updatePayload);

  // Or use quick update
  const quickPayload = quickUpdate('Status', 'Completed', currentItem.Status);
  await list.items.getById(itemId).update(quickPayload);
}`;

const BATCH_ADVANCED_EXAMPLE = `import { createBatchBuilder, analyzeBatchOperations } from 'spfx-toolkit/lib/utilities/batchBuilder';

async function advancedBatchOperations() {
  const sp = SPContext.get().sp;

  // Create builder with advanced config
  const builder = createBatchBuilder(sp, {
    batchSize: 50,
    continueOnError: true,
    enableLogging: true,
    timeout: 60000,
    maxRetries: 3
  });

  // Operations on multiple lists
  const tasksBuilder = builder.forList('Tasks');
  const projectsBuilder = builder.forList('Projects');

  // Add operations
  tasksBuilder.add({ Title: 'Task 1' });
  tasksBuilder.update(123, { Status: 'Completed' });
  tasksBuilder.delete(456);

  projectsBuilder.add({ Title: 'Project 1' });
  projectsBuilder.update(789, { Status: 'Active' });

  // Analyze before execution
  const analysis = analyzeBatchOperations(builder.getOperations());
  console.log('Total operations:', analysis.totalOperations);
  console.log('Operations by type:', analysis.operationsByType);
  console.log('Estimated batches:', analysis.estimatedBatches(50));

  // Execute with progress tracking
  const result = await builder.execute({
    onProgress: (current, total) => {
      console.log(\`Progress: \${current}/\${total}\`);
    },
    onBatchComplete: (batchNum, results) => {
      console.log(\`Batch \${batchNum} completed\`);
    }
  });

  return result;
}`;

const TRANSFORM_EXAMPLE = `import { extractFields, transformItem } from 'spfx-toolkit/lib/utilities/listItemHelper';

// Extract multiple fields at once
const extractMultiple = (item: any) => {
  return extractFields(item, {
    title: { type: 'string', defaultValue: '' },
    count: { type: 'number', defaultValue: 0 },
    createdDate: { type: 'date' },
    author: { type: 'user' },
    isActive: { type: 'boolean', defaultValue: true }
  });
};

// Transform with field mapping
const transformData = (item: any) => {
  return transformItem(item, {
    id: 'Id',
    taskName: { sourceField: 'Title', type: 'string' },
    owner: { sourceField: 'AssignedTo', type: 'user', defaultValue: 'Unassigned' },
    deadline: { sourceField: 'DueDate', type: 'date' },
    priorityLevel: { sourceField: 'Priority', type: 'choice', defaultValue: 'Normal' }
  });
};`;

export const SPUtilitiesShowcase: React.FC = () => {
  const [batchSize, setBatchSize] = React.useState(100);
  const [itemCount, setItemCount] = React.useState(10);
  const [batchResult, setBatchResult] = React.useState<string | null>(null);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: MessageBarType; text: string } | null>(null);

  const executeBatchDemo = async (): Promise<void> => {
    setIsExecuting(true);
    setMessage(null);
    setBatchResult(null);

    try {
      // Simulate adding operations
      const operations = [];
      for (let i = 0; i < itemCount; i++) {
        operations.push({
          type: 'add',
          listName: 'DemoList',
          data: {
            Title: `Demo Item ${i + 1}`,
            Description: `Created via batch builder at ${new Date().toLocaleTimeString()}`
          }
        });
      }

      // Show analysis
      const analysis = {
        totalOperations: itemCount,
        estimatedBatches: Math.ceil(itemCount / batchSize),
        batchSize,
        estimatedTime: `~${Math.ceil(itemCount / batchSize) * 2}s`
      };

      setBatchResult(JSON.stringify(analysis, null, 2));

      setMessage({
        type: MessageBarType.success,
        text: `Batch analysis complete! Would execute ${analysis.totalOperations} operations in ${analysis.estimatedBatches} batches.`
      });
    } catch (error) {
      console.error('Batch demo error:', error);
      setMessage({
        type: MessageBarType.error,
        text: `Error: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const demoExtractor = (): void => {
    // Demo data
    const mockItem = {
      Id: 123,
      Title: 'Sample Task',
      Status: 'In Progress',
      AssignedToId: 5,
      AssignedToStringId: '5',
      AssignedTo: {
        Title: 'John Doe',
        EMail: 'john.doe@contoso.com'
      },
      DueDate: new Date().toISOString(),
      Priority: 'High',
      IsCompleted: false
    };

    // Extract fields
    const extracted = {
      id: extractField(mockItem, 'Id', 'number'),
      title: extractField(mockItem, 'Title', 'string', 'Untitled'),
      status: extractField(mockItem, 'Status', 'choice'),
      assignedTo: extractField(mockItem, 'AssignedTo', 'user'),
      dueDate: extractField(mockItem, 'DueDate', 'date'),
      priority: extractField(mockItem, 'Priority', 'choice', 'Normal'),
      isCompleted: extractField(mockItem, 'IsCompleted', 'boolean', false)
    };

    setBatchResult(JSON.stringify(extracted, null, 2));
    setMessage({
      type: MessageBarType.success,
      text: 'Field extraction demo completed! Check the result below.'
    });
  };

  const demoCompare = (): void => {
    const original = {
      Title: 'Original Title',
      Status: 'Draft',
      Priority: 'Normal',
      Description: 'Original description'
    };

    const updated = {
      Title: 'Updated Title',
      Status: 'In Progress',
      Priority: 'Normal',
      Description: 'Original description'
    };

    const comparison = compareItems(original, updated);

    setBatchResult(JSON.stringify(comparison, null, 2));
    setMessage({
      type: MessageBarType.info,
      text: `Comparison complete! Found ${comparison.changedFields.length} changed fields.`
    });
  };

  const batchSizeOptions: IDropdownOption[] = [
    { key: 25, text: '25 (Conservative)' },
    { key: 50, text: '50 (Balanced)' },
    { key: 100, text: '100 (Default)' },
    { key: 200, text: '200 (Aggressive)' }
  ];

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <ShowcaseHero
        title="SharePoint Utilities"
        subtitle="Powerful utility functions for batch operations, field extraction, data transformation, and list item management"
        gradient="linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
        badges={['Batch Operations', 'Type-safe', 'Performance']}
        icon="🛠️"
      />
      <Card id="batch-demo" elevation={3} defaultExpanded>
        <Header variant="success">Batch Builder Demo</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MessageBar messageBarType={MessageBarType.info}>
              This demo shows how the batch builder analyzes and plans operations without actually executing them.
            </MessageBar>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <TextField
                label="Number of Operations"
                type="number"
                value={itemCount.toString()}
                onChange={(_, val) => setItemCount(parseInt(val || '10', 10))}
                min={1}
                max={1000}
              />

              <Dropdown
                label="Batch Size"
                selectedKey={batchSize}
                onChange={(_, option) => setBatchSize((option?.key || 100) as number)}
                options={batchSizeOptions}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <PrimaryButton
                text="Analyze Batch Operations"
                onClick={executeBatchDemo}
                disabled={isExecuting}
                iconProps={{ iconName: 'Calculator' }}
              />
            </div>

            {message && (
              <MessageBar messageBarType={message.type} onDismiss={() => setMessage(null)}>
                {message.text}
              </MessageBar>
            )}

            {batchResult && (
              <div style={{
                padding: '16px',
                backgroundColor: '#fafafa',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Batch Analysis Result:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{batchResult}</pre>
              </div>
            )}

            <div style={{
              padding: '16px',
              border: '1px dashed #d1d1d1',
              borderRadius: '4px',
              backgroundColor: '#fff'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Batch Constants:</div>
              <div style={{ fontSize: '13px', color: '#605e5c', display: 'grid', gap: '4px' }}>
                <div>Default Batch Size: {BATCH_CONSTANTS.DEFAULT_BATCH_SIZE}</div>
                <div>Conservative Size: {BATCH_CONSTANTS.CONSERVATIVE_BATCH_SIZE}</div>
                <div>Max Recommended: {BATCH_CONSTANTS.MAX_RECOMMENDED_BATCH_SIZE}</div>
                <div>Default Timeout: {BATCH_CONSTANTS.DEFAULT_TIMEOUT}ms</div>
                <div>Max Retries: {BATCH_CONSTANTS.DEFAULT_MAX_RETRIES}</div>
              </div>
            </div>
          </div>
        </Content>
      </Card>

      <Card id="extractor-demo" elevation={3} defaultExpanded style={{ marginTop: '24px' }}>
        <Header variant="info">Field Extractor Demo</Header>
        <Content padding="comfortable">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MessageBar messageBarType={MessageBarType.info}>
              Demonstrates type-safe field extraction from SharePoint list items with default values.
            </MessageBar>

            <div style={{ display: 'flex', gap: '12px' }}>
              <PrimaryButton
                text="Run Extraction Demo"
                onClick={demoExtractor}
                iconProps={{ iconName: 'Extract' }}
              />
              <DefaultButton
                text="Run Comparison Demo"
                onClick={demoCompare}
                iconProps={{ iconName: 'CompareUneven' }}
              />
            </div>

            {message && (
              <MessageBar messageBarType={message.type} onDismiss={() => setMessage(null)}>
                {message.text}
              </MessageBar>
            )}

            {batchResult && (
              <div style={{
                padding: '16px',
                backgroundColor: '#fafafa',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Result:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{batchResult}</pre>
              </div>
            )}
          </div>
        </Content>
      </Card>

      <ShowcaseKeyFeatures features={FEATURES} />

      <ShowcaseCodeSample
        id="batch-builder"
        title="Batch Builder - Basic Usage"
        description="Execute multiple SharePoint operations efficiently"
        code={BATCH_BUILDER_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="field-extractor"
        title="Field Extraction"
        description="Type-safe extraction of SharePoint field values"
        code={EXTRACTOR_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="item-updater"
        title="Item Updates with Change Detection"
        description="Update list items with automatic validation and change tracking"
        code={UPDATER_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="batch-advanced"
        title="Advanced Batch Operations"
        description="Multi-list operations with progress tracking and analysis"
        code={BATCH_ADVANCED_EXAMPLE}
        language="tsx"
      />

      <ShowcaseCodeSample
        id="data-transform"
        title="Data Transformation"
        description="Transform and map SharePoint data with field mappings"
        code={TRANSFORM_EXAMPLE}
        language="tsx"
      />
    </div>
  );
};
