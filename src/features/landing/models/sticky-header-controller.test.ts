import { describe, expect, it, vi } from 'vitest';
import {
  HEADER_HEIGHT_VAR,
  SCROLLED_ATTRIBUTE,
  StickyHeaderController,
  type ScrollSource,
} from './sticky-header-controller';

function setup({ scrollY = 0, height = 84, withSizeWatcher = true } = {}) {
  let onScroll: (() => void) | null = null;
  let onResize: (() => void) | null = null;
  const scroll = {
    scrollY,
    addEventListener: vi.fn((_type: 'scroll', listener: () => void) => {
      onScroll = listener;
    }),
    removeEventListener: vi.fn(),
  } satisfies ScrollSource & { scrollY: number };
  const header = { offsetHeight: height, toggleAttribute: vi.fn() };
  const root = { style: { setProperty: vi.fn() } };
  const watcher = { observe: vi.fn(), disconnect: vi.fn() };
  const controller = new StickyHeaderController(
    header,
    scroll,
    root,
    withSizeWatcher
      ? (callback) => {
          onResize = callback;
          return watcher;
        }
      : null,
  );
  return {
    controller,
    scroll,
    header,
    root,
    watcher,
    fireScroll: () => onScroll?.(),
    fireResize: () => onResize?.(),
  };
}

describe('StickyHeaderController', () => {
  it('starts unscrolled at the top and publishes the header height', () => {
    const { controller, header, root, watcher } = setup();
    controller.start();
    expect(header.toggleAttribute).toHaveBeenLastCalledWith(SCROLLED_ATTRIBUTE, false);
    expect(root.style.setProperty).toHaveBeenLastCalledWith(HEADER_HEIGHT_VAR, '84px');
    expect(watcher.observe).toHaveBeenCalledWith(header);
  });

  it('marks the header as scrolled once the page leaves the top', () => {
    const { controller, scroll, header, fireScroll } = setup();
    controller.start();
    scroll.scrollY = 300;
    fireScroll();
    expect(controller.isScrolled()).toBe(true);
    expect(header.toggleAttribute).toHaveBeenLastCalledWith(SCROLLED_ATTRIBUTE, true);
  });

  it('republishes the height when the header resizes', () => {
    const { controller, header, root, fireResize } = setup();
    controller.start();
    header.offsetHeight = 150;
    fireResize();
    expect(root.style.setProperty).toHaveBeenLastCalledWith(HEADER_HEIGHT_VAR, '150px');
  });

  it('stops listening when stopped', () => {
    const { controller, scroll, watcher } = setup();
    controller.start();
    controller.stop();
    expect(scroll.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(watcher.disconnect).toHaveBeenCalled();
  });

  it('works without a size watcher', () => {
    const { controller, root } = setup({ withSizeWatcher: false, scrollY: 10 });
    controller.start();
    expect(controller.isScrolled()).toBe(true);
    expect(root.style.setProperty).toHaveBeenCalledWith(HEADER_HEIGHT_VAR, '84px');
    controller.stop();
  });
});
