import { Dropdown, IDropdownOption, MessageBar, MessageBarType, PrimaryButton, Spinner, TextField } from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { SharePointService } from '../services/SharePointService';
import { ISPField, ISPList } from '../types/SPFormBuilderTypes';

export interface ISharePointSourcePanelProps {
  spService: SharePointService;
  onFieldsLoaded: (listTitle: string, fields: ISPField[]) => void;
}

export const SharePointSourcePanel: React.FC<ISharePointSourcePanelProps> = ({
  spService,
  onFieldsLoaded
}) => {
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [lists, setLists] = useState<ISPList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | undefined>();
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Initialize with current site URL
  useEffect(() => {
    const currentSite = spService.getCurrentSiteUrl();
    setSiteUrl(currentSite);
  }, [spService]);

  // Load lists
  const handleLoadLists = useCallback(async () => {
    if (!siteUrl) {
      setError('Please enter a site URL');
      return;
    }

    setIsLoadingLists(true);
    setError(undefined);
    setLists([]);
    setSelectedListId(undefined);

    try {
      spService.changeSiteUrl(siteUrl);
      const loadedLists = await spService.getLists();
      setLists(loadedLists);

      if (loadedLists.length === 0) {
        setError('No lists found in this site');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lists');
    } finally {
      setIsLoadingLists(false);
    }
  }, [siteUrl, spService]);

  // Load fields
  const handleLoadFields = useCallback(async () => {
    if (!selectedListId) {
      setError('Please select a list');
      return;
    }

    setIsLoadingFields(true);
    setError(undefined);

    try {
      const fields = await spService.getListFields(selectedListId);
      const selectedList = lists.find(l => l.Id === selectedListId);

      if (fields.length === 0) {
        setError('No fields found in this list');
        return;
      }

      onFieldsLoaded(selectedList?.Title || 'List', fields);
    } catch (err: any) {
      setError(err.message || 'Failed to load fields');
    } finally {
      setIsLoadingFields(false);
    }
  }, [selectedListId, lists, onFieldsLoaded, spService]);

  // List dropdown options
  const listOptions: IDropdownOption[] = lists.map(list => ({
    key: list.Id,
    text: `${list.Title} (${list.ItemCount} items)`
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
          SharePoint Source
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#605e5c' }}>
          Select list to generate form
        </p>
      </div>

      {/* Site URL */}
      <TextField
        label="Site URL"
        value={siteUrl}
        onChange={(_, newValue) => setSiteUrl(newValue || '')}
        placeholder="https://contoso.sharepoint.com/sites/sitename"
        disabled={isLoadingLists}
      />

      {/* Load Lists Button */}
      <PrimaryButton
        text={isLoadingLists ? 'Loading Lists...' : 'Load Lists'}
        onClick={handleLoadLists}
        disabled={!siteUrl || isLoadingLists}
        iconProps={{ iconName: 'List' }}
      />

      {/* Lists Dropdown */}
      {lists.length > 0 && (
        <Dropdown
          label="Select List"
          placeholder="Choose a list..."
          options={listOptions}
          selectedKey={selectedListId}
          onChange={(_, option) => setSelectedListId(option?.key as string)}
          disabled={isLoadingLists || isLoadingFields}
        />
      )}

      {/* Load Fields Button */}
      {selectedListId && (
        <PrimaryButton
          text={isLoadingFields ? 'Loading Fields...' : 'Load Fields'}
          onClick={handleLoadFields}
          disabled={!selectedListId || isLoadingFields}
          iconProps={{ iconName: 'Lightning' }}
        />
      )}

      {/* Loading Indicator */}
      {(isLoadingLists || isLoadingFields) && (
        <Spinner
          label={isLoadingLists ? 'Loading lists...' : 'Loading fields...'}
          styles={{ root: { marginTop: '8px' } }}
        />
      )}

      {/* Error Message */}
      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline
          onDismiss={() => setError(undefined)}
        >
          {error}
        </MessageBar>
      )}

      {/* Info */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f3f2f1',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#605e5c'
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          Instructions:
        </div>
        <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>
          <li>Enter SharePoint site URL (or use current site)</li>
          <li>Click "Load Lists" to fetch all lists</li>
          <li>Select a list from the dropdown</li>
          <li>Click "Load Fields" to generate form</li>
        </ol>
      </div>

      {/* Stats */}
      {lists.length > 0 && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#e8f4fd',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#004578',
            fontWeight: 600
          }}
        >
          {lists.length} list{lists.length !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
};
