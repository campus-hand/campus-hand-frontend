# Campus Hand frontend setup — run once after create-next-app + copying the kit.
$ErrorActionPreference = 'Stop'
Write-Host '> pinning pnpm version' -ForegroundColor Cyan
pnpm pkg set "packageManager=pnpm@$(pnpm -v)"

Write-Host '> allowing install scripts for lefthook and esbuild (pnpm 11 blocks them by default)' -ForegroundColor Cyan
Add-Content pnpm-workspace.yaml "  lefthook: true`n  esbuild: true"

Write-Host '> runtime libraries' -ForegroundColor Cyan
pnpm add @tanstack/react-query openapi-fetch react-hook-form '@hookform/resolvers' zod better-auth lucide-react

Write-Host '> dev tools' -ForegroundColor Cyan
pnpm add -D vitest '@vitest/coverage-v8' '@vitejs/plugin-react' vite-tsconfig-paths jsdom '@testing-library/react' '@testing-library/dom' '@testing-library/jest-dom' '@testing-library/user-event' msw '@playwright/test' '@axe-core/playwright' prettier prettier-plugin-tailwindcss lefthook '@commitlint/cli' '@commitlint/config-conventional' openapi-typescript size-limit '@size-limit/file' '@lhci/cli'

Write-Host '> scripts' -ForegroundColor Cyan
node scripts/package-scripts.mjs

Write-Host '> .gitignore additions' -ForegroundColor Cyan
Add-Content .gitignore "`n# Campus Hand`n!.env.example`n/playwright-report`n/test-results`n/.lighthouseci"

Write-Host '> shadcn/ui (answer the prompts: base colour Neutral)' -ForegroundColor Cyan
pnpm dlx shadcn@latest init

Write-Host '> browsers + git hooks' -ForegroundColor Cyan
pnpm exec playwright install chromium
pnpm exec lefthook install

Write-Host '> formatting everything once' -ForegroundColor Cyan
pnpm format

Write-Host 'Done. Next: Copy-Item .env.example .env.local; pnpm dev' -ForegroundColor Green
