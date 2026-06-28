import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  FolderGit2,
  ShieldAlert,
  Search,
  LogOut,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { logoHeader } from '../../assets/Assets';
import api from '../../utils/api'; // Pastikan path ini benar sesuai struktur Anda

export default function AdminLayout() {
  const navigate = useNavigate();
  
  // --- STATE UNTUK GLOBAL SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], projects: [], violations: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar dari panel admin?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Komponen NavLink
  const SidebarLink = ({ to, icon, text }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `
        w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300
        ${isActive
          ? 'bg-blue-50 text-[#2C71B8] font-bold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      {icon} {text}
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
            api.get('/admin/violations').catch(() => ({ data: { data: [] } }))
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

  // Menutup dropdown jika user mengklik area di luar search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
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

  return (
    <div className="min-h-screen bg-transparent flex">

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-transparent border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-8 border-b border-gray-50 shrink-0">
          <h1 className="font-title font-black text-xl tracking-tight">
            <img src={logoHeader} alt="Logo" className="w-30" />
            <span className="text-[#2C71B8]">Admin</span>Panel
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarLink to="/admin" icon={<TrendingUp size={18} />} text="Dashboard" />
          <SidebarLink to="/admin/users" icon={<Users size={18} />} text="Kelola Pengguna" />
          <SidebarLink to="/admin/projects" icon={<FolderGit2 size={18} />} text="Kelola Portofolio" />
          <SidebarLink to="/admin/violations" icon={<ShieldAlert size={18} />} text="Log Pelanggaran" />
        </nav>

        <div className="p-4 border-t border-gray-50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-h-screen relative">

        {/* --- TOPBAR --- */}
        <header className="h-16 bg-transparent backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Tinjauan Sistem</h2>
          
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
                  className="pl-9 pr-10 py-2 w-72 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 transition-all placeholder-gray-400"
                />
                {isSearching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>

              {/* --- DROPDOWN HASIL PENCARIAN --- */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-[350px] bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {isSearching ? (
                    <div className="p-8 text-center text-sm text-gray-500">Mencari data...</div>
                  ) : !hasResults ? (
                    <div className="p-8 text-center text-sm text-gray-500">
                      Tidak ada data yang cocok dengan "{searchQuery}"
                    </div>
                  ) : (
                    <div className="max-h-[70vh] overflow-y-auto overscroll-contain py-2">
                      
                      {/* Hasil Pencarian Users */}
                      {searchResults.users.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Pengguna</h4>
                          {searchResults.users.map(u => (
                            <button 
                              key={u.id} 
                              onClick={() => handleResultClick('/admin/users')}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-800">{u.nama_user}</p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{u.nim}</p>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2C71B8] transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hasil Pencarian Projects */}
                      {searchResults.projects.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Project</h4>
                          {searchResults.projects.map(p => (
                            <button 
                              key={p.id} 
                              onClick={() => handleResultClick('/admin/projects')}
                              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between group transition-colors"
                            >
                              <div className="truncate pr-4">
                                <p className="text-sm font-bold text-gray-800 truncate">{p.judul_project || 'Tanpa Judul'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{p.user?.nama_user || p.User?.nama_user || 'Anonim'} • {p.kategori_id}</p>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2C71B8] transition-colors shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hasil Pencarian Violations */}
                      {searchResults.violations.length > 0 && (
                        <div>
                          <h4 className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Log Pelanggaran</h4>
                          {searchResults.violations.map(v => (
                            <button 
                              key={v.id} 
                              onClick={() => handleResultClick('/admin/violations')}
                              className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center justify-between group transition-colors"
                            >
                              <div className="truncate pr-4">
                                <p className="text-sm font-bold text-red-600 truncate">{v.entitas_nama || `ID: ${v.entitas_id}`}</p>
                                <p className="text-xs text-red-400 mt-0.5">{v.tipe_entitas} • {v.status}</p>
                              </div>
                              <ChevronRight size={16} className="text-red-200 group-hover:text-red-500 transition-colors shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-8 h-8 bg-[#2C71B8] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
              AD
            </div>
          </div>
        </header>

        {/* --- DYNAMIC PAGES (Outlet) --- */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>

      </main>
    </div>
  );
}