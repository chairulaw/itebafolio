import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, LogOut, Camera, Globe, Phone, Briefcase, GraduationCap, ChevronRight, X, Check
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg');
  });
}

export default function EditProfile() {
  const [formData, setFormData] = useState({
    nama_user: '', nim: '', prodi: '', angkatan: '', bio: '', website: '', no_wa: '', avatar: ''
  });
  const [userRole, setUserRole] = useState(null);

  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const [croppedBlob, setCroppedBlob] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return navigate('/login');

      try {
        const response = await api.get('/users');
        setUserRole(response.data.role_id);
        
        setFormData({
          nama_user: response.data.nama_user || '',
          nim: response.data.nim || '',
          prodi: response.data.prodi || '',
          angkatan: response.data.angkatan || '',
          bio: response.data.bio || '',
          website: response.data.website || '',
          no_wa: response.data.no_wa || '',
          avatar: response.data.avatar || ''
        });
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImageToCrop(fileUrl);
      setIsCropping(true);
      e.target.value = null;
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

      setCroppedBlob(croppedImageBlob);
      setAvatarPreview(croppedImageUrl);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));

      const submitData = new FormData();
      submitData.append('nama_user', formData.nama_user);
      
      // Keamanan Tambahan: Hanya kirim data akademik jika user adalah Admin (Role 1)
      if (userRole === 1) {
        submitData.append('nim', formData.nim);
        submitData.append('prodi', formData.prodi);
        submitData.append('angkatan', formData.angkatan);
      }
      
      submitData.append('bio', formData.bio);
      submitData.append('website', formData.website);
      submitData.append('no_wa', formData.no_wa);

      if (croppedBlob) {
        submitData.append('avatar', croppedBlob, 'avatar.jpg');
      }

      await api.put(`/users/${userData.id}`, submitData);

      toast.success("Profil berhasil diperbarui!");
      navigate('/profile');
    } catch (error) {
      toast.error("Gagal memperbarui profil: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const displayAvatar = avatarPreview
    ? avatarPreview
    : (formData.avatar ? `http://localhost:3000/uploads/${formData.avatar}` : DEFAULT_AVATAR);

  // LOGIKA PENGUNCIAN: Jika role bukan 1 (Admin), maka input akademik akan dikunci
  const isAkademikDisabled = userRole !== 1;

  return (
    <>
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col relative">
        <main className="flex-1 max-w-6xl mx-auto px-6 md:px-8 pt-10 pb-20 flex flex-col md:flex-row gap-10 w-full">

          <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50">
              <h2 className="text-2xl font-title font-black text-gray-900 tracking-tight">Edit Profil</h2>
              <p className="text-sm text-gray-400 font-medium">Atur informasi publik dan identitas Anda</p>
            </div>

            <div className="p-10">
              <div className="flex flex-col items-center mb-12">
                <input
                  type="file"
                  id="avatarUpload"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                />
                <div
                  className="relative group cursor-pointer w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden"
                  onClick={() => document.getElementById('avatarUpload').click()}
                >
                  <img
                    src={displayAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Klik untuk ganti foto</p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <SectionTitle icon={<User size={16} />} title="Informasi Dasar" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup name="nama_user" value={formData.nama_user} onChange={handleChange} label="Nama Lengkap" placeholder="Nama Lengkap" />
                  </div>
                </div>

                {/* SAKLAR LOGIKA: Sembunyikan Info Akademik jika Pengunjung (role_id === 3) */}
                {userRole !== 3 && (
                  <div className="space-y-6 pt-4">
                    <SectionTitle icon={<GraduationCap size={16} />} title="Informasi Akademik" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* NIM dikunci untuk mahasiswa */}
                      <InputGroup name="nim" value={formData.nim} onChange={handleChange} label="Nomor Induk Mahasiswa (NIM)" placeholder="12345678" type="number" disabled={isAkademikDisabled} />
                      
                      {/* Dropdown Prodi dikunci untuk mahasiswa */}
                      <div className="relative group">
                        <label className="block text-[10px] font-black text-[#2C71B8] uppercase tracking-widest mb-2 ml-1">Program Studi</label>
                        <select
                          name="prodi"
                          value={formData.prodi}
                          onChange={handleChange}
                          disabled={isAkademikDisabled}
                          className={`w-full px-5 py-3.5 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 transition-all font-medium ${
                            isAkademikDisabled 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'bg-gray-50/50 focus:bg-white text-gray-700 cursor-pointer'
                          }`}
                        >
                          <option value="" disabled>Pilih Program Studi</option>
                          <option value="Sistem Informasi">Sistem Informasi</option>
                          <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                          <option value="Teknik Komputer">Teknik Komputer</option>
                          <option value="Matematika">Matematika</option>
                        </select>
                      </div>

                      {/* Angkatan dikunci untuk mahasiswa */}
                      <InputGroup name="angkatan" value={formData.angkatan} onChange={handleChange} label="Angkatan" placeholder="2022" type="number" disabled={isAkademikDisabled} />
                    </div>
                  </div>
                )}

                <div className="space-y-6 pt-4">
                  <SectionTitle icon={<User size={16} />} title="Tentang Dirimu" />
                  <div>
                    <label className="block text-[10px] font-black text-[#2C71B8] uppercase tracking-widest mb-2 ml-1">Bio Singkat</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                      className="w-full p-5 bg-gray-50/50 border border-gray-100 rounded-3xl h-36 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <SectionTitle icon={<Globe size={16} />} title="Kontak & Media" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup name="website" value={formData.website} onChange={handleChange} label="Website / Portfolio" placeholder="www.websiteanda.com" icon={<Globe size={14} />} />
                    <InputGroup name="no_wa" value={formData.no_wa} onChange={handleChange} label="Nomor WhatsApp" placeholder="08123456789" icon={<Phone size={14} />} type="number" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-10 border-t border-gray-50">
                  <button type="button" onClick={() => navigate('/profile')} className="px-8 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    Batalkan
                  </button>
                  <button type="submit" disabled={isLoading} className="px-10 py-3.5 bg-[#2C71B8] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:bg-blue-300">
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL CROPPER OVERLAY */}
      {isCropping && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-gray-800">Sesuaikan Foto</h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={20} />
              </button>
            </div>

            <div className="relative h-80 w-full bg-gray-900">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="p-5 bg-white space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full mt-2 accent-[#2C71B8]"
                />
              </div>
              <button
                onClick={handleCropConfirm}
                className="w-full flex justify-center items-center gap-2 py-3.5 bg-[#2C71B8] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95"
              >
                <Check size={18} />
                Terapkan Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Sub-komponen
function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
      <div className="text-[#2C71B8]">{icon}</div>
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

// Komponen InputGroup
function InputGroup({ label, placeholder, type = "text", icon = null, name, value, onChange, disabled = false }) {
  return (
    <div className="relative group">
      <label className="block text-[10px] font-black text-[#2C71B8] uppercase tracking-widest mb-2 ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-12' : 'pl-5'} pr-5 py-3.5 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 transition-all font-medium ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50/50 focus:bg-white placeholder:text-gray-300'
          }`}
        />
      </div>
    </div>
  );
}