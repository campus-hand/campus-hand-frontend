'use client';

import { Check, Copy, MessageCircle, MessageSquareText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ShareLinkBuilder } from '../models/share-link-builder';

interface ShareActionsProps {
  /** Show the SMS button (the invite band has it, the footer strip does not). */
  withSms?: boolean;
  /** Button style for "Share on WhatsApp": yellow on the green band, ink on the yellow strip. */
  whatsappClassName?: string;
  size?: 'lg' | 'md';
}

/** "Share on WhatsApp", "Copy link" and optional "SMS" for the invite link. */
export function ShareActions({
  withSms = false,
  whatsappClassName = 'btn-sun',
  size = 'md',
}: ShareActionsProps) {
  const share = useMemo(() => ShareLinkBuilder.forSite(process.env.NEXT_PUBLIC_SITE_URL), []);
  const [copied, setCopied] = useState<boolean | null>(null);
  const height = size === 'lg' ? 'min-h-14' : '';

  async function handleCopy() {
    setCopied(await share.copy(navigator.clipboard));
    window.setTimeout(() => setCopied(null), 2500);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={share.whatsapp()}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn ${whatsappClassName} ${height} ${size === 'lg' ? 'px-[26px] text-[17px]' : ''}`}
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        Share on WhatsApp
      </a>
      <button type="button" onClick={handleCopy} className={`btn btn-line ${height}`}>
        {copied ? (
          <Check className="size-5" aria-hidden="true" />
        ) : (
          <Copy className="size-5" aria-hidden="true" />
        )}
        {copied ? 'Link copied' : copied === false ? 'Copy failed' : 'Copy link'}
      </button>
      {withSms ? (
        <a href={share.sms()} className={`btn btn-line ${height}`}>
          <MessageSquareText className="size-5" aria-hidden="true" />
          SMS
        </a>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Invite link copied' : ''}
      </span>
    </div>
  );
}
