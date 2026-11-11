'use client';

import { Tabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface UnitTab {
  value: string;
  label: string;
  /** Hidden from the tab list on phones (the design's phone tabs skip "All notes"). */
  desktopOnly?: boolean;
  content: ReactNode;
}

/** Topics / All notes / Past papers / Tutors, as a segmented sign. */
export function CourseUnitTabs({ tabs, label }: { tabs: UnitTab[]; label: string }) {
  return (
    <Tabs.Root defaultValue={tabs[0]?.value}>
      <Tabs.List
        aria-label={label}
        className="bg-sunken flex w-full gap-1 overflow-x-auto rounded-[18px] p-1.5 sm:inline-flex sm:w-auto"
      >
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              'text-ink-2 data-[active]:bg-surface data-[active]:text-ink min-h-11 flex-1 rounded-[13px] px-4 text-[16px] font-semibold whitespace-nowrap data-[active]:shadow-[0_1px_3px_rgb(20_32_31/0.18)] sm:flex-none sm:px-5',
              tab.desktopOnly && 'hidden sm:block',
            )}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Panel
          key={tab.value}
          value={tab.value}
          className="mt-6 focus-visible:outline-offset-4"
        >
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
