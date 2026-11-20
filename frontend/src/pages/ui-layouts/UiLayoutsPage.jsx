import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/authContext';
import { enterpriseApi } from '../../api/enterpriseApi';
import { notify } from '../../utils/notify';
import { emitUnreadRefresh } from '../../utils/events';
import { PageBreadcrumb } from '../../components/PageBreadcrumb';
import { PageSpinner } from '../../components/PageSpinner';
import { HeroicForm } from './forms/HeroicForm';
import { FeaturedProductsForm } from './forms/FeaturedProductsForm';
import { LandmarkProjectsForm } from './forms/LandmarkProjectsForm';
import { ClientTestimonialsForm } from './forms/ClientTestimonialsForm';
import { WebUiPreviewRenderer } from './preview/WebUiPreviewRenderer';

export function UiLayoutsPage() {
  const { token, setSidebarCollapsed } = useAuth();

  // Page and component selections
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState('');

  // Component configuration state
  const [configMeta, setConfigMeta] = useState(null);
  const [formData, setFormData] = useState(null);
  const [savedBaseline, setSavedBaseline] = useState(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Status for approval & release workflow
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  // Preview & Split View: Default to FALSE as like in Blogs
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [zoom, setZoom] = useState(1.0);

  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Load Available Pages
  useEffect(() => {
    let mounted = true;
    async function loadPages() {
      if (!token) return;
      setLoadingPages(true);
      try {
        const res = await enterpriseApi.getUiLayoutPages(token);
        if (mounted && Array.isArray(res.pages) && res.pages.length > 0) {
          setPages(res.pages);
          const home = res.pages.find((p) => p.route === '/' || p.name.includes('Index')) || res.pages[0];
          setSelectedPageId(String(home.id));
        }
      } catch (err) {
        console.error('Failed to load UI pages:', err);
        notify.error('Failed to load available pages');
      } finally {
        if (mounted) setLoadingPages(false);
      }
    }
    loadPages();
    return () => {
      mounted = false;
    };
  }, [token]);

  // 2. Load Components when Page changes
  useEffect(() => {
    let mounted = true;
    async function loadComponents() {
      if (!token || !selectedPageId) return;
      setLoadingComponents(true);
      setComponents([]);
      setSelectedComponentId('');
      try {
        const res = await enterpriseApi.getUiLayoutComponents(token, selectedPageId);
        if (mounted && Array.isArray(res.components) && res.components.length > 0) {
          // 5 pillar bar and solutions after heroic page are static, no need to show them in UI Layout Management
          const manageable = res.components.filter((c) => {
            const key = String(c.componentKey || c.name || '').toLowerCase();
            return !key.includes('pillar') && !key.includes('solution');
          });
          setComponents(manageable);
          if (manageable.length > 0) {
            setSelectedComponentId(String(manageable[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load page components:', err);
        notify.error('Failed to load components for selected page');
      } finally {
        if (mounted) setLoadingComponents(false);
      }
    }
    loadComponents();
    return () => {
      mounted = false;
    };
  }, [token, selectedPageId]);

  // 3. Load Component Configuration when Component changes
  const loadConfiguration = useCallback(async () => {
    if (!token || !selectedPageId || !selectedComponentId) return;
    setLoadingConfig(true);
    try {
      const res = await enterpriseApi.getUiLayoutComponentConfig(token, selectedPageId, selectedComponentId);
      setConfigMeta(res);

      const activeConfig = res.currentConfiguration || (
        res.activeLayoutId === 'full-page-video'
          ? { layoutId: 'full-page-video', data: { slides: [] } }
          : { layoutId: res.activeLayoutId || 'large-premium-banner', data: { slides: [] } }
      );

      setFormData(activeConfig);
      setSavedBaseline(JSON.stringify(activeConfig));

      setActiveSlideIdx(0);
      setSaveAsDraft(res.status === 'draft');
    } catch (err) {
      console.error('Failed to load component config:', err);
      notify.error('Failed to load configuration: ' + err.message);
    } finally {
      setLoadingConfig(false);
    }
  }, [token, selectedPageId, selectedComponentId]);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Check if current form data has unsaved changes compared to database baseline
  const isModified = useMemo(() => {
    if (!formData || !savedBaseline) return false;
    return JSON.stringify(formData) !== savedBaseline;
  }, [formData, savedBaseline]);

  const selectedPage = pages.find((p) => String(p.id) === String(selectedPageId));
  const selectedComponent = components.find((c) => String(c.id) === String(selectedComponentId));

  // Toggle Live Preview matching Blogs
  const togglePreview = () => {
    const nextVal = !showLivePreview;
    setShowLivePreview(nextVal);
    if (setSidebarCollapsed) setSidebarCollapsed(nextVal);
  };

  // Revert / Reset Handler
  const handleReset = () => {
    if (!savedBaseline) return;
    try {
      setFormData(JSON.parse(savedBaseline));
      notify.info('Form reverted to latest saved state');
    } catch { }
  };

  // Main Form Submit Handler
  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedPageId || !selectedComponentId || !formData) return;

    setSubmitting(true);
    try {
      const layoutId = formData.layoutId || configMeta?.activeLayoutId || 'large-premium-banner';
      const targetStatus = saveAsDraft ? 'draft' : 'save';

      const res = await enterpriseApi.saveUiLayoutComponentDraft(token, selectedPageId, selectedComponentId, {
        layoutId,
        configuration: formData,
        status: targetStatus,
      });

      if (res.status === 'pending_approval') {
        notify.success('Submitted for Approval', 'Layout configuration saved and submitted to Approvals for checker review.');
      } else if (res.status === 'approved' || res.status === 'ready_to_live') {
        notify.success('Ready for Release', 'Layout configuration saved! It is now ready for production release under Release Management (Go For Live).');
      } else {
        notify.success('Draft Saved', 'Layout configuration saved as draft.');
      }

      setSavedBaseline(JSON.stringify(formData));
      emitUnreadRefresh();
      loadConfiguration();
    } catch (err) {
      console.error('Submission error:', err);
      notify.error(err.message || 'Failed to save configuration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPages) {
    return <PageSpinner />;
  }

  return (
    <div className="cp-stack" style={{ overflow: showLivePreview ? 'hidden' : 'visible' }}>
      {/* 1. Page Breadcrumb matching Products/Catalogs/Blogs */}
      <PageBreadcrumb
        parent="UI Layouts"
        parentUrl="/app/ui-layouts"
        current={selectedComponent ? `${selectedComponent.name} Layout` : "UI Layout Management"}
      />

      {/* 2. Top Header with Action Buttons matching CreateBlogPage */}
      <div className="cp-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
        <div>
          <h1 className="cp-page-title">UI Layout Management</h1>
          <p className="cp-muted">Configure component templates, responsive content fields, and live preview.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {isModified && (
            <span style={{
              background: '#fffbe3',
              border: '1px solid #fde047',
              color: '#854d0e',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <i className="fas fa-pen"></i> Unsaved Changes
            </span>
          )}

          {/* Toggle Live Preview Button matching CreateBlogPage */}
          <button
            type="button"
            className={`cp-btn ${showLivePreview ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
            onClick={togglePreview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px'
            }}
          >
            {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>
        </div>
      </div>

      {/* 3. Top Card: Page & Component Selection Bar */}
      <section className="cp-card cp-card-pad" style={{ marginBottom: '16px' }}>
        <div className="cp-grid cp-grid-3" style={{ gap: '16px 20px', alignItems: 'flex-end' }}>
          <div className="cp-field">
            <span className="cp-field-label-text">
              Target Page <span className="cp-req">*</span>
            </span>
            <select
              className="cp-select"
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              disabled={loadingPages}
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.route})
                </option>
              ))}
            </select>
          </div>

          <div className="cp-field">
            <span className="cp-field-label-text">
              Target Component <span className="cp-req">*</span>
            </span>
            <select
              className="cp-select"
              value={selectedComponentId}
              onChange={(e) => setSelectedComponentId(e.target.value)}
              disabled={loadingComponents || components.length === 0}
            >
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.componentKey})
                </option>
              ))}
            </select>
          </div>

          <div className="cp-field">
            <span className="cp-field-label-text">Active Layout & Workflow Status</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--cp-text)',
                background: '#f8fafc',
                border: '1px solid var(--cp-border, #e2e8f0)',
                borderRadius: '6px',
                padding: '9px 12px',
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {formData?.layoutId || configMeta?.activeLayoutId || 'large-premium-banner'}
              </span>
              <span style={{
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                background: configMeta?.status === 'live' ? '#ecfdf5' : configMeta?.status === 'pending_approval' ? '#eff6ff' : configMeta?.status === 'approved' ? '#f0fdf4' : '#fffbeb',
                color: configMeta?.status === 'live' ? '#065f46' : configMeta?.status === 'pending_approval' ? '#1d4ed8' : configMeta?.status === 'approved' ? '#15803d' : '#b45309',
                border: `1px solid ${configMeta?.status === 'live' ? '#a7f3d0' : configMeta?.status === 'pending_approval' ? '#bfdbfe' : configMeta?.status === 'approved' ? '#bbf7d0' : '#fde68a'}`,
                whiteSpace: 'nowrap'
              }}>
                {configMeta?.status === 'live' ? '● LIVE' : configMeta?.status === 'pending_approval' ? '⏳ PENDING REVIEW' : configMeta?.status === 'approved' ? '✓ APPROVED' : '○ DRAFT'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Split-View Workspace matching CreateBlogPage */}
      <div style={{ display: 'flex', gap: '24px', width: '100%', alignItems: 'flex-start' }}>
        {/* Left Column: Form Panel with Independent Scrollbar */}
        <section
          className="cp-card cp-card-pad"
          style={{
            flex: showLivePreview ? '1 1 50%' : '1 1 100%',
            minWidth: 0,
            height: showLivePreview ? 'calc(100vh - 210px)' : 'auto',
            maxHeight: showLivePreview ? 'calc(100vh - 210px)' : 'none',
            overflowY: showLivePreview ? 'auto' : 'visible',
            paddingBottom: '24px',
          }}
        >
          {loadingConfig ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--cp-text-muted)' }}>
              <div className="spinner-border spinner-border-sm mb-2" role="status" />
              <span>Loading component layout configuration...</span>
            </div>
          ) : !formData ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cp-text-muted)' }}>
              Please select a page and component to begin editing.
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedComponent?.componentKey === 'heroic' && (
                <HeroicForm
                  config={formData}
                  onChange={(newConfig) => setFormData(newConfig)}
                  activeSlideIdx={activeSlideIdx}
                  onSlideSelect={setActiveSlideIdx}
                  token={token}
                />
              )}

              {selectedComponent?.componentKey === 'featured-products' && (
                <FeaturedProductsForm
                  config={formData}
                  onChange={(newConfig) => setFormData(newConfig)}
                  token={token}
                />
              )}

              {selectedComponent?.componentKey === 'landmark-projects' && (
                <LandmarkProjectsForm
                  config={formData}
                  onChange={(newConfig) => setFormData(newConfig)}
                  token={token}
                />
              )}

              {selectedComponent?.componentKey === 'client-testimonials' && (
                <ClientTestimonialsForm
                  config={formData}
                  onChange={(newConfig) => setFormData(newConfig)}
                  token={token}
                />
              )}

              {/* Bottom Action Bar matching Products, Catalogs, and Blogs */}
              <div style={{
                borderTop: '1px solid var(--cp-border)',
                paddingTop: '20px',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {/* Current DB Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Database Status:</span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: configMeta?.status === 'live' ? '#ecfdf5' :
                        configMeta?.status === 'approved' || configMeta?.status === 'ready_to_live' ? '#eff6ff' :
                        configMeta?.status === 'pending_approval' ? '#fffbe3' : '#f1f5f9',
                      color: configMeta?.status === 'live' ? '#047857' :
                        configMeta?.status === 'approved' || configMeta?.status === 'ready_to_live' ? '#1d4ed8' :
                        configMeta?.status === 'pending_approval' ? '#854d0e' : '#475569',
                      border: configMeta?.status === 'live' ? '1px solid #a7f3d0' :
                        configMeta?.status === 'approved' || configMeta?.status === 'ready_to_live' ? '1px solid #bfdbfe' :
                        configMeta?.status === 'pending_approval' ? '1px solid #fde047' : '1px solid #cbd5e1',
                    }}>
                      {configMeta?.status === 'live' ? 'Live in Production' :
                        configMeta?.status === 'approved' || configMeta?.status === 'ready_to_live' ? 'Ready for Release (Go Live)' :
                        configMeta?.status === 'pending_approval' ? 'Pending Approval' : 'Draft'}
                    </span>
                  </div>

                  {/* Optional private draft checkbox */}
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={saveAsDraft}
                      onChange={(e) => setSaveAsDraft(e.target.checked)}
                    />
                    <span>Save as private draft only</span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    onClick={handleReset}
                    disabled={!isModified || submitting}
                    style={{ height: '42px', padding: '0 18px', fontWeight: '600' }}
                  >
                    Cancel / Revert
                  </button>
                  <button
                    type="submit"
                    className="cp-btn cp-btn-primary"
                    disabled={submitting}
                    style={{ height: '42px', minWidth: '160px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <i className={submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'}></i>
                    <span>{submitting ? 'Saving...' : saveAsDraft ? 'Save Draft' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* Right Column: Exact Live Preview Panel matching CreateBlogPage */}
        {showLivePreview && (
          <section
            className="cp-card cp-card-pad"
            style={{
              flex: '1 1 50%',
              minWidth: 0,
              height: 'calc(100vh - 210px)',
              maxHeight: 'calc(100vh - 210px)',
              overflowY: 'auto',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              paddingBottom: '24px',
            }}
          >
            {/* Live Preview Toolbar matching CreateBlogPage */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', margin: 0 }}>
                Live Website Component Preview
              </h3>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Device Pills matching CreateBlogPage */}
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: previewDevice === 'mobile' ? '600' : '500',
                      borderRadius: '6px',
                      border: 'none',
                      background: previewDevice === 'mobile' ? '#FFFFFF' : 'transparent',
                      color: previewDevice === 'mobile' ? '#003E7E' : '#64748B',
                      boxShadow: previewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title="Mobile View"
                  >
                    Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: previewDevice === 'tablet' ? '600' : '500',
                      borderRadius: '6px',
                      border: 'none',
                      background: previewDevice === 'tablet' ? '#FFFFFF' : 'transparent',
                      color: previewDevice === 'tablet' ? '#003E7E' : '#64748B',
                      boxShadow: previewDevice === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title="Tablet View"
                  >
                    Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: previewDevice === 'desktop' ? '600' : '500',
                      borderRadius: '6px',
                      border: 'none',
                      background: previewDevice === 'desktop' ? '#FFFFFF' : 'transparent',
                      color: previewDevice === 'desktop' ? '#003E7E' : '#64748B',
                      boxShadow: previewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title="Desktop View"
                  >
                    Desktop
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Preview Canvas with Responsive Frame */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
            }}>
              <div style={{
                width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                maxWidth: '100%',
                boxShadow: previewDevice !== 'desktop' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
                borderRadius: previewDevice !== 'desktop' ? '12px' : '0',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                border: previewDevice !== 'desktop' ? '1px solid #CBD5E1' : 'none',
              }}>
                <WebUiPreviewRenderer
                  componentKey={selectedComponent?.componentKey}
                  layoutId={formData?.layoutId || configMeta?.activeLayoutId}
                  configuration={formData}
                  viewport={previewDevice}
                  activeSlideIdx={activeSlideIdx}
                  onSlideChange={setActiveSlideIdx}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
