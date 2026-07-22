import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Filter,
  Eye,
  Trash2,
  Heart,
  Globe,
  LayoutGrid,
  Inbox
} from 'lucide-react';
import toast from 'react-hot-toast'
import api from '../../utils/api';

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]); // TAMBAHAN: State untuk kategori
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // --- MENGAMBIL DATA DARI BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data project dan kategori secara bersamaan (Paralel)
        const [projectsRes, categoriesRes] = await Promise.all([
          api.get('/admin/projects'),
          api.get('/categories').catch(() => ({ data: [] }))
        ]);

        const categoriesData = categoriesRes.data;

        // Memformat data dari database agar sesuai dengan kebutuhan UI
        const formattedProjects = projectsRes.data.data.map(p => {
          // PERBAIKAN: Mencocokkan Angka ID dengan Nama Kategori dari tabel Kategori
          const matchedCategory = categoriesData.find(c => String(c.id) === String(p.kategori_id));
          const categoryName = matchedCategory ? matchedCategory.nama_kategori : (p.kategori_id || 'Tidak Ada Kategori');

          return {
            id: p.id,
            title: p.judul_project || 'Tanpa Judul',
            category: categoryName, // Sekarang menggunakan Nama Kategori, bukan ID
            author: p.user?.nama_user || p.User?.nama_user || 'Anonim',
            authorId: p.user?.nim || p.User?.nim || '-',
            views: p.views || 0,
            likes: Number(p.likes_count) || 0,
            date: new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'published',
            coverUrl: p.cover ? `http://localhost:3000/uploads/${p.cover}` : null
          };
        });

        setProjects(formattedProjects);
        setCategories(categoriesData);
      } catch (error) {
        toast.error("Gagal mengambil data project.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLER HAPUS PROJECT ---
  const handleDelete = async (id, title) => {
    if (window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus project "${title}" secara permanen dari database? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await api.delete(`/admin/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
        toast.success("Project berhasil dihapus dari sistem.");
      } catch (error) {
        toast.error("Gagal menghapus project.");
        console.error(error);
      }
    }
  };

  // --- FILTER SEARCH ---
  const filteredProjects = projects.filter(project =>
    String(project.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(project.author).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(project.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = projects.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-7">

      {/* --- HEADER --- */}
      <div className="rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] px-6 py-6 md:px-8 md:py-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#2C71B8]/10">
                <FolderGit2 size={18} className="text-[#2C71B8]" />
              </span>
              <h1 className="text-xl md:text-[22px] font-bold text-gray-900 tracking-tight">
                Kelola Seluruh Project
              </h1>
            </div>
            <p className="text-[13px] text-gray-500 ml-[46px] md:ml-[46px]">
              Pantau, cari, dan kelola semua portofolio yang diunggah oleh mahasiswa.
            </p>
          </div>

          {!isLoading && (
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="flex flex-col items-start px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 min-w-[88px]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Project</span>
                <span className="text-lg font-bold text-gray-900 leading-tight">{projects.length}</span>
              </div>
              <div className="flex flex-col items-start px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 min-w-[88px]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Views</span>
                <span className="text-lg font-bold text-gray-900 leading-tight">{totalViews.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex flex-col items-start px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 min-w-[88px]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Likes</span>
                <span className="text-lg font-bold text-gray-900 leading-tight">{totalLikes.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- TOOLBAR (SEARCH & FILTER) --- */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_-10px_rgba(15,23,42,0.08)] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul project, kreator, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-gray-200/80 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/15 focus:border-[#2C71B8]/40 transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/60 border border-gray-200/80 text-gray-600 rounded-xl hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all duration-200 text-sm font-medium w-full sm:w-auto justify-center">
            <Filter size={15} /> Filter Kategori
          </button>
        </div>
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-full w-1/3"></div>
                    <div className="h-2.5 bg-gray-100 rounded-full w-1/5"></div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full w-20"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-24"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/60 text-gray-500 font-semibold text-[11px] uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xl">
                <tr>
                  <th className="px-6 py-4">Info Project</th>
                  <th className="px-6 py-4">Kreator</th>
                  <th className="px-6 py-4">Statistik</th>
                  <th className="px-6 py-4">Tanggal Upload</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="group hover:bg-white/80 transition-colors duration-200">

                    {/* Kolom Info Project */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200/80 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                          {project.coverUrl ? (
                            <img
                              src={project.coverUrl}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <FolderGit2 size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-50 md:max-w-50">
                            {project.title}
                          </p>
                          <p className="text-[10.5px] font-bold text-[#2C71B8] uppercase tracking-wider mt-1 bg-[#2C71B8]/8 inline-block px-2 py-0.5 rounded-full">
                            {project.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kolom Kreator */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800 text-[13.5px]">{project.author}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5 tracking-wide">{project.authorId}</p>
                    </td>

                    {/* Kolom Statistik */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[12px] font-semibold text-gray-600" title="Tayangan">
                          <Globe size={13} className="text-gray-400" /> {project.views.toLocaleString('id-ID')}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[12px] font-semibold text-gray-600" title="Apresiasi (Likes)">
                          <Heart size={13} className="text-gray-400" /> {project.likes.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </td>

                    {/* Kolom Tanggal */}
                    <td className="px-6 py-4 text-gray-500 text-[13px] font-medium">
                      {project.date}
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Lihat (Tab Baru) */}
                        <Link
                          to={`/project/${project.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tinjau Project di Tab Baru"
                          className="p-2.5 text-gray-400 bg-transparent border border-transparent hover:text-[#2C71B8] hover:bg-[#2C71B8]/8 hover:border-[#2C71B8]/15 hover:scale-105 active:scale-95 rounded-xl transition-all duration-200"
                        >
                          <Eye size={17} />
                        </Link>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(project.id, project.title)}
                          title="Hapus Project Permanen"
                          className="p-2.5 text-gray-400 bg-transparent border border-transparent hover:text-red-600 hover:bg-red-50 hover:border-red-100 hover:scale-105 active:scale-95 rounded-xl transition-all duration-200"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}

                {/* Jika hasil pencarian kosong */}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <Inbox size={24} className="text-gray-300" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-semibold text-[14px]">Project tidak ditemukan</p>
                          <p className="text-gray-400 text-[12.5px] mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}