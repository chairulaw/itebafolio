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
  CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts';
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
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes blobFloat { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
    `}</style>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 space-y-2">
        <Shimmer className="h-6 w-48 rounded-lg" />
        <Shimmer className="h-3 w-72 rounded-lg" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-gray-50 flex items-center gap-6">
          <Shimmer className="h-6 w-16 rounded-md" />
          <Shimmer className="h-4 w-40 rounded-lg" />
          <Shimmer className="h-4 w-28 rounded-lg" />
          <Shimmer className="h-4 flex-1 rounded-lg" />
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10">
        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingViolations: 0
  });

  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/dashboard');
        setStats(statsRes.data.stats);
        setTrendData(statsRes.data.charts.trends);
        setCategoryData(statsRes.data.charts.categories);

        const logsRes = await api.get('/admin/violations');
        const formattedLogs = logsRes.data.data.map(log => ({
          id: log.id,
          type: log.tipe_entitas,
          name: log.tipe_entitas === 'Project' ? log.Project?.judul_project : log.User?.nama_user,
          author: log.User?.nama_user || 'Anonim',
          reason: log.alasan,
          date: new Date(log.created_at).toLocaleDateString('id-ID')
        }));
        setViolations(formattedLogs);

      } catch (error) {
        if (error.response?.status === 403) {
          alert("Akses ditolak: Area khusus Administrator.");
        } else {
          console.error("Gagal memuat data admin:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDelete = async (id, type) => {
    if (window.confirm(`Selesaikan kasus pelanggaran ${type} ini? (Data terkait akan dihapus)`)) {
      try {
        await api.put(`/admin/violations/${id}`, { status: 'resolved' });
        setViolations(violations.filter(v => v.id !== id));
        alert('Kasus berhasil ditindaklanjuti.');
      } catch (error) {
        alert('Gagal menindaklanjuti pelanggaran.');
        console.error(error);
      }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6 md:p-8">
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <SkeletonLoader />
    </div>
  );

  return (
    <div className="relative min-h-screen  from-slate-50 via-blue-50/30 to-slate-50">

      {/* Global styles */}
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
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

      {/* ── Decorative ambient blobs ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-200/25 blur-3xl animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <div className="animate-blob absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
        <div className="animate-blob absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-violet-200/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '5s' }} />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 space-y-8 max-w-7xl mx-auto p-6 md:p-8">

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>

          {/* Card: Total Pengguna */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-100/60 shadow-sm shadow-blue-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Users size={24} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                <ArrowUpRight size={10} /> AKTIF
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Pengguna</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.totalUsers.toLocaleString()}</h3>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '72%' }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">72% dari kapasitas</p>
          </div>

          {/* Card: Total Project */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-100/60 shadow-sm shadow-emerald-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <FolderGit2 size={24} className="text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                <Activity size={10} /> LIVE
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Project</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stats.totalProjects.toLocaleString()}</h3>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: '58%' }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">58% proyek publik</p>
          </div>

          {/* Card: Kasus Pelanggaran */}
          <div className="group card-hover relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-red-100/60 shadow-sm shadow-red-100/50 overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Decorative ghost icon */}
            <div className="absolute -right-5 -bottom-5 text-red-100/70 group-hover:scale-110 group-hover:text-red-200/80 transition-all duration-300 pointer-events-none">
              <AlertOctagon size={96} strokeWidth={1} />
            </div>
            <div className="relative flex items-start justify-between mb-5">
              <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
                <AlertOctagon size={24} className="text-white" />
              </div>
              {stats.pendingViolations > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full animate-pulse">
                  ● PERLU TINDAK
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Kasus Pelanggaran</p>
            <h3 className="text-4xl font-black text-red-600 tracking-tight">{stats.pendingViolations}</h3>
            <div className="mt-4 h-1 w-full bg-red-50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full" style={{ width: `${Math.min((stats.pendingViolations / 20) * 100, 100)}%` }} />
            </div>
            <p className="text-[11px] text-red-400 mt-1.5">Menunggu penyelesaian</p>
          </div>
        </div>

        {/* ── CHARTS SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>

          {/* Chart 1: Tren Upload */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp size={14} className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Tren Upload Project</h3>
                </div>
                <p className="text-xs text-gray-400 ml-9">Aktivitas unggah per bulan</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-blue-300">
                <Sparkles size={9} /> MONTHLY
              </span>
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2C71B8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2C71B8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5 }} />
                  <Area type="monotone" dataKey="projects" stroke="#2C71B8" strokeWidth={3} fill="url(#trendGrad)" dot={{ r: 4, fill: '#2C71B8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#2C71B8', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Distribusi Prodi */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/25 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Activity size={14} className="text-violet-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">Distribusi Program Studi</h3>
                </div>
                <p className="text-xs text-gray-400 ml-9">Total project per prodi</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-violet-300">
                <Sparkles size={9} /> ALL TIME
              </span>
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 16 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6d28d9" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={110} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="total" fill="url(#barGrad)" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── MODERATION TABLE ── */}
        <div className="animate-fade-in-up bg-white/85 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden" style={{ animationDelay: '0.25s' }}>

          {/* Table Header */}
          <div className="px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-red-50/50 via-rose-50/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm shadow-red-200">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Moderasi Aktif</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Deteksi otomatis sistem terhadap konten tidak pantas</p>
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
                  <th className="px-7 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tipe</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama / Judul</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kreator</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Alasan Deteksi</th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-7 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
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
                    <td className="px-4 py-4 font-semibold text-gray-800 max-w-[200px] truncate">{v.name}</td>
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
                    <td className="px-4 py-4 text-xs text-gray-400 font-medium">{v.date}</td>
                    <td className="px-7 py-4 text-right">
                      <button
                        onClick={() => handleDelete(v.id, v.type)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-200/60 rounded-xl transition-all duration-200 font-semibold text-[11px] group-hover/row:border-red-300"
                      >
                        <Trash2 size={12} />
                        Selesaikan
                      </button>
                    </td>
                  </tr>
                ))}

                {violations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Sistem Bersih</p>
                          <p className="text-gray-400 text-xs mt-1">Tidak ada pelanggaran yang terdeteksi saat ini.</p>
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