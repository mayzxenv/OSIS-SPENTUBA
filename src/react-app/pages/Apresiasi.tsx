import Navbar from '../components/Navbar';
import { ArrowLeft, ThumbsUp, Star, Award, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiUrl } from '@/react-app/lib/api';

interface Appreciation {
  id: number;
  from_user_name: string;
  to_name: string;
  type: string;
  message: string;
  is_anonymous: number;
  likes: number;
  created_at: string;
}

interface LeaderboardEntry {
  to_name: string;
  count: number;
}

export default function Apresiasi() {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    from_user_name: '',
    to_name: '',
    message: '',
    is_anonymous: false,
  });

  const apresiasiTypes = [
    {
      type: 'terima_kasih',
      icon: ThumbsUp,
      label: 'Terima Kasih',
      color: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/30',
      emoji: '👍',
    },
    {
      type: 'inspiratif',
      icon: Star,
      label: 'Inspiratif',
      color: 'from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/30',
      emoji: '⭐',
    },
    {
      type: 'aktif_berdampak',
      icon: Award,
      label: 'Aktif & Berdampak',
      color: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/30',
      emoji: '🏅',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apprRes, leaderRes] = await Promise.all([
        fetch(apiUrl('/api/appreciations')),
        fetch(apiUrl('/api/appreciations/leaderboard')),
      ]);
      
      const apprData = await apprRes.json();
      const leaderData = await leaderRes.json();
      
      setAppreciations(apprData);
      setLeaderboard(leaderData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.from_user_name.trim() || !formData.to_name.trim()) {
      alert('Mohon isi nama pengirim dan nama penerima apresiasi');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/appreciations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_user_name: formData.from_user_name,
          to_name: formData.to_name,
          type: selectedType,
          message: formData.message,
          is_anonymous: formData.is_anonymous,
        }),
      });

      if (response.ok) {
        alert('🎉 Apresiasi berhasil dikirim!');
        
        setFormData({
          from_user_name: '',
          to_name: '',
          message: '',
          is_anonymous: false,
        });
        setShowForm(false);
        setSelectedType('');
        
        fetchData();
      } else {
        alert('Gagal mengirim apresiasi. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting appreciation:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name as keyof typeof prev] : value
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Apresiasi
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
            Tunjukkan apresiasi kepada teman, guru, atau siapa saja yang telah memberikan dampak positif. Setiap apresiasi membantu membangun budaya yang lebih baik! 🌟
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appreciation Types */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Pilih Jenis Apresiasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {apresiasiTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => handleTypeSelect(type.type)}
                    className={`p-6 rounded-xl transition-all duration-300 ${
                      selectedType === type.type
                        ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:shadow-lg'
                    }`}
                  >
                    <type.icon className="w-8 h-8 mx-auto mb-3" />
                    <p className="font-semibold text-lg">{type.emoji}</p>
                    <p className="font-bold mt-2">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Buat Apresiasi</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Anda
                      </label>
                      <input
                        type="text"
                        name="from_user_name"
                        value={formData.from_user_name}
                        onChange={handleChange}
                        placeholder="Masukkan nama Anda"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Penerima Apresiasi
                      </label>
                      <input
                        type="text"
                        name="to_name"
                        value={formData.to_name}
                        onChange={handleChange}
                        placeholder="Siapa yang ingin Anda apresiasi?"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pesan Apresiasi (Opsional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tuliskan alasan apresiasi Anda..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_anonymous"
                      checked={formData.is_anonymous}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Kirim sebagai Anonim</span>
                  </label>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Mengirim...' : '🎉 Kirim Apresiasi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedType('');
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appreciations List */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Apresiasi Terbaru</h2>
              {loading ? (
                <p className="text-gray-500 py-8">Memuat apresiasi...</p>
              ) : appreciations.length === 0 ? (
                <p className="text-gray-500 py-8">Belum ada apresiasi. Jadilah yang pertama! 💝</p>
              ) : (
                <div className="space-y-4">
                  {appreciations.slice(0, 10).map((appreciation) => (
                    <div key={appreciation.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {appreciation.is_anonymous ? 'Anonim' : appreciation.from_user_name}
                          </p>
                          <p className="text-sm text-gray-600">untuk <strong>{appreciation.to_name}</strong></p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(appreciation.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {appreciation.message && (
                        <p className="text-gray-700 text-sm mt-2">"{appreciation.message}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-800">Papan Peringkat Bulan Ini</h2>
              </div>
              {loading ? (
                <p className="text-gray-500">Memuat...</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-gray-500">Belum ada apresiasi bulan ini</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-indigo-600">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{entry.to_name}</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-purple-600">{entry.count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
