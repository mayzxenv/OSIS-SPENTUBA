import Navbar from '../components/Navbar';
import { ArrowLeft, Phone, Instagram } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function StrukturOrganisasi() {
  const [adminPengurus, setAdminPengurus] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('osis_struktur');
    if (saved) {
      setAdminPengurus(JSON.parse(saved));
    }
  }, []);
  const pembina = [
    {
      position: 'Pembina OSIS',
      name: 'JUMHARI, S.Pd.',
      photo: '',
      description: 'Membimbing OSIS dalam merancang program kerja dan mendampingi kegiatan sekolah.',
      contact: {
        phone: '081234567890',
        instagram: '@pak_ahmad',
      },
    },
  ];

  const struktur = [
    {
      position: 'Ketua OSIS',
      name: 'Iqbal Maulana Haidar',
      photo: 'iqbal.jpg',
      description: 'Memimpin organisasi siswa dan mengoordinir program kerja OSIS.',
      contact: {
        phone: '081234567892',
        instagram: '@iqbal',
      },
    },
    {
      position: 'Wakil Ketua 1 OSIS',
      name: 'Rahmat Hidayat',
      photo: 'rahmat.png',
      description: 'Mendampingi ketua dalam pelaksanaan kegiatan dan komunikasi anggota.',
      contact: {
        phone: '081234567893',
        instagram: '@rahmat',
      },
    },
    {
      position: 'Wakil Ketua 2 OSIS',
      name: 'Fahruddin isman',
      photo: 'udin.png',
      description: 'Membantu koordinasi program kerja dan mendukung kepemimpinan OSIS.',
      contact: {
        phone: '081234567897',
        instagram: '@fahruddin',
      },
    },
    {
      position: 'Sekretaris 1',
      name: 'Dona aulia',
      photo: 'dona.jpg',
      description: 'Mengelola administrasi, dokumentasi, dan laporan kegiatan OSIS.',
      contact: {
        phone: '081234567894',
        instagram: '@dona',
      },
    },
    {
      position: 'Sekretaris 2',
      name: 'Vania carissa putri',
      photo: 'putri.png',
      description: 'Menangani pencatatan rapat dan komunikasi narasumber OSIS.',
      contact: {
        phone: '081234567898',
        instagram: '@vania',
      },
    },
    {
      position: 'Bendahara 1',
      name: 'Khusnul khotimah',
      photo: 'khusnul.png',
      description: 'Mengelola keuangan dan anggaran kegiatan organisasi siswa.',
      contact: {
        phone: '081234567895',
        instagram: '@khusnul',
      },
    },
    {
      position: 'Bendahara 2',
      name: 'Davina azzahra',
      photo: 'davina.png',
      description: 'Membantu pencatatan kas dan pelaporan penggunaan dana OSIS.',
      contact: {
        phone: '081234567899',
        instagram: '@davina',
      },
    },
  ];

  const wakaSiswa = {
    position: 'Wakil Kepala Sekolah Bidang Kesiswaan',
    name: 'Ibu R.Ida wahyuni, S.Pd.',
    photo: '',
    description: 'Bertanggung jawab atas pembinaan, pengembangan, dan pengawasan siswa serta setiap kegiatan di bidang kesiswaan.',
    contact: {
      phone: '081234567896',
      instagram: '@ibu_ida',
    },
  };

  const bidang = [
    {
      name: 'Keagamaan dan taqwa kepada tuhan',
      subtitle: 'Meningkatkan kegiatan keagamaan dan nilai spiritual siswa',
      members: [
        { role: 'Ketua', name: 'Siti halimatus sadiyah', photo: 'sadiyah.png' },
        { role: 'Anggota', name: 'Taufiq hidayat', photo: 'taufiq.png' },
      ],
    },
    {
      name: 'Pembinaan budi pekerti luhur atau akhlak mulia',
      subtitle: 'Membangun karakter positif dan sikap sopan santun',
      members: [
        { role: 'Ketua', name: 'Moh labib afkari', photo: 'afka.png' },
        { role: 'Anggota', name: 'Lailatul mijrojiah', photo: '' },
      ],
    },
    {
      name: 'Pembinaan kepribadian unggul wawasan kebangsaan dan bela negara',
      subtitle: 'Menguatkan rasa nasionalisme, disiplin, dan cinta tanah air',
      members: [
        { role: 'Ketua', name: 'Ahmad syauki mahbubi', photo: 'syauki.png' },
        { role: 'Anggota', name: 'Melinda eka safitri', photo: 'melida.png' },
        { role: 'Anggota', name: 'Nur azmi hanifah', photo: 'azmi.png' },
      ],
    },
    {
      name: 'Pembinaan prestasi akademik seni atau olahraga sesuai bakat',
      subtitle: 'Mendorong prestasi akademik, seni, dan olahraga siswa',
      members: [
        { role: 'Ketua', name: 'Abd. rozak', photo: 'rozak.png' },
        { role: 'Anggota', name: 'Niki alfaris', photo: 'niki.png' },
      ],
    },
    {
      name: 'Demokrasi, Ham, Pendidikan politik, Lingkungan hidup, Kepekaan toleransi dan sosial dalam konteks masyarakat plural',
      subtitle: 'Meningkatkan kesadaran demokrasi, HAM, lingkungan, dan toleransi',
      members: [
        { role: 'Ketua', name: 'Nazilatul maghfiroh', photo: 'zila.png' },
        { role: 'Anggota', name: 'M. maulana nazril', photo: 'nazril.png' },
      ],
    },
    {
      name: 'Kreatifitas keterampilan dan kewirausahaan',
      subtitle: 'Mengasah kreativitas, keterampilan, dan jiwa berwirausaha',
      members: [
        { role: 'Ketua', name: 'Alissa alviatus', photo: 'via.png' },
        { role: 'Anggota', name: 'Alfiatus sufiah', photo: 'evi.png' },
      ],
    },
    {
      name: 'Kualitas jasmani kesehatan dan fisik berbasis sumber gizi yang terdiferifikasi',
      subtitle: 'Meningkatkan kesehatan fisik, kebugaran, dan pemahaman gizi',
      members: [
        { role: 'Ketua', name: 'Asraf maulan', photo: 'asraf.png' },
        { role: 'Anggota', name: 'Durrotun nasiha', photo: 'nasya.png' },
      ],
    },
    {
      name: 'Sastra dan budaya',
      subtitle: 'Memajukan apresiasi sastra, seni, dan budaya lokal',
      members: [
        { role: 'Ketua', name: 'hafidzah metha n.o', photo: 'okta.png' },
        { role: 'Anggota', name: 'M. yusuf karunia putra.a', photo: 'yusuf.png' },
      ],
    },
    {
      name: 'Bidang teknologi informasi dan komikasi',
      subtitle: 'Mendorong kemampuan teknologi informasi dan komunikasi',
      members: [
        { role: 'Ketua', name: 'Nabil hariyanto', photo: 'nabil.png' },
        { role: 'Anggota', name: 'M. Fadhan', photo: 'fadhan.png' },
      ],
    },
    {
      name: 'Bidang komunikasi dalam bahasa inggris',
      subtitle: 'Mengembangkan keterampilan komunikasi dalam bahasa Inggris',
      members: [
        { role: 'Ketua', name: 'Rania gassani', photo: 'shani.png' },
        { role: 'Anggota', name: 'aulya ramadhani', photo: 'aulya.png' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Kembali ke Home</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-black mb-4 font-['Space_Grotesk']">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Struktur Organisasi OSIS
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Kenali pengurus OSIS yang siap melayani dan mengembangkan sekolah
            </p>
          </div>

          {/* Pembina & Wakil Pembina */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-amber-600 to-orange-600 rounded-full"></div>
              Pembina OSIS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pembina.map((pengurus) => (
                <div
                  key={pengurus.position}
                  className="group bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 hover:-translate-y-2"
                >
                  {/* Photo */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                    {pengurus.photo ? (
                      <img
                        src={pengurus.photo}
                        alt={pengurus.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">👥</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-6">
                    <div className="text-sm font-semibold text-amber-600 mb-1">
                      {pengurus.position}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {pengurus.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {pengurus.description}
                    </p>
                    
                    {/* Contact */}
                    <div className="space-y-2 text-sm">
                      <a
                        href={`tel:${pengurus.contact.phone}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{pengurus.contact.phone}</span>
                      </a>
                      <a
                        href={`https://instagram.com/${pengurus.contact.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>{pengurus.contact.instagram}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pengurus Inti */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
              Pengurus Inti
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {struktur.map((pengurus) => (
                <div
                  key={pengurus.position}
                  className="group bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 hover:-translate-y-2"
                >
                  {/* Photo */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                    {pengurus.photo ? (
                      <img
                        src={pengurus.photo}
                        alt={pengurus.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-6">
                    <div className="text-sm font-semibold text-indigo-600 mb-1">
                      {pengurus.position}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {pengurus.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {pengurus.description}
                    </p>
                    
                    {/* Contact */}
                    <div className="space-y-2 text-sm">
                      <a
                        href={`tel:${pengurus.contact.phone}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{pengurus.contact.phone}</span>
                      </a>
                      <a
                        href={`https://instagram.com/${pengurus.contact.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>{pengurus.contact.instagram}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wakil Kepala Sekolah Bidang Kesiswaan */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
              Wakil Kepala Sekolah Bidang Kesiswaan
            </h2>
            
            <div className="max-w-2xl">
              <div
                className="group bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 hover:-translate-y-2"
              >
                {/* Photo */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100">
                  {wakaSiswa.photo ? (
                    <img
                      src={wakaSiswa.photo}
                      alt={wakaSiswa.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">👩‍💼</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Info */}
                <div className="p-6">
                  <div className="text-sm font-semibold text-green-600 mb-1">
                    {wakaSiswa.position}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {wakaSiswa.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {wakaSiswa.description}
                  </p>
                  
                  {/* Contact */}
                  <div className="space-y-3 text-sm">
                    <a
                      href={`tel:${wakaSiswa.contact.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{wakaSiswa.contact.phone}</span>
                    </a>
                    <a
                      href={`https://instagram.com/${wakaSiswa.contact.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>{wakaSiswa.contact.instagram}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pengurus dari Admin */}
          {adminPengurus.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-pink-600 to-rose-600 rounded-full"></div>
                Daftar Lengkap Pengurus
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminPengurus.map((pengurus) => (
                  <div
                    key={pengurus.id}
                    className="group bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 hover:-translate-y-2"
                  >
                    {/* Photo */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                      {pengurus.photo ? (
                        <img
                          src={pengurus.photo}
                          alt={pengurus.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-6">
                      <div className="text-sm font-semibold text-pink-600 mb-1">
                        {pengurus.position}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {pengurus.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {pengurus.description}
                      </p>
                      
                      {/* Contact */}
                      <div className="space-y-1 text-xs">
                        <a
                          href={`tel:${pengurus.contact.phone}`}
                          className="flex items-center gap-1 text-gray-600 hover:text-pink-600 transition-colors truncate"
                        >
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{pengurus.contact.phone}</span>
                        </a>
                        <a
                          href={`https://instagram.com/${pengurus.contact.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-600 hover:text-pink-600 transition-colors truncate"
                        >
                          <Instagram className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{pengurus.contact.instagram}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bidang-Bidang */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
              Bidang-Bidang
            </h2>
            <p className="text-sm text-gray-600 mb-8 max-w-2xl">
              Setiap sekbid ditampilkan sebagai pasangan profil kecil agar lebih rapi.
              Satu bidang memiliki 3 profil, sisanya berisi 2 profil.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {bidang.map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-slate-600">
                      {item.members.length} Anggota
                    </div>
                  </div>

                  <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${item.members.length === 3 ? 'lg:grid-cols-3' : ''}`}>
                    {item.members.map((member) => (
                      <div
                        key={member.name}
                        className="rounded-2xl border border-gray-200 bg-slate-50 p-4 text-center min-h-[210px] flex flex-col items-center justify-between"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              member.name
                                .split(' ')
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join('')
                            )}
                          </div>
                          <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            {member.role}
                          </div>
                          <div className="text-sm font-semibold text-gray-800">
                            {member.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
