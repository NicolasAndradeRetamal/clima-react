/** Pulsing placeholder mirroring the weather card + forecast geometry. */
export function WeatherSkeleton() {
  return (
    <div role="status" className="space-y-6">
      <span className="sr-only">Cargando el clima…</span>
      <div
        aria-hidden="true"
        className="animate-pulse rounded-2xl border border-line bg-surface-raised p-4 shadow-sm motion-reduce:animate-none sm:p-6"
      >
        <div className="h-6 w-40 rounded-lg bg-surface-sunken" />
        <div className="mt-4 flex items-center gap-4">
          <div className="size-16 rounded-full bg-surface-sunken" />
          <div className="h-14 w-32 rounded-lg bg-surface-sunken" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-14 rounded-lg bg-surface-sunken" />
          <div className="h-14 rounded-lg bg-surface-sunken" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex animate-pulse flex-col gap-2 motion-reduce:animate-none md:grid md:grid-cols-7"
      >
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="h-14 rounded-2xl bg-surface-sunken md:h-36" />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="h-56 animate-pulse rounded-2xl bg-surface-sunken motion-reduce:animate-none md:h-64"
      />
    </div>
  );
}
