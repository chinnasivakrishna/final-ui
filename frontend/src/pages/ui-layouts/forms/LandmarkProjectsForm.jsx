import React, { useState } from 'react';
import { enterpriseApi } from '../../../api/enterpriseApi';
import { notify } from '../../../utils/notify';

export function LandmarkProjectsForm({ config, onChange, token }) {
  const title = config?.title || 'Landmark Projects';
  const knowMoreText = config?.knowMoreText || 'Know More';
  const knowMoreUrl = config?.knowMoreUrl || '/about#locations-sec';
  const items = Array.isArray(config?.items) ? config.items : [];

  const [uploadingIdx, setUploadingIdx] = useState(null);

  const updateField = (field, value) => {
    onChange({
      ...config,
      layoutId: config?.layoutId || 'dynamic-layout',
      [field]: value,
    });
  };

  const updateProject = (idx, patch) => {
    const nextItems = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    updateField('items', nextItems);
  };

  const addProject = () => {
    const newItem = {
      id: Date.now(),
      title: 'New Landmark Architectural Showcase',
      location: 'Hyderabad, India',
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=400&q=80',
    };
    updateField('items', [...items, newItem]);
  };

  const removeProject = (idxToRemove) => {
    updateField('items', items.filter((_, i) => i !== idxToRemove));
  };

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await enterpriseApi.uploadImage(token, file, 'projects');
      const url = res.file_url || res.url || res.imageUrl;
      if (url) {
        updateProject(idx, { image: url });
        notify.success('Project image uploaded');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      notify.error('Upload failed: ' + err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Settings */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '8px', margin: '0 0 14px' }}>
          1. Landmark Projects Header
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
            placeholder="e.g. Landmark Projects"
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
              placeholder="/about#locations-sec"
            />
          </div>
        </div>
      </div>

      {/* 2. Project Showcase Items */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
            2. Project Showcase Cards ({items.length})
          </h3>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={addProject}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Add Landmark Project
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((proj, idx) => (
            <div
              key={proj.id || idx}
              style={{
                background: 'var(--cp-surface-elevated, #ffffff)',
                border: '1px solid var(--cp-border, #e2e8f0)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cp-border, #e2e8f0)', paddingBottom: '8px', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--cp-primary)' }}>
                  Project Showcase #{idx + 1}
                </span>
                <button
                  type="button"
                  className="cp-btn cp-btn-ghost"
                  onClick={() => removeProject(idx)}
                  style={{ color: '#dc2626', padding: '2px 8px', fontSize: '12px' }}
                  title="Delete Project"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>

              <div className="cp-grid cp-grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="cp-field">
                  <span className="cp-field-label-text">
                    Project / Building Name <span className="cp-req">*</span>
                  </span>
                  <input
                    type="text"
                    className="cp-input"
                    value={proj.title || ''}
                    onChange={(e) => updateProject(idx, { title: e.target.value })}
                    placeholder="e.g. Phoenix One Hyderabad"
                  />
                </div>

                <div className="cp-field">
                  <span className="cp-field-label-text">City / Location</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={proj.location || ''}
                    onChange={(e) => updateProject(idx, { location: e.target.value })}
                    placeholder="e.g. Hyderabad, India"
                  />
                </div>
              </div>

              <div className="cp-field">
                <span className="cp-field-label-text">Project Image</span>
                {proj.image ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--cp-surface, #f8fafc)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--cp-border, #e2e8f0)' }}>
                    <img
                      src={proj.image}
                      alt="Thumbnail"
                      style={{ height: '54px', width: '74px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--cp-border)' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label className="cp-btn cp-btn-secondary" style={{ whiteSpace: 'nowrap', cursor: 'pointer', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                        {uploadingIdx === idx ? 'Uploading...' : 'Change Image'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleImageUpload(e, idx)}
                        />
                      </label>
                      <button
                        type="button"
                        className="cp-btn cp-btn-ghost"
                        onClick={() => updateProject(idx, { image: '' })}
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
                      {uploadingIdx === idx ? 'Uploading...' : 'Upload Project Image'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageUpload(e, idx)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
