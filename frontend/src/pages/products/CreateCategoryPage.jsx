import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { SearchableSelect } from '../../components/SearchableSelect.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || window.location.origin;
  return `${base}${cleanPath}`;
};

export function CreateCategoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Hierarchy Selection States
  const [typeChoice, setTypeChoice] = useState('category'); // 'category' | 'sub category' | 'sub sub category'
  const [parentCatId, setParentCatId] = useState('');
  const [parentSubCatId, setParentSubCatId] = useState('');
  const [allCategories, setAllCategories] = useState([]);

  // Form Field States
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [bannerImg, setBannerImg] = useState('');
  const [catalogId, setCatalogId] = useState('');
  const [catalogsList, setCatalogsList] = useState([]);
  const [imageAltText, setImageAltText] = useState('');
  const [description, setDescription] = useState('');
  const [relatedProducts, setRelatedProducts] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);

  // SEO & OG & Robot fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [robot, setRobot] = useState('index, follow');

  // Load all existing categories & catalogs to populate dropdowns
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const [catRes, catlRes] = await Promise.all([
            enterpriseApi.contentList(token, 'category', { limit: 500 }),
            enterpriseApi.contentList(token, 'catalog', { limit: 200 })
          ]);
          setAllCategories(catRes.items || catRes.data || []);
          setCatalogsList(catlRes.items || catlRes.data || []);
        } catch (e) {
          console.error('Error fetching categories/catalogs for dropdown:', e);
        }
      };
      fetchData();
    }
  }, [token]);

  // Load category details on Edit mode
  useEffect(() => {
    if (editId && token) {
      const loadCategoryDetails = async () => {
        try {
          const res = await enterpriseApi.contentDetail(token, 'category', editId);
          const categoryItem = res.item || res.data;
          if (categoryItem) {
            if (categoryItem.status === 'pending_approval') {
              setIsLocked(true);
            }
            const p = categoryItem.payload || {};
            setCategoryName(categoryItem.title || p.category_name || '');
            setCategoryImage(p.category_image || p.img || '');
            setBannerImg(p.banner_img || p.bannerImg || '');
            setCatalogId(p.catalog_id || p.catalogId || '');
            setImageAltText(p.image_alt_text || '');
            setDescription(p.description || categoryItem.summary || '');
            setRelatedProducts(p.related_products || '');
            setSeoTitle(p.seo_meta_title || '');
            setSeoDesc(p.seo_meta_description || '');
            setFocusKeyword(p.focus_keyword || '');
            setSecondaryKeywords(p.secondary_keywords || '');
            setRobot(p.robot || 'index, follow');

            // Set Type & Parent IDs for Edit
            const pId = Number(p.parent_id ?? categoryItem.parent_id ?? 0);
            const pType = String(p.type ?? categoryItem.type ?? 'category').toLowerCase();

            if (pId === 0 || pType === 'category' || pType === 'cat') {
              setTypeChoice('category');
              setParentCatId('');
              setParentSubCatId('');
            } else {
              const resAll = await enterpriseApi.contentList(token, 'category', { limit: 500 });
              const items = resAll.items || resAll.data || [];
              const parentItem = items.find((c) => Number(c.id) === pId);

              if (parentItem) {
                const grandParentId = Number(parentItem.payload?.parent_id ?? parentItem.parent_id ?? 0);
                if (grandParentId === 0) {
                  setTypeChoice('sub category');
                  setParentCatId(String(parentItem.id));
                } else {
                  setTypeChoice('sub sub category');
                  setParentCatId(String(grandParentId));
                  setParentSubCatId(String(parentItem.id));
                }
              }
            }
          }
        } catch (err) {
          notify.apiError(err, 'Failed to load category details');
        }
      };
      loadCategoryDetails();
    }
  }, [editId, token]);

  // Derived category options for SearchableSelect
  const mainCategoriesOptions = allCategories
    .filter((c) => {
      const pId = Number(c.payload?.parent_id ?? c.parent_id ?? 0);
      const cType = String(c.payload?.type ?? c.type ?? 'cat').toLowerCase();
      return (pId === 0 || cType === 'cat' || cType === 'category') && Number(c.id) !== Number(editId);
    })
    .map((c) => ({
      value: c.id,
      label: c.title || c.payload?.category_name || `Category #${c.id}`,
    }));

  const subCategoriesOptions = allCategories
    .filter((c) => {
      const pId = Number(c.payload?.parent_id ?? c.parent_id ?? 0);
      return pId === Number(parentCatId) && Number(c.id) !== Number(editId);
    })
    .map((sc) => ({
      value: sc.id,
      label: sc.title || sc.payload?.category_name || `Sub Category #${sc.id}`,
    }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setCategoryImage(res.url);
      notify.success('Uploaded', 'Category image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Image upload failed');
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setBannerImg(res.url);
      notify.success('Uploaded', 'Banner image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Banner image upload failed');
    }
  };

  const onSubmit = async (e, redirectOpt = null) => {
    if (e) e.preventDefault();
    if (!token) return;
    if (isLocked) {
      notify.warning('This record is locked while pending approval.');
      return;
    }

    // Validation
    const newErrors = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = 'Category Name is required.';
    } else if (categoryName.trim().length > 190) {
      newErrors.categoryName = 'Category Name must not exceed 190 characters.';
    }

    if (typeChoice === 'sub category' && !parentCatId) {
      newErrors.parentCatId = 'Please choose a Main Category.';
    }

    if (typeChoice === 'sub sub category') {
      if (!parentCatId) newErrors.parentCatId = 'Please choose a Main Category.';
      if (!parentSubCatId) newErrors.parentSubCatId = 'Please choose a Sub Category.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.formWarning('Please fix the validation errors.');
      return;
    }

    setErrors({});
    setSubmitting(true);

    // Determine target parent_id and type to store in DB
    let calculatedParentId = 0;
    let calculatedType = 'cat';

    if (typeChoice === 'category' || typeChoice === 'cat') {
      calculatedType = 'cat';
      calculatedParentId = 0;
    } else if (typeChoice === 'sub category' || typeChoice === 'sc') {
      calculatedType = 'sc';
      calculatedParentId = Number(parentCatId) || 0;
    } else if (typeChoice === 'sub sub category' || typeChoice === 's2c') {
      calculatedType = 's2c';
      calculatedParentId = Number(parentSubCatId) || 0;
    }

    try {
      const payload = {
        type: calculatedType,
        parent_id: calculatedParentId,
        description: description.trim() || null,
        category_image: categoryImage.trim() || null,
        banner_img: bannerImg.trim() || null,
        catalog_id: catalogId ? String(catalogId).trim() : null,
        image_alt_text: imageAltText.trim() || null,
        seo_meta_title: seoTitle.trim() || null,
        seo_meta_description: seoDesc.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        robot: robot || 'index, follow',
        related_products: relatedProducts.trim() || null,
      };

      const res = editId
        ? await enterpriseApi.contentUpdate(token, 'category', editId, {
            title: categoryName.trim(),
            summary: description.trim() || seoDesc.trim() || categoryName.trim(),
            payload,
          })
        : await enterpriseApi.contentCreate(token, 'category', {
            title: categoryName.trim(),
            summary: description.trim() || seoDesc.trim() || categoryName.trim(),
            status: 'draft',
            payload,
          });

      notify.success(
        (res.item || res)?.status === 'pending_approval' ? 'Submitted for Approval' : 'Category Saved',
        (res.item || res)?.message ?? 'Category has been saved.'
      );
      emitUnreadRefresh();

      if (redirectOpt === 'add_another') {
        setCategoryName('');
        setCategoryImage('');
        setImageAltText('');
        setDescription('');
        setSeoTitle('');
        setSeoDesc('');
        setFocusKeyword('');
        setSecondaryKeywords('');
      } else {
        navigate('/app/products');
      }
    } catch (err) {
      notify.apiError(err, editId ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-stack">
      <PageBreadcrumb parent="Products" parentUrl="/app/products" current={editId ? 'Edit Category' : 'Create Category'} />

      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">{editId ? 'Edit Category' : 'Add Category'}</h1>
          <p className="cp-muted">Configure hierarchy level (Category / Sub Category / Sub Sub Category), attributes, and SEO meta tags.</p>
        </div>
      </div>

      <section className="cp-card cp-card-pad">
        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLocked && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fffbe3',
                border: '1px solid #fde047',
                borderRadius: '8px',
                color: '#854d0e',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '500'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <strong>Record Locked:</strong> This category is currently pending approval by a checker. Edits are disabled until reviewed.
              </div>
            </div>
          )}

          {/* HIERARCHY TYPE SELECTOR - CLEAN NORMAL FORM STYLING */}
          <div className="cp-grid cp-grid-3" style={{ gap: '16px 20px', marginBottom: '10px' }}>
            <label className="cp-field">
              <span className="cp-field-label-text">Choose Type <span className="cp-req">*</span></span>
              <select
                className="cp-select"
                value={typeChoice}
                onChange={(e) => {
                  setTypeChoice(e.target.value);
                  setParentCatId('');
                  setParentSubCatId('');
                  setErrors({});
                }}
                style={{ fontWeight: '600' }}
              >
                <option value="category">Category (Main Level)</option>
                <option value="sub category">Sub Category (Level 2)</option>
                <option value="sub sub category">Sub Sub Category (Level 3)</option>
              </select>
            </label>

            {/* Show Main Category Dropdown if Sub Category or Sub Sub Category */}
            {(typeChoice === 'sub category' || typeChoice === 'sub sub category') && (
              <div className="cp-field">
                <span className="cp-field-label-text">Choose Category <span className="cp-req">*</span></span>
                <SearchableSelect
                  options={mainCategoriesOptions}
                  value={parentCatId}
                  onChange={(val) => {
                    setParentCatId(val);
                    setParentSubCatId('');
                  }}
                  placeholder="-- Search & Select Category --"
                />
                {errors.parentCatId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.parentCatId}</span>}
              </div>
            )}

            {/* Show Sub Category Dropdown if Sub Sub Category */}
            {typeChoice === 'sub sub category' && (
              <div className="cp-field">
                <span className="cp-field-label-text">Choose Sub Category <span className="cp-req">*</span></span>
                <SearchableSelect
                  options={subCategoriesOptions}
                  value={parentSubCatId}
                  onChange={(val) => setParentSubCatId(val)}
                  placeholder="-- Search & Select Sub Category --"
                  disabled={!parentCatId}
                />
                {errors.parentSubCatId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.parentSubCatId}</span>}
              </div>
            )}
          </div>

          {/* LINE 1: CATEGORY NAME, CATEGORY IMAGE, IMAGE ALT TEXT */}
          <div className="row g-3" style={{ marginBottom: '12px' }}>
            <div className="col-12 col-md-4">
              <label className="cp-field">
                <span className="cp-field-label-text">
                  {typeChoice === 'category' ? 'Category Name' : typeChoice === 'sub category' ? 'Sub Category Name' : 'Sub Sub Category Name'} <span className="cp-req">*</span>
                </span>
                <input
                  type="text"
                  className="cp-input"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder={typeChoice === 'category' ? 'e.g. Electronics' : typeChoice === 'sub category' ? 'e.g. Laptops' : 'e.g. Gaming Laptops'}
                  maxLength={190}
                  required
                />
                {errors.categoryName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.categoryName}</span>}
              </label>
            </div>

            <div className="col-12 col-md-4">
              <div className="cp-field">
                <span className="cp-field-label-text">Category Image</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {categoryImage && (
                    <img
                      src={resolveImageUrl(categoryImage)}
                      alt="Category Preview"
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="cp-input"
                      style={{ width: '100%', paddingRight: '120px' }}
                      value={categoryImage ? 'Image Chosen ✓' : ''}
                      readOnly
                      placeholder="Choose image..."
                      onClick={() => document.getElementById('cat-img-file').click()}
                    />
                    <input
                      type="file"
                      id="cat-img-file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => document.getElementById('cat-img-file').click()}
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
                  {categoryImage && (
                    <button
                      type="button"
                      className="cp-btn-icon cp-btn-icon--danger"
                      onClick={() => setCategoryImage('')}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                      title="Remove Category Image"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
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

            {/* LINE 2: DESCRIPTION / SUMMARY */}
            <div className="col-12">
              <label className="cp-field">
                <span className="cp-field-label-text">Description / Summary</span>
                <textarea
                  className="cp-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description or overview..."
                  rows={3}
                  style={{ minHeight: '90px', resize: 'vertical' }}
                />
              </label>
            </div>

            {/* LINE 3: BANNER IMAGE & CATALOG SELECTION */}
            <div className="col-12 col-md-6">
              <div className="cp-field">
                <span className="cp-field-label-text">Banner Image (Category Hero / Header Banner)</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {bannerImg && (
                    <img
                      src={resolveImageUrl(bannerImg)}
                      alt="Banner Preview"
                      style={{ width: '64px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="cp-input"
                      style={{ width: '100%', paddingRight: '120px' }}
                      value={bannerImg ? 'Image Chosen ✓' : ''}
                      readOnly
                      placeholder="Choose image..."
                      onClick={() => document.getElementById('cat-banner-file').click()}
                    />
                    <input
                      type="file"
                      id="cat-banner-file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleBannerUpload}
                    />
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => document.getElementById('cat-banner-file').click()}
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
                  {bannerImg && (
                    <button
                      type="button"
                      className="cp-btn-icon cp-btn-icon--danger"
                      onClick={() => setBannerImg('')}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                      title="Remove Banner Image"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="cp-field">
                <span className="cp-field-label-text">Catalog ID (Associated Product Catalog)</span>
                <select
                  className="cp-select"
                  value={catalogId}
                  onChange={(e) => setCatalogId(e.target.value)}
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="">-- No Catalog Assigned --</option>
                  {catalogsList.map((c) => {
                    const cId = c.payload?.catalog_id || String(c.id);
                    const cTitle = c.title || c.payload?.catalog_name || `Catalog #${c.id}`;
                    return (
                      <option key={c.id} value={cId}>
                        {cTitle} ({cId})
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
          </div>

          {/* SEO DETAILS SECTION */}
          <div style={{ marginTop: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', margin: '0 0 12px 0' }}>SEO & Meta Tag Details</h3>
            
            <div className="row g-3">
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
                    <option value="noindex, follow">No Index, Follow (noindex, follow)</option>
                    <option value="index, nofollow">Index, No Follow (index, nofollow)</option>
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
                    placeholder="Snippet description for search engine results"
                    rows={3}
                    style={{ minHeight: '90px', resize: 'vertical' }}
                  />
                </label>
              </div>
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
                {submitting ? 'Saving Category…' : editId ? 'Update Category' : 'Submit Category'}
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
                  <div
                    style={{
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
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        setShowSplitMenu(false);
                        onSubmit(e, 'add_another');
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
                      Save & Add Another
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
