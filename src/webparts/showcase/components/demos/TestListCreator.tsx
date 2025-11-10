import * as React from 'react';
import { Card, Header, Content } from 'spfx-toolkit/lib/components/Card';
import { PrimaryButton, DefaultButton, MessageBar, MessageBarType, Spinner, SpinnerSize } from '@fluentui/react';
import SPContext from 'spfx-toolkit/lib/utilities/context';
// Import centralized PnP type augmentations

export interface ITestListCreatorProps {
  listTitle: string;
  description: string;
  fields?: Array<{
    name: string;
    type: string;
    required?: boolean;
    choices?: string[];
  }>;
  sampleData?: Array<Record<string, any>>;
  onListCreated?: (listUrl: string, listId: string) => void;
}

export const TestListCreator: React.FC<ITestListCreatorProps> = ({
  listTitle,
  description,
  fields = [],
  sampleData = [],
  onListCreated
}) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: MessageBarType; text: string } | null>(null);
  const [listUrl, setListUrl] = React.useState<string | null>(null);

  const createTestList = async (): Promise<void> => {
    setIsCreating(true);
    setMessage(null);

    try {
      const sp = SPContext.sp;

      // Create the list
      const listResult = await sp.web.lists.add(listTitle, description);
      const list = listResult.list;

      // Add custom fields
      for (const field of fields) {
        try {
          if (field.type === 'Choice' && field.choices) {
            await list.fields.addChoice(field.name, { Choices: field.choices });
          } else if (field.type === 'DateTime') {
            await list.fields.addDateTime(field.name, {});
          } else if (field.type === 'Number') {
            await list.fields.addNumber(field.name, {});
          } else if (field.type === 'Boolean') {
            await list.fields.addBoolean(field.name, {});
          } else if (field.type === 'User') {
            await list.fields.addUser(field.name, {});
          } else if (field.type === 'URL') {
            await list.fields.addUrl(field.name, {});
          } else {
            await list.fields.addText(field.name, {});
          }
        } catch (fieldError) {
          console.warn(`Field ${field.name} might already exist or failed to create:`, fieldError);
        }
      }

      // Add sample data if provided
      if (sampleData.length > 0) {
        for (const item of sampleData) {
          try {
            await list.items.add(item);
          } catch (itemError) {
            console.warn('Failed to add sample item:', itemError);
          }
        }
      }

      const webUrl = SPContext.webAbsoluteUrl;
      const createdListUrl = `${webUrl}/Lists/${listTitle.replace(/\s+/g, '')}`;

      setListUrl(createdListUrl);
      setMessage({
        type: MessageBarType.success,
        text: `Test list "${listTitle}" created successfully with ${fields.length} custom fields and ${sampleData.length} sample items!`
      });

      if (onListCreated) {
        onListCreated(createdListUrl, listResult.data.Id);
      }
    } catch (error) {
      console.error('Error creating test list:', error);
      setMessage({
        type: MessageBarType.error,
        text: `Failed to create test list: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openList = (): void => {
    if (listUrl) {
      window.open(listUrl, '_blank');
    }
  };

  return (
    <Card id="test-list-creator" elevation={2}>
      <Header variant="info">Test List Setup</Header>
      <Content padding="comfortable">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>List: {listTitle}</div>
            <div style={{ fontSize: '13px', color: '#605e5c', marginBottom: '8px' }}>{description}</div>

            {fields.length > 0 && (
              <div style={{ fontSize: '13px', color: '#605e5c' }}>
                <strong>Fields to create:</strong> {fields.map(f => f.name).join(', ')}
                {sampleData.length > 0 && ` (with ${sampleData.length} sample items)`}
              </div>
            )}
          </div>

          {message && (
            <MessageBar messageBarType={message.type} onDismiss={() => setMessage(null)}>
              {message.text}
            </MessageBar>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PrimaryButton
              text={isCreating ? 'Creating...' : 'Create Test List'}
              onClick={createTestList}
              disabled={isCreating || listUrl !== null}
              iconProps={{ iconName: 'Add' }}
            />

            {isCreating && <Spinner size={SpinnerSize.small} />}

            {listUrl && (
              <DefaultButton
                text="Open List"
                onClick={openList}
                iconProps={{ iconName: 'OpenInNewWindow' }}
              />
            )}
          </div>

          <div style={{ fontSize: '12px', color: '#a19f9d', fontStyle: 'italic' }}>
            Note: This will create a real SharePoint list in your site. You may need appropriate permissions.
          </div>
        </div>
      </Content>
    </Card>
  );
};
