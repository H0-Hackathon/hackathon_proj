import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function CheckoutForm({ onSuccess, onCancel, amount, planId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // Validate the form elements first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Card validation failed. Please check your details.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v2/payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('coastguard_token')}`
        },
        body: JSON.stringify({
          payment_intent_id: 'dummy_intent',
          plan_id: planId,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        // data.detail might be a string or object
        const msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        throw new Error(msg || 'Payment confirmation failed');
      }

      onSuccess(data.subscription);
    } catch (err) {
      // Always stringify to a human-readable message
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stripe Payment Element */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '13px',
          background: 'rgba(239,68,68,0.1)',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.3)',
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1, padding: '12px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
            color: 'white', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            flex: 2, padding: '12px',
            background: loading || !stripe ? 'rgba(245,158,11,0.5)' : '#F59E0B',
            border: 'none', borderRadius: '8px', color: '#040710',
            fontWeight: '700', cursor: loading || !stripe ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif', transition: 'background 0.2s',
          }}
        >
          {loading ? 'Processing...' : `Pay $${amount}`}
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
        🔒 Test card: <strong>4242 4242 4242 4242</strong> · Any future date · Any CVC
      </div>
    </form>
  );
}
