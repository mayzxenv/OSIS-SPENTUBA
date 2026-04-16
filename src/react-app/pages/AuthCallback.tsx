import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Mock auth callback
      setTimeout(() => {
        navigate("/");
      }, 1000);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Memproses login...</h2>
        <p className="text-gray-600">Tunggu sebentar ya</p>
      </div>
    </div>
  );
}
