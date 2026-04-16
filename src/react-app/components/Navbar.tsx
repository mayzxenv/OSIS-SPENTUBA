import { Menu, X, Sparkles, MessageSquare, Camera, Users2, Shield, Heart, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/react-app/theme';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: Sparkles, label: 'Apresiasi', href: '/apresiasi', type: 'link' },
    { icon: Camera, label: 'Album Kegiatan', href: '/album-kegiatan', type: 'link' },
    { icon: Users2, label: 'Struktur Organisasi', href: '/struktur-organisasi', type: 'link' },
    { icon: MessageSquare, label: 'Forum', href: '/forum', type: 'link' },
    { icon: Heart, label: 'Ruang Pribadi', href: '/ruang-pribadi', type: 'link' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/60" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="Logo OSIS SMPN 7 Bangkalan"
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl object-cover shadow-lg shadow-slate-500/20"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/logo.svg';
                }}
              />
              <div className="leading-tight">
                <div className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 font-['Space_Grotesk']">
                  OSIS SPENTUBA
                </div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-medium leading-snug mt-0">
                  Website Resmi OSIS
                </p>
              </div>
            </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
            {navItems.map((item) => {
              const className = "flex items-center gap-2 px-4 py-2 rounded-2xl text-gray-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 dark:hover:text-white transition-all duration-200 group";
              const content = (
                <>
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              );
              
              return (
                <Link key={item.label} to={item.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Admin & Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white/90 border border-gray-200/70 hover:bg-gray-100 transition-all dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors rounded-xl border border-gray-200/70 hover:border-amber-300 dark:text-slate-100 dark:border-slate-700"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
          <div className="px-3 py-3 space-y-2">
            {navItems.map((item) => {
              const className = "flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all";
              const content = (
                <>
                  <item.icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{item.label}</span>
                </>
              );
              
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={className}
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </Link>
              );
            })}
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <Link
                to="/admin"
                className="block w-full flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg hover:bg-amber-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Admin Panel</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
                className="block w-full px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-100 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-all dark:bg-slate-800 dark:border-slate-700"
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    <div className="h-16 md:h-20" aria-hidden="true" />
  </>
);
}
