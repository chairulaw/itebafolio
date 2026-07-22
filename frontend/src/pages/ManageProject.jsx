import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  X,
  AlertCircle,
  Camera,
  Save,
  Send,
  Trash2,
  AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ManageProject() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isEditMode = Boolean(projectId);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const [formData, setFormData] = useState({
    title: '',
    category: '', 
    description: '',
    prototypeLink: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [mainMediaFiles, setMainMediaFiles] = useState([]);
  const [additionalMediaFiles, setAdditionalMediaFiles] = useState([]);

  const [categories, setCategories] = useState([]); // TAMBAHAN: Menyimpan kategori dari database
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // TAMBAHAN: Mengambil daftar kategori dinamis dari Database
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Gagal mengambil kategori:", err));
  }, []);

  // --- KUNCI KEAMANAN BERLAPIS (GATEKEEPER) ---
  useEffect(() => {
    if (!localStorage.getItem('token') || !currentUser.id) {
      toast.error("Anda harus login terlebih dahulu.");
      return navigate('/login');
    }

    if (currentUser.role_id === 3) {
      toast.error("Akses ditolak! Fitur unggah karya hanya tersedia untuk akun Mahasiswa.");
      return navigate('/');
    }

    if (!isEditMode) return;

    const fetchProjectData = async () => {
      try {
        const response = await api.get(`/projects`);
        const project = response.data.find(p => p.id === parseInt(projectId));

        if (!project) {
          toast.error("Karya tidak ditemukan.");
          return navigate('/profile');
        }

        if (project.user_id !== currentUser.id && currentUser.role_id !== 1) {
          toast.error("Akses ditolak: Anda hanya dapat mengedit karya Anda sendiri.");
          return navigate('/profile');
        }

        setFormData({
          title: project.judul_project || '',
          category: project.kategori_id || '', 
          description: project.deskripsi || '',
          prototypeLink: project.link_project || '',
        });

        if (project.cover) {
          setThumbnailFile({
            isExisting: true,
            name: project.cover,
            size: 'Bawaan Server',
            preview: `http://localhost:3000/uploads/${project.cover}`
          });
        }

        if (project.highlight) {
          try {
            const parsedHighlight = JSON.parse(project.highlight);
            if (Array.isArray(parsedHighlight)) {
              setMainMediaFiles(parsedHighlight.map(name => ({
                isExisting: true,
                name: name,
                size: 'Tersimpan di server',
                file: null
              })));
            }
          } catch (e) { console.error(e); }
        }

        if (project.additional_media) {
          try {
            const parsedAdditional = JSON.parse(project.additional_media);
            if (Array.isArray(parsedAdditional)) {
              setAdditionalMediaFiles(parsedAdditional.map(name => ({
                isExisting: true,
                name: name,
                size: 'Tersimpan di server',
                file: null
              })));
            }
          } catch (e) { console.error(e); }
        }

      } catch (error) {
        toast.error("Gagal mengambil data project: " + (error.response?.data?.message || error.message));
        navigate('/profile');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProjectData();
  }, [projectId, isEditMode, navigate]);

  const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
  const maxWords = 500;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description') {
      const currentWords = value.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (currentWords > maxWords) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile({
        file: file,
        isExisting: false,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        preview: URL.createObjectURL(file)
      });
    }
  };

  const removeThumbnail = (e) => {
    e.preventDefault();
    setThumbnailFile(null);
  };

  const handleMainMediaChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file: file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      }));
      setMainMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleAdditionalMediaChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file: file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      }));
      setAdditionalMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (type, index) => {
    if (type === 'main') {
      setMainMediaFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setAdditionalMediaFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText size={16} />;
    if (ext === 'mp4') return <Film size={16} />;
    if (ext === 'mp3') return <Music size={16} />;
    return <ImageIcon size={16} />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description) {
      return toast.error("Mohon lengkapi judul, kategori spesifik, dan deskripsi project.");
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('judul_project', formData.title);
      submitData.append('kategori_id', formData.category); 
      submitData.append('deskripsi', formData.description);
      submitData.append('link_project', formData.prototypeLink);

      if (thumbnailFile && !thumbnailFile.isExisting && thumbnailFile.file) {
        submitData.append('cover', thumbnailFile.file);
      } else if (!thumbnailFile && !isEditMode) {
        toast.error("Thumbnail Cover wajib diisi!");
        setIsLoading(false);
        return;
      }

      mainMediaFiles.forEach(media => {
        if (media.file) submitData.append('highlight', media.file);
      });

      additionalMediaFiles.forEach(media => {
        if (media.file) submitData.append('additional_media', media.file);
      });

      if (isEditMode) {
        await api.put(`/projects/${projectId}`, submitData);
        toast.success("Perubahan pada karya berhasil disimpan!");
      } else {
        const res = await api.post(`/projects`, submitData);
        if (res.data.warning) {
          toast.success(`Berhasil diunggah! Note: ${res.data.warning}`);
        } else {
          toast.success("Karya baru berhasil dipublikasikan!");
        }
      }

      navigate('/profile');
    } catch (error) {
      toast.error(`Gagal ${isEditMode ? 'memperbarui' : 'mempublikasikan'} karya: ` + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDelete = () => setDeleteModalOpen(true);
  const cancelDelete = () => setDeleteModalOpen(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${projectId}`);
      setDeleteModalOpen(false);
      navigate('/profile');
      toast.success("Karya berhasil dihapus!");
    } catch (error) {
      toast.error("Gagal menghapus karya: " + (error.response?.data?.message || error.message));
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">Memuat data karya...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col pb-20">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-title font-black text-lg text-gray-900">
              {isEditMode ? 'Edit Portofolio' : 'Buat Portofolio Baru'}
            </h1>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-10">
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-12">
          
          <section className="space-y-6">
            <div className="border-b border-gray-50 pb-3">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Informasi Dasar</h2>
              <p className="text-sm text-gray-400">Berikan detail utama dari portofolio Anda.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Judul Portofolio *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Cth: Redesign Aplikasi Layanan Kampus"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:border-[#2C71B8] transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Kategori Portofolio *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:border-[#2C71B8] transition-all font-medium text-gray-700 appearance-none"
                  >
                    <option value="" disabled>Pilih Kategori Portofolio...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Link Prototype (Opsional)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      name="prototypeLink"
                      value={formData.prototypeLink}
                      onChange={handleChange}
                      placeholder="https://figma.com/..."
                      className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:border-[#2C71B8] transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className=" text-xs font-bold text-gray-700 mb-2 flex justify-between items-end">
                  <span>Deskripsi Portofolio *</span>
                  <span className={`text-[10px] ${wordCount >= maxWords ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {wordCount} / {maxWords} kata
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ceritakan tentang tantangan, proses pembuatan, dan hasil akhir dari Portofolio ini..."
                  className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-40 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 focus:border-[#2C71B8] transition-all font-medium resize-none"
                ></textarea>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-gray-50 pb-3">
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                Thumbnail Cover <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-gray-400">Gambar yang akan tampil di halaman depan dan profil Anda.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <label className="group relative w-full h-48 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50/50 hover:border-[#2C71B8] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden">
                <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={handleThumbnailChange} />

                {thumbnailFile ? (
                  <>
                    <img src={thumbnailFile.preview} alt="Thumbnail Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm flex items-center gap-2"><Camera size={18} /> Ganti Cover</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white group-hover:bg-[#2C71B8] rounded-full shadow-sm flex items-center justify-center mb-3 transition-colors duration-300">
                      <ImageIcon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 group-hover:text-[#2C71B8]">Unggah Thumbnail</p>
                  </>
                )}
              </label>

              {thumbnailFile && (
                <div className="flex-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800 break-all truncate max-w-[200px] sm:max-w-[150px]">{thumbnailFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Ukuran: {thumbnailFile.size}</p>
                    {thumbnailFile.isExisting ? (
                      <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">✓ Memakai gambar sebelumnya</p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">✓ Thumbnail siap digunakan</p>
                    )}
                  </div>
                  <button onClick={removeThumbnail} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition shadow-sm">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-gray-50 pb-3">
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                Highlight Media <span className="text-xs font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full ml-2">Utama</span>
              </h2>
              <p className="text-sm text-gray-400">Media yang akan tampil di carousel/slider utama. (Format: Gambar, PDF, MP4, MP3)</p>
            </div>

            <label className="group relative w-full h-48 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50/50 hover:border-[#2C71B8] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden">
              <input type="file" multiple accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf, video/mp4, audio/mpeg" className="hidden" onChange={handleMainMediaChange} />
              <div className="w-14 h-14 bg-white group-hover:bg-[#2C71B8] rounded-2xl shadow-sm flex items-center justify-center mb-4 transition-all duration-300 transform group-hover:-translate-y-1">
                <UploadCloud size={28} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-600 group-hover:text-[#2C71B8] transition-colors mb-1">Upload media utama sekaligus</p>
            </label>

            {mainMediaFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {mainMediaFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500 shrink-0">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile('main', idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="border-b border-gray-50 pb-3">
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                Media Tambahan <span className="text-xs font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full ml-2">Opsional</span>
              </h2>
              <p className="text-sm text-gray-400">File pendukung lain seperti *source code* (jika diperbolehkan server), sketsa, atau dokumen referensi tambahan.</p>
            </div>

            <label className="group relative w-full h-32 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-emerald-50/50 hover:border-emerald-500 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden">
              <input type="file" multiple className="hidden" onChange={handleAdditionalMediaChange} />
              <div className="w-12 h-12 bg-white group-hover:bg-emerald-500 rounded-2xl shadow-sm flex items-center justify-center mb-2 transition-all duration-300 transform group-hover:-translate-y-1">
                <UploadCloud size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <p className="text-sm font-bold text-gray-600 group-hover:text-emerald-500 transition-colors mb-1">Upload media tambahan</p>
            </label>

            {additionalMediaFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {additionalMediaFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500 shrink-0">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile('additional', idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-blue-800">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              Pastikan karya yang Anda unggah tidak melanggar hak cipta. Sistem akan memindai penggunaan kata-kata kasar secara otomatis.
            </p>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {isEditMode ? (
              <button
                type="button"
                onClick={triggerDelete}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center cursor-pointer gap-2 px-6 py-3.5 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-transparent"
              >
                <Trash2 size={18} />
                Hapus Project
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(isEditMode ? '/profile' : '/')}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center cursor-pointer gap-2 px-8 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center cursor-pointer gap-2 px-10 py-3.5 bg-[#2C71B8] text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-blue-400"
              >
                {isEditMode ? <Save size={18} /> : <Send size={18} />}
                {isLoading ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Publikasikan Portofolio')}
              </button>
            </div>
          </div>
        </div>
      </main>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 md:p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-sm">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Hapus Karya Ini?</h3>
              <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                Anda akan menghapus karya <span className="font-bold text-gray-800">"{formData.title || 'Tanpa Judul'}"</span>. Semua data, gambar, dan statistik suka (likes) akan ikut terhapus selamanya.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={cancelDelete} disabled={isDeleting} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50">
                  Batal
                </button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm shadow-red-500/30">
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}