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
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

export function CreateProductPage() {
  const { token, setSidebarCollapsed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [zoom, setZoom] = useState(1.0);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // Form inputs
  const [catId, setCatId] = useState(searchParams.get('cat_id') || '');
  const [subCatId, setSubCatId] = useState(searchParams.get('sub_cat_id') || '');
  const [subSubCatId, setSubSubCatId] = useState(searchParams.get('sub_sub_cat_id') || '');
  const [prdId, setPrdId] = useState('');
  const [isIdEditedManually, setIsIdEditedManually] = useState(false);
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [url, setUrl] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [errors, setErrors] = useState({});

  // SEO & OG fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');

  // Product Image, Variants & Kits State
  const [productImage, setProductImage] = useState('');
  const [otherImages, setOtherImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [hasVariants, setHasVariants] = useState('no');
  const [variants, setVariants] = useState([{ variantId: '', variantName: '', variantDisplay: '' }]);
  const [hasKits, setHasKits] = useState('no');
  const [kits, setKits] = useState([{ kitId: `kit_${Date.now()}_0`, kitName: '', kitDisplay: '' }]);

  // Brand & Commons Colors State
  const [brand, setBrand] = useState('');
  const [chosenColours, setChosenColours] = useState([]);
  const [defaultColour, setDefaultColour] = useState('');
  const [commonsColors, setCommonsColors] = useState([]);
  const [commonsKits, setCommonsKits] = useState([]);
  const [commonsBrands, setCommonsBrands] = useState([]);

  // Quick Add Brand State
  const [showQuickAddBrand, setShowQuickAddBrand] = useState(false);
  const [quickBrandName, setQuickBrandName] = useState('');
  const [quickBrandDesc, setQuickBrandDesc] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);

  // Quick Add Colour State
  const [showQuickAddColor, setShowQuickAddColor] = useState(false);
  const [quickColorName, setQuickColorName] = useState('');
  const [quickColorImage, setQuickColorImage] = useState('');
  const [quickColorHex, setQuickColorHex] = useState('');
  const [uploadingColorImg, setUploadingColorImg] = useState(false);

  // Quick Add Kit State
  const [showQuickAddKit, setShowQuickAddKit] = useState(false);
  const [quickKitName, setQuickKitName] = useState('');
  const [quickKitImage, setQuickKitImage] = useState('');
  const [quickKitDesc, setQuickKitDesc] = useState('');
  const [uploadingKitImg, setUploadingKitImg] = useState(false);

  // Dynamic Specs & Features
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [specsType, setSpecsType] = useState('key_values'); // 'points' | 'table' | 'key_values'
  const [specsPoints, setSpecsPoints] = useState(['']);
  const [specsKeyValues, setSpecsKeyValues] = useState([{ key: '', value: '' }]);
  const [specsTable, setSpecsTable] = useState({
    headers: [''],
    rowHeaders: [''],
    rows: [['']]
  });
  const [specsTableHeaderPos, setSpecsTableHeaderPos] = useState('top'); // 'top' | 'left' | 'both'
  const [features, setFeatures] = useState(['']);
  const [featuresType, setFeaturesType] = useState('points'); // 'points' | 'table' | 'key_values'
  const [featuresPoints, setFeaturesPoints] = useState(['']);
  const [featuresKeyValues, setFeaturesKeyValues] = useState([{ key: '', value: '' }]);
  const [featuresTable, setFeaturesTable] = useState({
    headers: [''],
    rowHeaders: [''],
    rows: [['']]
  });
  const [tableHeaderPos, setTableHeaderPos] = useState('top'); // 'top' | 'left' | 'both'

  // Dynamic Additional Section (Editable Title Label)
  const [addlTitle, setAddlTitle] = useState('Additional Features');
  const [addlType, setAddlType] = useState('points');
  const [addlPoints, setAddlPoints] = useState(['']);
  const [addlKeyValues, setAddlKeyValues] = useState([{ key: '', value: '' }]);
  const [robot, setRobot] = useState('index, follow');
  const [acces, setAcces] = useState('');
  const [relatedPdts, setRelatedPdts] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const addAddlPoint = () => setAddlPoints([...addlPoints, '']);
  const removeAddlPoint = (idx) => setAddlPoints(addlPoints.filter((_, i) => i !== idx));
  const updateAddlPoint = (idx, val) => {
    const next = [...addlPoints];
    next[idx] = val;
    setAddlPoints(next);
  };

  const addAddlKeyValue = () => setAddlKeyValues([...addlKeyValues, { key: '', value: '' }]);
  const removeAddlKeyValue = (idx) => setAddlKeyValues(addlKeyValues.filter((_, i) => i !== idx));
  const updateAddlKeyValue = (idx, field, val) => {
    const next = [...addlKeyValues];
    next[idx][field] = val;
    setAddlKeyValues(next);
  };

  const slugify = (text) => {
    return 'prd-' + String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setProductName(val);
    if (!isIdEditedManually) {
      setPrdId(slugify(val));
    }
  };

  const handleIdChange = (e) => {
    setPrdId(e.target.value);
    setIsIdEditedManually(true);
  };

  const addVariantRow = () => setVariants([...variants, { variantId: '', variantName: '', variantDisplay: '' }]);
  const removeVariantRow = (idx) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariantRow = (idx, field, value) => {
    const updated = [...variants];
    updated[idx][field] = value;
    setVariants(updated);
  };

  const addKitRow = () => setKits([...kits, { kitId: `kit_${Date.now()}_${kits.length}`, kitName: '', kitDisplay: '' }]);
  const removeKitRow = (idx) => setKits(kits.filter((_, i) => i !== idx));
  const updateKitRow = (idx, field, value) => {
    const updated = [...kits];
    updated[idx][field] = value;
    setKits(updated);
  };
  const handleKitSelect = (idx, selectedKitName) => {
    const updated = [...kits];
    updated[idx].kitName = selectedKitName;
    const found = commonsKits.find(k => k.name === selectedKitName);
    if (found && found.image_url) {
      updated[idx].kitDisplay = found.image_url;
    }
    setKits(updated);
  };

  const handleQuickAddBrand = async () => {
    if (!quickBrandName.trim()) return notify.formWarning('Brand name is required');
    setSavingBrand(true);
    try {
      const res = await enterpriseApi.createCommonsBrand(token, {
        name: quickBrandName.trim(),
        description: quickBrandDesc.trim() || null
      });
      const newBrand = res.data || { id: res.id, name: quickBrandName.trim(), description: quickBrandDesc.trim() || null };
      setCommonsBrands(prev => [...prev, newBrand]);
      setBrand(newBrand.name);
      setQuickBrandName('');
      setQuickBrandDesc('');
      setShowQuickAddBrand(false);
      notify.success('Added', `Brand "${newBrand.name}" added to Commons and selected.`);
    } catch (err) {
      notify.apiError(err, 'Failed to add brand to Commons');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleQuickAddColor = async () => {
    if (!quickColorName.trim()) return notify.formWarning('Colour name is required');
    try {
      const res = await enterpriseApi.createCommonsColor(token, {
        name: quickColorName.trim(),
        image_url: quickColorImage.trim() || null,
        hex_code: quickColorHex.trim() || null
      });
      const newColor = res.data || { id: res.id, name: quickColorName.trim(), image_url: quickColorImage.trim() || null, hex_code: quickColorHex.trim() || null };
      setCommonsColors(prev => [...prev, newColor]);
      if (!chosenColours.includes(quickColorName.trim())) {
        setChosenColours(prev => [...prev, quickColorName.trim()]);
      }
      if (!defaultColour) setDefaultColour(quickColorName.trim());
      setQuickColorName('');
      setQuickColorImage('');
      setQuickColorHex('');
      setShowQuickAddColor(false);
      notify.success('Added', `Colour "${newColor.name}" added to Commons and selected.`);
    } catch (err) {
      notify.apiError(err, 'Failed to add colour to Commons');
    }
  };

  const handleQuickAddKit = async () => {
    if (!quickKitName.trim()) return notify.formWarning('Kit name is required');
    try {
      const res = await enterpriseApi.createCommonsKit(token, {
        name: quickKitName.trim(),
        image_url: quickKitImage.trim() || null,
        description: quickKitDesc.trim() || null
      });
      const newKit = res.data || { id: res.id, name: quickKitName.trim(), image_url: quickKitImage.trim() || null, description: quickKitDesc.trim() || null };
      setCommonsKits(prev => [...prev, newKit]);
      setKits(prev => [...prev, {
        kitId: `kit_${Date.now()}_${prev.length}`,
        kitName: newKit.name,
        kitDisplay: newKit.image_url || ''
      }]);
      setQuickKitName('');
      setQuickKitImage('');
      setQuickKitDesc('');
      setShowQuickAddKit(false);
      notify.success('Added', `Kit "${newKit.name}" added to Commons.`);
    } catch (err) {
      notify.apiError(err, 'Failed to add kit to Commons');
    }
  };

  const handleUpdateKitDisplayImage = async (idx, file) => {
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      const newUrl = res.url;
      updateKitRow(idx, 'kitDisplay', newUrl);
      const currentName = kits[idx]?.kitName;
      const found = commonsKits.find(k => k.name === currentName);
      if (found && found.id) {
        await enterpriseApi.updateCommonsKit(token, found.id, {
          name: found.name,
          image_url: newUrl,
          description: found.description
        });
        setCommonsKits(prev => prev.map(k => k.id === found.id ? { ...k, image_url: newUrl } : k));
        notify.success('Updated', 'Kit display image updated in Commons and Product!');
      } else {
        notify.success('Uploaded', 'Kit display image uploaded!');
      }
    } catch (err) {
      notify.apiError(err, 'Failed to upload kit image');
    }
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setProductImage(res.url);
      notify.success('Uploaded', 'Product image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Product image upload failed');
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

  const [allProductsList, setAllProductsList] = useState([]);

  const getProductDetails = (identifier) => {
    if (!identifier) return null;
    const cleanId = String(identifier).trim();
    const found = allProductsList.find((p) => {
      const prdId = p.payload?.prd_id || String(p.id);
      const pCode = p.payload?.productCode || p.payload?.pdt_code;
      return prdId === cleanId || String(p.id) === cleanId || pCode === cleanId;
    });

    if (found) {
      const payload = found.payload || {};
      const imgUrl = payload.product_image || payload.primary_img || payload.img || (payload.other_images && payload.other_images[0]) || found.primary_img || found.img || '';
      return {
        title: found.title || payload.product || payload.name || cleanId,
        code: payload.productCode || payload.pdt_code || payload.prd_id || 'Hardware Fitting',
        img: imgUrl
      };
    }
    return {
      title: cleanId,
      code: 'Hardware Item',
      img: ''
    };
  };

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

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      setLoading(true);
      try {
        const [catRes, subRes, pdtRes, colRes, kitRes, brandRes] = await Promise.all([
          enterpriseApi.contentList(token, 'category', { limit: 100 }),
          enterpriseApi.contentList(token, 'subcategory', { limit: 100 }),
          enterpriseApi.contentList(token, 'product', { limit: 200, status: 'any' }),
          enterpriseApi.getCommonsColors(token).catch(() => ({ data: [] })),
          enterpriseApi.getCommonsKits(token).catch(() => ({ data: [] })),
          enterpriseApi.getCommonsBrands(token).catch(() => ({ data: [] }))
        ]);
        setCategories(catRes.items ?? []);
        setSubcategories(subRes.items ?? []);
        setAllProductsList(pdtRes.items ?? []);
        setCommonsColors(colRes.data ?? []);
        setCommonsKits(kitRes.data ?? []);
        setCommonsBrands(brandRes.data ?? []);
      } catch (err) {
        notify.apiError(err, 'Failed to load filters');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  useEffect(() => {
    if (editId && token) {
      const loadProductDetails = async () => {
        try {
          const res = await enterpriseApi.contentDetail(token, 'product', editId);
          const productItem = res.item;
          if (productItem) {
            if (productItem.status === 'pending_approval') {
              setIsLocked(true);
            }
            const p = productItem.payload || {};
            setPrdId(p.prd_id || '');
            setProductName(productItem.title || '');
            setProductCode(p.productCode || '');
            setPrice(p.price !== undefined && p.price !== null ? String(p.price) : (item.price ? String(item.price) : ''));
            setDiscount(p.discount !== undefined && p.discount !== null ? String(p.discount) : '');
            setCatId(p.cat_id || '');
            setSubCatId(p.sub_cat_id || '');
            setUrl(p.url || '');
            setCanonicalUrl(p.canonical_url || '');
            setSeoTitle(p.seo_meta_title || '');
            setSeoDesc(p.seo_meta_description || '');
            setFocusKeyword(p.focus_keyword || '');
            setSecondaryKeywords(p.secondary_keywords || '');
            setOgTitle(p.og_title || '');
            setOgDesc(p.og_description || '');
            setOgImage(p.og_image || '');
            setProductImage(p.product_image || '');
            setOtherImages(Array.isArray(p.other_images) ? p.other_images : []);
            setHasVariants(p.has_variants || 'no');
            setHasKits(p.has_kits || 'no');
            if (p.product_features) {
              const pf = p.product_features;
              if (pf && typeof pf === 'object' && pf.type) {
                setFeaturesType(pf.type);
                if (pf.type === 'points') {
                  setFeaturesPoints(Array.isArray(pf.data) ? pf.data : ['']);
                } else if (pf.type === 'key_values') {
                  setFeaturesKeyValues(Array.isArray(pf.data) ? pf.data : [{ key: '', value: '' }]);
                } else if (pf.type === 'table') {
                  setFeaturesTable({
                    headers: pf.data?.headers || [''],
                    rowHeaders: pf.data?.rowHeaders || [''],
                    rows: pf.data?.rows || [['']]
                  });
                  setTableHeaderPos(pf.headerPos || 'top');
                }
              } else if (Array.isArray(pf)) {
                setFeaturesType('points');
                setFeaturesPoints(pf.length > 0 ? pf : ['']);
                setFeatures(pf.length > 0 ? pf : ['']);
              }
            }
            if (p.product_specifications) {
              const ps = p.product_specifications;
              if (ps && typeof ps === 'object' && ps.type) {
                setSpecsType(ps.type);
                if (ps.type === 'points') {
                  setSpecsPoints(Array.isArray(ps.data) ? ps.data : ['']);
                } else if (ps.type === 'key_values') {
                  setSpecsKeyValues(Array.isArray(ps.data) ? ps.data : [{ key: '', value: '' }]);
                } else if (ps.type === 'table') {
                  setSpecsTable({
                    headers: ps.data?.headers || [''],
                    rowHeaders: ps.data?.rowHeaders || [''],
                    rows: ps.data?.rows || [['']]
                  });
                  setSpecsTableHeaderPos(ps.headerPos || 'top');
                }
              } else if (typeof ps === 'object') {
                setSpecsType('key_values');
                const specList = Object.entries(ps).map(([key, value]) => ({ key, value }));
                setSpecsKeyValues(specList.length > 0 ? specList : [{ key: '', value: '' }]);
              }
            }
            setBrand(p.brand || '');
            setDefaultColour(p.default_colour || '');
            const rawColours = Array.isArray(p.colours) ? p.colours : (typeof p.colours === 'string' ? (() => { try { return JSON.parse(p.colours); } catch { return []; } })() : []);
            setChosenColours(rawColours);
            if (Array.isArray(p.variants)) {
              setVariants(p.variants.length > 0 ? p.variants : [{ variantId: '', variantName: '', variantDisplay: '' }]);
            }
            if (Array.isArray(p.kits)) {
              setKits(p.kits.length > 0 ? p.kits.map((k, idx) => ({
                kitId: k.kitId || `kit_${Date.now()}_${idx}`,
                kitName: k.kitName || k.name || '',
                kitDisplay: k.kitDisplay || k.display_image || k.image_url || ''
              })) : [{ kitId: `kit_${Date.now()}_0`, kitName: '', kitDisplay: '' }]);
            }
            if (p.acces) setAcces(typeof p.acces === 'string' ? p.acces : JSON.stringify(p.acces));
            if (p.related_pdts) setRelatedPdts(typeof p.related_pdts === 'string' ? p.related_pdts : JSON.stringify(p.related_pdts));
            setIsIdEditedManually(true);
          }
        } catch (e) {
          notify.error('Error loading product details', e.message);
        }
      };
      loadProductDetails();
    }
  }, [editId, token]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (catId) {
      setFilteredSubcategories(
        subcategories.filter(
          (s) =>
            String(s.payload?.parent_cat_id) === String(catId) ||
            String(s.payload?.cat_id) === String(catId)
        )
      );
    } else {
      setFilteredSubcategories([]);
    }
  }, [catId, subcategories]);

  const addSpecPoint = () => setSpecsPoints([...specsPoints, '']);
  const removeSpecPoint = (idx) => setSpecsPoints(specsPoints.filter((_, i) => i !== idx));
  const updateSpecPoint = (idx, val) => {
    const updated = [...specsPoints];
    updated[idx] = val;
    setSpecsPoints(updated);
  };

  const addSpecKeyValue = () => setSpecsKeyValues([...specsKeyValues, { key: '', value: '' }]);
  const removeSpecKeyValue = (idx) => setSpecsKeyValues(specsKeyValues.filter((_, i) => i !== idx));
  const updateSpecKeyValue = (idx, field, val) => {
    const updated = [...specsKeyValues];
    updated[idx][field] = val;
    setSpecsKeyValues(updated);
  };

  const addSpecTableHeader = () => {
    setSpecsTable({
      ...specsTable,
      headers: [...specsTable.headers, ''],
      rows: specsTable.rows.map(r => [...r, ''])
    });
  };
  const removeSpecTableHeader = (idx) => {
    const newHeaders = specsTable.headers.filter((_, i) => i !== idx);
    const newRows = specsTable.rows.map(r => r.filter((_, i) => i !== idx));
    setSpecsTable({
      ...specsTable,
      headers: newHeaders,
      rows: newRows
    });
  };
  const updateSpecTableHeader = (idx, val) => {
    const newHeaders = [...specsTable.headers];
    newHeaders[idx] = val;
    setSpecsTable({ ...specsTable, headers: newHeaders });
  };

  const addSpecTableRow = () => {
    const newRow = Array(specsTable.headers.length).fill('');
    setSpecsTable({
      ...specsTable,
      rowHeaders: [...(specsTable.rowHeaders || []), ''],
      rows: [...specsTable.rows, newRow]
    });
  };
  const removeSpecTableRow = (idx) => {
    const newRowHeaders = (specsTable.rowHeaders || []).filter((_, i) => i !== idx);
    const newRows = specsTable.rows.filter((_, i) => i !== idx);
    setSpecsTable({
      ...specsTable,
      rowHeaders: newRowHeaders,
      rows: newRows
    });
  };
  const updateSpecTableRowHeader = (idx, val) => {
    const newRowHeaders = [...(specsTable.rowHeaders || [])];
    newRowHeaders[idx] = val;
    setSpecsTable({ ...specsTable, rowHeaders: newRowHeaders });
  };
  const updateSpecTableCell = (rowIdx, colIdx, val) => {
    const newRows = [...specsTable.rows];
    newRows[rowIdx][colIdx] = val;
    setSpecsTable({ ...specsTable, rows: newRows });
  };

  const addFeaturePoint = () => setFeaturesPoints([...featuresPoints, '']);
  const removeFeaturePoint = (idx) => setFeaturesPoints(featuresPoints.filter((_, i) => i !== idx));
  const updateFeaturePoint = (idx, val) => {
    const updated = [...featuresPoints];
    updated[idx] = val;
    setFeaturesPoints(updated);
  };

  const addFeatureKeyValue = () => setFeaturesKeyValues([...featuresKeyValues, { key: '', value: '' }]);
  const removeFeatureKeyValue = (idx) => setFeaturesKeyValues(featuresKeyValues.filter((_, i) => i !== idx));
  const updateFeatureKeyValue = (idx, field, val) => {
    const updated = [...featuresKeyValues];
    updated[idx][field] = val;
    setFeaturesKeyValues(updated);
  };

  const addFeatureTableHeader = () => {
    setFeaturesTable({
      ...featuresTable,
      headers: [...featuresTable.headers, ''],
      rows: featuresTable.rows.map(r => [...r, ''])
    });
  };
  const removeFeatureTableHeader = (idx) => {
    const newHeaders = featuresTable.headers.filter((_, i) => i !== idx);
    const newRows = featuresTable.rows.map(r => r.filter((_, i) => i !== idx));
    setFeaturesTable({
      ...featuresTable,
      headers: newHeaders,
      rows: newRows
    });
  };
  const updateFeatureTableHeader = (idx, val) => {
    const newHeaders = [...featuresTable.headers];
    newHeaders[idx] = val;
    setFeaturesTable({ ...featuresTable, headers: newHeaders });
  };

  const addFeatureTableRow = () => {
    const newRow = Array(featuresTable.headers.length).fill('');
    setFeaturesTable({
      ...featuresTable,
      rowHeaders: [...(featuresTable.rowHeaders || []), ''],
      rows: [...featuresTable.rows, newRow]
    });
  };
  const removeFeatureTableRow = (idx) => {
    const newRowHeaders = (featuresTable.rowHeaders || []).filter((_, i) => i !== idx);
    const newRows = featuresTable.rows.filter((_, i) => i !== idx);
    setFeaturesTable({
      ...featuresTable,
      rowHeaders: newRowHeaders,
      rows: newRows
    });
  };
  const updateFeatureTableRowHeader = (idx, val) => {
    const newRowHeaders = [...(featuresTable.rowHeaders || [])];
    newRowHeaders[idx] = val;
    setFeaturesTable({ ...featuresTable, rowHeaders: newRowHeaders });
  };
  const updateFeatureTableCell = (rowIdx, colIdx, val) => {
    const newRows = [...featuresTable.rows];
    newRows[rowIdx][colIdx] = val;
    setFeaturesTable({ ...featuresTable, rows: newRows });
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
    if (!catId) newErrors.catId = 'Category is required.';
    if (!subCatId) newErrors.subCatId = 'Sub Category is required.';
    if (!productName.trim()) {
      newErrors.productName = 'Product Name is required.';
    } else if (productName.trim().length > 190) {
      newErrors.productName = 'Product Name must not exceed 190 characters.';
    }
    if (!prdId.trim()) {
      newErrors.prdId = 'Product ID is required.';
    } else if (prdId.trim().length > 64) {
      newErrors.prdId = 'Product ID must not exceed 64 characters.';
    }
    if (productCode.trim().length > 64) {
      newErrors.productCode = 'Product Code must not exceed 64 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.formWarning('Please fix the validation errors.');
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      // Client-side uniqueness check for Product ID
      const prdRes = await enterpriseApi.contentList(token, 'product', { q: prdId.trim() });
      const prds = prdRes.items ?? [];
      const duplicate = prds.find(p =>
        p.payload?.prd_id?.trim().toLowerCase() === prdId.trim().toLowerCase() &&
        String(p.id) !== String(editId || '')
      );
      if (duplicate) {
        const errMsg = `Product ID "${prdId.trim()}" already exists. Please choose a unique ID.`;
        setErrors({ prdId: errMsg });
        notify.formWarning(errMsg);
        setSubmitting(false);
        return;
      }
      // Construct product_features dynamically
      let productFeaturesPayload = null;
      if (featuresType === 'points') {
        productFeaturesPayload = {
          type: 'points',
          data: featuresPoints.filter(p => p.trim())
        };
      } else if (featuresType === 'key_values') {
        productFeaturesPayload = {
          type: 'key_values',
          data: featuresKeyValues.filter(kv => kv.key.trim())
        };
      } else if (featuresType === 'table') {
        productFeaturesPayload = {
          type: 'table',
          headerPos: tableHeaderPos,
          data: {
            headers: featuresTable.headers.filter(h => h.trim()),
            rowHeaders: featuresTable.rowHeaders ? featuresTable.rowHeaders.filter(r => r.trim()) : [],
            rows: featuresTable.rows.map(r => r.map(cell => cell.trim()))
          }
        };
      }

      // Construct product_specifications dynamically
      let productSpecsPayload = null;
      if (specsType === 'points') {
        productSpecsPayload = {
          type: 'points',
          data: specsPoints.filter(p => p.trim())
        };
      } else if (specsType === 'key_values') {
        productSpecsPayload = {
          type: 'key_values',
          data: specsKeyValues.filter(kv => kv.key.trim())
        };
      } else if (specsType === 'table') {
        productSpecsPayload = {
          type: 'table',
          headerPos: specsTableHeaderPos,
          data: {
            headers: specsTable.headers.filter(h => h.trim()),
            rowHeaders: specsTable.rowHeaders ? specsTable.rowHeaders.filter(r => r.trim()) : [],
            rows: specsTable.rows.map(r => r.map(cell => cell.trim()))
          }
        };
      }

      // Construct addl_features dynamically
      let addlFeaturesPayload = null;
      if (addlType === 'points') {
        addlFeaturesPayload = {
          title: addlTitle.trim() || 'Additional Features',
          type: 'points',
          data: addlPoints.filter(p => p.trim())
        };
      } else if (addlType === 'key_values') {
        addlFeaturesPayload = {
          title: addlTitle.trim() || 'Additional Features',
          type: 'key_values',
          data: addlKeyValues.filter(kv => kv.key.trim())
        };
      }

      // Filter variants & kits list
      const filteredVariants = hasVariants === 'yes' ? variants.filter((v) => v.variantId.trim() && v.variantName.trim()) : [];
      const filteredKits = hasKits === 'yes' ? kits.filter((k) => k.kitName && k.kitName.trim()) : [];

      const payload = {
        prd_id: prdId.trim() || slugify(productName),
        cat_id: catId,
        sub_cat_id: subCatId,
        productCode: productCode.trim() || null,
        brand: brand.trim() || null,
        default_colour: defaultColour.trim() || null,
        colours: chosenColours,
        price: price ? Number(price) : 0,
        discount: discount !== '' ? Number(discount) : null,
        url: `/product/${String(productName).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`,
        seo_meta_title: seoTitle.trim() || null,
        seo_meta_description: seoDesc.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        productDescription: seoDesc.trim() || null,
        product_features: productFeaturesPayload,
        product_specifications: productSpecsPayload,
        addl_features: addlFeaturesPayload,
        acces: acces.trim() || null,
        related_pdts: relatedPdts.trim() || null,
        robot: robot,
        product_image: productImage.trim() || null,
        has_variants: hasVariants,
        variants: filteredVariants,
        has_kits: hasKits,
        kits: filteredKits,
        og_title: null,
        og_description: null,
        og_image: null,
        other_images: otherImages,
      };

      const res = editId
        ? await enterpriseApi.contentUpdate(token, 'product', editId, {
          title: productName.trim(),
          summary: seoDesc.trim() || productName.trim(),
          payload,
        })
        : await enterpriseApi.contentCreate(token, 'product', {
          title: productName.trim(),
          summary: seoDesc.trim() || productName.trim(),
          payload,
        });

      notify.success((res.item || res)?.status === 'pending_approval' ? 'Submitted for Approval' : 'Product Saved', (res.item || res)?.message ?? 'Product has been saved.');
      emitUnreadRefresh();

      if (redirectOpt === 'add_variant') {
        navigate(`/app/products/create-variant?product_id=${prdId.trim()}`);
      } else {
        navigate('/app/products?tab=subcategories');
      }
    } catch (err) {
      notify.apiError(err, editId ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  // Map category options for SearchableSelect (Root categories)
  const categoryOptions = categories
    .filter((c) => {
      const pId = Number(c.payload?.parent_id ?? c.parent_id ?? 0);
      const cType = String(c.payload?.type ?? c.type ?? 'cat').toLowerCase();
      return pId === 0 || cType === 'cat' || cType === 'category';
    })
    .map((c) => ({
      value: c.id,
      label: c.title || c.payload?.category_name || `Category #${c.id}`,
    }));

  // Map subcategory options for SearchableSelect (Sub categories of selected catId)
  const subcategoryOptions = categories
    .filter((s) => {
      const pId = Number(s.payload?.parent_id ?? s.parent_id ?? 0);
      const sType = String(s.payload?.type ?? s.type ?? '').toLowerCase();
      return pId === Number(catId) && (sType === 'sc' || sType === 'sub category' || (pId > 0 && !s.payload?.parent_parent_id));
    })
    .map((s) => ({
      value: s.id,
      label: s.title || s.payload?.category_name || `Sub Category #${s.id}`,
    }));

  // Map sub subcategory options for SearchableSelect (Sub sub categories of selected subCatId)
  const subSubcategoryOptions = categories
    .filter((s2) => {
      const pId = Number(s2.payload?.parent_id ?? s2.parent_id ?? 0);
      const sType = String(s2.payload?.type ?? s2.type ?? '').toLowerCase();
      return pId === Number(subCatId) && (sType === 's2c' || sType === 'sub sub category' || (pId > 0 && s2.payload?.parent_parent_id > 0));
    })
    .map((s2) => ({
      value: s2.id,
      label: s2.title || s2.payload?.category_name || `Sub Sub Category #${s2.id}`,
    }));

  return (
    <div className="cp-stack" style={{ overflow: showLivePreview ? 'hidden' : 'visible' }}>
      <PageBreadcrumb parent="Products" parentUrl="/app/products" current={editId ? "Edit Product" : "Create Product"} />

      <div className="cp-page-head" style={{ marginBottom: '12px' }}>
        <div>
          <h1 className="cp-page-title">{editId ? "Edit Product" : "Add Product"}</h1>
          <p className="cp-muted">Configure product specifications, parent categories and SEO rules.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
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
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', width: '100%', alignItems: 'flex-start' }}>
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <strong>Record Locked:</strong> This product is currently pending approval by a checker. Edits are disabled until reviewed.
                </div>
              </div>
            )}

            <div className="row g-3" style={{ marginBottom: '12px' }}>
              <div className={`col-12 ${subSubcategoryOptions.length > 0 ? 'col-md-3' : 'col-md-4'}`}>
                <label className="cp-field" style={{ margin: 0 }}>
                  <span className="cp-field-label-text">Category <span className="cp-req">*</span></span>
                  <SearchableSelect
                    options={categoryOptions}
                    value={catId}
                    onChange={(val) => {
                      setCatId(val);
                      setSubCatId('');
                      setSubSubCatId('');
                    }}
                    placeholder={loading ? 'Loading categories…' : '-- Search & Select Category --'}
                    disabled={loading}
                  />
                  {errors.catId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.catId}</span>}
                </label>
              </div>

              <div className={`col-12 ${subSubcategoryOptions.length > 0 ? 'col-md-3' : 'col-md-4'}`}>
                <label className="cp-field" style={{ margin: 0 }}>
                  <span className="cp-field-label-text">Sub Category <span className="cp-req">*</span></span>
                  <SearchableSelect
                    options={subcategoryOptions}
                    value={subCatId}
                    onChange={(val) => {
                      setSubCatId(val);
                      setSubSubCatId('');
                    }}
                    placeholder={!catId ? '-- Select Category First --' : '-- Search & Select Sub Category --'}
                    disabled={loading || !catId}
                  />
                  {errors.subCatId && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.subCatId}</span>}
                </label>
              </div>

              {subSubcategoryOptions.length > 0 && (
                <div className="col-12 col-md-3">
                  <label className="cp-field" style={{ margin: 0 }}>
                    <span className="cp-field-label-text">Sub Sub Category</span>
                    <SearchableSelect
                      options={subSubcategoryOptions}
                      value={subSubCatId}
                      onChange={(val) => setSubSubCatId(val)}
                      placeholder={!subCatId ? '-- Select Sub Category First --' : '-- Search & Select Sub Sub Category --'}
                      disabled={loading || !subCatId}
                    />
                  </label>
                </div>
              )}

              <div className={`col-12 ${subSubcategoryOptions.length > 0 ? 'col-md-3' : 'col-md-4'}`}>
                <label className="cp-field" style={{ margin: 0 }}>
                  <span className="cp-field-label-text">Product Name <span className="cp-req">*</span></span>
                  <input
                    type="text"
                    className="cp-input"
                    value={productName}
                    onChange={handleNameChange}
                    placeholder="e.g. Premium Brass Hinges 4-inch"
                    maxLength={190}
                    required
                  />
                  {errors.productName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.productName}</span>}
                </label>
              </div>
            </div>

            <div className="row g-3" style={{ marginBottom: '12px' }}>
              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Product Code</span>
                  <input
                    type="text"
                    className="cp-input"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="e.g. TA-HINGE-01"
                    maxLength={64}
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <div className="cp-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="cp-field-label-text">Product Brand</span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddBrand(!showQuickAddBrand)}
                      style={{ border: 'none', background: 'transparent', color: '#0D63C9', fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                    >
                      {showQuickAddBrand ? '✕ Cancel' : '+ Add Brand'}
                    </button>
                  </div>
                  <select
                    className="cp-select"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">-- Select Brand from Commons --</option>
                    {commonsBrands.map((b) => (
                      <option key={b.id || b.name} value={b.name}>{b.name}</option>
                    ))}
                    {brand && !commonsBrands.some(b => b.name === brand) && (
                      <option value={brand}>{brand}</option>
                    )}
                  </select>
                </div>

                {/* Inline Quick Add Brand Form */}
                {showQuickAddBrand && (
                  <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px dashed #0D63C9', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#003E7E' }}>Add Brand to Commons</div>
                    <input
                      type="text"
                      className="cp-input"
                      placeholder="Brand Name (e.g. Taiton Core)"
                      value={quickBrandName}
                      onChange={(e) => setQuickBrandName(e.target.value)}
                      style={{ fontSize: '12px', height: '36px' }}
                    />
                    <input
                      type="text"
                      className="cp-input"
                      placeholder="Description (Optional)"
                      value={quickBrandDesc}
                      onChange={(e) => setQuickBrandDesc(e.target.value)}
                      style={{ fontSize: '12px', height: '36px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddBrand(false)}
                        className="cp-btn cp-btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px', height: 'auto', minHeight: 'auto' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingBrand}
                        onClick={handleQuickAddBrand}
                        className="cp-btn cp-btn-primary"
                        style={{ fontSize: '11px', padding: '3px 10px', height: 'auto', minHeight: 'auto' }}
                      >
                        {savingBrand ? 'Saving…' : 'Save & Select'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Has Kits?</span>
                  <select
                    className="cp-select"
                    value={hasKits}
                    onChange={(e) => setHasKits(e.target.value)}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Price (₹ / INR)</span>
                  <input
                    type="number"
                    className="cp-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 2450"
                    step="0.01"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <label className="cp-field">
                  <span className="cp-field-label-text">Discount (%)</span>
                  <input
                    type="number"
                    className="cp-input"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 10"
                    step="0.01"
                  />
                </label>
              </div>

              <div className="col-12 col-md-4">
                <div className="cp-field">
                  <span className="cp-field-label-text">Product Main Image</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {productImage && (
                      <img
                        src={resolveImageUrl(productImage)}
                        alt="Product Preview"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="cp-input"
                        style={{ width: '100%', paddingRight: '120px' }}
                        value={productImage ? 'Image Chosen ✓' : ''}
                        readOnly
                        placeholder="Choose image..."
                        onClick={() => document.getElementById('prd-img-file').click()}
                      />
                      <input
                        type="file"
                        id="prd-img-file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleProductImageUpload}
                      />
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={() => document.getElementById('prd-img-file').click()}
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
                    {productImage && (
                      <button
                        type="button"
                        className="cp-btn-icon cp-btn-icon--danger"
                        onClick={() => setProductImage('')}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0 }}
                        title="Remove image"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Colours - normal fields in row */}
              <div className="col-12 col-md-6">
                <div className="cp-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="cp-field-label-text" style={{ margin: 0 }}>
                      Product Colours
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddColor(!showQuickAddColor)}
                      style={{ background: 'none', border: 'none', color: '#0D63C9', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      {showQuickAddColor ? '✕ Cancel' : '+ New Colour to Commons'}
                    </button>
                  </div>

                  {/* Inline Quick Add Colour to Commons Form if opened */}
                  {showQuickAddColor && (
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px dashed #0D63C9', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#003E7E' }}>New Colour to Commons</div>
                      <div className="row g-2">
                        <div className="col-12 col-md-4">
                          <input
                            type="text"
                            className="cp-input"
                            placeholder="Colour Name (e.g. Copper Metallic)"
                            value={quickColorName}
                            onChange={(e) => setQuickColorName(e.target.value)}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <input
                            type="text"
                            className="cp-input"
                            placeholder="Hex Code (e.g. #B87333)"
                            value={quickColorHex}
                            onChange={(e) => setQuickColorHex(e.target.value)}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0 8px', cursor: uploadingColorImg ? 'wait' : 'pointer', fontSize: '12px', margin: 0, height: '38px' }}>
                            <span>{uploadingColorImg ? '...' : quickColorImage ? 'Image ✓' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              disabled={uploadingColorImg}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !token) return;
                                setUploadingColorImg(true);
                                try {
                                  const res = await enterpriseApi.uploadImage(token, file);
                                  setQuickColorImage(res.url);
                                  notify.success('Uploaded', 'Colour image uploaded');
                                } catch (err) {
                                  notify.apiError(err, 'Upload failed');
                                } finally {
                                  setUploadingColorImg(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="col-12 col-md-2">
                          <button
                            type="button"
                            onClick={handleQuickAddColor}
                            className="cp-btn cp-btn-primary"
                            style={{ fontSize: '12px', width: '100%', height: '38px', padding: 0 }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <select
                    className="cp-select"
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !chosenColours.includes(val)) {
                        const next = [...chosenColours, val];
                        setChosenColours(next);
                        if (!defaultColour) setDefaultColour(val);
                      }
                    }}
                    style={{ width: '100%', height: '40px' }}
                  >
                    <option value="">-- Choose Colour from Dropdown to Add --</option>
                    {commonsColors.map((ck) => {
                      const isAdded = chosenColours.includes(ck.name);
                      return (
                        <option key={ck.id || ck.name} value={ck.name} disabled={isAdded}>
                          {ck.name} {isAdded ? '✓ (Already Added)' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {/* Assigned Colour Chips */}
                  {chosenColours.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {chosenColours.map((colName, idx) => {
                        const matched = commonsColors.find(c => c.name?.toLowerCase() === colName.toLowerCase());
                        const isDefault = defaultColour === colName;
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: isDefault ? '#EFF6FF' : '#F8FAFC',
                              border: isDefault ? '1.5px solid #003E7E' : '1px solid #CBD5E1',
                              borderRadius: '16px',
                              padding: '2px 8px',
                              fontSize: '11px'
                            }}
                          >
                            {matched?.hex_code && (
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: matched.hex_code,
                                  border: '1px solid rgba(0,0,0,0.2)'
                                }}
                              />
                            )}
                            {matched?.image_url && (
                              <img
                                src={resolveImageUrl(matched.image_url)}
                                alt={colName}
                                style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            )}
                            <span style={{ fontWeight: isDefault ? '700' : '500', color: isDefault ? '#003E7E' : '#334155' }}>
                              {colName}
                            </span>
                            {isDefault && (
                              <span style={{ fontSize: '9px', background: '#003E7E', color: '#fff', borderRadius: '3px', padding: '0 4px', fontWeight: '600' }}>
                                Default
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const next = chosenColours.filter(c => c !== colName);
                                setChosenColours(next);
                                if (defaultColour === colName) setDefaultColour(next[0] || '');
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '14px',
                                lineHeight: 1,
                                color: '#94A3B8',
                                padding: 0
                              }}
                              title="Remove colour"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Choose Primary / Default Colour */}
              <div className="col-12 col-md-6">
                <label className="cp-field">
                  <span className="cp-field-label-text">Choose Primary / Default Colour</span>
                  <select
                    className="cp-select"
                    value={defaultColour}
                    onChange={(e) => setDefaultColour(e.target.value)}
                    style={{ width: '100%', height: '40px' }}
                  >
                    <option value="">-- Select Default Colour --</option>
                    {chosenColours.map((colName, idx) => (
                      <option key={idx} value={colName}>{colName}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Additional Images Drag & Drop Gallery */}
              <div className="col-12">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--cp-border)' }}>
                  <span className="cp-field-label-text" style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    Additional Images <span style={{ fontWeight: 'normal', fontSize: '11px', color: 'var(--cp-muted)' }}>(Drag & Drop to reorder)</span>
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
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
                        border: '1px solid var(--cp-border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#fff',
                        opacity: draggedIndex === idx ? 0.4 : 1,
                        cursor: 'grab'
                      }}
                      title="Drag to reorder"
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Other Image ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeOtherImage(idx)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                        title="Delete Image"
                      >
                        &times;
                      </button>
                      <div style={{ position: 'absolute', bottom: '2px', left: '2px', right: '2px', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px 4px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveOtherImage(idx, -1)}
                          style={{ background: 'none', border: 'none', color: idx === 0 ? '#94a3b8' : 'white', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '10px', padding: 0 }}
                          title="Move Left"
                        >
                          &larr;
                        </button>
                        <span style={{ color: 'white', fontSize: '9px' }}>#{idx + 1}</span>
                        <button
                          type="button"
                          disabled={idx === otherImages.length - 1}
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
                    onClick={() => document.getElementById('prd-other-img-file').click()}
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
                    id="prd-other-img-file"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleOtherImageUpload}
                    multiple
                  />
                </div>
              </div>
            </div>

              {/* Product Features Builder */}
              <div className="cp-field cp-field--full" style={{ background: 'var(--cp-surface)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--cp-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="cp-field-label-text" style={{ fontSize: '14px', margin: 0, fontWeight: 'bold' }}>Product Features</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="cp-input"
                      value={featuresType}
                      onChange={(e) => setFeaturesType(e.target.value)}
                      style={{ height: '32px', padding: '0 8px', fontSize: '12px', minWidth: '120px', width: 'auto' }}
                    >
                      <option value="points">Points</option>
                      <option value="key_values">Key Values</option>
                      <option value="table">Table</option>
                    </select>

                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => {
                        if (featuresType === 'points') addFeaturePoint();
                        else if (featuresType === 'key_values') addFeatureKeyValue();
                        else if (featuresType === 'table') addFeatureTableRow();
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        minWidth: 'auto',
                        minHeight: 'auto',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                      }}
                      title={featuresType === 'table' ? 'Add Table Row' : 'Add Feature Item'}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* RENDER BY TYPE */}
                {featuresType === 'points' && (
                  <div>
                    {featuresPoints.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={feat}
                          onChange={(e) => updateFeaturePoint(idx, e.target.value)}
                          placeholder={`Feature Bullet Point #${idx + 1}`}
                        />
                        {featuresPoints.length > 1 && (
                          <button
                            type="button"
                            className="cp-btn-icon cp-btn-icon--danger"
                            onClick={() => removeFeaturePoint(idx)}
                            style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                            title="Delete Row"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {featuresType === 'key_values' && (
                  <div>
                    {featuresKeyValues.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={item.key}
                          onChange={(e) => updateFeatureKeyValue(idx, 'key', e.target.value)}
                          placeholder="Feature Property (e.g. Warranty)"
                        />
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={item.value}
                          onChange={(e) => updateFeatureKeyValue(idx, 'value', e.target.value)}
                          placeholder="Feature Details (e.g. 5 Years)"
                        />
                        {featuresKeyValues.length > 1 && (
                          <button
                            type="button"
                            className="cp-btn-icon cp-btn-icon--danger"
                            onClick={() => removeFeatureKeyValue(idx)}
                            style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                            title="Delete Row"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {featuresType === 'table' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Table Control Panel */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Header Position:</span>
                        <select
                          className="cp-input"
                          value={tableHeaderPos}
                          onChange={(e) => setTableHeaderPos(e.target.value)}
                          style={{ height: '28px', padding: '0 8px', fontSize: '12px', minWidth: '100px', width: 'auto' }}
                        >
                          <option value="top">Top Columns</option>
                          <option value="left">Left Rows</option>
                          <option value="both">Both Sides</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="cp-btn cp-btn-secondary"
                          onClick={addFeatureTableHeader}
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', minHeight: 'auto' }}
                        >
                          + Add Column
                        </button>
                        <button
                          type="button"
                          className="cp-btn cp-btn-secondary"
                          onClick={addFeatureTableRow}
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', minHeight: 'auto' }}
                        >
                          + Add Row
                        </button>
                      </div>
                    </div>

                    {/* Interactive Table Grid Editor */}
                    <div style={{ overflowX: 'auto', border: '1px solid var(--cp-border)', borderRadius: '6px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {(tableHeaderPos === 'left' || tableHeaderPos === 'both') && (
                              <th style={{ border: '1px solid var(--cp-border)', padding: '6px', textAlign: 'left', minWidth: '120px', background: 'rgba(0,0,0,0.02)' }}>
                                Row Header Label
                              </th>
                            )}
                            {featuresTable.headers.map((h, colIdx) => (
                              <th key={colIdx} style={{ border: '1px solid var(--cp-border)', padding: '6px', textAlign: 'left', minWidth: '100px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input
                                    className="cp-input"
                                    style={{ height: '24px', fontSize: '11px', padding: '0 4px', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--cp-border)', borderRadius: 0 }}
                                    value={h}
                                    onChange={(e) => updateFeatureTableHeader(colIdx, e.target.value)}
                                    placeholder={`Column #${colIdx + 1}`}
                                  />
                                  {featuresTable.headers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeFeatureTableHeader(colIdx)}
                                      style={{ background: 'none', border: 'none', color: 'var(--cp-danger)', cursor: 'pointer', padding: 0, fontWeight: 'bold', fontSize: '14px' }}
                                      title="Remove Column"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th style={{ width: '40px', border: '1px solid var(--cp-border)' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {featuresTable.rows.map((rowArr, rIdx) => (
                            <tr key={rIdx}>
                              {(tableHeaderPos === 'left' || tableHeaderPos === 'both') && (
                                <td style={{ border: '1px solid var(--cp-border)', padding: '4px', background: 'rgba(0,0,0,0.02)' }}>
                                  <input
                                    className="cp-input"
                                    style={{ height: '28px', padding: '0 6px', fontSize: '11px', fontWeight: 'bold' }}
                                    value={(featuresTable.rowHeaders && featuresTable.rowHeaders[rIdx]) || ''}
                                    onChange={(e) => updateFeatureTableRowHeader(rIdx, e.target.value)}
                                    placeholder={`Row #${rIdx + 1} Label`}
                                  />
                                </td>
                              )}
                              {featuresTable.headers.map((_, cIdx) => (
                                <td key={cIdx} style={{ border: '1px solid var(--cp-border)', padding: '4px' }}>
                                  <input
                                    className="cp-input"
                                    style={{ height: '28px', padding: '0 6px', fontSize: '11px' }}
                                    value={rowArr[cIdx] || ''}
                                    onChange={(e) => updateFeatureTableCell(rIdx, cIdx, e.target.value)}
                                    placeholder="Value..."
                                  />
                                </td>
                              ))}
                              <td style={{ border: '1px solid var(--cp-border)', textAlign: 'center', padding: '4px' }}>
                                {featuresTable.rows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeFeatureTableRow(rIdx)}
                                    style={{ border: 'none', background: 'none', color: 'var(--cp-danger)', cursor: 'pointer', fontSize: '16px' }}
                                    title="Delete Row"
                                  >
                                    &times;
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications Builder */}
              <div className="cp-field cp-field--full" style={{ background: 'var(--cp-surface)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--cp-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="cp-field-label-text" style={{ fontSize: '14px', margin: 0, fontWeight: 'bold' }}>Product Specifications</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="cp-input"
                      value={specsType}
                      onChange={(e) => setSpecsType(e.target.value)}
                      style={{ height: '32px', padding: '0 8px', fontSize: '12px', minWidth: '120px', width: 'auto' }}
                    >
                      <option value="points">Points</option>
                      <option value="key_values">Key Values</option>
                      <option value="table">Table</option>
                    </select>

                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => {
                        if (specsType === 'points') addSpecPoint();
                        else if (specsType === 'key_values') addSpecKeyValue();
                        else if (specsType === 'table') addSpecTableRow();
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        minWidth: 'auto',
                        minHeight: 'auto',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                      }}
                      title="Add Specification Item"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 1. Specs Points Layout */}
                {specsType === 'points' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {specsPoints.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={pt}
                          onChange={(e) => updateSpecPoint(idx, e.target.value)}
                          placeholder="Specification Point (e.g. ANSI Grade 1 certified strength)"
                        />
                        {specsPoints.length > 1 && (
                          <button
                            type="button"
                            className="cp-btn-icon cp-btn-icon--danger"
                            onClick={() => removeSpecPoint(idx)}
                            style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                            title="Delete Point"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Specs Key-Values Layout */}
                {specsType === 'key_values' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {specsKeyValues.map((kv, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={kv.key}
                          onChange={(e) => updateSpecKeyValue(idx, 'key', e.target.value)}
                          placeholder="Specification Name (e.g. Material)"
                        />
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={kv.value}
                          onChange={(e) => updateSpecKeyValue(idx, 'value', e.target.value)}
                          placeholder="Specification Value (e.g. Solid Brass)"
                        />
                        {specsKeyValues.length > 1 && (
                          <button
                            type="button"
                            className="cp-btn-icon cp-btn-icon--danger"
                            onClick={() => removeSpecKeyValue(idx)}
                            style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                            title="Delete Key Value Row"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Specs Table Grid Layout */}
                {specsType === 'table' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Header Position:</span>
                        <select
                          className="cp-input"
                          value={specsTableHeaderPos}
                          onChange={(e) => setSpecsTableHeaderPos(e.target.value)}
                          style={{ height: '28px', padding: '0 8px', fontSize: '11px', width: 'auto' }}
                        >
                          <option value="top">Top (Columns only)</option>
                          <option value="left">Left (Rows only)</option>
                          <option value="both">Both (Grid)</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="cp-btn cp-btn-secondary"
                          onClick={addSpecTableHeader}
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', minHeight: 'auto' }}
                        >
                          + Add Column
                        </button>
                        <button
                          type="button"
                          className="cp-btn cp-btn-secondary"
                          onClick={addSpecTableRow}
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', minHeight: 'auto' }}
                        >
                          + Add Row
                        </button>
                      </div>
                    </div>

                    {/* Interactive Table Grid Editor */}
                    <div style={{ overflowX: 'auto', border: '1px solid var(--cp-border)', borderRadius: '6px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {(specsTableHeaderPos === 'left' || specsTableHeaderPos === 'both') && (
                              <th style={{ border: '1px solid var(--cp-border)', padding: '6px', textAlign: 'left', minWidth: '120px', background: 'rgba(0,0,0,0.02)' }}>
                                Row Header Label
                              </th>
                            )}
                            {specsTable.headers.map((h, colIdx) => (
                              <th key={colIdx} style={{ border: '1px solid var(--cp-border)', padding: '6px', textAlign: 'left', minWidth: '100px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input
                                    className="cp-input"
                                    style={{ height: '24px', fontSize: '11px', padding: '0 4px', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--cp-border)', borderRadius: 0 }}
                                    value={h}
                                    onChange={(e) => updateSpecTableHeader(colIdx, e.target.value)}
                                    placeholder={`Column #${colIdx + 1}`}
                                  />
                                  {specsTable.headers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeSpecTableHeader(colIdx)}
                                      style={{ background: 'none', border: 'none', color: 'var(--cp-danger)', cursor: 'pointer', padding: 0, fontWeight: 'bold', fontSize: '14px' }}
                                      title="Remove Column"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th style={{ width: '40px', border: '1px solid var(--cp-border)' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {specsTable.rows.map((rowArr, rIdx) => (
                            <tr key={rIdx}>
                              {(specsTableHeaderPos === 'left' || specsTableHeaderPos === 'both') && (
                                <td style={{ border: '1px solid var(--cp-border)', padding: '4px', background: 'rgba(0,0,0,0.02)' }}>
                                  <input
                                    className="cp-input"
                                    style={{ height: '28px', padding: '0 6px', fontSize: '11px', fontWeight: 'bold' }}
                                    value={(specsTable.rowHeaders && specsTable.rowHeaders[rIdx]) || ''}
                                    onChange={(e) => updateSpecTableRowHeader(rIdx, e.target.value)}
                                    placeholder={`Row #${rIdx + 1} Label`}
                                  />
                                </td>
                              )}
                              {specsTable.headers.map((_, cIdx) => (
                                <td key={cIdx} style={{ border: '1px solid var(--cp-border)', padding: '4px' }}>
                                  <input
                                    className="cp-input"
                                    style={{ height: '28px', padding: '0 6px', fontSize: '11px' }}
                                    value={rowArr[cIdx] || ''}
                                    onChange={(e) => updateSpecTableCell(rIdx, cIdx, e.target.value)}
                                    placeholder="Value..."
                                  />
                                </td>
                              ))}
                              <td style={{ border: '1px solid var(--cp-border)', textAlign: 'center', padding: '4px' }}>
                                {specsTable.rows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSpecTableRow(rIdx)}
                                    style={{ border: 'none', background: 'none', color: 'var(--cp-danger)', cursor: 'pointer', fontSize: '16px' }}
                                    title="Delete Row"
                                  >
                                    &times;
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>



              {/* Additional Features Section (Editable Title Label) */}
              <div className="cp-field cp-field--full" style={{ background: 'var(--cp-surface)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--cp-border)', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
                    <input
                      className="cp-input"
                      value={addlTitle}
                      onChange={(e) => setAddlTitle(e.target.value)}
                      placeholder="Section Title (e.g. Additional Features)"
                      style={{ fontSize: '14px', fontWeight: 'bold', border: 'none', borderBottom: '1px dashed var(--cp-border)', borderRadius: 0, padding: '4px 0', background: 'transparent' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--cp-muted)' }}>(Editable Label)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="cp-input"
                      value={addlType}
                      onChange={(e) => setAddlType(e.target.value)}
                      style={{ height: '32px', padding: '0 8px', fontSize: '12px', minWidth: '120px', width: 'auto' }}
                    >
                      <option value="points">Points</option>
                      <option value="key_values">Key Values</option>
                    </select>

                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => {
                        if (addlType === 'points') addAddlPoint();
                        else if (addlType === 'key_values') addAddlKeyValue();
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        minWidth: 'auto',
                        minHeight: 'auto',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                      }}
                      title="Add Item"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Points */}
                {addlType === 'points' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {addlPoints.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={pt}
                          onChange={(e) => updateAddlPoint(idx, e.target.value)}
                          placeholder="Feature Bullet Point #1"
                        />
                        {addlPoints.length > 1 && (
                          <button
                            type="button"
                            className="cp-btn-icon cp-btn-icon--danger"
                            onClick={() => removeAddlPoint(idx)}
                            style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                            title="Delete Point"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Values */}
                {addlType === 'key_values' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {addlKeyValues.map((kv, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={kv.key}
                          onChange={(e) => updateAddlKeyValue(idx, 'key', e.target.value)}
                          placeholder="Specification Name (e.g. Material)"
                        />
                        <input
                          className="cp-input"
                          style={{ flex: 1 }}
                          value={kv.value}
                          onChange={(e) => updateAddlKeyValue(idx, 'value', e.target.value)}
                          placeholder="Specification Value (e.g. Solid Brass)"
                        />
                        {addlKeyValues.length > 1 && (
                          <button
                            type="button"
                            className="cp-btn-icon cp-btn-icon--danger"
                            onClick={() => removeAddlKeyValue(idx)}
                            style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                            title="Delete Key Value Row"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Kits Grid Builder */}
              {hasKits === 'yes' && (
                <div className="col-12" style={{ background: 'var(--cp-surface)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--cp-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span className="cp-field-label-text" style={{ fontSize: '14px', margin: 0, color: 'var(--cp-primary)', fontWeight: '700' }}>Product Kits (Bundles/Packs)</span>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Choose existing kits from Commons or add custom kits</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="cp-btn cp-btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '6px' }}
                        onClick={() => setShowQuickAddKit(!showQuickAddKit)}
                      >
                        {showQuickAddKit ? '✕ Close Kit Form' : '+ New Kit to Commons'}
                      </button>
                      <button
                        type="button"
                        className="cp-btn cp-btn-primary"
                        onClick={addKitRow}
                        style={{
                          width: '32px',
                          height: '32px',
                          minWidth: 'auto',
                          minHeight: 'auto',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                        }}
                        title="Add Kit Row"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Kit Form */}
                  {showQuickAddKit && (
                    <div style={{
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '14px',
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#003E7E' }}>
                        Add New Kit to Commons & Attach to Product
                      </div>
                      <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Kit Name *</label>
                          <input
                            className="cp-input"
                            placeholder="e.g. Starter Pack of 5"
                            value={quickKitName}
                            onChange={(e) => setQuickKitName(e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Kit Display Image</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {quickKitImage ? (
                              <img
                                src={resolveImageUrl(quickKitImage)}
                                alt="Kit Preview"
                                style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#F1F5F9', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94A3B8', flexShrink: 0 }}>
                                None
                              </div>
                            )}
                            <label style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: '#fff',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: uploadingKitImg ? 'wait' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              margin: 0
                            }}>
                              <span>{uploadingKitImg ? 'Uploading...' : (quickKitImage ? 'Change Image' : 'Upload Image')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={uploadingKitImg}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file || !token) return;
                                  setUploadingKitImg(true);
                                  try {
                                    const res = await enterpriseApi.uploadImage(token, file);
                                    setQuickKitImage(res.url);
                                    notify.success('Uploaded', 'Kit image uploaded!');
                                  } catch (err) {
                                    notify.apiError(err, 'Upload failed');
                                  } finally {
                                    setUploadingKitImg(false);
                                  }
                                }}
                              />
                            </label>
                            {quickKitImage && (
                              <button
                                type="button"
                                className="cp-btn-icon cp-btn-icon--danger"
                                onClick={() => setQuickKitImage('')}
                                style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                title="Remove Image"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Description (Optional)</label>
                          <input
                            className="cp-input"
                            placeholder="e.g. Contains 5 pieces"
                            value={quickKitDesc}
                            onChange={(e) => setQuickKitDesc(e.target.value)}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          className="cp-btn cp-btn-secondary"
                          onClick={() => setShowQuickAddKit(false)}
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="cp-btn cp-btn-primary"
                          onClick={handleQuickAddKit}
                          style={{ padding: '4px 14px', fontSize: '12px' }}
                        >
                          Save Kit to DB & Attach
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Kit Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {kits.map((kRow, idx) => {
                      const isFromCommons = commonsKits.some(ck => ck.name === kRow.kitName);
                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--cp-border, #E2E8F0)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {/* Select Kit from Commons */}
                          <div style={{ flex: '1 1 240px' }}>
                            <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                              Select Kit from Commons
                            </label>
                            <select
                              className="cp-select"
                              style={{ width: '100%', height: '38px' }}
                              value={kRow.kitName || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleKitSelect(idx, e.target.value);
                                } else {
                                  updateKitRow(idx, 'kitName', '');
                                  updateKitRow(idx, 'kitDisplay', '');
                                }
                              }}
                            >
                              <option value="">-- Choose Kit from Commons --</option>
                              {commonsKits.map((ck) => (
                                <option key={ck.id || ck.name} value={ck.name}>{ck.name}</option>
                              ))}
                              {kRow.kitName && !commonsKits.some(k => k.name === kRow.kitName) && (
                                <option value={kRow.kitName}>{kRow.kitName}</option>
                              )}
                            </select>
                          </div>

                          {/* Kit Display Preview / Custom Kit Upload */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                            {kRow.kitDisplay ? (
                              <img
                                src={resolveImageUrl(kRow.kitDisplay)}
                                alt="Kit Display"
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#F1F5F9', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94A3B8', flexShrink: 0 }}>
                                No Img
                              </div>
                            )}

                            {isFromCommons ? (
                              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                                ✓ Commons Kit
                              </span>
                            ) : (
                              <label
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0 12px',
                                  height: '36px',
                                  background: '#F1F5F9',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: '#334155',
                                  margin: 0
                                }}
                                title="Upload Custom Kit Image"
                              >
                                <span>{kRow.kitDisplay ? 'Change' : 'Upload'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpdateKitDisplayImage(idx, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Action: Delete Button on the side */}
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              type="button"
                              className="cp-btn-icon cp-btn-icon--danger"
                              onClick={() => {
                                if (kits.length > 1) {
                                  removeKitRow(idx);
                                } else {
                                  updateKitRow(idx, 'kitName', '');
                                  updateKitRow(idx, 'kitDisplay', '');
                                }
                              }}
                              style={{ width: '38px', height: '38px', minWidth: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                              title="Delete Kit Row"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ACCESSORIES & RELATED PRODUCTS SECTION */}
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <div className="cp-grid cp-grid-2" style={{ gap: '12px 16px' }}>
                <RelatedProductsSelect
                  label="Accessories (Searchable Multi-Select)"
                  placeholder="-- Search & Select Accessories --"
                  value={acces}
                  onChange={(val) => setAcces(val)}
                />

                <RelatedProductsSelect
                  label="Related Products (Searchable Multi-Select)"
                  placeholder="-- Search & Select Related Products --"
                  value={relatedPdts}
                  onChange={(val) => setRelatedPdts(val)}
                />
              </div>
            </div>

            {/* SEO META TAGS SECTION */}
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', margin: '0 0 12px 0' }}>SEO & Meta Tag Details</h3>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="cp-field" style={{ margin: 0 }}>
                    <span className="cp-field-label-text">SEO Meta Title <span style={{ opacity: 0.7, fontSize: '11px', display: 'block' }}>Display title tag for search engines</span></span>
                    <input
                      type="text"
                      className="cp-input"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Display title tag for search engines"
                    />
                  </label>
                </div>

                <div className="col-12 col-md-6">
                  <label className="cp-field" style={{ margin: 0 }}>
                    <span className="cp-field-label-text">Canonical URL <span style={{ opacity: 0.7, fontSize: '11px', display: 'block' }}>Preferred authoritative URL</span></span>
                    <input
                      type="text"
                      className="cp-input"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="e.g. https://taiton.in/product/..."
                    />
                  </label>
                </div>

                <div className="col-12 col-md-4">
                  <label className="cp-field" style={{ margin: 0 }}>
                    <span className="cp-field-label-text">Focus Keyword <span style={{ opacity: 0.7, fontSize: '11px', display: 'block' }}>Primary search phrase</span></span>
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
                  <label className="cp-field" style={{ margin: 0 }}>
                    <span className="cp-field-label-text">Secondary Keywords <span style={{ opacity: 0.7, fontSize: '11px', display: 'block' }}>Comma-separated keywords</span></span>
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
                  <label className="cp-field" style={{ margin: 0 }}>
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
                  <label className="cp-field" style={{ margin: 0 }}>
                    <span className="cp-field-label-text">SEO Meta Description</span>
                    <textarea
                      className="cp-input"
                      value={seoDesc}
                      onChange={(e) => setSeoDesc(e.target.value)}
                      placeholder="Snippet description for search engines"
                      rows={4}
                      style={{ minHeight: '100px', resize: 'vertical' }}
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
                  {submitting ? 'Saving Product…' : editId ? 'Update Product' : 'Submit Product'}
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
                          onSubmit(e, 'add_variant');
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
                        Submit & Add Variant
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </form>
        </section>

        {showLivePreview && (
          <div style={{ flex: '1 1 50%', minWidth: 0, height: 'calc(100vh - 210px)', maxHeight: 'calc(100vh - 210px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
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
                .taiton-preview-wrap h1, .taiton-preview-wrap h2, .taiton-preview-wrap h3, .taiton-preview-wrap h4, .taiton-preview-wrap .font-display {
                  font-family: 'Poppins', sans-serif;
                }
                .taiton-preview-wrap a { text-decoration: none; }
                .taiton-preview-wrap .text-primary-custom { color: var(--primary) !important; }
                .taiton-preview-wrap .text-secondary-custom { color: var(--secondary) !important; }
                .taiton-preview-wrap .text-accent-custom { color: var(--accent) !important; }
                .taiton-preview-wrap .text-muted-custom { color: var(--text-secondary) !important; }
                .taiton-preview-wrap .bg-primary-custom { background: var(--primary) !important; }
                .taiton-preview-wrap .bg-light-section { background: var(--light-section) !important; }
                .taiton-preview-wrap .border-custom { border-color: var(--border) !important; }

                .taiton-preview-wrap .btn-primary-custom { background: var(--primary); color: #fff; border: 1px solid var(--primary); padding: .65rem 1.5rem; border-radius: 6px; font-weight: 600; font-size: .9rem; transition: .25s; }
                .taiton-preview-wrap .btn-primary-custom:hover { background: var(--secondary); color: #fff; border-color: var(--secondary); }
                .taiton-preview-wrap .btn-outline-custom { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); padding: .6rem 1.4rem; border-radius: 6px; font-weight: 600; font-size: .9rem; transition: .25s; }
                .taiton-preview-wrap .btn-outline-custom:hover { background: var(--primary); color: #fff; }
                .taiton-preview-wrap .btn-light-custom { background: #fff; color: var(--primary); border: 1px solid var(--border); padding: .6rem 1.4rem; border-radius: 6px; font-weight: 600; font-size: .9rem; }
                .taiton-preview-wrap .eyebrow { color: var(--secondary); font-weight: 700; font-size: .78rem; letter-spacing: 1.5px; text-transform: uppercase; display: inline-block; margin-bottom: .6rem; }
                .taiton-preview-wrap .section-title { font-weight: 700; color: var(--text-2); }
                .taiton-preview-wrap .section-pad { padding: 36px 0; }

                .taiton-preview-wrap .placeholder-img {
                  background: repeating-linear-gradient(135deg, var(--light-section), var(--light-section) 10px, #e3edfb 10px, #e3edfb 20px);
                  border: 1px dashed var(--accent); color: var(--secondary);
                  display: flex; flex-direction: column; align-items: center; justify-content: center;
                  border-radius: 10px; width: 100%; height: 100%; min-height: 150px; text-align: center; font-size: .8rem; font-weight: 600; gap: .4rem; padding: 1rem;
                }

                .taiton-preview-wrap .breadcrumb-bar { font-size: .85rem; color: var(--text-secondary); padding: .9rem 0; }
                .taiton-preview-wrap .breadcrumb-bar a { color: var(--text-secondary); }
                .taiton-preview-wrap .breadcrumb-bar a:hover { color: var(--secondary); }
                .taiton-preview-wrap .breadcrumb-bar .active { color: var(--primary); font-weight: 700; }

                .taiton-preview-wrap .thumb { width: 78px; height: 78px; border: 2px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; }
                .taiton-preview-wrap .thumb.active { border-color: var(--secondary); }
                .taiton-preview-wrap .main-image { border: 1px solid var(--border); border-radius: 12px; min-height: 380px; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; }

                .taiton-preview-wrap .finish-swatch { width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--border); cursor: pointer; }
                .taiton-preview-wrap .finish-swatch.active { outline: 2px solid var(--secondary); outline-offset: 2px; }
                .taiton-preview-wrap .finish-item { text-align: center; font-size: .68rem; font-weight: 600; color: var(--text-secondary); }

                .taiton-preview-wrap .mini-action { width: 44px; height: 44px; border-radius: 8px; border: 1px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1rem; cursor: pointer; }
                .taiton-preview-wrap .mini-action-label { font-size: .62rem; color: var(--text-secondary); text-align: center; margin-top: .2rem; font-weight: 600; }

                .taiton-preview-wrap .data-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 1rem; }
                .taiton-preview-wrap .data-card .card-head { background: var(--light-section); padding: .7rem 1rem; font-weight: 700; font-size: .8rem; letter-spacing: .6px; color: var(--primary); display: flex; justify-content: space-between; align-items: center; }
                .taiton-preview-wrap .pd-table { width: 100%; font-size: .82rem; margin: 0; border-collapse: collapse; }
                .taiton-preview-wrap .pd-table thead th { background: var(--primary); color: #fff; font-weight: 600; padding: .6rem .8rem; white-space: nowrap; text-align: left; }
                .taiton-preview-wrap .pd-table tbody td { padding: .55rem .8rem; border-bottom: 1px solid var(--border); color: var(--text-2); }
                .taiton-preview-wrap .pd-table tbody tr:nth-child(even) { background: var(--light-section); }
                .taiton-preview-wrap .pd-table tbody tr:first-child td:first-child { color: var(--secondary); font-weight: 700; }

                .taiton-preview-wrap .accordion-row { border-bottom: 1px solid var(--border); }
                .taiton-preview-wrap .accordion-row .acc-toggle { display: flex; justify-content: space-between; align-items: center; padding: .9rem .2rem; cursor: pointer; font-weight: 700; font-size: .9rem; color: var(--text-2); }
                .taiton-preview-wrap .accordion-row .acc-toggle .icon-plus { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: .8rem; color: var(--primary); }
                .taiton-preview-wrap .accordion-row .acc-body { padding: 0 .2rem 1rem; font-size: .85rem; color: var(--text-secondary); }

                .taiton-preview-wrap .dark-banner { background: linear-gradient(120deg,#001B3A,#00305F); color: #fff; border-radius: 18px; overflow: hidden; position: relative; }
                .taiton-preview-wrap .banner-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.4); display: inline-block; }
                .taiton-preview-wrap .banner-dot.active { background: var(--accent); width: 22px; border-radius: 5px; }
                .taiton-preview-wrap .circle-arrow { width: 44px; height: 44px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: 0 4px 14px rgba(0,0,0,.15); }

                .taiton-preview-wrap .hscroll-wrap { position: relative; }
                .taiton-preview-wrap .hscroll { display: flex; gap: 1.1rem; overflow-x: auto; padding: .3rem .2rem 1rem; scrollbar-width: none; }
                .taiton-preview-wrap .hscroll::-webkit-scrollbar { display: none; }
                .taiton-preview-wrap .hscroll > * { flex: 0 0 auto; }
                .taiton-preview-wrap .product-card { width: 200px; background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; position: relative; }
                .taiton-preview-wrap .product-card .placeholder-img { height: 150px; border-radius: 0; }
                .taiton-preview-wrap .product-card .body { padding: .9rem; }
                .taiton-preview-wrap .product-card h6 { font-weight: 700; font-size: .88rem; margin-bottom: .1rem; color: var(--text-2); }
                .taiton-preview-wrap .product-card .code { font-size: .75rem; color: var(--text-1); font-weight: 600; }
                .taiton-preview-wrap .fav-btn { position: absolute; top: .6rem; right: .6rem; width: 32px; height: 32px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,.12); color: var(--primary); font-size: .9rem; }
                .taiton-preview-wrap .badge-tag { position: absolute; top: .6rem; left: .6rem; background: var(--secondary); color: #fff; font-size: .65rem; font-weight: 700; padding: .25rem .6rem; border-radius: 5px; letter-spacing: .5px; }
                .taiton-preview-wrap .nav-btn { width: 42px; height: 42px; border-radius: 50%; background: #fff; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: 0 4px 14px rgba(0,0,0,.08); cursor: pointer; }
                .taiton-preview-wrap .nav-btn:hover { background: var(--primary); color: #fff; }
                .taiton-preview-wrap .contact-form .form-control { border: 1px solid var(--border); border-radius: 8px; padding: .7rem .9rem; font-size: .88rem; }
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
                    <span style={{ cursor: 'pointer' }}>{getCategoryName(catId)}</span> &gt;{' '}
                    <span style={{ cursor: 'pointer' }}>{getSubCategoryName(subCatId)}</span> &gt;{' '}
                    <span className="active">{productName || 'TGH - 11'}</span>
                  </div>

                  {/* PRODUCT DETAIL SECTION */}
                  <section className="pb-3">
                    <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '24px' }}>
                      {/* GALLERY */}
                      <div>
                        <div style={{ display: 'flex', gap: '16px', flexDirection: previewDevice === 'mobile' ? 'column-reverse' : 'row' }}>
                          <div style={{ display: 'flex', flexDirection: previewDevice === 'mobile' ? 'row' : 'column', gap: '8px', overflowX: 'auto' }}>
                            {[productImage, ...otherImages].filter(Boolean).slice(0, 4).map((img, idx) => (
                              <div
                                key={idx}
                                className={`thumb ${(activePreviewImage || productImage) === img ? 'active' : ''}`}
                                onClick={() => setActivePreviewImage(img)}
                              >
                                <img src={resolveImageUrl(img)} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                            {(!productImage && otherImages.length === 0) && (
                              <>
                                <div className="thumb active"><div className="placeholder-img">📷</div></div>
                                <div className="thumb"><div className="placeholder-img">📷</div></div>
                                <div className="thumb"><div className="placeholder-img">📷</div></div>
                              </>
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="main-image">
                              {(productImage || activePreviewImage || otherImages[0]) ? (
                                <img src={resolveImageUrl(activePreviewImage || productImage || otherImages[0])} alt="Main Display" style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }} />
                              ) : (
                                <div className="placeholder-img">
                                  <div style={{ fontSize: '2rem' }}>📷</div>
                                  <div>{productName || 'TGH-11 Door Handle'}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PRODUCT INFO */}
                      <div>
                        <div>
                          {brand && (
                            <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#0D63C9', marginBottom: '4px' }}>
                              {brand}
                            </div>
                          )}
                          <h1 className="fw-bold text-primary-custom" style={{ fontSize: previewDevice === 'mobile' ? '1.5rem' : '2.2rem', margin: 0 }}>
                            {productName || 'TGH - 11'}
                          </h1>
                          <p className="text-muted-custom mb-0">
                            {productCode ? `Code: ${productCode}` : 'D Type Handle | Satin Stainless Steel'}
                          </p>

                          {price && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '700' }}>MRP :</span>
                              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#003E7E' }}>
                                ₹{Number(price).toLocaleString('en-IN')}
                              </span>
                              {discount && (
                                <span style={{ fontSize: '12px', fontWeight: '700', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px' }}>
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* DYNAMIC COLOURS / FINISHES */}
                        {chosenColours.length > 0 ? (
                          <div style={{ marginTop: '18px', marginBottom: '16px' }}>
                            <h6 className="fw-bold mb-2" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Available Finishes {defaultColour && <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--muted)', textTransform: 'none' }}>(Default: {defaultColour})</span>}
                            </h6>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                              {chosenColours.map((colName, idx) => {
                                const matched = commonsColors.find(c => c.name?.toLowerCase() === colName.toLowerCase());
                                const isDefault = defaultColour === colName;
                                return (
                                  <div key={idx} className="finish-item" style={{ textAlign: 'center' }}>
                                    <div
                                      className={`finish-swatch ${isDefault ? 'active' : ''}`}
                                      style={{
                                        background: matched?.hex_code || '#C9CED3',
                                        border: isDefault ? '2px solid #003E7E' : '1px solid #CBD5E1',
                                        boxShadow: isDefault ? '0 0 0 2px #93C5FD' : 'none',
                                        overflow: 'hidden',
                                        position: 'relative'
                                      }}
                                    >
                                      {matched?.image_url && (
                                        <img src={resolveImageUrl(matched.image_url)} alt={colName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      )}
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: isDefault ? '700' : '500', color: isDefault ? '#003E7E' : '#475569' }}>
                                      {colName}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '18px', marginBottom: '16px' }}>
                            <h6 className="fw-bold mb-2">Available Finishes</h6>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                              <div className="finish-item"><div className="finish-swatch active" style={{ background: '#C9CED3' }}></div><div style={{ marginTop: '4px' }}>SSS</div></div>
                              <div className="finish-item"><div className="finish-swatch" style={{ background: '#C9A227' }}></div><div style={{ marginTop: '4px' }}>GOLD</div></div>
                              <div className="finish-item"><div className="finish-swatch" style={{ background: '#1c1c1c' }}></div><div style={{ marginTop: '4px' }}>BLACK</div></div>
                              <div className="finish-item"><div className="finish-swatch" style={{ background: '#D9A79C' }}></div><div style={{ marginTop: '4px' }}>ROSE GOLD</div></div>
                            </div>
                          </div>
                        )}

                        {/* KITS PREVIEW */}
                        {hasKits === 'yes' && kits.filter(k => k.kitName).length > 0 && (
                          <div style={{ marginTop: '18px', marginBottom: '16px' }}>
                            <h6 className="fw-bold mb-2" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Available Kits & Packs
                            </h6>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {kits.filter(k => k.kitName).map((k, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 12px',
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#003E7E'
                                  }}
                                >
                                  {k.kitDisplay && (
                                    <img
                                      src={resolveImageUrl(k.kitDisplay)}
                                      alt={k.kitName}
                                      style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                  )}
                                  <span>{k.kitName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PRODUCT DESCRIPTION / SEO META DESCRIPTION SIMULATION */}
                        {seoDesc ? (
                          <p className="text-muted-custom mb-4" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
                            {seoDesc}
                          </p>
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

                        {/* ACCORDION ROWS */}
                        <div className="accordion-row">
                          <div className="acc-toggle">
                            Features <span className="icon-plus">+</span>
                          </div>
                          <div className="acc-body">
                            {featuresType === 'points' && featuresPoints.filter(Boolean).length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                {featuresPoints.filter(Boolean).map((pt, i) => <li key={i}>{pt}</li>)}
                              </ul>
                            ) : featuresType === 'table' && featuresTable.headers.some(Boolean) ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table className="pd-table" style={{ margin: '4px 0' }}>
                                  <thead>
                                    <tr>
                                      {featuresTable.headers.map((h, i) => (
                                        <th key={i}>{h || `Col ${i + 1}`}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {featuresTable.rows.map((r, rIdx) => (
                                      <tr key={rIdx}>
                                        {featuresTable.headers.map((_, cIdx) => (
                                          <td key={cIdx}>{r[cIdx] || '—'}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : featuresType === 'key_values' && featuresKeyValues.filter(kv => kv.key).length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {featuresKeyValues.filter(kv => kv.key).map((kv, i) => (
                                  <div key={i}><strong>{kv.key}:</strong> {kv.value}</div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.7 }}>No product features specified.</span>
                            )}
                          </div>
                        </div>

                        <div className="accordion-row">
                          <div className="acc-toggle">
                            Technical Specifications <span className="icon-plus">+</span>
                          </div>
                          <div className="acc-body">
                            {specsType === 'points' && specsPoints.filter(Boolean).length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                {specsPoints.filter(Boolean).map((sp, i) => <li key={i}>{sp}</li>)}
                              </ul>
                            ) : specsType === 'table' && specsTable.headers.some(Boolean) ? (
                              <div style={{ overflowX: 'auto' }}>
                                <table className="pd-table" style={{ margin: '4px 0' }}>
                                  <thead>
                                    <tr>
                                      {specsTable.headers.map((h, i) => (
                                        <th key={i}>{h || `Col ${i + 1}`}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {specsTable.rows.map((r, rIdx) => (
                                      <tr key={rIdx}>
                                        {specsTable.headers.map((_, cIdx) => (
                                          <td key={cIdx}>{r[cIdx] || '—'}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : specsType === 'key_values' && specsKeyValues.filter(kv => kv.key).length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {specsKeyValues.filter(kv => kv.key).map((kv, i) => (
                                  <div key={i}><strong>{kv.key}:</strong> {kv.value}</div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontStyle: 'italic', opacity: 0.7 }}>No technical specifications specified.</span>
                            )}
                          </div>
                        </div>

                        {((addlType === 'points' && addlPoints.filter(Boolean).length > 0) || (addlType === 'key_values' && addlKeyValues.filter(kv => kv.key).length > 0)) && (
                          <div className="accordion-row">
                            <div className="acc-toggle">
                              {addlTitle || 'Additional Features'} <span className="icon-plus">+</span>
                            </div>
                            <div className="acc-body">
                              {addlType === 'points' ? (
                                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                  {addlPoints.filter(Boolean).map((ap, i) => <li key={i}>{ap}</li>)}
                                </ul>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  {addlKeyValues.filter(kv => kv.key).map((kv, i) => (
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

                  {/* ACCESSORIES SECTION */}
                  {acces.trim() && (
                    <section className="section-pad pt-0" style={{ marginTop: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 3fr', gap: '20px', alignItems: 'start' }}>
                        <div>
                          <h3 className="fw-bold">Accessories</h3>
                          <p className="text-muted-custom" style={{ fontSize: '.88rem' }}>Compatible accessories for your product</p>
                        </div>
                        <div>
                          <div className="hscroll-wrap">
                            <div className="hscroll">
                              {acces.split(',').map(s => s.trim()).filter(Boolean).map((idOrTitle, idx) => {
                                const pdt = getProductDetails(idOrTitle);
                                return (
                                  <div key={idx} className="product-card">
                                    {pdt?.img ? (
                                      <div style={{ height: '140px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                                        <img src={resolveImageUrl(pdt.img)} alt={pdt.title} style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'cover' }} />
                                      </div>
                                    ) : (
                                      <div className="placeholder-img" style={{ height: '140px' }}>📦</div>
                                    )}
                                    <div className="body">
                                      <h6>{pdt?.title || idOrTitle}</h6>
                                      <div className="code">{pdt?.code || 'Accessory'}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* SIMILAR PRODUCTS / RELATED PRODUCTS */}
                  {relatedPdts.trim() && (
                    <section className="section-pad pt-0">
                      <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 3fr', gap: '20px', alignItems: 'start' }}>
                        <div>
                          <h3 className="fw-bold">Similar Products</h3>
                          <p className="text-muted-custom" style={{ fontSize: '.88rem' }}>Matching products and recommendations</p>
                        </div>
                        <div>
                          <div className="hscroll-wrap">
                            <div className="hscroll">
                              {relatedPdts.split(',').map(s => s.trim()).filter(Boolean).map((idOrTitle, idx) => {
                                const pdt = getProductDetails(idOrTitle);
                                return (
                                  <div key={idx} className="product-card">
                                    {pdt?.img ? (
                                      <div style={{ height: '140px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                                        <img src={resolveImageUrl(pdt.img)} alt={pdt.title} style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'cover' }} />
                                      </div>
                                    ) : (
                                      <div className="placeholder-img" style={{ height: '140px' }}>📦</div>
                                    )}
                                    <div className="body">
                                      <h6>{pdt?.title || idOrTitle}</h6>
                                      <div className="code">{pdt?.code || 'Related Product'}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
