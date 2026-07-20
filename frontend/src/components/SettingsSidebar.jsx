import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Tambahkan useNavigate
import { User, Briefcase, ArrowLeft, LogOut, ChevronRight } from 'lucide-react';

export default function SettingsSidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // Inisialisasi navigate

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token dari browser
    localStorage.removeItem('user');  // Hapus data user

    // Gunakan window.location.href agar aplikasi termuat ulang dan state header ikut ter-reset
    window.location.href = '/';
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
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${active ? 'bg-blue-50 text-[#2C71B8]' : 'text-gray-500 hover:bg-gray-50'
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