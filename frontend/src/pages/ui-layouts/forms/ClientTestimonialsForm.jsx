import React from 'react';

export function ClientTestimonialsForm({ config, onChange }) {
  const title = config?.title || 'Client Testimonials';
  const knowMoreText = config?.knowMoreText || 'Know More';
  const knowMoreUrl = config?.knowMoreUrl || '/about';
  const items = Array.isArray(config?.items) ? config.items : [];

  const updateField = (field, value) => {
    onChange({
      ...config,
      layoutId: config?.layoutId || 'dynamic-layout',
      [field]: value,
    });
  };

  const updateTestimonial = (idx, patch) => {
    const nextItems = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    updateField('items', nextItems);
  };

  const addTestimonial = () => {
    const newItem = {
      id: Date.now(),
      quote: 'Taiton architectural systems deliver unmatched precision, smooth operation, and clean luxury aesthetics.',
      clientName: '-Prestige Group',
      location: 'Bengaluru, India',
    };
    updateField('items', [...items, newItem]);
  };

  const removeTestimonial = (idxToRemove) => {
    updateField('items', items.filter((_, i) => i !== idxToRemove));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Settings */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '8px', margin: '0 0 14px' }}>
          1. Client Testimonials Header
        </h3>

        <div className="cp-field" style={{ marginBottom: '14px' }}>
          <span className="cp-field-label-text">
            Section Title <span className="cp-req">*</span>
          </span>
          <input
            type="text"
            className="cp-input"
            value={title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Client Testimonials"
          />
        </div>

        <div className="cp-grid cp-grid-2" style={{ gap: '14px' }}>
          <div className="cp-field">
            <span className="cp-field-label-text">Action Link Text</span>
            <input
              type="text"
              className="cp-input"
              value={knowMoreText}
              onChange={(e) => updateField('knowMoreText', e.target.value)}
              placeholder="Know More"
            />
          </div>

          <div className="cp-field">
            <span className="cp-field-label-text">Action Link Destination URL</span>
            <input
              type="text"
              className="cp-input"
              value={knowMoreUrl}
              onChange={(e) => updateField('knowMoreUrl', e.target.value)}
              placeholder="/about"
            />
          </div>
        </div>
      </div>

      {/* 2. Testimonial Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
            2. Testimonial Quotes ({items.length})
          </h3>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={addTestimonial}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Add Testimonial
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                background: 'var(--cp-surface-elevated, #ffffff)',
                border: '1px solid var(--cp-border, #e2e8f0)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cp-border, #e2e8f0)', paddingBottom: '8px', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--cp-primary)' }}>
                  Testimonial #{idx + 1}
                </span>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost"
                  onClick={() => removeTestimonial(idx)}
                  style={{ color: '#dc2626', padding: '2px 8px', fontSize: '12px' }}
                  title="Delete Testimonial"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>

              <div className="cp-field" style={{ marginBottom: '12px' }}>
                <span className="cp-field-label-text">
                  Client Quote Text <span className="cp-req">*</span>
                </span>
                <textarea
                  className="cp-input"
                  rows={3}
                  value={item.quote || ''}
                  onChange={(e) => updateTestimonial(idx, { quote: e.target.value })}
                  placeholder="Testimonial quote text..."
                />
              </div>

              <div className="cp-grid cp-grid-2" style={{ gap: '12px' }}>
                <div className="cp-field">
                  <span className="cp-field-label-text">Client / Company Name</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={item.clientName || ''}
                    onChange={(e) => updateTestimonial(idx, { clientName: e.target.value })}
                    placeholder="e.g. -Prestige Group"
                  />
                </div>

                <div className="cp-field">
                  <span className="cp-field-label-text">Location</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={item.location || ''}
                    onChange={(e) => updateTestimonial(idx, { location: e.target.value })}
                    placeholder="e.g. Bengaluru, India"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
