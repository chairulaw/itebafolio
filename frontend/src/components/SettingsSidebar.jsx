import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Briefcase, ArrowLeft, LogOut, ChevronRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // --- FUNGSI LOGOUT DENGAN CUSTOM TOAST INTERAKTIF ---
  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="font-semibold text-white text-sm">Yakin ingin keluar?</p>
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
              
              // Hapus token dan data user
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Muat ulang aplikasi ke beranda
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 shadow-sm shadow-red-500/30 transition-colors cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // Toast tetap terbuka sampai user memilih
      position: 'top-center',
    });
  };

  return (
    <div className="w-full md:w-72 shrink-0">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sticky top-32 space-y-2 h-fit">
        <h3 className="px-4 pt-2 pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Pengaturan
        </h3>

        <SidebarLink
          to="/profile/account"
          icon={<User size={18} />}
          label="Akun saya"
          active={isActive('/profile/account')}
        />

        <SidebarLink
          to="/profile/settings"
          icon={<Briefcase size={18} />}
          label="Edit profil"
          active={isActive('/profile/settings')}
        />

        <div className="my-4 border-t border-gray-50"></div>

        <button
          onClick={() => navigate('/profile')}
          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:translate-x-1 transition-transform" />
          <span>Kembali</span>
        </button>
        <button
          onClick={handleLogout}
          className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
        active ? 'bg-blue-50 text-[#2C71B8]' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-[#2C71B8]' : 'text-gray-400 group-hover:text-gray-600'}`}>
          {icon}
        </span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight size={14} className={`${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
    </Link>
  );
}