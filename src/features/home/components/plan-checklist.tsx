'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import type { PlanTask } from '../models/study';
import { StudyPlan } from '../models/study';
import { cn } from '@/lib/utils';

/**
 * "This week's plan": tick tasks off. Changes stay on this screen for now.
 * TODO(backend): save ticks to the study plan API.
 */
export function PlanChecklist({ tasks }: { tasks: readonly PlanTask[] }) {
  const [plan, setPlan] = useState(() => new StudyPlan(tasks));
  const nextId = plan.next?.id;

  return (
    <ul className="divide-rule flex flex-col divide-y">
      {plan.tasks.map((task) => (
        <li key={task.id}>
          <label className="flex min-h-14 cursor-pointer items-center gap-3.5 py-2">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={task.done}
              onChange={() => setPlan((p) => p.toggle(task.id))}
            />
            <span
              aria-hidden="true"
              className={cn(
                'flex size-7 flex-none items-center justify-center rounded-[8px] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]',
                task.done
                  ? 'bg-cobalt text-on-cobalt'
                  : 'bg-surface shadow-[inset_0_0_0_2px_var(--edge)]',
              )}
            >
              {task.done ? <Check className="size-4" strokeWidth={3} /> : null}
            </span>
            <span
              className={cn(
                'flex-1 text-[16px]',
                task.done ? 'text-mute line-through' : 'font-semibold',
              )}
            >
              {task.title}
            </span>
            {task.id === nextId && !task.done ? (
              <span className="plan-tag plan-pro">{task.when}</span>
            ) : (
              <span className="text-mute text-[14px]">{task.when}</span>
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}
