import { createClient } from '@supabase/supabase-js';
import { previewCategories, previewProducts } from './previewData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Tiny stand-in so the public site can be previewed without a Supabase project. */
function previewClient(): any {
  const tables: Record<string, any[]> = { products: previewProducts, categories: previewCategories };
  const builder = (rows: any[]) => {
    let data = [...rows];
    let one = false;
    const b: any = {
      select: () => b,
      order: () => b,
      limit: () => b,
      eq: (c: string, v: unknown) => { data = data.filter(r => r[c] === v); return b; },
      neq: (c: string, v: unknown) => { data = data.filter(r => r[c] !== v); return b; },
      single: () => { one = true; return b; },
      then: (res: (v: unknown) => unknown) => res({ data: one ? (data[0] ?? null) : data, error: null, count: data.length }),
    };
    return b;
  };
  const failWrite = () => ({ error: { message: 'Preview mode: connect Supabase (.env.local) to save data.' }, data: null });
  return {
    from: (t: string) => ({ ...builder(tables[t] ?? []), insert: failWrite, update: failWrite, delete: failWrite, upsert: failWrite }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ error: { message: 'Preview mode: Supabase is not configured.' } }),
      signOut: async () => ({}),
    },
    storage: { from: () => ({ list: async () => ({ data: [] }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  };
}

type Db = ReturnType<typeof createClient<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
export const supabase = (isConfigured ? createClient<any>(supabaseUrl, supabaseAnonKey) : previewClient()) as Db; // eslint-disable-line @typescript-eslint/no-explicit-any
