import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';

const resolveUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

export function CreateCatalogPage() {
  const { token, setSidebarCollapsed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Preview & Split View
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [zoom, setZoom] = useState(1.0);

  // Form states
  const [catalogId, setCatalogId] = useState('');
  const [catalogName, setCatalogName] = useState('');
  const [categoryName, setCategoryName] = useState('Catalogues');
  const [editionText, setEditionText] = useState('2026 Edition #7');
  const [pageCount, setPageCount] = useState('120 Pages');
  const [updatedBadge, setUpdatedBadge] = useState('Updated Feb 2026');
  const [publishYear, setPublishYear] = useState('2026');
  const [productPageThumbnail, setProductPageThumbnail] = useState('');
  const [pageName, setPageName] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailImg, setThumbnailImg] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('live');
  const [submitting, setSubmitting] = useState(false);

  // SEO & OG fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robotsTag, setRobotsTag] = useState('index, follow');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');

  const slugify = (text) => {
    return 'cat-' + String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setCatalogName(val);
    if (!editId) {
      setCatalogId(slugify(val));
      if (!seoTitle) setSeoTitle(`${val} | TAITON Product Catalogues`);
    }
  };

  useEffect(() => {
    if (editId && token) {
      const loadCatalogDetails = async () => {
        try {
          const res = await enterpriseApi.contentDetail(token, 'catalog', editId);
          const item = res.item;
          if (item) {
            const p = item.payload || {};
            setCatalogId(p.catalog_id || '');
            setCatalogName(item.title || p.catalog_name || '');
            setCategoryName(p.category || 'Catalogues');
            setEditionText(p.edition || '2026 Edition');
            setPageCount(p.page_count || '120 Pages');
            setUpdatedBadge(p.updated_badge || 'Updated 2026');
            setPublishYear(p.publish_year || p.publishYear || '2026');
            setProductPageThumbnail(p.product_page_thumbnail || p.productPageThumbnail || '');
            setPageName(p.page_name || p.pageName || '');
            setImage1(p.image_1 || p.image1 || '');
            setImage2(p.image_2 || p.image2 || '');
            setFileUrl(p.file_url || '');
            setThumbnailImg(p.thumbnail_img || '');
            setImageAltText(p.image_alt_text || '');
            setSummary(item.summary || p.summary || '');
            setSeoTitle(p.seo_meta_title || '');
            setSeoDesc(p.seo_meta_description || '');
            setFocusKeyword(p.focus_keyword || '');
            setSecondaryKeywords(p.secondary_keywords || '');
            setCanonicalUrl(p.canonical_url || '');
            setRobotsTag(p.robots_tag || 'index, follow');
            setOgTitle(p.og_title || '');
            setOgDescription(p.og_description || '');
            setOgImage(p.og_image || '');
            setStatus(item.status || 'live');
          }
        } catch (e) {
          notify.error('Error loading catalog details', e.message);
        }
      };
      loadCatalogDetails();
    }
  }, [editId, token]);

  const handleFileUpload = async (e, setUrlField) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setUrlField(res.url);
      notify.success('Uploaded', 'File uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Upload failed');
    }
  };

  const togglePreview = () => {
    const nextState = !showLivePreview;
    setShowLivePreview(nextState);
    if (setSidebarCollapsed) {
      setSidebarCollapsed(nextState);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!catalogId.trim() || !catalogName.trim() || !seoTitle.trim() || !seoDesc.trim()) {
      notify.formWarning('Catalog ID, Name, SEO Title and Description are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        catalog_id: catalogId.trim(),
        catalog_name: catalogName.trim(),
        category: categoryName.trim(),
        edition: editionText.trim(),
        page_count: pageCount.trim(),
        updated_badge: updatedBadge.trim(),
        publish_year: publishYear.trim() || null,
        product_page_thumbnail: productPageThumbnail.trim() || null,
        page_name: pageName.trim() || null,
        image_1: image1.trim() || null,
        image_2: image2.trim() || null,
        file_url: fileUrl.trim() || null,
        thumbnail_img: thumbnailImg.trim() || null,
        image_alt_text: imageAltText.trim() || null,
        summary: summary.trim(),
        seo_meta_title: seoTitle.trim(),
        seo_meta_description: seoDesc.trim(),
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        robots_tag: robotsTag.trim() || 'index, follow',
        og_title: ogTitle.trim() || seoTitle.trim(),
        og_description: ogDescription.trim() || seoDesc.trim(),
        og_image: ogImage.trim() || thumbnailImg.trim() || null,
        status,
      };

      const res = editId
        ? await enterpriseApi.contentUpdate(token, 'catalog', editId, {
          title: catalogName.trim(),
          summary: summary.trim().slice(0, 150) || categoryName,
          payload,
        })
        : await enterpriseApi.contentCreate(token, 'catalog', {
          title: catalogName.trim(),
          summary: summary.trim().slice(0, 150) || categoryName,
          payload,
        });

      notify.success((res.item || res)?.status === 'pending_approval' ? 'Submitted for Approval' : 'Catalog Saved', (res.item || res)?.message ?? 'Catalog saved.');
      emitUnreadRefresh();
      navigate('/app/catalogs');
    } catch (err) {
      notify.apiError(err, editId ? 'Failed to update catalog' : 'Failed to create catalog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-stack" style={{ overflow: showLivePreview ? 'hidden' : 'visible' }}>
      <PageBreadcrumb parent="Catalogs" parentUrl="/app/catalogs" current={editId ? "Edit Catalog" : "Create Catalog"} />
      
      {/* Top Header matching Add Product page style */}
      <div className="cp-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="cp-page-title">{editId ? "Edit Catalog" : "Add Catalog"}</h1>
          <p className="cp-muted">Configure downloadable document details, cover images, SEO metadata and live preview.</p>
        </div>
        <div>
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

      <div style={{ display: 'flex', gap: '24px', width: '100%', alignItems: 'flex-start' }}>
        {/* FORM PANEL WITH INDEPENDENT SCROLLBAR */}
        <section
          className="cp-card cp-card-pad"
          style={{
            flex: showLivePreview ? '1 1 50%' : '1 1 100%',
            minWidth: 0,
            height: showLivePreview ? 'calc(100vh - 210px)' : 'auto',
            maxHeight: showLivePreview ? 'calc(100vh - 210px)' : 'none',
            overflowY: showLivePreview ? 'auto' : 'visible',
            paddingBottom: '24px'
          }}
        >
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Catalog / Document Name <span className="cp-req">*</span></span>
                  <input
                    type="text"
                    className="cp-input"
                    value={catalogName}
                    onChange={handleNameChange}
                    placeholder="e.g. TAITON Main Product Catalog 2026"
                    required
                  />
                </label>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Category</span>
                  <select
                    className="cp-select"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  >
                    <option value="Catalogues">Catalogues</option>
                    <option value="Brochures">Brochures</option>
                    <option value="Magazines">Magazines</option>
                    <option value="Social Media Creatives">Social Media Creatives</option>
                    <option value="Advertisement Posters">Advertisement Posters</option>
                    <option value="Technical Documents">Technical Documents</option>
                    <option value="Installation Guides">Installation Guides</option>
                  </select>
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Edition / Subtitle</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={editionText}
                    onChange={(e) => setEditionText(e.target.value)}
                    placeholder="e.g. 2026 Edition #7"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Page Count</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    placeholder="e.g. 120 Pages"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Updated Date Badge</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={updatedBadge}
                    onChange={(e) => setUpdatedBadge(e.target.value)}
                    placeholder="e.g. Updated Feb 2026"
                  />
                </label>
              </div>

              <div className="col-12 col-md-6">
                <div className="cp-field">
                  <span className="cp-field-label-text">PDF Document</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {fileUrl && (
                      <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#16A34A', flexShrink: 0 }}>
                        📄
                      </div>
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={fileUrl ? 'PDF Uploaded ✓' : ''}
                        readOnly
                        placeholder="Choose PDF file..."
                        onClick={() => document.getElementById('catalog-pdf-file').click()}
                      />
                      <input
                        type="file"
                        id="catalog-pdf-file"
                        style={{ display: 'none' }}
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e, setFileUrl)}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('catalog-pdf-file').click()}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '4px',
                          bottom: '4px',
                          minHeight: 'auto',
                          padding: '0 12px',
                          fontSize: '12px',
                          borderRadius: '6px'
                        }}
                      >
                        Choose PDF
                      </button>
                    </div>
                    {fileUrl && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setFileUrl('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove PDF"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="cp-field">
                  <span className="cp-field-label-text">Cover Image</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {thumbnailImg && (
                      <img
                        src={resolveUrl(thumbnailImg)}
                        alt="Cover Preview"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={thumbnailImg ? 'Cover Image Chosen ✓' : ''}
                        readOnly
                        placeholder="Choose cover image..."
                        onClick={() => document.getElementById('catalog-cover-file').click()}
                      />
                      <input
                        type="file"
                        id="catalog-cover-file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setThumbnailImg)}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('catalog-cover-file').click()}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '4px',
                          bottom: '4px',
                          minHeight: 'auto',
                          padding: '0 12px',
                          fontSize: '12px',
                          borderRadius: '6px'
                        }}
                      >
                        Choose Image
                      </button>
                    </div>
                    {thumbnailImg && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setThumbnailImg('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove Cover Image"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Cover Alt Text</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    placeholder="Alt text describing cover"
                  />
                </label>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Publish Status</span>
                  <select
                    className="cp-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="live">Live / Active</option>
                  </select>
                </label>
              </div>

              <div className="col-12">
                <label className="cp-field">
                  <span className="cp-field-label-text">Catalog Summary Description</span>
                  <textarea
                    className="cp-input"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Comprehensive technical specifications and product lines included in this catalogue..."
                    rows={3}
                  />
                </label>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Publish Year</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={publishYear}
                    onChange={(e) => setPublishYear(e.target.value)}
                    placeholder="e.g. 2026"
                  />
                </label>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Label / Page Name</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="e.g. Main Glass Hardware Range"
                  />
                </label>
              </div>

              <div className="col-12">
                <div className="cp-field">
                  <span className="cp-field-label-text">Product Page Thumbnail Image</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {productPageThumbnail && (
                      <img
                        src={resolveUrl(productPageThumbnail)}
                        alt="Thumbnail Preview"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={productPageThumbnail ? 'Thumbnail Chosen ✓' : ''}
                        readOnly
                        placeholder="Choose thumbnail image..."
                        onClick={() => document.getElementById('catalog-pdt-thumb-file').click()}
                      />
                      <input
                        type="file"
                        id="catalog-pdt-thumb-file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setProductPageThumbnail)}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('catalog-pdt-thumb-file').click()}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '4px',
                          bottom: '4px',
                          minHeight: 'auto',
                          padding: '0 12px',
                          fontSize: '12px',
                          borderRadius: '6px'
                        }}
                      >
                        Choose Image
                      </button>
                    </div>
                    {productPageThumbnail && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setProductPageThumbnail('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove Thumbnail"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Images (2) */}
              <div className="col-12 col-md-6">
                <div className="cp-field">
                  <span className="cp-field-label-text">Catalog Image 1</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {image1 && (
                      <img
                        src={resolveUrl(image1)}
                        alt="Image 1"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={image1 ? 'Image Chosen ✓' : ''}
                        readOnly
                        placeholder="Choose image 1..."
                        onClick={() => document.getElementById('catalog-img1-file').click()}
                      />
                      <input
                        type="file"
                        id="catalog-img1-file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setImage1)}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('catalog-img1-file').click()}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '4px',
                          bottom: '4px',
                          minHeight: 'auto',
                          padding: '0 12px',
                          fontSize: '12px',
                          borderRadius: '6px'
                        }}
                      >
                        Choose Image
                      </button>
                    </div>
                    {image1 && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setImage1('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove Image 1"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="cp-field">
                  <span className="cp-field-label-text">Catalog Image 2</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {image2 && (
                      <img
                        src={resolveUrl(image2)}
                        alt="Image 2"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={image2 ? 'Image Chosen ✓' : ''}
                        readOnly
                        placeholder="Choose image 2..."
                        onClick={() => document.getElementById('catalog-img2-file').click()}
                      />
                      <input
                        type="file"
                        id="catalog-img2-file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setImage2)}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('catalog-img2-file').click()}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '4px',
                          bottom: '4px',
                          minHeight: 'auto',
                          padding: '0 12px',
                          fontSize: '12px',
                          borderRadius: '6px'
                        }}
                      >
                        Choose Image
                      </button>
                    </div>
                    {image2 && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setImage2('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove Image 2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Management */}
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', borderBottom: '1px solid var(--cp-border)', paddingBottom: '8px', margin: '16px 0 0 0' }}>
              SEO & Search Engine Management
            </h3>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">SEO Meta Title <span className="cp-req">*</span></span>
                  <input
                    type="text"
                    className="cp-input"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="e.g. TAITON Hardware Main Product Catalog 2026 | PDF Download"
                    required
                  />
                </label>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Canonical URL</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://taiton.in/catalogues/..."
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Focus Keyword</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. hardware catalog pdf"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Secondary Keywords</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={secondaryKeywords}
                    onChange={(e) => setSecondaryKeywords(e.target.value)}
                    placeholder="Comma-separated keywords"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Robots Tag</span>
                  <select
                    className="cp-select"
                    value={robotsTag}
                    onChange={(e) => setRobotsTag(e.target.value)}
                  >
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                  </select>
                </label>
              </div>

              <div className="col-12">
                <label className="cp-field">
                  <span className="cp-field-label-text">SEO Meta Description <span className="cp-req">*</span></span>
                  <textarea
                    className="cp-input"
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Download the official TAITON 2026 architectural hardware catalog..."
                    rows={3}
                    required
                  />
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => navigate('/app/catalogs')}
                style={{ height: '44px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cp-btn cp-btn-primary"
                disabled={submitting}
                style={{ height: '44px', width: '220px' }}
              >
                {submitting ? 'Saving Catalog…' : editId ? 'Update Catalog' : 'Save Catalog'}
              </button>
            </div>
          </form>
        </section>

        {/* EXACT LIVE PREVIEW PANEL MATCHING Add Product PAGE PREVIEW LAYOUT WITH INDEPENDENT SCROLLBAR */}
        {showLivePreview && (
          <section className="cp-card cp-card-pad" style={{ flex: '1 1 50%', minWidth: 0, height: 'calc(100vh - 210px)', maxHeight: 'calc(100vh - 210px)', overflowY: 'auto', background: '#F8FAFC', border: '1px solid #E2E8F0', paddingBottom: '24px' }}>
            
            {/* Live Preview Toolbar (Identical to Add Product page) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', margin: 0 }}>
                Live Website Catalog Preview
              </h3>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Device Pills */}
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
                      cursor: 'pointer'
                    }}
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
                      cursor: 'pointer'
                    }}
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
                      cursor: 'pointer'
                    }}
                  >
                    Desktop
                  </button>
                </div>

                {/* Zoom Controls */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
                    style={{ padding: '2px 8px', fontSize: '13px', height: '28px', minWidth: '28px' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', minWidth: '38px', textAlign: 'center' }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
                    style={{ padding: '2px 8px', fontSize: '13px', height: '28px', minWidth: '28px' }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    onClick={() => setZoom(1.0)}
                    style={{ padding: '2px 8px', fontSize: '11px', height: '28px' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW CANVAS CONTAINER WITH ZOOM SCALE */}
            <div style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease-in-out',
              width: zoom !== 1.0 ? `${100 / zoom}%` : '100%'
            }}>
              <div style={{
                width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                margin: '0 auto',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #DCE5F0',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
                color: '#1E293B',
                fontSize: '14px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
              }}>

                {/* Catalogue Card Grid Item (as rendered in catalogues.html) */}
                <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', maxWidth: '480px', margin: '0 auto' }}>
                  {/* Cover */}
                  <div style={{ width: '120px', flex: '0 0 120px' }}>
                    {thumbnailImg ? (
                      <img
                        src={resolveUrl(thumbnailImg)}
                        alt={imageAltText || catalogName}
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #DCE5F0' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '150px', background: '#EEF6FF', borderRadius: '8px', border: '1px dashed #4FA3FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0D63C9', fontSize: '11px', textAlign: 'center', padding: '6px' }}>
                        📄 Cover Image
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ background: '#EEF6FF', color: '#003E7E', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginBottom: '6px' }}>
                        {categoryName}
                      </span>
                      <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: '14px', margin: '0 0 4px 0', color: '#1E293B' }}>
                        {catalogName || 'TAITON Catalog 2026'}
                      </h4>
                      <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                        {editionText} • {pageCount}
                      </div>
                      <div style={{ fontSize: '10px', color: '#003E7E', background: '#EEF6FF', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: '600' }}>
                        {updatedBadge}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                      {fileUrl && fileUrl !== '#' ? (
                        <a
                          href={resolveUrl(fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: '#003E7E', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textDecoration: 'none' }}
                        >
                          📄 Download PDF
                        </a>
                      ) : (
                        <button disabled style={{ background: '#E2E8F0', color: '#64748B', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', border: 'none' }}>
                          No PDF Attached
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {summary && (
                  <div style={{ marginTop: '16px', background: '#F8FAFC', border: '1px solid #DCE5F0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    <strong>Catalog Summary:</strong> {summary}
                  </div>
                )}

              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
