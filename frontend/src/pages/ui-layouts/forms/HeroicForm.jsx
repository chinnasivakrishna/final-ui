import React, { useState } from 'react';
import { enterpriseApi } from '../../../api/enterpriseApi';
import { notify } from '../../../utils/notify';

export function HeroicForm({ config, onChange, activeSlideIdx = 0, onSlideSelect, token }) {
  const layoutId = config?.layoutId || 'large-premium-banner';
  const data = config?.data || {};
  const slides = Array.isArray(data.slides) && data.slides.length > 0
    ? data.slides
    : [
        {
          id: 'slide-1',
          backgroundImage: '/Taiton/banners/1.webp',
          videoUrl: '',
          posterImage: '',
          overlayStyle: 'light',
          content: {
            tag: 'PREMIUM GLASS & HARDWARE SOLUTIONS',
            title: 'Crafting the Future of',
            titleAccent: 'Glass & Spaces',
            subtitle: 'Innovative Systems, Elegant designs and precision engineering for modern living',
          },
          cta: {
            label: 'Explore Catalogues',
            url: '/catalogues',
            icon: 'fas fa-arrow-right',
          },
          ctaLinks: [
            { label: 'Virtual Showroom', url: '/about#vision-sec', icon: 'fas fa-cube' },
            { label: 'Project Inquiries', url: '#contact-sec', icon: 'fas fa-paper-plane' },
            { label: 'Product Range', url: '/products', icon: 'fas fa-layer-group' },
          ],
        },
      ];

  const currentIdx = Math.max(0, Math.min(activeSlideIdx, slides.length - 1));
  const [uploading, setUploading] = useState(false);

  const currentSlide = slides[currentIdx] || slides[0];

  const updateConfig = (newLayoutId, newSlides, newInterval) => {
    onChange({
      layoutId: newLayoutId !== undefined ? newLayoutId : layoutId,
      data: {
        ...data,
        autoplayInterval: newInterval !== undefined ? newInterval : (data.autoplayInterval || 5000),
        slides: newSlides !== undefined ? newSlides : slides,
      },
    });
  };

  const updateCurrentSlide = (patch) => {
    const updated = slides.map((s, idx) => {
      if (idx === currentIdx) {
        return { ...s, ...patch };
      }
      return s;
    });
    updateConfig(layoutId, updated);
  };

  const handleSelectSlide = (idx) => {
    if (onSlideSelect) {
      onSlideSelect(idx);
    }
  };

  const handleLayoutChange = (newId) => {
    updateConfig(newId, slides);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      backgroundImage: '/Taiton/banners/1.webp',
      videoUrl: '',
      posterImage: '/Taiton/banners/1.webp',
      overlayStyle: layoutId === 'full-page-video' ? 'dark' : 'light',
      content: {
        tag: 'NEW ARCHITECTURAL HARDWARE',
        title: 'Precision Engineering for',
        titleAccent: 'Contemporary Spaces',
        subtitle: 'Engineered hardware systems crafted to perfection for modern architectural excellence.',
      },
      cta: {
        label: 'Explore More',
        url: '/products',
        icon: 'fas fa-arrow-right',
      },
      ctaLinks: [],
    };
    const nextSlides = [...slides, newSlide];
    updateConfig(layoutId, nextSlides);
    if (onSlideSelect) {
      onSlideSelect(nextSlides.length - 1);
    }
  };

  const handleRemoveSlide = (idxToRemove) => {
    if (slides.length <= 1) {
      notify.warn('At least one slide is required.');
      return;
    }
    const nextSlides = slides.filter((_, idx) => idx !== idxToRemove);
    updateConfig(layoutId, nextSlides);
    if (onSlideSelect) {
      onSlideSelect(0);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await enterpriseApi.uploadImage(token, file, 'banner');
      const uploadedPath = res.url || res.path || res.imageUrl;
      if (uploadedPath) {
        updateCurrentSlide({ [field]: uploadedPath });
        notify.success('Image uploaded successfully');
      } else {
        notify.error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      notify.error('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Conditional flags for Current Slide
  const hasContent = Boolean(currentSlide?.content && (currentSlide.content.title || currentSlide.content.tag));
  const hasCta = Boolean(currentSlide?.cta && currentSlide.cta.label);
  const hasCtaLinks = Array.isArray(currentSlide?.ctaLinks) && currentSlide.ctaLinks.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Layout Template & Interval */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '8px', margin: '0 0 14px' }}>
          1. Heroic Layout & Timing
        </h3>
        <div className="cp-grid cp-grid-2" style={{ gap: '16px' }}>
          <div className="cp-field">
            <span className="cp-field-label-text">
              Active Layout <span className="cp-req">*</span>
            </span>
            <select
              className="cp-select"
              value={layoutId}
              onChange={(e) => handleLayoutChange(e.target.value)}
            >
              <option value="large-premium-banner">Large Premium Banner (Image Slideshow)</option>
              <option value="full-page-video">Full Page Video (Cinematic Video Player)</option>
            </select>
            <span className="cp-field-hint">
              Select between high-resolution imagery slideshow or cinematic fullscreen video.
            </span>
          </div>

          <div className="cp-field">
            <span className="cp-field-label-text">Slide Autoplay Duration (ms)</span>
            <input
              type="number"
              className="cp-input"
              value={data.autoplayInterval || 5000}
              onChange={(e) => updateConfig(layoutId, slides, parseInt(e.target.value, 10) || 5000)}
              step="500"
              min="2000"
              max="20000"
            />
            <span className="cp-field-hint">Transition timer in milliseconds (e.g. 5000 = 5 seconds).</span>
          </div>
        </div>
      </div>

      {/* 2. Slide Tabs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
            2. Heroic Slides ({slides.length})
          </h3>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={handleAddSlide}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Add Slide
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              type="button"
              className={`cp-btn ${currentIdx === idx ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
              onClick={() => handleSelectSlide(idx)}
              style={{ fontSize: '13px', padding: '6px 14px' }}
            >
              Slide #{idx + 1}
            </button>
          ))}
        </div>

        {/* Current Slide Editor Card */}
        <div style={{
          background: 'var(--cp-surface-elevated, #ffffff)',
          border: '1px solid var(--cp-border, #e2e8f0)',
          borderRadius: '8px',
          padding: '18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cp-border, #e2e8f0)', paddingBottom: '10px', marginBottom: '16px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--cp-text)' }}>
              <i className="fas fa-sliders-h" style={{ marginRight: '8px', color: 'var(--cp-primary)' }}></i>
              Configuring Slide #{activeSlideIdx + 1}
            </span>
            {slides.length > 1 && (
              <button
                type="button"
                className="cp-btn cp-btn-ghost"
                onClick={() => handleRemoveSlide(activeSlideIdx)}
                style={{ color: '#dc2626', fontSize: '12px', padding: '4px 8px' }}
                title="Remove this slide"
              >
                <i className="fas fa-trash-alt" style={{ marginRight: '4px' }}></i> Delete Slide
              </button>
            )}
          </div>

          {/* Media Background Configuration */}
          {layoutId === 'large-premium-banner' ? (
            <div style={{ marginBottom: '18px' }}>
              <div className="cp-field">
                <span className="cp-field-label-text">
                  Background Banner Image <span className="cp-req">*</span>
                </span>
                {currentSlide?.backgroundImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--cp-surface, #f8fafc)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--cp-border, #e2e8f0)', marginTop: '4px' }}>
                    <img
                      src={currentSlide.backgroundImage}
                      alt="Preview"
                      style={{ height: '56px', width: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--cp-border)' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="cp-btn cp-btn-secondary" style={{ whiteSpace: 'nowrap', cursor: 'pointer', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                        {uploading ? 'Uploading...' : 'Change Image'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                        />
                      </label>
                      <button
                        type="button"
                        className="cp-btn cp-btn-ghost"
                        onClick={() => updateCurrentSlide({ backgroundImage: '' })}
                        style={{ color: '#dc2626', padding: '6px 10px', fontSize: '12px' }}
                        title="Remove Image"
                      >
                        <i className="fas fa-trash-alt" style={{ marginRight: '4px' }}></i> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="cp-btn cp-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, padding: '8px 16px' }}>
                      <i className="fas fa-cloud-upload-alt"></i>
                      {uploading ? 'Uploading...' : 'Upload Banner Image'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="cp-field">
                <span className="cp-field-label-text">
                  Video URL (MP4 / WebM / CDN) <span className="cp-req">*</span>
                </span>
                <input
                  type="text"
                  className="cp-input"
                  placeholder="e.g. https://commondatastorage.googleapis.com/.../video.mp4"
                  value={currentSlide?.videoUrl || ''}
                  onChange={(e) => updateCurrentSlide({ videoUrl: e.target.value })}
                />
              </div>

              <div className="cp-field">
                <span className="cp-field-label-text">Video Poster Fallback Image</span>
                {currentSlide?.posterImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--cp-surface, #f8fafc)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--cp-border, #e2e8f0)', marginTop: '4px' }}>
                    <img
                      src={currentSlide.posterImage}
                      alt="Poster Preview"
                      style={{ height: '56px', width: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--cp-border)' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="cp-btn cp-btn-secondary" style={{ whiteSpace: 'nowrap', cursor: 'pointer', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                        {uploading ? 'Uploading...' : 'Change Poster'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleImageUpload(e, 'posterImage')}
                        />
                      </label>
                      <button
                        type="button"
                        className="cp-btn cp-btn-ghost"
                        onClick={() => updateCurrentSlide({ posterImage: '' })}
                        style={{ color: '#dc2626', padding: '6px 10px', fontSize: '12px' }}
                        title="Remove Poster"
                      >
                        <i className="fas fa-trash-alt" style={{ marginRight: '4px' }}></i> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="cp-btn cp-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, padding: '8px 16px' }}>
                      <i className="fas fa-cloud-upload-alt"></i>
                      {uploading ? 'Uploading...' : 'Upload Poster Image'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageUpload(e, 'posterImage')}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="cp-field" style={{ marginBottom: '18px' }}>
            <span className="cp-field-label-text">Overlay Contrast Style</span>
            <select
              className="cp-select"
              value={currentSlide?.overlayStyle || 'light'}
              onChange={(e) => updateCurrentSlide({ overlayStyle: e.target.value })}
            >
              <option value="light">Light Glass Vignette (Clean architecture)</option>
              <option value="dark">Dark Cinematic Gradient (High text readability)</option>
              <option value="subtle">Subtle Minimal Overlay</option>
              <option value="none">None (Pure Raw Media)</option>
            </select>
          </div>

          {/* 3. Text Content Section */}
          <div style={{ borderTop: '1px solid var(--cp-border, #e2e8f0)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: '700', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={hasContent}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateCurrentSlide({
                        content: {
                          tag: 'PREMIUM ARCHITECTURAL SOLUTIONS',
                          title: 'Crafting the Future of',
                          titleAccent: 'Glass & Spaces',
                          subtitle: 'Precision hardware systems engineered for modern architectural living.',
                        },
                      });
                    } else {
                      updateCurrentSlide({ content: null });
                    }
                  }}
                />
                <span>Include Text Content & Titles</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--cp-text-muted)' }}>
                {hasContent ? 'Content Enabled' : 'No Text (Clean Media)'}
              </span>
            </div>

            {hasContent && (
              <div className="cp-grid cp-grid-2" style={{ gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid var(--cp-border)' }}>
                <div className="cp-field cp-field--full">
                  <span className="cp-field-label-text">Kicker Tag Badge</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={currentSlide?.content?.tag || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        content: { ...currentSlide.content, tag: e.target.value },
                      })
                    }
                    placeholder="e.g. PREMIUM GLASS & HARDWARE SOLUTIONS"
                  />
                </div>

                <div className="cp-field">
                  <span className="cp-field-label-text">Title (Line 1)</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={currentSlide?.content?.title || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        content: { ...currentSlide.content, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Crafting the Future of"
                  />
                </div>

                <div className="cp-field">
                  <span className="cp-field-label-text">Title Accent (Line 2 Highlighted)</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={currentSlide?.content?.titleAccent || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        content: { ...currentSlide.content, titleAccent: e.target.value },
                      })
                    }
                    placeholder="e.g. Glass & Spaces"
                  />
                </div>

                <div className="cp-field cp-field--full">
                  <span className="cp-field-label-text">Subtitle Description</span>
                  <textarea
                    rows={2}
                    className="cp-input"
                    value={currentSlide?.content?.subtitle || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        content: { ...currentSlide.content, subtitle: e.target.value },
                      })
                    }
                    placeholder="Brief description line below the title"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Call-to-Action (CTA) Button */}
          <div style={{ borderTop: '1px solid var(--cp-border, #e2e8f0)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: '700', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={hasCta}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateCurrentSlide({
                        cta: { label: 'Explore Catalogues', url: '/catalogues', icon: 'fas fa-arrow-right' },
                      });
                    } else {
                      updateCurrentSlide({ cta: null });
                    }
                  }}
                />
                <span>Include Primary CTA Button</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--cp-text-muted)' }}>
                {hasCta ? 'CTA Enabled' : 'No CTA Button'}
              </span>
            </div>

            {hasCta && (
              <div className="cp-grid cp-grid-3" style={{ gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid var(--cp-border)' }}>
                <div className="cp-field">
                  <span className="cp-field-label-text">Button Label</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={currentSlide?.cta?.label || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        cta: { ...currentSlide.cta, label: e.target.value },
                      })
                    }
                    placeholder="e.g. Explore Catalogues"
                  />
                </div>

                <div className="cp-field">
                  <span className="cp-field-label-text">Target URL</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={currentSlide?.cta?.url || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        cta: { ...currentSlide.cta, url: e.target.value },
                      })
                    }
                    placeholder="e.g. /catalogues"
                  />
                </div>

                <div className="cp-field">
                  <span className="cp-field-label-text">FontAwesome Icon</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={currentSlide?.cta?.icon || ''}
                    onChange={(e) =>
                      updateCurrentSlide({
                        cta: { ...currentSlide.cta, icon: e.target.value },
                      })
                    }
                    placeholder="fas fa-arrow-right"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Secondary Quick Links */}
          <div style={{ borderTop: '1px solid var(--cp-border, #e2e8f0)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: '700', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={hasCtaLinks}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateCurrentSlide({
                        ctaLinks: [
                          { label: 'Virtual Showroom', url: '/about#vision-sec', icon: 'fas fa-cube' },
                          { label: 'Project Inquiries', url: '#contact-sec', icon: 'fas fa-paper-plane' },
                          { label: 'Product Range', url: '/products', icon: 'fas fa-layer-group' },
                        ],
                      });
                    } else {
                      updateCurrentSlide({ ctaLinks: [] });
                    }
                  }}
                />
                <span>Include Secondary Quick Links</span>
              </label>
              {hasCtaLinks && (
                <button
                  type="button"
                  className="cp-btn cp-btn-secondary"
                  onClick={() => {
                    const links = currentSlide.ctaLinks || [];
                    updateCurrentSlide({
                      ctaLinks: [...links, { label: 'New Link', url: '/', icon: 'fas fa-link' }],
                    });
                  }}
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  <i className="fas fa-plus" style={{ marginRight: '4px' }}></i> Add Link
                </button>
              )}
            </div>

            {hasCtaLinks && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(currentSlide.ctaLinks || []).map((link, lIdx) => (
                  <div
                    key={lIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1.5fr 1fr auto',
                      gap: '10px',
                      alignItems: 'center',
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--cp-border)',
                    }}
                  >
                    <input
                      type="text"
                      className="cp-input"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => {
                        const next = [...currentSlide.ctaLinks];
                        next[lIdx] = { ...next[lIdx], label: e.target.value };
                        updateCurrentSlide({ ctaLinks: next });
                      }}
                    />
                    <input
                      type="text"
                      className="cp-input"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => {
                        const next = [...currentSlide.ctaLinks];
                        next[lIdx] = { ...next[lIdx], url: e.target.value };
                        updateCurrentSlide({ ctaLinks: next });
                      }}
                    />
                    <input
                      type="text"
                      className="cp-input"
                      placeholder="Icon (fas fa-link)"
                      value={link.icon}
                      onChange={(e) => {
                        const next = [...currentSlide.ctaLinks];
                        next[lIdx] = { ...next[lIdx], icon: e.target.value };
                        updateCurrentSlide({ ctaLinks: next });
                      }}
                    />
                    <button
                      type="button"
                      className="cp-btn cp-btn-ghost"
                      onClick={() => {
                        const next = currentSlide.ctaLinks.filter((_, idx) => idx !== lIdx);
                        updateCurrentSlide({ ctaLinks: next });
                      }}
                      style={{ color: '#dc2626', padding: '6px 8px' }}
                      title="Remove Link"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
