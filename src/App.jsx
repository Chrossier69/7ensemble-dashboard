import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationModal from './components/RegistrationModal';
import PaymentScreen from './components/PaymentScreen';
import { DEMO_MODE } from './data/businessData';

function AppInner() {
  const { hasAccess, load, register, payInitial, testimonials } = useApp();
  const [view, setView] = useState('landing');
  const [showRegister, setShowRegister] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);

  // Restore session
  useEffect(() => {
    if (load()) setView('dashboard');
  }, []);
if (window.location.pathname === '/payment-success') {
    setView('payment-success');
  // React to auth changes
  useEffect(() => {
    if (hasAccess) setView('dashboard');
  }, [hasAccess]);

  // §1.1: "Rejoindre la révolution" → DIRECTLY to registration form
  const handleJoin = () => setShowRegister(true);

  // After registration → payment screen (§1.2: blocked until payment)
  const handleNeedPayment = (constId) => {
    setShowRegister(false);
    setPendingPaymentId(constId);
  };

  // After payment → dashboard
  const handlePaymentDone = () => {
    setPendingPaymentId(null);
    setView('dashboard');
  };

  // §10: Demo mode
  const handleDemo = () => {
    register({
      alcyone: 'MERCI_L_UNIVERS', prenom: 'Marie', nom: 'Dupont',
      email: 'marie@example.com', pseudo: 'Marie_CH', password: 'demo123',
      pays: 'Suisse', paiement: 'Carte bancaire (Stripe)',
      accept: true, option: 'triangulum',
    });
    setTimeout(() => {
      payInitial('c1');
      setView('dashboard');
    }, 50);
  };

  // Dashboard
  if (view === 'dashboard' && hasAccess) return <DashboardPage />;

  // Landing + modals
  return (
    <>
      <LandingPage onJoin={handleJoin} onDemo={handleDemo} testimonials={testimonials} />
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
