import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, ChevronDown, Menu, X, LogOut, Monitor, Code2, Palette, Calculator, AlertTriangle } from 'lucide-react';
import { logoHeader } from '../assets/Assets';
import { slugify } from '../utils/mockData';
import toast from 'react-hot-toast';

const prodiIcons = {
  "Sistem Informasi": Monitor,
  "Teknik Komputer":  Code2,
  "DKV":              Palette,
  "Matematika":       Calculator,
};

export default function Header() {
  const [isProdiOpen, setIsProdiOpen]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchFocused, setSearchFocused]   = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // ========================================================
  // PERBAIKAN: Fungsi Logout dengan Konfirmasi Custom Toast
  // ========================================================
  const handleLogout = () => {
    setIsMobileMenuOpen(false); // Tutup menu mobile jika sedang terbuka

    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="font-semibold text-white text-sm">Yakin ingin keluar?</p>
        </div>
        <div className="flex items-center justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id); // Tutup toast konfirmasi
              
              // Eksekusi proses logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setIsLoggedIn(false);
              navigate('/');
              
              // Munculkan pesan sukses
              toast.success('Anda berhasil keluar.');
            }}
            className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 shadow-sm shadow-red-500/30 transition-colors"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Biarkan toast terbuka sampai user memilih
      position: 'top-center',
    });
  };
  // ========================================================

  const [activeIndex, setActiveIndex]   = useState(0);
  const [hoverIndex, setHoverIndex]     = useState(null);
  const [pillStyle, setPillStyle]       = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef([]);

  const [authHoverIndex, setAuthHoverIndex] = useState(null);
  const [authPillStyle, setAuthPillStyle]   = useState({ left: 0, width: 0, opacity: 0 });
  const authRefs = useRef([]);

  const navItems = [
    { id: 'explore',       label: 'Explore',      path: '/' },
    { id: 'prodi',         label: 'Prodi',        hasDropdown: true },
    { id: 'best-projects', label: 'Best Project', path: '/filter/fyp' },
  ];

  const prodiList = ["Sistem Informasi", "Teknik Komputer", "DKV", "Matematika"];

  useEffect(() => {
    if (location.pathname === '/') setActiveIndex(0);
    else if (location.pathname.includes('/filter') && location.pathname !== '/filter/fyp') setActiveIndex(1);
    else if (location.pathname === '/filter/fyp') setActiveIndex(2);
  }, [location.pathname]);

  useEffect(() => {
    const targetIndex = hoverIndex !== null ? hoverIndex : activeIndex;
    const el = navRefs.current[targetIndex];
    if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
  }, [hoverIndex, activeIndex]);

  useEffect(() => {
    if (authHoverIndex !== null) {
      const el = authRefs.current[authHoverIndex];
      if (el) setAuthPillStyle({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    } else {
      setAuthPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [authHoverIndex]);

  const handleNavClick = (item, index) => {
    if (item.hasDropdown) {
      setIsProdiOpen(!isProdiOpen);
    } else {
      setIsProdiOpen(false);
      navigate(item.path);
    }
  };

  const handleProdiClick = (prodiName) => {
    setIsProdiOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/filter/${slugify(prodiName)}`);
  };

  // Sinkronisasi teks pencarian dengan URL agar tidak hilang saat di-refresh
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('q') || '');
    } else {
      setSearchQuery(''); // Kosongkan search bar jika keluar dari halaman pencarian
    }
  }, [location.pathname, location.search]);

  // Eksekusi pencarian otomatis saat huruf diketik (Live Search)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(val)}`);
    } else {
      navigate('/'); // Kembali ke Explore jika search bar dihapus sampai kosong
    }
  };

  // Menutup menu mobile saat menekan Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="shrink-0 flex items-center px-3.5 py-2 rounded-2xl
            bg-white/70 backdrop-blur-xl border border-white/60
            shadow-[0_2px_10px_-2px_rgba(15,23,42,0.08)]
            hover:shadow-[0_8px_24px_-4px_rgba(44,113,184,0.25)]
            hover:bg-white/90 hover:scale-[1.03] hover:-translate-y-0.5
            active:scale-[0.98]
            transition-all duration-300 ease-out"
        >
          <img src={logoHeader} alt="ITEBAFolio" className="h-7 md:h-8 w-auto object-contain" />
        </Link>

        {/* ── Desktop Nav Pill ── */}
        <div
          className="hidden md:flex items-center relative
            bg-white/75 backdrop-blur-xl backdrop-saturate-150
            rounded-full
            shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.10)]
            ring-1 ring-slate-900/[0.04]
            border border-white/60 p-1.5"
          onMouseLeave={() => { setHoverIndex(null); setIsProdiOpen(false); }}
        >
          {/* Sliding active pill — gradient + glow */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full pointer-events-none
              bg-gradient-to-r from-[#2C71B8] to-[#4A8FE7]
              shadow-md shadow-blue-500/30
              transition-all duration-300 ease-out"
            style={{ left: pillStyle.left, width: pillStyle.width, opacity: pillStyle.opacity }}
          />

          {navItems.map((item, index) => {
            const isTargeted = (hoverIndex !== null ? hoverIndex : activeIndex) === index;
            return (
              <div
                key={item.id}
                ref={(el) => (navRefs.current[index] = el)}
                onMouseEnter={() => setHoverIndex(index)}
                onClick={() => handleNavClick(item, index)}
                className="relative z-10 px-5 py-2 cursor-pointer flex items-center gap-1.5 rounded-full select-none"
              >
                <span className={`text-sm font-semibold tracking-tight transition-colors duration-300
                  ${isTargeted ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                  {item.label}
                </span>

                {item.hasDropdown && (
                  <ChevronDown
                    size={14}
                    className={`transition-all duration-300
                      ${isTargeted ? 'text-white' : 'text-slate-500'}
                      ${isProdiOpen ? 'rotate-180' : ''}`}
                  />
                )}

                {/* Dropdown — Command Menu style */}
                {item.hasDropdown && isProdiOpen && (
                  <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-64
                    bg-white/95 backdrop-blur-2xl backdrop-saturate-150 border border-white/60
                    rounded-3xl
                    shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-12px_rgba(15,23,42,0.22)]
                    ring-1 ring-slate-900/[0.04]
                    py-2.5 flex flex-col pointer-events-auto
                    animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Pilih Program Studi
                    </span>
                    {prodiList.map((prodi, i) => {
                      const Icon = prodiIcons[prodi] ?? Monitor;
                      return (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); handleProdiClick(prodi); }}
                          className="group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl
                            text-sm text-slate-600 font-medium text-left
                            hover:bg-blue-50/80 hover:text-[#2C71B8]
                            transition-all duration-150"
                        >
                          <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100
                            flex items-center justify-center shrink-0 transition-colors duration-150">
                            <Icon size={13} className="text-slate-500 group-hover:text-[#2C71B8] transition-colors" />
                          </span>
                          {prodi}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Separator */}
          <span className="hidden lg:block w-px h-5 bg-slate-200/80 mx-1.5" />

          {/* Search Bar Desktop */}
          <div className="relative flex items-center ml-1.5 mr-1">
            <Search size={14} className={`absolute left-3 transition-colors duration-200
              ${searchFocused ? 'text-[#2C71B8]' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Temukan karya terbaik..."
              value={searchQuery}
              onChange={handleSearchChange} // Menggunakan Live Search
              onKeyDown={handleSearchSubmit}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`pl-9 pr-4 py-2 text-xs font-medium
                bg-slate-50/80 border rounded-full
                focus:outline-none transition-all duration-300
                placeholder:text-slate-400
                ${searchFocused
                  ? 'w-64 border-[#2C71B8]/40 ring-2 ring-[#2C71B8]/10 bg-white shadow-sm'
                  : 'w-52 border-slate-200/70 hover:bg-white'}`}
            />
          </div>
        </div>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5
              bg-white/75 backdrop-blur-xl backdrop-saturate-150 border border-white/60
              rounded-full
              shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.10)]
              ring-1 ring-slate-900/[0.04]
              px-2 py-1.5">

              {currentUser?.role_id === 2 && (
                <Link
                  to="/manage-project"
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full
                    bg-gradient-to-r from-[#2C71B8] to-[#4A8FE7]
                    !text-white hover:!text-white text-[13px] font-bold tracking-tight
                    shadow-md shadow-blue-500/25
                    hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02]
                    transition-all duration-200 active:scale-95"
                >
                  + Tambah Portofolio
                </Link>
              )}

              {currentUser?.role_id === 1 && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full
                    bg-gradient-to-r from-violet-600 to-purple-600
                    !text-white hover:!text-white text-[13px] font-bold
                    shadow-md shadow-purple-500/25
                    hover:shadow-purple-500/40 hover:-translate-y-0.5
                    transition-all duration-200 active:scale-95"
                >
                  Dashboard Admin
                </Link>
              )}

              <Link
                to="/profile"
                title="Profil Saya"
                className="w-9 h-9 flex items-center justify-center
                  bg-white border border-slate-200 rounded-full
                  hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300
                  transition-all duration-200 shadow-sm"
              >
                <User size={17} className="text-slate-700" />
              </Link>

              <button
                onClick={handleLogout}
                title="Keluar"
                className="w-9 h-9 flex items-center justify-center
                  bg-white border border-red-100 rounded-full
                  hover:bg-red-50 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md
                  transition-all duration-200 shadow-sm text-red-400 hover:text-red-500"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            /* Auth segmented control */
            <div
              className="flex items-center relative
                bg-white/75 backdrop-blur-xl backdrop-saturate-150 border border-white/60
                rounded-full
                shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.10)]
                ring-1 ring-slate-900/[0.04]
                p-1.5"
              onMouseLeave={() => setAuthHoverIndex(null)}
            >
              <div
                className="absolute top-1.5 bottom-1.5 rounded-full pointer-events-none
                  bg-gradient-to-r from-[#2C71B8] to-[#4A8FE7]
                  shadow-md shadow-blue-500/25
                  transition-all duration-300 ease-out"
                style={{ left: authPillStyle.left, width: authPillStyle.width, opacity: authPillStyle.opacity }}
              />
              <Link
                to="/login"
                ref={(el) => (authRefs.current[0] = el)}
                onMouseEnter={() => setAuthHoverIndex(0)}
                className="relative z-10 px-5 py-2 rounded-full cursor-pointer"
              >
                <span className={`text-sm font-semibold transition-colors duration-300
                  ${authHoverIndex === 0 ? 'text-white' : 'text-slate-600'}`}>
                  Masuk
                </span>
              </Link>
              <Link
                to="/register"
                ref={(el) => (authRefs.current[1] = el)}
                onMouseEnter={() => setAuthHoverIndex(1)}
                className="relative z-10 px-6 py-2 rounded-full cursor-pointer"
              >
                <span className={`text-sm font-semibold transition-colors duration-300
                  ${authHoverIndex === 1 ? 'text-white' : 'text-slate-600'}`}>
                  Daftar
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center
            bg-white/80 backdrop-blur-xl border border-white/60
            rounded-2xl
            shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_16px_-6px_rgba(15,23,42,0.12)]
            hover:shadow-[0_8px_20px_-4px_rgba(44,113,184,0.2)] hover:-translate-y-0.5
            active:scale-95
            transition-all duration-200 text-slate-700"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Sheet ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%+8px)] left-3 right-3
          bg-white/95 backdrop-blur-2xl backdrop-saturate-150 border border-white/60
          rounded-[2rem]
          shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-12px_rgba(15,23,42,0.25)]
          ring-1 ring-slate-900/[0.04]
          p-5 flex flex-col gap-5
          animate-in fade-in slide-in-from-top-4 duration-300 ease-out">

          {/* Search Bar Mobile */}
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Temukan karya terbaik..."
              value={searchQuery}
              onChange={handleSearchChange} // Menggunakan Live Search
              onKeyDown={handleSearchSubmit}
              className="w-full pl-10 pr-4 py-3 text-sm font-medium
                bg-slate-50 border border-slate-200 rounded-2xl
                focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/40 focus:bg-white
                placeholder:text-slate-400 transition-all duration-200"
            />
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Navigasi
            </span>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-[15px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
              Explore
            </Link>
            <div>
              <button
                onClick={() => setIsProdiOpen(!isProdiOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[15px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Prodi
                <ChevronDown size={17} className={`text-slate-500 transition-transform duration-300 ${isProdiOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProdiOpen && (
                <div className="flex flex-col pl-4 mt-1 gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {prodiList.map((prodi, i) => {
                    const Icon = prodiIcons[prodi] ?? Monitor;
                    return (
                      <button key={i} onClick={() => handleProdiClick(prodi)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 font-medium hover:bg-blue-50 hover:text-[#2C71B8] transition-colors text-left">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                          <Icon size={12} className="text-slate-500 group-hover:text-[#2C71B8] transition-colors" />
                        </span>
                        {prodi}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Link to="/filter/fyp" onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-[15px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
              Best Project
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-100">
            <span className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Akun
            </span>
            {isLoggedIn ? (
              <>
                {currentUser?.role_id === 2 && (
                  <Link to="/manage-project" onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-2xl font-bold text-sm !text-white hover:!text-white
                      bg-gradient-to-r from-[#2C71B8] to-[#4A8FE7]
                      shadow-md shadow-blue-500/25 transition-transform active:scale-95">
                    + Tambah Portofolio
                  </Link>
                )}
                {currentUser?.role_id === 1 && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-2xl font-bold text-sm !text-white hover:!text-white
                      bg-gradient-to-r from-violet-600 to-purple-600
                      shadow-md shadow-purple-500/20 transition-transform active:scale-95">
                    Dashboard Admin
                  </Link>
                )}
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-2xl font-semibold text-sm text-slate-700
                    bg-slate-50 border border-slate-200 hover:bg-white transition-colors">
                  Profil Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-3 rounded-2xl font-semibold text-sm text-red-500
                    bg-red-50 border border-red-100 hover:bg-red-100 transition-colors active:scale-95">
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded-2xl font-bold text-sm text-slate-700
                    bg-slate-50 border border-slate-200 hover:bg-white transition-colors">
                  Masuk
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded-2xl font-bold text-sm !text-white hover:!text-white
                    bg-gradient-to-r from-[#2C71B8] to-[#4A8FE7]
                    shadow-md shadow-blue-500/20 transition-transform active:scale-95">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}