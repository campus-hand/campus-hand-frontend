import {
  Banknote,
  BookOpen,
  CalendarDays,
  House,
  ListChecks,
  type LucideIcon,
  UtensilsCrossed,
} from 'lucide-react';
import type { CampusCategory } from '../models/campus-post';

export interface CategoryStyle {
  /** Colour band (desktop card) and icon tile (phone row). */
  readonly band: string;
  /** The category tag on a white card. */
  readonly tag: string;
  readonly icon: LucideIcon;
  readonly avatar: 'sun' | 'forest' | 'red' | 'cobalt';
}

/** Colours and icons per category, from the design canvas. */
export const CATEGORY_STYLE: Record<CampusCategory, CategoryStyle> = {
  Fees: {
    band: 'bg-paper-tag-bg text-paper-tag-fg',
    tag: 'bg-surface text-paper-tag-fg',
    icon: Banknote,
    avatar: 'red',
  },
  Hostels: {
    band: 'bg-daily-bg text-daily-fg',
    tag: 'bg-surface text-daily-fg',
    icon: House,
    avatar: 'forest',
  },
  Food: {
    band: 'bg-sun text-on-sun',
    tag: 'bg-surface text-tut-fg',
    icon: UtensilsCrossed,
    avatar: 'sun',
  },
  Courses: {
    band: 'bg-inverse text-sun',
    tag: 'bg-sun text-on-sun',
    icon: BookOpen,
    avatar: 'sun',
  },
  Freshers: {
    band: 'bg-note-bg text-note-fg',
    tag: 'bg-surface text-note-fg',
    icon: ListChecks,
    avatar: 'cobalt',
  },
  Events: {
    band: 'bg-tut-bg text-tut-fg',
    tag: 'bg-surface text-tut-fg',
    icon: CalendarDays,
    avatar: 'red',
  },
};
