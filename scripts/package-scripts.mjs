// Adds the Campus Hand npm scripts to package.json (run by setup.ps1).
import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.name = 'campus-hand-frontend';
Object.assign(pkg.scripts, {
  typecheck: 'tsc --noEmit',
  test: 'vitest run',
  'test:watch': 'vitest',
  'test:cov': 'vitest run --coverage',
  'test:e2e': 'playwright test',
  format: 'prettier --write .',
  size: 'size-limit',
  'api:sync': 'openapi-typescript http://localhost:4000/docs-json -o src/lib/api/schema.d.ts',
});
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
console.log('package.json scripts updated');
