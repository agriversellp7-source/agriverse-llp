import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';

// Prevent browser from restoring scroll position on reload
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Layout from './components/Layout';
import Home from './pages/Home';
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const AllProducts = lazy(() => import('./pages/AllProducts'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const GeneralEnquiry = lazy(() => import('./pages/GeneralEnquiry'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
import SplashScreen from './components/SplashScreen';
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Enquiries = lazy(() => import('./pages/admin/Enquiries'));
const Products = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const StorageCleanup = lazy(() => import('./pages/admin/StorageCleanup'));

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

function AppRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    return () => {};
  }, [location.pathname]);

  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageTransition><Home /></PageTransition>} />
          <Route path="products" element={<PageTransition><AllProducts /></PageTransition>} />
          <Route path="product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="about-us" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="contact-us" element={<PageTransition><ContactUs /></PageTransition>} />
          <Route path="general-enquiry" element={<PageTransition><GeneralEnquiry /></PageTransition>} />
        </Route>

        <Route path="/ad/login" element={<PageTransition><Login /></PageTransition>} />
        
        <Route path="/ad" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="settings" element={<Settings />} />
            <Route path="storage-cleanup" element={<StorageCleanup />} />
          </Route>
        </Route>

        {/* Catch-all route to placeholder */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </Suspense>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // 4K & Ultrawide Auto-Scaler
  // Only kicks in on massive monitors (>1920px) so the site doesn't look tiny.
  // Completely ignores standard laptops (1366px - 1920px).
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1920) {
        const scaleFactor = window.innerWidth / 1920;
        const zoomLevel = Math.min(scaleFactor, 2.0); // max 2x zoom
        document.documentElement.style.zoom = `${zoomLevel}`;
        document.documentElement.style.setProperty('--app-zoom', `${zoomLevel}`);
      } else {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.setProperty('--app-zoom', '1');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
      scriptProps={{ async: true, defer: true }}
    >
      <BrowserRouter>
        <AnimatePresence>
          {showSplash && <SplashScreen key="splash" />}
        </AnimatePresence>
        <AppRoutes />
      </BrowserRouter>
    </GoogleReCaptchaProvider>
  );
}

export default App;
