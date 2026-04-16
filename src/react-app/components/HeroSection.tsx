import { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, Lightbulb, ArrowRight, TrendingUp, Users, Zap, Lock, Monitor, Smartphone } from 'lucide-react';
import { Link } from 'react-router';
import { useTheme } from '@/react-app/theme';

export default function HeroSection() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'desktop' | 'hp'>('desktop');
  const [metrics, setMetrics] = useState({
    siswaAktif: '0',
    apresiasi: '0',
    ideTerealisasi: '0',
    eventBulanan: '0',
  });

  useEffect(() => {
    const stored = localStorage.getItem('osis_admin_metrics');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMetrics({
        siswaAktif: parsed.siswaAktif ?? '0',
        apresiasi: parsed.apresiasi ?? '0',
        ideTerealisasi: parsed.ideTerealisasi ?? '0',
        eventBulanan: parsed.eventBulanan ?? '0',
      });
    }
  }, []);

  const quickActions = [
    {
      icon: Sparkles,
      label: 'Beri Apresiasi',
      description: 'Hargai kontribusi teman',
      color: 'from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/30',
      link: '/apresiasi',
    },
    {
      icon: Lightbulb,
      label: 'Kirim Ide',
      description: 'Wujudkan ide kreatifmu',
      color: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/30',
      link: '/bank-ide',
    },
    {
      icon: MessageSquare,
      label: 'Diskusi',
      description: 'Berbagi pendapat',
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/30',
      link: '/forum',
    },
    {
      icon: Lock,
      label: 'Ruang Pribadi',
      description: 'Laporkan bullying dengan aman',
      color: 'from-rose-500 to-pink-500',
      glow: 'shadow-rose-500/30',
      link: '/ruang-pribadi',
    },
  ];

  const stats = [
    { icon: Users, value: metrics.siswaAktif, label: 'Siswa Aktif' },
    { icon: Sparkles, value: metrics.apresiasi, label: 'Apresiasi' },
    { icon: TrendingUp, value: metrics.ideTerealisasi, label: 'Ide Terealisasi' },
    { icon: Zap, value: metrics.eventBulanan, label: 'Event Bulanan' },
  ];

  const isDarkMode = theme === 'dark';
  const isPhoneMode = viewMode === 'hp';
  const heroBg = isDarkMode
    ? 'from-slate-950 via-slate-900 to-purple-950 text-white'
    : 'from-indigo-50 via-purple-50 to-pink-50 text-gray-800';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${heroBg} pt-20 pb-10`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`relative mx-auto px-4 sm:px-6 lg:px-8 ${isPhoneMode ? 'max-w-screen-sm' : 'max-w-7xl'}`}>
        <div className="text-center mb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full border border-purple-200/50 dark:border-slate-700/50 mb-5 transition-all duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-medium text-gray-700 dark:text-slate-200">🔥 2,345 siswa online</span>
          </div>

          {/* View Mode Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full transition-all text-xs sm:text-sm font-semibold ${!isPhoneMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewMode('hp')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full transition-all text-xs sm:text-sm font-semibold ${isPhoneMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              HP
            </button>
          </div>

          {/* Main Heading */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <img
              src="/icon.png"
              alt="Logo OSIS Spentuba"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg shadow-indigo-500/20"
            />
            <h1 className={`font-black text-center font-['Space_Grotesk'] leading-tight ${isPhoneMode ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'}`}>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pusat Aktivitas
              </span>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} block mt-2`}>
                OSIS SPENTUBA
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-600'} mb-8 max-w-2xl mx-auto leading-relaxed`}>
            Platform resmi OSIS Spentuba untuk apresiasi, kolaborasi, dan aksi nyata.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center mb-10 w-full max-w-2xl mx-auto">
            <Link
              to="/album-kegiatan"
              className="group w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-1"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Lihat Album Kegiatan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/struktur-organisasi"
              className={`w-full sm:w-auto px-4 py-3 rounded-xl font-semibold text-sm sm:text-base hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-1 ${isDarkMode ? 'bg-white/10 text-gray-100 border border-gray-600 hover:bg-white/20' : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white'}`}
            >
              👥 Kenali Pengurus OSIS
            </Link>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className={`grid grid-cols-1 ${isPhoneMode ? '' : 'md:grid-cols-3'} gap-6 mb-16`}>
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.link}
              className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/40 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-3xl flex items-center justify-center mb-3 shadow-lg ${action.glow} group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                {action.label}
              </h3>
              <p className="text-gray-600">{action.description}</p>
              <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                Mulai
                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
