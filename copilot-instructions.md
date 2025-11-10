# Copilot Instructions for `spfx-toolkit`

This repository contains a **library**, not an SPFx solution. Every suggestion from Copilot must respect the rules below so consuming SPFx projects stay lean and stable.

## 1. Project Context
- SharePoint Framework ≥ **1.21.1** compatibility.
- **React 17**, **TypeScript strict**, **Fluent UI 8**.
- Tree-shakable exports under `lib/components`, `lib/hooks`, `lib/utilities`.
- **Zero runtime dependencies**. Only peer dependencies listed in `package.json` may be referenced.
- All code lives under `src/` and uses **relative imports** (no path aliases).

## 2. Pre-Drafting Checklist
1. Confirm the feature belongs in the toolkit (reusable across SPFx projects).
2. Open/scan an adjacent file (Copilot relies on nearby context).
3. Add interfaces/types first; mention tree-shakable import expectations in comments.
4. Keep bundle size in mind: prefer native utilities over pulling in dependencies.
5. Run `npm run lint` or `npm run build` to ensure the project is clean before requesting large completions.

## 3. Coding Standards
- **Functional React components only**. No class components.
- Type every prop, state, and handler explicitly.
- Follow file structure: component + `.module.scss` (if styles are needed) + `.types.ts`.
- Use existing abstractions (`SPContext`, `createSPExtractor`, form primitives) instead of re‑implementing logic.
- Prefer composition over inheritance; keep components focused.
- Every new helper/util exports from the relevant `index.ts` barrel.

### Relative Imports (Mandatory)
```ts
// ✅ Allowed
import { Header } from '../Header';
import { formatFieldValue } from '../../utilities/listItemHelper';

// ❌ Forbidden (Copilot must NOT propose these)
import { Header } from '@components/Header';
import '@/utilities/listItemHelper';
```

### Tree-Shakable Exports
```ts
// ✅ Re-export in index files
export * from './Card';

// ✅ Consumers will import like:
// import { Card } from 'spfx-toolkit/lib/components/Card';
```

## 4. PnP & SP Context Rules
- Toolkit modules may import PnP packages, but only through the existing bundles under `src/utilities/context/pnpImports/*`.
- Keep `src/types/pnp-augmentations.d.ts` in sync when adding new PnP capabilities.
- `SPContext` (under `utilities/context`) is responsible for initializing PnP—never add per-component PnP setup.

## 5. Build & Validation Workflow
| Command | Purpose |
| ------- | ------- |
| `npm run build` | Clean + compile + validate output |
| `npm run watch` | Watch mode for local development |
| `npm run validate` | Ensures required lib files exist |

Before opening a PR:
1. `npm run build`
2. `npm run lint` (if needed)
3. Verify `lib/` output or run `npm run build:full` when publishing

## 6. Documentation & Samples
- Document every component/hook in `SPFX-Toolkit-Usage-Guide.md`.
- Update `README.md` feature tables when adding new modules.
- Provide sample usage (preferably in markdown) showcasing props and expected patterns.

## 7. Testing & QA
- Add unit tests or story-like examples when practical.
- Ensure accessible markup (ARIA roles, labels, keyboard navigation).
- Run bundle-size sanity checks if a component pulls in large sub-dependencies (DevExtreme, etc.).

## 8. Versioning & Releases
- This repo follows semver but releases are manual. When changing public APIs, update the changelog section in `SPFX-Toolkit-Usage-Guide.md`.
- Do **not** bump versions automatically; maintainers handle publishing.

## 9. PR / Commit Guidance
- Use Conventional Commits (`feat(card): add footer actions`).
- Include bullet summaries describing behavior, bundle impact, and testing.
- Point reviewers to docs updates and usage samples.

## 10. Absolute “No-Go” Rules
- ❌ No new npm dependencies (runtime or dev) without explicit maintainer approval.
- ❌ No direct DOM manipulation; always go through React.
- ❌ No copying code from consumer solutions into the toolkit.
- ❌ No hard-coded tenant/site URLs.
- ❌ No `any` – use `unknown` + type guards when unavoidable.
- ❌ No `console.log` — use the toolkit logger utilities or remove before commit.

Keep the toolkit lean, tree-shakable, and consumer-friendly. EOF
