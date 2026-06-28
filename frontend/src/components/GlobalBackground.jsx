import React from 'react';

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#FBFBFB] pointer-events-none overflow-hidden">
      
      {/* CSS internal khusus untuk animasi Aurora yang bergerak sangat lambat dan mulus */}
      <style>{`
        @keyframes aurora-blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(80px, -80px) scale(1.1); }
          66% { transform: translate(-60px, 60px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-aurora {
          animation: aurora-blob 15s infinite alternate ease-in-out;
        }
        .delay-2000 { animation-delay: 2s; }
        .delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* Kumpulan "Cahaya" Aurora (Menggunakan kombinasi warna brand Anda) */}
      <div className="relative w-full h-full max-w-7xl mx-auto opacity-60">
        
        {/* Cahaya 1: Biru Terang (Kiri Atas) */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-blue-200 rounded-full blur-[120px] animate-aurora"></div>
        
        {/* Cahaya 2: Cyan/Biru Es (Kanan Tengah) */}
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-cyan-100/80 rounded-full blur-[150px] animate-aurora delay-2000"></div>
        
        {/* Cahaya 3: Biru Utama ITEBAFolio (Bawah Kiri) */}
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-[#2C71B8] opacity-20 rounded-full blur-[150px] animate-aurora delay-4000"></div>
        
      </div>

      {/* Lapisan Kaca Blur (Glassmorphism) untuk "melelehkan" warna sehingga tampak seperti Aurora sungguhan */}
      <div className="absolute inset-0 backdrop-blur-[100px] bg-white/30"></div>
      
    </div>
  );
}