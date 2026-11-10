/** The slice of window the controller needs (lets tests pass a fake). */
export interface ScrollSource {
  readonly scrollY: number;
  addEventListener(type: 'scroll', listener: () => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'scroll', listener: () => void): void;
}

/** Where the header height is published as a CSS variable (<html> in the browser). */
export interface CssVariableTarget {
  readonly style: { setProperty(name: string, value: string): void };
}

/** The sticky header element: its height and the "scrolled" flag. */
export interface HeaderElement {
  readonly offsetHeight: number;
  toggleAttribute(name: string, force: boolean): void;
}

/** Watches size changes (ResizeObserver in the browser). */
export interface SizeWatcher<T> {
  observe(target: T): void;
  disconnect(): void;
}

export const HEADER_HEIGHT_VAR = '--header-h';
export const SCROLLED_ATTRIBUTE = 'data-scrolled';

/**
 * Keeps the sticky site header in sync with the page:
 * - marks the header as scrolled once the page leaves the top, so it can
 *   draw its own bottom line (at the top the hero's line sits under it);
 * - publishes the header's height as --header-h, so in-page links
 *   (#units, #magezi, ...) land below the header instead of under it.
 */
export class StickyHeaderController<T extends HeaderElement = HeaderElement> {
  private sizeWatcher: SizeWatcher<T> | null = null;

  constructor(
    private readonly header: T,
    private readonly scroll: ScrollSource,
    private readonly root: CssVariableTarget,
    private readonly createSizeWatcher: ((onResize: () => void) => SizeWatcher<T>) | null,
  ) {}

  start(): void {
    this.update();
    this.scroll.addEventListener('scroll', this.update, { passive: true });
    this.sizeWatcher = this.createSizeWatcher?.(this.publishHeight) ?? null;
    this.sizeWatcher?.observe(this.header);
  }

  stop(): void {
    this.scroll.removeEventListener('scroll', this.update);
    this.sizeWatcher?.disconnect();
    this.sizeWatcher = null;
  }

  isScrolled(): boolean {
    return this.scroll.scrollY > 0;
  }

  private readonly update = (): void => {
    this.header.toggleAttribute(SCROLLED_ATTRIBUTE, this.isScrolled());
    this.publishHeight();
  };

  private readonly publishHeight = (): void => {
    this.root.style.setProperty(HEADER_HEIGHT_VAR, `${this.header.offsetHeight}px`);
  };
}
