import { Link } from "react-router-dom";
import { logoHeader } from "../assets/Assets";

export default function Footer() {
  return (
    <footer className="bg-transparent border-t-2 border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Kiri: Logo & Deskripsi Singkat */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <Link to="/" className="inline-block">
            {/* PERBAIKAN: Menambahkan h-6 md:h-7 agar ukuran logo proporsional */}
            <img src={logoHeader} alt="ITEBAFolio Logo" className="h-6 md:h-7 w-auto object-contain" />
          </Link>
          <p className="text-xs text-gray-500 mt-2.5">
            Galeri Inovasi Mahasiswa Institut Teknologi Batam.
          </p>
        </div>

        {/* Tengah: Navigasi */}
        {/* Catatan: Saya ubah text-brand-blue menjadi text-[#2C71B8] agar warnanya konsisten dengan tombol biru aplikasi Anda */}
        <div className="flex space-x-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-[#2C71B8] transition-colors">
            Explore
          </Link>
          <Link to="/filter/fyp" className="hover:text-[#2C71B8] transition-colors">
            Best Project
          </Link>
          <a href="#" className="hover:text-[#2C71B8] transition-colors">
            Tentang Kami
          </a>
        </div>

        {/* Kanan: Copyright */}
        <div className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ITEBAFolio. All rights reserved.
        </div>

      </div>
    </footer>
  );
} 