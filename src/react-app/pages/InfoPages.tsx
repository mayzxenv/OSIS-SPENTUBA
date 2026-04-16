import Navbar from '../components/Navbar';
import { ArrowLeft, BookOpen, MessageCircle, Shield, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InfoPageProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: Array<{
    heading: string;
    content: string | string[];
  }>;
}

function InfoPageTemplate({ title, icon: Icon, sections }: InfoPageProps) {
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
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.heading}</h2>
              {Array.isArray(section.content) ? (
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <span className="text-indigo-600 font-bold flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 leading-relaxed">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PanduanPenggunaan() {
  return (
    <InfoPageTemplate
      title="Panduan Penggunaan"
      icon={BookOpen}
      sections={[
        {
          heading: 'Selamat Datang di Websie Osis Spentuba',
          content: 'OSIS Connect adalah portal interaktif untuk siswa SMPN 7. Portal ini memudahkan Anda untuk berbagi apresiasi, ide, dan berinteraksi dengan sesama siswa tanpa perlu login.',
        },
        {
          heading: 'Fitur Utama',
          content: [
            'Apresiasi: Berikan apresiasi kepada teman atau guru yang menginspirasi',
            'Bank Ide: Bagikan ide kreatif untuk kemajuan sekolah',
            'Forum: Diskusikan berbagai topik dengan siswa lain',
            'Album Kegiatan: Lihat foto dan video kegiatan sekolah',
            'Struktur Organisasi: Kenali pengurus OSIS',
            'Ruang Pribadi: Laporkan bullying dengan aman dan rahasia',
          ],
        },
        {
          heading: 'Cara Menggunakan Apresiasi',
          content: [
            '1. Buka halaman Apresiasi',
            '2. Pilih jenis apresiasi (Terima Kasih, Inspiratif, atau Aktif & Berdampak)',
            '3. Isi nama Anda dan nama penerima apresiasi',
            '4. Tulis pesan apresiasi (opsional)',
            '5. Pilih apakah ingin mengirim sebagai Anonim atau tidak',
            '6. Klik "Kirim Apresiasi"',
          ],
        },
        {
          heading: 'Privasi dan Keamanan',
          content: 'Data Anda dilindungi dengan baik. Fitur Ruang Pribadi menjamin kerahasiaan identitas pelapor bullying. Kami tidak akan membagikan identitas Anda tanpa izin kecuali dalam kasus berbahaya.',
        },
        {
          heading: 'Pertanyaan?',
          content: 'Jika Anda memiliki pertanyaan tentang penggunaan portal, silakan buka halaman FAQ atau hubungi BK.',
        },
      ]}
    />
  );
}

export function FAQ() {
  return (
    <InfoPageTemplate
      title="Pertanyaan Umum (FAQ)"
      icon={MessageCircle}
      sections={[
        {
          heading: 'Apa itu OSIS Connect?',
          content: 'OSIS Connect adalah platform komunikasi digital sekolah yang memungkinkan siswa untuk berbagi apresiasi, ide, dan mengikuti diskusi komunitas.',
        },
        {
          heading: 'Apakah saya perlu login untuk menggunakan portal?',
          content: 'Tidak! Anda dapat menggunakan semua fitur portal tanpa perlu login. Cukup masukkan nama Anda saat akan berkontribusi.',
        },
        {
          heading: 'Bagaimana cara melaporkan bullying?',
          content: 'Buka menu "Ruang Pribadi" dan isi formulir laporan. Laporan Anda akan dikirim langsung ke BK dan Kepala Sekolah dengan identitas terlindungi.',
        },
        {
          heading: 'Bisakah saya mengirim apresiasi secara anonim?',
          content: 'Ya! Saat mengisi form apresiasi, Anda dapat memilih opsi "Kirim sebagai Anonim" untuk menjaga privasi identitas Anda.',
        },
        {
          heading: 'Bagaimana jika saya menemukan konten yang tidak sesuai?',
          content: 'Gunakan fitur "Lapor Masalah" untuk melaporkan konten yang melanggar. Admin akan meninjau dan mengambil tindakan yang diperlukan.',
        },
        {
          heading: 'Apakah portal ini aman?',
          content: 'Ya! Portal dilengkapi dengan sistem keamanan dan privasi yang menjaga data Anda. Khusus untuk Ruang Pribadi, identitas pelapor dijaga dengan ketat.',
        },
      ]}
    />
  );
}

export function KebijakanPrivasi() {
  return (
    <InfoPageTemplate
      title="Kebijakan Privasi"
      icon={Shield}
      sections={[
        {
          heading: 'Pengumpulan Data',
          content: 'OSIS Spentuba mengumpulkan nama dan pesan yang Anda kirimkan melalui berbagai fitur. Data ini disimpan secara aman di server bermitra kami.',
        },
        {
          heading: 'Penggunaan Data',
          content: [
            'Data Anda digunakan untuk menampilkan konten di portal',
            'Data bullying laporan diteruskan ke BK dan Kepala Sekolah',
            'Kami tidak membagikan data pribadi Anda kepada pihak ketiga',
            'Data anonim dapat digunakan untuk statistik portal',
          ],
        },
        {
          heading: 'Keamanan Data',
          content: 'Data Anda dilindungi dengan enkripsi dan protokol keamanan terbaru. Hanya admin terverifikasi yang dapat mengakses data sensitif.',
        },
        {
          heading: 'Hak Anda',
          content: [
            'Anda berhak mengetahui data apa tentang Anda yang tersimpan',
            'Anda bisa meminta data Anda dihapus (dengan beberapa pengecualian)',
            'Anda bisa berhenti menggunakan portal kapan saja',
          ],
        },
        {
          heading: 'Hubungi Kami',
          content: 'Jika Anda memiliki pertanyaan tentang privasi, silakan hubungi BK atau Kepala Sekolah.',
        },
      ]}
    />
  );
}

export function SyaratKetentuan() {
  return (
    <InfoPageTemplate
      title="Syarat & Ketentuan"
      icon={FileText}
      sections={[
        {
          heading: 'Penerimaan Syarat',
          content: 'Dengan menggunakan OSIS Connect, Anda setuju untuk mematuhi semua syarat dan ketentuan yang tertera di halaman ini.',
        },
        {
          heading: 'Penggunaan yang Bertanggung Jawab',
          content: [
            'Jangan posting konten yang melanggar, menyinggung, atau merendahkan',
            'Jangan kirim spam atau konten berulang',
            'Jangan posting informasi pribadi orang lain tanpa izin',
            'Jangan gunakan portal untuk tujuan ilegal atau berbahaya',
          ],
        },
        {
          heading: 'Konten yang Dilarang',
          content: [
            'Cyberbullying atau pelecehan',
            'Konten sexual atau eksplisit',
            'Ujaran kebencian atau diskriminasi',
            'Spam atau scam',
            'Konten berisi malware atau virus',
          ],
        },
        {
          heading: 'Tanggung Jawab Pengguna',
          content: 'Anda bertanggung jawab atas semua aktivitas yang dilakukan menggunakan akun atau nama Anda di portal ini.',
        },
        {
          heading: 'Pelanggaran',
          content: 'Admin berhak menghapus konten dan menonaktifkan pengguna yang melanggar syarat dan ketentuan ini.',
        },
      ]}
    />
  );
}

export function LaporMasalah() {
  return (
    <InfoPageTemplate
      title="Laporkan Masalah"
      icon={AlertCircle}
      sections={[
        {
          heading: 'Jenis Laporan yang Kami Terima',
          content: [
            'Konten yang melanggar atau melecehkan',
            'Cyberbullying atau pelecehan online',
            'Bug atau kesalahan teknis di portal',
            'Konten yang tidak sesuai dengan nilai sekolah',
            'Scam atau upaya penipuan',
          ],
        },
        {
          heading: 'Cara Melapor Masalah',
          content: 'Gunakan tombol "Laporkan" yang ada di setiap konten, atau hubungi BK dan Kepala Sekolah secara langsung.',
        },
        {
          heading: 'Informasi yang Kami Butuhkan',
          content: [
            'Deskripsi jelas tentang masalah atau konten yang bermasalah',
            'Link atau tangkapan layar jikatersedia',
            'Waktu kejadian (jika untuk cyberbullying atau masalah lain)',
            'Kontak Anda (opsional, bisa anonim)',
          ],
        },
        {
          heading: 'Waktu Respons',
          content: 'Admin kami akan meninjau laporan dalam 24 jam dan mengambil tindakan yang diperlukan. Untuk kasus urgent seperti bullying, kami akan merespons lebih cepat.',
        },
        {
          heading: 'Kerahasiaan',
          content: 'Laporan Anda dapat dikirim secara anonim. Identitas Anda akan dijaga dengan baik dan hanya dibagikan jika diperlukan untuk tindakan lanjutan.',
        },
      ]}
    />
  );
}
