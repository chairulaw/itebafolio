import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search as SearchIcon, FileQuestion } from 'lucide-react';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';

export default function SearchResults() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();
  // Mengambil kata kunci dari URL (contoh: ?q=tanda baca)
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('q') || '';

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Memanggil API dengan query 'q'
        const res = await api.get(`/projects?q=${encodeURIComponent(keyword)}`);
        setProjects(res.data);
      } catch (error) {
        console.error("Gagal melakukan pencarian:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (keyword) {
      fetchSearchResults();
    } else {
      setProjects([]);
      setIsLoading(false);
    }
  }, [keyword]);

  return (
    <div className="min-h-screen ">
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-10 pb-24">
        
        {/* HEADER HASIL PENCARIAN */}
        <div className="mb-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-[#2C71B8] rounded-2xl flex items-center justify-center">
            <SearchIcon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Hasil Pencarian
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-[15px]">
              Menampilkan {projects.length} karya untuk <span className="text-[#2C71B8] font-bold">"{keyword}"</span>
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-[#2C71B8] rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Mencari di database...</p>
          </div>
        ) : (
          /* HASIL ATAU KOSONG */
          <>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-slate-200 border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FileQuestion size={40} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Portofolio tidak ditemukan</h3>
                <p className="text-slate-500 max-w-md text-center leading-relaxed">
                  Kami tidak dapat menemukan portofolio yang cocok dengan kata kunci <strong>"{keyword}"</strong>. Coba gunakan kata kunci lain.
                </p>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}