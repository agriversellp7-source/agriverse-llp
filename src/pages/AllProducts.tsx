import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import { ProductSkeleton } from '../components/Skeleton';
import ProgressiveImage from '../components/ProgressiveImage';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { useSEO } from '../hooks/useSEO';

export default function AllProducts() {
    useSEO({
        title: "All Products | AgriVerse LLP",
        description: "Browse AgriVerse's complete range of premium mulching sheets and agricultural products.",
        url: "https://agriverse.in/products"
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [productsData, setProductsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase.from('products').select('*');
            if (data) {
                const mappedProducts = data.map(p => {
                    return {
                        ...p,
                        images: [p.primary_image_url || '', p.hover_image_url || ''].filter(Boolean)
                    };
                });
                setProductsData(mappedProducts);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    
    const filteredProducts = useMemo(() => {
        let result = productsData;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.title?.toLowerCase().includes(query) || 
                p.name?.toLowerCase().includes(query) || 
                p.description?.toLowerCase().includes(query)
            );
        }
        return result;
    }, [productsData, searchQuery]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);


    const productsPerPage = 16;
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
        <div style={{ backgroundColor: '#f9f9f9', paddingBottom: '44px' }}>
            <div style={{ textAlign: 'center', padding: isMobile ? '30px 15px 20px' : '60px 15px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link> / 
                    <span style={{ color: '#333', fontWeight: '500', marginLeft: '5px' }}>All Products</span>
                </div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: '#333', fontWeight: 'bold', margin: '0 0 20px' }}>Our Products</h1>


                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
                    <motion.div 
                        initial={false}
                        animate={{ 
                            width: (!isMobile || isSearchOpen) ? (isMobile ? 'calc(100vw - 40px)' : '420px') : '50px',
                            backgroundColor: (!isMobile || isSearchOpen) ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                            borderColor: (!isMobile || isSearchOpen) ? '#e5e7eb' : 'rgba(0,0,0,0.06)',
                            boxShadow: (!isMobile || isSearchOpen) 
                                ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' 
                                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '50px',
                            borderRadius: '25px',
                            border: '1px solid',
                            overflow: 'hidden',
                            position: 'relative',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)'
                        }}
                    >
                        <div 
                            style={{ 
                                padding: '0 16px', 
                                display: 'flex', 
                                alignItems: 'center',
                                cursor: isMobile && !isSearchOpen ? 'pointer' : 'default',
                                height: '100%',
                                zIndex: 2
                            }}
                            onClick={() => {
                                if (isMobile && !isSearchOpen) {
                                    setIsSearchOpen(true);
                                }
                            }}
                        >
                            <Search size={22} color={isMobile && !isSearchOpen ? '#4b5563' : '#9ca3af'} />
                        </div>
                        
                        <input
                            type="text"
                            placeholder="Search our collection..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                height: '100%',
                                padding: '0 10px 0 0',
                                fontSize: '16px',
                                color: '#1f2937',
                                backgroundColor: 'transparent',
                                opacity: (!isMobile || isSearchOpen) ? 1 : 0,
                                pointerEvents: (!isMobile || isSearchOpen) ? 'auto' : 'none',
                                transition: 'opacity 0.2s',
                                fontWeight: '400'
                            }}
                        />
                        
                        {isMobile && isSearchOpen && (
                            <div 
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    if (!searchQuery) {
                                        // just close
                                    }
                                }}
                                style={{
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    height: '100%'
                                }}
                            >
                                <X size={18} color="#999" />
                            </div>
                        )}
                        {!isMobile && searchQuery && (
                            <div 
                                onClick={() => setSearchQuery('')}
                                style={{
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    height: '100%'
                                }}
                            >
                                <X size={18} color="#999" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1150px', width: '95%', margin: isMobile ? '30px auto 0' : '60px auto 0', padding: '0' }}>
                {loading ? (
                    <div className="all-products-grid">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '100px 20px', color: '#666' }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '40px',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <Search size={32} color="#9ca3af" />
                        </div>
                        <h2 style={{ fontSize: '26px', color: '#111827', marginBottom: '12px', fontWeight: '600' }}>No products found</h2>
                        <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '420px', lineHeight: '1.6', marginBottom: '32px' }}>
                            We couldn't find anything matching <strong style={{ color: '#111827' }}>"{searchQuery}"</strong>. Try adjusting your search or browse our collections.
                        </p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                            }}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: '#111827',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#374151';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#111827';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                        >
                            Clear Search
                        </button>
                    </motion.div>
                ) : (
                <div
                    className={`all-products-grid ${currentProducts.length < 4 ? 'few' : ''}`}
                    style={{ ['--card-scale' as string]: currentProducts.length < 4 ? 1.1 : 1 }}
                >
                    {currentProducts.map((product, idx) => (
                        <div key={idx} className="product-card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', transition: 'transform 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                            <Link 
                                to={`/product/${product.slug}`} 
                                style={{ display: 'block', backgroundColor: '#f9f9f9', padding: '0' }}
                            >
                                <div className="product-image-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                                    <div className="product-img-primary">
                                        <ProgressiveImage 
                                            src={product.images[0]} 
                                            alt={product.title} 
                                        />
                                    </div>
                                    {product.images && product.images[1] && (
                                        <div className="product-img-secondary">
                                            <ProgressiveImage 
                                                src={product.images[1]} 
                                                alt={product.title} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="product-card-content" style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Link to={`/product/${product.slug}`} className="product-card-title" style={{ display: 'block', fontSize: '15px', color: '#222', textDecoration: 'none', fontWeight: '700', marginBottom: '3px', lineHeight: '1.3' }}>
                                    {product.title}
                                </Link>
                                <button 
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsModalOpen(true);
                                    }}
                                    className="product-card-button"
                                    style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#0a5a31', color: '#fff', padding: '12px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}
                                >
                                    Enquire Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                        {/* Prev */}
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{
                                height: '36px',
                                padding: '0 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: currentPage === 1 ? '#ccc' : '#0f7a43',
                                fontSize: '13px',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            ← Prev
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: currentPage === page ? '1px solid #0f7a43' : '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    backgroundColor: currentPage === page ? '#0f7a43' : 'transparent',
                                    color: currentPage === page ? '#fff' : '#666',
                                    fontSize: '13px',
                                    fontWeight: currentPage === page ? '600' : '400',
                                    cursor: 'pointer',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                height: '36px',
                                padding: '0 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: currentPage === totalPages ? '#ccc' : '#0f7a43',
                                fontSize: '13px',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
            
            <ProductEnquiryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct} 
            />
        </div>
    );
}
