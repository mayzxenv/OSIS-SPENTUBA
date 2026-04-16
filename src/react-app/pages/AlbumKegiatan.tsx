import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function AlbumKegiatan() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('osis_albums');
    if (saved) {
      setAlbums(JSON.parse(saved));
    }
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

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Home</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-black mb-4 font-['Space_Grotesk']">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Album Kegiatan OSIS
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Dokumentasi lengkap kegiatan dan event yang telah dilaksanakan
            </p>
          </div>

          {/* Album Grid */}
          <div className="space-y-12">
            {albums.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 border border-dashed border-gray-300 text-center">
                <p className="text-3xl font-semibold text-gray-800 mb-4">Album Kegiatan Masih Kosong</p>
                <p className="text-gray-600 mb-6">Belum ada dokumentasi kegiatan yang dapat ditampilkan. Silakan tambahkan konten melalui halaman admin.</p>
                <p className="text-sm text-gray-500">Halaman ini akan menampilkan foto dan aktivitas OSIS setelah admin memasukkan album baru.</p>
              </div>
            ) : (
              albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  {/* Album Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{album.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        📅 <span>{album.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        📍 <span>{album.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Images Grid */}
                  {album.photos && album.photos.length > 0 && (
                    <div className="p-6">
                      <div className="relative rounded-3xl overflow-hidden shadow-lg">
                        <img
                          src={album.photos.length > 1 ? album.photos[activePhotoIndex[String(album.id)] ?? 0] : album.photos[0]}
                          alt={`${album.title} - Foto`}
                          className="w-full h-[420px] object-cover"
                        />
                        <div className="absolute inset-x-0 top-4 px-6 flex items-center justify-between">
                          <span className="rounded-full bg-indigo-600/90 text-white text-xs px-3 py-1">
                            {album.photos.length > 1 ? `Slide otomatis setiap 3 detik` : 'Ditampilkan selama 1 bulan'}
                          </span>
                          {album.photos.length > 1 && (
                            <span className="rounded-full bg-white/90 text-slate-900 text-xs px-3 py-1">
                              {String((activePhotoIndex[String(album.id)] ?? 0) + 1).padStart(2, '0')} / {album.photos.length}
                            </span>
                          )}
                        </div>
                        {album.photos.length > 1 && (
                          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 px-6">
                            {album.photos.map((_photo: string, index: number) => (
                              <span
                                key={index}
                                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                  (activePhotoIndex[String(album.id)] ?? 0) === index ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">{album.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
