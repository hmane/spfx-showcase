import { Icon, MessageBar, MessageBarType, PrimaryButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { Section } from '../shared/Section';

/**
 * Useful Links tab - Quick access to Azure, SharePoint admin URLs
 */
export const UsefulLinks: React.FC<ITabComponentProps> = () => {
  const [tenantDomain, setTenantDomain] = useState<string>('');
  const [tenantName, setTenantName] = useState<string>('');

  useEffect(() => {
    // Extract tenant information from current SharePoint URL
    try {
      const currentUrl = window.location.href;

      // Extract tenant from SharePoint URL
      // Format: https://{tenant}.sharepoint.com/...
      const match = currentUrl.match(/https?:\/\/([^.]+)\.sharepoint\.com/);
      if (match && match[1]) {
        const extractedTenant = match[1];
        setTenantName(extractedTenant);
        setTenantDomain(`${extractedTenant}.sharepoint.com`);
      }
    } catch (error) {
      console.error('Failed to extract tenant information:', error);
    }
  }, []);

  interface ILink {
    title: string;
    url: string;
    description: string;
    icon: string;
    requiresTenant?: boolean;
  }

  const azureLinks: ILink[] = [
    {
      title: 'Azure Portal',
      url: 'https://portal.azure.com',
      description: 'Azure resource management and monitoring',
      icon: 'AzureLogo',
    },
    {
      title: 'Azure DevOps',
      url: tenantName ? `https://dev.azure.com/${tenantName}` : 'https://dev.azure.com',
      description: 'Source control, pipelines, and work items',
      icon: 'BranchMerge',
      requiresTenant: true,
    },
    {
      title: 'Azure Role Activate (PIM)',
      url: 'https://portal.azure.com/#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/azurerbac',
      description: 'Activate Azure RBAC roles with Privileged Identity Management',
      icon: 'Permissions',
    },
    {
      title: 'Entra ID (Azure AD)',
      url: 'https://entra.microsoft.com',
      description: 'User and group management',
      icon: 'Group',
    },
  ];

  const sharePointLinks: ILink[] = [
    {
      title: 'SharePoint Admin Center',
      url: tenantDomain ? `https://${tenantName}-admin.sharepoint.com` : 'https://admin.microsoft.com/sharepoint',
      description: 'SharePoint site administration and settings',
      icon: 'SharepointLogo',
      requiresTenant: true,
    },
    {
      title: 'Term Store Management',
      url: tenantDomain ? `https://${tenantName}.sharepoint.com/_layouts/15/online/AdminHome.aspx#/termStoreAdminCenter` : '',
      description: 'Manage managed metadata and term sets',
      icon: 'TagGroup',
      requiresTenant: true,
    },
    {
      title: 'App Catalog',
      url: tenantDomain ? `https://${tenantName}.sharepoint.com/sites/appcatalog` : '',
      description: 'Deploy and manage SharePoint apps (.sppkg files)',
      icon: 'AppIconDefault',
      requiresTenant: true,
    },
  ];

  const developerLinks: ILink[] = [
    {
      title: 'SPFx Documentation',
      url: 'https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview',
      description: 'Official SharePoint Framework documentation',
      icon: 'Documentation',
    },
    {
      title: 'PnP GitHub',
      url: 'https://github.com/pnp',
      description: 'Community samples, controls, and tools',
      icon: 'GitGraph',
    },
    {
      title: 'Microsoft 365 Developer Program',
      url: 'https://developer.microsoft.com/microsoft-365/dev-program',
      description: 'Free developer subscription with sample data',
      icon: 'Devices3',
    },
    {
      title: 'Graph Explorer',
      url: 'https://developer.microsoft.com/graph/graph-explorer',
      description: 'Test Microsoft Graph API calls',
      icon: 'NetworkTower',
    },
    {
      title: 'Fluent UI React',
      url: 'https://developer.microsoft.com/fluentui#/controls/web',
      description: 'UI components for React applications',
      icon: 'Ribbon',
    },
  ];

  const renderLinkCard = (link: ILink): React.ReactElement => {
    const isDisabled = link.requiresTenant && !tenantDomain;

    return (
      <div
        key={link.title}
        style={{
          padding: '16px',
          border: '1px solid #edebe9',
          borderRadius: '4px',
          backgroundColor: isDisabled ? '#f3f2f1' : '#ffffff',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
          <Icon
            iconName={link.icon}
            styles={{
              root: {
                fontSize: '24px',
                color: isDisabled ? '#a19f9d' : '#0078d4',
                marginRight: '12px',
                marginTop: '2px',
              },
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#323130',
                marginBottom: '4px',
              }}
            >
              {link.title}
            </div>
            <div style={{ fontSize: '13px', color: '#605e5c', marginBottom: '8px' }}>
              {link.description}
            </div>
            {isDisabled ? (
              <div style={{ fontSize: '12px', color: '#a19f9d', fontStyle: 'italic' }}>
                Open in SharePoint site to enable this link
              </div>
            ) : (
              <code
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#0078d4',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  wordBreak: 'break-all',
                  marginBottom: '8px',
                }}
              >
                {link.url}
              </code>
            )}
          </div>
        </div>
        <PrimaryButton
          text="Open"
          iconProps={{ iconName: 'OpenInNewWindow' }}
          onClick={() => window.open(link.url, '_blank')}
          disabled={isDisabled}
          styles={{
            root: {
              width: '100%',
            },
          }}
        />
      </div>
    );
  };

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Quick access to Azure, SharePoint admin portals, and developer resources. Links are
        auto-configured based on your SharePoint tenant.
      </MessageBar>

      {/* Tenant Info */}
      {tenantDomain && (
        <Section title="Your Tenant Information" icon="Info" defaultExpanded={true}>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#dff6dd',
              border: '1px solid #107c10',
              borderRadius: '4px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#323130' }}>Tenant Name:</strong>{' '}
              <code
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#ffffff',
                  borderRadius: '3px',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  fontSize: '13px',
                }}
              >
                {tenantName}
              </code>
            </div>
            <div>
              <strong style={{ color: '#323130' }}>Domain:</strong>{' '}
              <code
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#ffffff',
                  borderRadius: '3px',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  fontSize: '13px',
                }}
              >
                {tenantDomain}
              </code>
            </div>
          </div>
        </Section>
      )}

      {!tenantDomain && (
        <MessageBar messageBarType={MessageBarType.warning}>
          <strong>Note:</strong> Some links require SharePoint context. Open this page in a SharePoint
          site to enable tenant-specific URLs.
        </MessageBar>
      )}

      {/* Azure Links */}
      <Section title="Azure Resources" icon="AzureLogo" defaultExpanded={true}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {azureLinks.map(link => renderLinkCard(link))}
        </div>
      </Section>

      {/* SharePoint Links */}
      <Section title="SharePoint Administration" icon="SharepointLogo" defaultExpanded={true}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {sharePointLinks.map(link => renderLinkCard(link))}
        </div>
      </Section>

      {/* Developer Resources */}
      <Section title="Developer Resources" icon="Code" defaultExpanded={true}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {developerLinks.map(link => renderLinkCard(link))}
        </div>
      </Section>

      {/* Quick Tips */}
      <Section title="Quick Tips" icon="Lightbulb" defaultExpanded={false}>
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Azure Role Activation (PIM)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Many Azure resources require just-in-time role activation. Use the PIM link to activate
            your roles before accessing protected resources.
          </p>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            SharePoint App Catalog
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            After building your solution (.sppkg), upload it to the App Catalog to make it available
            across your tenant.
          </p>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Term Store Management
          </h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#323130' }}>
            Use Term Store to create managed metadata hierarchies for SPTaxonomyField components.
            Changes may take a few minutes to propagate.
          </p>
        </div>
      </Section>
    </Stack>
  );
};
