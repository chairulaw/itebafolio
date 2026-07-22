import React from 'react';

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#FBFBFB] pointer-events-none overflow-hidden">

      {/* ===== CSS Internal: Aurora bergerak organik + Grain + Shimmer ===== */}
      <style>{`
        @keyframes aurora-drift-1 {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          25%  { transform: translate(90px, -70px) rotate(8deg) scale(1.15); }
          50%  { transform: translate(40px, 90px) rotate(-4deg) scale(0.95); }
          75%  { transform: translate(-80px, 20px) rotate(6deg) scale(1.05); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes aurora-drift-2 {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          30%  { transform: translate(-70px, 60px) rotate(-10deg) scale(1.1); }
          60%  { transform: translate(-30px, -80px) rotate(5deg) scale(0.9); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes aurora-drift-3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(60px, 50px) scale(1.2); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer-rotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes grain-shift {
          0%, 100% { transform: translate(0, 0); }
          10%      { transform: translate(-2%, -3%); }
          30%      { transform: translate(3%, 2%); }
          50%      { transform: translate(-1%, 3%); }
          70%      { transform: translate(2%, -2%); }
          90%      { transform: translate(-3%, 1%); }
        }

        .aurora-1 { animation: aurora-drift-1 22s infinite ease-in-out; }
        .aurora-2 { animation: aurora-drift-2 26s infinite ease-in-out; animation-delay: -6s; }
        .aurora-3 { animation: aurora-drift-3 18s infinite ease-in-out; animation-delay: -3s; }
        .shimmer  { animation: shimmer-rotate 40s linear infinite; }
        .grain    { animation: grain-shift 8s steps(8) infinite; }

        @media (prefers-reduced-motion: reduce) {
          .aurora-1, .aurora-2, .aurora-3, .shimmer, .grain { animation: none !important; }
        }
      `}</style>

      {/* ===== Lapisan dasar: gradient vignette lembut ===== */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0) 0%, rgba(251,251,251,0.4) 70%, rgba(251,251,251,0.9) 100%)',
        }}
      />

      {/* ===== Kumpulan Cahaya Aurora ===== */}
      <div className="relative w-full h-full max-w-7xl mx-auto opacity-70">

        {/* Cahaya 1: Biru Terang — Kiri Atas */}
        <div className="aurora-1 absolute top-[-15%] left-[-12%] w-[420px] h-[420px] md:w-[620px] md:h-[620px] bg-blue-300/70 rounded-full blur-[130px]" />

        {/* Cahaya 2: Teal/Cyan segar — Kanan Tengah, kontras dingin */}
        <div className="aurora-2 absolute top-[15%] right-[-12%] w-[500px] h-[500px] md:w-[720px] md:h-[720px] bg-teal-200/60 rounded-full blur-[150px]" />

        {/* Cahaya 3: Biru Brand Utama (#2C71B8) — Bawah Kiri, jadi jangkar warna */}
        <div className="aurora-3 absolute bottom-[-15%] left-[15%] w-[520px] h-[520px] md:w-[820px] md:h-[820px] bg-[#2C71B8]/25 rounded-full blur-[160px]" />

        {/* Cahaya 4: Aksen hangat tipis — pusat bawah, biar tidak monoton biru semua */}
        <div className="aurora-2 absolute bottom-[5%] right-[20%] w-[300px] h-[300px] md:w-[420px] md:h-[420px] bg-amber-100/40 rounded-full blur-[120px]" style={{ animationDuration: '30s' }} />

        {/* Shimmer halus: conic gradient berputar sangat lambat, menambah kilau "hidup" */}
        <div
          className="shimmer absolute top-1/2 left-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] mix-blend-overlay"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, #2C71B8 15%, transparent 30%, transparent 60%, #7DD3FC 75%, transparent 90%)',
          }}
        />
      </div>

      {/* ===== Lapisan Kaca Blur (Glassmorphism) untuk "melelehkan" warna ===== */}
      <div className="absolute inset-0 backdrop-blur-[100px] bg-white/25" />

      {/* ===== Grain / noise tipis: memberi tekstur premium, anti-flat ===== */}
      <svg className="grain absolute -inset-[10%] w-[120%] h-[120%] opacity-[0.035] mix-blend-multiply">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

    </div>
  );
}