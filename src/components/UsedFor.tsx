import { motion } from 'framer-motion';

// Placeholder content - confirm crops and notes with the client.
const uses = [
  { name: 'Vegetables', crops: 'Tomato, chilli, brinjal, okra, cucumber', note: 'Raised beds with drip irrigation' },
  { name: 'Fruits', crops: 'Strawberry, watermelon, muskmelon, papaya', note: 'Keeps fruit clean and off the soil' },
  { name: 'Cash crops', crops: 'Cotton, sugarcane, turmeric, ginger', note: 'Weed control over long crop cycles' },
  { name: 'Orchards & plantations', crops: 'Banana, pomegranate, citrus, grapes', note: 'Moisture retention around young trees' },
  { name: 'Greenhouse & polyhouse', crops: 'Flowers, capsicum, exotic vegetables', note: 'Even soil temperature, less humidity' },
  { name: 'Nurseries', crops: 'Seedling beds, grow bags, flower beds', note: 'Clean beds with fewer weeds' },
];

export default function UsedFor() {
  return (
    <section className="uf">
      <div className="uf-inner">
        <motion.div className="uf-head" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
          <div className="uf-eyebrow">Applications</div>
          <h2>Where our sheets are used</h2>
          <p>From open-field vegetables to polyhouse flowers, mulching film is laid wherever soil moisture, weeds and temperature decide the harvest.</p>
        </motion.div>

        <ul className="uf-list">
          {uses.map((u, i) => (
            <motion.li key={u.name} className="uf-row"
              initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
              <span className="uf-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="uf-name">{u.name}</span>
              <span className="uf-crops">{u.crops}</span>
              <span className="uf-note">{u.note}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
