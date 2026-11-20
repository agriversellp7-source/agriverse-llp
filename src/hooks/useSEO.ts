import { useEffect } from 'react';

export function useSEO({ title, description, url, jsonLd }: { title: string, description: string, url?: string, jsonLd?: object | null }) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;
    
    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // 3. Update Open Graph Tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    updateOGTag('twitter:title', title);
    updateOGTag('twitter:description', description);

    if (url) {
      updateOGTag('og:url', url);
      updateOGTag('twitter:url', url);
      
      // Update Canonical Link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', url);
      } else {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', url);
        document.head.appendChild(canonical);
      }
    }

    // 4. Page-specific structured data (e.g. Product)
    const id = 'page-jsonld';
    document.getElementById(id)?.remove();
    if (jsonLd) {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      el.text = JSON.stringify(jsonLd);
      document.head.appendChild(el);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, [title, description, url, jsonLd ? JSON.stringify(jsonLd) : '']);
}
