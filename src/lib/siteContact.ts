import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface SiteContact {
  address: string;
  phone: string;
  email: string;
}

export const defaultContact: SiteContact = {
  address: 'Your office address line 1,\nLine 2, City - PIN,\nState, India',
  phone: '+91 00000 00000',
  email: 'info@agriverse.in',
};

const KEY = 'site_contact_v1';
let cache: SiteContact | null = null;
let inflight: Promise<SiteContact> | null = null;

function fromStorage(): SiteContact | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultContact, ...JSON.parse(raw) } : null;
  } catch { return null; }
}

function load(): Promise<SiteContact> {
  if (!inflight) {
    inflight = (async () => {
      const { data } = await supabase.from('site_contact').select('address, phone, email').eq('id', 1).single();
      const row = data as Partial<SiteContact> | null;
      const next: SiteContact = {
        address: row?.address || defaultContact.address,
        phone: row?.phone || defaultContact.phone,
        email: row?.email || defaultContact.email,
      };
      cache = next;
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    })().catch(() => cache ?? defaultContact);
  }
  return inflight;
}

/** Call after the admin saves so the live site picks up the new values. */
export function setSiteContactCache(c: SiteContact) {
  cache = c;
  inflight = Promise.resolve(c);
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Contact details edited by the admin (Admin -> Settings). Shows last known values instantly, then refreshes. */
export function useSiteContact(): SiteContact {
  const [contact, setContact] = useState<SiteContact>(cache ?? fromStorage() ?? defaultContact);
  useEffect(() => {
    let alive = true;
    load().then(c => { if (alive) setContact(c); });
    return () => { alive = false; };
  }, []);
  return contact;
}
