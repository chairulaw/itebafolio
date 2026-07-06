import { Heart, ChevronLeft, ChevronRight, Send, FileText, ExternalLink, Music, Maximize2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

// Grain texture (noise) sebagai data-uri, dipakai sebagai lapisan tekstur "kertas"
const GRAIN_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function getFileType(file) {
  const ext = file.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'mp4') return 'video';
  if (ext === 'mp3') return 'audio';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  return 'other';
}

// Elemen kecil untuk animasi "reveal" saat section masuk viewport
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Sudut siku kecil di bingkai hero — meniru tanda pemasangan pada label pameran
function CornerMark({ position, delay = 0 }) {
  const rotations = { tl: 0, tr: 90, br: 180, bl: 270 };
  const pos = {
    tl: { top: -9, left: -9 },
    tr: { top: -9, right: -9 },
    br: { bottom: -9, right: -9 },
    bl: { bottom: -9, left: -9 },
  }[position];

  return (
    <svg
      className="corner-mark absolute w-6 h-6 md:w-7 md:h-7 z-30 pointer-events-none"
      style={{ ...pos, transform: `rotate(${rotations[position]}deg)`, animationDelay: `${delay}ms` }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M2 11 V2 H11" stroke="var(--cobalt)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Muat pasangan tipografi khusus halaman ini
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await api.get(`/projects/${id}`);
        setProject(projectRes.data);
        setLikeCount(projectRes.data.likes?.length || 0);

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
      setLikeCount((prev) => Math.max(0, prev + (res.data.isLiked ? 1 : -1)));
      if (res.data.isLiked) setBurstKey((k) => k + 1);
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F1]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-[#2C4FC4] animate-spin"></div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Memuat Karya</p>
        </div>
      </div>
    );
  }
  if (!project) return null;

  const creatorName = project.user?.nama_user || "Nama akun";
  const creatorAvatar = project.user?.avatar ? `http://localhost:3000/uploads/${project.user.avatar}` : DEFAULT_AVATAR;

  const categoryName = CATEGORY_MAP[project.kategori_id] || project.kategori_id || "Uncategorized";

  const createdDate = project.created_at ? new Date(project.created_at) : null;
  const formattedDate = createdDate
    ? createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const archiveYear = createdDate ? createdDate.getFullYear() : new Date().getFullYear();
  const archiveNo = String(project.id ?? id).padStart(3, '0');

  // Parsing Media Highlight
  let highlightFiles = [];
  if (project.highlight) {
    try {
      const parsed = JSON.parse(project.highlight);
      if (Array.isArray(parsed)) highlightFiles = parsed;
    } catch (e) { }
  }

  // Parsing Media Tambahan
  let additionalFiles = [];
  if (project.additional_media) {
    try {
      const parsedAdd = JSON.parse(project.additional_media);
      if (Array.isArray(parsedAdd)) additionalFiles = parsedAdd;
    } catch (e) { }
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev === highlightFiles.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? highlightFiles.length - 1 : prev - 1));

  const renderMediaBlock = (file) => {
    const type = getFileType(file);
    const fileUrl = `http://localhost:3000/uploads/${file}`;

    if (type === 'pdf') {
      return (
        <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <FileText size={30} className="text-red-500" />
          </div>
          <h4 className="font-bold text-gray-900 text-lg mb-1">Dokumen Proyek</h4>
          <p className="text-gray-400 text-xs mb-5 uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>PDF Document</p>
          <a
            href={fileUrl}
            target="_blank" rel="noreferrer"
            className="px-6 py-2.5 bg-[var(--ink)] text-white font-semibold rounded-full text-sm hover:bg-[var(--cobalt)] transition-colors shadow-md"
          >
            Buka Dokumen
          </a>
        </div>
      );
    }

    if (type === 'video') {
      return (
        <video src={fileUrl} controls className="w-full h-full object-contain bg-black rounded-[16px] md:rounded-[22px]">
          Browser Anda tidak mendukung tag video.
        </video>
      );
    }

    if (type === 'audio') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_30%,rgba(44,79,196,0.5),transparent_60%)]"></div>
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center mb-6 relative z-10">
            <Music size={32} className="text-[#9DB3F5]" />
          </div>
          <h4 className="text-white font-bold text-base mb-6 tracking-[0.25em] uppercase relative z-10" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Audio Track</h4>
          <audio src={fileUrl} controls className="w-full max-w-sm relative z-10" />
        </div>
      );
    }

    if (type === 'image') {
      return <img src={fileUrl} alt="Media" className="w-full h-full object-contain" draggable="false" />;
    }

    return (
      <div className="bg-white p-8 text-center">
        <p className="text-gray-800 font-medium">Format file tidak didukung untuk pratinjau.</p>
        <a href={fileUrl} target="_blank" rel="noreferrer" className="text-[var(--cobalt)] underline mt-2 block font-semibold">Download File</a>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen text-[var(--ink)] antialiased pb-32 overflow-x-hidden relative"
      style={{
        '--paper': '#F5F5F1',
        '--ink': '#191B20',
        '--cobalt': '#2C4FC4',
        '--ochre': '#C97A2B',
        '--sage': '#6E7B5E',
        '--line': 'rgba(25,27,32,0.14)',
      }}
    >
      <style>{`
        @keyframes draw-corner { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
        @keyframes particle-burst { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        @keyframes title-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        .drop-cap::first-letter {
          font-family: 'Source Serif 4', serif;
          float: left;
          font-size: 3.6em;
          line-height: 0.82;
          padding-right: 0.09em;
          padding-top: 0.06em;
          font-weight: 700;
          color: var(--cobalt);
        }
        .corner-mark path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: draw-corner 0.8s ease forwards; }
        .hero-title { animation: title-rise 0.8s ease forwards; }
        .hero-frame-img { transition: transform 1.1s cubic-bezier(0.22,1,0.36,1); }
        .hero-frame:hover .hero-frame-img { transform: scale(1.035); }
        .media-tile-img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .media-tile:hover .media-tile-img { transform: scale(1.06); }
        .media-tile:hover .media-tile-overlay { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .reveal.is-visible { opacity: 1 !important; transform: none !important; transition: none !important; }
          .corner-mark path { animation: none !important; stroke-dashoffset: 0 !important; }
          .hero-title { animation: none !important; opacity: 1 !important; }
          .hero-frame-img, .media-tile-img { transition: none !important; }
          .particle { display: none !important; }
        }
      `}</style>

      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 bg-[var(--paper)]">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[var(--cobalt)] opacity-[0.08] blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-15%] w-[40vw] h-[40vw] rounded-full bg-[var(--ochre)] opacity-[0.10] blur-[130px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[var(--sage)] opacity-[0.09] blur-[140px]"></div>
        <div className="absolute inset-0 opacity-[0.035] mix-blend-multiply" style={{ backgroundImage: `url("${GRAIN_URI}")` }}></div>
      </div>

      <main className="w-full pt-16 md:pt-24 relative">

        <div className="text-center mb-6 px-6">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.35em] text-gray-400"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Pameran Karya Mahasiswa <span className="text-gray-300">·</span> No. {archiveNo}/{archiveYear}
          </span>
        </div>

        {/* ============ 1 & 2. KATEGORI + PRESENTED BY ============ */}
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12 px-6">
          {project.kategori_id && (
            <span className="inline-flex items-center gap-2 py-1.5 px-4 mb-6 rounded-full bg-white/60 backdrop-blur-md border border-[var(--line)] text-[var(--cobalt)] text-[10px] md:text-[11px] font-semibold tracking-[0.25em] uppercase shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cobalt)]"></span>
              {categoryName}
            </span>
          )}

          <div>
            <Link
              to={`/user/${project.user_id}`}
              className="inline-flex items-center gap-4 py-3 pl-3 pr-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-[var(--line)] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] hover:bg-white/90 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full overflow-hidden bg-gray-200 ring-2 ring-white shrink-0 group-hover:ring-blue-100 transition-all duration-300">
                <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400 group-hover:text-[var(--cobalt)] transition-colors duration-300" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Presented by</p>
                <p className="text-[17px] md:text-[18px] font-bold text-gray-900 mt-0.5 group-hover:text-[var(--cobalt)] transition-colors duration-300">
                  {project.user?.nama_lengkap || creatorName}
                </p>
                <p className="text-[12.5px] text-gray-500 mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {[project.user?.nim, project.user?.prodi].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ============ 3. HERO — JUDUL + COVER ============ */}
        <div className="max-w-5xl mx-auto text-center mb-8 px-6">
          <h1
            className="hero-title text-[2.5rem] leading-[1.03] md:text-7xl md:leading-[1.03] font-bold tracking-tight text-[var(--ink)] px-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {project.judul_project}
          </h1>
        </div>

        {project.cover && (
          <div className="relative w-full max-w-5xl mx-auto mb-6 px-4 md:px-6">
            <div className="hero-frame relative rounded-[24px] md:rounded-[32px] p-[6px] md:p-2 bg-white/40 backdrop-blur-2xl border border-[var(--line)] shadow-[0_30px_80px_-20px_rgba(25,27,32,0.28)]">
              <CornerMark position="tl" delay={100} />
              <CornerMark position="tr" delay={200} />
              <CornerMark position="br" delay={300} />
              <CornerMark position="bl" delay={400} />
              <div className="hero-frame-img w-full aspect-video rounded-[18px] md:rounded-[26px] overflow-hidden flex items-center justify-center bg-black/[0.02] relative">
                {renderMediaBlock(project.cover)}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/15 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {/* ============ 4. TANGGAL DIBUAT ============ */}
        {formattedDate && (
          <div className="flex items-center justify-center gap-4 mb-16 md:mb-20 px-6">
            <span className="hidden sm:block w-10 h-px bg-[var(--line)]"></span>
            <span
              className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-gray-400"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Dipublikasikan {formattedDate}
            </span>
            <span className="hidden sm:block w-10 h-px bg-[var(--line)]"></span>
          </div>
        )}

        {/* ============ 5. DESKRIPSI ============ */}
        <Reveal className="max-w-[760px] mx-auto px-6 mb-16">
          <div className="rounded-[28px] bg-white/50 backdrop-blur-2xl border border-[var(--line)] shadow-[0_20px_60px_-30px_rgba(25,27,32,0.18)] p-7 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Deskripsi Karya</span>
              <span className="flex-1 h-px bg-gradient-to-r from-[var(--line)] to-transparent"></span>
            </div>

            <div
              className="drop-cap text-gray-600 leading-[1.9] text-[15.5px] md:text-[17px] whitespace-pre-wrap text-left"
              style={{ fontFamily: "'Source Serif 4', serif" }}
            >
              {project.deskripsi}
            </div>

            {project.link_project && (
              <div className="mt-9 pt-8 border-t border-[var(--line)]">
                <a
                  href={project.link_project.startsWith('http') ? project.link_project : `https://${project.link_project}`}
                  target="_blank" rel="noreferrer"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[var(--ink)] !text-white hover:!text-white font-semibold text-[13px] md:text-[14px] tracking-wide shadow-[0_12px_30px_-10px_rgba(25,27,32,0.4)] hover:shadow-[0_16px_36px_-8px_rgba(25,27,32,0.45)] hover:bg-[var(--cobalt)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  Lihat Tautan Eksternal
                  <ExternalLink size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}
          </div>
        </Reveal>

        {/* ============ 6. HIGHLIGHT MEDIA (carousel, hanya tampil jika ada) ============ */}
        {highlightFiles.length > 0 && (
          <Reveal className="relative w-full max-w-[1500px] mx-auto mb-24 md:mb-28 px-2 md:px-6">
            <div className="flex items-center gap-3 mb-6 max-w-[760px] mx-auto px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Dokumentasi &amp; Preview</span>
              <span className="flex-1 h-px bg-gradient-to-r from-[var(--line)] to-transparent"></span>
              <span className="text-[10px] font-medium text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{currentIndex + 1}/{highlightFiles.length}</span>
            </div>

            <div className="relative h-[34vh] sm:h-[48vh] md:h-[68vh] flex items-center justify-center overflow-hidden select-none group">

              <div className="absolute inset-y-0 left-0 w-1/5 md:w-1/4 bg-gradient-to-r from-[var(--paper)] via-[var(--paper)]/80 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-1/5 md:w-1/4 bg-gradient-to-l from-[var(--paper)] via-[var(--paper)]/80 to-transparent z-20 pointer-events-none"></div>

              {highlightFiles.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    aria-label="Sebelumnya"
                    className="absolute left-3 md:left-[6%] top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 bg-white/70 backdrop-blur-xl border border-[var(--line)] rounded-full flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] text-gray-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Berikutnya"
                    className="absolute right-3 md:right-[6%] top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 bg-white/70 backdrop-blur-xl border border-[var(--line)] rounded-full flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] text-gray-700 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <ChevronRight size={24} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {highlightFiles.map((file, i) => {
                let state = "hidden";
                if (i === currentIndex) state = "active";
                else if (i === currentIndex - 1 || (currentIndex === 0 && i === highlightFiles.length - 1)) state = "prev";
                else if (i === currentIndex + 1 || (currentIndex === highlightFiles.length - 1 && i === 0)) state = "next";

                const baseClass = "absolute h-full flex items-center justify-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] w-[88%] md:w-[62%]";

                let stateClass = "";
                if (state === "active") stateClass = "z-30 translate-x-0 scale-100 opacity-100";
                else if (state === "prev") stateClass = "z-10 -translate-x-[58%] scale-[0.82] opacity-40";
                else if (state === "next") stateClass = "z-10 translate-x-[58%] scale-[0.82] opacity-40";
                else stateClass = "z-0 opacity-0 scale-50 hidden";

                return (
                  <div key={i} className={`${baseClass} ${stateClass}`}>
                    <div className="relative w-full h-full rounded-[20px] md:rounded-[28px] p-[6px] md:p-2 bg-white/40 backdrop-blur-2xl border border-[var(--line)] shadow-[0_30px_80px_-20px_rgba(25,27,32,0.25)]">
                      <div className="w-full h-full rounded-[16px] md:rounded-[22px] overflow-hidden flex items-center justify-center bg-black/[0.02] relative">
                        {renderMediaBlock(file)}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/15 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {highlightFiles.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {highlightFiles.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Ke media ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-6 bg-[var(--ink)]" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`}
                  ></button>
                ))}
              </div>
            )}
          </Reveal>
        )}

        {/* ============ 7. MEDIA TAMBAHAN — grid besar, jadi sorotan tersendiri ============ */}
        {additionalFiles.length > 0 && (
          <Reveal className="max-w-[1100px] mx-auto mb-24 md:mb-28 px-4 md:px-6">
            <div className="flex items-center gap-3 mb-7 px-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Lampiran &amp; Media Tambahan</span>
              <span className="flex-1 h-px bg-gradient-to-r from-[var(--line)] to-transparent"></span>
              <span className="text-[10px] font-medium text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{additionalFiles.length} berkas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-7">
              {additionalFiles.map((file, idx) => {
                const fileUrl = `http://localhost:3000/uploads/${file}`;
                const type = getFileType(file);
                const isWide = type === 'pdf' || type === 'other';

                return (
                  <div
                    key={idx}
                    className={`media-tile relative rounded-[26px] p-[6px] md:p-2 bg-white/40 backdrop-blur-2xl border border-[var(--line)] shadow-[0_20px_50px_-25px_rgba(25,27,32,0.25)] hover:shadow-[0_24px_60px_-20px_rgba(25,27,32,0.3)] transition-shadow duration-300 ${isWide ? 'sm:col-span-2' : ''}`}
                  >
                    <div className={`relative w-full rounded-[20px] overflow-hidden flex items-center justify-center bg-black/[0.02] ${isWide ? 'min-h-[120px]' : 'aspect-[4/3]'}`}>

                      {type === 'image' && (
                        <>
                          <img src={fileUrl} alt={`Lampiran ${idx + 1}`} className="media-tile-img w-full h-full object-cover" />
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="media-tile-overlay absolute inset-0 flex items-end justify-end p-4 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                            aria-label="Lihat gambar penuh"
                          >
                            <span className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                              <Maximize2 size={16} className="text-[var(--ink)]" />
                            </span>
                          </a>
                        </>
                      )}

                      {type === 'video' && (
                        <video src={fileUrl} controls className="w-full h-full object-cover bg-black" />
                      )}

                      {type === 'audio' && (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_30%,rgba(44,79,196,0.5),transparent_60%)]"></div>
                          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center mb-5 relative z-10">
                            <Music size={26} className="text-[#9DB3F5]" />
                          </div>
                          <p className="text-white text-[12px] font-semibold mb-4 truncate max-w-full relative z-10" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{file}</p>
                          <audio src={fileUrl} controls className="w-full max-w-xs relative z-10" />
                        </div>
                      )}

                      {isWide && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group/doc flex items-center gap-5 w-full p-6 hover:bg-white/40 transition-colors duration-300"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 group-hover/doc:bg-[var(--cobalt)] transition-colors duration-300">
                            <FileText size={28} className="text-red-500 group-hover/doc:text-white transition-colors duration-300" />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-[15px] font-bold text-gray-900 truncate group-hover/doc:text-[var(--cobalt)] transition-colors">
                              {file}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-[0.15em]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Klik untuk membuka dokumen</p>
                          </div>
                          <ExternalLink size={18} className="ml-auto shrink-0 text-gray-300 group-hover/doc:text-[var(--cobalt)] transition-colors" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        <div className="max-w-[760px] mx-auto px-6">

          {/* ============ 8. TOMBOL LIKE ============ */}
          <Reveal className="flex flex-col items-center justify-center mb-24 mt-4">
            <div className="relative">
              <button
                onClick={handleLike}
                className={`group relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full backdrop-blur-2xl border transition-all duration-300 hover:scale-105 active:scale-95 ${liked
                    ? "bg-red-50/80 border-red-100 shadow-[0_0_0_8px_rgba(239,68,68,0.06),0_20px_40px_-20px_rgba(239,68,68,0.35)]"
                    : "bg-white/60 border-[var(--line)] shadow-[0_20px_50px_-25px_rgba(25,27,32,0.25)] hover:shadow-[0_20px_50px_-20px_rgba(25,27,32,0.3)]"
                  }`}
              >
                <Heart
                  size={40}
                  className={`transition-all duration-300 ${liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 group-hover:text-red-400 group-hover:scale-105"}`}
                />
              </button>

              {burstKey > 0 && (
                <div key={burstKey} className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const tx = Math.cos(angle) * 50;
                    const ty = Math.sin(angle) * 50;
                    return (
                      <span
                        key={i}
                        className="particle absolute w-1.5 h-1.5 rounded-full bg-[var(--cobalt)]"
                        style={{
                          left: '50%',
                          top: '50%',
                          '--tx': `${tx}px`,
                          '--ty': `${ty}px`,
                          animation: 'particle-burst 0.6s ease-out forwards',
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {liked ? "Telah Diapresiasi" : "Apakah Anda Menyukai Project Ini?"}
            </p>
            {likeCount > 0 && (
              <p className="mt-1.5 text-[12px] text-gray-400">
                {likeCount} orang mengapresiasi karya ini
              </p>
            )}
          </Reveal>

          {/* ============ 9. KOLOM KOMENTAR ============ */}
          <Reveal className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Diskusi</h3>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">{comments.length}</span>
            </div>

            <form onSubmit={handleCommentSubmit} className="relative mb-14">
              <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-[var(--line)] shadow-[0_10px_40px_-20px_rgba(0,0,0,0.12)] p-2 transition-all duration-300 focus-within:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.18)] focus-within:border-[var(--cobalt)]/40">
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
                        : 'bg-[var(--ink)] text-white hover:bg-[var(--cobalt)] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_8px_20px_-8px_rgba(25,27,32,0.35)]'
                      }`}
                  >
                    <Send size={14} /> Kirim
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => {
                const commenterId = comment.user?.id || comment.user_id;

                return (
                  <div
                    key={comment.id}
                    className="flex gap-4 p-5 rounded-2xl bg-white/40 backdrop-blur-md border border-[var(--line)] border-l-2 border-l-[var(--cobalt)]/30 hover:bg-white/60 hover:border-l-[var(--cobalt)] transition-colors duration-300"
                  >
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
                        <Link
                          to={`/user/${commenterId}`}
                          className="font-bold text-[14px] text-gray-900 hover:text-[var(--cobalt)] transition-colors duration-300"
                          title={`Lihat Profil ${comment.user?.nama_user || "Anonim"}`}
                        >
                          {comment.user?.nama_user || "Anonim"}
                        </Link>

                        <span className="text-[11px] text-gray-400 font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
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
          </Reveal>
        </div>

      </main>
    </div>
  );
}