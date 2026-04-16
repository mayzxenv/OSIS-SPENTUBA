import Navbar from '../components/Navbar';
import HeroSection from '@/react-app/components/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-slate-600 dark:text-slate-300">
          <p className="text-lg">Fitur-fitur lainnya akan ditambahkan segera...</p>
        </div>
      </div>
    </div>
  );
}
