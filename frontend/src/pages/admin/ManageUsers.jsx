import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, UserX, Edit2, X, Users as UsersIcon, Shield, Key, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ROLE_BADGE_STYLES = {
  Admin: "bg-purple-50 text-purple-700 border-purple-100",
  Pengunjung: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Mahasiswa: "bg-blue-50 text-blue-700 border-blue-100",
};

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 1. FETCH DATA DARI DATABASE
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const formattedUsers = response.data.data.map(u => ({
        id: u.id,
        nama_user: u.nama_user || 'Anonim',
        email: u.email || '',
        nim: u.nim || '',
        prodi: u.prodi || 'Sistem Informasi',
        angkatan: u.angkatan || '',
        bio: u.bio || '',
        website: u.website || '',
        no_wa: u.no_wa || '',
        email_kontak: u.email_kontak || '',
        role: u.role_id === 1 ? 'Admin' : u.role_id === 3 ? 'Pengunjung' : 'Mahasiswa',
        status: 'AKTIF',
        role_id: u.role_id
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. FUNGSI HAPUS PENGGUNA
  const handleDeleteUser = (id, nama) => {
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[220px]">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold">⚠️</span>
          <div className="flex flex-col">
            <p className="font-semibold text-white text-sm">Hapus permanen {nama}?</p>
            <p className="text-xs text-white/70">Semua karya miliknya juga akan hilang!</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id); 
              const toastId = toast.loading("Menghapus pengguna...");
              try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
                toast.success(`Pengguna ${nama} berhasil dihapus.`, { id: toastId });
              } catch (error) {
                toast.error("Gagal menghapus pengguna.", { id: toastId });
              }
            }}
            className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 shadow-sm shadow-red-500/30 transition-colors cursor-pointer"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, 
      position: 'top-center',
    });
  };

  // 3. FUNGSI BUKA MODAL EDIT
  const handleEditClick = (user) => {
    setSelectedUser({ ...user, password: '' }); 
    setIsEditModalOpen(true);
  };

  // 4. FUNGSI SIMPAN PERUBAHAN
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const emailLower = selectedUser.email.toLowerCase();
    
    // --- VALIDASI EMAIL AKURAT BERDASARKAN ROLE ---
    if (selectedUser.role === 'Mahasiswa' && !emailLower.endsWith('@student.iteba.ac.id')) {
      return toast.error("Mahasiswa wajib menggunakan domain @student.iteba.ac.id!");
    }
    
    if (selectedUser.role === 'Admin' && !emailLower.endsWith('@iteba.ac.id')) {
      return toast.error("Admin wajib menggunakan domain @iteba.ac.id!");
    }

    if (selectedUser.role === 'Pengunjung' && emailLower.includes('@iteba.ac.id')) {
      return toast.error("Pengunjung umum tidak diizinkan menggunakan email kampus!");
    }

    if (selectedUser.role === 'Mahasiswa' && !selectedUser.email_kontak) {
      return toast.error("Email Kontak (Publik) wajib diisi untuk Mahasiswa!");
    }

    const toastId = toast.loading("Menyimpan perubahan...");
    try {
      let newRoleId = 2; // Default Mahasiswa
      if (selectedUser.role === 'Admin') newRoleId = 1;
      if (selectedUser.role === 'Pengunjung') newRoleId = 3;

      const isKreator = newRoleId === 1 || newRoleId === 2;

      const payload = {
        nama_user: selectedUser.nama_user,
        email: selectedUser.email,
        bio: selectedUser.bio,
        no_wa: selectedUser.no_wa,
        role_id: newRoleId,
        // Bersihkan data spesifik jika diubah menjadi Pengunjung
        nim: isKreator ? selectedUser.nim : null,
        prodi: isKreator ? selectedUser.prodi : null,
        angkatan: isKreator ? selectedUser.angkatan : null,
        website: isKreator ? selectedUser.website : null,
        email_kontak: isKreator ? selectedUser.email_kontak : null,
      };

      if (selectedUser.password && selectedUser.password.trim() !== "") {
        payload.password = selectedUser.password;
      }

      await api.put(`/admin/users/${selectedUser.id}`, payload);

      fetchUsers(); 
      setIsEditModalOpen(false); 
      toast.success("Data pengguna berhasil diperbarui!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan server.", { id: toastId });
    }
  };

  const filteredUsers = users.filter(user =>
    String(user.nama_user).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(user.nim).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 relative space-y-7">
      {/* --- PAGE HEADER --- */}
      <div className="rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] px-6 py-6 md:px-8 md:py-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2C71B8]/10">
                <UsersIcon size={18} className="text-[#2C71B8]" />
              </span>
              <h1 className="text-xl md:text-[22px] font-bold text-gray-900 tracking-tight">
                User Access Management Center
              </h1>
            </div>
            <p className="text-[13px] text-gray-500 ml-[46px]">
              Manajemen akun mahasiswa, pengunjung, dan hak akses administrator.
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIM atau Nama..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/40 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* --- USER TABLE --- */}
      <div className="rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3 text-center text-gray-500">Memuat data pengguna...</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100/80">
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">NIM / Prodi</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/80 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C71B8] to-[#1d4f85] text-white flex items-center justify-center font-bold text-[11px] ring-2 ring-white shadow-sm shrink-0">
                          {user.nama_user.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-semibold text-gray-900">{user.nama_user}</p>
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${ROLE_BADGE_STYLES[user.role] || ROLE_BADGE_STYLES.Mahasiswa}`}>
                              {user.role === 'Admin' ? 'ADMIN' : user.role === 'Pengunjung' ? 'PENGUNJUNG' : 'MAHASISWA'}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-gray-400 mt-0.5">{user.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'Pengunjung' ? (
                        <p className="text-[13px] text-gray-400 italic font-medium">Bukan Mahasiswa</p>
                      ) : (
                        <>
                          <p className="text-[13px] text-gray-700 font-medium font-mono tracking-wide">{user.nim || 'Belum diatur'}</p>
                          <p className="text-[10.5px] text-gray-400 uppercase tracking-wider mt-0.5">{user.prodi}</p>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-lg">
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2.5 text-gray-400 bg-transparent border border-transparent hover:text-[#2C71B8] hover:bg-[#2C71B8]/8 hover:border-[#2C71B8]/15 hover:scale-105 active:scale-95 rounded-xl transition-all duration-200"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.nama_user)}
                          className="p-2.5 text-gray-400 bg-transparent border border-transparent hover:text-red-600 hover:bg-red-50 hover:border-red-100 hover:scale-105 active:scale-95 rounded-xl transition-all duration-200"
                          title="Hapus Pengguna"
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL EDIT PENGGUNA --- */}
      {isEditModalOpen && selectedUser && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 md:p-6">
          <div className="flex flex-col max-h-[90vh] bg-white/90 backdrop-blur-2xl rounded-[28px] w-full max-w-xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)] border border-white/60 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="shrink-0 flex items-center justify-between px-7 py-6 border-b border-gray-100/80 bg-white/40">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2C71B8] mb-1">Enterprise Panel</p>
                <h3 className="text-[19px] font-bold text-gray-900 tracking-tight">Edit Pengguna Lengkap</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-white/70 hover:bg-white p-2.5 rounded-full transition-all duration-200 border border-gray-200/80 shadow-sm shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="overflow-y-auto p-7 space-y-6">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-2">
                  <Shield size={16} className="text-[#2C71B8]" />
                  <h4 className="text-sm font-bold">1. Hak Akses (Role)</h4>
                </div>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/30 focus:border-[#2C71B8] transition-all duration-200 appearance-none font-bold text-[#2C71B8]"
                >
                  <option value="Mahasiswa">Mahasiswa ITEBA</option>
                  <option value="Admin">Administrator</option>
                  <option value="Pengunjung">Pengunjung Umum</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-2">
                  <Key size={16} className="text-[#2C71B8]" />
                  <h4 className="text-sm font-bold">2. Informasi Akun</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Alamat Email (Kampus)</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Password Baru</label>
                    <input
                      type="password"
                      value={selectedUser.password || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                      placeholder="Kosongkan jika tidak diubah"
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-800 border-b border-gray-100 pb-2">
                  <UserCircle size={16} className="text-[#2C71B8]" />
                  <h4 className="text-sm font-bold">3. Data Profil</h4>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    type="text"
                    value={selectedUser.nama_user}
                    onChange={(e) => setSelectedUser({ ...selectedUser, nama_user: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                {selectedUser.role !== 'Pengunjung' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">NIM</label>
                        <input
                          type="text"
                          value={selectedUser.nim}
                          onChange={(e) => setSelectedUser({ ...selectedUser, nim: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200/80 rounded-xl text-[14px] text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Program Studi</label>
                        <select
                          value={selectedUser.prodi}
                          onChange={(e) => setSelectedUser({ ...selectedUser, prodi: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 transition-all duration-200 appearance-none"
                        >
                          <option value="Sistem Informasi">Sistem Informasi</option>
                          <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                          <option value="Teknik Komputer">Teknik Komputer</option>
                          <option value="Matematika">Matematika</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Angkatan</label>
                        <input
                          type="number"
                          value={selectedUser.angkatan}
                          placeholder="Cth: 2022"
                          onChange={(e) => setSelectedUser({ ...selectedUser, angkatan: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Kontak (Publik)</label>
                        <input
                          type="email"
                          value={selectedUser.email_kontak}
                          placeholder="email.pribadi@gmail.com"
                          onChange={(e) => setSelectedUser({ ...selectedUser, email_kontak: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Website / Portfolio</label>
                        <input
                          type="text"
                          value={selectedUser.website}
                          placeholder="https://..."
                          onChange={(e) => setSelectedUser({ ...selectedUser, website: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={selectedUser.no_wa}
                    placeholder="08123456789"
                    onChange={(e) => setSelectedUser({ ...selectedUser, no_wa: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bio Singkat</label>
                  <textarea
                    value={selectedUser.bio}
                    rows={2}
                    placeholder="Deskripsi singkat mengenai pengguna..."
                    onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/80 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/50 focus:bg-white transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100/80">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-[13.5px] font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-[13.5px] font-semibold text-white bg-[#2C71B8] hover:bg-[#235a93] rounded-xl shadow-[0_8px_20px_-8px_rgba(44,113,184,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}