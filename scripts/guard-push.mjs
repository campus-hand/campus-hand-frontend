// Blocks `git push` straight to main/development once they exist on GitHub.
// The very first push of each branch (remote sha all zeros) is allowed.
// Emergency override: $env:ALLOW_PROTECTED_PUSH = "1"
import { readFileSync } from 'node:fs';
const PROTECTED = ['refs/heads/main', 'refs/heads/development'];
const NEW_BRANCH = /^0+$/;
let input = '';
try {
  input = readFileSync(0, 'utf8');
} catch {
  /* no stdin */
}
if (process.env.ALLOW_PROTECTED_PUSH === '1') process.exit(0);
for (const line of input.split('\n').filter(Boolean)) {
  const [, , remoteRef, remoteSha] = line.trim().split(/\s+/);
  if (PROTECTED.includes(remoteRef) && !NEW_BRANCH.test(remoteSha ?? '')) {
    console.error(`\n✖ Direct push to ${remoteRef.replace('refs/heads/', '')} is blocked.`);
    console.error('  Push a feature/* branch and open a pull request instead.\n');
    process.exit(1);
  }
}
