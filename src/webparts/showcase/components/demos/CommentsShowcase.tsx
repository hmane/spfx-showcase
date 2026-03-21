import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  Toggle,
} from '@fluentui/react';
import { ListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import { ListPicker } from '@pnp/spfx-controls-react/lib/ListPicker';
import * as React from 'react';
import {
  CommentLayout,
  Comments,
  IComment,
  ICommentLink,
  ISystemEvent,
} from 'spfx-toolkit/components/Comments';
import type { IPrincipal } from 'spfx-toolkit/types';
import { SPContext } from 'spfx-toolkit/utilities/context';
import { ShowcaseCodeSample } from '../shared/ShowcaseCodeSample';
import { ShowcaseHero } from '../shared/ShowcaseHero';
import { ShowcaseFeature, ShowcaseKeyFeatures } from '../shared/ShowcaseKeyFeatures';

const COMMENTS_SAMPLE = `import * as React from 'react';
import { Comments } from 'spfx-toolkit/components/Comments';
import type { ICommentLink } from 'spfx-toolkit/components/Comments';
import type { IPrincipal } from 'spfx-toolkit/types';
import { SPContext } from 'spfx-toolkit/utilities/context';

export const CommentsExample: React.FC<{ listId: string; itemId: number }> = ({
  listId,
  itemId,
}) => {
  const preferredUsers = React.useMemo<IPrincipal[]>(() => [SPContext.currentUser], []);
  const linkSuggestions = React.useMemo<ICommentLink[]>(
    () => [
      {
        name: 'Project Plan.docx',
        url: '/sites/demo/Shared Documents/Project Plan.docx',
        fileType: 'docx',
        group: 'Suggested Files',
      },
    ],
    []
  );

  const resolveMentions = React.useCallback(async (query: string) => {
    const users = await (SPContext.sp.web.siteUsers as any)
      .select('Id', 'Title', 'Email', 'LoginName')
      .top(50)();

    const normalizedQuery = query.trim().toLowerCase();
    return users
      .filter((user: any) =>
        [user.Title, user.Email, user.LoginName]
          .filter(Boolean)
          .some((value: string) => value.toLowerCase().includes(normalizedQuery))
      )
      .map((user: any) => ({
        id: String(user.Id),
        title: user.Title,
        email: user.Email,
        loginName: user.LoginName,
      }));
  }, []);

  return (
    <Comments
      listId={listId}
      itemId={itemId}
      layout="timeline"
      preferredUsers={preferredUsers}
      linkSuggestions={linkSuggestions}
      onResolveMentions={resolveMentions}
      onResolveLinkSuggestions={async (query) =>
        linkSuggestions.filter((link) =>
          link.name.toLowerCase().includes(query.toLowerCase())
        )
      }
      numberCommentsPerPage={10}
      enableSearch={true}
      enableDocumentPreview={true}
      onCommentAdded={(comment) => console.log('comment added', comment.id)}
      onCommentLiked={(commentId, isLiked) => console.log('liked changed', commentId, isLiked)}
      onError={(error) => console.error(error.message)}
      systemEvents={[
        {
          id: 'approved',
          text: '<strong>Workflow approved</strong> by Operations.',
          date: new Date(),
          type: 'success',
        },
      ]}
    />
  );
};`;

const COMMENTS_FEATURES: ShowcaseFeature[] = [
  {
    icon: '💬',
    title: 'Live SharePoint CRUD',
    description: 'Loads, posts, likes, and deletes list item comments through the SharePoint comment API.',
    color: '#0b7285',
  },
  {
    icon: '👥',
    title: 'Mentions Without Graph',
    description: 'Preferred users and custom site-user resolution keep the demo permission-light and realistic.',
    color: '#1971c2',
  },
  {
    icon: '🔗',
    title: 'Document-Style Links',
    description: 'Type # to insert discovered site files, or paste a SharePoint URL to test link resolution.',
    color: '#e67700',
  },
  {
    icon: '🧭',
    title: 'Four Layout Variants',
    description: 'Switch between classic, chat, compact, and timeline views against the same underlying item data.',
    color: '#9c36b5',
  },
];

const COMMENTS_BADGES = ['Live item binding', '@ mentions', '# links', 'Timeline events'];

const layoutOptions: IDropdownOption[] = [
  { key: 'classic', text: 'Classic' },
  { key: 'chat', text: 'Chat' },
  { key: 'compact', text: 'Compact' },
  { key: 'timeline', text: 'Timeline' },
];

const pageSizeOptions: IDropdownOption[] = [
  { key: 5, text: '5 comments' },
  { key: 10, text: '10 comments' },
  { key: 15, text: '15 comments' },
  { key: 20, text: '20 comments' },
];

const sortOptions: IDropdownOption[] = [
  { key: 'newest', text: 'Newest first' },
  { key: 'oldest', text: 'Oldest first' },
];

interface ISiteUserRecord {
  Id?: number;
  Title?: string;
  Email?: string;
  LoginName?: string;
  JobTitle?: string;
}

interface IListMetadata {
  title: string;
  enableComments: boolean | null;
}

const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  backgroundColor: '#fafafa',
  overflow: 'auto',
  minHeight: '100vh',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  marginBottom: '24px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 16px 0',
  fontSize: '1.35rem',
  color: '#323130',
};

