import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../utils/api';

export default function CategoryBar() {
  const [dynamicCategories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error("Gagal memuat kategori untuk menu bar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 1. Menu Utama Statis (Selalu Ada di Paling Depan)
  const staticMenus = [
    {
      slug: 'fyp',
      label: 'FYP',
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    },
    {
      slug: 'most-liked',
      label: 'MOST LIKED',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-4">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-[#2C71B8] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-gray-100 bg-white/40 backdrop-blur-md sticky top-16 z-30 py-5">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Kontainer Scroll Horizontal Otomatis jika Menu Panjang */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1 select-none">
          
          {/* RENDER 1: Menu Statis (FYP & Most Liked) */}
          {staticMenus.map((menu) => (
            <NavLink
              key={menu.slug}
              to={`/filter/${menu.slug}`}
              className={({ isActive }) => `
                relative flex-shrink-0 min-w-[140px] h-14 rounded-2xl flex items-center justify-center 
                overflow-hidden border font-title font-black text-xs uppercase tracking-wider 
                transition-all duration-300 group shadow-sm
                ${isActive 
                  ? 'border-[#2C71B8] ring-2 ring-[#2C71B8]/10 text-white shadow-md' 
                  : 'border-gray-200 text-white hover:border-gray-400 hover:-translate-y-0.5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Background Image + Lapisan Gelap Gelap */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${menu.img})` }}
                  />
                  <div className={`absolute inset-0 transition-colors duration-300 ${isActive ? 'bg-black/50' : 'bg-black/60 group-hover:bg-black/50'}`} />
                  
                  {/* Teks Label */}
                  <span className="relative z-10 text-center px-4 drop-shadow-md">{menu.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* RENDER 2: Kategori Dinamis dari Database Hasil Input Admin */}
          {dynamicCategories.map((category) => {
            const bannerImg = category.image 
              ? `http://localhost:3000/uploads/${category.image}`
              : 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80';

            return (
              <NavLink
                key={category.id}
                to={`/filter/${category.slug}`}
                className={({ isActive }) => `
                  relative flex-shrink-0 min-w-[150px] h-14 rounded-2xl flex items-center justify-center 
                  overflow-hidden border font-title font-black text-xs uppercase tracking-wider 
                  transition-all duration-300 group shadow-sm
                  ${isActive 
                    ? 'border-[#2C71B8] ring-2 ring-[#2C71B8]/10 text-white shadow-md' 
                    : 'border-gray-200 text-white hover:border-gray-400 hover:-translate-y-0.5'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${bannerImg})` }}
                    />
                    <div className={`absolute inset-0 transition-colors duration-300 ${isActive ? 'bg-black/50' : 'bg-black/60 group-hover:bg-black/50'}`} />
                    
                    <span className="relative z-10 text-center px-4 drop-shadow-md">{category.nama_kategori}</span>
                  </>
                )}
              </NavLink>
            );
          })}

        </div>
      </div>
    </div>
  );
}