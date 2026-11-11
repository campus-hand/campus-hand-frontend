'use client';

import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Follow a course unit to hear about new notes and papers.
 * TODO(backend): save to the API; for now it only changes on this screen.
 */
export function FollowButton({
  code,
  initiallyFollowing,
  className,
}: {
  code: string;
  initiallyFollowing: boolean;
  className?: string;
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const Icon = following ? Bell : BellOff;
  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={`Follow ${code}`}
      onClick={() => setFollowing((f) => !f)}
      className={cn('btn btn-line', className)}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span aria-hidden="true">{following ? 'Following' : 'Follow'}</span>
    </button>
  );
}
