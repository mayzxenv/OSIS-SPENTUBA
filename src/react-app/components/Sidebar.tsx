import { Sparkles, Camera, Users2, MessageSquare, Heart, Shield, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/react-app/theme';

const navItems = [
  { icon: Sparkles, label: 'Apresiasi', href: '/apresiasi' },
  { icon: Camera, label: 'Album Kegiatan', href: '/album-kegiatan' },
  { icon: Users2, label: 'Struktur Organisasi', href: '/struktur-organisasi' },
  { icon: MessageSquare, label: 'Forum', href: '/forum' },
  { icon: Heart, label: 'Ruang Pribadi', href: '/ruang-pribadi' },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col border-r border-gray-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col h-full overflow-y-auto px-6 py-8">
        <Link to="/" className="flex items-center gap-3 rounded-3xl bg-slate-900/5 dark:bg-white/5 p-4 hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">OSIS SPENTUBA</div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mt-1">Website Resmi OSIS</p>
          </div>
        </Link>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Akses cepat ke seluruh menu OSIS dengan desain modern dan rapi.
        </p>

        <div className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                className="group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold opacity-80">Fitur Unggulan</p>
          <h2 className="mt-3 text-2xl font-bold">Interaksi Lebih Mudah</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-100/85">
            Dapatkan pengalaman web OSIS yang bersih, konsisten, dan mudah dijelajahi.
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-6 border-t border-slate-200/70 dark:border-slate-800/70">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between gap-2 rounded-3xl border border-gray-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            {theme === 'dark' ? <Sun className="w-5 h-5 text-slate-100" /> : <Moon className="w-5 h-5 text-slate-900" />}
          </button>

          <Link
            to="/admin"
            className="block rounded-3xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </aside>
  );
}
