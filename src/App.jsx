import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationModal from './components/RegistrationModal';
import PaymentScreen from './components/PaymentScreen';

function AppInner() {
  const { hasAccess, load, register, payInitial, testimonials, activeId } = useApp();
  const [view, setView] = useState('landing');
  const [showRegister, setShowRegister] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const isPaymentSuccess = params.get('payment-success') === '1';

  // Restore session
  useEffect(() => {
    if (load()) setView('dashboard');
  }, [load]);

  // Stripe return -> mark initial payment as done
  useEffect(() => {
    if (isPaymentSuccess) {
      const saved = JSON.parse(localStorage.getItem('7e') || '{}');
      const constId = activeId || saved.activeId || saved.constellations?.[0]?.id || 'c1';

      payInitial(constId);
      setPendingPaymentId(null);
      setShowRegister(false);
      setView('dashboard');
    }
  }, [isPaymentSuccess, activeId, payInitial]);

  // React to auth changes
  useEffect(() => {
    if (hasAccess && !isPaymentSuccess) {
      setView('dashboard');
    }
  }, [hasAccess, isPaymentSuccess]);

  const handleJoin = () => setShowRegister(true);

  const handleNeedPayment = (constId) => {
    setShowRegister(false);
    setPendingPaymentId(constId);
  };

  const handlePaymentDone = () => {
    setPendingPaymentId(null);
    setView('dashboard');
  };

  const handleDemo = () => {
    register({
      alcyone: 'MERCI_L_UNIVERS',
      prenom: 'Marie',
      nom: 'Dupont',
      email: 'marie@example.com',
      pseudo: 'Marie_CH',
      password: 'demo123',
      pays: 'Suisse',
      paiement: 'Carte bancaire (Stripe)',
      accept: true,
      option: 'triangulum',
    });

    setTimeout(() => {
      payInitial('c1');
      setView('dashboard');
    }, 50);
  };

  // IMPORTANT: direct dashboard render on Stripe return
  if (isPaymentSuccess || view === 'dashboard') {
    return <DashboardPage />;
  }

  return (
    <>
      <LandingPage onJoin={handleJoin} onDemo={handleDemo} testimonials={testimonials} />
      {showRegister && (
        <RegistrationModal
          onClose={() => setShowRegister(false)}
          onNeedPayment={handleNeedPayment}
        />
      )}
      {pendingPaymentId && (
        <PaymentScreen constId={pendingPaymentId} onDone={handlePaymentDone} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}