import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings, Link as LinkIcon, Plus,
  Heart, Award, Sparkles, TrendingUp, Crown, Rocket, Zap,
  Eye, Layers, Star, ArrowUpRight, Share2, BarChart3, Users, Flame
} from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import api from '../utils/api';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

/* ─── Tiny helpers ─────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, gradient, iconColor, delay = 0 }) {
  return (
    <div
      className="group relative rounded-2xl p-5 border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative z-10 flex flex-col gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor} bg-white shadow-sm border border-white/80`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 leading-none">{value ?? '—'}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ to, icon: Icon, label, primary }) {
  const base = "group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-95";
  
  // Jika Primary: Background Biru, maka Teks Putih
  // Jika Secondary: Background Putih, maka Teks Slate/Gelap
  const variant = primary
    ? "bg-[#2C71B8] text-white hover:bg-[#1d5a9a] shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 shadow-sm";
    
  return (
    <Link to={to} className={`${base} ${variant}`}>
      <Icon size={14} className="shrink-0" />
      {label}
      {primary && <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
    </Link>
  );
}

/* ─── Main Component ───────────────────────────────────────── */

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- STATE BARU: Menyimpan jumlah like yang diberikan pengunjung ---
  const [totalGivenLikes, setTotalGivenLikes] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) { navigate('/login'); return; }

        const userRes = await api.get('/users');
        setProfileData(userRes.data);

        // Pengambilan data berdasarkan Role
        if (userRes.data.role_id !== 3) {
          // --- MAHASISWA: Ambil karya milik mereka ---
          const projectRes = await api.get(`/projects?user_id=${userData.id}`);
          setMyProjects(projectRes.data);
        } else {
          // --- PENGUNJUNG: Hitung riwayat apresiasi (Like) ---
          try {
            // Kita panggil semua project yang ada di Explore
            const allProjectsRes = await api.get('/projects');
            
            // Kita hitung berapa banyak karya yang pernah di-like oleh Pengunjung ini
            const likedProjectsCount = allProjectsRes.data.filter(project => {
              // Menyesuaikan format dari Sequelize (bisa "Likes" huruf besar atau "likes" huruf kecil)
              const projectLikes = project.Likes || project.likes || [];
              return projectLikes.some(like => like.user_id === userData.id);
            }).length;

            setTotalGivenLikes(likedProjectsCount);
          } catch (error) {
            console.error("Gagal menghitung jejak apresiasi:", error);
            setTotalGivenLikes(0);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]);

  /* ── Loading ── */
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#2C71B8] animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-400 tracking-wide">Memuat profil…</p>
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex justify-center items-center text-slate-500 font-medium">
      Profil tidak ditemukan.
    </div>
  );

  const isPengunjung = profileData.role_id === 3;
  const displayAvatar = profileData.avatar
    ? `http://localhost:3000/uploads/${profileData.avatar}`
    : DEFAULT_AVATAR;

 /* ── Derived stats (Menghitung Total Like & Views) ── */
  const totalLikes  = myProjects.reduce((sum, p) => sum + Number(p.likes_count || 0), 0);
  const totalViews  = myProjects.reduce((sum, p) => sum + Number(p.views || 0), 0);
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-12 pb-28">

        {/* ══════════════════════════════════════════════════════
            HERO PROFILE
        ══════════════════════════════════════════════════════ */}
        <div className="relative rounded-[2rem] overflow-hidden mb-8">

          {/* Glass surface */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[2rem]" />

          {/* Ambient glow blobs */}
          <div className={`absolute -top-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none
            ${isPengunjung ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          <div className={`absolute -bottom-16 -right-10 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none
            ${isPengunjung ? 'bg-teal-400' : 'bg-indigo-400'}`} />

          <div className="relative z-10 p-7 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-7">

              {/* ── Avatar ── */}
              <div className="relative shrink-0">
                {/* Gradient ring */}
                <div className={`absolute -inset-[3px] rounded-full blur-[2px] opacity-80
                  ${isPengunjung
                    ? 'bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-400'
                    : 'bg-gradient-to-br from-[#2C71B8] via-blue-400 to-indigo-500'}`} />
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-[3px] bg-white shadow-xl">
                  <img
                    src={displayAvatar}
                    alt={profileData.nama_user}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {/* Floating badge */}
                {isPengunjung ? (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-[7px] rounded-full border-[3px] border-white shadow-md z-20">
                    <Crown size={14} className="fill-white" />
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#2C71B8] to-indigo-600 text-white p-[7px] rounded-full border-[3px] border-white shadow-md z-20">
                    <Award size={14} className="fill-white text-white" />
                  </div>
                )}
              </div>

              {/* ── Identity ── */}
              <div className="flex-1 text-center md:text-left min-w-0">

                {/* Role pill */}
                <div className="flex justify-center md:justify-start mb-2">
                  {isPengunjung ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Sparkles size={10} /> PENGUNJUNG
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#2C71B8] border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Zap size={10} /> MAHASISWA
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                  {profileData.nama_user}
                </h1>

                {/* Academic info */}
                {!isPengunjung && (
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start flex-wrap gap-2">
                    <span className="text-[#2C71B8]">{profileData.prodi || "Prodi Belum Diisi"}</span>
                    <span className="text-slate-300">·</span>
                    <span>Angkatan {profileData.angkatan || "—"}</span>
                  </p>
                )}

                {/* Bio */}
                <p className="text-[14px] text-slate-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                  {profileData.bio || "Belum ada bio. Edit profil untuk menambahkan deskripsi diri."}
                </p>

                {/* External link */}
                {profileData.website && (
                  <a
                    href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                    target="_blank" rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all
                      ${isPengunjung ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-50 text-[#2C71B8] hover:bg-blue-100'}`}
                  >
                    <LinkIcon size={11} /> Tautan Eksternal
                  </a>
                )}
              </div>

              {/* ── Quick Action Panel ── */}
              <div className="shrink-0 flex flex-row md:flex-col gap-2 flex-wrap justify-center">
                <ActionBtn to="/profile/settings" icon={Settings} label="Edit Profil" primary />
              </div>

            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            STATISTICS — BENTO GRID (Mahasiswa only)
        ══════════════════════════════════════════════════════ */}
        {!isPengunjung && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Layers}   label="Portfolio"   value={myProjects.length} gradient="bg-gradient-to-br from-blue-50 to-indigo-50"    iconColor="text-[#2C71B8]"  delay={0}   />
            <StatCard icon={Heart}    label="Total Suka"  value={totalLikes}         gradient="bg-gradient-to-br from-rose-50 to-pink-50"        iconColor="text-rose-500"    delay={60}  />
            <StatCard icon={Eye}      label="Total Dilihat" value={totalViews}       gradient="bg-gradient-to-br from-violet-50 to-purple-50"    iconColor="text-violet-500"  delay={120} />
            <StatCard icon={Star}     label="Achievement" value="Top 10%"            gradient="bg-gradient-to-br from-amber-50 to-yellow-50"    iconColor="text-amber-500"   delay={180} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            MAHASISWA — PORTFOLIO SHOWCASE
        ══════════════════════════════════════════════════════ */}
        {!isPengunjung && (
          <section>
            {/* Section header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Portfolio Showcase</h2>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                  {myProjects.length} KARYA
                </span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

              {/* Add card — Dribbble-style upload */}
              <Link
                to="/manage-project"
                className="group relative aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur hover:border-[#2C71B8] hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 flex flex-col items-center justify-center gap-3 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-500 rounded-2xl" />
                <div className="relative z-10 w-12 h-12 bg-white shadow border border-slate-100 group-hover:bg-[#2C71B8] group-hover:border-[#2C71B8] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1">
                  <Plus size={22} className="text-slate-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="relative z-10 text-[12px] font-bold text-slate-400 group-hover:text-[#2C71B8] transition-colors">
                  Tambah Karya Baru
                </span>
              </Link>

              {/* Project cards */}
              {myProjects.map((project, i) => (
                <div
                  key={project.id}
                  className="animate-in fade-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ProjectCard project={project} isOwner={true} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════
            PENGUNJUNG — PREMIUM BENTO DASHBOARD
        ══════════════════════════════════════════════════════ */}
        {isPengunjung && (
          <section>
            <div className="mb-7">
              <span className="text-[10px] font-black tracking-[0.18em] text-emerald-600 uppercase bg-emerald-50 border border-emerald-200 inline-block px-3 py-1 rounded-full mb-2">
                Pengunjung
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Kolektor Mahakarya
              </h2>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* Card 1 — Hero CTA */}
              <div className="md:col-span-7 relative rounded-2xl overflow-hidden bg-[#060D1F] border border-slate-800 shadow-xl shadow-slate-900/20 p-8 group min-h-[220px] flex flex-col justify-between">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Grid lines (decorative) */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    <Rocket size={18} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                    Jelajahi Inovasi <span className="text-emerald-300">Tanpa Batas.</span>
                  </h3>
                  <p className="text-slate-400 text-[13px] font-medium leading-relaxed max-w-sm">
                    Akses karya terbaik, desain UI/UX, dan aplikasi inovatif dari talenta ITEBA.
                  </p>
                </div>

                <div className="relative z-10 mt-6">
                  <Link
                    to="/"
                    className="group/btn inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.03] active:scale-95 transition-all shadow"
                  >
                    Mulai Eksplorasi
                    <TrendingUp size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Card 2 — Apresiasi */}
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 border border-emerald-400/50 shadow-lg p-8 flex flex-col justify-between min-h-[200px]">
                <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                  <Heart size={130} className="fill-white" />
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 border border-white/30 backdrop-blur rounded-xl flex items-center justify-center mb-5">
                    <Heart size={17} className="fill-white text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">Kekuatan Apresiasi</h3>
                  <p className="text-emerald-50 text-[13px] font-medium leading-relaxed opacity-90">
                    Satu <em>Like</em> dari Anda adalah motivasi besar bagi mahasiswa untuk terus berkarya.
                  </p>
                </div>
              </div>

              {/* Card 3 — Trending */}
              <div className="md:col-span-4 relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 group min-h-[160px] flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <Flame size={16} className="text-orange-500" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1">Trending Sekarang</h3>
                  <p className="text-[12px] text-slate-500 font-medium">Karya paling banyak dilihat minggu ini.</p>
                </div>
                <Link to="/" className="relative z-10 mt-4 text-[12px] font-bold text-orange-500 hover:text-orange-600 inline-flex items-center gap-1 transition-colors">
                  Lihat Semua <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Card 4 — Jejak Apresiasi (Dinamis) */}
              <div className="md:col-span-4 relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 group min-h-[160px] flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-9 h-9 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <Heart size={16} className="text-violet-500" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1">Jejak Apresiasi</h3>
                  <p className="text-[12px] text-slate-500 font-medium">Jumlah dukungan yang telah Anda berikan untuk kreator ITEBA.</p>
                </div>
                <div className="relative z-10 mt-4 flex items-center gap-2">
                  {/* --- MENAMPILKAN ANGKA TOTAL LIKE DINAMIS --- */}
                  <span className="text-xl font-black text-violet-600">{totalGivenLikes}</span>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Karya Disukai</span>
                </div>
              </div>

              {/* Card 5 — Exclusive Access */}
              <div className="md:col-span-4 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B1120] to-slate-900 border border-slate-700 shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 group min-h-[160px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-9 h-9 bg-white/10 border border-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 size={16} className="text-blue-400" />
                  </div>
                  <h3 className="text-base font-black text-white mb-1">Exclusive Access</h3>
                  <p className="text-[12px] text-slate-400 font-medium">Akses penuh ke seluruh portofolio digital kampus.</p>
                </div>
                <div className="relative z-10 mt-4">
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-[11px] font-bold">
                   Pengunjung
                  </span>
                </div>
              </div>

            </div>
          </section>
        )}

      </main>
    </div>
  );
} 