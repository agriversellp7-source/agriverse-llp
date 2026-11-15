import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Replace the images in /public/images/why/ (1.jpg ... 6.jpg) with real photos (keep the same file names or update below).
const items = [
  { title: 'Saves Water', img: '/images/why/hq-1.jpg',
    text: 'Our film seals the soil surface so moisture stays where the roots are. Less evaporation means fewer irrigation cycles through the season.' },
  { title: 'Controls Weeds', img: '/images/why/hq-2.jpg',
    text: 'Weeds need sunlight. Our opaque film blocks it at the soil surface, so weeds are suppressed without constant weeding or herbicides.' },
  { title: 'Soil Temperature', img: '/images/why/hq-3.jpg',
    text: 'The film moderates root-zone temperature, protecting young plants from stress and supporting faster, even growth.' },
  { title: 'Higher Yield', img: '/images/why/hq-4.jpg',
    text: 'Steady moisture, healthier roots and fewer weeds add up to stronger plants and cleaner, higher quality produce.' },
  { title: 'Fertiliser Savings', img: '/images/why/hq-5.jpg',
    text: 'The film reduces leaching and run-off, so the fertiliser you apply stays available to the crop instead of washing away.' },
  { title: 'Durable & UV Stable', img: '/images/why/hq-6.jpg',
    text: 'Manufactured in-house with controlled thickness and UV stabilisation, our film lasts a full crop cycle without tearing or fading.' },
];

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mobile: the photo is pinned, so switch the active item automatically as the list scrolls past it.
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth > 900 || !mediaRef.current) return;
      // The active item's text must stay visible *below* the pinned photo, so trigger a bit further down.
      const bottom = mediaRef.current.getBoundingClientRect().bottom;
      // Use overall scroll progress through the list (not each item's moving position),
      // so expanding / collapsing paragraphs can't trigger a chain of switches.
      const first = itemRefs.current[0];
      const last = itemRefs.current[items.length - 1];
      if (!first || !last) return;
      const top = first.getBoundingClientRect().top;
      const height = last.getBoundingClientRect().bottom - top;
      const line = bottom + height / items.length - 12; // active item's top always sits just under the pinned block
      const p = Math.min(0.9999, Math.max(0, (line - top) / height));
      const idx = Math.floor(p * items.length);
      setActive(prev => (prev === idx ? prev : idx));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="why2">
      <div className="why2-inner">
        {/* On mobile the heading is pinned together with the photo */}
        <div className="why2-stick" ref={mediaRef}>
          <h2 className="why2-heading why2-heading-m">Why our mulching sheet</h2>
          <div className="why2-media">
            {items.map((it, i) => (
              <img key={it.img} src={it.img} alt={it.title} loading="lazy" className={i === active ? 'is-on' : ''} />
            ))}
          </div>
        </div>

        <div className="why2-text">
          <h2 className="why2-heading why2-heading-d">Why our mulching sheet</h2>
          {items.map((it, i) => (
            <div key={it.title} ref={el => { itemRefs.current[i] = el; }} className={`why2-item ${i === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}>
              <span className="why2-idx">.0{i + 1}</span>
              <h3 className="why2-title">{it.title}</h3>
              <div className="why2-body"><div className="why2-body-in"><p>{it.text}</p></div></div>
            </div>
          ))}
          <Link to="/general-enquiry" className="why2-cta">Get a quote <span>➔</span></Link>
        </div>
      </div>
    </section>
  );
}
