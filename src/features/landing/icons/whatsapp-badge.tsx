import { WHATSAPP_GLYPH_PATH } from './whatsapp-glyph';

/**
 * WhatsApp's own mark (white glyph on its green) as a small Signboard
 * sticker: ink outline and hard offset shadow, like the footer's social stickers.
 * Decorative: the button text already says "Share on WhatsApp".
 */
export function WhatsAppBadge() {
  return (
    <span className="wa-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d={WHATSAPP_GLYPH_PATH} />
      </svg>
    </span>
  );
}
