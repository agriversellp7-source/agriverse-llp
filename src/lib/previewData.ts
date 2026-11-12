// Preview-only sample data, used when Supabase env vars are not set.
export const previewCategories = [
  { id: 'c1', name: 'Mulching Sheets' },
  { id: 'c2', name: 'Accessories' },
]

const base = {
  description: 'High-quality agricultural mulching film that conserves soil moisture, suppresses weeds and regulates soil temperature for stronger crops.\n\n(Sample content - replace from the admin panel.)',
  specification: '• Thickness: 25 / 30 / 40 micron\n• UV stabilised\n• Roll length: 400 m / 600 m',
  plant_and_origin: 'Width: 3 ft – 4 ft (0.9 – 1.2 m)',
  uses_and_benefits: '• Reduces water usage\n• Suppresses weed growth\n• Improves soil temperature\n• Increases crop yield\n• Reduces fertiliser loss',
  show_on_home: false,
  short_description: 'Durable, UV-stabilised mulch film that saves water and suppresses weeds.',
  product_categories: [] as unknown[],
}

const mk = (i: number, title: string, c: number, a: string, b: string) => ({
  ...base, id: `m${i}`, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  category_id: previewCategories[c].id, categories: { name: previewCategories[c].name },
  primary_image_url: a, hover_image_url: b,
  created_at: new Date(2026, 0, i).toISOString(),
})

export const previewProducts = [
  mk(1, 'Black Mulch Film', 0, '/images/sample/2.jpg', '/images/sample/6.jpg'),
  mk(2, 'Silver / Black Mulch Film', 0, '/images/sample/1.jpg', '/images/sample/5.jpg'),
  mk(3, 'White Mulch Film', 0, '/images/sample/3.jpg', '/images/sample/4.jpg'),
]
