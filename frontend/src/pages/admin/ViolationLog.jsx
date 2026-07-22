import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  MoreVertical,
  X,
  MessageSquare, 
  User,          
  Folder,        
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast'
import api from '../../utils/api';

export default function ViolationLog() {
  const [violations, setViolations] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE UNTUK MODAL TINJAU SPESIFIK ---
  const [selectedViolation, setSelectedViolation] = useState(null);

  const fetchViolations = async () => {
    try {
      const response = await api.get('/admin/violations');
      const formattedData = response.data.data.map(v => ({
        id: v.id,
        displayId: `V-${1000 + v.id}`, 
        type: v.tipe_entitas,
        entityId: v.entitas_id,
        entityName: v.entitas_nama || `${v.tipe_entitas} ID: ${v.entitas_id}`, 
        creator: v.user?.nama_user || v.User?.nama_user || 'Nama Tidak Ditemukan',
        creatorId: v.user?.nim || v.User?.nim || '-',
        reason: v.alasan,
        status: v.status,
        date: new Date(v.created_at).toLocaleString('id-ID', { 
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' 
        }) + ' WIB',
        severity: 'high' 
      }));
      setViolations(formattedData);
    } catch (error) {
      toast.error("Gagal mengambil log pelanggaran.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  // --- HANDLER AKSI DI TABEL UTAMA ---
  const handleAction = async (id, actionType) => {
    const isDelete = actionType === 'delete';
    const confirmMsg = isDelete 
      ? 'Hapus konten ini secara permanen dari sistem?' 
      : 'Abaikan laporan ini? Konten dianggap aman.';

    if (window.confirm(confirmMsg)) {
      try {
        const newStatus = isDelete ? 'resolved' : 'dismissed';
        await api.put(`/admin/violations/${id}`, { status: newStatus });
        setViolations(violations.map(v => v.id === id ? { ...v, status: newStatus } : v));
      } catch (error) {
        toast.error("Gagal memproses tindakan.");
        console.error(error);
      }
    }
  };

  // --- HANDLER AKSI DARI DALAM MODAL ---
  const handleModalAction = async (actionType) => {
    if (!selectedViolation) return;
    
    const isDelete = actionType === 'delete';
    const confirmMsg = isDelete 
      ? `Tindakan ini akan menghapus ${selectedViolation.type} tersebut secara permanen. Lanjutkan?` 
      : 'Tandai laporan ini sebagai aman dan abaikan?';

    if (window.confirm(confirmMsg)) {
      try {
        const newStatus = isDelete ? 'resolved' : 'dismissed';
        await api.put(`/admin/violations/${selectedViolation.id}`, { status: newStatus });
        
        setViolations(violations.map(v => v.id === selectedViolation.id ? { ...v, status: newStatus } : v));
        setSelectedViolation(null);
      } catch (error) {
        toast.error("Gagal memproses tindakan.");
        console.error(error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-md bg-orange-100 text-orange-700">Menunggu Tindakan</span>;
      case 'resolved': return <span className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-700">Telah Dihapus</span>;
      case 'dismissed': return <span className="px-3 py-1.5 text-[11px] font-bold uppercase rounded-md bg-gray-100 text-gray-500">Diabaikan (Aman)</span>;
      default: return null;
    }
  };

  const displayedViolations = violations.filter(v => {
    const matchTab = activeTab === 'all' ? true : v.status === 'pending';
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      v.displayId.toLowerCase().includes(searchLower) ||
      v.entityName.toLowerCase().includes(searchLower) ||
      v.type.toLowerCase().includes(searchLower) ||
      v.creator.toLowerCase().includes(searchLower);
    return matchTab && matchSearch;
  });

  const getEntityIcon = (type) => {
    if (type === 'Comment') return <MessageSquare size={24} />;
    if (type === 'Project') return <Folder size={24} />;
    return <User size={24} />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Log Pelanggaran Sistem
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan tindak lanjuti konten atau pengguna yang terdeteksi melanggar pedoman komunitas.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-gray-50 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'pending' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Perlu Tindakan <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">{violations.filter(v => v.status === 'pending').length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Semua Riwayat
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari ID, Kreator, atau Entitas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2C71B8]/20 transition-all" 
            />
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 text-center text-gray-500">Memuat log pelanggaran...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">ID Pelanggaran</th>
                  <th className="px-6 py-4 min-w-[200px]">Tipe & Entitas</th>
                  <th className="px-6 py-4 min-w-[150px]">Kreator</th>
                  <th className="px-6 py-4 min-w-[300px]">Alasan & Waktu Deteksi</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-gray-400">{v.displayId}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          v.type === 'Project' ? 'bg-blue-50 text-blue-500' : 
                          v.type === 'User Profile' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'
                        }`}>
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 mb-0.5 text-base">{v.entityName}</p>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{v.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-medium text-gray-800">{v.creator}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{v.creatorId}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`font-medium ${v.severity === 'critical' ? 'text-red-600' : 'text-gray-800'} mb-1 flex items-start gap-2 leading-relaxed`}>
                        {v.severity === 'critical' && <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0"/>}
                        {v.reason}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{v.date}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      {v.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedViolation(v)} 
                            title="Tinjau Konten" 
                            className="p-2.5 text-gray-400 hover:text-[#2C71B8] hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Eye size={18} strokeWidth={2.5} />
                          </button>
                          
                          <button 
                            onClick={() => handleAction(v.id, 'dismiss')} 
                            title="Abaikan Laporan" 
                            className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          >
                            <CheckCircle size={18} strokeWidth={2.5} />
                          </button>
                          
                          <button 
                            onClick={() => handleAction(v.id, 'delete')} 
                            title="Hapus Konten" 
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button className="p-2.5 text-gray-300 hover:text-gray-600 rounded-xl transition-colors">
                          <MoreVertical size={20} strokeWidth={2.5} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {displayedViolations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <p className="text-gray-500 text-sm">Tidak ada log pelanggaran baru yang perlu ditinjau saat ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL TINJAU SPESIFIK                     */}
      {/* ========================================= */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${
                  selectedViolation.type === 'Project' ? 'bg-blue-50 text-blue-500' : 
                  selectedViolation.type === 'User Profile' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'
                }`}>
                  {getEntityIcon(selectedViolation.type)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Tinjau {selectedViolation.type}</h3>
                  <p className="text-sm font-mono text-gray-400 mt-0.5">{selectedViolation.displayId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedViolation(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Kreator / Pemilik</p>
                <p className="font-bold text-gray-900 text-lg">{selectedViolation.creator} <span className="text-gray-500 font-mono text-sm font-normal ml-1">({selectedViolation.creatorId})</span></p>
              </div>

              <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Konteks Pelanggaran</p>
                <p className="font-medium text-red-600 leading-relaxed">{selectedViolation.reason}</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Entitas yang Terdeteksi</p>
                <p className="font-medium text-gray-800">{selectedViolation.entityName}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Waktu: {selectedViolation.date}</span>
                  
                  {selectedViolation.type === 'Project' && (
                    <a 
                      href={`/project/${selectedViolation.entityId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#2C71B8] hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                    >
                      Buka Halaman Karya <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleModalAction('dismiss')}
                className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 font-bold rounded-xl transition-colors"
              >
                Abaikan (Aman)
              </button>
              <button
                onClick={() => handleModalAction('delete')}
                className="flex-1 px-4 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-sm shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> Hapus Konten
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}