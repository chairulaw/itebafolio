import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderGit2,
  AlertOctagon,
  TrendingUp,
  Trash2,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Sparkles,
  CheckCircle2,
  Heart,
  MessageCircle,
  Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, LabelList
} from 'recharts';
import toast from 'react-hot-toast';
import api from "../../utils/api";

// ─── Skeleton Shimmer Component ───────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded-2xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-8 max-w-7xl mx-auto">
    <style>{`
      @keyframes shimmer { 100% { transform: translateX(100%); } }
    `}</style>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <Shimmer className="w-14 h-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-24 rounded-lg" />
              <Shimmer className="h-8 w-16 rounded-lg" />
            </div>
          </div>
          <Shimmer className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <Shimmer className="h-5 w-40 rounded-lg" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
          <Shimmer className="h-64 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit = '', labelPrefix = '' }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const fullLabel = payload[0].payload?.fullName || label;
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 max-w-[240px]">
        <p className="text-xs font-medium text-gray-400 mb-1 truncate">{labelPrefix}{fullLabel}</p>
        <p className="text-lg font-bold leading-tight">
          {Number(value).toLocaleString('id-ID')}
          {unit && <span className="text-xs font-medium text-gray-400 ml-1.5">{unit}</span>}
        </p>
      </div>
    );
  }
  return null;
};

const BarValueLabel = (props) => {
  const { x, y, width, height, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text x={x + width + 8} y={y + height / 2} dy={4} textAnchor="start" className="fill-gray-700 font-bold" style={{ fontSize: 12 }}>
      {Number(value).toLocaleString('id-ID')}
    </text>
  );
};

