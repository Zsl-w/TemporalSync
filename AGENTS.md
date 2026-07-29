# TemporalSync Project Instructions

## Project

- Name: TemporalSync
- Stack: React 19, TypeScript 5.8, React Router 7, Vite 6, Tailwind CSS 4, Express 4
- Package manager: npm (`package-lock.json` is the source of truth)
- Main directories: `src/`, `node-functions/`, `public/`, `scripts/`

## Commands

- Development: `npm run dev`
- Type check: `npm run lint`
- Production build: `npm run build`
- Server bundle: `npm run build:server`

## Working Rules

- Keep changes small and tied directly to the requested outcome.
- Reuse existing components, hooks, utilities, and design tokens before adding abstractions.
- Use strict TypeScript at application and API boundaries; do not introduce `any` without a documented reason.
- Validate untrusted input at server and external-service boundaries.
- Never read, print, commit, or document secret values. Environment variable names may be documented.
- Preserve unrelated user changes in a dirty worktree.
- For UI changes, verify desktop and mobile rendering before handoff when the runtime is available.
- MANDATORY GIT WORKFLOW: Never automatically push to GitHub or merge branches. Follow the 3-step user-controlled workflow: (1) Develop on local feature branch -> user inspects locally at http://localhost:3000 -> STOP and wait for user instruction. (2) Push feature branch to GitHub ONLY on explicit user command -> provide PR/preview link -> STOP and wait for user instruction. (3) Merge feature branch to main ONLY on explicit user command.

## Verification

- Run `npm run lint` for code changes.
- Run `npm run build` for production-impacting changes.
- Exercise the affected route with representative input.
- For visual changes, capture and inspect rendered screenshots.

## Deployment

- Vite produces static assets in `dist/`.
- The Express server is bundled separately with `npm run build:server`.
- EdgeOne configuration lives in `edgeone.json`, `_routes.json`, and `node-functions/`.
