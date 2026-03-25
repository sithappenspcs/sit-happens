'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, CreditCard, Loader2, AlertTriangle } from 'lucide-react';

interface PaymentStepProps {
  clientSecret: string | null;
  amount: number;
  onBack: () => void;
  onSuccess: () => void;
}

/**
 * Stripe PaymentElement wrapper.
 *
 * We load Stripe dynamically so Next.js doesn't try to SSR it.
 * The Elements provider and PaymentElement are injected once
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and clientSecret are both available.
 */
export function PaymentStep({ clientSecret, amount, onBack, onSuccess }: PaymentStepProps) {
  const [StripeComponents, setStripeComponents] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Dynamically import Stripe to avoid SSR issues
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || key === 'pk_test_placeholder') {
      setLoadError('Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.');
      return;
    }
    Promise.all([
      import('@stripe/stripe-js').then(m => m.loadStripe(key)),
      import('@stripe/react-stripe-js'),
    ])
      .then(([stripeInstance, components]) => {
        setStripe(stripeInstance);
        setStripeComponents(components);
      })
      .catch(e => setLoadError(`Failed to load Stripe: ${e.message}`));
  }, []);

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-sage-900 mb-1">Payment Details</h2>
          <p className="text-warm-600 text-sm">Secure card authorisation — you won't be charged until your booking is approved.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Stripe not configured</p>
            <p className="text-amber-700 text-xs mt-1">{loadError}</p>
            <p className="text-amber-700 text-xs mt-2">For local development, add a real Stripe test key to <code className="font-mono bg-amber-100 px-1 rounded">apps/web/.env.local</code> and restart the dev server.</p>
          </div>
        </div>
        <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4 text-sm text-warm-700">
          <p className="font-semibold mb-1">Dev bypass</p>
          <p className="text-xs">Click "Skip Payment (Dev)" to submit the booking without a real payment authorisation. The booking will be created in <code className="font-mono bg-warm-100 px-1 rounded">pending</code> status and can be approved from the admin dashboard.</p>
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button variant="primary" onClick={onSuccess} className="bg-amber-500 hover:bg-amber-600">
            Skip Payment (Dev)
          </Button>
        </div>
      </div>
    );
  }

  if (!StripeComponents || !stripe) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-warm-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading secure payment form...</span>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900 text-sm">Payment setup failed</p>
          <p className="text-red-700 text-xs mt-1">Could not initialise payment. Please go back and try again.</p>
        </div>
      </div>
    );
  }

  const { Elements, PaymentElement, useStripe, useElements } = StripeComponents;

  function CheckoutForm() {
    const stripeHook = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripeHook || !elements) return;
      setSubmitting(true);
      setCardError(null);

      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/dashboard` },
        redirect: 'if_required',
      });

      if (error) {
        setCardError(error.message || 'Payment failed. Please check your card details.');
        setSubmitting(false);
      } else {
        onSuccess();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        {cardError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {cardError}
          </div>
        )}

        <div className="bg-sage-50 border border-sage-100 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-sage-700">
            A temporary hold of <strong>${amount.toFixed(2)}</strong> will be placed on your card. You won't be charged until a sitter is assigned and the booking is confirmed.
          </p>
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>Back</Button>
          <Button type="submit" variant="primary" disabled={submitting || !stripeHook} className="px-8">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
              : <><CreditCard className="w-4 h-4 mr-2" />Authorise ${amount.toFixed(2)}</>
            }
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-serif text-sage-900 mb-1">Payment Details</h2>
        <p className="text-warm-600 text-sm">Secure card authorisation — you won't be charged until approved.</p>
      </div>
      <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
