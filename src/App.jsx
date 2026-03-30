import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationModal from './components/RegistrationModal';
import PaymentScreen from './components/PaymentScreen';
import PaymentSuccess from './components/PaymentSuccess';

function AppInner() {
  const { hasAccess, load, payInitial, testimonials } = useApp();
  const [view, setView] = useState('landing');
  const [showRegister, setShowRegister] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);

  useEffect(() => {
    // 1. Check if returning from Stripe payment (query param)
    const params = new URLSearchParams(window.location.search);
    const isPaymentReturn = params.get('payment-success') === '1';
    const txId = params.get('tx');

    // 2. Load existing session from localStorage
    const hasSession = load();

    if (isPaymentReturn && txId) {
      // Returning from Stripe — show payment verification screen
      setView('payment-success');
      return;
    }

    if (hasSession) {
      setView('dashboard');
    }
  }, []);

  // React to auth changes
  useEffect(() => {
    if (hasAccess && view !== 'payment-success') {
      setView('dashboard');
    }
  }, [hasAccess, view]);

  // "Rejoindre la révolution" → registration form
  const handleJoin = () => setShowRegister(true);

  // After registration → payment screen (ALWAYS, no bypass)
  const handleNeedPayment = (constId) => {
    setShowRegister(false);
    setPendingPaymentId(constId);
  };

  // After Stripe payment confirmed → dashboard
 const handlePaymentDone = () => {
  setPendingPaymentId(null);

  // Nettoie l'URL Stripe
  window.history.replaceState(null, '', '/');

  // Recharge la session locale pour recalculer hasAccess
  const ok = load();

  // Si une session existe, dashboard, sinon on laisse quand même dashboard
  // et l'effet hasAccess prendra le relais si l'état est déjà bon
  if (ok) {
    setView('dashboard');
  } else {
    setView('dashboard');
  }
};

  // Stripe return — payment verification
  if (view === 'payment-success') {
    return <PaymentSuccess onDone={handlePaymentDone} />;
  }

  // Dashboard — ONLY if hasAccess (requires initialPaid = true)
  if (view === 'dashboard') return <DashboardPage />;

  // Landing + modals
  return (
    <>
      <LandingPage onJoin={handleJoin} testimonials={testimonials} />
      {showRegister && (
        <RegistrationModal onClose={() => setShowRegister(false)} onNeedPayment={handleNeedPayment} />
      )}
      {pendingPaymentId && (
        <PaymentScreen constId={pendingPaymentId} onDone={handlePaymentDone} />
      )}
    </>
  );
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>;
}
