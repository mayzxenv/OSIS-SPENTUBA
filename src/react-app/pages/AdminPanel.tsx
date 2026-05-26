import Navbar from '../components/Navbar';
import { ArrowLeft, Shield, BarChart3, MessageSquare, Heart, Lightbulb, AlertCircle, ImagePlus, Trash2, Edit2, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '@/react-app/lib/api';

type AlbumFormState = {
  title: string;
  date: string;
  location: string;
  description: string;
  photos: string[];
  videos: string[];
  visibilityDays: '1' | '7' | '30' | 'forever';
};

const emptyAlbumForm: AlbumFormState = {
  title: '',
  date: '',
  location: '',
  description: '',
  photos: [],
  videos: [],
  visibilityDays: 'forever',
};

function normalizeMediaList(value: unknown, singleFallback?: unknown): string[] {
  const fromArray = Array.isArray(value) ? value : [];
  const normalized = fromArray.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  if (typeof singleFallback === 'string' && singleFallback.trim().length > 0) {
    return [singleFallback];
  }

  return [];
}

function normalizeAlbumFormData(raw: any): AlbumFormState {
  const rawVisibility = Number(raw?.visibility_days);
  const visibilityDays: AlbumFormState['visibilityDays'] =
    rawVisibility === 1 || rawVisibility === 7 || rawVisibility === 30
      ? String(rawVisibility) as AlbumFormState['visibilityDays']
      : 'forever';

  return {
    title: raw?.title || '',
    date: raw?.date || '',
    location: raw?.location || '',
    description: raw?.description || '',
    photos: normalizeMediaList(raw?.photos, raw?.photo),
    videos: normalizeMediaList(raw?.videos, raw?.video),
    visibilityDays,
  };
}

function parseJsonOrFallback<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const reportCategoryOrder = ['teman_curhat', 'laporan_pelanggaran', 'laporan_bullying'] as const;

function getReportCategoryMeta(category: string) {
  const normalized = (category || '').trim();
  if (normalized === 'teman_curhat') {
    return { label: 'Teman Curhat', badgeClass: 'bg-violet-100 text-violet-700 border-violet-200' };
  }
  if (normalized === 'laporan_pelanggaran') {
    return { label: 'Laporan Pelanggaran', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  return { label: 'Laporan Bullying', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200' };
}

export default function AdminPanel() {
  const MAX_PHOTOS = 8;
  const MAX_VIDEOS = 1;
  const MAX_VIDEO_SIZE_MB = 30;
  const ALBUM_REQUEST_TIMEOUT_MS = 20000;
  const RUNTIME_API_BASE_URL_KEY = 'osis_api_base_url';

  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ appreciations: 0, ideas: 0, forumThreads: 0, bullyingReports: 0 });

  // Album state
  const [albums, setAlbums] = useState<any[]>(() => {
    const parsed = parseJsonOrFallback<unknown>(localStorage.getItem('osis_albums'), []);
    return Array.isArray(parsed) ? parsed : [];
  });
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [albumForm, setAlbumForm] = useState<AlbumFormState>(emptyAlbumForm);
  const [albumUploadMessage, setAlbumUploadMessage] = useState('');
  const [syncingAlbums, setSyncingAlbums] = useState(false);
  const [albumSyncMessage, setAlbumSyncMessage] = useState('');
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const albumSubmitLockRef = useRef(false);

  // Struktur state
  const [struktur, setStruktur] = useState<any[]>(() => {
    const parsed = parseJsonOrFallback<unknown>(localStorage.getItem('osis_struktur'), []);
    return Array.isArray(parsed) ? parsed : [];
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
      tiktok: '',
    },
  });

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const normalizedCode = adminCode.trim();
    if (!normalizedCode) {
      setErrorMessage('Masukkan kode akses terlebih dahulu.');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/admin/verify-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode }),
      });

      if (response.ok) {
        setAdminCode(normalizedCode);
        setIsAuthenticated(true);
        fetchStats();
      } else {
        const data = await response.json().catch(() => null);
        if (response.status === 404) {
          setErrorMessage('API admin tidak ditemukan. Pastikan backend worker dijalankan.');
        } else if (response.status === 405) {
          setErrorMessage('Metode login tidak didukung di host ini. Hubungkan frontend ke backend API (VITE_API_BASE_URL).');
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
      const response = await fetch(apiUrl(`/api/admin/stats?admin_code=${encodedAdminCode}`));
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const parsed = parseJsonOrFallback<Record<string, string> | null>(localStorage.getItem('osis_admin_metrics'), null);
    if (parsed && typeof parsed === 'object') {
      setAdminMetrics((prev) => ({
        ...prev,
        siswaAktif: String(parsed.siswaAktif ?? prev.siswaAktif),
        apresiasi: String(parsed.apresiasi ?? prev.apresiasi),
        ideTerealisasi: String(parsed.ideTerealisasi ?? prev.ideTerealisasi),
        eventBulanan: String(parsed.eventBulanan ?? prev.eventBulanan),
      }));
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
  const [appreciationsList, setAppreciationsList] = useState<any[]>([]);
  const [ideasList, setIdeasList] = useState<any[]>([]);
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loadingAdminContent, setLoadingAdminContent] = useState(false);
  const encodedAdminCode = encodeURIComponent(adminCode.trim());

  const fetchAppreciations = async () => {
    try {
      const response = await fetch(apiUrl('/api/appreciations'));
      if (response.ok) {
        setAppreciationsList(await response.json());
      }
    } catch (error) {
      console.error('Error fetching appreciations:', error);
    }
  };

  const fetchIdeasList = async () => {
    try {
      const response = await fetch(apiUrl('/api/ideas'));
      if (response.ok) {
        const data = await response.json();
        const storedStatuses = parseJsonOrFallback<Record<string, string>>(localStorage.getItem('osis_idea_statuses'), {});
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
      const response = await fetch(apiUrl('/api/forum/threads'));
      if (response.ok) {
        setForumThreads(await response.json());
      }
    } catch (error) {
      console.error('Error fetching forum threads:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(apiUrl(`/api/bullying-reports?admin_code=${encodedAdminCode}`));
      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((report: any) => ({
              ...report,
              report_category: report?.report_category || report?.category || 'laporan_bullying',
            }))
          : [];
        setReportsList(normalized);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const albumApiPath = encodedAdminCode
        ? `/api/albums?admin_code=${encodedAdminCode}`
        : '/api/albums';
      
      const response = await fetch(apiUrl(albumApiPath), { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const remoteAlbums = Array.isArray(data) ? data : [];
        setAlbums(remoteAlbums);
        localStorage.setItem('osis_albums', JSON.stringify(remoteAlbums));
        localStorage.setItem('osis_albums_timestamp', Date.now().toString());
        return;
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }

    // Fallback to cache only if server unavailable
    const cached = localStorage.getItem('osis_albums');
    const timestamp = localStorage.getItem('osis_albums_timestamp');
    
    if (cached && timestamp) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setAlbums(parsed);
          return;
        }
      } catch {
        localStorage.removeItem('osis_albums');
        localStorage.removeItem('osis_albums_timestamp');
      }
    }

    setAlbums([]);
  };

  const getLegacyAlbumsForSync = (): any[] => {
    const candidates: any[] = [];
    const keys = ['osis_albums_legacy_backup', 'osis_albums'];

    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          candidates.push(...parsed);
        }
      } catch {
        // Ignore malformed local cache.
      }
    }

    const seen = new Set<string>();
    return candidates.filter((album) => {
      const normalized = normalizeAlbumFormData(album);
      const signature = `${normalized.title}|${normalized.date}|${normalized.location}|${normalized.description}`;
      if (seen.has(signature)) {
        return false;
      }
      seen.add(signature);
      return normalized.title.trim().length > 0;
    });
  };

  const syncLegacyAlbumsToServer = async () => {
    setAlbumSyncMessage('');
    setAlbumUploadMessage('');

    if (!adminCode.trim()) {
      setAlbumSyncMessage('Kode admin belum tersedia. Login ulang lalu coba sinkronkan lagi.');
      return;
    }

    const legacyAlbums = getLegacyAlbumsForSync();
    if (legacyAlbums.length === 0) {
      setAlbumSyncMessage('Tidak ada album lokal yang perlu disinkronkan.');
      return;
    }

    setSyncingAlbums(true);

    try {
      const remoteResponse = await fetch(apiUrl('/api/albums'));
      const remoteAlbums = remoteResponse.ok ? await remoteResponse.json() : [];
      const remoteSignatures = new Set(
        (Array.isArray(remoteAlbums) ? remoteAlbums : []).map((album: any) => {
          const normalized = normalizeAlbumFormData(album);
          return `${normalized.title}|${normalized.date}|${normalized.location}|${normalized.description}`;
        })
      );

      let syncedCount = 0;

      for (const rawAlbum of legacyAlbums) {
        const normalized = normalizeAlbumFormData(rawAlbum);
        const signature = `${normalized.title}|${normalized.date}|${normalized.location}|${normalized.description}`;
        if (remoteSignatures.has(signature)) {
          continue;
        }

        const response = await fetch(apiUrl(`/api/albums?admin_code=${encodedAdminCode}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalized),
        });

        if (response.ok) {
          syncedCount += 1;
          remoteSignatures.add(signature);
        }
      }

      localStorage.setItem('osis_albums_migrated', '1');
      await fetchAlbums();
      setAlbumSyncMessage(
        syncedCount > 0
          ? `${syncedCount} album lokal berhasil disinkronkan ke server.`
          : 'Semua album lokal sudah ada di server.'
      );
    } catch (error) {
      console.error('Error syncing legacy albums:', error);
      setAlbumSyncMessage('Sinkronisasi gagal. Cek koneksi internet lalu coba lagi.');
    } finally {
      setSyncingAlbums(false);
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

    if (activeTab === 'appreciations') {
      setLoadingAdminContent(true);
      fetchAppreciations().finally(() => setLoadingAdminContent(false));
    }

    if (activeTab === 'forum') {
      setLoadingAdminContent(true);
      fetchForumThreads().finally(() => setLoadingAdminContent(false));
    }

    if (activeTab === 'reports') {
      setLoadingAdminContent(true);
      fetchReports().finally(() => setLoadingAdminContent(false));
    }

    if (activeTab === 'album') {
      setLoadingAdminContent(true);
      fetchAlbums().finally(() => setLoadingAdminContent(false));
    }
  }, [isAuthenticated, activeTab]);

  const handleDeleteIdea = async (id: number) => {
    try {
      const response = await fetch(apiUrl(`/api/ideas/${id}?admin_code=${encodedAdminCode}`), { method: 'DELETE' });
      if (response.ok) {
        setIdeasList((prev) => prev.filter((idea) => idea.id !== id));
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleDeleteAppreciation = async (id: number) => {
    try {
      const response = await fetch(apiUrl(`/api/appreciations/${id}?admin_code=${encodedAdminCode}`), { method: 'DELETE' });
      if (response.ok) {
        setAppreciationsList((prev) => prev.filter((appreciation) => appreciation.id !== id));
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting appreciation:', error);
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
      const response = await fetch(apiUrl(`/api/forum/threads/${id}?admin_code=${encodedAdminCode}`), { method: 'DELETE' });
      if (response.ok) {
        setForumThreads((prev) => prev.filter((thread) => thread.id !== id));
      }
    } catch (error) {
      console.error('Error deleting forum thread:', error);
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      const response = await fetch(apiUrl(`/api/bullying-reports/${id}?admin_code=${encodedAdminCode}`), { method: 'DELETE' });
      if (response.ok) {
        setReportsList((prev) => prev.filter((report) => report.id !== id));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleAddAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (albumSubmitLockRef.current) {
      return;
    }

    if (!adminCode.trim()) {
      setAlbumUploadMessage('Kode admin tidak valid. Login ulang lalu coba simpan lagi.');
      return;
    }

    albumSubmitLockRef.current = true;
    setIsSavingAlbum(true);
    setAlbumUploadMessage('');

    const visibilityDays = albumForm.visibilityDays === 'forever' ? null : Number(albumForm.visibilityDays);

    const payload = {
      title: albumForm.title,
      date: albumForm.date,
      location: albumForm.location,
      description: albumForm.description,
      photos: albumForm.photos,
      videos: albumForm.videos,
      visibility_days: visibilityDays,
    };

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), ALBUM_REQUEST_TIMEOUT_MS);

    try {
      const endpoint = editingAlbum
        ? apiUrl(`/api/albums/${editingAlbum.id}?admin_code=${encodedAdminCode}`)
        : apiUrl(`/api/albums?admin_code=${encodedAdminCode}`);

      const response = await fetch(endpoint, {
        method: editingAlbum ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('INVALID_ADMIN_CODE');
        }
        throw new Error(`Album save failed: ${response.status}`);
      }

      await fetchAlbums();
      setEditingAlbum(null);
      setAlbumForm(emptyAlbumForm);
      setShowAlbumForm(false);
      setAlbumUploadMessage('Album berhasil disimpan ke server dan bisa dilihat di semua device.');
      window.alert(editingAlbum ? 'Album berhasil diupdate.' : 'Album berhasil disimpan.');
    } catch (error) {
      console.error('Error saving album:', error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        setAlbumUploadMessage('Server terlalu lama merespons. Coba simpan lagi.');
      } else if (error instanceof Error && error.message === 'INVALID_ADMIN_CODE') {
        setAlbumUploadMessage('Sesi admin kadaluarsa/kode salah. Login ulang lalu coba lagi.');
      } else {
        setAlbumUploadMessage('Gagal menyimpan album. Periksa ukuran media atau koneksi server.');
      }
    } finally {
      window.clearTimeout(timeoutId);
      albumSubmitLockRef.current = false;
      setIsSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    try {
      const response = await fetch(apiUrl(`/api/albums/${id}?admin_code=${encodedAdminCode}`), { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Album delete failed: ${response.status}`);
      }

      await fetchAlbums();
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const handleEditAlbum = (album: any) => {
    setEditingAlbum(album);
    setAlbumForm(normalizeAlbumFormData(album));
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
    setStrukturForm({ position: '', name: '', description: '', photo: '', contact: { email: '', phone: '', instagram: '', tiktok: '' } });
    setShowStrukturForm(false);
  };

  const handleDeleteStruktur = (id: number) => {
    const newStruktur = struktur.filter(s => s.id !== id);
    setStruktur(newStruktur);
    localStorage.setItem('osis_struktur', JSON.stringify(newStruktur));
  };

  const handleEditStruktur = (item: any) => {
    setEditingStruktur(item);
    setStrukturForm({
      ...item,
      contact: {
        email: item?.contact?.email || '',
        phone: item?.contact?.phone || '',
        instagram: item?.contact?.instagram || '',
        tiktok: item?.contact?.tiktok || '',
      },
    });
    setShowStrukturForm(true);
  };

  const readFilesAsDataUrls = (files: FileList): Promise<string[]> => {
    return Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}`));
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}`));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error(`Gagal memproses gambar ${file.name}`));
        img.onload = () => {
          const maxDim = 1280;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas tidak tersedia untuk kompresi gambar.'));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };

        img.src = String(reader.result || '');
      };

      reader.readAsDataURL(file);
    });
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setAlbumUploadMessage('');

    if (albumForm.photos.length + files.length > MAX_PHOTOS) {
      setAlbumUploadMessage(`Maksimal ${MAX_PHOTOS} foto per album.`);
      e.target.value = '';
      return;
    }

    try {
      const urls = await Promise.all(Array.from(files).map((file) => compressImageFile(file)));
      setAlbumForm((prev) => ({ ...prev, photos: [...prev.photos, ...urls.filter(Boolean)] }));
    } catch (error) {
      console.error('Error uploading photos:', error);
      setAlbumUploadMessage('Gagal memproses foto. Coba ulangi dengan file lain.');
    } finally {
      e.target.value = '';
    }
  };

  const handleVideosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setAlbumUploadMessage('');

    if (albumForm.videos.length + files.length > MAX_VIDEOS) {
      setAlbumUploadMessage(`Maksimal ${MAX_VIDEOS} video per album agar web tetap cepat.`);
      e.target.value = '';
      return;
    }

    const oversized = Array.from(files).find((file) => file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setAlbumUploadMessage(`Ukuran video maksimal ${MAX_VIDEO_SIZE_MB}MB per file.`);
      e.target.value = '';
      return;
    }

    try {
      const urls = await readFilesAsDataUrls(files);
      setAlbumForm((prev) => ({ ...prev, videos: [...prev.videos, ...urls.filter(Boolean)] }));
    } catch (error) {
      console.error('Error uploading videos:', error);
      setAlbumUploadMessage('Gagal memproses video. Coba video lain dengan ukuran lebih kecil.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAlbumForm({ ...albumForm, photos: albumForm.photos.filter((_, i) => i !== index) });
  };

  const handleRemoveVideo = (index: number) => {
    setAlbumForm({ ...albumForm, videos: albumForm.videos.filter((_, i) => i !== index) });
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
        <div className="mb-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem(RUNTIME_API_BASE_URL_KEY);
                localStorage.removeItem(RUNTIME_API_BASE_URL_KEY);
                setAlbumSyncMessage('Override API lokal dihapus pada browser ini. Memuat ulang daftar...');
                fetchAlbums();
              } catch (e) {
                console.error('Failed to clear API override', e);
              }
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
          >
            Hapus Override API (Reset Client)
          </button>
        </div>
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
                    <p className="text-gray-600 text-sm font-medium">Laporan Ruang Pribadi</p>
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
                    <li>✓ Lihat laporan ruang pribadi per kategori</li>
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
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => void syncLegacyAlbumsToServer()}
                disabled={syncingAlbums}
                className="px-5 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-60"
              >
                {syncingAlbums ? 'Menyinkronkan album lama...' : 'Sinkronkan Album Lama ke Server'}
              </button>
              {albumSyncMessage && (
                <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {albumSyncMessage}
                </div>
              )}
            </div>

            {!showAlbumForm ? (
              <button
                onClick={() => {
                  setShowAlbumForm(true);
                  setEditingAlbum(null);
                  setAlbumForm(emptyAlbumForm);
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Durasi Tayang Album
                    </label>
                    <select
                      value={albumForm.visibilityDays}
                      onChange={(e) => setAlbumForm({ ...albumForm, visibilityDays: e.target.value as AlbumFormState['visibilityDays'] })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="1">1 hari</option>
                      <option value="7">7 hari</option>
                      <option value="30">30 hari</option>
                      <option value="forever">Selamanya</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Album lama yang sudah ada tetap selamanya kecuali kamu ubah saat edit.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Upload Media Kegiatan
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <p className="text-sm font-semibold text-indigo-700 mb-2">Foto (maks. {MAX_PHOTOS}, otomatis dikompres)</p>
                        <input
                          type="file"
                          name="photoFile"
                          accept="image/*"
                          multiple
                          onChange={handlePhotosUpload}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-semibold text-emerald-700 mb-2">Video (maks. {MAX_VIDEOS}, ukuran &lt;= {MAX_VIDEO_SIZE_MB}MB)</p>
                        <input
                          type="file"
                          name="videoFile"
                          accept="video/*"
                          multiple
                          onChange={handleVideosUpload}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {albumUploadMessage && (
                      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        {albumUploadMessage}
                      </div>
                    )}

                    {albumForm.photos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Foto terunggah: {albumForm.photos.length}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {albumForm.photos.map((photo, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden">
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
                      </div>
                    )}

                    {albumForm.videos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Video terunggah: {albumForm.videos.length}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {albumForm.videos.map((video, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-300 bg-black">
                              <video src={video} controls preload="metadata" playsInline className="w-full h-44 object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(idx)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {albumForm.photos.length === 0 && albumForm.videos.length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        Belum ada media. Upload foto/video terlebih dahulu.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSavingAlbum}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingAlbum ? 'Menyimpan...' : editingAlbum ? 'Update Album' : 'Simpan Album'}
                    </button>
                    <button
                      type="button"
                      disabled={isSavingAlbum}
                      onClick={() => {
                        setShowAlbumForm(false);
                        setEditingAlbum(null);
                        setAlbumForm(emptyAlbumForm);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all disabled:cursor-not-allowed disabled:opacity-70"
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
                          📅 {album.date} | 📍 {album.location} | 📸 {(album.photos || []).length} foto | <Film className="w-4 h-4 inline" /> {(album.videos || []).length} video
                        </p>
                        <p className="text-sm text-indigo-600 mt-1">
                          ⏳ Durasi: {album.visibility_days === 1 || album.visibility_days === 7 || album.visibility_days === 30 ? `${album.visibility_days} hari` : 'Selamanya'}
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
                  setStrukturForm({ position: '', name: '', description: '', photo: '', contact: { email: '', phone: '', instagram: '', tiktok: '' } });
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        TikTok
                      </label>
                      <input
                        type="text"
                        value={strukturForm.contact.tiktok}
                        onChange={(e) => setStrukturForm({ ...strukturForm, contact: { ...strukturForm.contact, tiktok: e.target.value } })}
                        placeholder="@username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        setStrukturForm({ position: '', name: '', description: '', photo: '', contact: { email: '', phone: '', instagram: '', tiktok: '' } });
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
                          📧 {item.contact.email} | 📱 {item.contact.phone} | 📷 {item.contact.instagram} | 🎵 {item.contact.tiktok || '-'}
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
            {loadingAdminContent ? (
              <p className="text-gray-600">Memuat daftar apresiasi...</p>
            ) : appreciationsList.length === 0 ? (
              <p className="text-gray-600">Belum ada apresiasi masuk. Data akan muncul ketika siswa mengirim apresiasi.</p>
            ) : (
              <div className="space-y-4">
                {appreciationsList.map((appreciation) => (
                  <div key={appreciation.id} className="rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Pengirim:{' '}
                          <span className="font-semibold text-gray-800">
                            {appreciation.is_anonymous ? 'Anonim' : appreciation.from_user_name}
                          </span>
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900">Untuk {appreciation.to_name}</h3>
                        <p className="text-sm text-slate-500 mt-1">Tipe: <span className="font-medium">{appreciation.type}</span></p>
                        <p className="text-xs text-slate-400 mt-1">
                          {appreciation.created_at ? new Date(appreciation.created_at).toLocaleString('id-ID') : 'Baru saja'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAppreciation(appreciation.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Hapus Apresiasi
                      </button>
                    </div>
                    {appreciation.message && (
                      <p className="text-gray-600 mt-4 leading-relaxed">{appreciation.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            <h2 className="text-2xl font-bold mb-6">Laporan Ruang Pribadi</h2>
            {loadingAdminContent ? (
              <p className="text-gray-600">Memuat laporan...</p>
            ) : reportsList.length === 0 ? (
              <p className="text-gray-600">Belum ada laporan ruang pribadi. Semua laporan masuk akan muncul di sini.</p>
            ) : (
              <div className="space-y-8">
                {reportCategoryOrder.map((category) => {
                  const categoryReports = reportsList.filter((report) => (report.report_category || '').trim() === category);
                  if (categoryReports.length === 0) {
                    return null;
                  }

                  const categoryMeta = getReportCategoryMeta(category);

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">{categoryMeta.label}</h3>
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${categoryMeta.badgeClass}`}>
                          {categoryReports.length} laporan
                        </span>
                      </div>

                      {categoryReports.map((report) => {
                        const reportMeta = getReportCategoryMeta(report.report_category || 'laporan_bullying');

                        return (
                          <div key={report.id} className="rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Pengirim: <span className="font-semibold text-gray-800">{report.reporter_name}</span></p>
                                <p className="text-sm text-slate-500">Lokasi: <span className="font-medium">{report.incident_location || 'Tidak disebutkan'}</span></p>
                                <span className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${reportMeta.badgeClass}`}>
                                  {reportMeta.label}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                              >
                                Hapus Laporan
                              </button>
                            </div>
                            <p className="text-gray-600 mt-4 leading-relaxed">{report.incident_description}</p>
                            {Array.isArray(report.evidence_files) && report.evidence_files.length > 0 && (
                              <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                  Bukti Terlampir ({report.evidence_files.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {report.evidence_files.map((file: any, index: number) => (
                                    <a
                                      key={`${report.id}-evidence-${index}`}
                                      href={file.data}
                                      download={file.name || `bukti-${index + 1}`}
                                      className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                                    >
                                      {file.name || `File ${index + 1}`}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
