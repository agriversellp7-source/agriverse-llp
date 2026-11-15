import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { useSiteContact, telHref } from '../lib/siteContact';

export default function Footer() {
    const contact = useSiteContact();
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer style={{ backgroundColor: 'var(--bg-beige)', position: 'relative', borderTop: '1px solid var(--border-color)' }} className="site-footer">
            <div className="container" style={{ maxWidth: '1680px', width: '96%', margin: '0 auto', padding: '0' }}>

                {/* Main footer row: Logo + 3 columns */}
                <div className="footer-grid footer-main-row">

                    {/* Logo Column */}
                    <div className="footer-logo-col">
                        <img src="/dharaa-logo.webp" alt="Dharaa" className="footer-logo-img" />
                        <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                            Rooted in agriculture. Driven by innovation. Connected to farmers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Quick Links</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                            <li><Link to="/products" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Products</Link></li>
                            <li><Link to="/about-us" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>About Us</Link></li>
                            <li><Link to="/contact-us" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Contact Us</Link></li>
                            <li><Link to="/general-enquiry" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Enquire Now</Link></li>
                        </ul>
                    </div>

                    {/* Our Office */}
                    <div className="footer-col footer-offices-col">
                        <h4 className="footer-col-heading">Our Office</h4>
                        <div style={{ marginBottom: '22px' }}>
                            <div style={{ color: 'var(--text-dark)', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Registered Office</div>
                            <div style={{ color: '#4a4a4a', fontSize: '13px', lineHeight: '1.8', fontWeight: '500', whiteSpace: 'pre-line' }}>
                                {contact.address}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Contact Info</h4>
                        <p style={{ margin: '0 0 12px' }}>
                            <a href={telHref(contact.phone)} style={{ color: '#4a4a4a', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{contact.phone}</a>
                        </p>
                        <p style={{ margin: 0 }}>
                            <a href={`mailto:${contact.email}`} style={{ color: '#4a4a4a', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{contact.email}</a>
                        </p>
                    </div>
                </div>

                <div className="footer-company">
                    <span>A brand of</span>
                    <img src="/company-logo.webp" alt="AgriVerse LLP" loading="lazy" />
                </div>
            </div>

            {/* Scroll to top */}
            <button
                onClick={scrollToTop}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#888',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
                <ChevronUp size={18} />
            </button>
        </footer>
    );
}
