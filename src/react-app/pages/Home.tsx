import Navbar from '../components/Navbar';
import HeroSection from '@/react-app/components/HeroSection';
import { ArrowRight, Camera, Heart, MessageSquare, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">Akses cepat</p>
            <h2 className="mt-2 text-3xl font-black font-['Space_Grotesk'] text-slate-900 dark:text-white">Fitur utama yang aktif</h2>
          </div>
          <p className="hidden max-w-xl text-sm text-slate-600 dark:text-slate-300 md:block">
            Semua jalur ini terhubung langsung ke halaman interaktif, jadi pengguna tidak jatuh ke tampilan galeri statis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to="/album-kegiatan"
            className="group rounded-[2rem] border border-sky-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(14,165,233,0.12)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition-transform group-hover:scale-110">
              <Camera className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Album Kegiatan</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Lihat dokumentasi, beri like, kirim komentar, dan bagikan album langsung dari halaman kegiatan.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-400">
              Buka album
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/forum"
            className="group rounded-[2rem] border border-indigo-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(99,102,241,0.12)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 transition-transform group-hover:scale-110">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Forum Diskusi</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Tempat berbagi pendapat, menjawab balasan, dan meneruskan percakapan yang bermanfaat.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
              Masuk forum
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/ruang-pribadi"
            className="group rounded-[2rem] border border-rose-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(244,63,94,0.12)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 transition-transform group-hover:scale-110">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Ruang Pribadi</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Laporkan bullying secara aman dengan tampilan yang tenang, jelas, dan mudah dipahami.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
              Buka ruang aman
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Heart className="h-4 w-4 text-rose-500" />
          Semua fitur ini aktif dan saling terhubung.
        </div>
      </div>
    </div>
  );
}
