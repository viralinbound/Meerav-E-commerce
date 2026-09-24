import { useState } from 'react';
import { useSettings } from '@/lib/useSettings';

export type LegalSection = 'terms' | 'privacy' | 'refund';

interface LegalPageProps {
  section: LegalSection;
  onNavigate: (section: LegalSection) => void;
  onBack: () => void;
}

const TABS: { id: LegalSection; label: string }[] = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'refund', label: 'Refund & Cancellation' },
];

export function LegalPage({ section, onNavigate, onBack }: LegalPageProps) {
  const { settings } = useSettings();
  const phone = settings?.contactPhone || '1800 102 9046';
  const email = settings?.contactEmail || 'care@meerav.com';
  const address = settings?.contactAddress || 'Bikaner, Rajasthan 334001';
  const [updated] = useState(() => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Minimal standalone header — no site nav/cart/search */}
      <header className="bg-maroon-900 border-b border-maroon-800">
        <div className="container-max section-padding py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 group">
            <img src="/images/meerav_logo.png" alt="Meerav" className="h-10 w-auto object-contain" />
            <span className="font-serif text-lg font-bold text-cream-50 hidden sm:inline">Meerav Namkeens</span>
          </button>
          <button
            onClick={onBack}
            className="text-sm font-medium text-cream-200 hover:text-saffron-300 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      <div className="container-max section-padding py-10 lg:py-16">
        <div className="grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Side nav */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { onNavigate(tab.id); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                className={`shrink-0 text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap lg:whitespace-normal ${
                  section === tab.id
                    ? 'bg-maroon-800 text-cream-50 shadow-sm'
                    : 'text-charcoal-600 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 sm:p-12">
            <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wide mb-2">Last updated {updated}</p>

            {section === 'terms' && (
              <Doc title="Terms & Conditions">
                <Section title="1. About Us">
                  Meerav Namkeens ("we", "us", "our") sells authentic Bikaneri namkeens, sweets, and
                  savories through this website. By placing an order or using this website, you agree
                  to these Terms & Conditions.
                </Section>
                <Section title="2. Orders & Account">
                  You must create an account and be signed in to place an order. You are responsible
                  for keeping your account credentials confidential and for all activity under your
                  account. You confirm that the delivery address and contact details you provide are
                  accurate.
                </Section>
                <Section title="3. Product Information & Pricing">
                  We describe our products as accurately as possible, including weight, ingredients,
                  and price. Prices are listed in Indian Rupees (INR) and are subject to change
                  without prior notice; the price shown at the time you place your order is the price
                  you pay. Minor variations in product appearance from photographs may occur since
                  items are handmade in small batches.
                </Section>
                <Section title="4. Payments">
                  We accept Cash on Delivery (COD) and online payment through our payment gateway
                  partner. For online payments, your card/UPI/bank details are processed directly by
                  our payment gateway partner and are never stored on our servers.
                </Section>
                <Section title="5. Delivery">
                  We aim to dispatch orders promptly and deliver across India via our courier
                  partners. Delivery timelines shown at checkout are estimates and may vary due to
                  courier delays, weather, or circumstances beyond our control.
                </Section>
                <Section title="6. Cancellations & Refunds">
                  See our separate Refund & Cancellation Policy for full details.
                </Section>
                <Section title="7. Limitation of Liability">
                  We are not liable for indirect or consequential loss arising from use of this
                  website or delayed/failed delivery due to circumstances outside our reasonable
                  control.
                </Section>
                <Section title="8. Governing Law">
                  These terms are governed by the laws of India, and any disputes are subject to the
                  exclusive jurisdiction of the courts in Bikaner, Rajasthan.
                </Section>
                <Section title="9. Contact Us">
                  For any questions about these Terms, reach us at {email} or {phone}, or write to us
                  at {address}.
                </Section>
              </Doc>
            )}

            {section === 'privacy' && (
              <Doc title="Privacy Policy">
                <Section title="1. Information We Collect">
                  When you create an account, place an order, or contact us, we collect information
                  such as your name, email address, phone number, delivery address, and order
                  history. We do not collect or store your payment card, UPI, or bank details — these
                  are handled directly by our payment gateway partner.
                </Section>
                <Section title="2. How We Use Your Information">
                  We use your information to process and deliver your orders, communicate order
                  updates, respond to support requests, and — only with your consent (e.g. newsletter
                  sign-up) — send offers and updates. We do not sell your personal information to
                  third parties.
                </Section>
                <Section title="3. Sharing Your Information">
                  We share order and delivery details only with our courier partners (to deliver your
                  order) and our payment gateway partner (to process payment). We may disclose
                  information if required by law.
                </Section>
                <Section title="4. Data Storage & Security">
                  Your data is stored securely using industry-standard cloud infrastructure with
                  access controls and encryption in transit. While we take reasonable steps to
                  protect your data, no method of transmission over the internet is 100% secure.
                </Section>
                <Section title="5. Cookies">
                  We use essential cookies/local storage to keep you signed in and remember your
                  cart. We do not use third-party advertising trackers.
                </Section>
                <Section title="6. Your Rights">
                  You can request access to, correction of, or deletion of your personal data by
                  contacting us at {email}. You can also update your saved address and profile
                  details directly from your account.
                </Section>
                <Section title="7. Contact Us">
                  Questions about this Privacy Policy can be sent to {email} or {phone}, or to our
                  address at {address}.
                </Section>
              </Doc>
            )}

            {section === 'refund' && (
              <Doc title="Refund & Cancellation Policy">
                <Section title="1. Order Cancellation">
                  You can request cancellation of an order before it has been dispatched by
                  contacting us at {phone} or {email} with your order number. Once an order has been
                  dispatched, it cannot be cancelled.
                </Section>
                <Section title="2. Damaged or Incorrect Items">
                  Since our products are food items, we do not accept returns for change of mind.
                  However, if you receive a damaged, spoiled, or incorrect item, please contact us
                  within 48 hours of delivery with photos of the product and packaging, and we will
                  arrange a replacement or refund.
                </Section>
                <Section title="3. Refund Process">
                  Approved refunds for online (prepaid) payments are credited back to your original
                  payment method via our payment gateway, typically within 5–7 business days. For
                  Cash on Delivery orders, refunds are processed via bank transfer or UPI after
                  verifying your details.
                </Section>
                <Section title="4. Non-Refundable Situations">
                  We are unable to offer refunds for delays caused by an incorrect address provided
                  at checkout, or for failed delivery attempts where the customer was unreachable.
                </Section>
                <Section title="5. Contact Us">
                  For cancellations, refunds, or delivery issues, reach us at {phone} (Mon–Sat, 11 AM
                  to 5 PM) or {email}.
                </Section>
              </Doc>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Doc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-7">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-maroon-900 pb-2 border-b border-cream-200">
        {title}
      </h1>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-lg font-bold text-charcoal-900 mb-2">{title}</h2>
      <p className="text-[15px] text-charcoal-600 leading-relaxed">{children}</p>
    </div>
  );
}