function getFileType(fileName: string): string | undefined {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex < 0 || lastDotIndex === fileName.length - 1) {
    return undefined;
  }

  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

function normalizePrincipal(user: Partial<IPrincipal> | null | undefined): IPrincipal | null {
  if (!user) {
    return null;
  }

  const id = String(user.id || user.email || user.loginName || user.value || user.title || '').trim();
  if (!id) {
    return null;
  }

  return {
    id,
    title: user.title,
    email: user.email,
    loginName: user.loginName || user.value,
    value: user.value || user.loginName,
    jobTitle: user.jobTitle,
    department: user.department,
    picture: user.picture,
    sip: user.sip,
  };
}

function mapSiteUserToPrincipal(user: ISiteUserRecord): IPrincipal | null {
  return normalizePrincipal({
    id: user.Id ? String(user.Id) : user.Email || user.LoginName || user.Title,
    title: user.Title || user.Email || user.LoginName,
    email: user.Email,
    loginName: user.LoginName,
    value: user.LoginName,
    jobTitle: user.JobTitle,
  });
}

function dedupePrincipals(users: Array<IPrincipal | null>): IPrincipal[] {
  const seen = new Set<string>();
  const deduped: IPrincipal[] = [];

  users.forEach((user: IPrincipal | null) => {
    if (!user) {
      return;
    }

    const key = [
      user.email?.toLowerCase(),
      user.loginName?.toLowerCase(),
      user.value?.toLowerCase(),
      user.id.toLowerCase(),
    ]
      .filter(Boolean)
      .join('|');

    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    deduped.push(user);
  });

  return deduped;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const CommentsShowcase: React.FC = () => {
  const [selectedListId, setSelectedListId] = React.useState<string>('');
  const [selectedItemId, setSelectedItemId] = React.useState<number | undefined>(undefined);
  const [selectedItemLabel, setSelectedItemLabel] = React.useState<string>('');
  const [listMetadata, setListMetadata] = React.useState<IListMetadata | null>(null);
  const [layout, setLayout] = React.useState<CommentLayout>('classic');
  const [pageSize, setPageSize] = React.useState<5 | 10 | 15 | 20>(10);
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
  const [enableSearch, setEnableSearch] = React.useState<boolean>(true);
  const [enableDocumentPreview, setEnableDocumentPreview] = React.useState<boolean>(true);
  const [enableLinkResolution, setEnableLinkResolution] = React.useState<boolean>(true);
  const [preferredUsers, setPreferredUsers] = React.useState<IPrincipal[]>([]);
  const [linkSuggestions, setLinkSuggestions] = React.useState<ICommentLink[]>([]);
  const [isLoadingContextData, setIsLoadingContextData] = React.useState<boolean>(true);
  const [activityLog, setActivityLog] = React.useState<string[]>([]);

  const addLog = React.useCallback((message: string) => {
    const timestamp = formatTimestamp(new Date());
    setActivityLog((previous: string[]) => [`[${timestamp}] ${message}`, ...previous].slice(0, 18));
  }, []);

  React.useEffect(() => {
    let isDisposed = false;

    const loadDemoContext = async (): Promise<void> => {
      setIsLoadingContextData(true);

      try {
        const currentUser = normalizePrincipal(SPContext.currentUser);
        const rawUsers = await ((SPContext.sp.web.siteUsers as any)
          .select('Id', 'Title', 'Email', 'LoginName', 'JobTitle')
          .top(12)() as Promise<ISiteUserRecord[]>);

        const resolvedUsers = dedupePrincipals([
          currentUser,
          ...rawUsers.map((user: ISiteUserRecord) => mapSiteUserToPrincipal(user)),
        ]).slice(0, 8);

        const libraries = await ((SPContext.sp.web.lists as any)
          .select('Title', 'BaseTemplate', 'Hidden', 'RootFolder/ServerRelativeUrl')
          .expand('RootFolder')
          .top(30)() as Promise<any[]>);

        const visibleLibraries = libraries.filter((list: any) => !list.Hidden && list.BaseTemplate === 101);
        const discoveredLinks: ICommentLink[] = [];

        for (const library of visibleLibraries.slice(0, 3)) {
          try {
            const items = await ((SPContext.sp.web.lists.getByTitle(library.Title).items as any)
              .select('FileRef', 'FileLeafRef')
              .filter('FSObjType eq 0')
              .top(4)() as Promise<Array<{ FileRef?: string; FileLeafRef?: string }>>);

            items.forEach((item: { FileRef?: string; FileLeafRef?: string }) => {
              if (!item.FileRef || !item.FileLeafRef) {
                return;
              }

              discoveredLinks.push({
                name: item.FileLeafRef,
                url: `${window.location.origin}${item.FileRef}`,
                fileType: getFileType(item.FileLeafRef),
                group: library.Title,
              });
            });
          } catch {
            // Best effort only; some libraries may not be readable or may not contain files.
          }
        }

        const fallbackLinks: ICommentLink[] = [
          {
            name: 'Current Site',
            url: SPContext.pageContext.web.absoluteUrl,
            group: 'Fallback',
          },
        ];

        if (!isDisposed) {
          setPreferredUsers(resolvedUsers);
          setLinkSuggestions(discoveredLinks.length > 0 ? discoveredLinks : fallbackLinks);
          addLog(
            `Loaded ${resolvedUsers.length} preferred users and ${Math.max(
              discoveredLinks.length,
              fallbackLinks.length
            )} link suggestions`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!isDisposed) {
          addLog(`Context data load failed: ${message}`);
          setPreferredUsers([]);
          setLinkSuggestions([
            {
              name: 'Current Site',
              url: SPContext.pageContext.web.absoluteUrl,
              group: 'Fallback',
            },
          ]);
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingContextData(false);
        }
      }
    };

    loadDemoContext().catch(() => {
      // Errors are already captured in the activity log.
    });

    return () => {
      isDisposed = true;
    };
  }, [addLog]);

  React.useEffect(() => {
    let isDisposed = false;

    if (!selectedListId) {
      setListMetadata(null);
      return undefined;
    }

    const loadListMetadata = async (): Promise<void> => {
      try {
        const list = await ((SPContext.sp.web.lists.getById(selectedListId) as any)
          .select('Title', 'EnableComments')() as Promise<{ Title: string; EnableComments?: boolean | null }>);

        if (isDisposed) {
          return;
        }

        setListMetadata({
          title: list.Title,
          enableComments:
            typeof list.EnableComments === 'boolean' ? list.EnableComments : null,
        });
        addLog(
          `Selected list "${list.Title}" (${
            typeof list.EnableComments === 'boolean'
              ? list.EnableComments
                ? 'comments enabled'
                : 'comments disabled'
              : 'comment status not exposed by list metadata'
          })`
        );
      } catch (error) {
        if (isDisposed) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        setListMetadata(null);
        addLog(`Failed to inspect selected list: ${message}`);
      }
    };

    loadListMetadata().catch(() => {
      // Errors are already captured in the activity log.
    });

    return () => {
      isDisposed = true;
    };
  }, [selectedListId, addLog]);

  const resetDemo = React.useCallback(() => {
    setSelectedListId('');
    setSelectedItemId(undefined);
    setSelectedItemLabel('');
    setListMetadata(null);
    setLayout('classic');
    setPageSize(10);
    setSortOrder('newest');
    setEnableSearch(true);
    setEnableDocumentPreview(true);
    setEnableLinkResolution(true);
    setActivityLog([]);
  }, []);

  const resolveMentions = React.useCallback(
    async (query: string): Promise<IPrincipal[]> => {
      const normalizedQuery = query.trim().toLowerCase();
      if (normalizedQuery.length < 2) {
        return [];
      }

      try {
        const users = await ((SPContext.sp.web.siteUsers as any)
          .select('Id', 'Title', 'Email', 'LoginName', 'JobTitle')
          .top(50)() as Promise<ISiteUserRecord[]>);

        return dedupePrincipals(
          users
            .filter((user: ISiteUserRecord) =>
              [user.Title, user.Email, user.LoginName]
                .filter(Boolean)
                .some((value: string) => value.toLowerCase().includes(normalizedQuery))
            )
            .map((user: ISiteUserRecord) => mapSiteUserToPrincipal(user))
        ).slice(0, 10);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog(`Mention lookup failed: ${message}`);
        return [];
      }
    },
    [addLog]
  );

  const resolveLinkSuggestions = React.useCallback(
    async (query: string): Promise<ICommentLink[]> => {
      const normalizedQuery = query.trim().toLowerCase();
      if (normalizedQuery.length < 2) {
        return [];
      }

      return linkSuggestions.filter(
        (link: ICommentLink) =>
          link.name.toLowerCase().includes(normalizedQuery) ||
          link.url.toLowerCase().includes(normalizedQuery) ||
          (link.group || '').toLowerCase().includes(normalizedQuery)
      );
    },
    [linkSuggestions]
  );

  const systemEvents = React.useMemo<ISystemEvent[]>(() => {
    if (layout !== 'timeline') {
      return [];
    }

    const now = Date.now();
    return [
      {
        id: 'workflow-created',
        text: '<strong>Workflow started</strong> and routed for review.',
        date: new Date(now - 1000 * 60 * 90),
        type: 'info',
      },
      {
        id: 'workflow-approved',
        text: '<strong>Approval granted</strong> by the project lead.',
        date: new Date(now - 1000 * 60 * 45),
        type: 'success',
      },
      {
        id: 'workflow-followup',
        text: 'Follow-up action due <strong>today</strong> for implementation notes.',
        date: new Date(now - 1000 * 60 * 15),
        type: 'warning',
      },
    ];
  }, [layout]);

  const canRenderComments =
    !!selectedListId && !!selectedItemId && listMetadata?.enableComments !== false;

  return (
    <div style={containerStyle}>
      <ShowcaseHero
        title='Comments Component'
        subtitle='Live list item comments with mentions, link insertion, search, pagination, and multiple layouts.'
        gradient='linear-gradient(135deg, #0f4c81 0%, #2a9d8f 100%)'
        badges={COMMENTS_BADGES}
        icon='💬'
      />

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Interactive Configuration</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <Dropdown
            label='Layout'
            selectedKey={layout}
            options={layoutOptions}
            onChange={(_, option) => option && setLayout(option.key as CommentLayout)}
          />
          <Dropdown
            label='Comments Per Page'
            selectedKey={pageSize}
            options={pageSizeOptions}
            onChange={(_, option) => option && setPageSize(option.key as 5 | 10 | 15 | 20)}
          />
          <Dropdown
            label='Sort Order'
            selectedKey={sortOrder}
            options={sortOptions}
            onChange={(_, option) =>
              option && setSortOrder(option.key as 'newest' | 'oldest')
            }
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <Toggle
            label='Search'
            checked={enableSearch}
            onChange={(_, checked) => setEnableSearch(!!checked)}
          />
          <Toggle
            label='Document Preview'
            checked={enableDocumentPreview}
            onChange={(_, checked) => setEnableDocumentPreview(!!checked)}
          />
          <Toggle
            label='Paste URL Resolution'
            checked={enableLinkResolution}
            onChange={(_, checked) => setEnableLinkResolution(!!checked)}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'end',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#323130',
              }}
            >
              Choose a List or Library
            </label>
            <ListPicker
              context={SPContext.context.context}
              label=''
              placeHolder='Select a list with comments enabled'
              includeHidden={false}
              multiSelect={false}
              onSelectionChanged={(lists: string | string[]) => {
                const listId =
                  typeof lists === 'string'
                    ? lists
                    : Array.isArray(lists) && lists.length > 0
                      ? lists[0]
                      : '';

                setSelectedListId(listId);
                setSelectedItemId(undefined);
                setSelectedItemLabel('');
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#323130',
              }}
            >
              Choose an Item
            </label>
            <ListItemPicker
              key={selectedListId || 'comments-item-picker'}
              listId={selectedListId}
              columnInternalName='Title'
              keyColumnInternalName='ID'
              itemLimit={1}
              context={SPContext.context.context}
              placeholder={selectedListId ? 'Select an item' : 'Pick a list first'}
              onSelectedItem={(items: Array<{ key: string; name: string }>) => {
                if (items && items.length > 0) {
                  const itemId = parseInt(items[0].key, 10);
                  setSelectedItemId(itemId);
                  setSelectedItemLabel(items[0].name);
                  addLog(`Selected item "${items[0].name}" (ID: ${itemId})`);
                  return;
                }

                setSelectedItemId(undefined);
                setSelectedItemLabel('');
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DefaultButton onClick={resetDemo}>Reset Demo</DefaultButton>
          </div>
        </div>

        <div
          style={{
            marginTop: '18px',
            padding: '16px',
            borderRadius: '10px',
            background: '#f8fbfd',
            border: '1px solid #d0ebff',
            color: '#334155',
            lineHeight: 1.6,
          }}
        >
          Type `@` to mention one of the preloaded site users, then keep typing at least two characters for directory search. Type `#` to insert one of the discovered site files, or paste a SharePoint URL directly into the input to test automatic link resolution.
        </div>
      </div>

      {listMetadata?.enableComments === false && (
        <div style={cardStyle}>
          <MessageBar messageBarType={MessageBarType.warning}>
            Comments are disabled for <strong>{listMetadata.title}</strong>. Pick a modern list or
            library with comments enabled to use this demo.
          </MessageBar>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Live Demo</h2>

        {isLoadingContextData && (
          <MessageBar messageBarType={MessageBarType.info}>
            Loading mention suggestions and available file links from the current site.
          </MessageBar>
        )}

        {!selectedListId || !selectedItemId ? (
          <MessageBar messageBarType={MessageBarType.severeWarning}>
            Select a list and item first. The component is bound to a real SharePoint list item and
            uses that item&apos;s native comment store.
          </MessageBar>
        ) : !canRenderComments ? null : (
          <>
            <div
              style={{
                marginBottom: '16px',
                padding: '14px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                background: '#f8fafc',
              }}
            >
              <strong>Target item:</strong> {selectedItemLabel || 'Selected item'} in{' '}
              {listMetadata?.title || 'selected list'}
            </div>

            <Comments
              listId={selectedListId}
              itemId={selectedItemId}
              layout={layout}
              preferredUsers={preferredUsers}
              onResolveMentions={resolveMentions}
              linkSuggestions={linkSuggestions}
              onResolveLinkSuggestions={resolveLinkSuggestions}
              enableLinkResolution={enableLinkResolution}
              numberCommentsPerPage={pageSize}
              sortOrder={sortOrder}
              enableSearch={enableSearch}
              enableDocumentPreview={enableDocumentPreview}
              label='Item Comments'
              systemEvents={systemEvents}
              onCommentAdded={(comment: IComment) => {
                addLog(`Comment added (ID ${comment.id})`);
              }}
              onCommentDeleted={(commentId: number) => {
                addLog(`Comment deleted (ID ${commentId})`);
              }}
              onCommentLiked={(commentId: number, isLiked: boolean) => {
                addLog(`Comment ${isLiked ? 'liked' : 'unliked'} (ID ${commentId})`);
              }}
              onMentioned={(user: IPrincipal) => {
                addLog(`Mention inserted for ${user.title || user.email || user.id}`);
              }}
              onLinkAdded={(link: ICommentLink) => {
                addLog(`Link inserted for ${link.name}`);
              }}
              onError={(error: Error) => {
                addLog(`Comments error: ${error.message}`);
              }}
            />
          </>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          gap: '24px',
          alignItems: 'start',
          marginBottom: '24px',
        }}
      >
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Integration Notes</h2>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
              }}
            >
              <strong>Required data:</strong> `listId` and `itemId` are mandatory because the
              component talks directly to the native SharePoint comments endpoint for that item.
            </div>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
              }}
            >
              <strong>Mentions model:</strong> there is no implicit Graph fallback. The host app
              should supply `preferredUsers` and an `onResolveMentions` callback that fits its
              permission model.
            </div>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
              }}
            >
              <strong>Link behavior:</strong> `#` links are custom metadata layered on top of SharePoint
              comments. They can come from static suggestions, a custom resolver, or pasted SharePoint URLs.
            </div>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
              }}
            >
              <strong>Timeline mode:</strong> this showcase injects sample `systemEvents` so the
              vertical activity feed is visible even when the item has only a few comments.
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Activity Log</h2>
          {activityLog.length === 0 ? (
            <div style={{ color: '#605e5c', lineHeight: 1.6 }}>
              Interactions will appear here after you select an item and use the component.
            </div>
          ) : (
            <div
              style={{
                maxHeight: '420px',
                overflowY: 'auto',
                display: 'grid',
                gap: '8px',
              }}
            >
              {activityLog.map((entry: string, index: number) => (
                <div
                  key={`${entry}-${index}`}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: index === 0 ? '#e3fafc' : '#f8f9fa',
                    border: '1px solid #dee2e6',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ShowcaseKeyFeatures features={COMMENTS_FEATURES} />

      <ShowcaseCodeSample
        id='comments-basic-usage'
        title='Basic Usage'
        code={COMMENTS_SAMPLE}
        language='tsx'
        description='Minimal wiring for a live SharePoint item, mention resolution, file link suggestions, and timeline events.'
        fileName='CommentsExample.tsx'
      />
    </div>
  );
};

export default CommentsShowcase;
