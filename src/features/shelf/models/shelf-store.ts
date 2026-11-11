/** The slice of Storage the shelf needs (lets tests pass a fake). */
export interface ShelfStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ShelfEntry {
  readonly resourceId: string;
  /** Course unit code it is filed under, or null for "Other". */
  readonly courseUnitCode: string | null;
  readonly offline: boolean;
  readonly addedAt: number;
}

export const SHELF_STORAGE_KEY = 'ch-shelf-preview';

/**
 * My shelf, kept on this device for the preview.
 * TODO(backend): save to the shelf API so it follows the student across devices.
 */
export class ShelfStore {
  constructor(
    private readonly storage: ShelfStorage | null,
    private readonly now: () => number = () => Date.now(),
  ) {}

  entries(): ShelfEntry[] {
    try {
      const raw = this.storage?.getItem(SHELF_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as ShelfEntry[]) : [];
    } catch {
      return []; // blocked storage or a damaged value: start empty
    }
  }

  has(resourceId: string): boolean {
    return this.entries().some((e) => e.resourceId === resourceId);
  }

  /** Adds or refiles a resource. Returns false if it could not be saved. */
  add(resourceId: string, courseUnitCode: string | null, offline: boolean): boolean {
    const rest = this.entries().filter((e) => e.resourceId !== resourceId);
    const next = [...rest, { resourceId, courseUnitCode, offline, addedAt: this.now() }];
    try {
      this.storage?.setItem(SHELF_STORAGE_KEY, JSON.stringify(next));
      return this.storage !== null;
    } catch {
      return false;
    }
  }

  static forBrowser(): ShelfStore {
    let storage: ShelfStorage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      storage = null;
    }
    return new ShelfStore(storage);
  }
}
