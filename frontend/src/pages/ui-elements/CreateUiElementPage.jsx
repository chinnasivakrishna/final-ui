import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

const UI_PAGES = [
  { route: '/', name: 'Home Page', icon: '🏠', desc: 'Main landing page, hero, pillars, solutions, and showcase' },
  { route: '/about-us', name: 'About Us', icon: 'ℹ️', desc: 'Company heritage, vision, leadership team, and brand journey' },
  { route: '/operations', name: 'Operations', icon: '⚙️', desc: 'Manufacturing facilities, precision equipment, and supply chain' },
  { route: '/catalogues', name: 'Catalogues', icon: '📖', desc: 'Downloadable PDF brochures, technical specs, and catalogues' },
  { route: '/products', name: 'Products Page', icon: '📦', desc: 'Category showcase, collections, and featured products' },
  { route: 'global', name: 'Global Layout', icon: '🌐', desc: 'Header top bar, main navbar, site footer, and floating widgets' },
];

const DEFAULT_COMPONENTS = {
  '/': [
    {
      key: 'hero_section',
      name: 'Hero Section',
      desc: 'Top fold banner with headline, CTA buttons, and background image/video',
      variants: [
        { key: 'design_1', name: 'Design 1 - Full Width Cinematic Background', desc: 'Cinematic full-width background with bold centered typography and dual CTA buttons' },
        { key: 'design_2', name: 'Design 2 - Split Screen Modern Architectural Layout', desc: 'Two-column layout: left headline & actions, right interactive image slider' },
        { key: 'design_3', name: 'Design 3 - Interactive Showcase Carousel', desc: 'Full-bleed carousel with slide indicators and project highlights' },
      ],
      defaultTitle: 'Engineering Architectural Excellence',
      defaultSubtitle: 'Precision-crafted glass hardware, sliding systems, and smart architectural solutions.',
      defaultTag: 'TAITON ARCHITECTURAL SYSTEMS',
    },
    {
      key: 'pillars_bar',
      name: '5 Pillars Bar',
      desc: 'High-contrast strip highlighting core company strengths (Engineering, Quality, R&D, Pan-India, Support)',
      variants: [
        { key: 'design_1', name: 'Design 1 - Dark Navy Horizontal Strip', desc: 'Deep navy background with white border dividers and subtle hover highlights' },
        { key: 'design_2', name: 'Design 2 - Glassmorphic Floating Cards', desc: 'Elevated glass cards with icon badges and numerical statistics' },
      ],
      defaultTitle: 'The 5 Pillars of Taiton Excellence',
      defaultSubtitle: 'Our core commitments powering world-class architectural projects across the nation.',
      defaultTag: 'OUR FOUNDATION',
    },
    {
      key: 'solutions_carousel',
      name: 'Architectural Solutions',
      desc: 'Interactive showcase of sliding systems, glass hardware, and automatic doors',
      variants: [
        { key: 'design_1', name: 'Design 1 - 3D Glassmorphic Cards', desc: 'Hover-zoom cards with smooth gradient overlays and view product links' },
        { key: 'design_2', name: 'Design 2 - Minimalist Blueprint Grid', desc: 'Clean architectural grid with technical specs and blueprints' },
      ],
      defaultTitle: 'Complete Architectural Glass & Door Solutions',
      defaultSubtitle: 'Engineered for high-traffic commercial spaces, luxury residences, and modern facades.',
      defaultTag: 'INNOVATIVE SOLUTIONS',
    },
    {
      key: 'featured_products',
      name: 'Featured Products Grid',
      desc: 'Dynamic product grid highlighting bestselling architectural fittings',
      variants: [
        { key: 'design_1', name: 'Design 1 - 4-Column Product Showcase', desc: 'Clean white product cards with category badges and specification details' },
        { key: 'design_2', name: 'Design 2 - Masonry Showcase with Filter Tabs', desc: 'Filterable category tabs with dynamic responsive masonry' },
      ],
      defaultTitle: 'Featured Architectural Innovations',
      defaultSubtitle: 'Explore our latest precision hardware designed for seamless aesthetics and durability.',
      defaultTag: 'CURATED PRODUCTS',
    },
    {
      key: 'why_taiton',
      name: 'Why Choose Taiton',
      desc: 'Detailed brand strength box highlighting precision engineering and customer trust',
      variants: [
        { key: 'design_1', name: 'Design 1 - Dual Tone Asymmetric Split Box', desc: 'Left dark royal blue panel + right high-contrast light feature grid' },
        { key: 'design_2', name: 'Design 2 - Clean Minimal Feature List', desc: 'Linear checklist layout with checkmark icons and verified badges' },
      ],
      defaultTitle: 'Why India Trusts Taiton Hardware',
      defaultSubtitle: 'Over 25 years of uncompromised manufacturing standards, rigorous testing, and pan-India service.',
      defaultTag: 'THE TAITON ADVANTAGE',
    },
    {
      key: 'landmark_projects',
      name: 'Landmark Projects',
      desc: 'Gallery of prestigious commercial towers, airports, and luxury hotels using Taiton',
      variants: [
        { key: 'design_1', name: 'Design 1 - Full Width Card Slider', desc: 'High-resolution project photography with architectural client credits' },
        { key: 'design_2', name: 'Design 2 - Mosaic Collage Grid', desc: 'Geometric architectural image mosaic with lightbox viewer' },
      ],
      defaultTitle: 'Landmark Projects Across India',
      defaultSubtitle: 'Proud hardware partner for premier commercial complexes, luxury hotels, and corporate hubs.',
      defaultTag: 'PROVEN EXCELLENCE',
    },
    {
      key: 'testimonials',
      name: 'Client Reviews & Endorsements',
      desc: 'Architect and builder testimonials with ratings and verified credentials',
      variants: [
        { key: 'design_1', name: 'Design 1 - Quoted Architect Cards', desc: 'Quote card with architect portrait, star ratings, and firm name' },
        { key: 'design_2', name: 'Design 2 - Single Centered Focus Slider', desc: 'Large cinematic quote text with sleek author avatar and smooth transitions' },
      ],
      defaultTitle: 'What Architects & Builders Say',
      defaultSubtitle: 'Trusted by leading design studios, interior designers, and project managers.',
      defaultTag: 'CLIENT VOICES',
    },
  ],
  '/about-us': [
    {
      key: 'about_hero',
      name: 'About Heritage Banner',
      desc: 'Brand legacy banner with founding vision and company overview',
      variants: [
        { key: 'design_1', name: 'Design 1 - Classic Corporate Blue Banner', desc: 'Centered headline with background overlay and heritage badge' },
        { key: 'design_2', name: 'Design 2 - Split Story Layout with Year Badge', desc: 'Left typography with "Est. 1999" gold badge and right factory visual' },
      ],
      defaultTitle: 'Crafting Architectural Heritage Since 1999',
      defaultSubtitle: 'Two decades of relentless innovation, precision engineering, and customer trust.',
      defaultTag: 'OUR LEGACY',
    },
    {
      key: 'leadership_team',
      name: 'Leadership Team Grid',
      desc: 'Executive board and management team member profiles',
      variants: [
        { key: 'design_1', name: 'Design 1 - Executive Portrait Cards with Bio', desc: 'High-contrast portrait cards with designation, bio popup, and LinkedIn link' },
        { key: 'design_2', name: 'Design 2 - Minimal Monochrome Grid', desc: 'Modern monochrome profile tiles with smooth hover color reveal' },
      ],
      defaultTitle: 'Executive Leadership Team',
      defaultSubtitle: 'Guided by industry veterans committed to architectural innovation and engineering integrity.',
      defaultTag: 'THE LEADERS',
    },
    {
      key: 'brand_journey',
      name: 'Milestones & Brand Journey',
      desc: 'Interactive timeline tracking key company achievements and expansion',
      variants: [
        { key: 'design_1', name: 'Design 1 - Alternating Vertical Timeline', desc: 'Chronological timeline with milestone dots and photographic highlights' },
        { key: 'design_2', name: 'Design 2 - Horizontal Milestone Slider', desc: 'Scrollable milestone roadmap with year badges' },
      ],
      defaultTitle: 'Our Journey of Innovation',
      defaultSubtitle: 'Key milestones in our evolution from a specialized workshop to a national hardware leader.',
      defaultTag: 'ROADMAP',
    },
  ],
  '/operations': [
    {
      key: 'operations_hero',
      name: 'Operations Hero Banner',
      desc: 'Manufacturing scale, cleanroom environments, and automated testing',
      variants: [
        { key: 'design_1', name: 'Design 1 - Industrial Dark Slate Banner', desc: 'High-tech industrial background with capacity badges' },
        { key: 'design_2', name: 'Design 2 - Clean Facility Split Screen', desc: 'Facility statistics on the left and automated CNC video on right' },
      ],
      defaultTitle: 'World-Class Precision Manufacturing',
      defaultSubtitle: 'State-of-the-art infrastructure delivering zero-defect architectural hardware.',
      defaultTag: 'MANUFACTURING EXCELLENCE',
    },
    {
      key: 'facility_stats',
      name: 'Facility Metrics & Numbers',
      desc: 'Key stats: 100k+ sq.ft factory, 500+ product lines, 50k monthly units',
      variants: [
        { key: 'design_1', name: 'Design 1 - 4-Column Stat Counter Grid', desc: 'Bold numbers with animated counters and descriptive subheadings' },
        { key: 'design_2', name: 'Design 2 - High Contrast Metric Ribbon', desc: 'Continuous ticker ribbon with key engineering metrics' },
      ],
      defaultTitle: 'Infrastructure at a Glance',
      defaultSubtitle: 'Capacity, machinery, and nationwide distribution network.',
      defaultTag: 'NUMBERS THAT MATTER',
    },
  ],
  '/catalogues': [
    {
      key: 'catalog_hero',
      name: 'Catalogues Header Banner',
      desc: 'Header banner for downloadable brochures, product catalogs, and CAD files',
      variants: [
        { key: 'design_1', name: 'Design 1 - Centered Download Portal Header', desc: 'Clean header with search bar and quick PDF filter tags' },
        { key: 'design_2', name: 'Design 2 - Split Screen with Featured Catalog', desc: 'Highlighted latest master catalogue preview on the right' },
      ],
      defaultTitle: 'Download Comprehensive Product Catalogues',
      defaultSubtitle: 'Get detailed technical specifications, installation guides, and CAD drawings.',
      defaultTag: 'DOCUMENTATION & SPECS',
    },
  ],
  '/products': [
    {
      key: 'products_hero',
      name: 'Products Showcase Hero',
      desc: 'Top banner for product listings and category exploration',
      variants: [
        { key: 'design_1', name: 'Design 1 - Modern Architectural Glass Hero', desc: 'Deep navy background with floating category selector pills' },
        { key: 'design_2', name: 'Design 2 - Dynamic Filter Bar Banner', desc: 'Integrated search and instant live category chips' },
      ],
      defaultTitle: 'Explore Taiton Architectural Systems',
      defaultSubtitle: 'High-performance glass hardware, sliding systems, shower hinges, and automatic door controls.',
      defaultTag: 'PRODUCT CATALOG',
    },
  ],
  'global': [
    {
      key: 'header_top',
      name: 'Header Top Bar',
      desc: 'Top contact strip with phone, email, dealer locator, and customer service links',
      variants: [
        { key: 'design_1', name: 'Design 1 - Dark Navy Slim Strip', desc: 'Sleek dark background with white icons and subtle hover animations' },
        { key: 'design_2', name: 'Design 2 - Clean White Accent Strip', desc: 'Minimalist white strip with brand blue accents and social icons' },
      ],
      defaultTitle: 'Taiton Customer Support Strip',
      defaultSubtitle: 'Contact numbers, customer portal link, and branch locator.',
      defaultTag: 'SITE HEADER',
    },
    {
      key: 'navbar',
      name: 'Main Navigation Header',
      desc: 'Logo, mega menu navigation, product search, and request quote CTA',
      variants: [
        { key: 'design_1', name: 'Design 1 - Glassmorphic Sticky Header', desc: 'Semi-transparent frosted glass navbar with drop shadow on scroll' },
        { key: 'design_2', name: 'Design 2 - Solid Corporate Royal Blue Header', desc: 'Premium deep blue branding with mega-menu dropdowns' },
      ],
      defaultTitle: 'Main Navigation Header',
      defaultSubtitle: 'Primary brand navigation menu with mega-menu and search trigger.',
      defaultTag: 'SITE NAVIGATION',
    },
    {
      key: 'footer',
      name: 'Site Footer & Mega Links',
      desc: '4-column footer with quick links, product categories, certifications, and newsletter',
      variants: [
        { key: 'design_1', name: 'Design 1 - 4-Column Deep Navy Mega Footer', desc: 'Rich 4-column layout with category links, ISO badges, and copyright' },
        { key: 'design_2', name: 'Design 2 - Minimalist 2-Column Dark Slate Footer', desc: 'Compact modern footer with essential legal links and social icons' },
      ],
      defaultTitle: 'Master Site Footer',
      defaultSubtitle: 'Global corporate footer with navigation and legal disclosures.',
      defaultTag: 'GLOBAL FOOTER',
    },
    {
      key: 'floating_widgets',
      name: 'Floating Quick Contact Widgets',
      desc: 'Fixed bottom-right floating WhatsApp, Call, and Enquiry button widgets',
      variants: [
        { key: 'design_1', name: 'Design 1 - Dual Floating Action Bubble (WhatsApp + Call)', desc: 'Pulsing circular WhatsApp and Call action buttons' },
        { key: 'design_2', name: 'Design 2 - Expandable Quick Contact Dock', desc: 'Docked slide-out drawer with quick callback request form' },
      ],
      defaultTitle: 'Floating Quick Contact Widgets',
      defaultSubtitle: 'Instant WhatsApp chat and click-to-call floating controls.',
      defaultTag: 'WIDGETS',
    },
  ],
};

