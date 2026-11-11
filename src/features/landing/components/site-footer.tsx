import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { AppearanceSwitch } from '@/features/theme/appearance-switch';
import { landingContent } from '../content/landing-content';
import { KampalaHills } from '../icons/kampala-hills';
import { socialChannels } from '../icons/social-icons';

export function SiteFooter() {
  const { footer } = landingContent;
  const year = 2026; // TODO: derive at build time once the copyright line needs to roll over.

  return (
    <footer className="bg-ft-bg text-ft-ink relative overflow-hidden">
      <KampalaHills />
      <div className="wrap flex flex-col gap-12 pt-2.5">
        {/* No invite strip here: "Bring your whole class" just above already has the share buttons. */}
        <div className="flex flex-col items-start gap-4">
          <Logo size={72} wordmarkClassName="text-[44px]" handClassName="text-sun" />
          <p className="text-ft-mute max-w-[44ch] text-[16.5px]">{footer.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="eyebrow text-ft-mute">Appearance</h3>
            <AppearanceSwitch />
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-7 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]"
        >
          {footer.groups.map((group) => (
            <div key={group.title}>
              <h3 className="eyebrow text-ft-mute mb-1">{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="ft-link flex min-h-10 items-center text-[15.5px] font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="eyebrow text-ft-mute mb-1">Follow us</h3>
            <div className="ft-socials">
              <ul className="grid grid-cols-[repeat(4,42px)] gap-2">
                {socialChannels.map((channel) => (
                  <li key={channel.slug}>
                    <a
                      href={channel.href}
                      aria-label={channel.label}
                      className={`social-sticker ${channel.variant}`}
                      style={{ ['--brand' as string]: channel.brandColor }}
                    >
                      <svg viewBox={channel.viewBox} aria-hidden="true">
                        {channel.glyph}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        <div className="border-ft-rule flex flex-wrap items-center justify-between gap-x-7 gap-y-1 border-t pt-5">
          <p className="text-ft-mute text-sm">
            © {year} Campus Hand. {footer.rightsNotice}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-[18px] text-sm">
            {footer.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="ft-link flex min-h-10 min-w-11 items-center justify-center"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-ft-mute text-sm">{footer.payments}</p>
        </div>
      </div>
      <div className="wrap overflow-hidden" aria-hidden="true">
        <div
          className="giant-wordmark mb-[-0.11em] pt-10"
          data-word="Campus Hand"
          style={{ fontSize: 'min(190px, calc((100vw - 40px) / 6.05))' }}
        />
      </div>
    </footer>
  );
}
