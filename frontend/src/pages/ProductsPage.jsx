import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { PermissionRoute } from '../routes/PermissionRoute.jsx';
import { PermissionGate } from '../components/PermissionGate.jsx';
import { PageBreadcrumb } from '../components/PageBreadcrumb.jsx';
import { notify } from '../utils/notify.js';
import { emitUnreadRefresh } from '../utils/events.js';
import { TableFilters } from '../components/TableFilters.jsx';
import { TablePagination } from '../components/TablePagination.jsx';
import { ConfirmDeleteCard } from '../components/ConfirmDeleteCard.jsx';
import { HistoryAuditDrawer } from '../components/HistoryAuditDrawer.jsx';
import { CommonsDrawer } from '../components/CommonsDrawer.jsx';
import { BulkUploadForm } from '../components/BulkUploadForm.jsx';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || window.location.origin;
  return `${base}${cleanPath}`;
};

const renderFormattedContent = (payloadObj) => {
  if (!payloadObj) return <p style={{ margin: 0, fontSize: '13px', color: 'var(--cp-muted)', fontStyle: 'italic' }}>Not configured.</p>;

  // Check if legacy flat array (e.g. array of strings)
  if (Array.isArray(payloadObj)) {
    return (
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--cp-text-muted)' }}>
        {payloadObj.filter(Boolean).map((feat, i) => (
          <li key={i} style={{ marginBottom: '4px' }}>{feat}</li>
        ))}
      </ul>
    );
  }

  // Check if legacy flat object (e.g. { Warranty: "10 Years" })
  if (typeof payloadObj === 'object' && !payloadObj.type) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
        {Object.entries(payloadObj).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--cp-bg, #f8fafc)', borderRadius: '6px', fontSize: '12px' }}>
            <strong style={{ color: 'var(--cp-muted)' }}>{key}</strong>
            <span style={{ fontWeight: '600', color: 'var(--cp-text)' }}>{String(val)}</span>
          </div>
        ))}
      </div>
    );
  }

  // New structured format
  const { type, data, headerPos } = payloadObj;

  if (type === 'points') {
    const list = Array.isArray(data) ? data : [];
    return (
      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--cp-text-muted)' }}>
        {list.filter(Boolean).map((feat, i) => (
          <li key={i} style={{ marginBottom: '4px' }}>{feat}</li>
        ))}
      </ul>
    );
  }

  if (type === 'key_values') {
    const list = Array.isArray(data) ? data : [];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
        {list.filter(kv => kv && kv.key).map((kv, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--cp-bg, #f8fafc)', borderRadius: '6px', fontSize: '12px' }}>
            <strong style={{ color: 'var(--cp-muted)' }}>{kv.key}</strong>
            <span style={{ fontWeight: '600', color: 'var(--cp-text)' }}>{kv.value || '—'}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    const tbl = data || {};
    const headers = Array.isArray(tbl.headers) ? tbl.headers : [];
    const rowHeaders = Array.isArray(tbl.rowHeaders) ? tbl.rowHeaders : [];
    const rows = Array.isArray(tbl.rows) ? tbl.rows : [];
    const normHeaderPos = headerPos || 'top';

    return (
      <div style={{ overflowX: 'auto', marginTop: '6px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--cp-border)' }}>
          <thead>
            {(normHeaderPos === 'top' || normHeaderPos === 'both') ? (
              <tr style={{ background: '#f8fafc' }}>
                {normHeaderPos === 'both' && <th style={{ border: '1px solid var(--cp-border)', padding: '6px' }}></th>}
                {headers.map((h, i) => (
                  <th key={i} style={{ border: '1px solid var(--cp-border)', padding: '6px', textAlign: 'left' }}>{h || `Col #${i + 1}`}</th>
                ))}
              </tr>
            ) : null}
          </thead>
          <tbody>
            {rows.map((rowArr, rIdx) => (
              <tr key={rIdx}>
                {(normHeaderPos === 'left' || normHeaderPos === 'both') && (
                  <th style={{ background: '#f8fafc', border: '1px solid var(--cp-border)', padding: '6px', textAlign: 'left' }}>
                    {rowHeaders[rIdx] || `Row #${rIdx + 1}`}
                  </th>
                )}
                {headers.map((_, colIdx) => (
                  <td key={colIdx} style={{ border: '1px solid var(--cp-border)', padding: '6px' }}>
                    {rowArr[colIdx] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p style={{ margin: 0, fontSize: '13px', color: 'var(--cp-muted)', fontStyle: 'italic' }}>Not configured.</p>;
};

export function ProductsPage() {
  const { token, bulkUploading, setBulkUploading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'categories');

  useEffect(() => {
    if (tabFromUrl && ['categories', 'subcategories', 'products', 'variants', 'bulk'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    setSearchQuery('');
    setStatusFilter('');
  };
  const [loading, setLoading] = useState(false);

  // Data lists
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catTypeFilter, setCatTypeFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // History Drawer state
  const [historyTarget, setHistoryTarget] = useState(null); // { type, item }
  const [auditLogs, setAuditLogs] = useState([]);
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Commons Drawer state (Variant Colours & Kits)
  const [commonsDrawerOpen, setCommonsDrawerOpen] = useState(false);

  // Top "+ Add New" Dropdown state
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const addDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target)) {
        setAddDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openHistoryDrawer = (type, item) => {
    setHistoryTarget({ type, item });
    setLoadingAudit(true);
    setAuditLogs([]);
    setApprovalLogs([]);

    if (token && item) {
      const tableMap = {
        category: 'tb_pdt_categories',
        subcategory: 'tb_pdt_categories',
        product: 'tb_pdt_products',
        variant: 'tb_pdt_variants'
      };
      const tableName = tableMap[type] || type;

      enterpriseApi.getAuditLogs(token, {
        record_id: item.id,
        table_name: tableName,
        type
      })
        .then((res) => {
          setAuditLogs(res.data || []);
          setApprovalLogs(res.approvals || []);
        })
        .catch((err) => console.error('Failed to fetch audit logs:', err))
        .finally(() => setLoadingAudit(false));
    } else {
      setLoadingAudit(false);
    }
  };

  // Pagination states
  const [catPage, setCatPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const [varPage, setVarPage] = useState(1);

  // Total counts for server-side pagination
  const [catTotal, setCatTotal] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [prodTotal, setProdTotal] = useState(0);
  const [varTotal, setVarTotal] = useState(0);

  // Reset page when queries/filters change
  useEffect(() => {
    setCatPage(1);
    setSubPage(1);
    setProdPage(1);
    setVarPage(1);
  }, [searchQuery, statusFilter, catTypeFilter, activeTab]);

  // Bulk uploads state
  const [excelFile, setExcelFile] = useState(null);
  const [imagesList, setImagesList] = useState([]);
  const [uploadStats, setUploadStats] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');

  const loadAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'categories') {
        const res = await enterpriseApi.contentList(token, 'category', {
          limit: 10,
          offset: (catPage - 1) * 10,
          status: statusFilter || undefined,
          q: searchQuery || undefined,
          cat_type: catTypeFilter || undefined
        });
        setCategories(res.items ?? []);
        setCatTotal(res.total ?? 0);
      } else if (activeTab === 'subcategories') {
        const res = await enterpriseApi.contentList(token, 'subcategory', {
          limit: 10,
          offset: (subPage - 1) * 10,
          status: statusFilter || undefined,
          q: searchQuery || undefined,
        });
        setSubcategories(res.items ?? []);
        setSubTotal(res.total ?? 0);
      } else if (activeTab === 'products') {
        const res = await enterpriseApi.contentList(token, 'product', {
          limit: 10,
          offset: (prodPage - 1) * 10,
          status: statusFilter || undefined,
          q: searchQuery || undefined,
        });
        setProducts(res.items ?? []);
        setProdTotal(res.total ?? 0);
      } else if (activeTab === 'variants') {
        const res = await enterpriseApi.contentList(token, 'variant', {
          limit: 10,
          offset: (varPage - 1) * 10,
          status: statusFilter || undefined,
          q: searchQuery || undefined,
        });
        setVariants(res.items ?? []);
        setVarTotal(res.total ?? 0);
      }
    } catch (e) {
      notify.apiError(e, `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, catPage, subPage, prodPage, varPage, statusFilter, searchQuery, catTypeFilter]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      notify.formWarning('Please select a template Excel file.');
      return;
    }
    setBulkUploading(true);
    setUploadStats(null);
    setUploadErrors([]);
    try {
      const res = await enterpriseApi.bulkUploadProducts(token, excelFile, imagesList);
      if (res.stats) {
        setUploadStats(res.stats);
      }
      if (res.report) {
        const errors = res.report.filter(r => r.status === 'failed');
        setUploadErrors(errors);
      }
      if (res.stats && res.stats.failed > 0) {
        notify.warning(`Bulk upload completed with ${res.stats.failed} failures.`);
      } else {
        notify.success('Bulk Upload Completed Successfully', res.message);
        setExcelFile(null);
        setImagesList([]);
        setActiveTab('products');
      }
      emitUnreadRefresh();
      await loadAllData();
    } catch (err) {
      notify.apiError(err, 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  const clearUploadReport = () => {
    setUploadStats(null);
    setUploadErrors([]);
    setExcelFile(null);
    setImagesList([]);
    setActiveTab('products');
  };

  const handleSoftDelete = async (type, item) => {
    try {
      const updatedPayload = { ...(item.payload || {}), status: 'inactive' };
      await enterpriseApi.contentUpdate(token, type, item.id, {
        title: item.title,
        summary: item.summary,
        status: 'inactive',
        payload: updatedPayload,
      });
      notify.success('Deactivated', `"${item.title || 'Item'}" marked as Inactive.`);
      loadAllData();
    } catch (err) {
      notify.apiError(err, 'Failed to mark as inactive');
    }
  };

  const handleToggleView = async (type, item) => {
    try {
      const nextView = item.view === 'hide' ? 'view' : 'hide';
      const updatedPayload = { ...(item.payload || {}), view: nextView };
      await enterpriseApi.contentUpdate(token, type, item.id, {
        title: item.title,
        summary: item.summary,
        status: item.status,
        view: nextView,
        payload: updatedPayload,
      });
      notify.success(
        nextView === 'view' ? 'Website Visibility Enabled' : 'Website Visibility Hidden',
        `"${item.title || 'Item'}" is now ${nextView === 'view' ? 'visible on website' : 'hidden from website'}.`
      );
      loadAllData();
    } catch (err) {
      notify.apiError(err, 'Failed to update website visibility');
    }
  };

  const getStatusTag = (status) => {
    const s = String(status || 'active').toLowerCase();
    let style = { background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' };
    let text = s.toUpperCase();

    if (s === 'active' || s === 'live') {
      style = { background: '#dcfce7', color: '#15803d', borderColor: '#86efac' };
    } else if (s === 'inactive' || s === 'rejected') {
      style = { background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' };
    }

    return (
      <span className="cp-tag" style={{ ...style, fontWeight: '600', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
        {text}
      </span>
    );
  };

  return (
    <PermissionRoute permission={PERMISSIONS.PRODUCTS_READ}>
      <div className="cp-stack" style={{ position: 'relative' }}>
        {bulkUploading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            minHeight: '500px',
            borderRadius: '12px',
            backdropFilter: 'blur(3px)'
          }}>
            <div className="cp-page-loading" style={{ marginBottom: '16px' }}></div>
            <p style={{ fontWeight: '700', color: 'var(--cp-text)', fontSize: '18px', margin: '0 0 8px 0' }}>Bulk Upload in Progress</p>
            <p className="cp-muted" style={{ fontSize: '13px', margin: 0 }}>Please wait, processing spreadsheet rows and uploading images.</p>
          </div>
        )}
        <PageBreadcrumb current="Products" />
        <div className="cp-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h1 className="cp-page-title" style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--cp-text)' }}>
              Onboarding Products
            </h1>
            <p className="cp-muted" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
              Configure hierarchy categorization, parent-child relations and imports.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* + Add New Dropdown: Allows directly creating Product, Category or Variant without loading categories */}
            <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
              <div ref={addDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={() => setAddDropdownOpen((prev) => !prev)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                  title="Add New Product, Category, or Variant"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add New</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: addDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {addDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      zIndex: 1000,
                      background: 'var(--cp-surface, #ffffff)',
                      border: '1px solid var(--cp-border, #e2e8f0)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      minWidth: '220px',
                      padding: '6px 0',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', background: 'none', border: 'none',
                        textAlign: 'left', fontSize: '13px', fontWeight: '500',
                        color: 'var(--cp-text, #1e293b)', cursor: 'pointer', width: '100%',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      onClick={() => { setAddDropdownOpen(false); navigate('/app/products/create-product'); }}
                    >
                      <span style={{ fontSize: '16px' }}>📦</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--cp-text)' }}>Add Product</div>
                        <div style={{ fontSize: '11px', color: 'var(--cp-muted)' }}>Create a new product</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', background: 'none', border: 'none',
                        textAlign: 'left', fontSize: '13px', fontWeight: '500',
                        color: 'var(--cp-text, #1e293b)', cursor: 'pointer', width: '100%',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      onClick={() => { setAddDropdownOpen(false); navigate('/app/products/create-category'); }}
                    >
                      <span style={{ fontSize: '16px' }}>📁</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--cp-text)' }}>Add Category</div>
                        <div style={{ fontSize: '11px', color: 'var(--cp-muted)' }}>Main, Sub or Sub-Sub Category</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', background: 'none', border: 'none',
                        textAlign: 'left', fontSize: '13px', fontWeight: '500',
                        color: 'var(--cp-text, #1e293b)', cursor: 'pointer', width: '100%',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      onClick={() => { setAddDropdownOpen(false); navigate('/app/products/create-variant'); }}
                    >
                      <span style={{ fontSize: '16px' }}>🎨</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--cp-text)' }}>Add Variant</div>
                        <div style={{ fontSize: '11px', color: 'var(--cp-muted)' }}>Add colour & finish variant</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </PermissionGate>

            {/* Bulk Upload Button */}
            <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
              <button
                type="button"
                className={`cp-btn ${activeTab === 'bulk' ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
                onClick={() => handleTabChange('bulk')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Bulk Import Hierarchy via Excel"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Bulk Upload</span>
              </button>
            </PermissionGate>

            {/* Commons Button */}
            <button
              type="button"
              className="cp-btn cp-btn-secondary"
              onClick={() => setCommonsDrawerOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Open Variant Colours, Kits & Brands Commons Repository"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9 10 10 0 0 0 0-18z" />
                <circle cx="12" cy="6.5" r="1" fill="currentColor" />
                <circle cx="12" cy="17.5" r="1" fill="currentColor" />
              </svg>
              <span>Commons</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              className="cp-btn cp-btn-secondary"
              onClick={loadAllData}
              title="Refresh Current Data"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Unified Table View: Switcher buttons for Categories, Products, Variants with Search & Filters */}
        {activeTab !== 'bulk' && (
          <section className="cp-card cp-card-pad">
            {/* Control Bar: Left = Categories / Products / Variants switcher; Right = Search & Filters */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--cp-border, #e2e8f0)'
            }}>
              {/* Left Side: Buttons to load table */}
              <div style={{
                display: 'inline-flex',
                padding: '3px',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid var(--cp-border, #e2e8f0)',
                gap: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => handleTabChange('categories')}
                  style={{
                    padding: '7px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'categories' ? 'var(--cp-primary, #003E7E)' : 'transparent',
                    color: activeTab === 'categories' ? '#ffffff' : 'var(--cp-text, #334155)',
                    boxShadow: activeTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Categories
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('products')}
                  style={{
                    padding: '7px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'products' ? 'var(--cp-primary, #003E7E)' : 'transparent',
                    color: activeTab === 'products' ? '#ffffff' : 'var(--cp-text, #334155)',
                    boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('variants')}
                  style={{
                    padding: '7px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'variants' ? 'var(--cp-primary, #003E7E)' : 'transparent',
                    color: activeTab === 'variants' ? '#ffffff' : 'var(--cp-text, #334155)',
                    boxShadow: activeTab === 'variants' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Variants
                </button>
              </div>

              {/* Right Side: Search & Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <input
                    type="text"
                    className="cp-input"
                    placeholder={
                      activeTab === 'categories'
                        ? 'Search categories...'
                        : activeTab === 'products'
                          ? 'Search products by title, ID, code...'
                          : 'Search variants by name, ID, code...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ height: '36px', minHeight: 'auto', paddingLeft: '32px' }}
                  />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--cp-muted)' }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                {activeTab === 'categories' && (
                  <select
                    className="cp-input"
                    style={{ height: '36px', minHeight: 'auto', width: 'auto', minWidth: '150px' }}
                    value={catTypeFilter}
                    onChange={(e) => setCatTypeFilter(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="category">Categories (Main Level)</option>
                    <option value="sub category">Sub Categories (Level 2)</option>
                    <option value="sub sub category">Sub Sub Categories (Level 3)</option>
                  </select>
                )}

                <select
                  className="cp-input"
                  style={{ height: '36px', minHeight: 'auto', width: 'auto', minWidth: '130px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>

                {(searchQuery || statusFilter || catTypeFilter) && (
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    style={{ height: '36px', minHeight: 'auto', padding: '0 12px', fontSize: '12px' }}
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                      setCatTypeFilter('');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* 1. Categories List */}
            {activeTab === 'categories' && (
              loading ? (
                <p className="cp-muted">Loading Categories…</p>
              ) : categories.length === 0 ? (
                <p className="cp-muted">No Categories match your filters.</p>
              ) : (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Category ID</th>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Type / Level</th>
                          <th>Parent Category</th>
                          <th>Status</th>
                          <th aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((row) => {
                          const isPending = row.status === 'pending_approval';
                          const pId = Number(row.payload?.parent_id || 0);
                          const ppId = Number(row.payload?.parent_parent_id || 0);
                          const rawType = String(row.payload?.type || '').toLowerCase();

                          let itemTypeBadge = 'Category';
                          let badgeBg = '#f1f5f9';
                          let badgeColor = '#475569';
                          let displayIdStr = row.payload?.display_id;

                          if (rawType === 's2c' || rawType === 'sub sub category' || (pId > 0 && ppId > 0)) {
                            itemTypeBadge = 'Sub Sub Category';
                            badgeBg = '#f3e8ff';
                            badgeColor = '#6b21a8';
                            if (!displayIdStr) displayIdStr = `s2c_${row.id}`;
                          } else if (rawType === 'sc' || rawType === 'sub category' || (pId > 0 && ppId === 0)) {
                            itemTypeBadge = 'Sub Category';
                            badgeBg = '#e0f2fe';
                            badgeColor = '#0369a1';
                            if (!displayIdStr) displayIdStr = `sc_${row.id}`;
                          } else {
                            if (!displayIdStr) displayIdStr = `cat_${row.id}`;
                          }

                          const parentName = row.payload?.parent_category_name || '—';
                          return (
                            <tr key={row.id}>
                              <td><code>{displayIdStr}</code></td>
                              <td>
                                {row.payload?.category_image ? (
                                  <img
                                    src={resolveImageUrl(row.payload.category_image)}
                                    alt={row.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                                  />
                                ) : (
                                  <span className="cp-muted" style={{ fontSize: '11px' }}>No Image</span>
                                )}
                              </td>
                              <td><strong>{row.title}</strong></td>
                              <td>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  background: badgeBg,
                                  color: badgeColor
                                }}>
                                  {itemTypeBadge}
                                </span>
                              </td>
                              <td>{parentName}</td>
                              <td>{getStatusTag(row.status)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      disabled={isPending}
                                      onClick={() => !isPending && handleToggleView('category', row)}
                                      style={{
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px',
                                        border: '1px solid var(--cp-border)',
                                        background: row.view === 'hide' ? '#f1f5f9' : '#eff6ff',
                                        borderColor: row.view === 'hide' ? '#cbd5e1' : '#bfdbfe',
                                        color: row.view === 'hide' ? '#64748b' : '#2563eb',
                                        opacity: isPending ? 0.35 : 1,
                                        cursor: isPending ? 'not-allowed' : 'pointer',
                                      }}
                                      title={isPending ? 'Record is locked while pending approval' : (row.view === 'hide' ? 'Hidden on Website (Click to View)' : 'Visible on Website (Click to Hide)')}
                                    >
                                      {row.view === 'hide' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                          <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      onClick={() => openHistoryDrawer('category', row)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', background: '#F8FAFC', color: '#003E7E' }}
                                      title="View History & Audit Timeline"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--primary"
                                      disabled={isPending}
                                      onClick={() => !isPending && navigate(`/app/products/create-category?editId=${row.id}`)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Edit Category'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--danger"
                                      disabled={isPending}
                                      onClick={() => !isPending && setDeleteTarget({ type: 'category', item: row })}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Set Inactive (Delete)'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                    </button>
                                  </PermissionGate>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={catPage}
                    onChange={setCatPage}
                    total={catTotal}
                    pageSize={10}
                    labelSingle="category"
                    labelPlural="categories"
                  />
                </>
              ))}

            {/* 2. SubCategories List (Fallback) */}
            {activeTab === 'subcategories' && (
              loading ? (
                <p className="cp-muted">Loading Sub Categories…</p>
              ) : subcategories.length === 0 ? (
                <p className="cp-muted">No Sub Categories match your filters.</p>
              ) : (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Sub Category ID</th>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subcategories.map((row) => {
                          const isPending = row.status === 'pending_approval';
                          return (
                            <tr key={row.id}>
                              <td><code>#{row.id}</code></td>
                              <td>
                                {row.payload?.img || row.payload?.subcategory_image ? (
                                  <img
                                    src={resolveImageUrl(row.payload.img || row.payload.subcategory_image)}
                                    alt={row.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                                  />
                                ) : (
                                  <span className="cp-muted" style={{ fontSize: '11px' }}>No Image</span>
                                )}
                              </td>
                              <td><strong>{row.title}</strong></td>
                              <td>{getStatusTag(row.status)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      disabled={isPending}
                                      onClick={() => !isPending && handleToggleView('subcategory', row)}
                                      style={{
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px',
                                        border: '1px solid var(--cp-border)',
                                        background: row.view === 'hide' ? '#f1f5f9' : '#eff6ff',
                                        borderColor: row.view === 'hide' ? '#cbd5e1' : '#bfdbfe',
                                        color: row.view === 'hide' ? '#64748b' : '#2563eb',
                                        opacity: isPending ? 0.35 : 1,
                                        cursor: isPending ? 'not-allowed' : 'pointer',
                                      }}
                                      title={isPending ? 'Record is locked while pending approval' : (row.view === 'hide' ? 'Hidden on Website (Click to View)' : 'Visible on Website (Click to Hide)')}
                                    >
                                      {row.view === 'hide' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                          <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      onClick={() => openHistoryDrawer('subcategory', row)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', background: '#F8FAFC', color: '#003E7E' }}
                                      title="View History & Audit Timeline"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--primary"
                                      disabled={isPending}
                                      onClick={() => !isPending && navigate(`/app/products/create-subcategory?editId=${row.id}`)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Edit Sub Category'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--danger"
                                      disabled={isPending}
                                      onClick={() => !isPending && setDeleteTarget({ type: 'subcategory', item: row })}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Set Inactive (Delete)'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                    </button>
                                  </PermissionGate>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={subPage}
                    onChange={setSubPage}
                    total={subTotal}
                    pageSize={10}
                    labelSingle="subcategory"
                    labelPlural="subcategories"
                  />
                </>
              ))}

            {/* 3. Products List */}
            {activeTab === 'products' && (
              loading ? (
                <p className="cp-muted">Loading Products…</p>
              ) : products.length === 0 ? (
                <p className="cp-muted">No Products match your filters.</p>
              ) : (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Added By</th>
                          <th>Created Date</th>
                          <th aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((row) => {
                          const isPending = row.status === 'pending_approval';
                          return (
                            <tr key={row.id}>
                              <td><code>#{row.payload?.prd_id || row.payload?.productCode || row.payload?.pdt_code || row.id}</code></td>
                              <td>
                                {row.payload?.product_image || row.payload?.img ? (
                                  <img
                                    src={resolveImageUrl(row.payload.product_image || row.payload.img)}
                                    alt={row.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                                  />
                                ) : (
                                  <span className="cp-muted" style={{ fontSize: '11px' }}>No Image</span>
                                )}
                              </td>
                              <td><strong>{row.title}</strong></td>
                              <td>{row.payload?.price ? `₹${Number(row.payload.price).toLocaleString()}` : '—'}</td>
                              <td>{getStatusTag(row.status)}</td>
                              <td>{row.created_by_name || row.createdBy || 'Creator'}</td>
                              <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      disabled={isPending}
                                      onClick={() => !isPending && handleToggleView('product', row)}
                                      style={{
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px',
                                        border: '1px solid var(--cp-border)',
                                        background: row.view === 'hide' ? '#f1f5f9' : '#eff6ff',
                                        borderColor: row.view === 'hide' ? '#cbd5e1' : '#bfdbfe',
                                        color: row.view === 'hide' ? '#64748b' : '#2563eb',
                                        opacity: isPending ? 0.35 : 1,
                                        cursor: isPending ? 'not-allowed' : 'pointer',
                                      }}
                                      title={isPending ? 'Record is locked while pending approval' : (row.view === 'hide' ? 'Hidden on Website (Click to View)' : 'Visible on Website (Click to Hide)')}
                                    >
                                      {row.view === 'hide' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                          <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      onClick={() => openHistoryDrawer('product', row)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', background: '#F8FAFC', color: '#003E7E' }}
                                      title="View History & Audit Timeline"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--primary"
                                      disabled={isPending}
                                      onClick={() => !isPending && navigate(`/app/products/create-product?editId=${row.id}`)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Edit Product'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--danger"
                                      disabled={isPending}
                                      onClick={() => !isPending && setDeleteTarget({ type: 'product', item: row })}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Set Inactive (Delete)'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                    </button>
                                  </PermissionGate>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={prodPage}
                    onChange={setProdPage}
                    total={prodTotal}
                    pageSize={10}
                    labelSingle="product"
                    labelPlural="products"
                  />
                </>
              ))}

            {/* Variants Tab Content */}
            {activeTab === 'variants' && (
              loading ? (
                <p className="cp-muted">Loading Variants…</p>
              ) : variants.length === 0 ? (
                <p className="cp-muted">No Variants match your filters.</p>
              ) : (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Variant ID</th>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Added By</th>
                          <th>Created Date</th>
                          <th aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((row) => {
                          const isPending = row.status === 'pending_approval';
                          return (
                            <tr key={row.id}>
                              <td><code>#{row.payload?.variant_id || row.payload?.variantCode || row.payload?.sku || row.id}</code></td>
                              <td>
                                {(row.payload?.primary_img || row.payload?.image_url || row.payload?.variant_image || row.payload?.img || (row.payload?.other_images && row.payload.other_images[0]) || (row.payload?.imgs && row.payload.imgs[0])) ? (
                                  <img
                                    src={resolveImageUrl(row.payload.primary_img || row.payload.image_url || row.payload.variant_image || row.payload.img || row.payload?.other_images?.[0] || row.payload?.imgs?.[0])}
                                    alt={row.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                                  />
                                ) : (
                                  <span className="cp-muted" style={{ fontSize: '11px' }}>No Image</span>
                                )}
                              </td>
                              <td><strong>{row.title}</strong></td>
                              <td>{getStatusTag(row.status)}</td>
                              <td>{row.created_by_name || row.createdBy || 'Creator'}</td>
                              <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      disabled={isPending}
                                      onClick={() => !isPending && handleToggleView('variant', row)}
                                      style={{
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '6px',
                                        border: '1px solid var(--cp-border)',
                                        background: row.view === 'hide' ? '#f1f5f9' : '#eff6ff',
                                        borderColor: row.view === 'hide' ? '#cbd5e1' : '#bfdbfe',
                                        color: row.view === 'hide' ? '#64748b' : '#2563eb',
                                        opacity: isPending ? 0.35 : 1,
                                        cursor: isPending ? 'not-allowed' : 'pointer',
                                      }}
                                      title={isPending ? 'Record is locked while pending approval' : (row.view === 'hide' ? 'Hidden on Website (Click to View)' : 'Visible on Website (Click to Hide)')}
                                    >
                                      {row.view === 'hide' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                          <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon"
                                      onClick={() => openHistoryDrawer('variant', row)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', background: '#F8FAFC', color: '#003E7E' }}
                                      title="View History & Audit Timeline"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--primary"
                                      disabled={isPending}
                                      onClick={() => !isPending && navigate(`/app/products/create-variant?editId=${row.id}`)}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Edit Variant'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      className="cp-btn-icon cp-btn-icon--danger"
                                      disabled={isPending}
                                      onClick={() => !isPending && setDeleteTarget({ type: 'variant', item: row })}
                                      style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                      title={isPending ? 'Record is locked while pending approval' : 'Set Inactive (Delete)'}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                    </button>
                                  </PermissionGate>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <TablePagination
                    page={varPage}
                    onChange={setVarPage}
                    total={varTotal}
                    pageSize={10}
                    labelSingle="variant"
                    labelPlural="variants"
                  />
                </>
              ))}
          </section>
        )}

        {/* 4. Bulk Upload Form */}
        {activeTab === 'bulk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => handleTabChange('products')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Back to Tables</span>
              </button>
            </div>
            <PermissionGate permission={PERMISSIONS.PRODUCTS_WRITE}>
              <BulkUploadForm
                title="Bulk Import Hierarchy via Excel"
                description="Download the structured template, specify Category, Sub Category, and Product records, then select files and import."
                templateUrl={enterpriseApi.downloadProductsTemplateUrl(token)}
                processButtonLabel="Process Hierarchy Upload"
                uploading={bulkUploading}
                uploadStats={uploadStats}
                uploadErrors={uploadErrors}
                downloadUrl={downloadUrl}
                onUpload={async (file, images) => {
                  setBulkUploading(true);
                  setUploadStats(null);
                  setUploadErrors([]);
                  setDownloadUrl('');
                  try {
                    const res = await enterpriseApi.bulkUploadProducts(token, file, images);
                    if (res.stats) setUploadStats(res.stats);
                    if (res.report) setUploadErrors(res.report.filter(r => r.status === 'failed'));
                    if (res.downloadUrl) setDownloadUrl(res.downloadUrl);
                    if (res.stats && res.stats.failed > 0) {
                      notify.warning(`Bulk upload completed with ${res.stats.failed} failures.`);
                    } else {
                      notify.success('Bulk Upload Completed Successfully', res.message);
                      setActiveTab('products');
                    }
                    emitUnreadRefresh();
                    await loadAllData();
                  } catch (err) {
                    notify.apiError(err, 'Bulk upload failed');
                  } finally {
                    setBulkUploading(false);
                  }
                }}
                onClearReport={clearUploadReport}
                imageLabel="Choose Accompanying Product Images (Optional)"
              />
            </PermissionGate>
          </div>
        )}

        {selectedProductDetails && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              padding: '24px'
            }}
            onClick={() => setSelectedProductDetails(null)}
          >
            <div
              style={{
                backgroundColor: 'var(--cp-surface, #ffffff)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '850px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--cp-border, #e2e8f0)',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--cp-border, #e2e8f0)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--cp-surface, #ffffff)'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--cp-text, #0f172a)', margin: 0 }}>
                    Product Details: {selectedProductDetails.title}
                  </h3>
                  <p className="cp-muted" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                    ID: {selectedProductDetails.payload?.prd_id} | Code: {selectedProductDetails.payload?.productCode || 'N/A'}
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--cp-muted, #64748b)',
                    fontSize: '24px',
                    lineHeight: '1',
                    padding: '4px'
                  }}
                  onClick={() => setSelectedProductDetails(null)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Main Product Section */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Product Image */}
                  <div style={{ flexShrink: 0 }}>
                    {selectedProductDetails.payload?.product_image ? (
                      <img
                        src={resolveImageUrl(selectedProductDetails.payload.product_image)}
                        alt={selectedProductDetails.title}
                        style={{
                          width: '180px',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '1px solid var(--cp-border, #e2e8f0)',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '180px',
                          height: '180px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--cp-bg, #f8fafc)',
                          border: '1px dashed var(--cp-border, #e2e8f0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--cp-muted)'
                        }}
                      >
                        No Image Uploaded
                      </div>
                    )}
                  </div>

                  {/* Hierarchy Info */}
                  <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ background: 'var(--cp-bg, #f8fafc)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--cp-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Category ID</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cp-text)' }}>{selectedProductDetails.payload?.cat_id || '—'}</span>
                      </div>
                      <div style={{ background: 'var(--cp-bg, #f8fafc)', padding: '12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--cp-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Sub Category ID</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cp-text)' }}>{selectedProductDetails.payload?.sub_cat_id || '—'}</span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--cp-bg, #f8fafc)', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--cp-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>URL Route Path</span>
                      <a href={selectedProductDetails.payload?.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--cp-primary)', wordBreak: 'break-all' }}>
                        {selectedProductDetails.payload?.url || '—'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--cp-text)' }}>Product Description</h4>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--cp-text-muted, #475569)', background: 'var(--cp-bg, #f8fafc)', padding: '16px', borderRadius: '8px' }}>
                    {selectedProductDetails.payload?.productDescription || 'No description provided.'}
                  </p>
                </div>

                {/* Features (Bullet Points) */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--cp-text)' }}>Key Features</h4>
                  {renderFormattedContent(selectedProductDetails.payload?.product_features)}
                </div>

                {/* Specifications Grid */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--cp-text)' }}>Product Specifications</h4>
                  {renderFormattedContent(selectedProductDetails.payload?.product_specifications)}
                </div>

                {/* Variants Section - Only loaded if has_variants is yes */}
                <div style={{ borderTop: '1px solid var(--cp-border, #e2e8f0)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--cp-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Variants
                    {selectedProductDetails.payload?.has_variants === 'yes' ? (
                      <span className="cp-tag cp-tag-success" style={{ fontSize: '10px', padding: '2px 6px', textTransform: 'none' }}>Yes ({selectedProductDetails.payload?.variants?.length || 0})</span>
                    ) : (
                      <span className="cp-tag cp-tag-info" style={{ fontSize: '10px', padding: '2px 6px', textTransform: 'none' }}>No</span>
                    )}
                  </h4>
                  {selectedProductDetails.payload?.has_variants === 'yes' && Array.isArray(selectedProductDetails.payload?.variants) && selectedProductDetails.payload.variants.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginTop: '8px' }}>
                      {selectedProductDetails.payload.variants.map((v, i) => (
                        <div key={i} style={{
                          background: 'var(--cp-bg, #f8fafc)',
                          border: '1px solid var(--cp-border, #e2e8f0)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          {/* Image box */}
                          <div style={{ width: '100%', height: '100px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(v.primary_img || v.image_url || v.variant_image || v.img || (v.other_images && v.other_images[0])) ? (
                              <img
                                src={resolveImageUrl(v.primary_img || v.image_url || v.variant_image || v.img || v.other_images?.[0])}
                                alt={v.variantName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--cp-muted)' }}>No Image</span>
                            )}
                          </div>
                          {/* Text info */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--cp-muted)', fontFamily: 'monospace' }}>{v.variantId}</span>
                            <strong style={{ fontSize: '12px', color: 'var(--cp-text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.variantName}>
                              {v.variantName}
                            </strong>
                            {v.color_finish && (
                              <span style={{ fontSize: '11px', color: 'var(--cp-text-muted)', display: 'block' }}>
                                🎨 {v.color_finish}
                              </span>
                            )}
                            {v.sku && (
                              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                                SKU: {v.sku}
                              </span>
                            )}
                            {typeof v.variant_order !== 'undefined' && (
                              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                                Order: {v.variant_order}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--cp-muted)' }}>
                      No variants configured. Time saved by skipping variant checks.
                    </p>
                  )}
                </div>

                {/* Kits Section */}
                <div style={{ borderTop: '1px solid var(--cp-border, #e2e8f0)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--cp-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Kits/Bundles
                    {selectedProductDetails.payload?.has_kits === 'yes' ? (
                      <span className="cp-tag cp-tag-success" style={{ fontSize: '10px', padding: '2px 6px', textTransform: 'none' }}>Yes ({selectedProductDetails.payload?.kits?.length || 0})</span>
                    ) : (
                      <span className="cp-tag cp-tag-info" style={{ fontSize: '10px', padding: '2px 6px', textTransform: 'none' }}>No</span>
                    )}
                  </h4>
                  {selectedProductDetails.payload?.has_kits === 'yes' && Array.isArray(selectedProductDetails.payload?.kits) && selectedProductDetails.payload.kits.length > 0 ? (
                    <div className="cp-accounts-table-wrap" style={{ margin: 0 }}>
                      <table className="cp-accounts-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Kit ID</th>
                            <th>Kit Name</th>
                            <th>Kit Display</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProductDetails.payload.kits.map((k, i) => (
                            <tr key={i}>
                              <td><code>{k.kitId}</code></td>
                              <td><strong>{k.kitName}</strong></td>
                              <td>{k.kitDisplay}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--cp-muted)' }}>
                      No kits configured.
                    </p>
                  )}
                </div>

                {/* SEO & Meta Section */}
                <div style={{ borderTop: '1px solid var(--cp-border, #e2e8f0)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--cp-text)' }}>SEO & Social Media Previews</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--cp-muted)', fontWeight: '600' }}>SEARCH ENGINE PREVIEW</span>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', fontFamily: 'Arial, sans-serif' }}>
                          <span style={{ color: '#1a0dab', fontSize: '16px', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedProductDetails.payload?.seo_meta_title || selectedProductDetails.title}
                          </span>
                          <span style={{ color: '#006621', fontSize: '12px', display: 'block', margin: '2px 0' }}>
                            {selectedProductDetails.payload?.canonical_url || `https://taiton.in${selectedProductDetails.payload?.url || ''}`}
                          </span>
                          <span style={{ color: '#545454', fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {selectedProductDetails.payload?.seo_meta_description || 'Snippet description for search engines.'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--cp-muted)', fontWeight: '600' }}>SOCIAL MEDIA (OG) PREVIEW</span>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', fontFamily: 'sans-serif' }}>
                          {selectedProductDetails.payload?.og_image && (
                            <img src={resolveImageUrl(selectedProductDetails.payload.og_image)} alt="OG Card" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                          )}
                          <div style={{ padding: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', color: '#1d2129' }}>
                              {selectedProductDetails.payload?.og_title || selectedProductDetails.payload?.seo_meta_title || selectedProductDetails.title}
                            </span>
                            <span style={{ fontSize: '11px', color: '#90949c', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '4px' }}>
                              {selectedProductDetails.payload?.og_description || selectedProductDetails.payload?.seo_meta_description || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--cp-border, #e2e8f0)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  background: 'var(--cp-bg, #f8fafc)'
                }}
              >
                <button
                  type="button"
                  className="cp-btn cp-btn-secondary"
                  onClick={() => setSelectedProductDetails(null)}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}



        {deleteTarget && (
          <ConfirmDeleteCard
            title={`Are you sure you want to delete "${deleteTarget.item.title}"?`}
            message="This action will deactivate the item and set its status to Inactive."
            confirmLabel="Yes, Delete"
            busy={deleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={async () => {
              setDeleting(true);
              await handleSoftDelete(deleteTarget.type, deleteTarget.item);
              setDeleting(false);
              setDeleteTarget(null);
            }}
          />
        )}

        {/* Offcanvas Right Side History & Audit Timeline Drawer */}
        <HistoryAuditDrawer
          target={historyTarget}
          onClose={() => setHistoryTarget(null)}
          auditLogs={auditLogs}
          loading={loadingAudit}
        />

        {/* Offcanvas Right Side Commons (Colours & Kits) Drawer */}
        <CommonsDrawer
          isOpen={commonsDrawerOpen}
          onClose={() => setCommonsDrawerOpen(false)}
          token={token}
        />
      </div>
    </PermissionRoute>
  );
}
