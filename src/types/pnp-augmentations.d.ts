/**
 * Global PnP.js module augmentations.
 * Importing the modules here ensures TypeScript picks up the extended SPFI surface
 * (e.g. .web, .lists, .fields) without having to import them in every source file.
 */
import '@pnp/sp/webs';
import '@pnp/sp/site-users';
import '@pnp/sp/profiles';
import '@pnp/sp/site-groups/web';

import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/views';

import '@pnp/sp/fields';
import '@pnp/sp/fields/list';
import '@pnp/sp/column-defaults';
import '@pnp/sp/content-types';

import '@pnp/sp/files';
import '@pnp/sp/folders';
import '@pnp/sp/attachments';

import '@pnp/sp/appcatalog';
import '@pnp/sp/features';
import '@pnp/sp/navigation';
import '@pnp/sp/regional-settings';
import '@pnp/sp/user-custom-actions';

import '@pnp/sp/clientside-pages';
import '@pnp/sp/comments';
import '@pnp/sp/publishing-sitepageservice';

import '@pnp/sp/search';
import '@pnp/sp/favorites';
import '@pnp/sp/subscriptions';

import '@pnp/sp/taxonomy';
import '@pnp/sp/hubsites';

import '@pnp/sp/security';
import '@pnp/sp/sharing';