export function CreateUiElementPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Guided Steps: 1: Page -> 2: Component -> 3: Design -> 4: Form Filling -> 5: Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Selections
  const [selectedRoute, setSelectedRoute] = useState('/');
  const [selectedPageName, setSelectedPageName] = useState('Home Page');
  const [selectedCompKey, setSelectedCompKey] = useState('hero_section');
  const [selectedCompName, setSelectedCompName] = useState('Hero Section');
  const [selectedDesignKey, setSelectedDesignKey] = useState('design_1');
  const [availableComponents, setAvailableComponents] = useState(DEFAULT_COMPONENTS['/']);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [eyebrowTag, setEyebrowTag] = useState('');
  const [primaryBtnText, setPrimaryBtnText] = useState('Explore Solutions');
  const [primaryBtnUrl, setPrimaryBtnUrl] = useState('/products');
  const [secondaryBtnText, setSecondaryBtnText] = useState('Download Catalog');
  const [secondaryBtnUrl, setSecondaryBtnUrl] = useState('/catalogues');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [status, setStatus] = useState('live');
  const [view, setView] = useState('view');
  const [sortOrder, setSortOrder] = useState(10);

  // Dynamic Array Items (e.g. for pillars, cards, slides, stats)
  const [itemsList, setItemsList] = useState([
    { title: 'ISO 9001:2015 Certified', desc: 'Rigorously tested to international architectural standards', link: '/about-us' },
    { title: 'Grade 304 & 316 Stainless Steel', desc: 'High corrosion resistance for marine and exterior applications', link: '/products' },
    { title: 'Pan-India Distribution', desc: 'Warehouses and support centers in 28+ states across India', link: '/operations' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Update available components when page changes
  useEffect(() => {
    const comps = DEFAULT_COMPONENTS[selectedRoute] || [];
    setAvailableComponents(comps);
    if (comps.length > 0 && !editId) {
      const first = comps[0];
      setSelectedCompKey(first.key);
      setSelectedCompName(first.name);
      if (first.variants && first.variants.length > 0) {
        setSelectedDesignKey(first.variants[0].key);
      }
      if (!title) setTitle(first.defaultTitle || '');
      if (!subtitle) setSubtitle(first.defaultSubtitle || '');
      if (!eyebrowTag) setEyebrowTag(first.defaultTag || '');
    }
  }, [selectedRoute, editId]);

  // Load existing UI element if editId is provided
  useEffect(() => {
    if (token && editId) {
      setLoadingEdit(true);
      enterpriseApi.contentDetail(token, 'ui_element', editId)
        .then((res) => {
          const item = res.item || res.data || {};
          const p = item.payload || {};
          const route = item.page_route || p.page_route || '/';
          const pName = item.page_name || p.page_name || 'Home Page';
          const compKey = item.component_key || p.component_key || 'hero_section';
          const compName = item.component_name || p.component_name || item.title || 'Component';
          const design = item.design_variant || p.design_variant || 'design_1';

          setSelectedRoute(route);
          setSelectedPageName(pName);
          setSelectedCompKey(compKey);
          setSelectedCompName(compName);
          setSelectedDesignKey(design);

          setTitle(item.title || p.title || '');
          setSubtitle(item.summary || p.subtitle || p.description || '');
          setEyebrowTag(p.eyebrow_tag || p.tag || '');
          setPrimaryBtnText(p.primary_btn_text || 'Explore Solutions');
          setPrimaryBtnUrl(p.primary_btn_url || '/products');
          setSecondaryBtnText(p.secondary_btn_text || 'Download Catalog');
          setSecondaryBtnUrl(p.secondary_btn_url || '/catalogues');
          setImageUrl(item.img || p.image_url || p.img || '');
          setImageAlt(p.image_alt || '');
          setStatus(item.status || 'live');
          setView(item.view || p.view || 'view');
          setSortOrder(p.sort_order || 10);
          if (Array.isArray(p.items) && p.items.length > 0) {
            setItemsList(p.items);
          }
          // In edit mode, jump directly to form filling
          setCurrentStep(4);
        })
        .catch((err) => notify.apiError(err, 'Failed to load UI element details'))
        .finally(() => setLoadingEdit(false));
    }
  }, [token, editId]);

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setImageUrl(res.url);
      notify.success('Uploaded', 'Component image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Image upload failed');
    }
  };

  // Add Item to dynamic items list
  const addItem = () => {
    setItemsList([...itemsList, { title: 'New Item', desc: 'Description of item', link: '#' }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...itemsList];
    updated[index][field] = value;
    setItemsList(updated);
  };

  const removeItem = (index) => {
    setItemsList(itemsList.filter((_, i) => i !== index));
  };

  // Current active component configuration
  const currentComp = availableComponents.find((c) => c.key === selectedCompKey) || availableComponents[0] || {};
  const currentVariants = currentComp.variants || [
    { key: 'design_1', name: 'Design 1 - Standard Modern Layout', desc: 'Standard responsive layout with brand design tokens' },
  ];

  // Submit UI Element
  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!token) return;

    if (!title.trim()) {
      notify.formWarning('Component Title is required.');
      setCurrentStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        page_route: selectedRoute,
        page_name: selectedPageName,
        component_key: selectedCompKey,
        component_name: selectedCompName,
        design_variant: selectedDesignKey,
        title: title.trim(),
        subtitle: subtitle.trim(),
        eyebrow_tag: eyebrowTag.trim(),
        primary_btn_text: primaryBtnText.trim(),
        primary_btn_url: primaryBtnUrl.trim(),
        secondary_btn_text: secondaryBtnText.trim(),
        secondary_btn_url: secondaryBtnUrl.trim(),
        image_url: imageUrl,
        image_alt: imageAlt.trim(),
        items: itemsList,
        sort_order: Number(sortOrder) || 10,
        view,
        status,
      };

      const body = {
        title: title.trim(),
        summary: subtitle.trim().slice(0, 200) || title.trim(),
        status,
        view,
        page_name: selectedPageName,
        page_route: selectedRoute,
        component_key: selectedCompKey,
        component_name: selectedCompName,
        design_variant: selectedDesignKey,
        img: imageUrl || null,
        payload,
      };

      if (editId) {
        await enterpriseApi.contentUpdate(token, 'ui_element', editId, body);
        notify.success('Updated', `UI Component "${title}" updated successfully.`);
      } else {
        await enterpriseApi.contentCreate(token, 'ui_element', body);
        notify.success('Created', `UI Component "${title}" configured and saved.`);
      }

      emitUnreadRefresh();
      navigate('/app/ui-elements');
    } catch (err) {
      notify.apiError(err, 'Failed to save UI Component configuration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-stack" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <PageBreadcrumb parent="UI Elements" parentUrl="/app/ui-elements" current={editId ? 'Edit UI Component' : 'Configure UI Component'} />

      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">{editId ? 'Edit UI Component' : 'Configure Website UI Component'}</h1>
          <p className="cp-muted">Select page, component, and design variant, then customize content and publish to live website.</p>
        </div>
      </div>

      {/* STEPPER WIZARD BAR */}
      <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--cp-border)', overflowX: 'auto' }}>
        {[
          { num: 1, label: '1. Choose Page' },
          { num: 2, label: '2. Choose Component' },
          { num: 3, label: '3. Select Design' },
          { num: 4, label: '4. Form Filling' },
          { num: 5, label: '5. Preview & Submit' },
        ].map((step) => {
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <button
              key={step.num}
              type="button"
              className={`cp-btn ${isActive ? 'cp-btn-primary' : isDone ? 'cp-btn-secondary' : 'cp-btn-secondary'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                padding: '6px 14px',
                fontWeight: isActive ? '700' : '500',
                opacity: isDone ? '0.9' : isActive ? '1' : '0.65',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setCurrentStep(step.num)}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{step.num}</span>
              )}
              {step.label}
            </button>
          );
        })}
      </div>

      {loadingEdit ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cp-muted)' }}>Loading UI component data…</div>
      ) : (
        <div>
          {/* STEP 1: CHOOSE PAGE */}
          {currentStep === 1 && (
            <section className="cp-card cp-card-pad">
              <h2 className="cp-section-title" style={{ marginBottom: '6px' }}>Step 1: Choose Website Page</h2>
              <p className="cp-muted" style={{ marginBottom: '20px' }}>Select which section of the website this component belongs to.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {UI_PAGES.map((p) => {
                  const isSelected = selectedRoute === p.route;
                  return (
                    <div
                      key={p.route}
                      onClick={() => {
                        setSelectedRoute(p.route);
                        setSelectedPageName(p.name);
                        const comps = DEFAULT_COMPONENTS[p.route] || [];
                        if (comps.length > 0) {
                          setSelectedCompKey(comps[0].key);
                          setSelectedCompName(comps[0].name);
                          if (comps[0].variants?.[0]) setSelectedDesignKey(comps[0].variants[0].key);
                        }
                      }}
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--cp-primary, #0054A6)' : '1px solid var(--cp-border, #e2e8f0)',
                        background: isSelected ? 'rgba(0, 84, 166, 0.04)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 84, 166, 0.1)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '26px' }}>{p.icon}</span>
                        {isSelected && (
                          <span style={{ background: 'var(--cp-primary, #0054A6)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                            SELECTED
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>{p.name}</h3>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0', minHeight: '36px' }}>{p.desc}</p>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#0284c7', background: '#f0f9ff', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        {p.route}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="cp-btn cp-btn-primary" onClick={() => setCurrentStep(2)} style={{ padding: '10px 24px' }}>
                  Next: Choose Component &rarr;
                </button>
              </div>
            </section>
          )}

          {/* STEP 2: CHOOSE COMPONENT */}
          {currentStep === 2 && (
            <section className="cp-card cp-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 className="cp-section-title">Step 2: Choose Component for {selectedPageName}</h2>
                <span className="cp-tag" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '600' }}>{selectedRoute}</span>
              </div>
              <p className="cp-muted" style={{ marginBottom: '20px' }}>Select which UI element or fold you want to customize on this page.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
                {availableComponents.map((comp) => {
                  const isSelected = selectedCompKey === comp.key;
                  return (
                    <div
                      key={comp.key}
                      onClick={() => {
                        setSelectedCompKey(comp.key);
                        setSelectedCompName(comp.name);
                        if (comp.variants && comp.variants.length > 0) {
                          setSelectedDesignKey(comp.variants[0].key);
                        }
                        if (!title || title === currentComp.defaultTitle) setTitle(comp.defaultTitle || comp.name);
                        if (!subtitle || subtitle === currentComp.defaultSubtitle) setSubtitle(comp.defaultSubtitle || '');
                        if (!eyebrowTag || eyebrowTag === currentComp.defaultTag) setEyebrowTag(comp.defaultTag || '');
                      }}
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--cp-primary, #0054A6)' : '1px solid var(--cp-border, #e2e8f0)',
                        background: isSelected ? 'rgba(0, 84, 166, 0.04)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 84, 166, 0.1)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>{comp.name}</h3>
                        {isSelected && (
                          <span style={{ background: 'var(--cp-primary, #0054A6)', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', minHeight: '40px' }}>{comp.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#475569', fontWeight: '500' }}>
                          {comp.variants?.length || 1} Design Variant{(comp.variants?.length || 1) > 1 ? 's' : ''}
                        </span>
                        <span style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: '11px' }}>{comp.key}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" className="cp-btn cp-btn-secondary" onClick={() => setCurrentStep(1)}>
                  &larr; Back to Pages
                </button>
                <button type="button" className="cp-btn cp-btn-primary" onClick={() => setCurrentStep(3)} style={{ padding: '10px 24px' }}>
                  Next: Select Design Variant &rarr;
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: SELECT DESIGN VARIANT */}
          {currentStep === 3 && (
            <section className="cp-card cp-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 className="cp-section-title">Step 3: Select Design Variant for &quot;{selectedCompName}&quot;</h2>
                <span className="cp-tag" style={{ background: '#fef3c7', color: '#b45309', fontWeight: '600' }}>{currentVariants.length} Designs Available</span>
              </div>
              <p className="cp-muted" style={{ marginBottom: '20px' }}>
                This component supports multiple dynamic designs. Choose which visual layout the website frontend will render.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {currentVariants.map((variant) => {
                  const isSelected = selectedDesignKey === variant.key;
                  return (
                    <div
                      key={variant.key}
                      onClick={() => setSelectedDesignKey(variant.key)}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--cp-primary, #0054A6)' : '1px solid var(--cp-border, #e2e8f0)',
                        background: isSelected ? 'rgba(0, 84, 166, 0.05)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 6px 18px rgba(0, 84, 166, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span
                            style={{
                              background: isSelected ? '#0054A6' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#334155',
                              fontWeight: '700',
                              fontSize: '12px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {variant.key.toUpperCase()}
                          </span>
                          {isSelected && (
                            <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: '700', fontSize: '11px', padding: '3px 8px', borderRadius: '10px' }}>
                              ACTIVE TEMPLATE
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>{variant.name}</h3>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>{variant.desc}</p>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Dynamic Template</span>
                        <button
                          type="button"
                          className={`cp-btn ${isSelected ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
                          style={{ fontSize: '12px', padding: '4px 12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDesignKey(variant.key);
                          }}
                        >
                          {isSelected ? 'Selected' : 'Use This Design'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" className="cp-btn cp-btn-secondary" onClick={() => setCurrentStep(2)}>
                  &larr; Back to Components
                </button>
                <button type="button" className="cp-btn cp-btn-primary" onClick={() => setCurrentStep(4)} style={{ padding: '10px 24px' }}>
                  Next: Fill Content Form &rarr;
                </button>
              </div>
            </section>
          )}

          {/* STEP 4: FORM FILLING */}
          {currentStep === 4 && (
            <section className="cp-card cp-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 className="cp-section-title">Step 4: Form Filling for {selectedCompName}</h2>
                  <p className="cp-muted">Fill out the copy, links, media, and dynamic items for this component.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="cp-tag" style={{ background: '#f1f5f9', color: '#334155' }}>Page: {selectedPageName}</span>
                  <span className="cp-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>Design: {selectedDesignKey.toUpperCase()}</span>
                </div>
              </div>

              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Main Titles */}
                <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
                  <label className="cp-field">
                    <span className="cp-field-label-text">Eyebrow / Badge Text</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={eyebrowTag}
                      onChange={(e) => setEyebrowTag(e.target.value)}
                      placeholder="e.g. TAITON ARCHITECTURAL SYSTEMS"
                    />
                  </label>

                  <label className="cp-field">
                    <span className="cp-field-label-text">Display Sort Order</span>
                    <input
                      type="number"
                      className="cp-input"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder="e.g. 10"
                    />
                  </label>

                  <label className="cp-field" style={{ gridColumn: 'span 2' }}>
                    <span className="cp-field-label-text">Main Headline / Title <span className="cp-req">*</span></span>
                    <input
                      type="text"
                      className="cp-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Engineering Architectural Excellence"
                      required
                    />
                  </label>

                  <label className="cp-field" style={{ gridColumn: 'span 2' }}>
                    <span className="cp-field-label-text">Subtitle / Summary Text</span>
                    <textarea
                      className="cp-input"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Precision-crafted glass hardware, sliding systems, and smart architectural solutions."
                      style={{ height: '70px', minHeight: '60px', resize: 'vertical' }}
                    />
                  </label>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--cp-border)' }} />

                {/* 2. Action Buttons */}
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Action Buttons (CTA)</h3>
                <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
                  <label className="cp-field">
                    <span className="cp-field-label-text">Primary Button Label</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={primaryBtnText}
                      onChange={(e) => setPrimaryBtnText(e.target.value)}
                      placeholder="e.g. Explore Solutions"
                    />
                  </label>

                  <label className="cp-field">
                    <span className="cp-field-label-text">Primary Button Link / Route</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={primaryBtnUrl}
                      onChange={(e) => setPrimaryBtnUrl(e.target.value)}
                      placeholder="e.g. /products"
                    />
                  </label>

                  <label className="cp-field">
                    <span className="cp-field-label-text">Secondary Button Label</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={secondaryBtnText}
                      onChange={(e) => setSecondaryBtnText(e.target.value)}
                      placeholder="e.g. Download Catalog"
                    />
                  </label>

                  <label className="cp-field">
                    <span className="cp-field-label-text">Secondary Button Link / Route</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={secondaryBtnUrl}
                      onChange={(e) => setSecondaryBtnUrl(e.target.value)}
                      placeholder="e.g. /catalogues"
                    />
                  </label>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--cp-border)' }} />

                {/* 3. Media Upload */}
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Component Visual Media</h3>
                <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
                  <div className="cp-field">
                    <span className="cp-field-label-text">Primary Visual / Background Image</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                      {imageUrl && (
                        <img
                          src={resolveImageUrl(imageUrl)}
                          alt="Preview"
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                        />
                      )}
                      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="cp-input"
                          style={{ width: '100%', paddingRight: '110px' }}
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Image URL or upload below"
                        />
                        <input
                          type="file"
                          id="ui-img-file"
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <button
                          type="button"
                          className="cp-btn cp-btn-primary"
                          onClick={() => document.getElementById('ui-img-file').click()}
                          style={{
                            position: 'absolute',
                            right: '4px',
                            top: '4px',
                            bottom: '4px',
                            minHeight: 'auto',
                            padding: '0 12px',
                            fontSize: '12px',
                            borderRadius: '6px',
                          }}
                        >
                          Choose File
                        </button>
                      </div>
                    </div>
                  </div>

                  <label className="cp-field">
                    <span className="cp-field-label-text">Image Alt Text (for SEO & Accessibility)</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="e.g. Taiton architectural glass system"
                    />
                  </label>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--cp-border)' }} />

                {/* 4. Dynamic Content Items Array */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Dynamic Content Items ({itemsList.length})</h3>
                    <p className="cp-muted" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
                      Cards, pillars, statistics, team members, or feature items rendered by this component.
                    </p>
                  </div>
                  <button type="button" className="cp-btn cp-btn-secondary" onClick={addItem} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    + Add New Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {itemsList.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--cp-border)',
                        background: '#f8fafc',
                        display: 'grid',
                        gridTemplateColumns: '2fr 3fr 2fr auto',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        className="cp-input"
                        placeholder="Item Title"
                        value={item.title || ''}
                        onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      />
                      <input
                        type="text"
                        className="cp-input"
                        placeholder="Item Description / Subtext"
                        value={item.desc || ''}
                        onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                      />
                      <input
                        type="text"
                        className="cp-input"
                        placeholder="Link / URL"
                        value={item.link || ''}
                        onChange={(e) => updateItem(idx, 'link', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--cp-border)' }} />

                {/* 5. Publishing Status & Visibility */}
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Publishing & Website Visibility</h3>
                <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
                  <label className="cp-field">
                    <span className="cp-field-label-text">Component Status</span>
                    <select className="cp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="live">Live (Published immediately)</option>
                      <option value="draft">Draft (Saved but not live)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>

                  <label className="cp-field">
                    <span className="cp-field-label-text">Website Live Visibility Toggle</span>
                    <select className="cp-select" value={view} onChange={(e) => setView(e.target.value)}>
                      <option value="view">View (Visible to public website visitors)</option>
                      <option value="hide">Hide (Hidden from public website visitors)</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button type="button" className="cp-btn cp-btn-secondary" onClick={() => setCurrentStep(3)}>
                    &larr; Back to Designs
                  </button>
                  <button type="button" className="cp-btn cp-btn-primary" onClick={() => setCurrentStep(5)} style={{ padding: '10px 24px' }}>
                    Next: Review Live Preview & Submit &rarr;
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* STEP 5: PREVIEW & SUBMIT */}
          {currentStep === 5 && (
            <section className="cp-card cp-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 className="cp-section-title">Step 5: Review Component & Submit</h2>
                  <p className="cp-muted">Live preview of how your chosen design variant will render on the website frontend.</p>
                </div>
                <span className="cp-tag" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '700' }}>
                  READY TO PUBLISH
                </span>
              </div>

              {/* LIVE CARD PREVIEW MOCKUP */}
              <div
                style={{
                  background: selectedDesignKey === 'design_1' ? 'linear-gradient(135deg, #0b1f3a 0%, #003875 100%)' : '#ffffff',
                  color: selectedDesignKey === 'design_1' ? '#ffffff' : '#0f172a',
                  border: '1px solid var(--cp-border)',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: selectedDesignKey === 'design_1' ? '#fff' : '#0054A6' }}>
                    {selectedPageName} ({selectedRoute})
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: selectedDesignKey === 'design_1' ? '#fff' : '#0054A6' }}>
                    {selectedDesignKey.toUpperCase()}
                  </span>
                </div>

                {eyebrowTag && (
                  <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: selectedDesignKey === 'design_1' ? '#93c5fd' : '#0284c7', marginBottom: '8px' }}>
                    {eyebrowTag}
                  </div>
                )}

                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: '1.2' }}>
                  {title || 'Untitled Component Headline'}
                </h1>

                <p style={{ fontSize: '14px', maxWidth: '640px', lineHeight: '1.6', opacity: 0.9, margin: '0 0 20px 0' }}>
                  {subtitle || 'Component subtitle description will appear here on your live website.'}
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {primaryBtnText && (
                    <span style={{ background: '#0054A6', color: '#ffffff', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
                      {primaryBtnText} &rarr;
                    </span>
                  )}
                  {secondaryBtnText && (
                    <span style={{ border: selectedDesignKey === 'design_1' ? '1px solid rgba(255,255,255,0.4)' : '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
                      {secondaryBtnText}
                    </span>
                  )}
                </div>

                {/* Items preview preview */}
                {itemsList.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px', borderTop: selectedDesignKey === 'design_1' ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0', paddingTop: '16px' }}>
                    {itemsList.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ background: selectedDesignKey === 'design_1' ? 'rgba(255,255,255,0.08)' : '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="cp-btn cp-btn-secondary" onClick={() => setCurrentStep(4)}>
                  &larr; Back to Edit Form
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    onClick={() => navigate('/app/ui-elements')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="cp-btn cp-btn-primary"
                    onClick={onSubmit}
                    disabled={submitting}
                    style={{ minWidth: '180px', padding: '10px 24px', fontWeight: '700' }}
                  >
                    {submitting ? 'Saving to Database…' : editId ? 'Update UI Component' : 'Publish UI Component'}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
