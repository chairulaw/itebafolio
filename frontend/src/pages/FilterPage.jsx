import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Inbox, Loader2 } from 'lucide-react';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';

// --- HELPER LOKAL ---
const generateSlug = (text = '') => {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
};

// --- DATA HEADER DINAMIS ---
const headerData = {
  'fyp': { label: 'FYP', desc: 'Kurasi karya mahasiswa yang sedang ramai dilihat dan dibagikan.', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80' },
  'most-liked': { label: 'Most Liked', desc: 'Pilihan proyek dengan apresiasi komunitas paling tinggi.', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80' },
  'frontend-web-development': { label: 'Frontend Web', desc: 'Eksplorasi antarmuka web, interaksi, dan implementasi kode.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80' },
  'ui-ux-design': { label: 'UI/UX Design', desc: 'Rancangan pengalaman pengguna dan antarmuka aplikasi intuitif.', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80' },
  'desain-grafis-branding': { label: 'Desain Grafis', desc: 'Eksplorasi identitas visual, branding, dan ilustrasi kreatif.', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80' },
  'aplikasi-mobile': { label: 'Mobile App', desc: 'Pengembangan aplikasi untuk perangkat Android maupun iOS.', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80' },
  'backend-sistem-informasi': { label: 'Backend & SI', desc: 'Arsitektur server, database, dan perancangan sistem informasi.', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80' },
  'sistem-informasi': { label: 'Sistem Informasi', desc: 'Menampilkan portofolio karya dari mahasiswa program studi Sistem Informasi.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80' },
  'teknik-komputer': { label: 'Teknik Komputer', desc: 'Menampilkan portofolio karya dari mahasiswa program studi Teknik Komputer.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80' },
  'dkv': { label: 'DKV', desc: 'Menampilkan portofolio karya dari mahasiswa program studi DKV.', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80' },
  'matematika': { label: 'Matematika', desc: 'Menampilkan portofolio karya dari mahasiswa program studi Matematika.', img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80' },
};

export default function FilterPage() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error("Gagal mengambil data karya:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [slug]); 

  // ==============================================================
  // 🧠 SAKLAR PINTAR: FILTER MULTI-DIMENSI
  // ==============================================================
  // 1. Tentukan jenis slug yang sedang diakses
  const isSpecialFilter = slug === 'fyp' || slug === 'most-liked';
  const prodiList = ['sistem-informasi', 'teknik-komputer', 'dkv', 'matematika'];
  const isProdiFilter = prodiList.includes(slug);

  // 2. Lakukan Penyaringan Data
  let filteredProjects = projects.filter((project) => {
    if (isSpecialFilter) {
      return true; // Jika FYP/Most Liked, loloskan semua dulu untuk diurutkan di bawah
    }

    if (isProdiFilter) {
      // Jika slug adalah nama Prodi, cocokkan dengan Prodi User
      const userProdi = project.user?.prodi || project.User?.prodi || '';
      return generateSlug(userProdi) === slug;
    } else {
      // Jika bukan Prodi dan bukan Spesial, berarti ini Kategori Karya (UI/UX, Web, dll)
      const projectCategory = project.kategori_id || '';
      return generateSlug(projectCategory) === slug;
    }
  });

// 3. Lakukan Pengurutan (Sorting)
  filteredProjects = filteredProjects.sort((a, b) => {
    // Jika filter yang dipilih adalah FYP atau Most Liked
    if (slug === 'most-liked' || slug === 'fyp') {
      // Mengambil jumlah like dari backend (likes_count)
      const likesA = parseInt(a.likes_count) || (a.Likes ? a.Likes.length : 0);
      const likesB = parseInt(b.likes_count) || (b.Likes ? b.Likes.length : 0);
      
      // Urutkan dari like terbanyak ke terkecil
      return likesB - likesA; 
    }
    
    // Untuk filter Prodi dan Kategori Karya: Urutkan dari yang paling baru diupload
    return new Date(b.created_at) - new Date(a.created_at);
  });
  // ==============================================================

  const activeInfo = headerData[slug] || {
    label: slug.replace(/-/g, ' ').toUpperCase(),
    desc: 'Menampilkan portofolio karya untuk kategori ini.',
    img: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80'
  };

  const smoothEasing = [0.16, 1, 0.3, 1];

  return (
    <div className="min-h-screen  flex flex-col relative pb-20">
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-8 pt-10 w-full">

        {/* AREA HERO DINAMIS */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: smoothEasing }}
          className="relative w-full rounded-4xl overflow-hidden mb-16 h-64 md:h-80 flex items-center justify-center border border-gray-200 shadow-sm"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${activeInfo.img})` }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
          
          <div className="relative z-10 text-center px-6">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
              {isProdiFilter ? 'Program Studi' : isSpecialFilter ? 'Eksplorasi' : 'Kategori Project'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-title font-black text-white tracking-tight mb-4 drop-shadow-lg">
              {activeInfo.label}
            </h1>
            <p className="max-w-2xl mx-auto text-gray-200 md:text-lg font-medium drop-shadow-md">
              {activeInfo.desc}
            </p>
          </div>
        </motion.div>

        {/* AREA GRID PROJECT */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={40} className="animate-spin text-[#2C71B8] mb-4" />
            <p className="font-bold tracking-wider uppercase text-sm">Menyaring Karya...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: smoothEasing }}
            className="w-full"
          >
            {filteredProjects.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Karya Tersedia</h2>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                    {filteredProjects.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 shadow-inner">
                  <Inbox size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Belum Ada Karya</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Wah, sepertinya belum ada portofolio yang relevan untuk <span className="font-bold text-gray-700">"{activeInfo.label}"</span> saat ini.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-8 px-8 py-3 bg-[#2C71B8] hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-1"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </motion.div>
        )}

      </main>
    </div>
  );
}