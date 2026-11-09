import { landingContent } from '../content/landing-content';

export function HowItWorksSection() {
  const { howItWorks } = landingContent;

  return (
    <section aria-labelledby="how-h" className="wrap pt-24">
      <h2 id="how-h" className="display h2 max-w-[20ch]">
        {howItWorks.title}
      </h2>
      <ol className="mt-8 grid gap-5 md:grid-cols-3">
        {howItWorks.steps.map((step, index) => {
          const isLast = index === howItWorks.steps.length - 1;
          return (
            <li
              key={step.title}
              className={`flex flex-col gap-3 border-t-2 pt-5 ${isLast ? 'border-sun' : 'border-ink'}`}
            >
              <span
                className={`display text-[55px] ${isLast ? 'text-red-text' : 'text-link'}`}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-mute text-base">
                {step.body}{' '}
                {'link' in step && step.link ? (
                  <a href={step.link.href} className="underline-link text-link font-bold">
                    {step.link.label}
                  </a>
                ) : null}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
