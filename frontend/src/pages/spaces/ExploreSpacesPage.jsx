import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';
import { canApprovePendingItem } from '../../utils/approvalAccess.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { HistoryAuditDrawer } from '../../components/HistoryAuditDrawer.jsx';
import { ConfirmDeleteCard } from '../../components/ConfirmDeleteCard.jsx';
import './ExploreSpaces.css';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || window.location.origin;
  return `${base}${cleanPath}`;
};

// Preset architectural finish chips
const MET_FINISHES = [
  ['SSS', '#c4c8cd', 'Satin Stainless Steel'],
  ['PSS', '#e4e6e9', 'Polished Stainless Steel'],
  ['BLACK', '#26272a', 'Matte Black'],
  ['GOLD', '#d2a24c', 'Brushed Brass'],
  ['BRONZE', '#795548', 'Antique Bronze'],
  ['GUNMETAL', '#4b5563', 'Gunmetal Grey'],
];

const GLASS_FINISHES = [
  ['CLEAR', '#cfe0e6', 'Clear Float Glass'],
  ['GREY', '#9aa4ab', 'Euro Grey Tint'],
  ['BRONZE', '#a98a64', 'Bronze Tint'],
  ['BLACK', '#26272a', 'Dark Black Privacy'],
];

// Fallback architectural graphic for products without uploaded primary image
function ProductArtSvg({ type = 'hinge', finishColor = '#c4c8cd' }) {
  const f = `fill="${finishColor}" stroke="#64748b" strokeWidth="1"`;
  if (type === 'handle' || type === 'THA-HDL-05') {
    return (
      <svg className="es-pc-img" viewBox="0 0 200 140" aria-hidden="true">
        <rect x="14" y="58" width="172" height="12" rx="6" {...{ fill: finishColor, stroke: '#64748b', strokeWidth: 1 }} />
        <rect x="34" y="66" width="10" height="26" rx="3" fill="#475569" />
        <rect x="156" y="66" width="10" height="26" rx="3" fill="#475569" />
      </svg>
    );
  }
  if (type === 'led' || type === 'TAL-LED-02') {
    return (
      <svg className="es-pc-img" viewBox="0 0 200 140" aria-hidden="true">
        <path d="M20 90l120-40h50v36l-120 40H20z" fill={finishColor} stroke="#64748b" strokeWidth="1" />
        <path d="M24 92l110-36 4 8-110 38z" fill="#facc15" />
      </svg>
    );
  }
  if (type === 'glass' || type === 'TGL-FLG-01') {
    return (
      <svg className="es-pc-img" viewBox="0 0 200 140" aria-hidden="true">
        <rect x="30" y="14" width="140" height="112" fill={finishColor} stroke="#64748b" strokeWidth="1" />
        {Array.from({ length: 13 }).map((_, k) => (
          <rect key={k} x={36 + k * 10} y="16" width="4" height="108" fill="#ffffff" opacity="0.6" />
        ))}
      </svg>
    );
  }
  if (type === 'skirt' || type === 'TAL-SKP-01') {
    return (
      <svg className="es-pc-img" viewBox="0 0 200 140" aria-hidden="true">
        <path d="M16 110l150-44h22v14l-150 46H16z" fill={finishColor} stroke="#64748b" strokeWidth="1" />
        <path d="M16 110l150-44h22l-60 22z" fill="#ffffff" opacity="0.4" />
      </svg>
    );
  }
  if (type === 'prof' || type === 'TAP-ALP-01') {
    return (
      <svg className="es-pc-img" viewBox="0 0 200 140" aria-hidden="true">
        <path d="M20 90l120-40h50v36l-120 40H20z" fill={finishColor} stroke="#64748b" strokeWidth="1" />
        <path d="M20 90l120-40h50l-70 28z" fill="#ffffff" opacity="0.4" />
      </svg>
    );
  }
  return (
    <svg className="es-pc-img" viewBox="0 0 200 140" aria-hidden="true">
      <ellipse cx="70" cy="82" rx="46" ry="36" fill={finishColor} stroke="#64748b" strokeWidth="1" />
      <ellipse cx="70" cy="78" rx="30" ry="22" fill="#00000022" stroke="#64748b" />
      <circle cx="70" cy="78" r="8" fill="#334155" />
      <path d="M104 58L168 26l16 26-56 46z" fill={finishColor} stroke="#64748b" strokeWidth="1" />
      <circle cx="162" cy="42" r="6" fill="#00000033" />
      <rect x="40" y="108" width="60" height="10" rx="4" fill="#334155" />
    </svg>
  );
}

