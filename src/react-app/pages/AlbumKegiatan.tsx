import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function AlbumKegiatan() {
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('osis_albums');
    if (saved) {
      setAlbums(JSON.parse(saved));
    }
  }, []);

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                      {album.photos.map((photo: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={photo}
                            alt={`${album.title} - Photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white font-semibold">Foto {idx + 1}</span>
                          </div>
                        </div>
                      ))}
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
