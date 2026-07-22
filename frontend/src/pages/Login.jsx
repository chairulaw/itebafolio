import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast'; // TAMBAHAN 1: Import fungsi toast
import Iridescence from '../components/Iridescence';
import { logoAuth } from '../assets/Assets';
import api from '../utils/api';

export default function Login() {
  // --- STATE LOGIC ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- MEMOIZATION BACKGROUND ---
  const iridescenceBackground = useMemo(() => (
    <div className="absolute inset-0 z-0">
      <Iridescence
        color={[0.1725, 0.4431, 0.7215]}
        mouseReact={true}
        amplitude={0.1}
        speed={0.7}
      />
    </div>
  ), []);

  // --- HANDLER FUNGSI LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Memulai proses dengan toast loading (opsional tapi bagus untuk UX)
    const toastId = toast.loading('Memeriksa kredensial...');

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // TAMBAHAN 2: Ganti toast loading menjadi sukses jika berhasil
      toast.success('Login berhasil! Selamat datang.', {
        id: toastId, // Mengganti toast loading yang sama
      });

      if (response.data.user.role_id === 1) {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (error) {
      // TAMBAHAN 3: Ganti alert() bawaan menjadi toast error
      toast.error(error.response?.data?.message || "Terjadi kesalahan saat login!", {
        id: toastId, // Mengganti toast loading yang sama
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#05070C]">

      {/* --- TOMBOL BACK MINIMALIS --- */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center justify-center w-11 h-11 text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xl rounded-full transition-all duration-300 hover:-translate-x-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]"
      >
        <ArrowLeft size={19} />
      </Link>

      {/* TAMPILKAN BACKGROUND YANG SUDAH DI-CACHE DI SINI */}
      {iridescenceBackground}

      {/* Ambient depth layers di atas Iridescence — tidak mengganggu komponennya */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40"></div>
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_55%)]"></div>

      {/* Sisi Kiri: Branding */}
      <div className="hidden md:flex w-1/2 relative z-10 flex-col justify-between p-12 lg:p-16 text-white pointer-events-none">
        <div className="flex items-center gap-2.5 mt-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">Showcase Karya Mahasiswa</span>
        </div>

        <div>
          <img
            src={logoAuth}
            alt="Logo ITEBAFolio"
            className="h-12 lg:h-16 w-auto object-contain object-left self-start mb-7 drop-shadow-lg"
          />
          <p className="text-3xl lg:text-[2.6rem] font-light leading-[1.15] max-w-lg drop-shadow-md text-white/95 text-left self-start tracking-tight">
            Temukan banyak karya menarik dari kami
          </p>
          <p className="mt-4 text-[14px] text-white/50 max-w-md leading-relaxed">
            Platform eksklusif untuk menampilkan dan mengapresiasi portofolio terbaik mahasiswa.
          </p>
        </div>

        <p className="text-[11px] text-white/35 tracking-wide">© {new Date().getFullYear()} ITEBAFolio. Semua hak dilindungi.</p>
      </div>

      {/* Sisi Kanan: Formulir Login */}
      <div className="w-full md:w-1/2 relative z-10 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md bg-white/95 md:bg-white/[0.07] backdrop-blur-2xl p-9 md:p-11 rounded-[28px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.55)] border border-white/10 md:border-white/10">

          {/* Mobile logo (since left panel is hidden) */}
          <img
            src={logoAuth}
            alt="Logo ITEBAFolio"
            className="h-9 w-auto object-contain mb-8 md:hidden brightness-0 md:brightness-100"
          />

          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-gray-900 md:text-white mb-1.5 tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-[13.5px] text-gray-500 md:text-white/55">Masuk untuk melanjutkan ke akun Anda</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group w-full py-3.5 rounded-full font-semibold text-[14.5px] mt-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-300 md:bg-white/20 text-gray-500 md:text-white/50 cursor-not-allowed'
                  : 'bg-[#2C71B8] text-white shadow-[0_14px_30px_-10px_rgba(44,113,184,0.55)] hover:shadow-[0_18px_36px_-8px_rgba(44,113,184,0.6)] hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isLoading ? 'Memproses...' : (
                <>
                  Masuk
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 text-center text-[13px] text-gray-500 md:text-white/50">
            Tidak punya akun? <Link to="/register" className="text-[#2C71B8] md:text-[#7CB4E8] hover:underline font-semibold">Buat akun</Link>
          </div>
        </div>
      </div>
    </div>
  );
}