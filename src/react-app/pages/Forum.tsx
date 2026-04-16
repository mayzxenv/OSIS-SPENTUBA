import Navbar from '../components/Navbar';
import { ArrowLeft, MessageSquare, TrendingUp, Clock, Pin, Lock, ThumbsUp, MessageCircle, Eye } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

export default function Forum() {
  const [showNewThread, setShowNewThread] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [threadCategory, setThreadCategory] = useState<string>('');

  const categories = [
    { id: 'all', name: 'Semua', icon: MessageSquare, color: 'text-gray-600' },
    { id: 'event', name: 'Event', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'kritik', name: 'Kritik & Saran', icon: MessageCircle, color: 'text-orange-600' },
    { id: 'ide', name: 'Ide Kegiatan', icon: MessageSquare, color: 'text-purple-600' },
  ];

  const threads: any[] = [];

  const stats = [
    { icon: MessageSquare, value: '234', label: 'Thread Aktif', color: 'text-blue-600' },
    { icon: MessageCircle, value: '1,567', label: 'Diskusi', color: 'text-purple-600' },
    { icon: TrendingUp, value: '892', label: 'Aktivitas Hari Ini', color: 'text-green-600' },
  ];

  const filteredThreads = selectedCategory === 'all' 
    ? threads 
    : threads.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Kembali ke Home</span>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black font-['Space_Grotesk']">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Forum Diskusi
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mt-1">
                  Berbagi pendapat dan diskusi dengan komunitas sekolah
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewThread(!showNewThread)}
              className="lg:ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 justify-center"
            >
              <MessageSquare className="w-5 h-5" />
              Buat Thread Baru
            </button>
          </div>

          {/* New Thread Form */}
          {showNewThread && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200 animate-in slide-in-from-top duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Buat Diskusi Baru</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Thread *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Usulan Kegiatan Bakti Sosial Bulanan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {categories
                      .filter((cat) => cat.id !== 'all')
                      .map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setThreadCategory(cat.id)}
                          className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all ${
                            threadCategory === cat.id
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <cat.icon className={`w-4 h-4 ${threadCategory === cat.id ? 'text-white' : cat.color}`} />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                  </div>
                  <input type="hidden" name="category" value={threadCategory} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Tulis topik diskusi kamu di sini..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    💬 Posting Thread
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewThread(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Threads List */}
          <div className="space-y-4">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 p-6"
              >
                <div className="flex gap-4">
                  <img
                    src={thread.avatar}
                    alt={thread.author}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.isPinned && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            <Pin className="w-3 h-3" />
                            Pinned
                          </span>
                        )}
                        {thread.isLocked && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        )}
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {categories.find(c => c.id === thread.category)?.name}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{thread.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="font-medium text-gray-700">{thread.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {thread.lastReply}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-medium">{thread.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">{thread.replies} balasan</span>
                      </button>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{thread.views}</span>
                      </div>
                      <button className="ml-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all text-xs">
                        Baca Thread
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
