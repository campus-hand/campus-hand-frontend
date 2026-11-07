// Vercel "Ignored Build Step": exit 1 = build, exit 0 = skip.
// Only main (production) and development (staging) are built.
const ref = process.env.VERCEL_GIT_COMMIT_REF ?? '';
process.exit(['main', 'development'].includes(ref) ? 1 : 0);
