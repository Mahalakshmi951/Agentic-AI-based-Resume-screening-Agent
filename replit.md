# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **PDF parsing**: pdf-parse (server-side)
- **Excel export**: xlsx / SheetJS (frontend)

## Artifacts

### AI Recruiter (`artifacts/ai-recruiter`)
- React + Vite frontend at `/`
- Upload job description PDF + multiple resume PDFs
- AI analyzes each resume against the job description using OpenAI
- Results table with Name, Type, Email, Contact, Top 3 Skills, Summary, Pros, Cons, Rating, Decision
- Export results to Excel (.xlsx) file
- Decision logic: Score > 70 = Selected, 40-70 = Review, < 40 = Rejected

### API Server (`artifacts/api-server`)
- Express 5 API server
- `POST /api/recruiter/analyze` — accepts base64 PDFs, returns analysis results
- Uses pdf-parse to extract text from PDFs
- Uses OpenAI gpt-5.2 to analyze resumes against job description
- Body size limit: 50MB

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Notes

- The api-zod codegen index.ts fix: codegen overwrites `lib/api-zod/src/index.ts` with both generated/api and generated/types causing duplicates. The codegen script in `lib/api-spec/package.json` runs a node one-liner after orval to fix the index.ts to only export from `generated/api`.
- The `lib/api-zod/tsconfig.json` includes `"dom"` in its lib to support File/Blob types from generated code.
