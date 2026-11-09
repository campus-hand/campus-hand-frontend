import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { SiteRoutes } from '@/lib/routes';

/** Unbuilt pages land here while the platform is being built. */
export default function NotFound() {
  return (
    <main className="wrap flex min-h-dvh flex-col items-start justify-center gap-6 py-16">
      <Logo />
      <span className="sticker display text-xl">Coming soon</span>
      <h1 className="display text-[clamp(44px,7vw,88px)]">This page is on its way</h1>
      <p className="text-ink-2 max-w-[46ch] text-lg">
        We are still building this part of Campus Hand. Head back to the home page for now.
      </p>
      <Link href={SiteRoutes.home} className="btn btn-sun">
        Back to the home page
      </Link>
    </main>
  );
}
