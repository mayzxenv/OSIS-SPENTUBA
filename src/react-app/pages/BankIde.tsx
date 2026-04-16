import Navbar from '../components/Navbar';
import { ArrowLeft, Lightbulb, TrendingUp, CheckCircle, Clock, Flame, ThumbsUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

export default function BankIde() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'popular' | 'new'>('all');

  const statusColors = {
    dipertimbangkan: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: '⏳ Dipertimbangkan' },
    diproses: { bg: 'bg-blue-100', text: 'text-blue-800', icon: TrendingUp, label: '🔄 Diproses' },
    direalisasikan: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: '✅ Direalisasikan' },
  };

  const ideas: any[] = [];

  const stats = [
    { icon: Lightbulb, value: '127', label: 'Total Ide', color: 'text-purple-600' },
    { icon: TrendingUp, value: '23', label: 'Diproses', color: 'text-blue-600' },
    { icon: CheckCircle, value: '18', label: 'Terealisasi', color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-4 group dark:text-slate-300"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Kembali ke Home</span>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black font-['Space_Grotesk']">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Bank Ide
                  </span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 mt-1">
                  Wujudkan ide kreatifmu untuk kemajuan sekolah
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-700 border border-gray-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                Semua Ide
              </button>
              <button
                onClick={() => setFilter('popular')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === 'popular'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-700 border border-gray-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                <Flame className="w-4 h-4" />
                Populer
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'new'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-700 border border-gray-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                Terbaru
              </button>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              Kirim Ide Baru
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-slate-700 animate-in slide-in-from-top duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Bagikan Ide Kreatifmu</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Ide *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Workshop Programming untuk Pemula"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                    <option value="">Pilih Kategori</option>
                    <option value="pendidikan">Pendidikan</option>
                    <option value="event">Event</option>
                    <option value="fasilitas">Fasilitas</option>
                    <option value="lingkungan">Lingkungan</option>
                    <option value="kreatif">Kreatif</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Ide *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Jelaskan ide kamu secara detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
                  >
                    💡 Kirim Ide
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 gap-6">
            {ideas.map((idea) => {
              const statusInfo = statusColors[idea.status as keyof typeof statusColors] || statusColors.dipertimbangkan;
              return (
                <div
                  key={idea.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {idea.category}
                          </span>
                          <span className={`px-3 py-1 ${statusInfo.bg} ${statusInfo.text} rounded-full text-xs font-semibold flex items-center gap-1`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{idea.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{idea.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{idea.author}</span>
                          <span>•</span>
                          <span>{idea.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all font-medium">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{idea.votes}</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium">
                        <MessageSquare className="w-4 h-4" />
                        <span>{idea.comments}</span>
                      </button>
                      <button className="ml-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm">
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