export function ExploreSpacesPage() {
  const { token, activeOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'adm'
  const [spaces, setSpaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [approvalRules, setApprovalRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Viewer State
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [selectedProductCode, setSelectedProductCode] = useState(null);
  const [selectedFinishIndex, setSelectedFinishIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  // Admin / Manage Space Draft State
  const [draftId, setDraftId] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [draftPoints, setDraftPoints] = useState([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState(-1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState('');

  // Delete & Audit Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [auditTargetId, setAuditTargetId] = useState(null);

  const prevRef = useRef(null);
  const rowRef = useRef(null);
  const dragInfo = useRef({ draggingIndex: null, hasMoved: false });

  const roleCode = activeOrganization?.roleCode || '';

  // 1. Load Spaces, Products, and Rules from backend
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [spacesRes, productsRes, rulesRes] = await Promise.all([
        enterpriseApi.spacesList(token).catch(() => ({ data: [] })),
        enterpriseApi.contentList(token, 'product', { limit: 100 }).catch(() => ({ items: [] })),
        enterpriseApi.orgApprovalRules(token).catch(() => ({ rules: [] })),
      ]);

      const loadedSpaces = spacesRes.data || spacesRes.items || [];
      const loadedProducts = productsRes.items || productsRes.data || [];

      setSpaces(loadedSpaces);
      setProducts(loadedProducts);
      setApprovalRules(rulesRes.rules || []);

      if (loadedSpaces.length > 0 && !selectedSpaceId) {
        setSelectedSpaceId(loadedSpaces[0].id);
      }
    } catch (err) {
      notify.apiError(err, 'Failed to load spaces data');
    } finally {
      setLoading(false);
    }
  }, [token, selectedSpaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active space object in viewer
  const activeSpace = spaces.find((s) => s.id === selectedSpaceId) || spaces[0] || null;

  // Active space's hotspots
  const activeHotspots = activeSpace?.hotspots || activeSpace?.payload?.hotspots || [];

  // Distinct products referenced by hotspots
  const activeProducts = React.useMemo(() => {
    const map = new Map();
    activeHotspots.forEach((h) => {
      const pCode = h.product_code || h.product?.code || h.product?.pdt_code || h.label;
      if (pCode && !map.has(pCode)) {
        // Try finding full product record from products list or hotspot's embedded product
        const matched = products.find(
          (p) => p.payload?.productCode === pCode || p.title === pCode || p.pdt_code === pCode || p.id === h.product_id
        );
        map.set(pCode, {
          code: pCode,
          name: matched?.title || matched?.product || h.product?.name || h.label || pCode,
          description: matched?.payload?.productDescription || matched?.description || h.product?.description || 'Architectural hardware specification.',
          image: matched?.payload?.product_image || matched?.primary_img || h.product?.image || null,
          features: matched?.payload?.product_features || h.product?.features || [],
          specs: matched?.payload?.product_specifications || h.product?.specifications || [],
          variants: matched?.payload?.variants || h.product?.variants || [],
        });
      }
    });
    return Array.from(map.values());
  }, [activeHotspots, products]);

  // Set default selected product code if not set
  useEffect(() => {
    if (activeProducts.length > 0 && (!selectedProductCode || !activeProducts.some((p) => p.code === selectedProductCode))) {
      setSelectedProductCode(activeProducts[0].code);
    }
  }, [activeProducts, selectedProductCode]);

  const activeProduct = activeProducts.find((p) => p.code === selectedProductCode) || activeProducts[0] || null;

  // Handle Hotspot Click
  const handleHotspotClick = (pCode) => {
    setSelectedProductCode(pCode);
    setSelectedFinishIndex(0);
    // Scroll carousel card into view
    const cardEl = document.querySelector(`.es-pc[data-code="${pCode}"]`);
    if (cardEl && rowRef.current) {
      rowRef.current.scrollTo({
        left: cardEl.offsetLeft - rowRef.current.offsetLeft - 12,
        behavior: 'smooth',
      });
    }
  };

  // Helper to calculate percentage within element
  const getCoordinatesPct = (e, container) => {
    const rect = container.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    return [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))];
  };

  // Handle Canvas Click to add hotspot
  const handleCanvasClick = (e) => {
    if (dragInfo.current.hasMoved) {
      dragInfo.current.hasMoved = false;
      return;
    }
    if (!draftImageUrl) return;

    const [x, y] = getCoordinatesPct(e, prevRef.current);
    const newPoint = {
      product_code: products[0]?.payload?.productCode || '',
      product_id: products[0]?.id || null,
      x,
      y,
      label: `Hotspot #${draftPoints.length + 1}`,
    };

    setDraftPoints((prev) => [...prev, newPoint]);
    setSelectedPointIndex(draftPoints.length);
  };

  // Handle Dragging Hotspot Marker
  const handleMarkerPointerDown = (index, e) => {
    e.stopPropagation();
    dragInfo.current.draggingIndex = index;
    dragInfo.current.hasMoved = false;
    setSelectedPointIndex(index);
    if (e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handleCanvasPointerMove = (e) => {
    if (dragInfo.current.draggingIndex === null || !prevRef.current) return;
    dragInfo.current.hasMoved = true;
    const [x, y] = getCoordinatesPct(e, prevRef.current);

    setDraftPoints((prev) => {
      const next = [...prev];
      if (next[dragInfo.current.draggingIndex]) {
        next[dragInfo.current.draggingIndex] = {
          ...next[dragInfo.current.draggingIndex],
          x,
          y,
        };
      }
      return next;
    });
  };

  const handleCanvasPointerUp = () => {
    dragInfo.current.draggingIndex = null;
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.formWarning('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      notify.formWarning('Image size cannot exceed 15MB.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      if (res.url) {
        setDraftImageUrl(res.url);
        notify.success('Image Uploaded', 'Space background image ready for hotspot tagging.');
      }
    } catch (err) {
      notify.apiError(err, 'Failed to upload space image');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Space
  const handleSaveSpace = async () => {
    if (!draftName.trim()) {
      notify.formWarning('Space title/name is required.');
      return;
    }
    if (!draftImageUrl) {
      notify.formWarning('Please upload a main space image.');
      return;
    }
    if (draftPoints.length === 0) {
      notify.formWarning('Please identify and mark at least one hotspot point on the image.');
      return;
    }
    if (draftPoints.some((p) => !p.product_code && !p.product_id)) {
      notify.formWarning('Please select an existing product for every marked hotspot.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: draftName.trim(),
        name: draftName.trim(),
        description: draftDesc.trim(),
        image_url: draftImageUrl,
        hotspots: draftPoints.map((p, idx) => ({
          product_id: p.product_id,
          product_code: p.product_code,
          x: p.x,
          y: p.y,
          label: p.label || `Point #${idx + 1}`,
          sort_order: idx,
        })),
        status: 'ready_to_live',
        view: 'view',
      };

      let res;
      if (draftId) {
        res = await enterpriseApi.spaceUpdate(token, draftId, payload);
        notify.success('Space Updated', res.message || 'Explore space saved successfully.');
      } else {
        res = await enterpriseApi.spaceCreate(token, payload);
        notify.success(
          res.item?.status === 'pending_approval' ? 'Submitted for Approval' : 'Space Created',
          res.message || 'Explore space created successfully.'
        );
        if (res.item?.status === 'pending_approval') {
          emitUnreadRefresh();
        }
      }

      await loadData();
      handleClearForm();
      setActiveTab('view');
    } catch (err) {
      notify.apiError(err, draftId ? 'Failed to update space' : 'Failed to create space');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Space
  const handleEditSpace = (space) => {
    setDraftId(space.id);
    setDraftName(space.title || space.name || space.payload?.name || '');
    setDraftDesc(space.description || space.payload?.description || '');
    setDraftImageUrl(space.image_url || space.img || space.payload?.image_url || space.payload?.img || '');
    const rawHotspots = space.hotspots || space.payload?.hotspots || [];
    setDraftPoints(
      rawHotspots.map((h) => ({
        id: h.id,
        product_id: h.product_id,
        product_code: h.product_code,
        x: Number(h.x ?? h.x_pos ?? 0),
        y: Number(h.y ?? h.y_pos ?? 0),
        label: h.label,
      }))
    );
    setSelectedPointIndex(-1);
    setActiveTab('adm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear Form
  const handleClearForm = () => {
    setDraftId(null);
    setDraftName('');
    setDraftDesc('');
    setDraftImageUrl('');
    setDraftPoints([]);
    setSelectedPointIndex(-1);
    setSearchProductQuery('');
  };

  // Delete Space confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await enterpriseApi.spaceDelete(token, deleteTarget.id);
      notify.success('Deleted', `Explore Space "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to delete space');
    }
  };

  // Toggle Space Visibility View/Hide
  const handleToggleView = async (space) => {
    const nextView = space.view === 'hide' ? 'view' : 'hide';
    try {
      await enterpriseApi.spaceToggleView(token, space.id, nextView);
      notify.success('Visibility Updated', `Space is now ${nextView === 'view' ? 'Visible' : 'Hidden'}.`);
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to toggle visibility');
    }
  };

  // Approval / Rejection Handler
  const handleApproveAction = async (spaceId, approve) => {
    try {
      await enterpriseApi.contentApprove(token, 'explore_space', spaceId, { approve });
      emitUnreadRefresh();
      notify.success(approve ? 'Approved' : 'Rejected', `Explore Space #${spaceId} has been ${approve ? 'approved' : 'rejected'}.`);
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to action approval');
    }
  };

  const showApproveFor = (item) => {
    if (item?.status !== 'pending_approval') return false;
    return canApprovePendingItem({
      rules: approvalRules,
      resource: 'spaces',
      createdByRole: item?.createdByRole,
      roleCode,
    });
  };

  // Formatted finishes for active product
  const availableFinishes = React.useMemo(() => {
    if (activeProduct?.variants && activeProduct.variants.length > 0) {
      return activeProduct.variants.map((v, idx) => [
        v.colour || v.color_finish || v.sku || `Finish ${idx + 1}`,
        v.hex || (idx % 2 === 0 ? '#c4c8cd' : '#26272a'),
        v.name || v.colour,
      ]);
    }
    return activeProduct?.name?.toLowerCase().includes('glass') ? GLASS_FINISHES : MET_FINISHES;
  }, [activeProduct]);

  const currentFinishColor = availableFinishes[selectedFinishIndex]?.[1] || '#c4c8cd';

  // Formatted specs for active product
  const formattedSpecs = React.useMemo(() => {
    if (!activeProduct) return [];
    if (Array.isArray(activeProduct.specs)) {
      return activeProduct.specs.map((item) => {
        if (Array.isArray(item)) return [item[0], item[1]];
        if (item && typeof item === 'object') return [item.key || item.name, item.value];
        return ['Specification', String(item)];
      });
    }
    if (typeof activeProduct.specs === 'object' && activeProduct.specs !== null) {
      return Object.entries(activeProduct.specs);
    }
    return [
      ['Material', 'Architectural Alloy / Stainless Steel'],
      ['Warranty', '5 Years Manufacturer Warranty'],
      ['Testing', 'Complies with EN Standards'],
    ];
  }, [activeProduct]);

  return (
    <div className="cp-stack es-root">
      <PageBreadcrumb parent="Content" parentUrl="/app/dashboard" current="Explore Spaces" />

      {/* Header Bar with Mode Switcher and Actions */}
      <div className="cp-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="cp-page-title" style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#003e7e' }}>
            Explore Spaces
          </h1>
          <p className="cp-muted" style={{ margin: '4px 0 0', fontSize: '13px' }}>
            Interactive space showroom with clickable hotspot markers mapped to catalog products.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="es-header-tabs">
            <button
              type="button"
              className={`es-tab-btn ${activeTab === 'view' ? 'on' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              Interactive View
            </button>
            <button
              type="button"
              className={`es-tab-btn ${activeTab === 'adm' ? 'on' : ''}`}
              onClick={() => setActiveTab('adm')}
            >
              Manage Spaces
            </button>
          </div>

          {activeSpace && activeTab === 'view' && (
            <button
              type="button"
              className="cp-btn cp-btn-secondary"
              onClick={() => setAuditTargetId(activeSpace.id)}
              style={{ fontSize: '12px', padding: '6px 12px', height: '34px' }}
            >
              Audit History
            </button>
          )}

          <a
            href="/app/releases"
            className="cp-btn cp-btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px', height: '34px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Go to Live Release Management"
          >
            <span>🚀 Production Release</span>
          </a>
        </div>
      </div>

      {/* ---------------- MODE 1: INTERACTIVE VIEWER ---------------- */}
      {activeTab === 'view' && (
        <div className="es-wrap">
          {/* Left Column: Spaces List */}
          <aside className="cp-card es-spaces-sidebar">
            <h2>Explore Spaces</h2>
            {spaces.length === 0 ? (
              <p className="cp-muted" style={{ fontSize: '12px', padding: '12px' }}>
                No spaces created yet. Switch to "Manage Spaces" to add your first space.
              </p>
            ) : (
              spaces.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`es-space-item ${s.id === selectedSpaceId ? 'on' : ''}`}
                  onClick={() => {
                    setSelectedSpaceId(s.id);
                    setSelectedProductCode(null);
                    setSelectedFinishIndex(0);
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title || s.name}
                  </span>
                  {s.id === selectedSpaceId && (
                    <svg style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </aside>

          {/* Center Column: Interactive Space Image with Hotspots */}
          <section className="es-imgbox">
            {activeSpace ? (
              <>
                <img
                  src={resolveImageUrl(activeSpace.image_url || activeSpace.img || activeSpace.payload?.image_url || activeSpace.payload?.img)}
                  alt={activeSpace.title || activeSpace.name}
                />
                {activeHotspots.map((h, i) => {
                  const pCode = h.product_code || h.product?.code || h.product?.pdt_code || h.label;
                  const isCurrent = pCode === selectedProductCode;
                  const x = Number(h.x ?? h.x_pos ?? 0);
                  const y = Number(h.y ?? h.y_pos ?? 0);
                  const isLeftEdge = x < 15;
                  const isRightEdge = x > 85;

                  return (
                    <button
                      key={h.id || i}
                      type="button"
                      className={`es-hs ${isCurrent ? 'on' : ''} ${isLeftEdge ? 'al' : ''} ${isRightEdge ? 'ar' : ''}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => handleHotspotClick(pCode)}
                      aria-label={h.label || pCode}
                    >
                      <i className="es-dot" />
                      <span>{h.label || pCode}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--cp-muted)' }}>
                No spaces available. Please add a space in the Manage Spaces tab.
              </div>
            )}
          </section>

          {/* Right Column: Full Product Details Pane */}
          <aside className="cp-card es-det">
            {activeProduct ? (
              <div className="es-fade" key={activeProduct.code}>
                <button
                  type="button"
                  className={`es-heart ${isFavorite ? 'on' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                  title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                <div className="es-tp">
                  <div className="es-thumbs">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`es-th ${activeThumbIndex === idx ? 'on' : ''}`}
                        onClick={() => setActiveThumbIndex(idx)}
                      >
                        {activeProduct.image ? (
                          <img src={resolveImageUrl(activeProduct.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <ProductArtSvg type={activeProduct.code} finishColor={currentFinishColor} />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="es-big">
                    {activeProduct.image ? (
                      <img
                        src={resolveImageUrl(activeProduct.image)}
                        alt={activeProduct.name}
                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                      />
                    ) : (
                      <ProductArtSvg type={activeProduct.code} finishColor={currentFinishColor} />
                    )}
                  </div>
                </div>

                <h1>{activeProduct.code}</h1>
                <div className="es-nm">{activeProduct.name}</div>
                <p className="es-ds">{activeProduct.description}</p>

                <h4>Available Finishes</h4>
                <div className="es-fins">
                  {availableFinishes.map(([finCode, finHex, finTitle], idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`es-fin ${selectedFinishIndex === idx ? 'on' : ''}`}
                      onClick={() => setSelectedFinishIndex(idx)}
                      title={finTitle}
                    >
                      <i style={{ background: finHex }} />
                      {finCode}
                    </button>
                  ))}
                </div>

                <div className="es-btns">
                  <button
                    type="button"
                    className="es-b1"
                    onClick={() => notify.success('Product Details', `Opened full catalog sheet for ${activeProduct.code}.`)}
                  >
                    View More
                    <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="es-b2"
                    onClick={() => notify.success('Quote Request', `Request added for ${activeProduct.code} (${availableFinishes[selectedFinishIndex]?.[0] || 'Standard Finish'}).`)}
                  >
                    Get a Quote
                  </button>
                </div>

                <h4>Product Specifications</h4>
                <div>
                  {formattedSpecs.map(([k, val], idx) => (
                    <div key={idx} className="es-spec">
                      <svg style={{ width: '12px', height: '12px' }} fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="6" />
                      </svg>
                      <span>{k}</span>
                      <span>{String(val || '—')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--cp-muted)', fontSize: '13px' }}>
                Select a hotspot pin on the space image to inspect product specifications and finishes.
              </div>
            )}
          </aside>

          {/* Bottom Products Row Carousel */}
          <section className="cp-card es-prods">
            <h3>Products Used in This Space</h3>
            <div className="es-row" ref={rowRef}>
              {activeProducts.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  data-code={p.code}
                  className={`es-pc ${p.code === selectedProductCode ? 'on' : ''}`}
                  onClick={() => handleHotspotClick(p.code)}
                >
                  {p.image ? (
                    <img src={resolveImageUrl(p.image)} alt={p.name} className="es-pc-img" />
                  ) : (
                    <ProductArtSvg type={p.code} finishColor="#c4c8cd" />
                  )}
                  <b>{p.code}</b>
                  <small title={p.name}>{p.name}</small>
                </button>
              ))}
            </div>

            {activeProducts.length > 3 && (
              <button
                type="button"
                className="es-nx"
                onClick={() => {
                  if (rowRef.current) {
                    rowRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                  }
                }}
                aria-label="Scroll right"
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </section>
        </div>
      )}

      {/* ---------------- MODE 2: MANAGE SPACES (ADMIN EDITOR) ---------------- */}
      {activeTab === 'adm' && (
        <div className="es-adm">
          {/* Left Column: Space Details & Interactive Canvas Editor */}
          <div className="cp-card es-pane">
            <h2>{draftId ? `Edit Space #${draftId}` : 'Create New Space'}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="cp-field">
                <span className="cp-field-label-text">
                  Space Title / Name <span className="cp-req">*</span>
                </span>
                <input
                  type="text"
                  className="cp-input"
                  placeholder="e.g. Minimalist Master Bathroom or Luxury Living Room"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Space Description (Optional)</span>
                <textarea
                  className="cp-input"
                  rows={2}
                  placeholder="Brief description of the space layout and design concept..."
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                />
              </label>

              <div>
                <span className="cp-field-label-text" style={{ display: 'block', marginBottom: '6px' }}>
                  Space Image <span className="cp-req">*</span>
                </span>
                <label className="es-drop">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {isUploading ? (
                    <span style={{ color: 'var(--cp-primary)', fontWeight: '600' }}>Uploading image…</span>
                  ) : draftImageUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Image ready. Click to replace file.</span>
                    </div>
                  ) : (
                    <span>Click or drag image here to upload (JPEG, PNG, WebP)</span>
                  )}
                </label>
              </div>

              {/* Interactive Hotspot Preview Canvas */}
              {draftImageUrl && (
                <div
                  ref={prevRef}
                  className="es-prev"
                  onClick={handleCanvasClick}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  title="Click to drop a hotspot marker. Drag to reposition."
                >
                  <img
                    src={resolveImageUrl(draftImageUrl)}
                    alt="Space canvas"
                    draggable={false}
                  />

                  {draftPoints.map((pt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`es-mk ${idx === selectedPointIndex ? 'on' : ''}`}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      onPointerDown={(e) => handleMarkerPointerDown(idx, e)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPointIndex(idx);
                      }}
                      title={`Point #${idx + 1}: ${pt.label || pt.product_code || 'Unassigned'} (Drag to move)`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              <p className="es-hint">
                💡 <strong>How to add hotspots:</strong> Click anywhere on the image preview to place a marker point.
                Drag any marker to fine-tune its position. Each marker stores normalized coordinates (X %, Y %) ensuring
                perfect responsive display on any device.
              </p>
            </div>
          </div>

          {/* Right Column: Points to Product Mapping & Saved Spaces */}
          <div>
            <div className="cp-card es-pane">
              <h2>Hotspots to Product Association ({draftPoints.length})</h2>

              {draftPoints.length > 0 ? (
                <>
                  <div className="es-pth">
                    <span>#</span>
                    <span>X %</span>
                    <span>Y %</span>
                    <span>Mapped Product</span>
                    <span></span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {draftPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className={`es-pt ${idx === selectedPointIndex ? 'on' : ''}`}
                        onClick={() => setSelectedPointIndex(idx)}
                      >
                        <span className="es-n">{idx + 1}</span>
                        <input
                          type="text"
                          readOnly
                          className="cp-input"
                          style={{ padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '30px' }}
                          value={`${pt.x}%`}
                        />
                        <input
                          type="text"
                          readOnly
                          className="cp-input"
                          style={{ padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '30px' }}
                          value={`${pt.y}%`}
                        />

                        {/* Product Selector Dropdown */}
                        <select
                          className="cp-input"
                          style={{ fontSize: '11.5px', height: '30px', padding: '2px 6px' }}
                          value={pt.product_id || pt.product_code || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matchedProd = products.find((p) => String(p.id) === val || p.payload?.productCode === val);
                            setDraftPoints((prev) => {
                              const next = [...prev];
                              next[idx] = {
                                ...next[idx],
                                product_id: matchedProd ? matchedProd.id : null,
                                product_code: matchedProd ? matchedProd.payload?.productCode || matchedProd.title : val,
                                label: matchedProd ? matchedProd.title : `Hotspot #${idx + 1}`,
                              };
                              return next;
                            });
                          }}
                        >
                          <option value="">Select product from database…</option>
                          {products.map((p) => {
                            const code = p.payload?.productCode || `PRD-${p.id}`;
                            return (
                              <option key={p.id} value={p.id}>
                                {code} — {p.title}
                              </option>
                            );
                          })}
                        </select>

                        <button
                          type="button"
                          className="es-del-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraftPoints((prev) => prev.filter((_, i) => i !== idx));
                            if (selectedPointIndex === idx) setSelectedPointIndex(-1);
                          }}
                          title="Remove this hotspot point"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="cp-muted" style={{ fontSize: '12.5px', padding: '16px', textAlign: 'center', background: 'var(--cp-surface-subtle, #f8fafc)', borderRadius: '6px' }}>
                  No hotspot markers added yet. Upload an image on the left and click on it to drop marker pins.
                </p>
              )}

              {/* Action Buttons */}
              <div className="es-acts">
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  disabled={isSaving}
                  onClick={handleSaveSpace}
                  style={{ height: '38px', minWidth: '130px' }}
                >
                  {isSaving ? 'Saving…' : draftId ? 'Update Space' : 'Save Space'}
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn-secondary"
                  onClick={handleClearForm}
                  style={{ height: '38px' }}
                >
                  {draftId ? 'Cancel Edit' : 'Clear Form'}
                </button>
              </div>
            </div>

            {/* Saved Spaces List */}
            <div className="cp-card es-pane" style={{ marginTop: '16px' }}>
              <h2>Saved Spaces in Database ({spaces.length})</h2>

              <div className="es-saved-list">
                {spaces.length === 0 ? (
                  <p className="cp-muted" style={{ fontSize: '12px' }}>
                    No saved spaces found.
                  </p>
                ) : (
                  spaces.map((s) => {
                    const sImg = s.image_url || s.img || s.payload?.image_url || s.payload?.img;
                    const sHotspots = s.hotspots || s.payload?.hotspots || [];
                    return (
                      <div key={s.id} className="es-saved-card">
                        <img src={resolveImageUrl(sImg)} alt={s.title || s.name} />
                        <div className="es-sc-info">
                          <b>{s.title || s.name}</b>
                          <small>
                            {sHotspots.length} hotspot pin{sHotspots.length === 1 ? '' : 's'} •{' '}
                            <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{s.status}</span>
                          </small>
                        </div>

                      <div className="es-sc-actions">
                        {/* Approval Action for Pending Item */}
                        {showApproveFor(s) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveAction(s.id, true)}
                              style={{ color: '#16a34a', borderColor: '#86efac' }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveAction(s.id, false)}
                              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleView(s)}
                          title={`Toggle space visibility (Current: ${s.view || 'view'})`}
                        >
                          {s.view === 'hide' ? 'Hidden' : 'Visible'}
                        </button>
                        <button type="button" onClick={() => handleEditSpace(s)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="es-btn-del"
                          onClick={() => setDeleteTarget(s)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteCard
          title={`Delete "${deleteTarget.title}"?`}
          message="Are you sure you want to delete this space? All associated hotspot markers will also be removed."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Audit History Drawer */}
      {auditTargetId && (
        <HistoryAuditDrawer
          tableName="tb_web_spaces"
          recordId={auditTargetId}
          onClose={() => setAuditTargetId(null)}
        />
      )}
    </div>
  );
}
