/** Placeholder while a screen's data loads (keeps the layout from jumping). */
export function ScreenLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pt-8 sm:px-8 lg:px-10 lg:pt-12"
    >
      <div className="bg-sunken h-5 w-48 rounded-full motion-safe:animate-pulse" />
      <div className="bg-sunken h-16 w-full max-w-[560px] rounded-[16px] motion-safe:animate-pulse" />
      <div className="bg-sunken h-56 w-full rounded-[22px] motion-safe:animate-pulse" />
    </div>
  );
}