const AreaValueLabel = (props) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text x={x} y={y - 10} textAnchor="middle" className="fill-blue-700 font-bold" style={{ fontSize: 11 }}>
      {Number(value).toLocaleString('id-ID')}
    </text>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingViolations: 0,
    totalInteractions: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/dashboard');
        setTrendData(statsRes.data.charts.trends);

        // ========================================================
        // KALKULASI DINAMIS: Distribusi Prodi & Total Interaksi
        // ========================================================
        const projectsRes = await api.get('/projects');
        const allProjects = projectsRes.data;

        const prodiCounts = {
          'Sistem Informasi': 0, 'DKV': 0, 'Teknik Komputer': 0, 'Matematika': 0
        };

        let calculatedInteractions = 0;

        allProjects.forEach(project => {
          // Hitung Prodi
          const userProdi = (project.user?.prodi || project.User?.prodi || '').toLowerCase().trim();
          if (userProdi === 'sistem informasi') prodiCounts['Sistem Informasi']++;
          else if (userProdi === 'desain komunikasi visual' || userProdi === 'dkv') prodiCounts['DKV']++;
          else if (userProdi === 'teknik komputer') prodiCounts['Teknik Komputer']++;
          else if (userProdi === 'matematika') prodiCounts['Matematika']++;

          // Hitung Interaksi (Like + Komentar)
          const likes = project.Likes?.length || project.likes?.length || 0;
          const comments = project.Comments?.length || project.comments?.length || 0;
          calculatedInteractions += (likes + comments);
        });

        const formattedProdiData = [
          { name: 'Sistem Informasi', total: prodiCounts['Sistem Informasi'] },
          { name: 'DKV', total: prodiCounts['DKV'] },
          { name: 'Teknik Komputer', total: prodiCounts['Teknik Komputer'] },
          { name: 'Matematika', total: prodiCounts['Matematika'] }
        ].filter(item => item.total > 0); 

        setCategoryData(formattedProdiData);
        setStats({
          ...statsRes.data.stats,
          totalInteractions: calculatedInteractions
        });

        // ========================================================
        // FORMAT LOG PELANGGARAN
        // ========================================================
        const logsRes = await api.get('/admin/violations');
        const formattedLogs = logsRes.data.data
          .filter(log => log.status !== 'resolved' && log.status !== 'selesai' && log.status !== 'Resolved')
          .map(log => {
            const authorName = log.User?.nama_user || log.user?.nama_user || log.Comment?.User?.nama_user || log.Project?.User?.nama_user || 'Anonim';
            const entityName = log.entitas_nama || (log.tipe_entitas?.toUpperCase() === 'PROJECT' ? log.Project?.judul_project : log.Comment?.komentar) || `ID: ${log.entitas_id}`;

            return {
              id: log.id,
              type: log.tipe_entitas,
              name: entityName,
              author: authorName,
              reason: log.alasan,
              date: new Date(log.created_at).toLocaleDateString('id-ID')
            };
          });
          
        setViolations(formattedLogs);

      } catch (error) {
        if (error.response?.status === 403) {
          toast.error("Akses ditolak: Area khusus Administrator.");
        } else {
          console.error("Gagal memuat data admin:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // FUNGSI AKSI MODERASI: HAPUS vs PULIHKAN
  const handleModerationAction = async (id, actionType) => {
    if (actionType === 'delete') {
      if (window.confirm('Hapus permanen data (Project/Komentar) yang melanggar ini?')) {
        const loadingId = toast.loading('Menghapus data...');
        try {
          await api.delete(`/admin/violations/${id}`);
          setViolations(violations.filter(v => v.id !== id));
          toast.success('Data pelanggaran berhasil dihapus permanen.', { id: loadingId });
        } catch (error) {
          toast.error('Gagal menghapus data.', { id: loadingId });
        }
      }
    } else if (actionType === 'resolve') {
      if (window.confirm('Abaikan laporan ini dan pulihkan statusnya?')) {
        const loadingId = toast.loading('Memulihkan status...');
        try {
          await api.put(`/admin/violations/${id}`, { status: 'resolved' });
          setViolations(violations.filter(v => v.id !== id));
          toast.success('Laporan diabaikan, data dipulihkan.', { id: loadingId });
        } catch (error) {
          toast.error('Gagal memulihkan status.', { id: loadingId });
        }
      }
    }
  };

  const totalCategoryProjects = categoryData.reduce((sum, c) => sum + (c.total || 0), 0);

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6 md:p-8">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <SkeletonLoader />
    </div>
  );

  return (
    <div className="relative min-h-screen from-slate-50 via-blue-50/30 to-slate-50">

      {/* Global styles */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blobFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-24px) scale(1.04); } }
        @keyframes pulseGlow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease both; }
        .animate-blob { animation: blobFloat 8s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .card-hover { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px -12px rgba(0,0,0,0.12); }
        .row-hover { transition: background 0.15s ease; }
      `}</style>

      {/* Decorative ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-200/25 blur-3xl animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <div className="animate-blob absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        <div className="animate-blob absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-violet-200/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 space-y-8 max-w-7xl mx-auto p-6 md:p-8">

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>

          {/* Card 1: Total Pengguna */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-100/60 shadow-sm shadow-blue-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-[48px] h-[48px] rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Users size={22} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                <ArrowUpRight size={10} /> AKTIF
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Pengguna</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalUsers.toLocaleString('id-ID')}</h3>
          </div>

          {/* Card 2: Total Project */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-100/60 shadow-sm shadow-emerald-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-[48px] h-[48px] rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <FolderGit2 size={22} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                <Activity size={10} /> LIVE
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Karya Diunggah</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalProjects.toLocaleString('id-ID')}</h3>
          </div>

          {/* Card 3: Total Interaksi (Baru) */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-violet-100/60 shadow-sm shadow-violet-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-[48px] h-[48px] rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Heart size={22} className="text-white fill-white/20" />
              </div>
            </div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Interaksi</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalInteractions.toLocaleString('id-ID')}</h3>
          </div>

          {/* Card 4: Kasus Pelanggaran */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-red-100/60 shadow-sm shadow-red-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -right-5 -bottom-5 text-red-100/70 group-hover:scale-110 group-hover:text-red-200/80 transition-all duration-300 pointer-events-none">
              <AlertOctagon size={80} strokeWidth={1} />
            </div>
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-[48px] h-[48px] rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
                <AlertOctagon size={22} className="text-white" />
              </div>
              {stats.pendingViolations > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full animate-pulse">
                  ● PERLU TINDAK
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-red-400 uppercase tracking-widest mb-1">Moderasi Aktif</p>
            <h3 className="text-3xl font-black text-red-600 tracking-tight">{stats.pendingViolations}</h3>
          </div>
        </div>

        {/* ── CHARTS SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>

          {/* Chart 1: Tren Upload */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp size={14} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Tren Upload Project</h3>
                </div>
                <p className="text-xs text-gray-400 ml-9">Jumlah project baru yang diunggah, per bulan</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-blue-300 shrink-0">
                <Sparkles size={9} /> MONTHLY
              </span>
            </div>

            {trendData.length === 0 ? (
              <div className="h-64 w-full flex flex-col items-center justify-center gap-2 text-center">
                <TrendingUp size={28} className="text-gray-200" />
                <p className="text-xs text-gray-400">Belum ada data upload untuk ditampilkan.</p>
              </div>
            ) : (
              <div className="w-full h-[300px] relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 24, right: 12, bottom: 0, left: -8 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2C71B8" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#2C71B8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      width={35}
                      label={{
                        value: 'Jumlah Project',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 10, fill: '#94a3b8', fontWeight: 600 },
                        dx: 12
                      }}
                    />
                    <Tooltip
                      content={<CustomTooltip unit="project" labelPrefix="Bulan " />}
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="projects"
                      name="Project"
                      stroke="#2C71B8"
                      strokeWidth={3}
                      fill="url(#trendGrad)"
                      dot={{ r: 4, fill: '#2C71B8', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#2C71B8', stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="projects" content={<AreaValueLabel />} />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Distribusi Prodi */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/25 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Activity size={14} className="text-violet-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Distribusi Program Studi</h3>
                </div>
                <p className="text-xs text-gray-400 ml-9">
                  Total {totalCategoryProjects.toLocaleString('id-ID')} project terdata
                </p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-violet-300 shrink-0">
                <Sparkles size={9} /> ALL TIME
              </span>
            </div>

            {categoryData.length === 0 ? (
              <div className="h-64 w-full flex flex-col items-center justify-center gap-2 text-center">
                <Activity size={28} className="text-gray-200" />
                <p className="text-xs text-gray-400">Belum ada data project untuk ditampilkan.</p>
              </div>
            ) : (
              <div className="w-full h-[300px] relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 45, bottom: 0, left: 24 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6d28d9" />
                        <stop offset="30%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }}
                      width={135}
                    />
                    <Tooltip
                      content={<CustomTooltip unit="project" labelPrefix="Prodi " />}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="total" name="Total Project" fill="url(#barGrad)" radius={[0, 8, 8, 0]} barSize={20}>
                      <LabelList dataKey="total" content={<BarValueLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── MODERATION TABLE ── */}
        <div className="animate-fade-in-up bg-white/85 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden" style={{ animationDelay: '0.25s' }}>
          
          <div className="px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-red-50/50 via-rose-50/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm shadow-red-200">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Moderasi Aktif</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Tinjau konten yang disensor otomatis oleh sistem</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {violations.length > 0 ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-100 border border-red-200/60 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                  {violations.length} Kasus Aktif
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={12} /> Sistem Bersih
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
                  <th className="px-7 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tipe</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Konten / Entitas</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Oleh</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Alasan Deteksi</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Aksi (Tindak Lanjut)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {violations.map((v, idx) => (
                  <tr
                    key={v.id}
                    className="row-hover hover:bg-red-50/30 group/row"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <td className="px-7 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg tracking-wide ${
                        v.type === 'Project'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-violet-50 text-violet-700 border border-violet-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${v.type === 'Project' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-800 max-w-[280px] whitespace-pre-wrap">{v.name}</td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase shrink-0">
                          {(v.author || 'A')[0]}
                        </span>
                        {v.author}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-red-600 font-medium text-xs bg-red-50/70 px-2.5 py-1 rounded-lg border border-red-100/60">
                        ⚠ {v.reason}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleModerationAction(v.id, 'resolve')}
                          title="Abaikan & Pulihkan"
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors font-semibold text-[11px]"
                        >
                          <Check size={14} /> Pulihkan
                        </button>
                        <button
                          onClick={() => handleModerationAction(v.id, 'delete')}
                          title="Hapus Permanen"
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-colors font-semibold text-[11px]"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {violations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Sistem Bersih</p>
                          <p className="text-gray-400 text-xs mt-1">Tidak ada pelanggaran yang perlu ditindaklanjuti.</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">● SEMUA AMAN</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}