import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { clientBotCheck, verifyRecaptchaToken, getFormOpenTime } from '../lib/botProtection';

const END_APPLICATIONS = [
  'Vegetables', 'Fruits', 'Flowers', 'Sugarcane / Cotton', 'Greenhouse / Polyhouse', 'Orchard', 'Nursery', 'Other'
];

const DOCUMENTS = [
  'Price quote', 'Free sample', 'Bulk / dealer pricing', 'Delivery details', 'Product guidance', 'Not sure yet'
];

export default function GeneralEnquiry() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Bot protection
  const honeypotRef = useRef('');
  const formOpenedAt = useRef(getFormOpenTime());
  const isSubmittingRef = useRef(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });

  const [ingredients, setIngredients] = useState([{ herb: '', herbCustom: '', form: '', formCustom: '', qty: '', qtyCustom: '' }]);
  const [endApplications, setEndApplications] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [productOptions, setProductOptions] = useState<{title: string}[]>([]);

  useEffect(() => {
    supabase.from('products').select('title').order('title').then(({ data }) => {
      if (data) setProductOptions(data);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addIngredientRow = () => {
    if (ingredients.length < 10) {
      setIngredients([...ingredients, { herb: '', herbCustom: '', form: '', formCustom: '', qty: '', qtyCustom: '' }]);
    }
  };

  const removeIngredientRow = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const togglePill = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Email format validation requiring @ and domain dot
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('Please enter a valid business email address containing @ and a valid domain (e.g. name@domain.com)');
      isSubmittingRef.current = false;
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      alert('Please enter a valid WhatsApp / Phone number.');
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);

    // Layer 1 & 2: Honeypot + Time check
    const botCheck = clientBotCheck(honeypotRef.current, formOpenedAt.current);
    if (botCheck.blocked) {
      isSubmittingRef.current = false;
      setLoading(false);
      setSuccess(true); // fake success
      return;
    }

    // Layer 3: reCAPTCHA v3
    if (executeRecaptcha) {
      const token = await executeRecaptcha('general_enquiry');
      const isHuman = await verifyRecaptchaToken(token);
      if (!isHuman) {
        alert('Verification failed. Please try again.');
        isSubmittingRef.current = false;
        setLoading(false);
        return;
      }
    }

    const finalIngredients = ingredients.map(ing => ({
      herb: ing.herb === 'Other' ? ing.herbCustom : ing.herb,
      form: ing.form === 'Other' ? ing.formCustom : ing.form,
      qty: ing.qty === 'Other' ? ing.qtyCustom : ing.qty,
    })).filter(ing => ing.herb && ing.herb.trim() !== '');

    const { error } = await supabase.from('enquiries').insert([
      {
        type: 'general',
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        message: formData.message,
        ingredients: finalIngredients,
        end_application: endApplications,
        documents_needed: documents
      }
    ]);

    if (error) {
      alert('Error submitting enquiry: ' + error.message);
    } else {
      setSuccess(true);
    }
    isSubmittingRef.current = false;
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ backgroundColor: '#f5faf7', padding: '100px 15px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '36px', color: '#0f7a43', marginBottom: '20px' }}>Thank You!</h2>
        <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>Your enquiry has been submitted. We will get back to you shortly.</p>
        <Link to="/" style={{ display: 'inline-block', backgroundColor: '#0f7a43', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none' }}>Return to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5faf7', padding: '60px 15px', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="ge-header" style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 className="ge-title" style={{ fontSize: '42px', color: '#333', marginBottom: '15px' }}>Tell us what you need.</h1>
          <p style={{ fontSize: '18px', color: '#0f7a43', fontStyle: 'italic' }}>
            "Even a partial enquiry helps us recommend the right mulching film for your crop."
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            name="website"
            onChange={(e) => { honeypotRef.current = e.target.value; }}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Section 1: Basic Info */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#0f7a43', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Basic Info <span style={{ backgroundColor: '#f0e6d2', color: '#0f7a43', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>REQUIRED</span>
            </h3>

            <div className="ge-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="Your full name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Company / Farm Name</label>
                <input type="text" name="company" value={formData.company} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="Brand or company name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="you@company.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>WhatsApp / Phone *</label>
                <PhoneInput
                  international
                  defaultCountry="IN"
                  limitMaxLength={true}
                  value={formData.phone}
                  onChange={(value: any) => setFormData({ ...formData, phone: value || '' })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' }}>Location (City / State)</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }} placeholder="e.g. United States" />
              </div>
            </div>
          </div>

          {/* Section 2: Products Needed */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#0f7a43', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Products Needed <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>
            <p style={{ fontSize: '14px', color: '#777', marginBottom: '25px' }}>Select the products you need. Add up to 10 rows — you can leave thickness or quantity blank if you're not sure yet.</p>

            <div className="ge-ingredient-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '15px', marginBottom: '15px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>PRODUCT</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>THICKNESS / TYPE</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>EST. QUANTITY</div>
              <div></div>
            </div>

            {ingredients.map((ing, idx) => (
              <div key={idx} className="ge-ingredient-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '15px', marginBottom: '15px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={ing.herb} onChange={(e) => handleIngredientChange(idx, 'herb', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#f9f9f9', appearance: 'auto', outline: 'none' }}>
                    <option value="">Select product...</option>
                    <option value="Other">Other (Please specify)</option>
                    {productOptions.map(p => (
                      <option key={p.title} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                  {ing.herb === 'Other' && (
                    <input type="text" value={ing.herbCustom} onChange={(e) => handleIngredientChange(idx, 'herbCustom', e.target.value)} placeholder="Type product name" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={ing.form} onChange={(e) => handleIngredientChange(idx, 'form', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#f9f9f9', appearance: 'auto', outline: 'none' }}>
                    <option value="">Select thickness...</option>
                    <option value="25 micron">25 micron</option>
                    <option value="30 micron">30 micron</option>
                    <option value="40 micron">40 micron</option>
                    <option value="50 micron">50 micron</option>
                    <option value="Perforated">Perforated</option>
                    <option value="Other">Other</option>
                  </select>
                  {ing.form === 'Other' && (
                    <input type="text" value={ing.formCustom} onChange={(e) => handleIngredientChange(idx, 'formCustom', e.target.value)} placeholder="Specify form..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={ing.qty} onChange={(e) => handleIngredientChange(idx, 'qty', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#f9f9f9', appearance: 'auto', outline: 'none' }}>
                    <option value="">Select qty...</option>
                    <option value="< 5 rolls">&lt; 5 rolls</option>
                    <option value="5-20 rolls">5-20 rolls</option>
                    <option value="20-100 rolls">20-100 rolls</option>
                    <option value="100-500 rolls">100-500 rolls</option>
                    <option value="500+ rolls">500+ rolls</option>
                    <option value="Other">Other</option>
                  </select>
                  {ing.qty === 'Other' && (
                    <input type="text" value={ing.qtyCustom} onChange={(e) => handleIngredientChange(idx, 'qtyCustom', e.target.value)} placeholder="Specify qty..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                  )}
                </div>
                
                {idx > 0 ? (
                  <button type="button" onClick={() => removeIngredientRow(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginTop: '12px' }}><X size={20} /></button>
                ) : <div />}
              </div>
            ))}

            {ingredients.length < 10 && (
              <button type="button" onClick={addIngredientRow} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px dashed #0f7a43', color: '#0f7a43', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
                <Plus size={16} /> Add another product
              </button>
            )}
          </div>

          {/* Section 3: Crop / Use */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#0f7a43', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Crop / Use <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>

            <div className="ge-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {END_APPLICATIONS.map(app => (
                <button
                  key={app}
                  type="button"
                  onClick={() => togglePill(app, endApplications, setEndApplications)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: endApplications.includes(app) ? '1px solid #0f7a43' : '1px solid #ddd',
                    backgroundColor: endApplications.includes(app) ? '#f5faf7' : 'white',
                    color: endApplications.includes(app) ? '#0f7a43' : '#555',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {app}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: What Do You Need? */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#0f7a43', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              What Do You Need? <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>

            <div className="ge-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DOCUMENTS.map(doc => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => togglePill(doc, documents, setDocuments)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: documents.includes(doc) ? '1px solid #0f7a43' : '1px solid #ddd',
                    backgroundColor: documents.includes(doc) ? '#f5faf7' : 'white',
                    color: documents.includes(doc) ? '#0f7a43' : '#555',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Anything Else */}
          <div className="ge-section" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#0f7a43', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Anything Else <span style={{ backgroundColor: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>OPTIONAL</span>
            </h3>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              placeholder="Land size, crop, width/length required, delivery location, or any question you have for us..."
              style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '15px', backgroundColor: '#f9f9f9', resize: 'vertical' }}
            ></textarea>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#0f7a43',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                width: '100%',
                maxWidth: '400px'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
