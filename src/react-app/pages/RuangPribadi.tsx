import Navbar from '../components/Navbar';
import { AlertCircle, ArrowLeft, Heart, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { apiUrl } from '@/react-app/lib/api';

const reportCategories = [
  {
    value: 'teman_curhat',
    title: 'Teman Curhat',
    caption: 'Ruang cerita pribadi saat Anda butuh didengar dengan aman dan tanpa dihakimi.',
  },
  {
    value: 'laporan_pelanggaran',
    title: 'Laporan Pelanggaran',
    caption: 'Laporkan pelanggaran tata tertib atau perilaku yang mengganggu ketertiban sekolah.',
  },
  {
    value: 'laporan_bullying',
    title: 'Laporan Bullying',
    caption: 'Laporkan perundungan fisik, verbal, maupun digital agar segera ditindaklanjuti.',
  },
] as const;

export default function RuangPribadi() {
  const [formData, setFormData] = useState({
    report_category: 'laporan_bullying',
    reporter_name: '',
    incident_description: '',
    incident_date: '',
    incident_location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; type: string; data: string }[]>([]);

  const selectedCategory = reportCategories.find((item) => item.value === formData.report_category);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const response = await fetch(apiUrl('/api/bullying-reports'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, evidence_files: evidenceFiles }),
      });

      if (!response.ok) {
        setErrorMessage('Gagal mengirim laporan. Silakan coba lagi.');
        return;
      }

      setSubmitted(true);
      setFormData({
        report_category: 'laporan_bullying',
        reporter_name: '',
        incident_description: '',
        incident_date: '',
        incident_location: '',
      });
      setEvidenceFiles([]);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setErrorMessage('');

    if (evidenceFiles.length + files.length > 6) {
      setErrorMessage('Maksimal 6 file bukti per laporan.');
      e.target.value = '';
      return;
    }

    try {
      const converted = await Promise.all(
        Array.from(files).map(
          (file) =>
            new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
              if (file.size > 3 * 1024 * 1024) {
                reject(new Error(`File ${file.name} melebihi batas 3MB.`));
                return;
              }

              const reader = new FileReader();
              reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}.`));
              reader.onload = () => {
                resolve({
                  name: file.name,
                  type: file.type || 'application/octet-stream',
                  data: String(reader.result || ''),
                });
              };
              reader.readAsDataURL(file);
            })
        )
      );

      setEvidenceFiles((prev) => [...prev, ...converted]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal memproses file bukti.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveEvidenceFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 pt-20">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.12),_transparent_34%),linear-gradient(to_bottom,_#fff7fb,_#ffffff_45%,_#f8fafc)]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur hover:text-rose-600">
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </Link>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                  <Heart className="w-3.5 h-3.5" />
                  Ruang Aman
                </div>
                <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight font-['Space_Grotesk'] text-slate-900">
                  <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Anda tidak sendirian.
                  </span>
                </h1>
                <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-600">
                  Ruang pribadi untuk curhat, laporan pelanggaran, dan laporan bullying. Setiap laporan dibaca serius, dijaga kerahasiaannya, dan diteruskan ke pihak sekolah.
                </p>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-500">
                  Tambahkan nomor telfon agar kami bisa berkomunikasi tentang kasus ini, nomor tidak akan tersebar.
                </p>
              </div>

              <div className="rounded-[2rem] border border-rose-200 bg-white p-6 shadow-[0_18px_60px_rgba(244,63,94,0.10)]">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30">
                  <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true" fill="none">
                    <circle cx="35" cy="30" r="10" fill="currentColor" opacity="0.95" />
                    <circle cx="61" cy="30" r="10" fill="currentColor" opacity="0.95" />
                    <path
                      d="M22 70c0-10 8-18 18-18h16c10 0 18 8 18 18"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 42c4 4 7 7 12 7s8-3 12-7"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <path
                      d="M56 42c4 4 7 7 12 7s8-3 12-7"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    <path
                      d="M41 56l7 7 7-7"
                      stroke="#fff"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-5 text-center">
                  <p className="text-lg font-black text-slate-900">Anda tidak sendirian</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Pilih kategori yang sesuai, lalu ceritakan yang Anda alami. Kami bantu jaga keamanan, kerahasiaan, dan tindak lanjutnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Kategori Ruang Pribadi</h3>
                <div className="space-y-3">
                  {reportCategories.map((category) => (
                    <div key={category.value} className="rounded-2xl border border-violet-200 bg-white p-4">
                      <p className="text-sm font-bold text-violet-700">{category.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{category.caption}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Heart className="w-5 h-5 text-rose-600" />
                  Kami peduli dengan Anda
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Apapun kategori laporan Anda, tim sekolah ada di sini untuk membantu. Semua laporan diproses dengan serius dan rahasia.
                </p>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex gap-3"><span className="font-bold text-rose-600">✓</span><span>Identitas Anda aman terlindungi</span></div>
                  <div className="flex gap-3"><span className="font-bold text-rose-600">✓</span><span>Laporan diteruskan ke BK, Waka Kesiswaan, dan Kepala Sekolah</span></div>
                  <div className="flex gap-3"><span className="font-bold text-rose-600">✓</span><span>Kami akan membantu mencari solusi yang aman</span></div>
                </div>
              </div>

              <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
                <h3 className="mb-3 font-bold text-slate-900">Hubungi BK / Kepala Sekolah</h3>
                <p className="mb-4 text-sm text-slate-600">Jika keadaan darurat, hubungi BK atau Kepala Sekolah langsung:</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><strong>BK:</strong> Samping Ruangan Kepala Sekolah</p>
                  <p><strong>Kepala Sekolah:</strong> Ruang Kepala Sekolah</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Kirim Laporan Ruang Pribadi</h2>

                {submitted && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-800">✓ Laporan Anda telah diterima</p>
                    <p className="mt-1 text-sm text-emerald-700">Tim BK dan kesiswaan akan menindaklanjuti laporan Anda. Terima kasih telah mempercayai kami.</p>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Kategori Laporan *</label>
                    <select
                      name="report_category"
                      value={formData.report_category}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 outline-none transition-colors focus:border-rose-500"
                    >
                      {reportCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                    {selectedCategory && (
                      <p className="mt-2 text-xs text-slate-500">{selectedCategory.caption}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Anda (Tidak akan dipublikasi)</label>
                    <input
                      type="text"
                      name="reporter_name"
                      value={formData.reporter_name}
                      onChange={handleChange}
                      placeholder="Masukkan nama Anda"
                      className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition-colors focus:border-rose-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Jelaskan Kejadiannya *</label>
                    <textarea
                      name="incident_description"
                      value={formData.incident_description}
                      onChange={handleChange}
                      placeholder="Ceritakan apa yang terjadi..."
                      rows={5}
                      className="w-full resize-none rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition-colors focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Kapan Kejadian Ini Terjadi?</label>
                      <input
                        type="date"
                        name="incident_date"
                        value={formData.incident_date}
                        onChange={handleChange}
                        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition-colors focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Dimana Kejadian Ini Terjadi?</label>
                      <input
                        type="text"
                        name="incident_location"
                        value={formData.incident_location}
                        onChange={handleChange}
                        placeholder="Ruang kelas, halaman, dll"
                        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition-colors focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Upload Bukti (Foto/File, bisa lebih dari 1)</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleEvidenceUpload}
                      className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition-colors focus:border-rose-500"
                    />
                    <p className="mt-2 text-xs text-slate-500">Maksimal 6 file, ukuran tiap file maksimal 3MB.</p>

                    {evidenceFiles.length > 0 && (
                      <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        {evidenceFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                            <span className="truncate text-slate-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEvidenceFile(index)}
                              className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Penting:</strong> Laporan ini akan dikirim sesuai kategori ke tim BK/kesiswaan dan pimpinan sekolah. Kami menjaga kerahasiaan identitas Anda.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/20 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    {submitting ? 'Mengirim...' : 'Kirim Laporan Privasi'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
