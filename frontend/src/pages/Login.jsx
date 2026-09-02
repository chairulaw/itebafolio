import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import Iridescence from '../components/Iridescence';
import { logoAuth } from '../assets/Assets';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const navigate = useNavigate();

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

  useEffect(() => {
    let timer;
    if (countdown > 0 && isOtpStep) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, isOtpStep]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.needVerification) {
        toast.success(response.data.message || "OTP berhasil dikirim ke email Anda!");
        setIsOtpStep(true);
        setCountdown(60); 
      } else {
        toast.success(response.data.message || "Berhasil masuk!");
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/'); 
        window.location.reload(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal melakukan login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
    if (value !== '' && index === 5 && newOtp.every(v => v !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // FUNGSI BARU: Menangani event Paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    // Ambil data clipboard, hilangkan karakter non-angka, potong maksimal 6 digit
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Pindahkan fokus ke kotak terakhir yang terisi
    const focusIndex = Math.min(pastedData.length, 5);
    if (otpRefs.current[focusIndex]) {
      otpRefs.current[focusIndex].focus();
    }

    // Jika 6 digit terpenuhi saat di-paste, langsung verifikasi otomatis
    if (pastedData.length === 6) {
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpString) => {
    const finalOtp = otpString || otp.join('');
    if (finalOtp.length < 6) return toast.error("Masukkan 6 digit kode OTP!");

    setIsLoading(true);
    const loadingToast = toast.loading("Memverifikasi...");

    try {
      const response = await api.post('/auth/verify-otp', { email, otp_code: finalOtp });
      
      toast.success("Berhasil masuk!", { id: loadingToast });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/'); 
      window.location.reload(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP Salah atau Kedaluwarsa.", { id: loadingToast });
      setOtp(['', '', '', '', '', '']);
      if (otpRefs.current[0]) otpRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    const loadingToast = toast.loading("Mengirim ulang OTP...");
    
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success("Kode OTP baru telah dikirim!", { id: loadingToast });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      if (otpRefs.current[0]) otpRefs.current[0].focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengirim ulang OTP.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-[#05070C]">
      <Link
        to={isOtpStep ? "#" : "/"}
        onClick={() => isOtpStep && setIsOtpStep(false)}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center justify-center w-11 h-11 text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-xl rounded-full transition-all duration-300 hover:-translate-x-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]"
      >
        <ArrowLeft size={19} />
      </Link>

      {iridescenceBackground}

      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40"></div>
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_55%)]"></div>

      <div className="hidden md:flex w-1/2 h-full relative z-10 flex-col justify-between p-12 lg:p-16 text-white pointer-events-none">
        <div className="flex items-center gap-2.5 mt-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">Sistem Keamanan Terpadu</span>
        </div>
        <div>
          <img src={logoAuth} alt="Logo" className="h-12 lg:h-16 w-auto object-contain object-left self-start mb-7 drop-shadow-lg" />
          <p className="text-3xl lg:text-[2.6rem] font-light leading-[1.15] max-w-lg drop-shadow-md text-white/95 text-left self-start tracking-tight">
            Selamat datang kembali di galeri inspirasi.
          </p>
          <p className="mt-4 text-[14px] text-white/50 max-w-md leading-relaxed">
            Masuk untuk mulai mengelola portofolio dan memberikan apresiasi pada karya terbaik.
          </p>
        </div>
        <p className="text-[11px] text-white/35 tracking-wide">© {new Date().getFullYear()} ITEBAFolio. Semua hak dilindungi.</p>
      </div>

      <div className="w-full md:w-1/2 h-full relative z-10 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-md bg-white/95 md:bg-white/[0.07] backdrop-blur-2xl p-8 md:p-10 rounded-[28px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.55)] border border-white/10 my-auto transition-all duration-500">
          
          <img src={logoAuth} alt="Logo" className="h-9 w-auto object-contain mb-8 md:hidden" />

          {!isOtpStep ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8">
                <h2 className="text-[26px] font-bold text-gray-900 md:text-white mb-2 tracking-tight">Masuk ke Akun</h2>
                <p className="text-[13.5px] text-gray-500 md:text-white/55">Masukkan data identitas Anda</p>
              </div>

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-2">Email / Username</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email Kampus / ID Admin"
                    className="w-full px-4 py-3.5 bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white placeholder:text-gray-400 md:placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8]/40 focus:bg-white md:focus:bg-white/[0.1] transition-all duration-200 border border-gray-200 md:border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 md:text-white/60 uppercase tracking-wider mb-2">Password</label>
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
                  className={`group w-full py-3.5 rounded-full font-semibold text-[14.5px] mt-6 flex items-center justify-center gap-2 transition-all duration-300 ${
                    isLoading
                      ? 'bg-gray-300 md:bg-white/20 text-gray-500 md:text-white/50 cursor-not-allowed'
                      : 'bg-[#2C71B8] text-white shadow-[0_14px_30px_-10px_rgba(44,113,184,0.55)] hover:shadow-[0_18px_36px_-8px_rgba(44,113,184,0.6)] hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? 'Memproses...' : (
                    <>Masuk <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /></>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-[13px] text-gray-500 md:text-white/50">
                Belum punya akun? <Link to="/register" className="text-[#2C71B8] md:text-[#7CB4E8] hover:underline font-semibold">Daftar sekarang</Link>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#2C71B8]/10 flex items-center justify-center mb-6 border border-[#2C71B8]/20">
                <ShieldCheck size={32} className="text-[#2C71B8] md:text-[#7CB4E8]" />
              </div>
              
              <h2 className="text-[24px] font-bold text-gray-900 md:text-white mb-2 tracking-tight">Verifikasi Keamanan</h2>
              <p className="text-[13.5px] text-gray-500 md:text-white/55 mb-8">
                Masukkan 6 digit kode OTP yang telah dikirim ke<br/>
                <strong className="text-gray-700 md:text-white font-semibold">{email}</strong>
              </p>

              <div className="flex gap-2 sm:gap-3 mb-8 w-full justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste} // <-- Event terpasang di sini
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 md:bg-white/[0.06] text-gray-900 md:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD8] focus:bg-white md:focus:bg-white/[0.1] transition-all border border-gray-200 md:border-white/10"
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otp.some(v => v === '')}
                className={`group w-full py-3.5 rounded-full font-semibold text-[14.5px] flex items-center justify-center gap-2 transition-all duration-300 ${
                  isLoading || otp.some(v => v === '')
                    ? 'bg-gray-300 md:bg-white/20 text-gray-500 md:text-white/50 cursor-not-allowed'
                    : 'bg-[#2C71B8] text-white shadow-[0_14px_30px_-10px_rgba(44,113,184,0.55)] hover:shadow-[0_18px_36px_-8px_rgba(44,113,184,0.6)] hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
              </button>

              <div className="mt-6 text-[13px] text-gray-500 md:text-white/50 flex items-center justify-center gap-2">
                Belum menerima kode?
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`font-semibold flex items-center gap-1 ${
                    countdown > 0
                      ? 'text-gray-400 md:text-white/30 cursor-not-allowed'
                      : 'text-[#2C71B8] md:text-[#7CB4E8] hover:underline cursor-pointer'
                  }`}
                >
                  {countdown > 0 ? (
                    `Kirim ulang (${countdown}s)`
                  ) : (
                    <>
                      <RefreshCw size={12} /> Kirim Ulang
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}