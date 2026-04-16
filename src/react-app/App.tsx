import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "@/react-app/pages/Home";
import AlbumKegiatan from "@/react-app/pages/AlbumKegiatan";
import StrukturOrganisasi from "@/react-app/pages/StrukturOrganisasi";
import Apresiasi from "@/react-app/pages/Apresiasi";
import BankIde from "@/react-app/pages/BankIde";
import Forum from "@/react-app/pages/Forum";
import AdminPanel from "@/react-app/pages/AdminPanel";
import RuangPribadi from "@/react-app/pages/RuangPribadi";
import {
  PanduanPenggunaan,
  FAQ,
  KebijakanPrivasi,
  SyaratKetentuan,
  LaporMasalah,
} from "@/react-app/pages/InfoPages";

import { useEffect, useState } from 'react';
import { ThemeContext, Theme } from '@/react-app/theme';
import Footer from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem('osis_theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('osis_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <main className="flex-grow">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/album-kegiatan" element={<AlbumKegiatan />} />
            <Route path="/struktur-organisasi" element={<StrukturOrganisasi />} />
            <Route path="/apresiasi" element={<Apresiasi />} />
            <Route path="/bank-ide" element={<BankIde />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/ruang-pribadi" element={<RuangPribadi />} />
            <Route path="/panduan" element={<PanduanPenggunaan />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privasi" element={<KebijakanPrivasi />} />
            <Route path="/syarat" element={<SyaratKetentuan />} />
            <Route path="/lapor" element={<LaporMasalah />} />
              </Routes>
            </main>

            <Footer />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}
