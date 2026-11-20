import React, { useState, useEffect } from 'react';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { notify } from '../utils/notify.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || window.location.origin;
  return `${base}${cleanPath}`;
};

export function CommonsDrawer({ isOpen, onClose, token }) {
  const [activeTab, setActiveTab] = useState('colors'); // 'colors' | 'kits' | 'brands'
  const [loading, setLoading] = useState(false);

  // Data states
  const [colors, setColors] = useState([]);
  const [kits, setKits] = useState([]);
  const [brands, setBrands] = useState([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null); // { type: 'color'|'kit'|'brand', item: {...} }
  const [isAdding, setIsAdding] = useState(false); // boolean
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formExtra, setFormExtra] = useState(''); // hex_code for color, description for kit/brand
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Image zoom modal
  const [previewZoomImage, setPreviewZoomImage] = useState(null);

  // Load colors, kits & brands
  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [colRes, kitRes, brandRes] = await Promise.all([
        enterpriseApi.getCommonsColors(token),
        enterpriseApi.getCommonsKits(token),
        enterpriseApi.getCommonsBrands(token).catch(() => ({ data: [] }))
      ]);
      setColors(colRes.data || []);
      setKits(kitRes.data || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      console.error('[CommonsDrawer] Error loading commons:', err);
      notify.apiError(err, 'Failed to load Commons data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsAdding(false);
      setEditingItem(null);
      setSearchQuery('');
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Handle Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingImage(true);
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setFormImage(res.url || '');
      notify.success('Uploaded', 'Image uploaded successfully');
    } catch (err) {
      notify.apiError(err, 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Start Add
  const startAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormImage('');
    setFormExtra('');
    setIsAdding(true);
  };

  // Start Edit
  const startEdit = (item, type) => {
    setIsAdding(false);
    setEditingItem({ type, item });
    setFormName(item.name || '');
    setFormImage(item.image_url || '');
    setFormExtra(type === 'color' ? (item.hex_code || '') : (item.description || ''));
  };

  // Cancel Add/Edit Form
  const cancelForm = () => {
    setIsAdding(false);
    setEditingItem(null);
    setFormName('');
    setFormImage('');
    setFormExtra('');
  };

  // Save Add/Edit
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      notify.formWarning('Name is required');
      return;
    }
    setSaving(true);
    try {
      const isColor = activeTab === 'colors';
      const isBrand = activeTab === 'brands';
      if (editingItem) {
        // Update
        if (isColor) {
          await enterpriseApi.updateCommonsColor(token, editingItem.item.id, {
            name: formName.trim(),
            image_url: formImage.trim() || null,
            hex_code: formExtra.trim() || null
          });
          notify.success('Updated', `Colour "${formName}" updated.`);
        } else if (isBrand) {
          await enterpriseApi.updateCommonsBrand(token, editingItem.item.id, {
            name: formName.trim(),
            image_url: formImage.trim() || null,
            description: formExtra.trim() || null
          });
          notify.success('Updated', `Brand "${formName}" updated.`);
        } else {
          await enterpriseApi.updateCommonsKit(token, editingItem.item.id, {
            name: formName.trim(),
            image_url: formImage.trim() || null,
            description: formExtra.trim() || null
          });
          notify.success('Updated', `Kit "${formName}" updated.`);
        }
      } else {
        // Create
        if (isColor) {
          await enterpriseApi.createCommonsColor(token, {
            name: formName.trim(),
            image_url: formImage.trim() || null,
            hex_code: formExtra.trim() || null
          });
          notify.success('Created', `Colour "${formName}" added to Commons.`);
        } else if (isBrand) {
          await enterpriseApi.createCommonsBrand(token, {
            name: formName.trim(),
            image_url: formImage.trim() || null,
            description: formExtra.trim() || null
          });
          notify.success('Created', `Brand "${formName}" added to Commons.`);
        } else {
          await enterpriseApi.createCommonsKit(token, {
            name: formName.trim(),
            image_url: formImage.trim() || null,
            description: formExtra.trim() || null
          });
          notify.success('Created', `Kit "${formName}" added to Commons.`);
        }
      }
      cancelForm();
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDelete = async (id, name, type) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Commons?`)) return;
    try {
      if (type === 'color') {
        await enterpriseApi.deleteCommonsColor(token, id);
        notify.success('Deleted', `Colour "${name}" removed from Commons.`);
      } else if (type === 'brand') {
        await enterpriseApi.deleteCommonsBrand(token, id);
        notify.success('Deleted', `Brand "${name}" removed from Commons.`);
      } else {
        await enterpriseApi.deleteCommonsKit(token, id);
        notify.success('Deleted', `Kit "${name}" removed from Commons.`);
      }
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to delete');
    }
  };

  // Filtered lists
  const filteredColors = colors.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredKits = kits.filter(k =>
    (k.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (k.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBrands = brands.filter(b =>
    (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 1100,
        }}
      />

      {/* Slide-over Right Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '580px',
          maxWidth: '92vw',
          background: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.18)',
          zIndex: 1101,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#0D63C9' }}>
                Commons Repository
              </span>
              <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0284C7', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                Shared Resources
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#003E7E', fontFamily: "'Poppins', sans-serif" }}>
              Colours, Kits & Brands Management
            </h3>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Standard finishes, installation bundles and product brands across all products
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#E2E8F0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#475569',
              fontSize: '18px',
              transition: 'background 0.2s',
            }}
            title="Close Drawer"
          >
            &times;
          </button>
        </div>

        {/* Tab Switcher & Action Bar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('colors'); cancelForm(); }}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'colors' ? '#003E7E' : '#F1F5F9',
                color: activeTab === 'colors' ? '#FFFFFF' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease-in-out'
              }}
            >
              <span>Variant Colours</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: activeTab === 'colors' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: activeTab === 'colors' ? '#FFFFFF' : '#64748B'
              }}>
                {colors.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('kits'); cancelForm(); }}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'kits' ? '#003E7E' : '#F1F5F9',
                color: activeTab === 'kits' ? '#FFFFFF' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease-in-out'
              }}
            >
              <span>Kits</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: activeTab === 'kits' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: activeTab === 'kits' ? '#FFFFFF' : '#64748B'
              }}>
                {kits.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('brands'); cancelForm(); }}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'brands' ? '#003E7E' : '#F1F5F9',
                color: activeTab === 'brands' ? '#FFFFFF' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease-in-out'
              }}
            >
              <span>Brands</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: activeTab === 'brands' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: activeTab === 'brands' ? '#FFFFFF' : '#64748B'
              }}>
                {brands.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={startAdd}
            disabled={isAdding}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isAdding ? 'not-allowed' : 'pointer',
              border: 'none',
              background: '#0D63C9',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(13, 99, 201, 0.2)'
            }}
          >
            <span>+ Add {activeTab === 'colors' ? 'Colour' : activeTab === 'brands' ? 'Brand' : 'Kit'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '12px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <input
            type="text"
            className="cp-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'colors' ? 'colours...' : 'kits...'}`}
            style={{ width: '100%', fontSize: '13px' }}
          />
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#F8FAFC' }}>

          {/* Inline Add / Edit Card */}
          {(isAdding || editingItem) && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #0D63C9',
              boxShadow: '0 4px 12px rgba(13, 99, 201, 0.1)',
              marginBottom: '20px',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#003E7E' }}>
                  {editingItem ? `Edit ${activeTab === 'colors' ? 'Colour' : 'Kit'}: ${editingItem.item.name}` : `New ${activeTab === 'colors' ? 'Colour' : 'Kit'}`}
                </span>
                <button
                  type="button"
                  onClick={cancelForm}
                  style={{ border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    {activeTab === 'colors' ? 'Colour Name' : 'Kit Name'} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="cp-input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={activeTab === 'colors' ? 'e.g. Matte Black, Satin Brass' : 'e.g. Starter Pack of 5, Installation Bundle'}
                    required
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                {activeTab === 'colors' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Hex Code / Color Swatch (Optional)
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={formExtra.startsWith('#') && formExtra.length === 7 ? formExtra : '#000000'}
                        onChange={(e) => setFormExtra(e.target.value)}
                        style={{ width: '38px', height: '36px', padding: 0, border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="cp-input"
                        value={formExtra}
                        onChange={(e) => setFormExtra(e.target.value)}
                        placeholder="e.g. #1E293B or rgba"
                        style={{ flex: 1, fontSize: '13px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      Description (Optional)
                    </label>
                    <textarea
                      className="cp-input"
                      value={formExtra}
                      onChange={(e) => setFormExtra(e.target.value)}
                      placeholder="e.g. Includes mounting brackets, screws and gasket accessories"
                      rows={2}
                      style={{ width: '100%', fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    {activeTab === 'colors' ? 'Colour Image' : activeTab === 'brands' ? 'Brand Logo / Image' : 'Kit Display Image'}
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {formImage ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px', flex: 1 }}>
                        <img
                          src={resolveImageUrl(formImage)}
                          alt="preview"
                          onClick={() => setPreviewZoomImage(formImage)}
                          style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'contain', border: '1px solid #CBD5E1', cursor: 'pointer', background: '#fff' }}
                          title="Click to zoom"
                        />
                        <span style={{ fontSize: '12px', color: '#334155', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Image Attached
                        </span>
                        <label style={{
                          padding: '4px 10px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '4px',
                          cursor: uploadingImage ? 'wait' : 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#003E7E',
                          margin: 0
                        }}>
                          <span>{uploadingImage ? '...' : 'Change'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageFileChange}
                            disabled={uploadingImage}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '16px', cursor: 'pointer', padding: 0 }}
                          title="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        height: '40px',
                        background: '#F8FAFC',
                        border: '1px dashed #94A3B8',
                        borderRadius: '6px',
                        cursor: uploadingImage ? 'wait' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#003E7E',
                        margin: 0
                      }}>
                        <span>{uploadingImage ? 'Uploading…' : '+ Choose & Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="cp-btn cp-btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="cp-btn cp-btn-primary"
                    style={{ padding: '6px 16px', fontSize: '12px' }}
                  >
                    {saving ? 'Saving…' : editingItem ? 'Save Changes' : 'Add to Commons'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Loading Commons items…</div>
          ) : activeTab === 'colors' ? (
            filteredColors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                No variant colours found matching "{searchQuery}".
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 14px', width: '60px' }}>Preview</th>
                      <th style={{ padding: '12px 14px' }}>Colour Name</th>
                      <th style={{ padding: '12px 14px', width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColors.map((col, idx) => (
                      <tr key={col.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {col.hex_code && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: col.hex_code,
                                  border: '1px solid rgba(0,0,0,0.15)',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                                title={col.hex_code}
                              />
                            )}
                            {col.image_url ? (
                              <img
                                src={resolveImageUrl(col.image_url)}
                                alt={col.name}
                                onClick={() => setPreviewZoomImage(col.image_url)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '1px solid #E2E8F0',
                                  cursor: 'pointer'
                                }}
                                title="Click to zoom"
                              />
                            ) : (
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#94A3B8'
                              }}>
                                No img
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1E293B' }}>
                          {col.name}
                          {col.hex_code && (
                            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'normal' }}>
                              {col.hex_code}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => startEdit(col, 'color')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#003E7E',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Edit Colour"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(col.id, col.name, 'color')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #FECACA',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Delete Colour"
                            >
                              &times;
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'brands' ? (
            filteredBrands.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                No brands found matching "{searchQuery}".
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 14px', width: '60px' }}>Logo</th>
                      <th style={{ padding: '12px 14px' }}>Brand Name</th>
                      <th style={{ padding: '12px 14px', width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.map((b, idx) => (
                      <tr key={b.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          {b.image_url ? (
                            <img
                              src={resolveImageUrl(b.image_url)}
                              alt={b.name}
                              onClick={() => setPreviewZoomImage(b.image_url)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                objectFit: 'contain',
                                border: '1px solid #E2E8F0',
                                cursor: 'pointer',
                                background: '#FFFFFF'
                              }}
                              title="Click to zoom"
                            />
                          ) : (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: '700',
                              color: '#1D4ED8'
                            }}>
                              {(b.name || 'B').charAt(0)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#1E293B' }}>
                          <div style={{ fontWeight: '600' }}>{b.name}</div>
                          {b.description && (
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                              {b.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => startEdit(b, 'brand')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#003E7E',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Edit Brand"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(b.id, b.name, 'brand')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #FECACA',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Delete Brand"
                            >
                              &times;
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredKits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                No kits found matching "{searchQuery}".
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 14px', width: '60px' }}>Image</th>
                      <th style={{ padding: '12px 14px' }}>Kit Name</th>
                      <th style={{ padding: '12px 14px', width: '90px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKits.map((kt, idx) => (
                      <tr key={kt.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          {kt.image_url ? (
                            <img
                              src={resolveImageUrl(kt.image_url)}
                              alt={kt.name}
                              onClick={() => setPreviewZoomImage(kt.image_url)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                objectFit: 'cover',
                                border: '1px solid #E2E8F0',
                                cursor: 'pointer'
                              }}
                              title="Click to zoom"
                            />
                          ) : (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#94A3B8'
                            }}>
                              No img
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#1E293B' }}>
                          <div style={{ fontWeight: '600' }}>{kt.name}</div>
                          {kt.description && (
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                              {kt.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => startEdit(kt, 'kit')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#003E7E',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Edit Kit"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(kt.id, kt.name, 'kit')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #FECACA',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Delete Kit"
                            >
                              &times;
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {activeTab === 'colors' ? `${colors.length} total colours registered` : activeTab === 'brands' ? `${brands.length} total brands registered` : `${kits.length} total kits registered`}
          </div>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={onClose}
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {previewZoomImage && (
        <div
          onClick={() => setPreviewZoomImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <img
            src={resolveImageUrl(previewZoomImage)}
            alt="Zoomed preview"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </>
  );
}
