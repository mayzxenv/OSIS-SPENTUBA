import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Camera, 
  Users2, 
  MessageSquare, 
  Lightbulb,
  Mail,
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { icon: Sparkles, label: "Apresiasi", href: "/apresiasi" },
    { icon: Camera, label: "Album Kegiatan", href: "/album-kegiatan" },
    { icon: Users2, label: "Struktur Organisasi", href: "/struktur-organisasi" },
    { icon: Lightbulb, label: "Bank Ide", href: "/bank-ide" },
    { icon: MessageSquare, label: "Forum", href: "/forum" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden">
                <img
                  src="/icon.png"
                  alt="OSIS Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold font-['Space_Grotesk']">OSIS </h3>
                <p className="text-sm text-gray-400">Portal Interaktif</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform digital untuk siswa yang lebih terhubung, aktif, dan berdampak. 
              Mari bersama membangun sekolah yang lebih baik!
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/panduan" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Panduan Penggunaan
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privasi" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link to="/syarat" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link to="/lapor" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Lapor Masalah
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">
                  Jalan Raya, Markolak Timur, Kramat, Bangkalan, Bangkalan Regency, East Java<br />
                  Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <a href="tel:+62123456789" className="text-sm text-gray-400 hover:text-white transition-colors">
                  +62 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <a href="mailto:spentuba.sigma@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                  spentuba.sigma@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2026 OSIS Spentuba. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
