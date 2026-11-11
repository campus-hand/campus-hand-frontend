'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Sheet that slides up from the bottom on phones and shows as a centred
 * card from 640 px. Base UI's Dialog handles focus, Escape and scroll lock.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="sheet-backdrop" />
        <Dialog.Popup className="sheet-panel">
          <span
            aria-hidden="true"
            className="bg-rule mx-auto mb-4 block h-1.5 w-12 rounded-full sm:hidden"
          />
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="display text-[clamp(38px,9vw,52px)]">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="hover:bg-sunken -mt-1 -mr-2 flex size-11 flex-none items-center justify-center rounded-full"
            >
              <X className="size-6" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
