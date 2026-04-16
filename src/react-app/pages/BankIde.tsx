import Navbar from '../components/Navbar';
import { ArrowLeft, Lightbulb, TrendingUp, CheckCircle, Clock, Flame, ThumbsUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function BankIde() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'popular' | 'new'>('all');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [newIdea, setNewIdea] = useState({
    title: '',
    category: '',
    description: '',
    author: '',
  });

  const ideaCategories = [
    { id: 'pendidikan', name: 'Pendidikan', color: 'from-cyan-500 to-blue-500' },
    { id: 'event', name: 'Event', color: 'from-purple-500 to-pink-500' },
    { id: 'fasilitas', name: 'Fasilitas', color: 'from-emerald-500 to-teal-500' },
    { id: 'lingkungan', name: 'Lingkungan', color: 'from-green-500 to-lime-500' },
    { id: 'kreatif', name: 'Kreatif', color: 'from-fuchsia-500 to-violet-500' },
    { id: 'lainnya', name: 'Lainnya', color: 'from-slate-500 to-slate-700' },
  ];

  const statusColors = {
    dipertimbangkan: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: '⏳ Dipertimbangkan' },
    diproses: { bg: 'bg-blue-100', text: 'text-blue-800', icon: TrendingUp, label: '🔄 Diproses' },
    direalisasikan: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: '✅ Direalisasikan' },
  };

  const totalIdeas = ideas.length;
  const processingIdeas = ideas.filter((idea) => idea.status === 'diproses').length;
  const realizedIdeas = ideas.filter((idea) => idea.status === 'direalisasikan').length;

  const stats = [
    { icon: Lightbulb, value: totalIdeas.toString(), label: 'Total Ide', color: 'text-purple-600' },
    { icon: TrendingUp, value: processingIdeas.toString(), label: 'Diproses', color: 'text-blue-600' },
    { icon: CheckCircle, value: realizedIdeas.toString(), label: 'Terealisasi', color: 'text-green-600' },
  ];

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('/api/ideas');
        if (response.ok) {
          const data = await response.json();
          const storedStatuses = JSON.parse(localStorage.getItem('osis_idea_statuses') || '{}');
          setIdeas(data.map((idea: any) => ({
            ...idea,
            status: storedStatuses[String(idea.id)] || 'dipertimbangkan',
          })));
        }
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };

    fetchIdeas();
  }, []);

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionMessage('');

    if (!newIdea.title.trim() || !newIdea.category || !newIdea.description.trim() || !newIdea.author.trim()) {
      setSubmissionMessage('Mohon lengkapi semua kolom ide.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: newIdea.author,
          title: newIdea.title,
          description: newIdea.description,
          category: newIdea.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newIdeaEntry = {
          id: data.id ?? Date.now(),
          user_name: newIdea.author,
          title: newIdea.title,
          description: newIdea.description,
          category: newIdea.category,
          votes: 0,
          created_at: new Date().toISOString(),
          status: 'dipertimbangkan',
        };

        const storedStatuses = JSON.parse(localStorage.getItem('osis_idea_statuses') || '{}');
        storedStatuses[String(newIdeaEntry.id)] = 'dipertimbangkan';
        localStorage.setItem('osis_idea_statuses', JSON.stringify(storedStatuses));

        setIdeas((prev) => [newIdeaEntry, ...prev]);
        setSubmissionMessage('Ide berhasil dikirim. Terima kasih!');
        setNewIdea({ title: '', category: '', description: '', author: '' });
      } else {
        setSubmissionMessage('Gagal mengirim ide. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error sending idea:', error);
      setSubmissionMessage('Terjadi kesalahan saat mengirim ide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIdeas = ideas
    .slice()
    .sort((a, b) => {
      if (filter === 'popular') {
        return (b.votes || 0) - (a.votes || 0);
      }
      if (filter === 'new') {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
      return 0;
    });

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
              <form className="space-y-4" onSubmit={handleIdeaSubmit}>
                {submissionMessage && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                    {submissionMessage}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Ide *
                  </label>
                  <input
                    type="text"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    placeholder="Contoh: Workshop Programming untuk Pemula"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ideaCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setNewIdea({ ...newIdea, category: category.id })}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all border ${
                          newIdea.category === category.id
                            ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg shadow-${category.color.replace('from-', '').replace('to-', '')}/30`
                            : 'bg-white text-slate-700 border-gray-200 hover:border-purple-300 hover:bg-slate-50'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pengirim *
                  </label>
                  <input
                    type="text"
                    value={newIdea.author}
                    onChange={(e) => setNewIdea({ ...newIdea, author: e.target.value })}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Ide *
                  </label>
                  <textarea
                    rows={5}
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                    placeholder="Jelaskan ide kamu secara detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isSubmitting
                        ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? 'Mengirim...' : '💡 Kirim Ide'}
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
            {filteredIdeas.map((idea) => {
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
                          <span className="font-medium">{idea.user_name || idea.author || 'Anonim'}</span>
                          <span>•</span>
                          <span>{idea.created_at ? new Date(idea.created_at).toLocaleDateString() : idea.date || '-'}</span>
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
