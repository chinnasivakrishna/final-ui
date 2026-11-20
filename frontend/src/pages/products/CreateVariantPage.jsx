import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { SearchableSelect } from '../../components/SearchableSelect.jsx';
import { RelatedProductsSelect } from '../../components/RelatedProductsSelect.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export function CreateVariantPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Reference lists
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [parentVariantsList, setParentVariantsList] = useState([]);

  // Form states
  const [variantId, setVariantId] = useState('');
  const [productId, setProductId] = useState(searchParams.get('product_id') || '');
  const [variantName, setVariantName] = useState('');
  const [variantSlug, setVariantSlug] = useState('');
  const [variantCode, setVariantCode] = useState('');
  const [colorFinish, setColorFinish] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [commonsColors, setCommonsColors] = useState([]);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [otherImages, setOtherImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [imageAltText, setImageAltText] = useState('');
  const [variantTitle, setVariantTitle] = useState('');
  const [variantSeoTitle, setVariantSeoTitle] = useState('');
  const [variantSeoDesc, setVariantSeoDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [robot, setRobot] = useState('index, follow');
  const [variantOrder, setVariantOrder] = useState('0');
  const [status, setStatus] = useState('pending_approval');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [relatedProducts, setRelatedProducts] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLocked, setIsLocked] = useState(false);

  // Live Website Product Preview states
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [zoom, setZoom] = useState(1.0);
  const [activePreviewImage, setActivePreviewImage] = useState('');

  const setSidebarCollapsed = (collapsed) => {
    try {
      const event = new CustomEvent('app:sidebar-toggle', { detail: { collapsed } });
      window.dispatchEvent(event);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showLivePreview) {
      setSidebarCollapsed(true);
    }
  }, [showLivePreview]);

  // Auto-generate IDs on name change
  useEffect(() => {
    if (!editId) {
      const slug = slugify(variantName);
      setVariantId(slug ? `var-${slug}` : '');
      setVariantSlug(slug);
    }
  }, [variantName, editId]);

  // Load products, categories & commons colors
  useEffect(() => {
    if (token) {
      Promise.all([
        enterpriseApi.contentList(token, 'category', { limit: 100 }),
        enterpriseApi.contentList(token, 'subcategory', { limit: 100 }),
        enterpriseApi.contentList(token, 'product', { limit: 200, status: 'any' }),
        enterpriseApi.getCommonsColors(token)
      ]).then(([catRes, subRes, pdtRes, colorsRes]) => {
        setCategories(catRes.items ?? []);
        setSubcategories(subRes.items ?? []);
        setProductsList(pdtRes.items ?? []);
        setCommonsColors(colorsRes?.items || colorsRes?.data || []);
      }).catch((err) => console.error('Failed to load reference lists:', err));
    }
  }, [token]);

  // Load parent variants when productId is selected
  useEffect(() => {
    if (token && productId) {
      enterpriseApi.contentList(token, 'variant', { limit: 100 })
        .then((res) => {
          const allVars = res.items ?? [];
          const matching = allVars.filter(v => String(v.payload?.product_id) === String(productId));
          setParentVariantsList(matching);
        })
        .catch((err) => console.error('Failed to load parent variants:', err));
    } else {
      setParentVariantsList([]);
    }
  }, [token, productId]);

  // Load editing details if editId is provided
  useEffect(() => {
    if (token && editId) {
      enterpriseApi.contentDetail(token, 'variant', editId)
        .then((res) => {
          if (res.item?.status === 'pending_approval') {
            setIsLocked(true);
          }
          const p = res.item?.payload || {};
          setVariantId(p.variant_id || '');
          setProductId(p.product_id || '');
          setVariantName(res.item?.title || p.variant_name || p.name || '');
          setVariantSlug(p.variant_slug || '');
          setVariantCode(p.variant_code || p.variantCode || p.var_code || '');
          setColorFinish(p.color_finish || p.colour || '');
          setPrice(p.price !== undefined && p.price !== null ? String(p.price) : '');
          setDiscount(p.discount !== undefined && p.discount !== null ? String(p.discount) : '');
          setSku(p.sku || '');
          setImageUrl(p.primary_img || p.image_url || p.variant_image || p.img || '');
          setOtherImages(Array.isArray(p.other_images) ? p.other_images : (Array.isArray(p.imgs) ? p.imgs : []));
          setImageAltText(p.image_alt_text || '');
          setVariantTitle(p.variant_title || '');
          setVariantSeoTitle(p.variant_seo_title || p.seo_title || '');
          setVariantSeoDesc(p.variant_seo_description || p.seo_desc || '');
          setFocusKeyword(p.focus_keyword || p.focusKeyword || '');
          setSecondaryKeywords(p.secondary_keywords || p.secondaryKeywords || '');
          setRobot(p.robot || p.robots || 'index, follow');
          setVariantOrder(String(p.variant_order || '0'));
          setStatus(res.item?.status || p.status || 'draft');
          setCanonicalUrl(p.canonical_url || '');
          setRelatedProducts(p.related_products || '');
        })
        .catch((err) => notify.apiError(err, 'Failed to load variant details'));
    }
  }, [token, editId]);

  const getCategoryName = (id) => {
    if (!id) return 'Glass Door Fittings';
    const found = categories.find(c => String(c.id) === String(id) || String(c.payload?.cat_id) === String(id));
    return found ? (found.title || found.summary || id) : id;
  };

  const getSubCategoryName = (id) => {
    if (!id) return 'Patch Fittings';
    const found = subcategories.find(s => String(s.id) === String(id) || String(s.payload?.sub_cat_id) === String(id));
    return found ? (found.title || found.summary || id) : id;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setImageUrl(res.url);
      notify.success('Uploaded', 'Variant image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Image upload failed');
    }
  };

  const handleOtherImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !token) return;
    try {
      const uploadPromises = files.map(file => enterpriseApi.uploadImage(token, file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.url);
      setOtherImages([...otherImages, ...urls]);
      notify.success('Uploaded', `${files.length} image(s) uploaded successfully!`);
    } catch (err) {
      notify.apiError(err, 'Image upload failed');
    }
  };

  const removeOtherImage = (idx) => {
    setOtherImages(otherImages.filter((_, i) => i !== idx));
  };

  const moveOtherImage = (idx, direction) => {
    const nextList = [...otherImages];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= nextList.length) return;
    const temp = nextList[idx];
    nextList[idx] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setOtherImages(nextList);
  };

  const handleDragStart = (idx) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (toIdx) => {
    if (draggedIndex === null || draggedIndex === toIdx) return;
    const nextList = [...otherImages];
    const draggedItem = nextList[draggedIndex];
    nextList.splice(draggedIndex, 1);
    nextList.splice(toIdx, 0, draggedItem);
    setOtherImages(nextList);
    setDraggedIndex(null);
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!token) return;
    if (isLocked) {
      notify.warning('This record is locked while pending approval.');
      return;
    }

    // Perform custom validation
    const newErrors = {};
    if (!productId) newErrors.productId = 'Parent Product is required.';
    if (!variantName.trim()) {
      newErrors.variantName = 'Variant Name is required.';
    } else if (variantName.trim().length > 190) {
      newErrors.variantName = 'Variant Name must not exceed 190 characters.';
    }
    if (variantCode.trim().length > 64) {
      newErrors.variantCode = 'Variant Code must not exceed 64 characters.';
    }
    if (sku.trim().length > 64) {
      newErrors.sku = 'SKU must not exceed 64 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.formWarning('Please fix the validation errors.');
      return;
    }

    const computedSlug = slugify(variantName.trim());
    const computedVarId = (variantId.trim() || `var-${computedSlug}`).slice(0, 64);
    const computedVarSlug = variantSlug.trim() || computedSlug;

    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        variant_id: computedVarId,
        product_id: productId.trim(),
        variant_name: variantName.trim(),
        variant_slug: computedVarSlug,
        variant_code: variantCode.trim() || null,
        variantCode: variantCode.trim() || null,
        var_code: variantCode.trim() || null,
        color_finish: colorFinish.trim() || null,
        colour: colorFinish.trim() || null,
        price: price !== '' ? Number(price) : null,
        discount: discount !== '' ? Number(discount) : null,
        sku: sku.trim() || null,
        image_url: imageUrl.trim() || null,
        primary_img: imageUrl.trim() || null,
        variant_image: imageUrl.trim() || null,
        img: imageUrl.trim() || null,
        image_alt_text: imageAltText.trim() || null,
        variant_title: variantName.trim() || null,
        variant_seo_title: variantSeoTitle.trim() || null,
        variant_seo_description: variantSeoDesc.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        robot: robot || 'index, follow',
        variant_order: parseInt(variantOrder || '0', 10),
        status: 'pending_approval',
        canonical_url: canonicalUrl.trim() || null,
        related_products: relatedProducts.trim() || null,
        other_images: otherImages,
        imgs: otherImages,
      };

      if (editId) {
        await enterpriseApi.contentUpdate(token, 'variant', editId, {
          title: variantName.trim(),
          summary: variantName.trim(),
          payload,
        });
        notify.success('Updated', 'Variant has been successfully updated.');
      } else {
        await enterpriseApi.contentCreate(token, 'variant', {
          title: variantName.trim(),
          summary: variantName.trim(),
          payload,
        });
        notify.success('Created', 'Variant was created successfully.');
      }

      emitUnreadRefresh();
      navigate('/app/products?tab=variants');
    } catch (err) {
      notify.apiError(err, 'Failed to save variant information');
    } finally {
      setSubmitting(false);
    }
  };

  const productOptions = productsList.map((p) => ({
    value: p.payload?.prd_id || String(p.id),
    label: `${p.title} (${p.payload?.prd_id || p.id})`
  }));

  // Selected parent product inherited properties
  const selectedParentProduct = productsList.find(p => {
    const prdId = p.payload?.prd_id || String(p.id);
    const pCode = p.payload?.productCode || p.payload?.pdt_code;
    return prdId === productId || String(p.id) === productId || pCode === productId;
  });

  const parentPayload = selectedParentProduct?.payload || {};
  const parentTitle = selectedParentProduct?.title || parentPayload.product || parentPayload.name || 'Parent Product';
  const parentCatId = parentPayload.cat_id || '';
  const parentSubCatId = parentPayload.sub_cat_id || '';
  const parentFeatures = parentPayload.product_features || null;
  const parentSpecs = parentPayload.product_specifications || null;
  const parentAddl = parentPayload.addl_features || null;
  const rawParentColours = parentPayload.colours || parentPayload.colors;
  const parentColoursList = Array.isArray(rawParentColours)
    ? rawParentColours
    : (typeof rawParentColours === 'string' && rawParentColours.trim()
      ? rawParentColours.split(',').map(s => s.trim()).filter(Boolean)
      : []);

  // Build List of Variant Swatches for Available Finishes / Variants section
  // Default to finishes / colours selected in parent product (parentColoursList)
  let variantSwatches = [];
  const activeColor = colorFinish || parentPayload.default_colour || (parentColoursList[0] || '');

  if (parentColoursList && parentColoursList.length > 0) {
    variantSwatches = parentColoursList.map((colName) => {
      const matchedCommons = commonsColors.find(c => c.name?.toLowerCase() === colName.toLowerCase());
      const existingVar = parentVariantsList.find(v => (v.payload?.color_finish || v.payload?.colour)?.toLowerCase() === colName.toLowerCase());
      const isThisColor = activeColor?.toLowerCase() === colName.toLowerCase();

      let swatchImg = '';
      if (isThisColor && imageUrl) {
        swatchImg = imageUrl;
      } else if (existingVar?.payload?.image_url) {
        swatchImg = existingVar.payload.image_url;
      } else if (matchedCommons?.image_url) {
        swatchImg = matchedCommons.image_url;
      } else if (colName.toLowerCase() === (parentPayload.default_colour || '').toLowerCase()) {
        swatchImg = parentPayload.product_image || parentPayload.primary_img || '';
      }

      return {
        id: `colour-${colName}`,
        name: colName,
        title: colName,
        finish: colName,
        img: swatchImg,
        hex: matchedCommons?.hex_code || null,
        isCurrent: isThisColor
      };
    });
  } else {
    // Fallback: DB variants + current editing variant
    if (selectedParentProduct) {
      const pImg = parentPayload.product_image || parentPayload.primary_img || selectedParentProduct.img || '';
      const pFinish = parentPayload.color_finish || parentPayload.finish || 'Primary';
      variantSwatches.push({
        id: 'parent-' + selectedParentProduct.id,
        name: pFinish,
        title: parentTitle,
        finish: pFinish,
        img: pImg,
        isCurrent: !colorFinish
      });
    }

    parentVariantsList.forEach((v) => {
      const vPayload = v.payload || {};
      const vImg = vPayload.image_url || vPayload.variant_image || v.img || '';
      const vFinish = vPayload.color_finish || v.title || 'Variant';
      if (String(v.id) !== String(editId || '')) {
        variantSwatches.push({
          id: String(v.id),
          name: vFinish,
          title: v.title,
          finish: vFinish,
          img: vImg,
          isCurrent: (colorFinish && colorFinish.toLowerCase() === vFinish.toLowerCase())
        });
      }
    });

    const currentImg = imageUrl || (otherImages && otherImages[0]) || parentPayload.product_image || '';
    const currentFinishLabel = colorFinish || variantTitle || variantName || 'Current Variant';
    if (!variantSwatches.some(s => s.finish.toLowerCase() === currentFinishLabel.toLowerCase())) {
      variantSwatches.push({
        id: 'current-editing-variant',
        name: currentFinishLabel,
        title: variantTitle || variantName || 'Current Variant',
        finish: currentFinishLabel,
        img: currentImg,
        isCurrent: true
      });
    }
  }

  return (
    <div className="cp-stack" style={{ height: showLivePreview ? 'calc(100vh - 85px)' : 'auto', overflow: showLivePreview ? 'hidden' : 'visible' }}>
      <PageBreadcrumb parent="Products" parentUrl="/app/products" current={editId ? "Edit Variant" : "Create Variant"} />
      <div className="cp-page-head" style={{ marginBottom: '12px' }}>
        <div>
          <h1 className="cp-page-title">{editId ? "Edit Variant" : "Add Variant"}</h1>
          <p className="cp-muted">Configure variant specific attributes, order ranking and SEO properties.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className={`cp-btn ${showLivePreview ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
            onClick={() => {
              const nextVal = !showLivePreview;
              setShowLivePreview(nextVal);
              setSidebarCollapsed(nextVal);
            }}
          >
            {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            disabled={submitting || isLocked}
            onClick={onSubmit}
            style={{ minHeight: '38px', padding: '0 16px', fontWeight: '600' }}
          >
            {submitting ? 'Saving Variant…' : editId ? 'Update Variant' : 'Create Variant'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', width: '100%', alignItems: 'flex-start', flex: 1, minHeight: 0 }}>
        <section className="cp-card cp-card-pad" style={{ flex: showLivePreview ? '1 1 50%' : '1 1 100%', minWidth: 0, maxHeight: showLivePreview ? 'calc(100vh - 165px)' : 'none', overflowY: showLivePreview ? 'auto' : 'visible', paddingBottom: '24px' }}>
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
                  <strong>Record Locked:</strong> This variant is currently pending approval by a checker. Edits are disabled until reviewed.
                </div>
              </div>
            )}

            {/* Main Info with Bootstrap Column Widths */}
            <div className="row g-3" style={{ marginBottom: '12px' }}>
              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Variant Name <span className="cp-req">*</span></span>
                  <input
                    type="text"
                    className="cp-input"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="e.g. Brass Finish Hinge"
                    maxLength={190}
                    required
                  />
                  {errors.variantName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.variantName}</span>}
                </label>
              </div>

              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Parent Product <span className="cp-req">*</span></span>
                  <SearchableSelect
                    options={productOptions}
                    value={productId}
                    onChange={(val) => setProductId(val)}
                    placeholder="Select Product ID reference"
                  />
                  {errors.productId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.productId}</span>}
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Variant Code</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={variantCode}
                    onChange={(e) => setVariantCode(e.target.value)}
                    placeholder="e.g. VC-001"
                    maxLength={64}
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">SKU</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SKU-BR-HINGE"
                    maxLength={64}
                  />
                </label>
              </div>

              {/* Color / Finish Selection - ONLY Product Colours */}
              <div className="col-12 col-md-4">
                <div className="cp-field">
                  <span className="cp-field-label-text">
                    Color / Finish
                    {parentColoursList.length > 0 ? (
                      <span style={{ fontSize: '11px', color: '#0D63C9', fontWeight: 'normal', marginLeft: '6px' }}>
                        ({parentColoursList.length})
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 'normal', marginLeft: '6px' }}>
                        (None)
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    {/* Swatch Preview */}
                    {(() => {
                      const matchedColor = commonsColors.find(c => c.name?.toLowerCase() === colorFinish?.toLowerCase());
                      if (matchedColor?.image_url) {
                        return (
                          <img
                            src={resolveImageUrl(matchedColor.image_url)}
                            alt={colorFinish}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #CBD5E1', flexShrink: 0 }}
                            title={`${matchedColor.name}`}
                          />
                        );
                      }
                      if (matchedColor?.hex_code) {
                        return (
                          <div
                            style={{ width: '36px', height: '36px', borderRadius: '50%', background: matchedColor.hex_code, border: '1.5px solid #CBD5E1', flexShrink: 0 }}
                            title={`${matchedColor.name} (${matchedColor.hex_code})`}
                          />
                        );
                      }
                      return (
                        <div
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94A3B8', flexShrink: 0 }}
                          title="No Swatch"
                        >
                          🎨
                        </div>
                      );
                    })()}

                    {/* Dropdown displaying ONLY colours added to this product */}
                    <select
                      className="cp-select"
                      style={{ flex: 1, height: '38px', minWidth: 0 }}
                      value={colorFinish}
                      onChange={(e) => {
                        const val = e.target.value;
                        setColorFinish(val);
                        const matched = commonsColors.find(c => c.name?.toLowerCase() === val.toLowerCase());
                        const existingVar = parentVariantsList.find(v => (v.payload?.color_finish || v.payload?.colour)?.toLowerCase() === val.toLowerCase());
                        if (existingVar?.payload?.image_url) {
                          setActivePreviewImage(existingVar.payload.image_url);
                        } else if (matched?.image_url) {
                          setActivePreviewImage(matched.image_url);
                        } else if (val.toLowerCase() === (parentPayload.default_colour || '').toLowerCase()) {
                          setActivePreviewImage(parentPayload.product_image || parentPayload.primary_img || '');
                        }
                      }}
                    >
                      <option value="">
                        {parentColoursList.length > 0 ? '-- Select Colour --' : '-- No product colours --'}
                      </option>
                      {parentColoursList.map((col, idx) => (
                        <option key={`p-${idx}`} value={col}>{col}</option>
                      ))}
                      {colorFinish && !parentColoursList.includes(colorFinish) && (
                        <option value={colorFinish}>{colorFinish} (Current)</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Price (₹ / MRP)</span>
                  <input
                    type="number"
                    step="0.01"
                    className="cp-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1900"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Discount (%)</span>
                  <input
                    type="number"
                    step="0.01"
                    className="cp-input"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Variant Order</span>
                  <input
                    type="number"
                    className="cp-input"
                    value={variantOrder}
                    onChange={(e) => setVariantOrder(e.target.value)}
                    placeholder="e.g. 0"
                  />
                </label>
              </div>
            </div>

            {/* Media Section */}
            <div className="row g-3" style={{ marginBottom: '12px' }}>
              <div className="col-12 col-md-6">
                <div className="cp-field">
                  <span className="cp-field-label-text">Variant Image</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {imageUrl && (
                      <img
                        src={resolveImageUrl(imageUrl)}
                        alt="Variant Preview"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={imageUrl ? 'Image Chosen ✓' : ''}
                        readOnly
                        placeholder="Choose image..."
                        onClick={() => document.getElementById('var-img-file').click()}
                      />
                      <input
                        type="file"
                        id="var-img-file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('var-img-file').click()}
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
                    {imageUrl && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setImageUrl('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove Variant Image"
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
                    placeholder="Alt text for SEO & accessibility"
                  />
                </label>
              </div>
            </div>

            {/* Additional Images Drag & Drop Gallery */}
            <div className="cp-field">
              <span className="cp-field-label-text">Additional Images <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>(Drag & Drop to reorder)</span></span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                {otherImages.map((img, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      border: '1px solid var(--cp-border)',
                      overflow: 'hidden',
                      cursor: 'grab',
                      background: '#f8fafc',
                      boxShadow: draggedIndex === idx ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                      opacity: draggedIndex === idx ? 0.5 : 1
                    }}
                  >
                    <img src={resolveImageUrl(img)} alt={`Gallery #${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeOtherImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        lineHeight: 1
                      }}
                      title="Remove image"
                    >
                      &times;
                    </button>
                    <div style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '9px', padding: '1px 4px', borderRadius: '3px' }}>
                      #{idx + 1}
                    </div>
                    <div style={{ position: 'absolute', bottom: '2px', right: '2px', display: 'flex', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => moveOtherImage(idx, -1)}
                        style={{ background: 'none', border: 'none', color: idx === 0 ? '#94a3b8' : 'white', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '10px', padding: 0 }}
                        title="Move Left"
                      >
                        &larr;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOtherImage(idx, 1)}
                        style={{ background: 'none', border: 'none', color: idx === otherImages.length - 1 ? '#94a3b8' : 'white', cursor: idx === otherImages.length - 1 ? 'not-allowed' : 'pointer', fontSize: '10px', padding: 0 }}
                        title="Move Right"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => document.getElementById('var-other-img-file').click()}
                  style={{ width: '80px', height: '80px', border: '2px dashed var(--cp-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--cp-text)', background: '#fff', transition: 'border-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--cp-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--cp-border)'}
                  title="Upload Additional Image"
                >
                  <span style={{ fontSize: '24px', lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Add Image</span>
                </div>
                <input
                  type="file"
                  id="var-other-img-file"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleOtherImageUpload}
                  multiple
                />
              </div>
            </div>

            {/* SEO & META TAG DETAILS */}
            <div style={{ marginTop: '12px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', margin: '0 0 12px 0' }}>SEO & Meta Tag Details</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="cp-field">
                    <span className="cp-field-label-text">Variant SEO Meta Title</span>
                    <input
                      type="text"
                      className="cp-input"
                      value={variantSeoTitle}
                      onChange={(e) => setVariantSeoTitle(e.target.value)}
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
                      className="cp-textarea"
                      value={variantSeoDesc}
                      onChange={(e) => setVariantSeoDesc(e.target.value)}
                      rows={3}
                      placeholder="Snippet description for search engines"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              background: '#FFFFFF',
              padding: '16px 0 8px 0',
              borderTop: '1px solid var(--cp-border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              zIndex: 10,
              marginTop: '16px',
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.03)'
            }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => navigate('/app/products?tab=variants')}
                disabled={submitting}
                style={{ minHeight: '44px', width: '120px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cp-btn cp-btn-primary"
                disabled={submitting || isLocked}
                style={{ minHeight: '44px', width: '200px', fontWeight: '600' }}
              >
                {submitting ? 'Saving Variant…' : editId ? 'Update Variant' : 'Create Variant'}
              </button>
            </div>

          </form>
        </section>

        {/* RIGHT PANEL: LIVE WEBSITE PRODUCT PREVIEW */}
        {showLivePreview && (
          <div style={{ flex: '1 1 50%', minWidth: 0, maxHeight: 'calc(100vh - 165px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="cp-card cp-card-pad" style={{ background: 'var(--bg, #F8FAFC)', border: '1px solid var(--border, #DCE5F0)', display: 'flex', flexDirection: 'column', color: '#1E293B', fontFamily: "'Inter', sans-serif" }}>
              
              <style>{`
                ::-webkit-scrollbar {
                  width: 5px !important;
                  height: 5px !important;
                }
                ::-webkit-scrollbar-track {
                  background: #F1F5F9 !important;
                  border-radius: 4px !important;
                }
                ::-webkit-scrollbar-thumb {
                  background: #CBD5E1 !important;
                  border-radius: 4px !important;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: #003E7E !important;
                }
                * {
                  scrollbar-width: thin !important;
                  scrollbar-color: #CBD5E1 #F1F5F9 !important;
                }

                .taiton-preview-wrap {
                  --primary: #003E7E;
                  --secondary: #0D63C9;
                  --accent: #4FA3FF;
                  --bg: #F8FAFC;
                  --light-section: #EEF6FF;
                  --border: #DCE5F0;
                  --text-1: #0D63C9;
                  --text-2: #1E293B;
                  --text-secondary: #475569;
                  font-family: 'Inter', sans-serif;
                  color: var(--text-2);
                  background: var(--bg);
                }
                .taiton-preview-wrap h1, .taiton-preview-wrap h2, .taiton-preview-wrap h3, .taiton-preview-wrap h4 {
                  font-family: 'Poppins', sans-serif;
                }
                .taiton-preview-wrap a { text-decoration: none; }
                .taiton-preview-wrap .text-primary-custom { color: var(--primary) !important; }
                .taiton-preview-wrap .text-secondary-custom { color: var(--secondary) !important; }
                .taiton-preview-wrap .text-muted-custom { color: var(--text-secondary) !important; }
                .taiton-preview-wrap .btn-primary-custom { background: var(--primary); color: #fff; border: 1px solid var(--primary); padding: .65rem 1.5rem; border-radius: 6px; font-weight: 600; font-size: .9rem; }
                .taiton-preview-wrap .btn-outline-custom { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); padding: .6rem 1.4rem; border-radius: 6px; font-weight: 600; font-size: .9rem; }
                .taiton-preview-wrap .eyebrow { color: var(--secondary); font-weight: 700; font-size: .78rem; letter-spacing: 1.5px; text-transform: uppercase; display: inline-block; margin-bottom: .6rem; }
                .taiton-preview-wrap .section-title { font-weight: 700; color: var(--text-2); }
                .taiton-preview-wrap .placeholder-img {
                  background: repeating-linear-gradient(135deg, var(--light-section), var(--light-section) 10px, #e3edfb 10px, #e3edfb 20px);
                  border: 1px dashed var(--accent); color: var(--secondary);
                  display: flex; flex-direction: column; align-items: center; justify-content: center;
                  border-radius: 10px; width: 100%; height: 100%; min-height: 150px; text-align: center; font-size: .8rem; font-weight: 600; gap: .4rem; padding: 1rem;
                }
                .taiton-preview-wrap .breadcrumb-bar { font-size: .85rem; color: var(--text-secondary); padding: .9rem 0; }
                .taiton-preview-wrap .breadcrumb-bar .active { color: var(--primary); font-weight: 700; }
                .taiton-preview-wrap .thumb { width: 78px; height: 78px; border: 2px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; }
                .taiton-preview-wrap .thumb.active { border-color: var(--secondary); }
                .taiton-preview-wrap .main-image { border: 1px solid var(--border); border-radius: 12px; min-height: 380px; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; }
                .taiton-preview-wrap .pd-table { width: 100%; font-size: .82rem; margin: 0; border-collapse: collapse; }
                .taiton-preview-wrap .pd-table thead th { background: var(--primary); color: #fff; font-weight: 600; padding: .6rem .8rem; white-space: nowrap; text-align: left; }
                .taiton-preview-wrap .pd-table tbody td { padding: .55rem .8rem; border-bottom: 1px solid var(--border); color: var(--text-2); }
                .taiton-preview-wrap .pd-table tbody tr:nth-child(even) { background: var(--light-section); }
                .taiton-preview-wrap .accordion-row { border-bottom: 1px solid var(--border); }
                .taiton-preview-wrap .accordion-row .acc-toggle { display: flex; justify-content: space-between; align-items: center; padding: .9rem .2rem; cursor: pointer; font-weight: 700; font-size: .9rem; color: var(--text-2); }
                .taiton-preview-wrap .accordion-row .acc-toggle .icon-plus { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: .8rem; color: var(--primary); }
                .taiton-preview-wrap .accordion-row .acc-body { padding: 0 .2rem 1rem; font-size: .85rem; color: var(--text-secondary); }
              `}</style>

              {/* Header bar of preview */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCE5F0', paddingBottom: '10px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 className="cp-section-title" style={{ margin: 0, color: '#003E7E', fontFamily: "'Poppins', sans-serif" }}>Live Website Product Preview</h3>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Viewport Device Simulation Controls */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)' }}>
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
                        boxShadow: previewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      title="Mobile View (375px)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                        <path d="M12 18h.01"></path>
                      </svg>
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
                        boxShadow: previewDevice === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      title="Tablet View (768px)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="3" ry="3"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      </svg>
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
                        boxShadow: previewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      title="Desktop View (Full)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                      Desktop
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="cp-btn"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      disabled={zoom <= 0.5}
                      title="Zoom Out"
                      style={{ minWidth: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #DCE5F0', background: '#fff', color: '#003E7E', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      —
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '38px', textAlign: 'center', color: '#1E293B' }}>{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      className="cp-btn"
                      onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
                      disabled={zoom >= 2.0}
                      title="Zoom In"
                      style={{ minWidth: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #DCE5F0', background: '#fff', color: '#003E7E', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="cp-btn"
                      onClick={() => setZoom(1.0)}
                      style={{ padding: '2px 8px', fontSize: '11px', minHeight: 'auto', height: '28px', borderRadius: '4px', border: '1px solid #DCE5F0', background: '#fff', color: '#003E7E', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Container with Product Detail HTML Template Layout */}
              <div style={{ overflow: 'auto', flex: 1, padding: '4px', background: previewDevice !== 'desktop' ? '#CBD5E1' : 'transparent', borderRadius: '12px' }}>
                <div
                  className="taiton-preview-wrap"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    transition: 'all 0.25s ease-out',
                    width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : zoom > 1 ? `${100 / zoom}%` : '100%',
                    margin: '0 auto',
                    padding: '12px',
                    background: 'var(--bg)',
                    borderRadius: previewDevice !== 'desktop' ? '16px' : '0',
                    border: previewDevice !== 'desktop' ? '4px solid #003E7E' : 'none',
                    boxShadow: previewDevice !== 'desktop' ? '0 12px 30px rgba(0,0,0,0.25)' : 'none'
                  }}
                >
                  
                  {/* BREADCRUMB */}
                  <div className="breadcrumb-bar">
                    <span style={{ cursor: 'pointer' }}>Products</span> &gt;{' '}
                    <span style={{ cursor: 'pointer' }}>{getCategoryName(parentCatId)}</span> &gt;{' '}
                    <span style={{ cursor: 'pointer' }}>{getSubCategoryName(parentSubCatId)}</span> &gt;{' '}
                    <span className="active">{variantName || variantTitle || parentTitle}</span>
                  </div>

                  {/* PRODUCT DETAIL SECTION */}
                  <section className="pb-3">
                    <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '24px' }}>
                      {/* GALLERY */}
                      <div>
                        <div style={{ display: 'flex', gap: '16px', flexDirection: previewDevice === 'mobile' ? 'column-reverse' : 'row' }}>
                          <div style={{ display: 'flex', flexDirection: previewDevice === 'mobile' ? 'row' : 'column', gap: '8px', overflowX: 'auto' }}>
                            {[imageUrl, ...otherImages].filter(Boolean).slice(0, 4).map((img, idx) => (
                              <div
                                key={idx}
                                className={`thumb ${(activePreviewImage || imageUrl) === img ? 'active' : ''}`}
                                onClick={() => setActivePreviewImage(img)}
                              >
                                <img src={resolveImageUrl(img)} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                            {(!imageUrl && otherImages.length === 0) && (
                              <>
                                <div className="thumb active"><div className="placeholder-img">📷</div></div>
                                <div className="thumb"><div className="placeholder-img">📷</div></div>
                              </>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="main-image">
                              {(() => {
                                const activeSwatch = variantSwatches.find(s => s.isCurrent);
                                const displayImg = activePreviewImage || imageUrl || activeSwatch?.img || otherImages[0] || parentPayload.product_image || parentPayload.primary_img;
                                return displayImg ? (
                                  <img src={resolveImageUrl(displayImg)} alt="Main Display" style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }} />
                                ) : (
                                  <div className="placeholder-img">
                                    <div style={{ fontSize: '2rem' }}>📷</div>
                                    <div>{variantName || parentTitle}</div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* VARIANT INFO */}
                      <div>
                        <div>
                          {parentPayload.brand && (
                            <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#0D63C9', marginBottom: '4px' }}>
                              {parentPayload.brand}
                            </div>
                          )}
                          <h1 className="fw-bold text-primary-custom" style={{ fontSize: previewDevice === 'mobile' ? '1.5rem' : '2.2rem', margin: 0 }}>
                            {variantTitle || variantName || parentTitle}
                          </h1>
                          <p className="text-muted-custom mb-0">
                            {variantCode ? `Code: ${variantCode}` : sku ? `SKU: ${sku}` : ''}
                            {(variantCode || sku) && activeColor ? ' | ' : ''}
                            {activeColor ? `Finish: ${activeColor}` : (parentPayload.productCode ? `Code: ${parentPayload.productCode}` : '')}
                          </p>
                        </div>

                        {/* AVAILABLE FINISHES / VARIANTS WITH IMAGE SWATCHES */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', marginBottom: '12px' }}>
                          <h6 className="fw-bold mb-0" style={{ fontSize: '14px', color: '#1E293B' }}>
                            Available Finishes / Variants
                          </h6>
                          {activeColor && (
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#0D63C9' }}>
                              Selected: {activeColor}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          {variantSwatches.map((swatch, idx) => (
                            <div
                              key={idx}
                              style={{ textAlign: 'center', cursor: 'pointer' }}
                              onClick={() => {
                                setColorFinish(swatch.name);
                                if (!imageUrl && swatch.img) {
                                  setActivePreviewImage(swatch.img);
                                }
                              }}
                              title={`Select finish: ${swatch.finish}`}
                            >
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '50%',
                                  border: swatch.isCurrent ? '2.5px solid #0D63C9' : '2px solid #E2E8F0',
                                  outline: swatch.isCurrent ? '2px solid #0D63C9' : 'none',
                                  outlineOffset: '2px',
                                  overflow: 'hidden',
                                  background: swatch.hex || '#F1F5F9',
                                  margin: '0 auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: swatch.isCurrent ? '0 2px 8px rgba(13, 99, 201, 0.35)' : 'none',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {swatch.img ? (
                                  <img src={resolveImageUrl(swatch.img)} alt={swatch.finish} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : swatch.hex ? (
                                  <div style={{ width: '100%', height: '100%', background: swatch.hex }} />
                                ) : (
                                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#003E7E' }}>
                                    {String(swatch.finish).slice(0, 3).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div style={{
                                marginTop: '6px',
                                fontSize: '11px',
                                fontWeight: swatch.isCurrent ? '700' : '500',
                                color: swatch.isCurrent ? '#003E7E' : '#64748B',
                                maxWidth: '64px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {swatch.finish}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* DESCRIPTION / SEO DESCRIPTION SIMULATION */}
                        {(variantSeoDesc || parentPayload.productDescription || parentPayload.seo_meta_description) ? (
                          <p className="text-muted-custom mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
                            {variantSeoDesc || parentPayload.productDescription || parentPayload.seo_meta_description}
                          </p>
                        ) : null}

                        {/* PRICE & DISCOUNT DISPLAY */}
                        {(price || parentPayload.price) ? (
                          <div style={{ margin: '14px 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '700' }}>MRP :</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#003E7E' }}>
                              ₹{price || parentPayload.price}
                            </span>
                            {(discount || parentPayload.discount) ? (
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                                {discount || parentPayload.discount}% OFF
                              </span>
                            ) : null}
                            <span style={{ fontSize: '12px', color: '#64748B' }}>|</span>
                            <span style={{ fontSize: '12px', color: '#0D63C9', fontWeight: '600' }}>
                              Log In to See Price
                            </span>
                          </div>
                        ) : null}

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                          <button className="btn btn-outline-custom" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Add to Cart
                          </button>
                          <button className="btn btn-primary-custom" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Get a Quote
                          </button>
                        </div>

                        {/* ACCORDION ROWS INHERITED FROM PARENT PRODUCT */}
                        <div className="accordion-row">
                          <div className="acc-toggle">
                            Features <span className="icon-plus">+</span>
                          </div>
                          <div className="acc-body">
                            {parentFeatures?.type === 'points' && parentFeatures?.data?.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                {parentFeatures.data.map((pt, i) => <li key={i}>{pt}</li>)}
                              </ul>
                            ) : parentFeatures?.type === 'table' && parentFeatures?.data?.headers?.length > 0 ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table className="pd-table" style={{ margin: '4px 0' }}>
                                  <thead>
                                    <tr>{parentFeatures.data.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {parentFeatures.data.rows.map((r, rIdx) => (
                                      <tr key={rIdx}>{parentFeatures.data.headers.map((_, cIdx) => <td key={cIdx}>{r[cIdx] || '—'}</td>)}</tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : parentFeatures?.type === 'key_values' && parentFeatures?.data?.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {parentFeatures.data.map((kv, i) => (
                                  <div key={i}><strong>{kv.key}:</strong> {kv.value}</div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.7 }}>No product features inherited from parent product.</span>
                            )}
                          </div>
                        </div>

                        <div className="accordion-row">
                          <div className="acc-toggle">
                            Technical Specifications <span className="icon-plus">+</span>
                          </div>
                          <div className="acc-body">
                            {parentSpecs?.type === 'points' && parentSpecs?.data?.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                {parentSpecs.data.map((sp, i) => <li key={i}>{sp}</li>)}
                              </ul>
                            ) : parentSpecs?.type === 'table' && parentSpecs?.data?.headers?.length > 0 ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table className="pd-table" style={{ margin: '4px 0' }}>
                                  <thead>
                                    <tr>{parentSpecs.data.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {parentSpecs.data.rows.map((r, rIdx) => (
                                      <tr key={rIdx}>{parentSpecs.data.headers.map((_, cIdx) => <td key={cIdx}>{r[cIdx] || '—'}</td>)}</tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : parentSpecs?.type === 'key_values' && parentSpecs?.data?.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {parentSpecs.data.map((kv, i) => (
                                  <div key={i}><strong>{kv.key}:</strong> {kv.value}</div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.7 }}>No technical specifications inherited from parent product.</span>
                            )}
                          </div>
                        </div>

                        {parentAddl?.data?.length > 0 && (
                          <div className="accordion-row">
                            <div className="acc-toggle">
                              {parentAddl?.title || 'Additional Features'} <span className="icon-plus">+</span>
                            </div>
                            <div className="acc-body">
                              {parentAddl?.type === 'points' ? (
                                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                  {parentAddl.data.map((ap, i) => <li key={i}>{ap}</li>)}
                                </ul>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  {parentAddl.data.map((kv, i) => (
                                    <div key={i}><strong>{kv.key}:</strong> {kv.value}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
