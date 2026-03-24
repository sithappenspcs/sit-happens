export default function FAQPage() {
  const faqs = [
    { question: 'Do you offer a meet and greet?', answer: 'Yes! All new clients receive a complimentary meet and greet.' },
    { question: 'Are you bonded and insured?', answer: 'Absolutely. We carry comprehensive insurance and bonding.' },
    { question: 'What is your cancellation policy?', answer: 'Cancellations made 24 hours in advance receive a full refund.' },
  ];

  return (
    <main className="min-h-screen bg-warm-50 py-24 px-6 md:pt-36">
      <div className="max-w-3xl mx-auto space-y-12 animate-fade-in-up">
        <h1 className="font-serif text-5xl font-bold text-sage-800 text-center">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-warm-100">
              <h3 className="text-xl font-bold text-foreground mb-2">{faq.question}</h3>
              <p className="text-warm-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
