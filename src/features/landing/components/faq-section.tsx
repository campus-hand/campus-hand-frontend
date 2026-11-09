import { ChevronDown } from 'lucide-react';
import { landingContent } from '../content/landing-content';

export function FaqSection() {
  const { faq } = landingContent;

  return (
    <section aria-labelledby="faq-h" className="wrap grid items-start gap-14 pt-24 lg:grid-cols-2">
      <h2 id="faq-h" className="display h2">
        {faq.title}
      </h2>
      <div className="faq">
        {faq.items.map((item, index) => (
          <details key={item.q} open={index === 0} className="border-rule border-t last:border-b">
            <summary>
              {item.q}
              <ChevronDown className="size-5 flex-none transition-transform" aria-hidden="true" />
            </summary>
            <p className="text-mute max-w-[60ch] pb-5 text-base">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
