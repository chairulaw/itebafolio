import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  FolderGit2,
  ShieldAlert,
  Layers,
  Search,
  LogOut,
  Loader2,
  ChevronRight,
  ChevronDown,
  UserCircle2
} from 'lucide-react';
import { logoHeader } from '../../assets/Assets';
import toast from 'react-hot-toast';
import api from '../../utils/api'; // Pastikan path ini benar sesuai struktur Anda

// Judul halaman berdasarkan rute aktif, dipakai di topbar
const PAGE_TITLES = {
  '/admin': 'Tinjauan Sistem',
  '/admin/users': 'Kelola Pengguna',
  '/admin/projects': 'Kelola Portofolio',
  '/admin/violations': 'Log Pelanggaran',
  '/admin/categories': 'Manajemen Filter',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE UNTUK GLOBAL SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], projects: [], violations: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // --- STATE UNTUK MENU AKUN ---
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Panel Admin';

const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[220px]">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold">⚠️</span>
          <p className="font-semibold text-white text-sm">Yakin ingin keluar dari panel admin?</p>
        </div>
        <div className="flex items-center justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
              toast.success('Berhasil keluar dari panel admin.');
            }}
            className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 shadow-sm shadow-red-500/30 transition-colors cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  // Komponen NavLink dengan indikator aktif bergaya "bar"
  const SidebarLink = ({ to, icon, text }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `
        relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
        transition-all duration-300 group
        ${isActive
          ? 'bg-blue-50 text-[#2C71B8] font-bold shadow-sm'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-0.5'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-[#2C71B8] transition-all duration-300 ${
              isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
            }`}
          />
          <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
            {icon}
          </span>
          {text}
        </>
      )}
    </NavLink>
  );

  // --- LOGIKA DEBOUNCE & FETCH PENCARIAN GLOBAL ---
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          // Menembak 3 API sekaligus secara paralel agar cepat
          const [usersRes, projectsRes, violationsRes] = await Promise.all([
            api.get('/users').catch(() => ({ data: [] })),
            api.get('/admin/projects').catch(() => ({ data: { data: [] } })),
            api.get('/admin/violations').catch(() => ({ data: { data: [] } })),
          ]);

          const query = searchQuery.toLowerCase();

          // Memfilter data di sisi klien (Ambil maksimal 3 teratas per kategori)
          const matchedUsers = (usersRes.data || []).filter(u =>
            u.nama_user?.toLowerCase().includes(query) ||
            u.nim?.toLowerCase().includes(query)
          ).slice(0, 3);

          const matchedProjects = (projectsRes.data?.data || []).filter(p =>
            p.judul_project?.toLowerCase().includes(query) ||
            p.kategori_id?.toLowerCase().includes(query) ||
            (p.user?.nama_user || p.User?.nama_user || '').toLowerCase().includes(query)
          ).slice(0, 3);

          const matchedViolations = (violationsRes.data?.data || []).filter(v =>
            v.entitas_nama?.toLowerCase().includes(query) ||
            v.tipe_entitas?.toLowerCase().includes(query) ||
            (v.user?.nama_user || v.User?.nama_user || '').toLowerCase().includes(query)
          ).slice(0, 3);

          setSearchResults({
            users: matchedUsers,
            projects: matchedProjects,
            violations: matchedViolations
          });
        } catch (error) {
          console.error("Gagal melakukan pencarian global:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowDropdown(false);
        setSearchResults({ users: [], projects: [], violations: [] });
      }
    }, 400); // Tunggu 400ms setelah admin berhenti mengetik baru mencari

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Menutup dropdown pencarian & menu akun jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler saat item pencarian diklik
  const handleResultClick = (path) => {
    navigate(path);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const hasResults = searchResults.users.length > 0 || searchResults.projects.length > 0 || searchResults.violations.length > 0;
  const totalResults = searchResults.users.length + searchResults.projects.length + searchResults.violations.length;

  return (
    <div className="min-h-screen bg-transparent flex">
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-dropdown { animation: dropdownIn 0.18s ease both; }
        .anim-row { animation: rowIn 0.2s ease both; }
        .anim-page { animation: pageIn 0.25s ease both; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-transparent border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-8 border-b border-gray-50 shrink-0">
          <h1 className="font-title font-black text-xl tracking-tight flex items-center">
            {/* <img src={logoHeader} alt="Logo" className="w-30" /> */}
            <span className="text-[#2C71B8]">Admin</span>Panel
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 pb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-700">Menu Utama</p>
          <SidebarLink to="/admin" icon={<TrendingUp size={18} />} text="Dashboard" />
          <SidebarLink to="/admin/users" icon={<Users size={18} />} text="Kelola Pengguna" />
          <SidebarLink to="/admin/projects" icon={<FolderGit2 size={18} />} text="Kelola Portofolio" />
          <SidebarLink to="/admin/violations" icon={<ShieldAlert size={18} />} text="Log Pelanggaran" />
          <SidebarLink to="/admin/categories" icon={<Layers size={18} />} text="Kelola Filter" />
        </nav>

        <div className="p-4 border-t border-gray-50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-all hover:gap-4"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-h-screen relative">

        {/* --- TOPBAR --- */}
        <header className="h-16 bg-transparent backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">{pageTitle}</h2>

          <div className="flex items-center gap-4">

            {/* --- GLOBAL SEARCH BAR --- */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID, User, Project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                  className="pl-9 pr-10 py-2 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:border-[#2C71B8]/40 transition-all placeholder-gray-400"
                />
                {isSearching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C71B8] animate-spin" />
                )}
              </div>

              {/* --- DROPDOWN HASIL PENCARIAN --- */}
              {showDropdown && (
                <div className="anim-dropdown absolute top-full right-0 mt-2 w-[350px] bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50">

                  {isSearching ? (
                    <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                      <Loader2 size={18} className="text-[#2C71B8] animate-spin" />
                      Mencari data...
                    </div>
                  ) : !hasResults ? (
                    <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                      <Search size={22} className="text-gray-200" />
                      Tidak ada data yang cocok dengan "{searchQuery}"
                    </div>
                  ) : (
                    <div className="max-h-[70vh] overflow-y-auto overscroll-contain py-2">
                      <p className="px-4 pb-1.5 text-[10px] font-semibold text-gray-400">{totalResults} hasil ditemukan</p>

                      {/* Hasil Pencarian Users */}
                      {searchResults.users.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 flex items-center gap-1.5">
                            <Users size={11} /> Pengguna
                          </h4>
                          {searchResults.users.map((u, i) => (
                            <button
                              key={u.id}
                              style={{ animationDelay: `${i * 30}ms` }}
                              onClick={() => handleResultClick('/admin/users')}
                              className="anim-row w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-800">{u.nama_user}</p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{u.nim}</p>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2C71B8] group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hasil Pencarian Projects */}
                      {searchResults.projects.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 flex items-center gap-1.5">
                            <FolderGit2 size={11} /> Project
                          </h4>
                          {searchResults.projects.map((p, i) => (
                            <button
                              key={p.id}
                              style={{ animationDelay: `${i * 30}ms` }}
                              onClick={() => handleResultClick('/admin/projects')}
                              className="anim-row w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between group transition-colors"
                            >
                              <div className="truncate pr-4">
                                <p className="text-sm font-bold text-gray-800 truncate">{p.judul_project || 'Tanpa Judul'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{p.user?.nama_user || p.User?.nama_user || 'Anonim'} • {p.kategori_id}</p>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2C71B8] group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hasil Pencarian Violations */}
                      {searchResults.violations.length > 0 && (
                        <div>
                          <h4 className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 flex items-center gap-1.5">
                            <ShieldAlert size={11} /> Log Pelanggaran
                          </h4>
                          {searchResults.violations.map((v, i) => (
                            <button
                              key={v.id}
                              style={{ animationDelay: `${i * 30}ms` }}
                              onClick={() => handleResultClick('/admin/violations')}
                              className="anim-row w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center justify-between group transition-colors"
                            >
                              <div className="truncate pr-4">
                                <p className="text-sm font-bold text-red-600 truncate">{v.entitas_nama || `ID: ${v.entitas_id}`}</p>
                                <p className="text-xs text-red-400 mt-0.5">{v.tipe_entitas} • {v.status}</p>
                              </div>
                              <ChevronRight size={16} className="text-red-200 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- MENU AKUN --- */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setShowAccountMenu((v) => !v)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#2C71B8] to-[#4A8FE7] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                  AD
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAccountMenu && (
                <div className="anim-dropdown absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 p-1.5">
                  <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-gray-50 mb-1">
                    <UserCircle2 size={20} className="text-gray-300" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Administrator</p>
                      <p className="text-[10px] text-gray-400">Akses penuh sistem</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium text-xs transition-colors"
                  >
                    <LogOut size={14} /> Keluar Sistem
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- DYNAMIC PAGES (Outlet) --- */}
        <div key={location.pathname} className="anim-page flex-1 p-6 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>

      </main>
    </div>
  );
}