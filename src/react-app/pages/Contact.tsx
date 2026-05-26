import Navbar from '../components/Navbar';
import Footer from '@/react-app/components/Footer';

export default function Contact() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    "name": "SMPN 7 Bangkalan",
    "url": "https://sispentuba.web.id/",
    "logo": "/Dark%20Blue%20Black%20Circle%20Modern%20Class%20Logo%20-%201.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jalan Raya, Markolak Timur, Kramat",
      "addressLocality": "Bangkalan",
      "addressRegion": "East Java",
      "postalCode": "",
      "addressCountry": "ID"
    },
    "telephone": "+44 7362 623743",
    "email": "spentuba.sigma@gmail.com",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+44 7362 623743",
        "email": "spentuba.sigma@gmail.com",
        "contactType": "administration",
        "areaServed": "ID",
        "availableLanguage": ["Indonesian"]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-4">Kontak - SMPN 7 Bangkalan</h1>

        <p className="mb-6 text-slate-600 dark:text-slate-300">Kontak resmi sekolah berada di bawah. Hubungi untuk informasi kegiatan, administrasi, atau koordinasi OSIS.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Alamat</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Jalan Raya, Markolak Timur, Kramat, Bangkalan, Bangkalan Regency, East Java, Indonesia</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Telepon & Email</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Telepon: +44 7362 623743</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">Email: spentuba.sigma@gmail.com</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Peta</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">(Tambahkan embed Google Maps jika tersedia)</p>
        </div>
      </main>

      <Footer />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </div>
  );
}
