import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WhyUs from '../components/WhyUs';
import UsedFor from '../components/UsedFor';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';

const APP_START_TIME = Date.now();

function AnimatedCounter({ end, suffix = '', delayOnLoad = false }: { end: number; suffix?: string, delayOnLoad?: boolean }) {
    const [count, setCount] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect(); // Only trigger once
                }
            },
            { threshold: 0 }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView) return;
        if (end <= 0) {
            setCount(end);
            return;
        }

        let startTime: number | null = null;
        const duration = 1500; // 1.5s animation
        let reqId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out quad function for smooth deceleration
            const easeOut = percentage * (2 - percentage);
            
            setCount(Math.floor(easeOut * end));

            if (progress < duration) {
                reqId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        // Add 800ms base delay + whatever is left of the splash screen
        let finalDelay = 50; // default standard delay
        
        if (delayOnLoad) {
            const timeSinceStart = Date.now() - APP_START_TIME;
            const splashDuration = 2200;
            const remainingSplashTime = Math.max(0, splashDuration - timeSinceStart);
            finalDelay = remainingSplashTime + 800;
        }

        const startDelay = setTimeout(() => {
            reqId = requestAnimationFrame(animate);
        }, finalDelay);

        return () => {
            clearTimeout(startDelay);
            if (reqId) cancelAnimationFrame(reqId);
        };
    }, [end, isInView]);

    return <span ref={ref} style={{ display: 'inline-block', minWidth: '1.2em' }}>{count}{suffix}</span>;
}

import { SITE_URL } from '../lib/site';
import { useSEO } from '../hooks/useSEO';

