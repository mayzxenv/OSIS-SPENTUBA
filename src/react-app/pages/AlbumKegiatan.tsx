import Navbar from '../components/Navbar';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Film, Heart, Image as ImageIcon, MapPin, MessageCircle, Send, Share2, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { apiUrl } from '@/react-app/lib/api';

type Album = {
  id: string | number;
  title: string;
  date: string;
  location: string;
  description: string;
  photos: string[];
  videos: string[];
  likes: number;
  comments_count: number;
  shares: number;
};

type AlbumComment = {
  id: number;
  album_id: number;
  user_name: string;
  message: string;
  likes: number;
  created_at: string;
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

function getFallbackPhoto(album: Album): string | null {
  return album.photos.find((photo) => typeof photo === 'string' && photo.trim().length > 0) || null;
}

function normalizeAlbum(raw: any): Album {
  return {
    id: raw?.id ?? Date.now(),
    title: raw?.title || 'Kegiatan Tanpa Judul',
    date: raw?.date || '-',
    location: raw?.location || '-',
    description: raw?.description || 'Belum ada deskripsi kegiatan.',
    photos: normalizeMediaList(raw?.photos, raw?.photo),
    videos: normalizeMediaList(raw?.videos, raw?.video),
    likes: Number(raw?.likes || 0),
    comments_count: Number(raw?.comments_count || 0),
    shares: Number(raw?.shares || 0),
  };
}

export default function AlbumKegiatan() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<Record<string, number>>({});
  const [brokenPhotoIndices, setBrokenPhotoIndices] = useState<Record<string, number[]>>({});
  const [lightboxAlbumId, setLightboxAlbumId] = useState<string | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(0);
  const [albumComments, setAlbumComments] = useState<Record<string, AlbumComment[]>>({});
  const [activeCommentAlbum, setActiveCommentAlbum] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, { user_name: string; message: string }>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(apiUrl('/api/albums'), {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            const normalized = Array.isArray(data) ? data.map(normalizeAlbum) : [];
            setAlbums(normalized);
            localStorage.setItem('osis_albums', JSON.stringify(normalized));
            localStorage.setItem('osis_albums_timestamp', Date.now().toString());
            setErrorMessage('');
            return;
          }
        }

        // Fall back to the locally cached snapshot only if the live API failed.
        const saved = localStorage.getItem('osis_albums');
        const timestamp = localStorage.getItem('osis_albums_timestamp');

        if (saved && timestamp) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setAlbums(parsed.map(normalizeAlbum));
              setErrorMessage('Album dimuat dari cache lokal (offline mode).');
              return;
            }
          } catch {
            localStorage.removeItem('osis_albums');
            localStorage.removeItem('osis_albums_timestamp');
          }
        }

        setAlbums([]);
        setErrorMessage('Tidak dapat memuat album. Pastikan koneksi internet tersedia.');
      } catch (error) {
        console.error('Error loading albums:', error);

        const saved = localStorage.getItem('osis_albums');
        const timestamp = localStorage.getItem('osis_albums_timestamp');

        if (saved && timestamp) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setAlbums(parsed.map(normalizeAlbum));
              setErrorMessage('Album dimuat dari cache lokal (offline mode).');
              return;
            }
          } catch {
            localStorage.removeItem('osis_albums');
            localStorage.removeItem('osis_albums_timestamp');
          }
        }

        setAlbums([]);
        setErrorMessage('Tidak dapat memuat album. Pastikan koneksi internet tersedia.');
      }
    };

    loadAlbums().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (albums.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => {
        const next = { ...prev };
        albums.forEach((album) => {
          if (album.photos?.length > 1) {
            const key = String(album.id);
            const current = typeof next[key] === 'number' ? next[key] : 0;
            next[key] = (current + 1) % album.photos.length;
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [albums]);

  const syncAlbumState = (albumId: string | number, nextAlbum: Partial<Album>) => {
    setAlbums((prev) => prev.map((album) => (String(album.id) === String(albumId) ? { ...album, ...nextAlbum } : album)));
  };

  const getVisiblePhotoIndex = (album: Album): number => {
    const key = String(album.id);
    const currentIndex = activePhotoIndex[key] ?? 0;
    const brokenIndices = brokenPhotoIndices[key] || [];

    if (album.photos.length <= 1) {
      return 0;
    }

    for (let offset = 0; offset < album.photos.length; offset += 1) {
      const candidateIndex = (currentIndex + offset) % album.photos.length;
      if (!brokenIndices.includes(candidateIndex)) {
        return candidateIndex;
      }
    }

    return 0;
  };

  const markPhotoBroken = (albumId: string | number, photoIndex: number) => {
    const key = String(albumId);
    setBrokenPhotoIndices((prev) => {
      const existing = prev[key] || [];
      if (existing.includes(photoIndex)) {
        return prev;
      }
      return { ...prev, [key]: [...existing, photoIndex] };
    });
  };

  const loadComments = async (albumId: string | number) => {
    const key = String(albumId);
    if (albumComments[key]) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/albums/${albumId}/comments`));
      if (response.ok) {
        const data = await response.json();
        setAlbumComments((prev) => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
      }
    } catch (error) {
      console.error('Error loading album comments:', error);
    }
  };

  const handleLikeAlbum = async (albumId: string | number) => {
    const key = String(albumId);
    syncAlbumState(albumId, { likes: (albums.find((album) => String(album.id) === key)?.likes || 0) + 1 });

    try {
      const response = await fetch(apiUrl(`/api/albums/${albumId}/like`), { method: 'POST' });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.album) {
          syncAlbumState(albumId, normalizeAlbum(payload.album));
        }
      }
    } catch (error) {
      console.error('Error liking album:', error);
    }
  };

  const handleShareAlbum = async (album: Album) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#album-${album.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: album.title,
          text: album.description,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.error('Error sharing album:', error);
    }

    try {
      const response = await fetch(apiUrl(`/api/albums/${album.id}/share`), { method: 'POST' });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.album) {
          syncAlbumState(album.id, normalizeAlbum(payload.album));
        }
      }
    } catch (error) {
      console.error('Error recording album share:', error);
    }
  };

  const handleCommentSubmit = async (albumId: string | number) => {
    const draft = commentDrafts[String(albumId)];
    if (!draft?.user_name.trim() || !draft?.message.trim()) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/albums/${albumId}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.comment) {
          setAlbumComments((prev) => ({
            ...prev,
            [String(albumId)]: [...(prev[String(albumId)] || []), payload.comment],
          }));
          syncAlbumState(albumId, {
            comments_count: (albums.find((album) => String(album.id) === String(albumId))?.comments_count || 0) + 1,
          });
          setCommentDrafts((prev) => ({
            ...prev,
            [String(albumId)]: { user_name: '', message: '' },
          }));
        }
      }
    } catch (error) {
      console.error('Error posting album comment:', error);
    }
  };

  const handleLikeComment = async (albumId: string | number, commentId: number) => {
    try {
      const response = await fetch(apiUrl(`/api/albums/comments/${commentId}/like`), { method: 'POST' });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.comment) {
          setAlbumComments((prev) => ({
            ...prev,
            [String(albumId)]: (prev[String(albumId)] || []).map((comment) =>
              comment.id === commentId ? { ...comment, likes: payload.comment.likes ?? comment.likes + 1 } : comment
            ),
          }));
        }
      }
    } catch (error) {
      console.error('Error liking album comment:', error);
    }
  };

  const activeLightboxAlbum = albums.find((album) => String(album.id) === lightboxAlbumId) || null;
  const hasLightbox = Boolean(activeLightboxAlbum && activeLightboxAlbum.photos.length > 0);

  const openLightbox = (albumId: string | number, photoIndex: number) => {
    setLightboxAlbumId(String(albumId));
    setLightboxPhotoIndex(photoIndex);
  };

  const closeLightbox = () => {
    setLightboxAlbumId(null);
    setLightboxPhotoIndex(0);
  };

  const goToPrevLightboxPhoto = () => {
    if (!activeLightboxAlbum || activeLightboxAlbum.photos.length === 0) {
      return;
    }

    setLightboxPhotoIndex((prev) => (prev - 1 + activeLightboxAlbum.photos.length) % activeLightboxAlbum.photos.length);
  };

  const goToNextLightboxPhoto = () => {
    if (!activeLightboxAlbum || activeLightboxAlbum.photos.length === 0) {
      return;
    }

    setLightboxPhotoIndex((prev) => (prev + 1) % activeLightboxAlbum.photos.length);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <div className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(to_bottom,_#f8fbff,_#ffffff_35%,_#f8fafc)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur hover:text-sky-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Home
            </Link>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sparkles className="w-3.5 h-3.5" />
                Feed Kegiatan
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight font-['Space_Grotesk']">
                <span className="bg-gradient-to-r from-sky-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  Album Kegiatan OSIS
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-600">
                Dokumentasi kegiatan dibuat seperti lini masa sosial: ringkas, enak dilihat di semua ukuran layar, dan siap dibagikan ke warga sekolah.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[460px] rounded-3xl bg-white/80 shadow-lg animate-pulse" />
              <div className="h-[460px] rounded-3xl bg-white/80 shadow-lg animate-pulse" />
            </div>
          ) : albums.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
                <ImageIcon className="h-10 w-10" />
              </div>
              <p className="text-2xl font-bold text-slate-800">Album Kegiatan Masih Kosong</p>
              <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-slate-600">
                Belum ada dokumentasi kegiatan yang dapat ditampilkan. Saat admin mengunggah album baru, kontennya akan langsung tampil di semua device.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {albums.map((album) => {
                const albumKey = String(album.id);
                const isCommentsOpen = Boolean(activeCommentAlbum[albumKey]);
                const comments = albumComments[albumKey] || [];
                const currentDraft = commentDrafts[albumKey] || { user_name: '', message: '' };

                return (
                  <article
                    key={album.id}
                    id={`album-${album.id}`}
                    className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                  >
                    <div className="grid lg:grid-cols-[1.35fr_0.9fr]">
                      <div className="p-4 sm:p-6 lg:p-7">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                              <Sparkles className="w-3.5 h-3.5" />
                              Dokumentasi terbaru
                            </div>
                            <h2 className="mt-4 text-2xl md:text-3xl font-black text-slate-900">{album.title}</h2>
                            <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-slate-600">{album.description}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                            <CalendarDays className="w-4 h-4" />
                            {album.date}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                            <MapPin className="w-4 h-4" />
                            {album.location}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                            <ImageIcon className="w-4 h-4" />
                            {album.photos.length} foto
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                            <Film className="w-4 h-4" />
                            {album.videos.length} video
                          </span>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => void handleLikeAlbum(album.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                            {album.likes}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setActiveCommentAlbum((prev) => ({ ...prev, [albumKey]: !prev[albumKey] }));
                              await loadComments(album.id);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {album.comments_count}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleShareAlbum(album)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            <Share2 className="w-4 h-4" />
                            {album.shares}
                          </button>
                        </div>

                        {isCommentsOpen && (
                          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <h3 className="text-lg font-bold text-slate-900">Diskusi & Komentar</h3>
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{comments.length} diskusi</span>
                            </div>

                            <div className="space-y-3">
                              <input
                                type="text"
                                value={currentDraft.user_name}
                                onChange={(e) =>
                                  setCommentDrafts((prev) => ({
                                    ...prev,
                                    [albumKey]: { ...currentDraft, user_name: e.target.value },
                                  }))
                                }
                                placeholder="Nama kamu"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)]"
                              />
                              <textarea
                                rows={3}
                                value={currentDraft.message}
                                onChange={(e) =>
                                  setCommentDrafts((prev) => ({
                                    ...prev,
                                    [albumKey]: { ...currentDraft, message: e.target.value },
                                  }))
                                }
                                placeholder="Tulis komentar yang sopan dan membangun..."
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)]"
                              />
                              <button
                                type="button"
                                onClick={() => void handleCommentSubmit(album.id)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                              >
                                <Send className="w-4 h-4" />
                                Kirim diskusi
                              </button>
                            </div>

                            <div className="mt-5 space-y-3">
                              {comments.length === 0 ? (
                                <p className="text-sm text-slate-500">Belum ada komentar. Jadilah yang pertama memberi respon.</p>
                              ) : (
                                comments.slice(-4).map((comment) => (
                                  <div key={comment.id} className="rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-semibold text-slate-800">{comment.user_name}</p>
                                      <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{comment.message}</p>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                      <button
                                        type="button"
                                        onClick={() => void handleLikeComment(album.id, comment.id)}
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600"
                                      >
                                        <Heart className="w-3.5 h-3.5 fill-current" />
                                        {comment.likes}
                                      </button>
                                      <span className="text-xs text-slate-400">Balasan komentar sedang dikembangkan</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200 bg-slate-950 lg:border-l lg:border-t-0">
                        {album.photos.length > 0 ? (
                          <div className="relative h-full min-h-[320px] sm:min-h-[420px]">
                            {(() => {
                              const fallbackPhoto = getFallbackPhoto(album);
                              const visibleIndex = getVisiblePhotoIndex(album);
                              const visiblePhoto = album.photos[visibleIndex] || fallbackPhoto;

                              if (!visiblePhoto) {
                                return (
                                  <div className="flex min-h-[320px] items-center justify-center bg-slate-900 text-slate-300 sm:min-h-[420px]">
                                    Gambar tidak dapat dimuat
                                  </div>
                                );
                              }

                              return (
                                <img
                                  src={visiblePhoto}
                                  alt={`${album.title} - Foto utama`}
                                  className="h-full min-h-[320px] w-full cursor-zoom-in object-cover sm:min-h-[420px]"
                                  onError={() => {
                                    markPhotoBroken(album.id, visibleIndex);
                                    setActivePhotoIndex((prev) => ({ ...prev, [albumKey]: (visibleIndex + 1) % album.photos.length }));
                                  }}
                                  onClick={() => openLightbox(album.id, visibleIndex)}
                                />
                              );
                            })()}

                            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                              <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
                                {album.photos.length > 1 ? 'Slide otomatis tiap 3 detik' : '1 foto unggulan'}
                              </div>
                              {album.photos.length > 1 && (
                                <div className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white">
                                  {String((activePhotoIndex[albumKey] ?? 0) + 1).padStart(2, '0')} / {album.photos.length}
                                </div>
                              )}
                            </div>

                            {album.photos.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePhotoIndex((prev) => {
                                      const current = prev[albumKey] ?? 0;
                                      return { ...prev, [albumKey]: (current - 1 + album.photos.length) % album.photos.length };
                                    });
                                  }}
                                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-900 shadow-lg backdrop-blur transition-colors hover:bg-white"
                                  aria-label="Foto sebelumnya"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePhotoIndex((prev) => {
                                      const current = prev[albumKey] ?? 0;
                                      return { ...prev, [albumKey]: (current + 1) % album.photos.length };
                                    });
                                  }}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 text-slate-900 shadow-lg backdrop-blur transition-colors hover:bg-white"
                                  aria-label="Foto berikutnya"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </>
                            )}

                            {album.photos.length > 1 && (
                              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 px-4">
                                {album.photos.map((_photo: string, index: number) => (
                                  <span
                                    key={index}
                                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                      (activePhotoIndex[albumKey] ?? 0) === index ? 'bg-white' : 'bg-white/45'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex min-h-[320px] items-center justify-center bg-slate-950 p-8 text-center text-slate-300 sm:min-h-[420px]">
                            <div>
                              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                              <p className="text-sm font-medium">Tidak ada foto yang diunggah untuk album ini.</p>
                            </div>
                          </div>
                        )}

                        {album.videos.length > 0 && (
                          <div className="border-t border-white/10 p-4 sm:p-5">
                            <p className="mb-3 text-sm font-semibold text-white/80">Video Kegiatan</p>
                            <div className="grid gap-3">
                              {album.videos.map((video, index) => (
                                <video key={index} src={video} controls preload="metadata" playsInline className="w-full rounded-2xl bg-black object-cover shadow-lg">
                                  Browser Anda belum mendukung tag video.
                                </video>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {hasLightbox && activeLightboxAlbum && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 p-4"
          onClick={closeLightbox}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              closeLightbox();
            }
          }}
          aria-label="Tutup tampilan foto besar"
        >
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={activeLightboxAlbum.photos[lightboxPhotoIndex]}
              alt={`${activeLightboxAlbum.title} - Foto ${lightboxPhotoIndex + 1}`}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
              onError={() => markPhotoBroken(activeLightboxAlbum.id, lightboxPhotoIndex)}
            />

            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Tutup
            </button>

            <div className="absolute inset-x-0 -bottom-14 flex items-center justify-center gap-3 text-white">
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">
                {lightboxPhotoIndex + 1} / {activeLightboxAlbum.photos.length}
              </span>
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">{activeLightboxAlbum.title}</span>
            </div>

            {activeLightboxAlbum.photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevLightboxPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white"
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goToNextLightboxPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white"
                  aria-label="Foto berikutnya"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
