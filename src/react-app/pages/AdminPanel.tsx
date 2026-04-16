import Navbar from '../components/Navbar';
import { ArrowLeft, Shield, BarChart3, MessageSquare, Heart, Lightbulb, AlertCircle, ImagePlus, Trash2, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ appreciations: 0, ideas: 0, forumThreads: 0, bullyingReports: 0 });

  // Album state
  const [albums, setAlbums] = useState<any[]>(() => {
    const saved = localStorage.getItem('osis_albums');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    photos: [] as string[],
  });

  // Struktur state
  const [struktur, setStruktur] = useState<any[]>(() => {
    const saved = localStorage.getItem('osis_struktur');
    return saved ? JSON.parse(saved) : [];
  });
  const [showStrukturForm, setShowStrukturForm] = useState(false);
  const [editingStruktur, setEditingStruktur] = useState<any>(null);
  const [strukturForm, setStrukturForm] = useState({
    position: '',
    name: '',
    description: '',
    photo: '',
    contact: {
      email: '',
      phone: '',
      instagram: '',
    },
  });

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminCode.trim()) {
      setErrorMessage('Masukkan kode akses terlebih dahulu.');
      return;
    }

    try {
      const response = await fetch('/api/admin/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode.trim() }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        fetchStats();
      } else {
        const data = await response.json().catch(() => null);
        if (response.status === 404) {
          setErrorMessage('API admin tidak ditemukan. Pastikan backend worker dijalankan.');
        } else {
          setErrorMessage(data?.error || `Kode akses salah. (${response.status})`);
        }
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan jaringan. Pastikan backend worker dijalankan.');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?admin_code=${adminCode}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const storedMetrics = localStorage.getItem('osis_admin_metrics');
    if (storedMetrics) {
      setAdminMetrics(JSON.parse(storedMetrics));
    }
  }, []);

  const [adminMetrics, setAdminMetrics] = useState({
    siswaAktif: '0',
    apresiasi: '0',
    ideTerealisasi: '0',
    eventBulanan: '0',
  });
  const [metricsMessage, setMetricsMessage] = useState('');
  const [ideaStatusMap, setIdeaStatusMap] = useState<Record<string, string>>({});
  const [ideasList, setIdeasList] = useState<any[]>([]);
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loadingAdminContent, setLoadingAdminContent] = useState(false);

  const fetchIdeasList = async () => {
    try {
      const response = await fetch('/api/ideas');
      if (response.ok) {
        const data = await response.json();
        const storedStatuses = JSON.parse(localStorage.getItem('osis_idea_statuses') || '{}');
        setIdeaStatusMap(storedStatuses);
        setIdeasList(data.map((idea: any) => ({
          ...idea,
          status: storedStatuses[String(idea.id)] || 'dipertimbangkan',
        })));
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const fetchForumThreads = async () => {
    try {
      const response = await fetch('/api/forum/threads');
      if (response.ok) {
        setForumThreads(await response.json());
      }
    } catch (error) {
      console.error('Error fetching forum threads:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/bullying-reports?admin_code=${adminCode}`);
      if (response.ok) {
        setReportsList(await response.json());
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (activeTab === 'ideas') {
      setLoadingAdminContent(true);
      fetchIdeasList().finally(() => setLoadingAdminContent(false));
    }

    if (activeTab === 'forum') {
      setLoadingAdminContent(true);
      fetchForumThreads().finally(() => setLoadingAdminContent(false));
    }

    if (activeTab === 'reports') {
      setLoadingAdminContent(true);
      fetchReports().finally(() => setLoadingAdminContent(false));
    }
  }, [isAuthenticated, activeTab]);

  const handleDeleteIdea = async (id: number) => {
    try {
      const response = await fetch(`/api/ideas/${id}?admin_code=${adminCode}`, { method: 'DELETE' });
      if (response.ok) {
        setIdeasList((prev) => prev.filter((idea) => idea.id !== id));
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const updateIdeaStatus = (id: number, status: string) => {
    const nextStatus = { ...ideaStatusMap, [String(id)]: status };
    localStorage.setItem('osis_idea_statuses', JSON.stringify(nextStatus));
    setIdeaStatusMap(nextStatus);
    setIdeasList((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status } : idea)));
  };

  const saveAdminMetrics = () => {
    localStorage.setItem('osis_admin_metrics', JSON.stringify(adminMetrics));
    setMetricsMessage('Statistik berhasil disimpan.');
  };

  const handleDeleteForumThread = async (id: number) => {
    try {
      const response = await fetch(`/api/forum/threads/${id}?admin_code=${adminCode}`, { method: 'DELETE' });
      if (response.ok) {
        setForumThreads((prev) => prev.filter((thread) => thread.id !== id));
      }
    } catch (error) {
      console.error('Error deleting forum thread:', error);
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      const response = await fetch(`/api/bullying-reports/${id}?admin_code=${adminCode}`, { method: 'DELETE' });
      if (response.ok) {
        setReportsList((prev) => prev.filter((report) => report.id !== id));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleAddAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    let newAlbums;
    if (editingAlbum) {
      newAlbums = albums.map(a => a.id === editingAlbum.id ? { ...albumForm, id: editingAlbum.id } : a);
      setEditingAlbum(null);
    } else {
      newAlbums = [...albums, { ...albumForm, id: Date.now() }];
    }
    setAlbums(newAlbums);
    localStorage.setItem('osis_albums', JSON.stringify(newAlbums));
    setAlbumForm({ title: '', date: '', location: '', description: '', photos: [] });
    setShowAlbumForm(false);
  };

  const handleDeleteAlbum = (id: number) => {
    const newAlbums = albums.filter(a => a.id !== id);
    setAlbums(newAlbums);
    localStorage.setItem('osis_albums', JSON.stringify(newAlbums));
  };

  const handleEditAlbum = (album: any) => {
    setEditingAlbum(album);
    setAlbumForm(album);
    setShowAlbumForm(true);
  };

  const handleAddStruktur = (e: React.FormEvent) => {
    e.preventDefault();
    let newStruktur;
    if (editingStruktur) {
      newStruktur = struktur.map(s => s.id === editingStruktur.id ? { ...strukturForm, id: editingStruktur.id } : s);
      setEditingStruktur(null);
    } else {
      newStruktur = [...struktur, { ...strukturForm, id: Date.now() }];
    }
    setStruktur(newStruktur);
    localStorage.setItem('osis_struktur', JSON.stringify(newStruktur));
    setStrukturForm({ position: '', name: '', description: '', photo: '', contact: { email: '', phone: '', instagram: '' } });
    setShowStrukturForm(false);
  };

  const handleDeleteStruktur = (id: number) => {
    const newStruktur = struktur.filter(s => s.id !== id);
    setStruktur(newStruktur);
    localStorage.setItem('osis_struktur', JSON.stringify(newStruktur));
  };

  const handleEditStruktur = (item: any) => {
    setEditingStruktur(item);
    setStrukturForm(item);
    setShowStrukturForm(true);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as any).photoFile as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setAlbumForm({ ...albumForm, photos: [...albumForm.photos, event.target.result as string] });
          input.value = '';
          (e.target as any).reset();
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAlbumForm({ ...albumForm, photos: albumForm.photos.filter((_, i) => i !== index) });
  };

  const handleStrukturPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStrukturForm({ ...strukturForm, photo: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-20">
        <Navbar />
        
        <div className="max-w-md mx-auto px-4 py-12 mt-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            </div>

            <p className="text-gray-600 mb-6">Masukkan kode akses untuk melanjutkan ke panel admin.</p>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kode Akses
                </label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Masukkan kode akses"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Masuk
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Kelola semua konten portal OSIS Connect</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
            { id: 'album', label: '🖼️ Album Kegiatan', icon: ImagePlus },
            { id: 'struktur', label: '👥 Pengurus OSIS', icon: Lightbulb },
            { id: 'appreciations', label: '💝 Apresiasi', icon: Heart },
            { id: 'ideas', label: '💡 Bank Ide', icon: Lightbulb },
            { id: 'forum', label: '💬 Forum', icon: MessageSquare },
            { id: 'reports', label: '⚠️ Laporan', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Apresiasi</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.appreciations}</p>
                  </div>
                  <Heart className="w-12 h-12 text-pink-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Ide</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.ideas}</p>
                  </div>
                  <Lightbulb className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Forum</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.forumThreads}</p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Laporan Bullying</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.bullyingReports}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Pengaturan Statistik Umum</h3>
                  <p className="text-sm text-gray-600 mt-1">Ubah angka siswa aktif, apresiasi, ide terealisasi, dan event bulanan dari halaman admin.</p>
                </div>
                <button
                  type="button"
                  onClick={saveAdminMetrics}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm"
                >
                  Simpan Statistik
                </button>
              </div>

              {metricsMessage && (
                <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                  {metricsMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Siswa Aktif</span>
                  <input
                    type="number"
                    value={adminMetrics.siswaAktif}
                    onChange={(e) => setAdminMetrics({ ...adminMetrics, siswaAktif: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Apresiasi</span>
                  <input
                    type="number"
                    value={adminMetrics.apresiasi}
                    onChange={(e) => setAdminMetrics({ ...adminMetrics, apresiasi: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Ide Terealisasi</span>
                  <input
                    type="number"
                    value={adminMetrics.ideTerealisasi}
                    onChange={(e) => setAdminMetrics({ ...adminMetrics, ideTerealisasi: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Event Bulanan</span>
                  <input
                    type="number"
                    value={adminMetrics.eventBulanan}
                    onChange={(e) => setAdminMetrics({ ...adminMetrics, eventBulanan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Fitur Admin</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Lihat statistik portal</li>
                    <li>✓ Kelola album kegiatan (tambah, edit, hapus foto)</li>
                    <li>✓ Hapus apresiasi, ide, forum</li>
                    <li>✓ Lihat laporan bullying</li>
                    <li>✓ Monitor pengunjung (akan ditambahkan)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Album Kegiatan Tab */}
        {activeTab === 'album' && (
          <div className="space-y-6">
            {!showAlbumForm ? (
              <button
                onClick={() => {
                  setShowAlbumForm(true);
                  setEditingAlbum(null);
                  setAlbumForm({ title: '', date: '', location: '', description: '', photos: [] });
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-3 justify-center"
              >
                <ImagePlus className="w-5 h-5" />
                Tambah Album Kegiatan Baru
              </button>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">
                  {editingAlbum ? 'Edit Album Kegiatan' : 'Tambah Album Kegiatan Baru'}
                </h2>

                <form onSubmit={handleAddAlbum} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Judul Kegiatan
                      </label>
                      <input
                        type="text"
                        value={albumForm.title}
                        onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                        placeholder="Misal: Perayaan Hari Kemerdekaan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Kegiatan
                      </label>
                      <input
                        type="date"
                        value={albumForm.date}
                        onChange={(e) => setAlbumForm({ ...albumForm, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lokasi Kegiatan
                    </label>
                    <input
                      type="text"
                      value={albumForm.location}
                      onChange={(e) => setAlbumForm({ ...albumForm, location: e.target.value })}
                      placeholder="Misal: Halaman Sekolah"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Kegiatan
                    </label>
                    <textarea
                      value={albumForm.description}
                      onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                      placeholder="Jelaskan kegiatan ini..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Foto-Foto Kegiatan
                    </label>
                    <form onSubmit={handleAddPhoto} className="flex gap-2 mb-3">
                      <input
                        type="file"
                        name="photoFile"
                        accept="image/*"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-all"
                      >
                        Upload Foto
                      </button>
                    </form>

                    {albumForm.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {albumForm.photos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo}
                              alt={`Album ${idx}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      {editingAlbum ? 'Update Album' : 'Simpan Album'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAlbumForm(false);
                        setEditingAlbum(null);
                        setAlbumForm({ title: '', date: '', location: '', description: '', photos: [] });
                      }}
                      className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {albums.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Daftar Album ({albums.length})</h2>
                {albums.map((album) => (
                  <div key={album.id} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{album.title}</h3>
                        <p className="text-gray-600 mb-2">{album.description}</p>
                        <p className="text-sm text-gray-500">
                          📅 {album.date} | 📍 {album.location} | 📸 {album.photos.length} foto
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAlbum(album)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Struktur/Pengurus Tab */}
        {activeTab === 'struktur' && (
          <div className="space-y-6">
            {!showStrukturForm ? (
              <button
                onClick={() => {
                  setShowStrukturForm(true);
                  setEditingStruktur(null);
                  setStrukturForm({ position: '', name: '', description: '', photo: '', contact: { email: '', phone: '', instagram: '' } });
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-3 justify-center"
              >
                <Lightbulb className="w-5 h-5" />
                Tambah Pengurus OSIS Baru
              </button>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">
                  {editingStruktur ? 'Edit Pengurus OSIS' : 'Tambah Pengurus OSIS Baru'}
                </h2>

                <form onSubmit={handleAddStruktur} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Posisi
                      </label>
                      <input
                        type="text"
                        value={strukturForm.position}
                        onChange={(e) => setStrukturForm({ ...strukturForm, position: e.target.value })}
                        placeholder="Misal: Ketua OSIS"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={strukturForm.name}
                        onChange={(e) => setStrukturForm({ ...strukturForm, name: e.target.value })}
                        placeholder="Nama pengurus"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={strukturForm.description}
                      onChange={(e) => setStrukturForm({ ...strukturForm, description: e.target.value })}
                      placeholder="Deskripsi peran dan tugas"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={strukturForm.contact.email}
                        onChange={(e) => setStrukturForm({ ...strukturForm, contact: { ...strukturForm.contact, email: e.target.value } })}
                        placeholder="email@sekolah.id"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telepon
                      </label>
                      <input
                        type="tel"
                        value={strukturForm.contact.phone}
                        onChange={(e) => setStrukturForm({ ...strukturForm, contact: { ...strukturForm.contact, phone: e.target.value } })}
                        placeholder="081234567890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={strukturForm.contact.instagram}
                        onChange={(e) => setStrukturForm({ ...strukturForm, contact: { ...strukturForm.contact, instagram: e.target.value } })}
                        placeholder="@username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Foto Profil
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStrukturPhotoUpload}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {strukturForm.photo && (
                      <div className="mt-4">
                        <img
                          src={strukturForm.photo}
                          alt={strukturForm.name}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      {editingStruktur ? 'Update Pengurus' : 'Simpan Pengurus'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStrukturForm(false);
                        setEditingStruktur(null);
                        setStrukturForm({ position: '', name: '', description: '', photo: '', contact: { email: '', phone: '', instagram: '' } });
                      }}
                      className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {struktur.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Daftar Pengurus ({struktur.length})</h2>
                {struktur.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-blue-600 font-semibold mb-2">{item.position}</p>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          📧 {item.contact.email} | 📱 {item.contact.phone} | 📷 {item.contact.instagram}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStruktur(item)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStruktur(item.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appreciations Tab */}
        {activeTab === 'appreciations' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Kelola Apresiasi</h2>
            <p className="text-gray-600 py-12 text-center">
              Fitur kelola apresiasi akan segera hadir. Anda dapat menghapus apresiasi yang tidak sesuai.
            </p>
          </div>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Kelola Bank Ide</h2>
            {loadingAdminContent ? (
              <p className="text-gray-600">Memuat daftar ide...</p>
            ) : ideasList.length === 0 ? (
              <p className="text-gray-600">Belum ada ide masuk. Semuanya akan muncul di sini ketika siswa mengirim ide.</p>
            ) : (
              <div className="space-y-4">
                {ideasList.map((idea) => (
                  <div key={idea.id} className="rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pengirim: <span className="font-semibold text-gray-800">{idea.user_name}</span></p>
                        <h3 className="text-xl font-semibold text-gray-900">{idea.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">Kategori: <span className="font-medium">{idea.category}</span></p>
                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-700">Status ide</label>
                          <select
                            value={idea.status || 'dipertimbangkan'}
                            onChange={(e) => updateIdeaStatus(idea.id, e.target.value)}
                            className="mt-2 w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="dipertimbangkan">Dipertimbangkan</option>
                            <option value="diproses">Diproses</option>
                            <option value="direalisasikan">Direalisasikan</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="h-fit px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Hapus Ide
                      </button>
                    </div>
                    <p className="text-gray-600 mt-4 leading-relaxed">{idea.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Kelola Forum</h2>
            {loadingAdminContent ? (
              <p className="text-gray-600">Memuat daftar forum...</p>
            ) : forumThreads.length === 0 ? (
              <p className="text-gray-600">Belum ada thread forum. Akan muncul saat siswa mengirim diskusi.</p>
            ) : (
              <div className="space-y-4">
                {forumThreads.map((thread) => (
                  <div key={thread.id} className="rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pengirim: <span className="font-semibold text-gray-800">{thread.user_name}</span></p>
                        <h3 className="text-xl font-semibold text-gray-900">{thread.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">Kategori: <span className="font-medium">{thread.category}</span></p>
                      </div>
                      <button
                        onClick={() => handleDeleteForumThread(thread.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Hapus Thread
                      </button>
                    </div>
                    <p className="text-gray-600 mt-4 leading-relaxed">{thread.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Laporan Bullying</h2>
            {loadingAdminContent ? (
              <p className="text-gray-600">Memuat laporan...</p>
            ) : reportsList.length === 0 ? (
              <p className="text-gray-600">Belum ada laporan bullying. Semua laporan masuk akan muncul di sini.</p>
            ) : (
              <div className="space-y-4">
                {reportsList.map((report) => (
                  <div key={report.id} className="rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pengirim: <span className="font-semibold text-gray-800">{report.reporter_name}</span></p>
                        <p className="text-sm text-slate-500">Lokasi: <span className="font-medium">{report.incident_location || 'Tidak disebutkan'}</span></p>
                      </div>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Hapus Laporan
                      </button>
                    </div>
                    <p className="text-gray-600 mt-4 leading-relaxed">{report.incident_description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
