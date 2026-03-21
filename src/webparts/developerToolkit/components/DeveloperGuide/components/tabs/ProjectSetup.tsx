import { MessageBar, MessageBarType, Stack } from '@fluentui/react';
import * as React from 'react';
import { ITabComponentProps } from '../../types/DeveloperGuideTypes';
import { CodeBlock } from '../shared/CodeBlock';
import { Section } from '../shared/Section';

/**
 * Project Setup tab - Gulpfile, tsconfig, package.json configuration
 */
export const ProjectSetup: React.FC<ITabComponentProps> = () => {
  const enhancedGulpfile = `'use strict';

// Core imports
const build = require('@microsoft/sp-build-web');
const bundleAnalyzer = require('webpack-bundle-analyzer');
const path = require('path');
const fs = require('fs');
const { task } = require('gulp');
const del = require('del');

// Fast serve configuration - let it handle HMR automatically
const { addFastServe } = require('spfx-fast-serve-helpers');

addFastServe(build, {
  serve: {
    open: false,
    port: 4321,
    https: true,
  },
});

// Disable SPFx warnings
build.addSuppression(/Warning - \\[sass\\]/g);
build.addSuppression(/Warning - lint.*/g);

// Main webpack configuration
build.configureWebpack.mergeConfig({
  additionalConfiguration: generatedConfiguration => {
    const isProduction = build.getConfig().production;

    // Configure path aliases to match tsconfig.json
    // These resolve at both TypeScript compilation and webpack bundling
    generatedConfiguration.resolve = generatedConfiguration.resolve || {};
    generatedConfiguration.resolve.alias = {
      ...generatedConfiguration.resolve.alias,
      '@src': path.resolve(__dirname, 'lib'),
      '@components': path.resolve(__dirname, 'lib/components'),
      '@hooks': path.resolve(__dirname, 'lib/hooks'),
      '@stores': path.resolve(__dirname, 'lib/stores'),
      '@schemas': path.resolve(__dirname, 'lib/schemas'),
      '@contexts': path.resolve(__dirname, 'lib/contexts'),
      '@appTypes': path.resolve(__dirname, 'lib/types'),
      '@services': path.resolve(__dirname, 'lib/services'),
      '@extensions': path.resolve(__dirname, 'lib/extensions'),
      '@sp': path.resolve(__dirname, 'lib/sp'),
    };

    // Enhanced module resolution
    generatedConfiguration.resolve.modules = [
      ...(generatedConfiguration.resolve.modules || []),
      'node_modules',
      path.resolve(__dirname, 'src'),
    ];
    generatedConfiguration.resolve.cache = true;

    // Tree-shaking optimizations
    generatedConfiguration.module = generatedConfiguration.module || {};
    generatedConfiguration.module.rules = generatedConfiguration.module.rules || [];

    // Mark packages as side-effect free for better tree-shaking
    // EXCEPT @pnp modules which have side effects (type augmentation)
    generatedConfiguration.module.rules.push({
      test: /\\.tsx?$/,
      exclude: [
        /node_modules\\/@pnp/,
        /node_modules\\/spfx-toolkit\\/(lib\\/)?utilities\\/context\\/pnpImports/
      ],
      sideEffects: false,
    });

    if (isProduction) {
      // Production optimizations
      generatedConfiguration.optimization = {
        ...generatedConfiguration.optimization,
        usedExports: true,
        sideEffects: false,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        // Note: SPFx Form Customizers don't support async chunk splitting
        // Disable to avoid "Unable to find entry point for async bundle" errors
        splitChunks: false,
      };

      // Production source maps
      generatedConfiguration.devtool = 'hidden-source-map';

      // Bundle analyzer
      generatedConfiguration.plugins.push(
        new bundleAnalyzer.BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: path.join(__dirname, 'temp', 'stats', 'bundle-report.html'),
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: path.join(__dirname, 'temp', 'stats', 'bundle-stats.json'),
          logLevel: 'warn',
        })
      );

      console.log('🏗️  Production build - Optimized for your dependency stack');
    } else {
      // Development optimizations - keep it simple
      generatedConfiguration.optimization = {
        ...generatedConfiguration.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
        splitChunks: false, // Disable code splitting in dev for faster builds
      };

      // Filesystem cache for faster rebuilds
      generatedConfiguration.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename, path.resolve(__dirname, 'tsconfig.json')],
        },
        cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
        name: 'spfx-dev-cache',
      };

      // Development source maps
      generatedConfiguration.devtool = 'eval-cheap-module-source-map';

      console.log('🔧 Development build - Fast compilation with filesystem cache');
    }

    return generatedConfiguration;
  },
});

// Utility tasks
task('clean-cache', done => {
  console.log('🧹 Clearing build caches...');
  const cacheDir = path.join(__dirname, 'node_modules/.cache');

  if (fs.existsSync(cacheDir)) {
    del.sync([cacheDir]);
    console.log('✅ Cache cleared successfully');
  } else {
    console.log('ℹ️  No cache found');
  }
  done();
});

task('analyze-bundle', done => {
  const reportPath = path.join(__dirname, 'temp', 'stats', 'bundle-report.html');

  if (fs.existsSync(reportPath)) {
    try {
      const open = require('open');
      open(reportPath)
        .then(() => {
          console.log('📊 Bundle analyzer opened');
          done();
        })
        .catch(() => {
          console.log(\`📊 Bundle report: \${reportPath}\`);
          done();
        });
    } catch {
      console.log(\`📊 Bundle report: \${reportPath}\`);
      done();
    }
  } else {
    console.log('❌ Run production build first');
    done();
  }
});

// Initialize build
build.initialize(require('gulp'));`;

  const tsconfigPaths = `{
  "extends": "./node_modules/@microsoft/rush-stack-compiler-5.3/includes/tsconfig-web.json",
  "compilerOptions": {
    "target": "es5",
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react",
    "declaration": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "outDir": "lib",
    "inlineSources": false,
    "noImplicitAny": true,
    "typeRoots": ["./node_modules/@types", "./node_modules/@microsoft"],
    "types": ["webpack-env"],
    "lib": ["es5", "dom", "es2015.collection", "es2015.promise", "es2020"],

    // Path aliases for cleaner imports
    "baseUrl": "./src",
    "paths": {
      "@src/*": ["*"],
      "@components/*": ["components/*"],
      "@hooks/*": ["hooks/*"],
      "@stores/*": ["stores/*"],
      "@schemas/*": ["schemas/*"],
      "@contexts/*": ["contexts/*"],
      "@appTypes/*": ["types/*"],
      "@services/*": ["services/*"],
      "@extensions/*": ["extensions/*"],
      "@sp/*": ["sp/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}`;

  const packageJsonScripts = `{
  "name": "spfx-project",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "gulp bundle",
    "serve": "fast-serve",
    "debug": "npm run clean && gulp bundle --ship=false && gulp package-solution --ship=false",
    "release": "npm run clean && gulp bundle --ship && gulp package-solution --ship",
    "clean": "gulp clean",
    "analyze": "gulp bundle --ship && echo '\\nBundle analysis complete. Check temp/stats.json for details.\\nPackage size:' && ls -lh sharepoint/solution/*.sppkg | awk '{print $5, $9}'",
    "type-check": "tsc --noEmit",
    "test:utilities": "tsc -p tsconfig.tests.json && node --test temp/test-build/tests/**/*.test.js"
  },
  "dependencies": {
    "@microsoft/sp-core-library": "1.21.1",
    "@microsoft/sp-lodash-subset": "1.21.1",
    "@microsoft/sp-office-ui-fabric-core": "1.21.1",
    "@microsoft/sp-property-pane": "1.21.1",
    "@microsoft/sp-webpart-base": "1.21.1",
    "react": "17.0.1",
    "react-dom": "17.0.1",
    "spfx-toolkit": "file:../spfx-toolkit"
  },
  "devDependencies": {
    "@microsoft/eslint-config-spfx": "1.21.1",
    "@microsoft/eslint-plugin-spfx": "1.21.1",
    "@microsoft/rush-stack-compiler-5.3": "0.1.0",
    "@microsoft/sp-build-web": "1.21.1",
    "@microsoft/sp-module-interfaces": "1.21.1",
    "@rushstack/eslint-config": "4.0.1",
    "@types/node": "^18.15.0",
    "@types/react": "17.0.45",
    "@types/react-dom": "17.0.17",
    "@types/webpack-env": "~1.15.2",
    "ajv": "^6.12.5",
    "del": "^6.1.1",
    "eslint": "8.57.1",
    "eslint-plugin-react-hooks": "4.3.0",
    "gulp": "4.0.2",
    "open": "10.2.0",
    "spfx-fast-serve-helpers": "~1.21.0",
    "typescript": "~5.3.3",
    "webpack-bundle-analyzer": "4.10.2"
  }
}`;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {/* Header */}
      <MessageBar messageBarType={MessageBarType.info}>
        Enhanced project configuration for optimal SPFx development experience with path aliases,
        webpack optimization, and useful npm scripts.
      </MessageBar>

      {/* Toolkit dependency setup */}
      <Section title="Toolkit Dependency Setup" icon="Package" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            This application currently consumes <strong>spfx-toolkit</strong> through a local file
            dependency. That is the preferred workflow when you are updating both the toolkit and
            the demo solution together.
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            1. Local linked workflow (current repo setup)
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Keep the toolkit repo beside this solution and rebuild it when entrypoints or generated
            output change:
          </p>
          <CodeBlock
            code={`cd ../spfx-toolkit
npm install
npm run build

cd ../spfx-showcase
npm install`}
            language="bash"
            filename="Local toolkit workflow"
            showLineNumbers={false}
          />

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '12px', marginBottom: '16px' } }}>
            <strong>Important:</strong> This is the recommended path for this application because it
            lets you validate current public imports such as <code>spfx-toolkit/components/...</code>
            immediately.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            2. Optional package feed workflow
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            If your team consumes a published internal toolkit package instead of the sibling repo,
            configure Azure Artifacts before installing packages:
          </p>
          <CodeBlock
            code={`# Example only - replace with your team's real feed values
registry=https://registry.npmjs.org/
@your-org:registry=https://pkgs.dev.azure.com/your-org/_packaging/your-feed/npm/registry/
always-auth=true

# Install vsts-npm-auth globally (one-time)
npm install -g vsts-npm-auth

# Run authentication in your project directory
vsts-npm-auth -config .npmrc

# Then install dependencies
npm install`}
            language="bash"
            filename=".npmrc + auth flow"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            3. Validate the local setup
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Once dependencies are installed, verify the repo against the current toolkit output:
          </p>
          <CodeBlock
            code={`npx tsc --noEmit
npm run test:utilities
npm run build`}
            language="bash"
            showLineNumbers={false}
          />

          <MessageBar messageBarType={MessageBarType.severeWarning} styles={{ root: { marginTop: '16px', marginBottom: '16px' } }}>
            <strong>Important:</strong> If the app shows missing subpath exports or stale generated
            code, rebuild <code>../spfx-toolkit</code> first. If you use the package-feed workflow,
            never commit <code>.npmrc</code> with an auth token.
          </MessageBar>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            4. Verify .gitignore
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            Confirm your <code>.gitignore</code> file includes these entries:
          </p>
          <CodeBlock
            code={`# Sensitive files - NEVER commit these
.npmrc
.env
.env.local
.env.*.local
*.local

# Credentials and tokens
credentials.json
*.key
*.pem`}
            language="bash"
            filename=".gitignore (excerpt)"
            showLineNumbers={false}
          />

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Token Expiration & Renewal
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            This only applies if you use the package-feed fallback. When the token expires:
          </p>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              You'll see <code>401 Unauthorized</code> errors when running npm install
            </li>
            <li style={{ marginBottom: '8px' }}>
              Re-run <code>vsts-npm-auth -config .npmrc</code> to generate a new token
            </li>
            <li style={{ marginBottom: '8px' }}>
              The tool automatically updates your .npmrc with the new token
            </li>
          </ul>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Common Issues
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f2f1' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #edebe9', fontWeight: 600 }}>
                    Error
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #edebe9', fontWeight: 600 }}>
                    Solution
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    error: '401 Unauthorized',
                    solution: 'Token expired or invalid. Re-run vsts-npm-auth -config .npmrc',
                  },
                  {
                    error: '404 Not Found',
                    solution: 'Registry URL incorrect. Verify organization and feed name in .npmrc',
                  },
                  {
                    error: 'E403 Forbidden',
                    solution: 'No access to Azure Artifacts feed. Request access from team lead',
                  },
                  {
                    error: 'Unable to authenticate',
                    solution: 'Check Azure DevOps permissions. May need Contributor role on feed',
                  },
                ].map((row, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf9f8' }}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #edebe9', fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace", color: '#d13438' }}>
                      {row.error}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #edebe9', color: '#323130' }}>
                      {row.solution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Package.json Scripts */}
      <Section title="Package.json Scripts" icon="Settings" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Essential npm scripts for common development tasks:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {[
              {
                command: 'npm run build',
                description: 'Development build with gulp bundle',
              },
              {
                command: 'npm run serve',
                description: 'Start fast-serve development server',
              },
              {
                command: 'npm run debug',
                description: 'Clean, build, and package for debugging',
              },
              {
                command: 'npm run release',
                description: 'Production build and package for deployment',
              },
              {
                command: 'npm run clean',
                description: 'Clean output folders and webpack cache',
              },
              {
                command: 'npm run stats',
                description: 'Generate and open bundle size analysis',
              },
              {
                command: 'npm run type-check',
                description: 'Type-check TypeScript without emitting files',
              },
            ].map((script, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  border: '1px solid #edebe9',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                }}
              >
                <code
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0078d4',
                    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                    marginBottom: '6px',
                  }}
                >
                  {script.command}
                </code>
                <div style={{ fontSize: '13px', color: '#605e5c' }}>{script.description}</div>
              </div>
            ))}
          </div>

          <CodeBlock
            code={packageJsonScripts}
            language="json"
            filename="package.json (scripts section)"
            showLineNumbers={true}
            maxHeight={400}
          />
        </div>
      </Section>

      {/* Enhanced Gulpfile */}
      <Section title="Enhanced Gulpfile Configuration" icon="BullseyeTarget" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Production-ready gulpfile.js with webpack optimizations, path aliases, and custom tasks:
          </p>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Key Features</h4>
          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Path Aliases:</strong> Clean imports with @components, @hooks, @stores, etc.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Webpack Optimization:</strong> Tree-shaking, caching, and bundle analysis
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Custom Tasks:</strong> clean-cache and analyze-bundle gulp tasks
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Fast-Serve Integration:</strong> 80% faster development builds
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Source Maps:</strong> Different strategies for dev vs production
            </li>
          </ul>

          <CodeBlock
            code={enhancedGulpfile}
            language="javascript"
            filename="gulpfile.js"
            showLineNumbers={true}
            maxHeight={600}
          />

          <MessageBar messageBarType={MessageBarType.success} styles={{ root: { marginTop: '16px' } }}>
            <strong>Pro Tip:</strong> Use <code>npm run stats</code> to visualize bundle size and
            identify optimization opportunities.
          </MessageBar>
        </div>
      </Section>

      {/* TSConfig with Paths */}
      <Section title="TypeScript Configuration with Path Aliases" icon="FileCode" defaultExpanded={true}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#323130' }}>
            Configure TypeScript with path aliases for cleaner, more maintainable imports:
          </p>

          <CodeBlock
            code={tsconfigPaths}
            language="json"
            filename="tsconfig.json"
            showLineNumbers={true}
            maxHeight={400}
          />

          <h4 style={{ margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Path Alias Benefits
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                padding: '16px',
                border: '1px solid #edebe9',
                borderRadius: '4px',
                backgroundColor: '#fff4ce',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#d13438' }}>
                ❌ Without Path Aliases
              </div>
              <code
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  color: '#323130',
                }}
              >
                {`import { MyComponent } from '../../../components/MyComponent';
import { useAuth } from '../../../../hooks/useAuth';
import { IUser } from '../../../../../types/IUser';`}
              </code>
            </div>
            <div
              style={{
                padding: '16px',
                border: '1px solid #edebe9',
                borderRadius: '4px',
                backgroundColor: '#dff6dd',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#107c10' }}>
                ✅ With Path Aliases
              </div>
              <code
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                  color: '#323130',
                }}
              >
                {`import { MyComponent } from '@components/MyComponent';
import { useAuth } from '@hooks/useAuth';
import { IUser } from '@appTypes/IUser';`}
              </code>
            </div>
          </div>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Available Path Aliases
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f2f1' }}>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Alias
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Resolves To
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #edebe9',
                      fontWeight: 600,
                    }}
                  >
                    Use For
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { alias: '@src/*', path: 'src/*', use: 'Root level imports' },
                  { alias: '@components/*', path: 'src/components/*', use: 'React components' },
                  { alias: '@hooks/*', path: 'src/hooks/*', use: 'Custom React hooks' },
                  { alias: '@stores/*', path: 'src/stores/*', use: 'Zustand stores' },
                  { alias: '@schemas/*', path: 'src/schemas/*', use: 'Zod validation schemas' },
                  { alias: '@contexts/*', path: 'src/contexts/*', use: 'React contexts' },
                  { alias: '@appTypes/*', path: 'src/types/*', use: 'TypeScript interfaces' },
                  { alias: '@services/*', path: 'src/services/*', use: 'API/business logic' },
                  { alias: '@extensions/*', path: 'src/extensions/*', use: 'SPFx extensions' },
                  { alias: '@sp/*', path: 'src/sp/*', use: 'SharePoint utilities' },
                ].map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf9f8',
                    }}
                  >
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                        fontSize: '13px',
                        color: '#0078d4',
                      }}
                    >
                      {row.alias}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                        fontSize: '13px',
                        color: '#605e5c',
                      }}
                    >
                      {row.path}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #edebe9',
                        color: '#323130',
                      }}
                    >
                      {row.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <MessageBar messageBarType={MessageBarType.info} styles={{ root: { marginTop: '16px' } }}>
            <strong>Note:</strong> VS Code IntelliSense works automatically with these path aliases.
            No additional configuration needed!
          </MessageBar>
        </div>
      </Section>

      {/* Node Version Management */}
      <Section title="Node Version Management (NVM)" icon="NodeVersion" defaultExpanded={false}>
        <div>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#323130' }}>
            We use NVM (Node Version Manager) installed via Software Center to manage Node.js versions.
          </p>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Installation
          </h4>
          <ol style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', color: '#323130' }}>
            <li style={{ marginBottom: '8px' }}>
              Open <strong>Software Center</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Search for <strong>"NVM"</strong> or <strong>"Node Version Manager"</strong>
            </li>
            <li style={{ marginBottom: '8px' }}>
              Install and restart your terminal
            </li>
          </ol>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            Common NVM Commands
          </h4>
          <div style={{ marginBottom: '16px' }}>
            <CodeBlock
              code={`# List available Node.js versions
nvm list available

# Install Node.js v18 LTS (required for SPFx 1.21)
nvm install 18

# Use Node.js v18
nvm use 18

# Set Node.js v18 as default
nvm alias default 18

# Check current Node version
node --version

# Check current NPM version
npm --version`}
              language="bash"
              filename="NVM Commands"
              showLineNumbers={false}
            />
          </div>

          <MessageBar messageBarType={MessageBarType.warning}>
            <strong>SPFx 1.21.1 requires Node.js v18 LTS.</strong> Always verify you're using the
            correct Node version before running npm install.
          </MessageBar>
        </div>
      </Section>
    </Stack>
  );
};
