import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';

// COMPONENTS
import Header from './components/Header';
import Footer from './components/Footer';
import SettingsSidebar from './components/SettingsSidebar';
import GlobalBackground from './components/GlobalBackground';
import {Toaster} from 'react-hot-toast';

// PAGES
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectDetail from './pages/ProjectDetail';
import ManageProject from './pages/ManageProject';
import EditProfile from './pages/EditProfile';
import EditAccount from './pages/EditAccount';
import Profile from './pages/Profile';
import FilterPage from './pages/FilterPage';
import Search from './pages/Search'
import PublicProfile from './pages/PublicProfile';

// ADMIN PAGES
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProjects from './pages/admin/ManageProjects';
import ViolationLog from './pages/admin/ViolationLog';
import AdminCategoryManager from './pages/admin/AdminCategoryManager';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();

  const isSettingsPath = location.pathname.startsWith("/profile/settings") || location.pathname.startsWith("/profile/account");

  const hidePaths = ["/login", "/register", "/manage-project"];

  const shouldHideHeaderAndFooter = hidePaths.some(path =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // TAMBAHAN: Deteksi apakah user sedang berada di rute admin
  const isAdminArea = location.pathname.startsWith('/admin');
  const isEditProfileArea = location.pathname.startsWith('/profile/settings');
  const isEditAccountArea = location.pathname.startsWith('/profile/account');

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-950 antialiased scroll-smooth">
      <ScrollToTop />

      {/* --- GLOBAL BACKGROUND --- */}
      {/* Dimatikan di halaman Hide (Login/Register) DAN di halaman Admin */}
      {!shouldHideHeaderAndFooter && !isAdminArea && <GlobalBackground />}

      {/* --- HEADER --- */}
      {/* Dimatikan di halaman Hide DAN di halaman Admin */}
      {!shouldHideHeaderAndFooter && !isAdminArea && !isEditProfileArea && !isEditAccountArea && <Header />}

      <div className="flex-1 w-full">
        {isSettingsPath ? (
          <div className="max-w-6xl mx-auto px-6 md:px-8 pt-32 pb-20 flex flex-col md:flex-row gap-10 w-full">
            <SettingsSidebar />
            <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <Routes>
                <Route path="/profile/settings" element={<EditProfile />} />
                <Route path="/profile/account" element={<EditAccount />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/filters/:filterSlug" element={<Homepage />} />
            <Route path="/best-projects" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/manage-project" element={<ManageProject />} />
            <Route path="/manage-project/:projectId" element={<ManageProject />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/user/:id" element={<PublicProfile />} />
            <Route path="/filter/:slug" element={<FilterPage />} />

            {/* --- ADMIN ROUTES (Nested Routing dengan AdminLayout) --- */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="projects" element={<ManageProjects />} />
              <Route path="violations" element={<ViolationLog />} />
              <Route path="categories" element={<AdminCategoryManager />} />
            </Route>
          </Routes>
        )}
      </div>

      {/* --- FOOTER --- */}
      {/* Dimatikan di halaman Hide DAN di halaman Admin */}
      {!shouldHideHeaderAndFooter && !isAdminArea && <Footer />}
    </div>
  );
}

// --- APP UTAMA ---
function App() {
  return (
    <PortfolioProvider>
      <BrowserRouter>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#746b6bff',
            color: '#ffffffff',
          },
        }}
      />
        <AppContent />
      </BrowserRouter>
    </PortfolioProvider>
  );
}

export default App;