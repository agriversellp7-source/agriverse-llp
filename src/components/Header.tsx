import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const location = useLocation();

    // Handle scroll transition with smooth threshold (optimized against scroll re-render lag)
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 40;
            setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const getLinkStyle = (path: string) => ({
        color: 'var(--text-dark)',
        textDecoration: 'none',
        fontWeight: isActive(path) ? '600' as const : '500' as const,
        fontSize: '15px',
        paddingBottom: '4px',
        borderBottom: isActive(path) ? '2px solid var(--primary-brown)' : '2px solid transparent',
        transition: 'all 0.2s ease'
    });

    const getMobileLinkStyle = (path: string) => {
        const active = isActive(path);
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: active ? 'var(--primary-brown)' : '#2c2c2c',
            textDecoration: 'none',
            fontSize: '18px',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: active ? '700' as const : '500' as const,
            padding: '16px 4px',
            borderBottom: '1px solid #e1ece5',
            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
        };
    };

    return (
        <>
            {/* Fixed height spacer to prevent page layout jumps during header resize */}
            <div className="header-spacer" />
            <header style={{
                padding: '14px 0',
                backgroundColor: isScrolled ? '#ffffff' : '#ffffff',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                boxShadow: isScrolled ? '0 4px 25px rgba(0,0,0,0.08)' : '0 1px 10px rgba(0,0,0,0.03)',
                borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(0,0,0,0.03)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
                opacity: isMobileMenuOpen ? 0 : 1,
                pointerEvents: isMobileMenuOpen ? 'none' : 'auto',
                transition: 'background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, opacity 0.22s ease'
            }}>
                <div className="container" style={{ maxWidth: '1680px', width: '96%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {/* Logo - Fixed height for 100% smooth scroll without layout shifts */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img
                            src="/logo-header.webp"
                            alt="Dharaa"
                            className="header-logo-img"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '35px' }}>
                        <Link to="/" style={getLinkStyle('/')}>Home</Link>
                        <Link to="/products" style={getLinkStyle('/products')}>Products</Link>

                        <Link to="/about-us" style={getLinkStyle('/about-us')}>About Us</Link>
                        <Link to="/contact-us" style={getLinkStyle('/contact-us')}>Contact Us</Link>
                    </nav>

                    {/* Right Side / Mobile Menu Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="desktop-enquire" style={{ display: 'none', alignItems: 'center', gap: '20px' }}>
                            <Link to="/general-enquiry" style={{ backgroundColor: 'var(--primary-brown)', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '15px', transition: 'all 0.2s ease' }}>
                                Enquire Now
                            </Link>
                        </div>

                        {/* Animated Hamburger Menu */}
                        <button
                            className={`mobile-menu-btn hamburger ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>

                {/* Responsive CSS & animations */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (min-width: 992px) {
                        .desktop-nav, .desktop-enquire { display: flex !important; }
                        .mobile-menu-btn { display: none !important; }
                    }
                    
                    /* Hamburger Animation */
                    .hamburger {
                        width: 26px;
                        height: 20px;
                        position: relative;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        padding: 0;
                        z-index: 1001;
                        display: block;
                    }
                    .hamburger span {
                        display: block;
                        position: absolute;
                        height: 2.5px;
                        width: 100%;
                        background: #2c2c2c;
                        border-radius: 2px;
                        opacity: 1;
                        left: 0;
                        transform: rotate(0deg);
                        transition: .25s cubic-bezier(0.2, 0, 0, 1);
                    }
                    .hamburger span:nth-child(1) { top: 0px; }
                    .hamburger span:nth-child(2) { top: 8px; }
                    .hamburger span:nth-child(3) { top: 16px; }

                    .hamburger.open span:nth-child(1) {
                        top: 8px;
                        transform: rotate(135deg);
                        background: var(--primary-brown);
                    }
                    .hamburger.open span:nth-child(2) {
                        opacity: 0;
                        left: -60px;
                    }
                    .hamburger.open span:nth-child(3) {
                        top: 8px;
                        transform: rotate(-135deg);
                        background: var(--primary-brown);
                    }

                    /* Slide-in Mobile Drawer (App-Themed Luxury UI) */
                    .mobile-nav-drawer {
                        position: fixed;
                        top: 0;
                        right: 0;
                        width: 320px;
                        max-width: 88vw;
                        height: 100vh;
                        height: 100dvh;
                        background: linear-gradient(180deg, #ffffff 0%, #f1f6f3 100%);
                        box-shadow: none;
                        visibility: hidden;
                        z-index: 1002;
                        display: flex;
                        flex-direction: column;
                        transform: translateX(100%);
                        transition: transform 0.22s cubic-bezier(0.2, 0, 0, 1), visibility 0s linear 0.22s;
                        overflow: hidden;
                        overscroll-behavior: none;
                        border-top-left-radius: 24px;
                        border-bottom-left-radius: 24px;
                    }
                    .mobile-nav-drawer.open {
                        transform: translateX(0);
                        visibility: visible;
                        transition-delay: 0s;
                        box-shadow: -15px 0 45px rgba(0,0,0,0.18);
                    }
                    
                    /* Overlay Backdrop */
                    .mobile-nav-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        height: 100dvh;
                        background-color: rgba(0,0,0,0.5);
                        z-index: 1001;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.22s cubic-bezier(0.2, 0, 0, 1);
                        overscroll-behavior: none;
                    }
                    .mobile-nav-overlay.open {
                        opacity: 1;
                        pointer-events: auto;
                        backdrop-filter: blur(4px);
                        -webkit-backdrop-filter: blur(4px);
                    }
                ` }} />
            </header>

            {/* Mobile Nav Overlay (Backdrop) */}
            <div
                className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Mobile Nav Drawer */}
            <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Header branding & close button inside drawer */}
                <div style={{ padding: '22px 20px 18px 20px', borderBottom: '1px solid #e1ece5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <img
                            src="/logo-header.webp"
                            alt="Dharaa"
                            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Luxury SVG Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close Menu"
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            border: '1px solid #dbe7df',
                            color: '#2c2c2c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Drawer Menu Items */}
                <div style={{ flex: '1', overflowY: 'auto', padding: '20px 20px', display: 'flex', flexDirection: 'column' }}>

                    <Link to="/" style={getMobileLinkStyle('/')}>
                        <span>Home</span>
                        <span style={{ fontSize: '14px', color: '#0f7a43' }}>→</span>
                    </Link>

                    <Link to="/products" style={getMobileLinkStyle('/products')}>
                        <span>All Products</span>
                        <span style={{ fontSize: '14px', color: '#0f7a43' }}>→</span>
                    </Link>

                    <Link to="/about-us" style={getMobileLinkStyle('/about-us')}>
                        <span>About Us</span>
                        <span style={{ fontSize: '14px', color: '#0f7a43' }}>→</span>
                    </Link>

                    <Link to="/contact-us" style={getMobileLinkStyle('/contact-us')}>
                        <span>Contact Us</span>
                        <span style={{ fontSize: '14px', color: '#0f7a43' }}>→</span>
                    </Link>
                </div>

                {/* Drawer Footer CTA */}
                <div style={{ padding: '20px', borderTop: '1px solid #e1ece5', backgroundColor: '#f0f7f3', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link to="/general-enquiry" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--primary-brown)',
                        color: '#ffffff',
                        padding: '14px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        letterSpacing: '0.3px',
                        boxShadow: '0 4px 14px rgba(121, 85, 72, 0.2)',
                        transition: 'all 0.2s ease'
                    }}>
                        Enquire Now  →
                    </Link>
                </div>
            </div>
        </>
    );
}
