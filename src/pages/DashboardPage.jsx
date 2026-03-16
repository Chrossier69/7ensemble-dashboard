import { useState, useEffect } from 'react';
import StarField from '../components/StarField';
import TopBar from '../components/TopBar';
import StatCards from '../components/StatCards';
import ConstellationVisual from '../components/ConstellationVisual';
import PaymentCard from '../components/PaymentCard';
import MesConstellations from '../components/MesConstellations';
import SearchPlaces from '../components/SearchPlaces';
import TestimonialModal from '../components/TestimonialModal';
import SettingsModal from '../components/SettingsModal';
import JoinFlow from '../components/JoinFlow';
import Portal from '../components/Portal';
import { useApp } from '../context/AppContext';
import WorldMap from '../components/WorldMap';

export default function DashboardPage() {
  const { active } = useApp();
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [joiningConstellation, setJoiningConstellation] = useState(null);
  const isTri = active?.type === 'triangulum';

  useEffect(() => {
    const onTest = () => setShowTestimonial(true);
    const onSet = () => setShowSettings(true);
    window.addEventListener('open-testimonial', onTest);
    window.addEventListener('open-settings', onSet);
    return () => {
      window.removeEventListener('open-testimonial', onTest);
      window.removeEventListener('open-settings', onSet);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cosmos-600 relative">
      <StarField />
      <TopBar />
      <div className="relative z-10 p-4 sm:p-6 max-w-[1300px] mx-auto page-in">
        <div className="mb-5"><StatCards /></div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          {/* Left */}
          <div className="space-y-5">
            <div className="rounded-2xl p-5 glass">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-lg ${isTri ? 'text-coral7' : 'text-gold7'}`}>{isTri ? '▲' : '⭐'}</span>
                <h2 className="text-lg font-bold text-cosmos-50 font-display">Ma Constellation</h2>
              </div>
              <ConstellationVisual />
            </div>
            {/* §1A: World Map — informational only */}
            <div className="rounded-2xl p-5 glass">
              <WorldMap />
            </div>
          </div>
          {/* Right */}
          <div className="space-y-5">
            <PaymentCard />
            <MesConstellations />
            {/* §1B: Search — action (Rejoindre) */}
            <SearchPlaces onJoin={(constellation) => setJoiningConstellation(constellation)} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTestimonial && (
        <Portal>
          <TestimonialModal onClose={() => setShowTestimonial(false)} />
        </Portal>
      )}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      {/* §4: Join flow modal */}
      {joiningConstellation && (
        <JoinFlow
          constellation={joiningConstellation}
          onDone={() => setJoiningConstellation(null)}
          onCancel={() => setJoiningConstellation(null)}
        />
      )}
    </div>
  );
}
