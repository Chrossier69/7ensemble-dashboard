import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationModal from './components/RegistrationModal';
import PaymentScreen from './components/PaymentScreen';
import { DEMO_MODE } from './data/businessData';

function AppInner() {
  const { hasAccess, load, register, payInitial, testimonials, activeId } = useApp();
  const [view, setView] = useState('landing');
  const [showRegister, setShowRegister] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);

  // Restore session
  useEffect(() => {
    if (load()) setView('dashboard');
  }, [load]);

  // Stripe return -> activate access + open dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment-success') === '1') {
      const saved = JSON.parse(localStorage.getItem('7e') || '{}');
      const constId = activeId || saved.activeId || saved.constellations?.[0]?.id || 'c1';

      payInitial(constId);
      setPendingPaymentId(null);
      setShowRegister(false);
      setView('dashboard');
    }
  }, [activeId, payInitial]);

  // React to auth changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPaymentSuccess = params.get('payment-success') === '1';

    if (hasAccess && !isPaymentSuccess) {
      setView('dashboard');
    }
  }, [hasAccess]);

  // "Rejoindre la révolution" -> registration form
  const handleJoin = () => setShowRegister(true);

  // After registration -> payment screen
  const handleNeedPayment = (constId) => {
    setShowRegister(false);
    setPendingPaymentId(constId);
  };

  // After payment -> dashboard
  const handlePaymentDone = () => {
    setPendingPaymentId(null);
    setView('dashboard');
  };

  // Demo mode
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

  if (view === 'dashboard') return <DashboardPage />;

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