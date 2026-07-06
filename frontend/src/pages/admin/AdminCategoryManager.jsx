import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, UploadCloud, ImageIcon, 
  Layers, FolderPlus, Sparkles, HelpCircle, X 
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // State Form Input
  const [namaKategori, setNamaKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // State untuk Mode Edit
  const [editingId, setEditingId] = useState(null);

  // 1. Ambil semua kategori saat halaman dimuat
  const fetchCategories = async () => {
    setIsFetching(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Handle Perubahan File Gambar Banner
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // 3. Handle Submit (Tambah atau Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKategori.trim()) return alert("Nama kategori/filter wajib diisi!");

    setIsLoading(true);
    const formData = new FormData();
    formData.append('nama_kategori', namaKategori);
    formData.append('deskripsi', deskripsi);
    if (bannerFile) {
      formData.append('image', bannerFile);
    }

    try {
      if (editingId) {
        // Mode Update
        await api.put(`/categories/${editingId}`, formData);
        alert("Filter/Kategori berhasil diperbarui!");
      } else {
        // Mode Tambah Baru
        await api.post('/categories', formData);
        alert("Filter/Kategori baru berhasil ditambahkan!");
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      alert("Aksi gagal: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Set Form ke Mode Edit
  const handleEditInit = (category) => {
    setEditingId(category.id);
    setNamaKategori(category.nama_kategori);
    setDeskripsi(category.deskripsi || '');
    if (category.image) {
      setBannerPreview(`http://localhost:3000/uploads/${category.image}`);
    } else {
      setBannerPreview(null);
    }
    setBannerFile(null);
  };

  // 5. Handle Hapus Kategori
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus filter "${name}"? Proyek dengan kategori ini mungkin akan kehilangan relasinya.`)) return;

    try {
      await api.delete(`/categories/${id}`);
      alert("Kategori berhasil dihapus!");
      fetchCategories();
    } catch (error) {
      alert("Gagal menghapus: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNamaKategori('');
    setDeskripsi('');
    setBannerFile(null);
    setBannerPreview(null);
  };

  if (isFetching) return <div className="p-10 text-center text-sm font-bold text-slate-400">Memuat konfigurasi filter...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      
      {/* HEADER MANAGEMENT */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 bg-blue-50 text-[#2C71B8] rounded-2xl flex items-center justify-center shadow-sm">
          <Layers size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Filter &amp; Kategori</h1>
          <p className="text-slate-400 text-xs font-medium">Tambah atau modifikasi halaman filter katalog tanpa mengubah kode program.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COL 1: FORM INPUT */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              {editingId ? <Edit3 size={16} className="text-amber-500" /> : <FolderPlus size={16} className="text-[#2C71B8]" />}
              {editingId ? 'Edit Filter' : 'Tambah Filter Baru'}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline">
                <X size={12} /> Batal Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Nama Kategori / Filter *</label>
            <input 
              type="text" 
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              placeholder="Cth: Data Science, Animasi 3D"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2C71B8]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Deskripsi Banner Halaman</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Berikan penjelasan singkat mengenai ruang lingkup karya ini saat halaman dibuka..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2C71B8] min-h-[80px] resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Gambar Background Banner</label>
            <label className="group relative h-32 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-[#2C71B8] hover:bg-white flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              
              {bannerPreview ? (
                <img src={bannerPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <>
                  <UploadCloud size={24} className="text-slate-400 group-hover:text-[#2C71B8] transition-colors" />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#2C71B8]">Pilih File Banner</span>
                </>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              editingId 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/25' 
                : 'bg-gradient-to-r from-[#2C71B8] to-[#4A8FE7] shadow-blue-500/25'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Memproses...' : editingId ? 'Simpan Perubahan' : 'Buat Filter Baru'}
          </button>
        </form>

        {/* COL 2: DAFTAR FILTER YANG SUDAH ADA */}
        <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-3 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Daftar Kategori Terdaftar ({categories.length})
          </h3>

          {categories.length > 0 ? (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-white flex items-center justify-center">
                      {category.image ? (
                        <img src={`http://localhost:3000/uploads/${category.image}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{category.nama_kategori}</p>
                      <p className="text-xs text-slate-400 font-medium truncate max-w-[280px] mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        URL slug: /filter/{category.slug}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditInit(category)}
                      className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-colors shadow-sm"
                      title="Edit Kategori"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id, category.nama_kategori)}
                      className="p-2 bg-white border border-red-100 rounded-xl text-red-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                      title="Hapus Kategori"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center">
              <HelpCircle size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-400">Belum ada kategori kustom.</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Gunakan form di sebelah kiri untuk mendaftarkan filter pencarian baru.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}