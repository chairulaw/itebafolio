import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import HeroSlider from '../components/HeroSlider';
import { galleryFilters } from '../utils/mockData';
import api from '../utils/api';
import { motion } from 'framer-motion';

// HELPER: Pembuat Slug otomatis
const generateSlug = (text = '') => {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
};

export default function Homepage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          api.get('/projects'),
          api.get('/categories').catch(() => ({ data: [] }))
        ]);
        
        setProjects(projectsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const smoothEasing = [0.16, 1, 0.3, 1];

  const featuredProjects = projects.some(p => p.featured)
    ? projects.filter(p => p.featured)
    : [...projects].reverse().slice(0, 8);

  // 1. Filter Statis (FYP & Most Liked)
  const baseFilters = galleryFilters.filter(f => f.slug === 'fyp' || f.slug === 'most-liked');
  
  // 2. Filter Dinamis dari DB (Diperbaiki: Buat slug otomatis jika DB mengirim null)
  const dynamicFilters = categories.map(cat => ({
    slug: cat.slug || generateSlug(cat.nama_kategori), // <-- FIX DISINI
    label: cat.nama_kategori,
    image: cat.image ? `http://localhost:3000/uploads/${cat.image}` : 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80'
  }));

  // 3. Gabungkan tanpa difilter ulang
  const allFilters = [...baseFilters, ...dynamicFilters];

  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-20 w-full">

        {/* --- AREA JUDUL HALAMAN --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: smoothEasing }}
          className="text-center mb-16 md:mb-20 mt-4 md:mt-8 flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-title font-extrabold tracking-tighter text-gray-900 mb-4 leading-[1.1]">
            Galeri Karya <br className="md:hidden" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C71B8] to-blue-400">
              Mahasiswa
            </span>
          </h1>
          <h2 className="text-sm md:text-lg font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
            Institut Teknologi Batam
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 md:text-lg leading-relaxed font-light">
            Eksplorasi ide, inovasi, dan kreativitas tanpa batas dari para mahasiswa.
            Temukan proyek-proyek terbaik yang memadukan teknologi masa depan dan desain yang berpusat pada manusia.
          </p>
        </motion.div>

        {/* --- AREA HERO SLIDER --- */}
        {!isLoading && featuredProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            className="mb-16 md:mb-20"
          >
            <HeroSlider projects={featuredProjects} />
          </motion.div>
        )}

        {/* --- AREA FILTER CARD (Sudah Diperbaiki Key-nya) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: smoothEasing }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16"
        >
          {allFilters.map((filter, index) => (
            <Link
              key={filter.slug || `filter-${index}`}
              to={`/filter/${filter.slug}`}
              className="relative group overflow-hidden rounded-2xl px-6 h-12 md:h-14 grow sm:grow-0 sm:min-w-35 flex items-center justify-center font-bold text-xs sm:text-sm uppercase transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20"
            >
              <img
                src={filter.image}
                alt={filter.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500"></div>
              <span className="relative z-10 text-white text-center drop-shadow-md tracking-widest leading-tight">
                {filter.label}
              </span>
            </Link>
          ))}
        </motion.div>

        {/* --- AREA GRID PROJECT --- */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">Memuat karya-karya luar biasa...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: smoothEasing }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
          >
            {projects.length > 0 ? (
              projects.slice(0, 12).reverse().map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-10">Belum ada karya yang diunggah.</div>
            )}
          </motion.div>
        )}

      </main>
    </div>
  );
}