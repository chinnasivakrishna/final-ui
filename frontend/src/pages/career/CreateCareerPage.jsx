import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { RichTextEditor } from '../../components/RichTextEditor.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';

export function CreateCareerPage() {
  const { token, setSidebarCollapsed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Preview & Split View
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [zoom, setZoom] = useState(1.0);

  // Form states
  const [jobId, setJobId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Sales');
  const [location, setLocation] = useState('Ahmedabad, India');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [experience, setExperience] = useState('3-5 Years');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('<p>We are seeking a dynamic <strong>Area Sales Manager</strong> to lead architectural hardware sales, engage key clients, architects, and interior designers across the region.</p>');
  const [requirements, setRequirements] = useState(['Clear communication and client handling skills', 'Minimum 3 years of architectural hardware sales experience']);
  const [applyEmail, setApplyEmail] = useState('careers@taiton.in');
  const [status, setStatus] = useState('draft');
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
    return 'job-' + String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setJobTitle(val);
    if (!editId) {
      setJobId(slugify(val));
      if (!seoTitle) setSeoTitle(`${val} Career Opening | TAITON`);
    }
  };

  useEffect(() => {
    if (editId && token) {
      const loadJobDetails = async () => {
        try {
          const res = await enterpriseApi.contentDetail(token, 'career', editId);
          const jobItem = res.item;
          if (jobItem) {
            const p = jobItem.payload || {};
            setJobId(p.job_id || '');
            setJobTitle(jobItem.title || '');
            setDepartment(p.department || 'Sales');
            setLocation(p.location || '');
            setEmploymentType(p.employment_type || 'Full-Time');
            setExperience(p.experience || '');
            setSalaryRange(p.salary_range || '');
            setDescription(p.description || '');
            setApplyEmail(p.apply_email || 'careers@taiton.in');
            setSeoTitle(p.seo_meta_title || '');
            setSeoDesc(p.seo_meta_description || '');
            setFocusKeyword(p.focus_keyword || '');
            setSecondaryKeywords(p.secondary_keywords || '');
            setCanonicalUrl(p.canonical_url || '');
            setRobotsTag(p.robots_tag || 'index, follow');
            setOgTitle(p.og_title || '');
            setOgDescription(p.og_description || '');
            setOgImage(p.og_image || '');
            setStatus(jobItem.status || 'draft');
            if (Array.isArray(p.requirements)) {
              setRequirements(p.requirements.length > 0 ? p.requirements : ['']);
            }
          }
        } catch (e) {
          notify.error('Error loading career details', e.message);
        }
      };
      loadJobDetails();
    }
  }, [editId, token]);

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (idx) => setRequirements(requirements.filter((_, i) => i !== idx));
  const updateRequirement = (idx, value) => {
    const updated = [...requirements];
    updated[idx] = value;
    setRequirements(updated);
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
    if (!jobId.trim() || !jobTitle.trim() || !seoTitle.trim() || !seoDesc.trim() || !description.trim()) {
      notify.formWarning('Job ID, Title, SEO Title, Description, and Details are required.');
      return;
    }
    setSubmitting(true);
    try {
      const reqList = requirements.map(r => r.trim()).filter(Boolean);

      const payload = {
        job_id: jobId.trim(),
        department: department.trim(),
        location: location.trim(),
        employment_type: employmentType,
        experience: experience.trim(),
        salary_range: salaryRange.trim() || null,
        description: description.trim(),
        requirements: reqList,
        apply_email: applyEmail.trim() || 'careers@taiton.in',
        seo_meta_title: seoTitle.trim(),
        seo_meta_description: seoDesc.trim(),
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        robots_tag: robotsTag.trim() || 'index, follow',
        og_title: ogTitle.trim() || seoTitle.trim(),
        og_description: ogDescription.trim() || seoDesc.trim(),
        og_image: ogImage.trim() || null,
        status,
      };

      const res = editId
        ? await enterpriseApi.contentUpdate(token, 'career', editId, {
          title: jobTitle.trim(),
          summary: seoDesc.trim().slice(0, 150) || jobTitle.trim(),
          payload,
        })
        : await enterpriseApi.contentCreate(token, 'career', {
          title: jobTitle.trim(),
          summary: seoDesc.trim().slice(0, 150) || jobTitle.trim(),
          payload,
        });

      notify.success((res.item || res)?.status === 'pending_approval' ? 'Submitted for Approval' : 'Job Opening Saved', (res.item || res)?.message ?? 'Job details saved.');
      emitUnreadRefresh();
      navigate('/app/careers');
    } catch (err) {
      notify.apiError(err, editId ? 'Failed to update job opening' : 'Failed to create job opening');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-stack" style={{ overflow: showLivePreview ? 'hidden' : 'visible' }}>
      <PageBreadcrumb parent="Careers" parentUrl="/app/careers" current={editId ? "Edit Job Opening" : "Create Job Opening"} />
      
      {/* Top Header matching Add Product page style */}
      <div className="cp-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="cp-page-title">{editId ? "Edit Job Opening" : "Add Job Opening"}</h1>
          <p className="cp-muted">Configure role specifications, requirements, SEO metadata and live preview.</p>
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
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '10px', margin: 0 }}>
              1. Role Specifications
            </h3>

            <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
              <label className="cp-field cp-field--full">
                <span className="cp-field-label-text">Job Title <span className="cp-req">*</span></span>
                <input
                  type="text"
                  className="cp-input"
                  value={jobTitle}
                  onChange={handleTitleChange}
                  placeholder="e.g. Area Sales Manager"
                  required
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Department</span>
                <select
                  className="cp-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Location</span>
                <input
                  type="text"
                  className="cp-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ahmedabad / Rajkot / Remote"
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Employment Type</span>
                <select
                  className="cp-input"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Experience Required</span>
                <input
                  type="text"
                  className="cp-input"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3-5 Years"
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Salary / Compensation Range</span>
                <input
                  type="text"
                  className="cp-input"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. ₹6,00,000 - ₹9,00,000 P.A."
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Application Contact Email</span>
                <input
                  type="email"
                  className="cp-input"
                  value={applyEmail}
                  onChange={(e) => setApplyEmail(e.target.value)}
                  placeholder="careers@taiton.in"
                />
              </label>
            </div>

            <div className="cp-field cp-field--full">
              <span className="cp-field-label-text" style={{ marginBottom: '8px', display: 'block' }}>
                Job Role Description (Word Rich Text Editor) <span className="cp-req">*</span>
              </span>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Write detailed job description and objectives..."
                minHeight="250px"
              />
            </div>

            {/* Dynamic Job Requirements */}
            <div className="cp-field cp-field--full" style={{ background: 'var(--cp-surface)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--cp-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="cp-field-label-text" style={{ fontSize: '14px', margin: 0, fontWeight: '700' }}>Role Requirements & Qualifications</span>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={addRequirement}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  + Add Point
                </button>
              </div>
              {requirements.map((req, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    className="cp-input"
                    style={{ flex: 1 }}
                    value={req}
                    onChange={(e) => updateRequirement(idx, e.target.value)}
                    placeholder={`Requirement Point #${idx + 1}`}
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      className="cp-btn-icon cp-btn-icon--danger"
                      onClick={() => removeRequirement(idx)}
                      style={{ minWidth: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--cp-border)', color: '#ef4444' }}
                      title="Delete Point"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* SEO Management */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '10px', marginTop: '10px', margin: 0 }}>
              2. SEO & Search Engine Management
            </h3>

            <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
              <label className="cp-field">
                <span className="cp-field-label-text">SEO Meta Title <span className="cp-req">*</span></span>
                <input
                  type="text"
                  className="cp-input"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Area Sales Manager Jobs in Ahmedabad | TAITON"
                  required
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Focus Keyword</span>
                <input
                  type="text"
                  className="cp-input"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. Area Sales Manager Jobs"
                />
              </label>

              <label className="cp-field cp-field--full">
                <span className="cp-field-label-text">SEO Meta Description <span className="cp-req">*</span></span>
                <textarea
                  className="cp-input"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Short role summary for search snippet..."
                  rows={3}
                  required
                />
              </label>

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

              <label className="cp-field">
                <span className="cp-field-label-text">Canonical URL</span>
                <input
                  type="text"
                  className="cp-input"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://taiton.in/careers/..."
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Robots Tag</span>
                <select
                  className="cp-input"
                  value={robotsTag}
                  onChange={(e) => setRobotsTag(e.target.value)}
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                </select>
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Publish Status</span>
                <select
                  className="cp-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="live">Live / Open Position</option>
                </select>
              </label>
            </div>

            <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => navigate('/app/careers')}
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
                {submitting ? 'Saving Opening…' : editId ? 'Update Job Opening' : 'Save Job Opening'}
              </button>
            </div>
          </form>
        </section>

        {/* EXACT LIVE PREVIEW PANEL WITH INDEPENDENT SCROLLBAR */}
        {showLivePreview && (
          <section className="cp-card cp-card-pad" style={{ flex: '1 1 50%', minWidth: 0, height: 'calc(100vh - 210px)', maxHeight: 'calc(100vh - 210px)', overflowY: 'auto', background: '#F8FAFC', border: '1px solid #E2E8F0', paddingBottom: '24px' }}>
            
            {/* Live Preview Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#003E7E', margin: 0 }}>
                Live Website Career Preview
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

                {/* Job Card */}
                <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', margin: '0 0 6px 0', fontSize: '16px', color: '#1E293B' }}>
                      {jobTitle || 'Area Sales Manager'}
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ background: '#EEF6FF', color: '#003E7E', fontWeight: '700', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>
                        {department}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>📍 {location || 'Ahmedabad'}</span>
                      <span>💼 {employmentType}</span>
                      <span>⏱️ {experience || '3-5 Years'}</span>
                    </div>
                  </div>
                  <button style={{ background: '#003E7E', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                    Apply Now →
                  </button>
                </div>

                {/* Detailed Role View */}
                <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 10px 0', color: '#003E7E' }}>
                    Role Overview & Responsibilities
                  </h4>
                  <div
                    style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', marginBottom: '14px' }}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />

                  <h5 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0', color: '#1E293B' }}>
                    Key Requirements:
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>
                    {requirements.filter(Boolean).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>

                  {salaryRange && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#EEF6FF', borderRadius: '6px', fontSize: '12px', color: '#003E7E', fontWeight: '600' }}>
                      💰 Estimated Salary Range: {salaryRange}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
