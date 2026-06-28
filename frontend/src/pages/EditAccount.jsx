import React, { useState, useEffect } from "react";
import { Mail, ShieldCheck, KeyRound } from "lucide-react";
import api from '../utils/api';

export default function EditAccount() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ambil email user untuk ditampilkan (readonly)
    const fetchEmail = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await api.get(`/users`);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Gagal mengambil email:", error);
      }
    };
    fetchEmail();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert("Password dan Konfirmasi Password tidak cocok!");
    }

    setIsLoading(true);
    try {
      // Pastikan endpoint ini sudah dibuat di rute backend sesuai panduan di atas
      await api.put('/users/change-password', { newPassword });
      alert("Kata sandi berhasil diperbarui!");
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert("Gagal memperbarui kata sandi: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fit-content bg-[#FBFBFB] flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto px-6 md:px-8 pt-10 pb-20 flex flex-col md:flex-row gap-10 w-full">
        <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50">
            <h2 className="text-2xl font-title font-black text-gray-900 tracking-tight">
              Keamanan Akun
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              Kelola akses email dan kata sandi Anda
            </p>
          </div>

          <div className="p-10">
            <form className="space-y-10" onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <SectionTitle icon={<Mail size={16} />} title="Alamat Email" />
                <div className="relative group max-w-md">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Email Institusi (Terkunci)
                  </label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={email || "Memuat email..."}
                      className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-400 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400 ml-1 italic">
                    * Email utama dikelola oleh administrasi kampus.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <SectionTitle
                  icon={<ShieldCheck size={16} />}
                  title="Ganti Kata Sandi"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputGroup
                    label="Password Baru"
                    placeholder="Masukkan password baru"
                    type="password"
                    icon={<KeyRound size={16} />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <InputGroup
                    label="Konfirmasi Password"
                    placeholder="Ulangi password baru"
                    type="password"
                    icon={<ShieldCheck size={16} />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-30 border-t border-gray-50">
                <button
                  type="button"
                  className="px-8 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-3.5 bg-[#2C71B8] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:bg-blue-300"
                >
                  {isLoading ? "Memproses..." : "Perbarui Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
      <div className="text-[#2C71B8]">{icon}</div>
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );
}

function InputGroup({ label, placeholder, type = "text", icon = null, value, onChange }) {
  return (
    <div className="relative group">
      <label className="block text-[10px] font-black text-[#2C71B8] uppercase tracking-widest mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#2C71B8]">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={`w-full ${icon ? "pl-12" : "pl-5"} pr-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:bg-white transition-all placeholder:text-gray-300 font-medium`}
        />
      </div>
    </div>
  );
}