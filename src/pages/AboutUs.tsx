import { useSEO } from '../hooks/useSEO';

export default function AboutUs() {
    useSEO({
        title: "About Us | AgriVerse LLP",
        description: "Learn about AgriVerse LLP, a farmer-focused agricultural manufacturing company building premium mulching sheets and solutions for modern farming.",
        url: "https://agriverse.in/about-us"
    });
    return (
        <div className="container" style={{ padding: '60px 15px', maxWidth: '1500px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', color: '#0f7a43', marginBottom: '20px', fontWeight: '600' }}>
                Rooted in Agriculture. Built for Farmers.
            </h1>
            
            <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', textAlign: 'left', marginTop: '40px' }}>
                <p style={{ marginBottom: '20px' }}>
                    AgriVerse LLP is a modern, farmer-focused agricultural enterprise built around the idea of creating a complete ecosystem between agriculture, innovation, manufacturing and farmers. The name AgriVerse represents a whole universe of agriculture, where farmers, products, technology and sustainable practices come together under one trusted brand.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    We are a manufacturer, not just a trader. We develop and produce quality mulching sheets and agricultural products according to real field needs, and we stay close to the farming community to understand what works and what does not. Every improvement we make starts with feedback from the field: Farmer, Field Experience, Feedback, Research & Development, Manufacturing, Better Product, and back to the Farmer.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    Today we focus on premium mulching sheets that conserve water, suppress weeds and improve yields. Our vision is much larger: a diversified agricultural organisation with manufacturing capability, research and a strong farmer network, with strong roots in the soil and ambition that reaches far beyond it.
                </p>
                <blockquote style={{ 
                    borderLeft: '4px solid #0f7a43', 
                    paddingLeft: '20px', 
                    marginTop: '40px', 
                    fontStyle: 'italic', 
                    fontSize: '20px', 
                    color: '#0f7a43' 
                }}>
                    "We understand the soil. We understand the farmer. We understand the future. And we are building the connection between them."
                </blockquote>
            </div>
        </div>
    );
}
