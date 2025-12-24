import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
}

export function FAQSection({ faqs, title = 'Perguntas Frequentes', className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={cn("py-8 md:py-12", className)} itemScope itemType="https://schema.org/FAQPage">
      <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">{title}</h2>
      <div className="space-y-3 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden bg-card"
            itemScope
            itemType="https://schema.org/Question"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <h3 className="font-bold text-sm sm:text-base pr-4" itemProp="name">
                {faq.question}
              </h3>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            {openIndex === index && (
              <div
                className="px-4 pb-4 text-sm text-muted-foreground"
                itemScope
                itemType="https://schema.org/Answer"
              >
                <div itemProp="text">{faq.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

