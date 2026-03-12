import StarField from '../components/StarField';
import TestimonialCarousel from '../components/TestimonialCarousel';
import { DEMO_MODE } from '../data/businessData';

export default function LandingPage({ onJoin, onDemo, testimonials }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-5 py-12">
      <StarField />
      <div className="relative z-10 text-center page-in">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center font-display font-black text-3xl text-white shadow-xl shadow-purp7/30"
          style={{ background:'linear-gradient(135deg,#7c5cfc,#00b4d8,#00e5a0)' }}>7E</div>

        <h1 className="text-4xl sm:text-5xl font-black font-display mb-3 bg-gradient-to-r from-white via-em7 to-purp7 bg-clip-text text-transparent">
          7 Ensemble
        </h1>
        <p className="text-base text-cosmos-100 max-w-md mx-auto mb-8 leading-relaxed">
          Rejoignez la communauté de solidarité mutuelle. Créez votre constellation et commencez votre aventure.
        </p>

        {/* §1.1: Goes DIRECTLY to inscription */}
        <button onClick={onJoin}
          className="px-12 py-4 rounded-2xl text-white text-lg font-bold font-display tracking-wide cursor-pointer shadow-xl shadow-purp7/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purp7/40"
          style={{ background:'linear-gradient(135deg,#7c5cfc,#00b4d8,#00e5a0)' }}>
          Rejoindre la révolution
        </button>

        {/* Demo button only if DEMO_MODE */}
        {DEMO_MODE && (
          <div className="mt-4">
            <button onClick={onDemo}
              className="px-6 py-2.5 rounded-xl border border-white/15 text-cosmos-100 text-sm hover:border-em7/50 hover:text-em7 transition-all cursor-pointer">
              Voir le dashboard (démo)
            </button>
          </div>
        )}

        {/* §11.3: Testimonial carousel */}
        <TestimonialCarousel testimonials={testimonials} />
      </div>
    </div>
  );
}
