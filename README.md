# SPFx Toolkit Showcase

> Comprehensive showcase and demo application for the **spfx-toolkit** library - A powerful toolkit for SharePoint Framework development.

![version](https://img.shields.io/badge/SPFx-1.21.1-green.svg)
![version](https://img.shields.io/badge/Node.js-18.x-blue.svg)
![version](https://img.shields.io/badge/React-17.x-blue.svg)

## Overview

This project serves as a comprehensive showcase and documentation platform for the `spfx-toolkit` library. It demonstrates all available components, hooks, and utilities with live, interactive examples, configuration options, and sample code.

### Key Features

- **📦 15+ Interactive Demos** - Live demonstrations of all toolkit components
- **🎨 Modern UI/UX** - Professional, consistent interface built with Fluent UI v8
- **⚙️ Configurable Examples** - Real-time configuration panels for each demo
- **📝 Code Samples** - Syntax-highlighted code examples with copy functionality
- **🛠️ Developer Tools** - 16 utility tools for SharePoint development
- **📖 Comprehensive Documentation** - Detailed guides and API references

## Used SharePoint Framework Version

![SPFx](https://img.shields.io/badge/SPFx-1.21.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- SharePoint Online
- SharePoint 2019/2016 (with limitations)

## Prerequisites

- Node.js v18.x LTS
- SharePoint Online or SharePoint 2019/2016
- Global installation of `@microsoft/generator-sharepoint`
- Access to a SharePoint site

## Solution

| Solution    | Author(s) |
| ----------- | --------- |
| spfx-showcase | Hemant Mane |

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd spfx-showcase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Solution

```bash
npm run build
```

### 4. Run Locally

```bash
gulp serve
```

### 5. Deploy to SharePoint

```bash
gulp bundle --ship
gulp package-solution --ship
```

Upload the `.sppkg` file from `sharepoint/solution/` to your App Catalog.

## Project Structure

```
spfx-showcase/
├── src/
│   ├── components/              # Global shared components
│   │   ├── CodeDisplay/        # Custom syntax highlighter
│   │   ├── ConfigurationPanel/ # Collapsible config panels
│   │   ├── DemoSection/        # Demo layout wrapper
│   │   └── ListItemSelector/   # Reusable list/item picker
│   ├── utils/                  # Global utilities
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useListItemSelector.ts
│   │   │   ├── useActivityLog.ts
│   │   │   ├── useSPContext.ts
│   │   │   └── useConfigPanel.ts
│   │   ├── logger.ts          # Centralized logging
│   │   ├── constants.ts       # Design tokens & constants
│   │   ├── spHelpers.ts       # SharePoint operations
│   │   └── codeTemplates.ts   # Reusable code samples
│   └── webparts/
│       ├── showcase/          # Main showcase web part
│       │   └── components/
│       │       ├── shared/    # Showcase-specific shared
│       │       │   ├── ShowcaseCodeSample.tsx
│       │       │   ├── ShowcaseHero.tsx
│       │       │   └── ShowcaseKeyFeatures.tsx
│       │       └── demos/     # Individual demo components
│       │           ├── CardShowcase.tsx
│       │           ├── FormShowcase.tsx
│       │           ├── SPFieldsShowcase.tsx
│       │           └── ...
│       └── developerToolkit/  # Developer utilities web part
└── README.md
```

## Available Demos

### UI Components

1. **Card System** - Flexible card components with headers, footers, and accordions
2. **Form Components** - DevExtreme inputs with React Hook Form integration
3. **SharePoint Fields** - Native SharePoint field components (10+ field types)
4. **SP Dynamic Form** - Auto-generated forms from SharePoint list schemas
5. **User Persona** - Rich user profile display with multiple sizes and modes
6. **Workflow Stepper** - Step-by-step workflow navigation
7. **Error Boundary** - Smart error handling with retry functionality

### SharePoint Integration

8. **Group User Picker** - Select users from SharePoint groups
9. **Group Viewer** - Display SharePoint group members
10. **Manage Access** - Permission management interface
11. **Document Link** - Document linking with preview
12. **Version History** - Item version history viewer

### Utilities & Hooks

13. **React Hooks** - useLocalStorage, useViewport, and more
14. **Developer Guide** - Comprehensive development documentation

## Developer Toolkit

16 built-in utility tools:

- **CAML Query Builder** - Build and test CAML queries
- **Form Generator** - Generate forms from TypeScript interfaces
- **SP Form Builder** - Generate forms from SharePoint lists
- **Color Converter** - Convert between color formats
- **Content Type ID Utility** - Work with content type IDs
- **Cron Expression Utility** - Build cron expressions
- **CSS Minifier** - Minify CSS code
- **CSV/JSON Converter** - Convert between formats
- **GUID Generator** - Generate GUIDs
- **JSON Column Formatter** - Format SharePoint columns
- **JSON Formatter** - Format and validate JSON
- **JWT Decoder** - Decode JWT tokens
- **Lorem Ipsum Generator** - Generate placeholder text
- **PnP Field Schema Utility** - Work with field schemas
- **Query String Utility** - Parse and build query strings
- **Text Escape Utility** - Escape text for different contexts
- **TypeScript String Utility** - Work with TypeScript strings
- **URL Encoder** - Encode/decode URLs
- **XML Formatter** - Format and validate XML

## Architecture

### Design Principles

1. **Code Reusability** - Centralized components, hooks, and utilities
2. **Consistency** - Standardized patterns across all demos
3. **Performance** - Optimized rendering with React best practices
4. **Accessibility** - ARIA labels, keyboard navigation, screen reader support
5. **Type Safety** - Full TypeScript with strict typing
6. **Documentation** - JSDoc comments and inline documentation

### Technology Stack

- **SharePoint Framework** 1.21.1
- **React** 17.x
- **TypeScript** 5.3.x
- **Fluent UI** v8 (Office UI Fabric React)
- **PnP JS** - SharePoint operations
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **DevExtreme React** - Advanced UI controls

### Key Features

- **Custom Code Display** - Lightweight syntax highlighter (no external packages)
- **Centralized Logging** - SPFx Log framework integration
- **Activity Tracking** - Built-in activity log hook
- **Safe Context Access** - Error-handled SharePoint context
- **Configuration Management** - Persistent panel state with localStorage

## Scripts

```bash
# Development
npm run serve           # Start development server
npm run build           # Build for debugging
npm run clean           # Clean build artifacts

# Production
npm run ship            # Build for production
npm run package         # Create .sppkg package

# Quality
npm run lint            # Run ESLint
npm run test            # Run tests (if configured)
```

## Configuration

### Web Part Properties

Both web parts (Showcase and Developer Toolkit) support configuration through the SharePoint property pane:

- Title customization
- Theme selection
- Display options
- Layout preferences

## Best Practices Demonstrated

- ✅ Proper error handling and logging
- ✅ Memory leak prevention (cleanup in useEffect)
- ✅ Performance optimization (useMemo, useCallback, React.memo)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Code organization and folder structure
- ✅ Component composition and reusability
- ✅ TypeScript best practices
- ✅ SharePoint API integration patterns
- ✅ **Centralized PnP imports** for type safety and consistency

### Centralized PnP Setup

PnPjs is loaded once per web part and its typings are registered globally. Keep these two shared files in sync:

```typescript
// src/webparts/pnpImports.ts
// Runtime side effects loaded once at each web part entry point
import 'spfx-toolkit/utilities/context/pnpImports/core';
import 'spfx-toolkit/utilities/context/pnpImports/lists';
import 'spfx-toolkit/utilities/context/pnpImports/content';

// Optional bundles – add only what you need
// import 'spfx-toolkit/utilities/context/pnpImports/files';
// import 'spfx-toolkit/utilities/context/pnpImports/search';
// import 'spfx-toolkit/utilities/context/pnpImports/taxonomy';
// import 'spfx-toolkit/utilities/context/pnpImports/security';
```

```typescript
/**
 * src/types/pnp-augmentations.d.ts
 * TypeScript-only imports that teach SPFI about .web, .lists, etc.
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
```

**Rules**
- Each web part entry (`ShowcaseWebPart.ts`, `DeveloperToolkitWebPart.ts`, etc.) must `import '../pnpImports';`.
- Feature code never imports `@pnp/sp/...` directly—use `SPContext` for data access.
- `.d.ts` files disappear at build time, so there is **no bundle-size impact**.
- When you need a new module, add it to both `src/webparts/pnpImports.ts` (runtime) and `src/types/pnp-augmentations.d.ts` (types).

See `docs/STANDARDS.md` for the full checklist.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the existing code structure and patterns
2. Add JSDoc comments to all public APIs
3. Use the shared utilities and components
4. Test your changes thoroughly
5. Update documentation as needed

## Troubleshooting

### Build Errors

- Ensure Node.js version is 18.x LTS
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear SPFx build cache: `gulp clean`

### Runtime Issues

- Check browser console for errors
- Verify SharePoint permissions
- Ensure spfx-toolkit is properly installed

## License

This project is licensed under the MIT License.

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## References

- [spfx-toolkit Documentation](https://github.com/your-org/spfx-toolkit)
- [SharePoint Framework](https://aka.ms/spfx)
- [Fluent UI React](https://developer.microsoft.com/en-us/fluentui)
- [PnP JS](https://pnp.github.io/pnpjs/)
- [React Hook Form](https://react-hook-form.com/)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check existing documentation
- Review the demo code in the showcase

---

**Built with ❤️ for the SharePoint community**
