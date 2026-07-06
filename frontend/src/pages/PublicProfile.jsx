import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Link as LinkIcon, Heart, Award, Sparkles, Crown, Zap, FileQuestion, ArrowLeft
} from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import api from '../utils/api';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

export default function PublicProfile() {
  const { id } = useParams(); // Mengambil ID dari URL
  const [profileData, setProfileData] = useState(null);
  const [displayProjects, setDisplayProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setIsLoading(true);
      try {
        // 1. Ambil data profil user berdasarkan ID
        // (Pastikan endpoint GET /users/:id ini tersedia secara publik di backend Anda)
        const userRes = await api.get(`/users/${id}`);
        const userData = userRes.data;
        setProfileData(userData);

        // 2. Tentukan apa yang harus ditampilkan berdasarkan Role
        if (userData.role_id !== 3) {
          // Jika Mahasiswa: Ambil karya yang mereka buat
          const projectRes = await api.get(`/projects?user_id=${id}`);
          setDisplayProjects(projectRes.data);
        } else {
          // Jika Pengunjung: Ambil karya yang mereka Like
          const allProjectsRes = await api.get('/projects');
          const likedProjects = allProjectsRes.data.filter(project => {
            const projectLikes = project.Likes || project.likes || [];
            return projectLikes.some(like => Number(like.user_id) === Number(id));
          });
          setDisplayProjects(likedProjects);
        }
      } catch (error) {
        console.error("Gagal mengambil profil publik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#2C71B8] animate-spin" />
      </div>
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <FileQuestion size={30} className="text-slate-400" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">Profil Tidak Ditemukan</h2>
      <p className="text-slate-500 mb-6">Pengguna ini mungkin telah dihapus atau tidak ada.</p>
      <Link to="/" className="text-[#2C71B8] font-bold flex items-center gap-2 hover:underline">
        <ArrowLeft size={16} /> Kembali ke Explore
      </Link>
    </div>
  );

  const isPengunjung = profileData.role_id === 3;
  const displayAvatar = profileData.avatar ? `http://localhost:3000/uploads/${profileData.avatar}` : DEFAULT_AVATAR;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-12 pb-28">
        
        {/* Tombol Kembali */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════
            IDENTITY CARD (PUBLIC VIEW)
        ══════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-200/60 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none ${isPengunjung ? 'bg-emerald-300' : 'bg-blue-300'}`}></div>

          <div className="relative shrink-0 z-10">
            <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-white shadow-md border border-slate-100 ${isPengunjung ? 'ring-4 ring-emerald-100' : 'ring-4 ring-blue-50'}`}>
              <img src={displayAvatar} alt={profileData.nama_user} className="w-full h-full rounded-full object-cover" />
            </div>
            {isPengunjung && (
              <div className="absolute -bottom-1 -right-1 bg-slate-900 text-yellow-400 p-2 rounded-full border-4 border-white z-20 shadow-sm">
                <Crown size={16} className="fill-yellow-400" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left z-10 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-title font-black text-slate-900 tracking-tight">
                {profileData.nama_user}
              </h1>
              
              {isPengunjung ? (
                <span className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 w-fit mx-auto md:mx-0">
                  <Sparkles size={12} /> SUPPORTER
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5 bg-blue-50 text-[#2C71B8] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200 w-fit mx-auto md:mx-0">
                  <Zap size={12} /> KREATOR
                </span>
              )}
            </div>

            {!isPengunjung && (
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-center md:justify-start flex-wrap gap-2">
                <span className="text-[#2C71B8]">{profileData.prodi || "Prodi Belum Diisi"}</span>
                <span className="text-slate-300">•</span> 
                <span>Angkatan {profileData.angkatan || "—"}</span>
              </p>
            )}

            <p className="text-slate-600 font-medium leading-relaxed text-[14px]">
              {profileData.bio || "Pengguna ini belum menambahkan deskripsi diri."}
            </p>

            {profileData.website && (
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${isPengunjung ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-50 text-[#2C71B8] hover:bg-blue-100'}`}>
                  <LinkIcon size={12} /> Tautan Eksternal
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4">
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-xl font-black text-slate-900 font-title tracking-tight flex items-center gap-2">
              {isPengunjung ? (
                <><Heart size={20} className="text-rose-500 fill-rose-500" /> Koleksi Apresiasi</>
              ) : (
                <><Award size={20} className="text-[#2C71B8]" /> Katalog Karya</>
              )}
            </h3>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200">
              {displayProjects.length} {isPengunjung ? 'DISUKAI' : 'PORTFOLIO'}
            </span>
          </div>

          {displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {displayProjects.map((project, i) => (
                <div key={project.id} className="animate-in zoom-in-95 fade-in duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                  {/* isOwner di-set false agar pengunjung lain tidak bisa menghapus/mengedit karya dari sini */}
                  <ProjectCard project={project} isOwner={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                {isPengunjung ? <Heart size={30} className="text-slate-300" /> : <FileQuestion size={30} className="text-slate-300" />}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Belum Ada Karya</h3>
              <p className="text-slate-500 max-w-sm text-center text-sm">
                {isPengunjung 
                  ? "Pengguna ini belum memberikan apresiasi pada karya apa pun." 
                  : "Mahasiswa ini belum mengunggah portofolio."}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}