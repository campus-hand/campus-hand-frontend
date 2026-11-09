import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SiteRoutes } from '@/lib/routes';

interface LogoProps {
  size?: number;
  wordmarkClassName?: string;
  /** Colour of "HAND"; defaults to cobalt by day and yellow at night. */
  handClassName?: string;
  className?: string;
}

/** Rounded-square hand-and-cap logo with the CAMPUS HAND wordmark. */
export function Logo({
  size = 50,
  wordmarkClassName = 'text-[29px]',
  handClassName = 'wordmark-hand',
  className,
}: LogoProps) {
  return (
    <Link
      href={SiteRoutes.home}
      aria-label="Campus Hand home"
      className={cn('inline-flex items-center gap-2.5', className)}
    >
      <Image
        src="/brand/campus-hand-logo.svg"
        alt=""
        width={size}
        height={size}
        unoptimized
        priority
        className="block flex-none"
      />
      <span className={cn('display', wordmarkClassName)}>
        Campus <span className={handClassName}>Hand</span>
      </span>
    </Link>
  );
}
