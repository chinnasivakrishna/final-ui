import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { SearchableSelect } from '../../components/SearchableSelect.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';
import { RelatedProductsSelect } from '../../components/RelatedProductsSelect.jsx';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || window.location.origin;
  return `${base}${cleanPath}`;
};

export function CreateSubCategoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  const [categories, setCategories] = useState([]);
  const [parentCatId, setParentCatId] = useState(searchParams.get('parent_cat_id') || '');
  const [subCatId, setSubCatId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [url, setUrl] = useState('');
  const [relatedProducts, setRelatedProducts] = useState('');
  const [subcategoryImage, setSubcategoryImage] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);

  // SEO & OG fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [robot, setRobot] = useState('index, follow');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');

  const slugify = (text) => {
    return 'subcat-' + String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    setSubCategoryName(e.target.value);
  };

  useEffect(() => {
    async function loadCategories() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await enterpriseApi.contentList(token, 'category', { limit: 100 });
        setCategories(res.items ?? []);
      } catch (err) {
        notify.apiError(err, 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [token]);

  useEffect(() => {
    if (editId && token) {
      const loadSubcategoryDetails = async () => {
        try {
          const res = await enterpriseApi.contentDetail(token, 'subcategory', editId);
          const subcategoryItem = res.item;
          if (subcategoryItem) {
            if (subcategoryItem.status === 'pending_approval') {
              setIsLocked(true);
            }
            const p = subcategoryItem.payload || {};
            setSubCatId(p.sub_cat_id || String(subcategoryItem.id));
            setParentCatId(p.parent_cat_id || p.cat_id || '');
            setSubCategoryName(subcategoryItem.title || '');
            setUrl(p.url || '');
            setRelatedProducts(p.related_products || '');
            setSubcategoryImage(p.subcategory_image || p.img || '');
            setImageAltText(p.image_alt_text || '');
            setSeoTitle(p.seo_meta_title || '');
            setSeoDesc(p.seo_meta_description || '');
            setFocusKeyword(p.focus_keyword || '');
            setSecondaryKeywords(p.secondary_keywords || '');
            setRobot(p.robot || 'index, follow');
            setOgTitle(p.og_title || '');
            setOgDesc(p.og_description || '');
            setOgImage(p.og_image || '');
          }
        } catch (e) {
          notify.apiError(e, 'Error loading subcategory details');
        }
      };
      loadSubcategoryDetails();
    }
  }, [editId, token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setSubcategoryImage(res.url);
      notify.success('Uploaded', 'Image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Image upload failed');
    }
  };

  const handleOgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setOgImage(res.url);
      notify.success('Uploaded', 'OG image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'OG image upload failed');
    }
  };

  const onSubmit = async (e, redirectOpt = null) => {
    if (e) e.preventDefault();
    if (!token) return;
    if (isLocked) {
      notify.warning('This record is locked while pending approval.');
      return;
    }

    // Perform custom validation
    const newErrors = {};
    if (!parentCatId) newErrors.parentCatId = 'Parent Category is required.';
    if (!subCategoryName.trim()) {
      newErrors.subCategoryName = 'Sub Category Name is required.';
    } else if (subCategoryName.trim().length > 190) {
      newErrors.subCategoryName = 'Sub Category Name must not exceed 190 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.formWarning('Please fix the validation errors.');
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        parent_cat_id: parentCatId,
        url: `/subcategory/${subCategoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`,
        seo_meta_title: seoTitle.trim() || null,
        seo_meta_description: seoDesc.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        robot: robot || 'index, follow',
        related_products: relatedProducts.trim() || null,
        image_alt_text: imageAltText.trim() || null,
        subcategory_image: subcategoryImage.trim() || null,
        og_title: null,
        og_description: null,
        og_image: null,
      };

      const res = editId
        ? await enterpriseApi.contentUpdate(token, 'subcategory', editId, {
          title: subCategoryName.trim(),
          summary: seoDesc.trim() || subCategoryName.trim(),
          payload,
        })
        : await enterpriseApi.contentCreate(token, 'subcategory', {
          title: subCategoryName.trim(),
          summary: seoDesc.trim() || subCategoryName.trim(),
          status: 'draft',
          payload,
        });

      notify.success((res.item || res)?.status === 'pending_approval' ? 'Submitted for Approval' : 'Sub Category Saved', (res.item || res)?.message ?? 'Sub Category has been saved.');
      emitUnreadRefresh();

      const createdSubCatId = (res.item || res)?.id || editId || '';
      if (redirectOpt === 'add_product') {
        navigate(`/app/products/create-product?cat_id=${parentCatId}&sub_cat_id=${createdSubCatId}`);
      } else {
        navigate('/app/products?tab=subcategories');
      }
    } catch (err) {
      notify.apiError(err, editId ? 'Failed to update subcategory' : 'Failed to create subcategory');
    } finally {
      setSubmitting(false);
    }
  };

  // Map category options for SearchableSelect using primary key ID
  const categoryOptions = categories
    .map((c) => ({
      value: c.id,
      label: c.title,
    }));

  return (
    <div className="cp-stack">
      <PageBreadcrumb parent="Products" parentUrl="/app/products" current={editId ? "Edit Sub Category" : "Create Sub Category"} />

      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">{editId ? "Edit Sub Category" : "Add Sub Category"}</h1>
          <p className="cp-muted">Configure parent link relations, SEO options and related products.</p>
        </div>
      </div>

      <section className="cp-card cp-card-pad">
        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLocked && (
            <div style={{
              padding: '12px 16px',
              background: '#fffbe3',
              border: '1px solid #fde047',
              borderRadius: '8px',
              color: '#854d0e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '500'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div>
                <strong>Record Locked:</strong> This sub category is currently pending approval by a checker. Edits are disabled until reviewed.
              </div>
            </div>
          )}

          <div className="row g-3" style={{ marginBottom: '12px' }}>
            <div className="col-12 col-md-6">
              <div className="cp-field">
                <span className="cp-field-label-text">Parent Category <span className="cp-req">*</span></span>
                <SearchableSelect
                  options={categoryOptions}
                  value={parentCatId}
                  onChange={(val) => setParentCatId(val)}
                  placeholder={loading ? 'Loading categories…' : '-- Search & Select Category --'}
                  disabled={loading}
                />
                {errors.parentCatId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.parentCatId}</span>}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="cp-field">
                <span className="cp-field-label-text">Sub Category Name <span className="cp-req">*</span></span>
                <input
                  type="text"
                  className="cp-input"
                  value={subCategoryName}
                  onChange={handleNameChange}
                  placeholder="e.g. Hinges"
                  maxLength={190}
                  required
                />
                {errors.subCategoryName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.subCategoryName}</span>}
              </label>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="cp-field">
                <span className="cp-field-label-text">Sub Category Image</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {subcategoryImage && (
                    <img
                      src={resolveImageUrl(subcategoryImage)}
                      alt="Sub Category Preview"
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="cp-input"
                      style={{ width: '100%', paddingRight: '120px' }}
                      value={subcategoryImage ? 'Image Chosen ✓' : ''}
                      readOnly
                      placeholder="Choose image..."
                      onClick={() => document.getElementById('subcat-img-file').click()}
                    />
                    <input
                      type="file"
                      id="subcat-img-file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => document.getElementById('subcat-img-file').click()}
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
                  {subcategoryImage && (
                    <button
                      type="button"
                      className="cp-btn-icon cp-btn-icon--danger"
                      onClick={() => setSubcategoryImage('')}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                      title="Remove Sub Category Image"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="cp-field">
                <span className="cp-field-label-text">Image Alt Text</span>
                <input
                  type="text"
                  className="cp-input"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Alt description of image"
                />
              </label>
            </div>

            <div className="col-12">
              <label className="cp-field">
                <span className="cp-field-label-text">SEO Meta Title</span>
                <input
                  type="text"
                  className="cp-input"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Display title for search engine queries"
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
                  placeholder="Primary search phrase"
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
                <span className="cp-field-label-text">Robots (Index / No Index)</span>
                <select
                  className="cp-select"
                  value={robot}
                  onChange={(e) => setRobot(e.target.value)}
                >
                  <option value="index, follow">Index (index, follow)</option>
                  <option value="noindex, nofollow">No Index (noindex, nofollow)</option>
                </select>
              </label>
            </div>

            <div className="col-12">
              <label className="cp-field">
                <span className="cp-field-label-text">SEO Meta Description</span>
                <textarea
                  className="cp-input"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Snippet description for search engines"
                  rows={3}
                />
              </label>
            </div>
          </div>

          {/* SUBMIT BUTTON CONTAINER */}
          <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'inline-flex', position: 'relative' }}>
              <button
                type="submit"
                className="cp-btn cp-btn-primary"
                disabled={submitting}
                style={{
                  height: '44px',
                  width: '180px',
                  borderTopRightRadius: '0',
                  borderBottomRightRadius: '0',
                  borderRight: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {submitting ? 'Saving Sub Category…' : editId ? 'Update Sub Category' : 'Submit Sub Category'}
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  disabled={submitting}
                  onClick={() => setShowSplitMenu(!showSplitMenu)}
                  style={{
                    height: '44px',
                    width: '40px',
                    minWidth: 'auto',
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="More actions"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showSplitMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showSplitMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '48px',
                    backgroundColor: 'var(--cp-bg-card, #ffffff)',
                    border: '1px solid var(--cp-border)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                    zIndex: 100,
                    minWidth: '240px',
                    padding: '4px 0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        setShowSplitMenu(false);
                        onSubmit(e, 'add_product');
                      }}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        color: 'var(--cp-text)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        width: '100%',
                        display: 'block'
                      }}
                    >
                      Submit & Add Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </form>
      </section>
    </div>
  );
}
