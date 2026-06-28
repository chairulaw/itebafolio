import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Iridescence from '../components/Iridescence';
import { logoAuth } from '../assets/Assets';
import api from '../utils/api';

export default function Register() {
  // --- STATE LOGIC ---
  const [registerType, setRegisterType] = useState('pengunjung'); // Default ke pengunjung
  const [namaUser, setNamaUser] = useState('');
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // --- HANDLER FUNGSI REGISTRASI ---
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return alert("Password dan Konfirmasi Password tidak cocok!");
    }

    setIsLoading(true);
    try {
      // Payload dinamis: Jika pengunjung, nim/prodi/angkatan dikirim kosong agar ditangani backend
      const payload = {
        nama_user: namaUser,
        email: email,
        password: password,
        nim: registerType === 'mahasiswa' ? nim : '',
        prodi: registerType === 'mahasiswa' ? prodi : '',
        angkatan: registerType === 'mahasiswa' ? angkatan : ''
      };

      const response = await api.post('/auth/register', payload);

      alert(response.data.message);
      navigate('/');

    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan pada server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-[#05070C]">

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

      {/* Sisi Kiri: Teks (Hanya terlihat di Desktop) */}
      <div className="hidden md:flex w-1/2 h-full relative z-10 flex-col justify-between p-12 lg:p-16 text-white pointer-events-none">
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
            Bergabung dan jadi bagian dari komunitas karya terbaik kampus.
          </p>
        </div>

        <p className="text-[11px] text-white/35 tracking-wide">© {new Date().getFullYear()} ITEBAFolio. Semua hak dilindungi.</p>
      </div>

      {/* Sisi Kanan: Formulir Registrasi */}
      <div className="w-full md:w-1/2 h-full relative z-10 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className={`w-full bg-white/95 md:bg-white/[0.07] backdrop-blur-2xl p-8 md:p-10 rounded-[28px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.55)] border border-white/10 my-auto transition-[max-width] duration-300 ${registerType === 'mahasiswa' ? 'max-w-xl' : 'max-w-md'}`}>

          {/* Mobile logo (since left panel is hidden) */}
          <img
            src={logoAuth}
            alt="Logo ITEBAFolio"
            className="h-9 w-auto object-contain mb-6 md:hidden"
          />

          <div className="mb-5">
            <h2 className="text-[24px] font-bold text-gray-900 md:text-white mb-1.5 tracking-tight">Daftar Akun Baru</h2>
            <p className="text-[13px] text-gray-500 md:text-white/55">
              {registerType === 'mahasiswa'
                ? 'Lengkapi data diri mahasiswa Anda'
                : 'Buat akun untuk memberikan apresiasi'}
            </p>
          </div>

          {/* --- TOGGLE TIPE AKUN — Premium Segmented Control --- */}
          <div className="relative flex p-1 bg-gray-100/80 md:bg-white/[0.06] rounded-full mb-5 border border-gray-200/60 md:border-white/10">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white md:bg-white/[0.14] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)] border border-gray-200/60 md:border-white/15 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                registerType === 'mahasiswa' ? 'left-[calc(50%+0px)]' : 'left-1'
              }`}
            ></div>
            <button
              type="button"
              onClick={() => setRegisterType('pengunjung')}
              className={`relative z-10 flex-1 py-2.5 text-[12px] font-bold rounded-full transition-colors duration-300 ${
                registerType === 'pengunjung'
                  ? 'text-[#2C71B8] md:text-white'
                  : 'text-gray-500 md:text-white/45 hover:text-gray-700 md:hover:text-white/70'
              }`}
            >
              Pengunjung Umum
            </button>
            <button
              type="button"
              onClick={() => setRegisterType('mahasiswa')}
              className={`relative z-10 flex-1 py-2.5 text-[12px] font-bold rounded-full transition-colors duration-300 ${
                registerType === 'mahasiswa'
                  ? 'text-[#2C71B8] md:text-white'
                  : 'text-gray-500 md:text-white/45 hover:text-gray-700 md:hover:text-white/70'
              }`}
            >
              Mahasiswa ITEBA
            </button>
          </div>

          <form className="space-y-3.5" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className={registerType === 'mahasiswa' ? '' : 'col-span-2'}>
                <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={namaUser}
                  onChange={(e) => setNamaUser(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
                />
              </div>

              {/* --- INPUT KHUSUS MAHASISWA: NIM mendampingi Nama --- */}
              {registerType === 'mahasiswa' && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">NIM</label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    required={registerType === 'mahasiswa'}
                    className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
                  />
                </div>
              )}

              {/* --- INPUT KHUSUS MAHASISWA: Prodi & Angkatan berdampingan --- */}
              {registerType === 'mahasiswa' && (
                <>
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Program Studi</label>
                    <select
                      value={prodi}
                      onChange={(e) => setProdi(e.target.value)}
                      required={registerType === 'mahasiswa'}
                      className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10 text-sm cursor-pointer appearance-none"
                    >
                      <option value="" disabled className="text-gray-900">Pilih Prodi</option>
                      <option value="Sistem Informasi" className="text-gray-900">Sistem Informasi</option>
                      <option value="Desain Komunikasi Visual" className="text-gray-900">Desain Komunikasi Visual</option>
                      <option value="Teknik Komputer" className="text-gray-900">Teknik Komputer</option>
                      <option value="Matematika" className="text-gray-900">Matematika</option>
                    </select>
                  </div>
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Angkatan</label>
                    <input
                      type="number"
                      value={angkatan}
                      onChange={(e) => setAngkatan(e.target.value)}
                      required={registerType === 'mahasiswa'}
                      placeholder="Cth: 2022"
                      className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
                    />
                  </div>
                </>
              )}

              <div className={registerType === 'mahasiswa' ? '' : 'col-span-2'}>
                <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={registerType === 'mahasiswa' ? "email@iteba.ac.id" : "email@gmail.com"}
                  className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
                />
                {registerType === 'mahasiswa' && (
                  <p className="text-[10px] text-gray-400 md:text-white/35 mt-1.5 ml-1">Gunakan email @iteba.ac.id</p>
                )}
              </div>

              <div className={registerType === 'mahasiswa' ? '' : 'col-span-2'}>
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

              <div className={registerType === 'mahasiswa' ? '' : 'col-span-2'}>
                <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-1.5">Konfirmasi Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
                />
              </div>
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
                  Daftar Sekarang
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 text-center text-[13px] text-gray-500 md:text-white/50">
            Sudah punya akun? <Link to="/login" className="text-[#2C71B8] md:text-[#7CB4E8] hover:underline font-semibold">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}