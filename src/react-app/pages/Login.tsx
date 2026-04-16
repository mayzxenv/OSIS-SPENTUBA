import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, Shield, Zap, Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Login() {
  const [isPending, setIsPending] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setIsPending(true);
    // Mock login
    setTimeout(() => {
      setUser({ id: "mock-user", email: "user@example.com", name: "Mock User" });
      setIsPending(false);
    }, 1000);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img
            src="/icon.png"
            alt="OSIS SMPN 7 Bangkalan"
            className="w-24 h-24 mx-auto mb-6"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = '/logo.svg';
            }}
          />
          <h1 className="text-4xl font-black text-slate-900 mb-2 font-['Space_Grotesk']">
            OSIS Connect
          </h1>
          <p className="text-xl text-gray-600">Portal Interaktif Siswa</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Masuk ke Akun Anda
          </h2>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-200 hover:-translate-y-1 flex items-center justify-center gap-3 group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Masuk dengan Google</span>
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Dengan masuk, kamu bisa:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-indigo-600" />
                </div>
                <span>Beri apresiasi ke teman dan pengurus</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <span>Submit ide kreatif untuk kegiatan OSIS</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-pink-600" />
                </div>
                <span>Ikut diskusi di forum siswa</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure authentication powered by Google OAuth
        </p>
      </div>
    </div>
  );
}
