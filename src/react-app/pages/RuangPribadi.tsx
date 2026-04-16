import Navbar from '../components/Navbar';
import { ArrowLeft, Heart, AlertCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function RuangPribadi() {
  const [formData, setFormData] = useState({
    reporter_name: '',
    incident_description: '',
    incident_date: '',
    incident_location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    if (!formData.reporter_name.trim() || !formData.incident_description.trim()) {
      setErrorMessage('Mohon isi nama dan deskripsi kejadian');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/bullying-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          reporter_name: '',
          incident_description: '',
          incident_date: '',
          incident_location: '',
        });

        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      } else {
        setErrorMessage('Gagal mengirim laporan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Ruang Pribadi</h1>
              <p className="text-gray-600 mt-1">Tempat aman untuk berbagi cerita Anda</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                Kami Peduli Dengan Anda
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Jika Anda mengalami bullying atau pelecehan, kami di sini untuk membantu. Laporan Anda akan ditangani dengan serius dan rahasia.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span className="text-gray-700">Identitas Anda aman terlindungi</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span className="text-gray-700">Laporan diteruskan ke BK dan Kepala Sekolah</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span className="text-gray-700">Kami akan membantu mencari solusi</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3">Hubungi BK / Kepala Sekolah</h3>
              <p className="text-sm text-gray-700 mb-4">
                Jika keadaan darurat, hubungi BK atau Kepala Sekolah langsung:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>BK:</strong> Ruang BK Lantai 2</p>
                <p><strong>Kepala Sekolah:</strong> Ruang Kepala Sekolah</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Laporkan Kejadian Bullying</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✓ Laporan Anda telah diterima</p>
                  <p className="text-sm text-green-700 mt-1">
                    BK dan Kepala Sekolah akan menghubungi Anda segera. Terima kasih telah mempercayai kami.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Anda (Tidak akan dipublikasi)
                  </label>
                  <input
                    type="text"
                    name="reporter_name"
                    value={formData.reporter_name}
                    onChange={handleChange}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jelaskan Kejadiannya *
                  </label>
                  <textarea
                    name="incident_description"
                    value={formData.incident_description}
                    onChange={handleChange}
                    placeholder="Ceritakan apa yang terjadi... (siapa pelakunya, apa yang dilakukan, dll)"
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kapan Kejadian Ini Terjadi?
                    </label>
                    <input
                      type="date"
                      name="incident_date"
                      value={formData.incident_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dimana Kejadian Ini Terjadi?
                    </label>
                    <input
                      type="text"
                      name="incident_location"
                      value={formData.incident_location}
                      onChange={handleChange}
                      placeholder="Ruang kelas, halaman, dll"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rose-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Penting:</strong> Laporan ini akan dikirim ke BK dan Kepala Sekolah. Kami akan menjaga kerahasiaan identitas Anda. Jangan takut untuk bercerita!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
