/** Builds the links used by "Share on WhatsApp", "SMS" and "Copy link". */
export class ShareLinkBuilder {
  constructor(
    private readonly inviteUrl: string,
    private readonly message: string,
  ) {}

  get text(): string {
    return `${this.message} ${this.inviteUrl}`;
  }

  whatsapp(): string {
    return `https://wa.me/?text=${encodeURIComponent(this.text)}`;
  }

  sms(): string {
    return `sms:?&body=${encodeURIComponent(this.text)}`;
  }

  get url(): string {
    return this.inviteUrl;
  }

  /** Copies the invite link. Resolves false when the browser blocks it. */
  async copy(clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<boolean> {
    if (!clipboard) return false;
    try {
      await clipboard.writeText(this.inviteUrl);
      return true;
    } catch {
      return false;
    }
  }

  static forSite(siteUrl: string | undefined): ShareLinkBuilder {
    const base = (siteUrl ?? 'https://campushand.com').replace(/\/+$/, '');
    return new ShareLinkBuilder(
      base,
      'Past papers, notes and Magezi for our course units are on Campus Hand. Join and verify:',
    );
  }
}
