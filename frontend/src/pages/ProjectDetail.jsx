import { Heart, ChevronLeft, ChevronRight, Send, FileText, ExternalLink, Music } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

// --- KAMUS TRANSLASI KATEGORI ---
const CATEGORY_MAP = {
  1: 'Frontend Web Development',
  2: 'Backend / Sistem Informasi',
  3: 'UI/UX Design',
  4: 'Desain Grafis / Branding',
  5: 'Aplikasi Mobile',
  6: 'Penelitian / Skripsi',
  7: 'Lainnya'
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await api.get(`/projects/${id}`);
        setProject(projectRes.data);

        if (currentUser && projectRes.data.likes) {
          const hasLiked = projectRes.data.likes.some(like => like.user_id === currentUser.id);
          setLiked(hasLiked);
        }

        const commentsRes = await api.get(`/projects/${id}/comments`);
        setComments(commentsRes.data);
      } catch (error) {
        alert("Karya tidak ditemukan");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleLike = async () => {
    try {
      const res = await api.post(`/projects/${id}/like`);
      setLiked(res.data.isLiked);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Anda harus login untuk menyukai karya ini.");
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/projects/${id}/comments`, { komentar: newComment });

      // Notifikasi sistem moderasi
      if (res.data.warning) {
        alert(`Sistem Moderasi: ${res.data.warning}`);
      }

      if (res.data.data) {
        setComments((prev) => [res.data.data, ...prev]);
      }
      setNewComment("");
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Anda harus login untuk berkomentar.");
      } else if (error.response?.status === 400 && error.response?.data?.message) {
        alert(`Sistem Moderasi: ${error.response.data.message}`);
      } else {
        alert("Gagal mengirim komentar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin"></div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">Memuat Karya</p>
        </div>
      </div>
    );
  }
  if (!project) return null;

  const creatorName = project.user?.nama_user || "Nama akun";
  const creatorAvatar = project.user?.avatar ? `http://localhost:3000/uploads/${project.user.avatar}` : DEFAULT_AVATAR;

  // Menerjemahkan ID menjadi Nama Kategori Teks
  const categoryName = CATEGORY_MAP[project.kategori_id] || project.kategori_id || "Uncategorized";

  let mediaFiles = [];
  if (project.cover) mediaFiles.push(project.cover);
  if (project.highlight) {
    try {
      const parsed = JSON.parse(project.highlight);
      if (Array.isArray(parsed)) mediaFiles = [...mediaFiles, ...parsed];
    } catch (e) { }
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev === mediaFiles.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? mediaFiles.length - 1 : prev - 1));

  return (
    <div className="min-h-screen text-slate-950 antialiased pb-32 overflow-x-hidden relative">

      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 bg-[#F7F7F5]">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#DCE8FB] opacity-50 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-15%] w-[40vw] h-[40vw] rounded-full bg-[#F4E9DD] opacity-50 blur-[130px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[#EAEAF5] opacity-40 blur-[140px]"></div>
      </div>

      <main className="w-full pt-20 md:pt-28 relative">

        {/* ============ SECTION 1 — HERO ============ */}
        <div className="max-w-5xl mx-auto text-center mb-14 md:mb-20 px-6">
          {project.kategori_id && (
            <span className="inline-flex items-center gap-2 py-1.5 px-4 mb-7 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[#2C71B8] text-[10px] md:text-[11px] font-semibold tracking-[0.25em] uppercase shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2C71B8]"></span>
              {categoryName}
            </span>
          )}

          <h1 className="text-[2.5rem] leading-[1.05] md:text-7xl md:leading-[1.05] font-black tracking-tight text-gray-900 mb-8 px-2">
            {project.judul_project}
          </h1>

          {/* Presented by — premium creator strip (Clickable) */}
          <Link 
            to={`/user/${project.user_id}`}
            className="inline-flex items-center gap-3 py-2 pl-2 pr-5 rounded-full bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] hover:bg-white/90 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white shrink-0 group-hover:ring-blue-100 transition-all duration-300">
              <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-500 transition-colors duration-300">Presented by</p>
              <p className="text-[13px] md:text-[14px] font-bold text-gray-900 -mt-0.5 group-hover:text-[#2C71B8] transition-colors duration-300">{creatorName}</p>
            </div>
          </Link>
        </div>

        {/* ============ SECTION 2 — SHOWCASE MEDIA ============ */}
        {mediaFiles.length > 0 && (
          <div className="relative w-full max-w-[1500px] mx-auto mb-24 md:mb-32 px-2 md:px-6">
            <div className="relative h-[34vh] sm:h-[48vh] md:h-[68vh] flex items-center justify-center overflow-hidden select-none group">

              {/* Edge fade masks */}
              <div className="absolute inset-y-0 left-0 w-1/5 md:w-1/4 bg-gradient-to-r from-[#F7F7F5] via-[#F7F7F5]/80 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-1/5 md:w-1/4 bg-gradient-to-l from-[#F7F7F5] via-[#F7F7F5]/80 to-transparent z-20 pointer-events-none"></div>

              {mediaFiles.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="Sebelumnya"
                    className="absolute left-3 md:left-[6%] top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 bg-white/70 backdrop-blur-xl border border-white/80 rounded-full flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] text-gray-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Berikutnya"
                    className="absolute right-3 md:right-[6%] top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 bg-white/70 backdrop-blur-xl border border-white/80 rounded-full flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] text-gray-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <ChevronRight size={24} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {mediaFiles.map((file, i) => {
                let state = "hidden";
                if (i === currentIndex) state = "active";
                else if (i === currentIndex - 1 || (currentIndex === 0 && i === mediaFiles.length - 1)) state = "prev";
                else if (i === currentIndex + 1 || (currentIndex === mediaFiles.length - 1 && i === 0)) state = "next";

                const baseClass = "absolute h-full flex items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] w-[88%] md:w-[62%]";

                let stateClass = "";
                if (state === "active") stateClass = "z-30 translate-x-0 scale-100 opacity-100";
                else if (state === "prev") stateClass = "z-10 -translate-x-[58%] scale-[0.82] opacity-40";
                else if (state === "next") stateClass = "z-10 translate-x-[58%] scale-[0.82] opacity-40";
                else stateClass = "z-0 opacity-0 scale-50 hidden";

                const ext = file.split('.').pop().toLowerCase();
                const isPdf = ext === 'pdf';
                const isVideo = ext === 'mp4';
                const isAudio = ext === 'mp3';
                const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

                const fileUrl = `http://localhost:3000/uploads/${file}`;

                return (
                  <div key={i} className={`${baseClass} ${stateClass}`}>
                    {/* Floating glass frame */}
                    <div className="relative w-full h-full rounded-[20px] md:rounded-[28px] p-[6px] md:p-2 bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]">
                      <div className="w-full h-full rounded-[16px] md:rounded-[22px] overflow-hidden flex items-center justify-center bg-black/[0.02] relative">

                        {isPdf ? (
                          <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                              <FileText size={30} className="text-red-500" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-1">Dokumen Proyek</h4>
                            <p className="text-gray-400 text-xs mb-5 uppercase tracking-[0.2em] font-semibold">PDF Document</p>
                            <a
                              href={fileUrl}
                              target="_blank" rel="noreferrer"
                              className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-full text-sm hover:bg-gray-800 transition-colors shadow-md"
                            >
                              Buka Dokumen
                            </a>
                          </div>
                        ) : isVideo ? (
                          <video
                            src={fileUrl}
                            controls
                            className="w-full h-full object-contain bg-black rounded-[16px] md:rounded-[22px]"
                          >
                            Browser Anda tidak mendukung tag video.
                          </video>
                        ) : isAudio ? (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.4),transparent_60%)]"></div>
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center mb-6 relative z-10">
                              <Music size={32} className="text-blue-300" />
                            </div>
                            <h4 className="text-white font-bold text-base mb-6 tracking-[0.25em] uppercase relative z-10">Audio Track</h4>
                            <audio src={fileUrl} controls className="w-full max-w-sm relative z-10" />
                          </div>
                        ) : isImage ? (
                          <img
                            src={fileUrl}
                            alt={`Media ${i + 1}`}
                            className="w-full h-full object-contain"
                            draggable="false"
                          />
                        ) : (
                          <div className="bg-white p-8 text-center">
                            <p className="text-gray-800 font-medium">Format file tidak didukung untuk pratinjau.</p>
                            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline mt-2 block font-semibold">Download File</a>
                          </div>
                        )}

                        {/* Subtle glass reflection */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/15 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slide indicators */}
            {mediaFiles.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {mediaFiles.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-6 bg-gray-900" : "w-1.5 bg-gray-300"}`}
                  ></span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ SECTION 3 — PROJECT INFORMATION ============ */}
        <div className="max-w-[760px] mx-auto px-6 mb-20">
          <div className="rounded-[28px] bg-white/50 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)] p-7 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Deskripsi</span>
              <span className="flex-1 h-px bg-gradient-to-r from-gray-300/70 to-transparent"></span>
            </div>

            <div className="text-gray-600 font-medium leading-[1.9] text-[15px] md:text-[16.5px] whitespace-pre-wrap text-left">
              {project.deskripsi}
            </div>

            {/* ============ SECTION 4 — EXTERNAL LINK CTA ============ */}
            {project.link_project && (
              <div className="mt-9 pt-8 border-t border-gray-200/70">
                <a
                  href={project.link_project.startsWith('http') ? project.link_project : `https://${project.link_project}`}
                  target="_blank" rel="noreferrer"
                  // PERBAIKAN: Menambahkan !text-white dan hover:!text-white di bawah ini
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gray-900 !text-white hover:!text-white font-semibold text-[13px] md:text-[14px] tracking-wide shadow-[0_12px_30px_-10px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.45)] hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  Lihat Tautan Eksternal
                  <ExternalLink size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[760px] mx-auto px-6">

          {/* ============ SECTION 5 — APPRECIATION BUTTON ============ */}
          <div className="flex flex-col items-center justify-center mb-24 mt-4">
            <button
              onClick={handleLike}
              className={`group relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full backdrop-blur-2xl border transition-all duration-300 hover:scale-105 active:scale-95 ${liked
                  ? "bg-red-50/80 border-red-100 shadow-[0_0_0_8px_rgba(239,68,68,0.06),0_20px_40px_-20px_rgba(239,68,68,0.35)]"
                  : "bg-white/60 border-white/80 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
                }`}
            >
              <Heart
                size={40}
                className={`transition-all duration-300 ${liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 group-hover:text-red-400 group-hover:scale-105"}`}
              />
            </button>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              {liked ? "Telah Diapresiasi" : "Apresiasi Karya Ini"}
            </p>
          </div>

          {/* ============ SECTION 6 — COMMENT SECTION ============ */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Diskusi</h3>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">{comments.length}</span>
            </div>

            <form onSubmit={handleCommentSubmit} className="relative mb-14">
              <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.12)] p-2 transition-all duration-300 focus-within:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.18)] focus-within:border-gray-300/80">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-transparent rounded-xl p-3.5 text-[15px] text-gray-800 focus:outline-none min-h-[96px] resize-y placeholder:text-gray-400"
                  placeholder="Tuliskan tanggapan Anda..."
                  required
                ></textarea>
                <div className="flex justify-end px-1 pb-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]'
                      }`}
                  >
                    <Send size={14} /> Kirim
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => {
                // Pastikan kita mendapatkan ID user dari komentar
                const commenterId = comment.user?.id || comment.user_id;

                return (
                  <div
                    key={comment.id}
                    className="flex gap-4 p-5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 transition-colors duration-300"
                  >
                    {/* --- AVATAR KOMENTATOR (Bisa Diklik) --- */}
                    <Link
                      to={`/user/${commenterId}`}
                      className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white shrink-0 hover:ring-blue-100 hover:scale-105 transition-all duration-300 shadow-sm"
                      title={`Lihat Profil ${comment.user?.nama_user || "Anonim"}`}
                    >
                      <img 
                        src={comment.user?.avatar ? `http://localhost:3000/uploads/${comment.user.avatar}` : DEFAULT_AVATAR} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {/* --- NAMA KOMENTATOR (Bisa Diklik) --- */}
                        <Link
                          to={`/user/${commenterId}`}
                          className="font-bold text-[14px] text-gray-900 hover:text-[#2C71B8] transition-colors duration-300"
                          title={`Lihat Profil ${comment.user?.nama_user || "Anonim"}`}
                        >
                          {comment.user?.nama_user || "Anonim"}
                        </Link>
                        
                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[14.5px] leading-relaxed whitespace-pre-wrap">
                        {comment.komentar}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}