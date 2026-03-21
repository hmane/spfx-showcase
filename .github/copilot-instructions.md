# Copilot Instructions for `spfx-showcase`

This repository is an SPFx solution that demonstrates how to use `spfx-toolkit` in real SharePoint pages. Suggestions should favor clear, testable demos over clever abstractions.

## Project Context
- SPFx **1.21.1**
- **React 17**, **TypeScript**, **Fluent UI 8**
- `spfx-toolkit` is linked locally with `file:../spfx-toolkit`
- The solution contains two main web parts:
  - `src/webparts/showcase` for end-user toolkit demos
  - `src/webparts/developerToolkit` for generators, utilities, and guidance

## Toolkit Usage Rules
- Prefer public package entrypoints such as:
  - `spfx-toolkit/components/Card`
  - `spfx-toolkit/components/spForm`
  - `spfx-toolkit/components/spFields`
  - `spfx-toolkit/hooks`
  - `spfx-toolkit/utilities/context`
- Use `spfx-toolkit/lib/...` only when the package does not expose a public subpath for that type or implementation detail.
- Never import UI components from the package root.
- Load PnP bundles once through `src/webparts/pnpImports.ts`.
- Initialize `SPContext` once per web part in `onInit()`.

## Demo Solution Expectations
- Keep showcase examples easy to verify in a SharePoint site.
- Prefer guided flows, seeded sample data, and obvious success or error messages.
- When a demo depends on SharePoint artifacts, provide setup helpers or fallback instructions in the UI.
- Avoid overly complex sample code when a simpler scenario demonstrates the same capability.
- Code samples shown in the UI must match the current package import guidance.

## Developer Utilities Expectations
- Utilities should be deterministic, copy-friendly, and safe for browser-only execution.
- Prefer small pure helpers for parsing, formatting, and generation logic.
- Preserve user input on validation errors whenever possible.
- When clipboard APIs fail, provide graceful fallback behavior.
- Do not add dependencies for simple formatting or conversion tasks.

## Editing Rules
- Follow existing repo structure and naming.
- Use functional React components and explicit types.
- Reuse shared showcase building blocks before adding new layout patterns.
- Keep comments short and only where they reduce ambiguity.
- Do not edit generated SharePoint package output or release bundles by hand.

## Validation Workflow
- Run `npx tsc --noEmit` for quick validation after TypeScript changes.
- Run `npm run build` before considering the task complete.
- If demo behavior changes, verify related code samples and guidance text in:
  - `README.md`
  - `SPFX-Toolkit-Usage-Guide.md`
  - Developer guide tabs under `src/webparts/developerToolkit/components/DeveloperGuide`

## Avoid
- No hard-coded tenant-specific URLs.
- No `any` unless unavoidable and justified.
- No stale `spfx-toolkit/lib/...` examples when a public subpath exists.
- No new complexity in demos without a testing or learning benefit.
