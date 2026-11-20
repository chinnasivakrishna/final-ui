import React, { useState } from 'react';
import { enterpriseApi } from '../../../api/enterpriseApi';
import { notify } from '../../../utils/notify';

export function FeaturedProductsForm({ config, onChange, token }) {
  const title = config?.title || 'Featured Products';
  const items = Array.isArray(config?.items) ? config.items : [];

  const [uploadingIdx, setUploadingIdx] = useState(null);

  const updateField = (field, value) => {
    onChange({
      ...config,
      layoutId: config?.layoutId || 'dynamic-layout',
      [field]: value,
    });
  };

  const updateProduct = (idx, patch) => {
    const nextItems = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    updateField('items', nextItems);
  };

  const addProduct = () => {
    const newItem = {
      id: Date.now(),
      title: 'New Featured Product',
      description: 'Engineered architectural hardware systems crafted for contemporary interior elegance.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    };
    updateField('items', [...items, newItem]);
  };

  const removeProduct = (idxToRemove) => {
    updateField('items', items.filter((_, i) => i !== idxToRemove));
  };

  const moveProduct = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    updateField('items', reordered);
  };

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await enterpriseApi.uploadImage(token, file, 'products');
      const url = res.file_url || res.url || res.imageUrl;
      if (url) {
        updateProduct(idx, { image: url });
        notify.success('Image uploaded successfully');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      notify.error('Image upload failed: ' + err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Section Heading */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '8px', margin: '0 0 14px' }}>
          1. Section Heading
        </h3>

        <div className="cp-field">
          <span className="cp-field-label-text">
            Section Heading <span className="cp-req">*</span>
          </span>
          <input
            type="text"
            className="cp-input"
            value={title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Featured Products"
          />
          <span className="cp-field-hint">The title displayed above the featured product grid on the Home Page.</span>
        </div>
      </div>

      {/* 2. Featured Product Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>
            2. Featured Product Cards ({items.length})
          </h3>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={addProduct}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <i className="fas fa-plus" style={{ marginRight: '6px' }}></i> Add Product Card
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((product, idx) => (
            <div
              key={product.id || idx}
              style={{
                background: 'var(--cp-surface-elevated, #ffffff)',
                border: '1px solid var(--cp-border, #e2e8f0)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cp-border, #e2e8f0)', paddingBottom: '8px', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--cp-primary)' }}>
                  Product Card #{idx + 1}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    disabled={idx === 0}
                    onClick={() => moveProduct(idx, idx - 1)}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    disabled={idx === items.length - 1}
                    onClick={() => moveProduct(idx, idx + 1)}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn-ghost"
                    onClick={() => removeProduct(idx)}
                    style={{ color: '#dc2626', padding: '2px 8px', fontSize: '12px' }}
                    title="Delete Card"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>

              {/* Product Heading */}
              <div className="cp-field" style={{ marginBottom: '12px' }}>
                <span className="cp-field-label-text">
                  Product Heading <span className="cp-req">*</span>
                </span>
                <input
                  type="text"
                  className="cp-input"
                  value={product.title || ''}
                  onChange={(e) => updateProduct(idx, { title: e.target.value })}
                  placeholder="e.g. Automatic Telescopic Door"
                />
              </div>

              {/* Product Description */}
              <div className="cp-field" style={{ marginBottom: '12px' }}>
                <span className="cp-field-label-text">Description</span>
                <textarea
                  className="cp-input"
                  rows={2}
                  value={product.description || ''}
                  onChange={(e) => updateProduct(idx, { description: e.target.value })}
                  placeholder="Summary of product system and architectural utility"
                />
              </div>

              {/* Product Image */}
              <div className="cp-field">
                <span className="cp-field-label-text">Product Image</span>
                {product.image ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--cp-surface, #f8fafc)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--cp-border, #e2e8f0)' }}>
                    <img
                      src={product.image}
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
                        onClick={() => updateProduct(idx, { image: '' })}
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
                      {uploadingIdx === idx ? 'Uploading...' : 'Upload Product Image'}
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
