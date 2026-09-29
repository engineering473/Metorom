"use client";

type StatsBentoProps = {
  className?: string;
};

/** Confirmed details of the current Metorom three-way loudspeaker study. */
export function StatsBento({ className = "" }: StatsBentoProps) {
  return (
    <section
      className={`stats-bento w-full min-w-0 ${className}`.trim()}
      aria-label="The Metorom system in brief"
    >
      <div className="stats-bento__grid grid min-w-0 grid-cols-1 gap-3 md:grid-cols-6 md:grid-rows-2 md:gap-4">
        <article className="stats-bento__primary relative flex min-w-0 flex-col justify-between overflow-hidden p-6 sm:p-8 md:col-span-3 md:row-span-2 md:p-10">
          <div className="stats-bento__primary-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative z-10">
            <span className="stats-bento__number block" aria-hidden="true">03</span>
            <h2 className="stats-bento__title max-w-[11ch]">Three paths.<br />One system.</h2>
          </div>
          <p className="stats-bento__primary-copy relative z-10 mt-10 max-w-[38ch]">
            Alpha 6A midrange, BMS 4540ND compression driver and horn, and LAB 12 low-frequency driver work together in the current three-way design.
          </p>
        </article>

        <article className="stats-bento__spacing flex min-w-0 flex-col justify-between gap-8 p-6 sm:p-8 md:col-span-3">
          <dl>
            <dt className="stats-bento__label">Current midrange spacing</dt>
            <dd className="stats-bento__value mt-3 tabular-nums">608 <small>mm</small></dd>
          </dl>
          <div className="stats-bento__measure flex items-center gap-2" aria-hidden="true">
            <span className="stats-bento__measure-end" />
            <span className="stats-bento__measure-line flex-1" />
            <span className="stats-bento__measure-end" />
          </div>
        </article>

        <article className="stats-bento__latency flex min-w-0 flex-col justify-between gap-5 p-6 md:col-span-1">
          <dl>
            <dt className="stats-bento__label">DSP latency</dt>
            <dd className="stats-bento__value stats-bento__value--compact mt-3 tabular-nums">510 <small>µs</small></dd>
          </dl>
          <p className="stats-bento__note">Current design</p>
        </article>

        <article className="stats-bento__modular flex min-w-0 flex-col justify-between gap-5 p-6 sm:p-8 md:col-span-2">
          <h3 className="stats-bento__modular-title">Made to evolve.</h3>
          <p className="stats-bento__modular-copy max-w-[30ch]">
            Modular parts and adjustable DSP tuning leave room for the next revision.
          </p>
        </article>
      </div>
    </section>
  );
}

export default StatsBento;
