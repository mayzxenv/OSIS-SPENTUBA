import Navbar from '../components/Navbar';
import { ArrowLeft, Sparkles, ThumbsUp, Star, Award, Trophy, TrendingUp, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

export default function Apresiasi() {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  
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

  const leaderboard = [
    { name: 'Ahmad Rizki', apresiasi: 45, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', badge: '👑' },
    { name: 'Siti Nurhaliza', apresiasi: 38, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', badge: '🥈' },
    { name: 'Budi Santoso', apresiasi: 32, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', badge: '🥉' },
    { name: 'Dina Putri', apresiasi: 28, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    { name: 'Arif Hidayat', apresiasi: 24, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
  ];

  const recentApresiasi = [
    {
      from: 'Rina Kartika',
      to: 'Tim OSIS Bidang Pendidikan',
      type: 'aktif_berdampak',
      message: 'Terima kasih sudah menyelenggarakan workshop yang sangat bermanfaat!',
      time: '2 jam lalu',
      likes: 12,
    },
    {
      from: 'Anonim',
      to: 'Maya Sari',
      type: 'inspiratif',
      message: 'Penampilan kamu di Festival Seni kemarin luar biasa! Sangat menginspirasi!',
      time: '5 jam lalu',
      likes: 18,
    },
    {
      from: 'Kevin Pratama',
      to: 'Panitia Lomba 17 Agustus',
      type: 'terima_kasih',
      message: 'Event kemarin seru banget! Terima kasih sudah bekerja keras!',
      time: '1 hari lalu',
      likes: 25,
    },
  ];

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setShowForm(true);
  };

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
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black font-['Space_Grotesk']">
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Apresiasi Digital
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mt-1">
                  Hargai kontribusi dan inspirasi dari teman-temanmu
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-2xl font-bold text-gray-800">567</span>
                </div>
                <p className="text-sm text-gray-600">Total Apresiasi</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-gray-800">+34</span>
                </div>
                <p className="text-sm text-gray-600">Minggu Ini</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-800">45</span>
                </div>
                <p className="text-sm text-gray-600">Top Bulan Ini</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form & Types */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appreciation Types */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Pilih Jenis Apresiasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {apresiasiTypes.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleTypeSelect(item.type)}
                      className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                      <div className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${item.glow} group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{item.emoji}</span>
                        <h3 className="text-lg font-bold text-gray-800">{item.label}</h3>
                      </div>
                      <p className="text-sm text-gray-600">Klik untuk beri apresiasi</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 animate-in slide-in-from-top duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Kirim Apresiasi</h3>
                  {selectedType && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700">
                        Jenis: <span className="font-semibold">{apresiasiTypes.find(t => t.type === selectedType)?.label}</span>
                      </p>
                    </div>
                  )}
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Untuk Siapa? *
                      </label>
                      <input
                        type="text"
                        placeholder="Nama orang / tim / kelas"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pesan Apresiasi (opsional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tulis pesan singkat..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                      ></textarea>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonim"
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <label htmlFor="anonim" className="text-sm text-gray-700">
                        Kirim sebagai anonim
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/30 transition-all hover:-translate-y-0.5"
                      >
                        ✨ Kirim Apresiasi
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Recent Appreciations */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Apresiasi Terbaru</h2>
                <div className="space-y-4">
                  {recentApresiasi.map((item, idx) => {
                    const type = apresiasiTypes.find(t => t.type === item.type);
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${type?.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                            {type && <type.icon className="w-6 h-6 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-800">{item.from}</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-semibold text-indigo-600">{item.to}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{item.message}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{item.time}</span>
                              <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span>{item.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Leaderboard */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Leaderboard Bulan Ini
                  </h2>
                </div>
                <div className="space-y-4">
                  {leaderboard.map((person, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                        idx < 3
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {person.badge && (
                          <span className="absolute -top-1 -right-1 text-lg">{person.badge}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{person.name}</div>
                        <div className="text-sm text-gray-600">{person.apresiasi} apresiasi</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-semibold">🔄 Reset otomatis</span> setiap tanggal 1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
