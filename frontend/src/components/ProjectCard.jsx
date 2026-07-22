import { useState, useEffect } from 'react';
import { Heart, Eye, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

export default function ProjectCard({ project, isOwner = false }) {
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(project?.likes_count || 0);
  const [justLiked, setJustLiked] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // --- LOGIKA MENYALAKAN LIKE ---
  useEffect(() => {
    // Kita antisipasi jika backend mengirim 'likes' (huruf kecil) atau 'Likes' (huruf besar)
    const likesArray = project?.likes || project?.Likes || [];

    if (currentUser && likesArray.length > 0) {
      // Cek apakah ada ID user kita di dalam array Like tersebut
      const hasLiked = likesArray.some(like => like.user_id === currentUser.id);
      setIsLiked(hasLiked);
    }
  }, [project, currentUser]);

  if (!project) return null;

  // --- MAPPING DATA DARI DATABASE ---
  const coverUrl = project.cover
    ? `http://localhost:3000/uploads/${project.cover}`
    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

  const creatorName = project.user?.nama_user || "Mahasiswa ITEBA";
  const creatorAvatar = project.user?.avatar
    ? `http://localhost:3000/uploads/${project.user.avatar}`
    : DEFAULT_AVATAR;

  // --- HANDLER EDIT ---
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/manage-project/${project.id}`);
  };

  // --- HANDLER LIKE ---
  const handleLikeClick = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${project.id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(prev => res.data.isLiked ? prev + 1 : prev - 1);
      if (res.data.isLiked) {
        setJustLiked(true);
        setTimeout(() => setJustLiked(false), 450);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Anda harus login untuk menyukai karya ini.");
      }
    }
  };

  return (
    <div className="group flex flex-col h-full w-full">
      <Link
        to={`/project/${project.id}`}
        className="block relative aspect-[4/3] sm:aspect-video rounded-[20px] mb-3.5 overflow-hidden bg-gray-100 border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.28)] group-hover:-translate-y-1"
      >
        <img
          src={coverUrl}
          alt={project.judul_project}
          className="w-full h-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'; }}
        />

        {/* Soft glass reflection sheen across the image */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>

        {/* Subtle inner border ring for a premium framed feel */}
        <div className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10 pointer-events-none"></div>

        {/* ======================================================== */}
        {/* PENDING STATE — Professional Review Process               */}
        {/* ======================================================== */}
        {project.status === 'pending' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center z-10 px-6 text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/15 text-white text-[10px] font-bold tracking-[0.2em] px-3.5 py-1.5 rounded-full uppercase shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </span>
              Dalam Tinjauan
            </span>
            <p className="text-[11px] text-white/50 mt-3 font-medium tracking-wide">
              Sedang ditinjau oleh tim admin
            </p>
          </div>
        )}

        {/* Title overlay — Featured Project Presentation */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end z-20">
          <div className="p-5 w-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <p className="text-white/50 text-[9.5px] font-bold uppercase tracking-[0.25em] mb-1.5">Featured Project</p>
            <h3 className="text-white font-bold text-[17px] leading-snug truncate drop-shadow-md">
              {project.judul_project}
            </h3>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleEditClick}
            className="absolute top-3.5 right-3.5 p-2.5 bg-white/15 hover:bg-white backdrop-blur-xl border border-white/20 rounded-full text-white hover:text-[#2C71B8] opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] hover:scale-105 z-30"
            title="Edit Project"
          >
            <Edit2 size={15} />
          </button>
        )}
      </Link>

      <div className="flex items-center justify-between mt-1 px-1">
        {/* ======================================================== */}
        {/* CREATOR PROFILE LINK                                     */}
        {/* ======================================================== */}
        <Link 
          to={project.user_id ? `/user/${project.user_id}` : '#'}
          className="flex items-center gap-2.5 min-w-0 group/creator"
          title={`Lihat Profil ${creatorName}`}
        >
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white shadow-sm shrink-0 transition-transform duration-300 group-hover/creator:scale-105 group-hover/creator:ring-blue-100">
            <img
              src={creatorAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[13px] font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-[180px] transition-colors duration-200 group-hover/creator:text-[#2C71B8]">
            {creatorName}
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          {/* Glass Stat Badge — Like */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
              isLiked
                ? 'bg-red-50/80 border-red-100 text-red-500'
                : 'bg-gray-50/80 border-gray-100 text-gray-500 hover:bg-red-50/60 hover:text-red-400 hover:border-red-100'
            }`}
          >
            <Heart
              size={13}
              strokeWidth={2.5}
              className={`transition-transform duration-300 ${isLiked ? "fill-red-500 text-red-500" : ""} ${justLiked ? "scale-[1.4]" : "scale-100"}`}
            />
            <span className="text-[12px] font-bold tabular-nums">{likesCount}</span>
          </button>

          {/* Glass Stat Badge — Views */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border bg-gray-50/80 border-gray-100 text-gray-500"
            title="Dilihat"
          >
            <Eye size={13} strokeWidth={2.5} />
            <span className="text-[12px] font-bold tabular-nums">{project.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}