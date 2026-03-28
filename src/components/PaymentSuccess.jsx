import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { backendApi } from '../data/backendApi';

export default function PaymentSuccess({ onDone }) {
  const { payInitial, payCurrentTour, joinConstellation } = useApp();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Vérification du paiement...');

  useEffect(() => {
    checkPayment();
  }, []);

  async function checkPayment() {
    try {
      // Read transaction ID from URL query params
      const params = new URLSearchParams(window.location.search);
      const txId = params.get('tx');

      // Also check localStorage for pending payment context
      const raw = localStorage.getItem('7e_pending_payment');
      const pending = raw ? JSON.parse(raw) : {};

      // Use txId from URL (priority) or from localStorage
      const transactionId = txId || pending.transactionId;

      if (!transactionId) {
        // No transaction to verify — just go to dashboard
        // This can happen if the user already has access
        applyLocalPayment(pending);
        setStatus('confirmed');
        setMessage('Paiement confirmé !');
        setTimeout(() => onDone(), 1500);
        return;
      }

      // Poll the backend to check transaction status
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds max

      const poll = async () => {
        attempts++;
        try {
          const data = await backendApi.paymentStatus(transactionId);

          if (data.status === 'confirmed') {
            // Payment confirmed by Stripe webhook
            applyLocalPayment(pending);
            localStorage.removeItem('7e_pending_payment');
            setStatus('confirmed');
            setMessage('Paiement confirmé !');
            setTimeout(() => onDone(), 2000);
            return;
          }

          if (data.status === 'failed') {
            localStorage.removeItem('7e_pending_payment');
            setStatus('failed');
            setMessage('Le paiement a échoué ou a expiré.');
            return;
          }

          // Still pending — retry
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
          } else {
            // Timeout — assume success (webhook might be delayed)
            // Apply locally to unblock the user
            applyLocalPayment(pending);
            localStorage.removeItem('7e_pending_payment');
            setStatus('confirmed');
            setMessage('Paiement en cours de traitement.');
            setTimeout(() => onDone(), 2000);
          }
        } catch (err) {
          console.error('Poll error:', err);
          if (attempts < maxAttempts) {
            setTimeout(poll, 2000);
          } else {
            // Network error — apply locally to unblock
            applyLocalPayment(pending);
            localStorage.removeItem('7e_pending_payment');
            setStatus('confirmed');
            setMessage('Paiement en cours de traitement.');
            setTimeout(() => onDone(), 2000);
          }
        }
      };

      // Wait 1.5s before first poll (let webhook arrive)
      setTimeout(poll, 1500);
    } catch (err) {
      console.error('CheckPayment error:', err);
      // Even on error, try to apply locally so user isn't stuck
      const raw = localStorage.getItem('7e_pending_payment');
      if (raw) {
        applyLocalPayment(JSON.parse(raw));
        localStorage.removeItem('7e_pending_payment');
      }
      setStatus('confirmed');
      setMessage('Paiement en cours de traitement.');
      setTimeout(() => onDone(), 2000);
    }
  }

  // Apply the payment to local state (AppContext) so dashboard becomes accessible
  function applyLocalPayment(pending) {
    const type = pending?.type;
    const constId = pending?.constId;

    if (type === 'initial' && constId) {
      payInitial(constId);
    } else if (type === 'contribution' && constId) {
      payCurrentTour(constId);
    } else if (type === 'join') {
      joinConstellation({
        id: pending?.constellationId || 'joined-' + Date.now(),
        owner: pending?.owner || '?',
        max: 3,
      });
    } else {
      // Fallback: try to find any constellation and mark as paid
      try {
        const raw7e = localStorage.getItem('7e');
        if (raw7e) {
          const d = JSON.parse(raw7e);
          const unpaid = (d.constellations || []).find(c => !c.initialPaid);
          if (unpaid) {
            payInitial(unpaid.id);
          }
        }
      } catch (e) {
        console.error('Fallback payInitial error:', e);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, rgba(15,15,50,1), rgba(5,5,20,1))' }}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-8 text-center"
        style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>

        {status === 'checking' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {message}
            </h2>
            <p className="text-sm text-gray-400">
              Veuillez patienter, nous vérifions votre paiement...
            </p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-emerald-400 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {message}
            </h2>
            <p className="text-sm text-gray-400">
              Redirection vers votre dashboard...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {message}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Si le problème persiste, contactez support@7ensemble.ch
            </p>
            <a href="/"
              className="inline-block px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all">
              Retour à l'accueil
            </a>
          </>
        )}
      </div>
    </div>
  );
}
