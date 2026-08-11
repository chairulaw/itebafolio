import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTO_SLIDE_INTERVAL = 5000;

export default function HeroSlider({ projects = [] }) {
  // PERBAIKAN: Gunakan useMemo dan pengurutan kebal peluru (berdasarkan ID tertinggi)
  const slides = useMemo(() => {
    if (!projects || !Array.isArray(projects) || projects.length === 0) return [];
    
    // 1. Kita buat salinan datanya
    const sorted = [...projects].sort((a, b) => {
      // 2. Ambil waktu (mencakup dua format penamaan database umum)
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
      
      // 3. Prioritas Pertama: Waktu terbaru
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      
      // 4. Prioritas Kedua (Jika waktu persis sama): ID Terbesar
      return (b.id || 0) - (a.id || 0);
    });

    // ALAT PENDETEKSI: Buka Inspect Element -> Console di browser Anda
    console.log("1. Total Semua Project:", projects.length);
    console.log("2. 3 Project Terbaru untuk Slider:", sorted.slice(0, 3).map(p => p.judul_project));

    return sorted.slice(0, 3);
  }, [projects]);

  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      if (slides.length === 0) return;
      setCurrent(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  const restartAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (slides.length <= 1 || isHovered) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);
  }, [slides.length, isHovered]);

  useEffect(() => {
    restartAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restartAutoSlide]);

  const handleManualNav = (action) => {
    action();
    restartAutoSlide();
  };

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full h-[60vh] md:h-[70vh] max-h-[600px] rounded-3xl overflow-hidden mb-16 md:mb-20 shadow-xl shadow-blue-900/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- TRACK CAROUSEL --- */}
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((project) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            className="relative h-full shrink-0"
            style={{ width: `${100 / slides.length}%` }}
          >
            <img
              src={
                project.cover
                  ? `/uploads/${project.cover}`
                  : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'
              }
              alt={project.judul_project}
              className="w-full h-full object-cover"
              draggable={false}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'; }}
            />

            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-500 pointer-events-none ${
                isHovered ? 'opacity-100' : 'opacity-70'
              }`}
            />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <span className="inline-block mb-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-blue-300">
                Karya Terbaru
              </span>
              <h3 className="font-title text-2xl md:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight max-w-2xl leading-tight">
                {project.judul_project}
              </h3>
              {project.user?.nama_user && (
                <p className="mt-2 text-sm md:text-base text-gray-200/90 font-light">
                  {project.user.nama_user}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* --- TOMBOL NAVIGASI KIRI/KANAN --- */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => handleManualNav(goPrev)}
            aria-label="Karya sebelumnya"
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:bg-black/50 hover:scale-105"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => handleManualNav(goNext)}
            aria-label="Karya selanjutnya"
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 hover:bg-black/50 hover:scale-105"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <ChevronRight size={22} />
          </button>

          {/* --- INDIKATOR TITIK --- */}
          <div className="absolute bottom-4 right-6 md:right-10 z-20 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleManualNav(() => goTo(i))}
                aria-label={`Ke slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-400 ${
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}