# Personal Diagram Studio

A multi-diagram, multi-engine visual engineering workspace built with Next.js, React Flow, GoJS, and Excalidraw.

## Key Features

- **Multi-Diagram Project Architecture**: One project container holds unlimited independent diagrams across different engines.
- **Three Powerful Diagram Engines**:
  - **Excalidraw**: Freeform sketches, wireframes, and whiteboards.
  - **React Flow**: Interactive flowcharts, activity diagrams, workflows, and pipelines.
  - **GoJS**: Relational database entity-relationship diagrams (ERDs) and schemas.
- **Project Templates**: Start blank or with pre-configured domain templates (Software Engineering, Database Design, Security, DevOps, UI/UX, etc.).
- **Independent Document Lifecycle**: Dedicated per-diagram debounced autosave, in-place renaming, independent duplication, cross-project migration, and safe deletion.
- **Secure Architecture**: Server-managed HttpOnly sessions with Firestore security rules preventing IDOR / BOLA vulnerabilities.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check & Lint
pnpm lint
npx tsc --noEmit

# Production build
pnpm build
```