export default function Home() {
    useSEO({
        title: "Dharaa Mulching Sheets | Premium Mulch Film Manufacturer in India | AgriVerse LLP",
        description: "Dharaa mulching sheets by AgriVerse LLP: premium agricultural mulch film that saves water, controls weeds and raises crop yield. Direct from the manufacturer. Enquire for bulk and dealer pricing.",
        url: `${SITE_URL}/`
    });

    
    const [activeProduct, setActiveProduct] = useState(0);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Interactive Highlights

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data: prodDataRaw } = await supabase.from('products').select('*');
            if (prodDataRaw) {
                // Admin-selected products first (max 4); otherwise the first products added.
                const byAdded = [...prodDataRaw].sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at));
                const featured = byAdded.filter((p: any) => p.show_on_home);
                const prodData = (featured.length ? featured : byAdded).slice(0, 4);
                // Map the data to match the expected format in the UI
                const mappedProducts = prodData.map(p => {
                    return {
                        ...p,
                        images: [p.primary_image_url || '', p.hover_image_url || ''].filter(Boolean)
                    };
                });
                setProductsData(mappedProducts);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div style={{ paddingBottom: '0' }}>
            {/* HERO SECTION - looping video */}
            <div className="hero-video-wrapper">
                <video className="hero-video" src="/videos/hero.mp4" poster="/videos/hero-poster.jpg" autoPlay muted loop playsInline preload="metadata" />
                <div className="hero-video-overlay" />
                <div className="hero-video-content">
                    <div className="hero-badge-container">
                        <span className="hero-badge-line"></span>
                        AGRICULTURAL MANUFACTURING
                    </div>
                    <h1 style={{ fontSize: 'clamp(34px, 4.2vw, 84px)', color: '#1a1a1a', margin: '0 0 6px 0', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-1.5px' }}>
                        Premium mulching sheets
                    </h1>
                    <h1 style={{ fontSize: 'clamp(34px, 4.2vw, 84px)', color: '#1a1a1a', margin: '0 0 6px 0', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-1.5px' }}>
                        for modern farming.
                    </h1>
                    <h1 style={{ fontSize: 'clamp(34px, 4.2vw, 84px)', color: '#0f7a43', margin: '0 0 22px 0', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-1.5px' }}>
                        Rooted in the soil.
                    </h1>
                    <p style={{ fontSize: 'clamp(15px, 1.2vw, 22px)', color: '#444', lineHeight: 1.6, marginBottom: '28px', maxWidth: '640px', fontWeight: 500 }}>
                        Durable, consistent mulching film manufactured for Indian farms. Save water, control weeds and grow stronger yields with AgriVerse.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f7a43', color: '#fff', padding: '14px 28px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
                            Explore Products ➔
                        </Link>
                        <Link to="/general-enquiry" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', border: '1px solid #cfd8d2', color: '#0f7a43', padding: '14px 28px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
                            Enquire Now ➔
                        </Link>
                    </div>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className="container" style={{ maxWidth: '1680px', width: '96%', margin: '0 auto', padding: 0 }}>
                <div className="hero-stats-strip">
                    {[
                        { end: 40, suffix: '%', label: 'Less water evaporation' },
                        { end: 30, suffix: '%', label: 'Typical yield improvement' },
                        { end: 100, suffix: '%', label: 'UV-stabilised film' },
                        { end: 12, suffix: '+', label: 'Mulch film varieties' },
                    ].map((s, i) => (
                        <div key={i} className="hero-stats-item">
                            <h4><AnimatedCounter end={s.end} suffix={s.suffix} delayOnLoad={i === 0} /></h4>
                            <p>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* PRODUCT SHOWCASE - expanding panels */}
            <div className="container" style={{ maxWidth: '1680px', width: '96%', margin: '80px auto 0', padding: '0', scrollMarginTop: '100px' }}>
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#0f7a43', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>
                        <span style={{ display: 'inline-block', width: '40px', height: '1px', backgroundColor: '#0f7a43' }}></span>
                        OUR PRODUCTS
                        <span style={{ display: 'inline-block', width: '40px', height: '1px', backgroundColor: '#0f7a43' }}></span>
                    </div>
                    <h2 className="section-title" style={{ fontSize: 'clamp(24px, 2.6vw, 44px)', color: '#1a1a1a', margin: '0 0 5px 0', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.2 }}>
                        Made for the field.
                    </h2>
                    <h2 className="section-title-italic" style={{ fontSize: 'clamp(20px, 2.2vw, 36px)', color: '#1b2f5e', margin: 0, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.5px' }}>
                        Ready for the season.
                    </h2>
                </div>

                {loading ? (
                    <div className="showcase">
                        {[...Array(3)].map((_, i) => <div key={i} className="showcase-panel skeleton-shimmer" />)}
                    </div>
                ) : productsData.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#777' }}>Products coming soon.</p>
                ) : (
                    <div className="showcase" onMouseLeave={() => setActiveProduct(0)}>
                        {productsData.map((product, idx) => (
                            <div
                                key={product.id}
                                className={`showcase-panel ${activeProduct === idx ? 'is-active' : ''}`}
                                onMouseEnter={() => setActiveProduct(idx)}
                                onClick={() => setActiveProduct(idx)}
                            >
                                {product.images?.[0] && <img className="showcase-img showcase-img-primary" src={product.images[0]} alt={product.title} loading="lazy" />}
                                {product.images?.[1] && <img className="showcase-img showcase-img-hover" src={product.images[1]} alt="" loading="lazy" />}
                                <div className="showcase-shade" />
                                <span className="showcase-num">0{idx + 1}</span>
                                <span className="showcase-vertical-title">{product.title}</span>
                                <div className="showcase-content">
                                    <h3>{product.title}</h3>
                                    {product.short_description && <p>{product.short_description}</p>}
                                    <div className="showcase-actions">
                                        <Link to={`/product/${product.slug}`} className="showcase-btn showcase-btn-light">View Details ➔</Link>
                                        <button
                                            className="showcase-btn showcase-btn-green"
                                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsModalOpen(true); }}
                                        >Quick Enquiry</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ textAlign: 'center', margin: '40px 0 90px' }}>
                    <Link to="/products" className="view-all-btn">View all products <span>➔</span></Link>
                </div>
            </div>


            {/* WHERE OUR SHEETS ARE USED */}
            <UsedFor />

            {/* WHY OUR MULCHING SHEET */}
            <WhyUs />


            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
