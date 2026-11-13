// @ts-nocheck
import nodemailer from "npm:nodemailer";

import { createClient } from "npm:@supabase/supabase-js";

// Supabase webhook payload interface
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  schema: 'public';
  old_record: null | any;
}

// Escape user-supplied text before putting it into the HTML email.
const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const row = (label: string, value: string) => `
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background-color: #f5faf7; font-weight: bold; width: 140px;">${label}</td>
    <td style="padding: 10px; border: 1px solid #ddd;">${value}</td>
  </tr>`;

export default {
  async fetch(req: Request) {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      // Only accept calls that carry our shared secret (set the same value in the DB webhook header).
      const expected = Deno.env.get('WEBHOOK_SECRET');
      if (expected && req.headers.get('x-webhook-secret') !== expected) {
        return new Response('Unauthorized', { status: 401 });
      }

      const payload: WebhookPayload = await req.json();

      if (payload.type !== 'INSERT' || payload.table !== 'enquiries') {
        return new Response('Not an enquiry insert event.', { status: 200 });
      }

      const enquiry = payload.record;

      // Extract credentials from Supabase Environment Secrets
      const gmailAddress = Deno.env.get('GMAIL_ADDRESS');
      const gmailPassword = Deno.env.get('GMAIL_PASSWORD');

      if (!gmailAddress || !gmailPassword) {
        throw new Error('GMAIL_ADDRESS or GMAIL_PASSWORD is not set in Edge Function secrets.');
      }

      // Initialize Supabase Client to fetch Admin Email from Settings
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: settings, error: settingsError } = await supabase.from('settings').select('admin_email').limit(1).single();

      console.log('Fetched settings data:', settings);
      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
      }

      const toEmail = settings?.admin_email || gmailAddress;
      console.log('Sending email to:', toEmail);

      // Gmail SMTP (needs a Google "App Password", not your normal password)
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailAddress, pass: gmailPassword },
      });

      const typeLabel = { product: 'Product enquiry', general: 'General enquiry', contact: 'Contact message' }[enquiry.type as string] ?? 'Enquiry';
      const validEmail = typeof enquiry.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email);

      const products = Array.isArray(enquiry.ingredients) && enquiry.ingredients.length > 0
        ? enquiry.ingredients.map((p: any) => `${esc(p.herb)}${p.form ? ' - ' + esc(p.form) : ''}${p.qty ? ' (' + esc(p.qty) + ')' : ''}`).join('<br/>')
        : '';

      const mailOptions = {
        from: `Website Enquiries <${gmailAddress}>`,
        to: toEmail,
        replyTo: validEmail ? enquiry.email : undefined,   // hit "Reply" to answer the customer directly
        subject: `${typeLabel} from ${String(enquiry.name ?? '').slice(0, 80)}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; color: #333;">
            <h2 style="color: #0f7a43; margin-top: 0;">New ${esc(typeLabel)}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              ${row('Name', esc(enquiry.name))}
              ${row('Phone', enquiry.phone ? `<a href="tel:${esc(enquiry.phone)}">${esc(enquiry.phone)}</a>` : 'N/A')}
              ${row('Email', validEmail ? `<a href="mailto:${esc(enquiry.email)}">${esc(enquiry.email)}</a>` : 'N/A')}
              ${enquiry.company ? row('Company / Farm', esc(enquiry.company)) : ''}
              ${enquiry.country ? row('Location', esc(enquiry.country)) : ''}
              ${enquiry.role ? row('I am a', esc(enquiry.role)) : ''}
              ${enquiry.product_name ? row('Product', esc(enquiry.product_name)) : ''}
              ${products ? row('Products needed', products) : ''}
              ${Array.isArray(enquiry.end_application) && enquiry.end_application.length ? row('Crop / use', esc(enquiry.end_application.join(', '))) : ''}
              ${Array.isArray(enquiry.documents_needed) && enquiry.documents_needed.length ? row('Needs', esc(enquiry.documents_needed.join(', '))) : ''}
              ${row('Message', esc(enquiry.message).replace(/\n/g, '<br/>') || 'N/A')}
            </table>
            <p style="margin-top: 28px; font-size: 12px; color: #888;">
              Sent automatically by your website. You can also see and manage this enquiry in the Admin panel.
            </p>
          </div>
        `,
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
