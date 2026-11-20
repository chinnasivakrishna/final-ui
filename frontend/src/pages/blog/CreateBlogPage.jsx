import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { RichTextEditor } from '../../components/RichTextEditor.jsx';
import { notify } from '../../utils/notify.js';
import { emitUnreadRefresh } from '../../utils/events.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

const extractTocFromHtml = (htmlContent) => {
  if (!htmlContent) return [];
  const regex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) matches.push(text);
  }
  return matches;
};

const DEFAULT_BLOG_CONTENT = `<h3 style="color:#003E7E; font-weight:700; font-family:'Poppins',sans-serif; margin-top:1.5rem; margin-bottom:0.8rem;">1. Frameless Sliding Glass Partitions</h3>
<p>Frameless systems create a seamless, minimal look that works beautifully in open-plan offices. Paired with soft-close hardware, they offer near-silent operation and a premium feel.</p>

<h3 style="color:#003E7E; font-weight:700; font-family:'Poppins',sans-serif; margin-top:1.5rem; margin-bottom:0.8rem;">2. 5D Embossed Textured Glass</h3>
<p>Textured, high-depth glass printing adds visual interest to meeting rooms and reception areas without compromising light transmission.</p>`;

export function CreateBlogPage() {
  const { user, token, setSidebarCollapsed } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // Preview & Split View
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [zoom, setZoom] = useState(1.0);

  // Form states
  const [blogId, setBlogId] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [url, setUrl] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [h1Tag, setH1Tag] = useState('');
  const [authorName, setAuthorName] = useState(user?.fullName || user?.displayName || user?.name || user?.email || '');
  const [authorRole, setAuthorRole] = useState('Editor');
  const [authorBio, setAuthorBio] = useState('Author at TAITON, covering architectural hardware, glass systems and interior design.');
  const [authorImage, setAuthorImage] = useState('');
  const [blogCategory, setBlogCategory] = useState('Design Trends');
  const [readingTime, setReadingTime] = useState('6 min read');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [blogContent, setBlogContent] = useState(DEFAULT_BLOG_CONTENT);
  const [quoteText, setQuoteText] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [status, setStatus] = useState('live');
  const [submitting, setSubmitting] = useState(false);

  // On This Page Table of Contents State
  const [tocPoints, setTocPoints] = useState([
    '1. Frameless Sliding Partitions',
    '2. 5D Embossed Glass',
    '3. Smart Privacy Glass',
    '4. Black-Framed Partitions',
    '5. Acoustic Glass Partitions'
  ]);

  const addTocPoint = () => setTocPoints([...tocPoints, `${tocPoints.length + 1}. `]);
  const updateTocPoint = (index, value) => {
    const updated = [...tocPoints];
    updated[index] = value;
    setTocPoints(updated);
  };
  const removeTocPoint = (index) => setTocPoints(tocPoints.filter((_, i) => i !== index));

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

  // Additional content
  const [relatedProducts, setRelatedProducts] = useState('');
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const slugify = (text) => {
    return 'blog-' + String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setBlogTitle(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setBlogId(slugify(val));
    setUrlSlug(slug);
    setH1Tag(val);
    if (!editId && !seoTitle) setSeoTitle(`${val} | TAITON`);
  };

  const handleImageUpload = async (e, setUrlFn) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      const res = await enterpriseApi.uploadImage(token, file);
      setUrlFn(res.url);
      notify.success('Uploaded', 'Image uploaded successfully!');
    } catch (err) {
      notify.apiError(err, 'Upload failed');
    }
  };

  useEffect(() => {
    if (editId && token) {
      const loadBlogDetails = async () => {
        try {
          const res = await enterpriseApi.contentDetail(token, 'blog', editId);
          const blogItem = res.item || res.data || res;
          if (blogItem) {
            const p = blogItem.payload || blogItem;
            setBlogId(p.blog_id || `blog-${blogItem.id || editId}`);
            setBlogTitle(blogItem.title || p.title || '');
            setUrl(p.url || '');
            setUrlSlug(p.url_slug || '');
            setH1Tag(p.h1_tag || blogItem.title || '');
            setAuthorName(p.author_name || p.written_by || user?.fullName || user?.displayName || user?.name || user?.email || '');
            setAuthorRole(p.author_role || 'Design Editor');
            setAuthorBio(p.author_bio || '');
            setAuthorImage(p.author_image || p.author_photo || p.author_avatar || '');
            setBlogCategory(p.blog_category || p.highlighter || 'Design Trends');
            setReadingTime(p.reading_time || '6 min read');
            setFeaturedImage(p.featured_image || p.primary_image || '');
            setImageAltText(p.image_alt_text || p.img_alt || '');
            setBlogContent(p.blog_content || p.post_content || DEFAULT_BLOG_CONTENT);
            setQuoteText(p.quote_text || '');
            setSeoTitle(p.seo_meta_title || p.seo_title || blogItem.title || '');
            setSeoDesc(p.seo_meta_description || p.seo_desc || blogItem.summary || p.description || '');
            setFocusKeyword(p.focus_keyword || p.focus_keywords || '');
            setSecondaryKeywords(p.secondary_keywords || p.keywords || '');
            setCanonicalUrl(p.canonical_url || '');
            setRobotsTag(p.robots_tag || p.robot || 'index, follow');
            setOgTitle(p.og_title || p.seo_meta_title || blogItem.title || '');
            setOgDescription(p.og_description || p.seo_meta_description || blogItem.summary || '');
            setOgImage(p.og_image || p.featured_image || p.primary_image || '');
            setRelatedProducts(p.related_products || '');
            setStatus(blogItem.status || 'live');
            if (Array.isArray(p.toc_points) && p.toc_points.length > 0) {
              setTocPoints(p.toc_points);
            }
            if (Array.isArray(p.faq_section) && p.faq_section.length > 0) {
              setFaqs(p.faq_section);
            }
            if (p.publish_date) setPublishDate(p.publish_date.replace(' ', 'T').slice(0, 16));
          }
        } catch (e) {
          notify.error('Error loading blog details', e.message);
        }
      };
      loadBlogDetails();
    }
  }, [editId, token]);

  const togglePreview = () => {
    const nextVal = !showLivePreview;
    setShowLivePreview(nextVal);
    setSidebarCollapsed(nextVal);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!blogTitle.trim()) {
      notify.formWarning('Blog Article Title is required.');
      return;
    }
    setSubmitting(true);
    try {
      const faqList = faqs.map(f => ({ question: f.question.trim(), answer: f.answer.trim() })).filter(f => f.question && f.answer);
      const computedBlogId = blogId.trim() || slugify(blogTitle.trim());

      const payload = {
        blog_id: computedBlogId,
        url: url.trim() || `/blogs/${urlSlug.trim()}`,
        url_slug: urlSlug.trim(),
        h1_tag: h1Tag.trim() || blogTitle.trim(),
        author_name: authorName.trim(),
        author_role: authorRole.trim(),
        author_bio: authorBio.trim(),
        author_image: authorImage.trim() || null,
        blog_category: blogCategory.trim(),
        reading_time: readingTime.trim(),
        featured_image: featuredImage.trim() || null,
        image_alt_text: imageAltText.trim() || null,
        blog_content: blogContent.trim(),
        quote_text: quoteText.trim() || null,
        publish_date: publishDate ? new Date(publishDate).toISOString().slice(0, 19).replace('T', ' ') : null,
        seo_meta_title: seoTitle.trim(),
        seo_meta_description: seoDesc.trim(),
        focus_keyword: focusKeyword.trim() || null,
        secondary_keywords: secondaryKeywords.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        robots_tag: robotsTag.trim() || 'index, follow',
        og_title: ogTitle.trim() || seoTitle.trim(),
        og_description: ogDescription.trim() || seoDesc.trim(),
        og_image: ogImage.trim() || featuredImage.trim() || null,
        toc_points: extractTocFromHtml(blogContent),
        faq_section: faqList,
        related_products: relatedProducts.trim() || null,
        status: status || 'live',
      };

      const res = editId
        ? await enterpriseApi.contentUpdate(token, 'blog', editId, {
          title: blogTitle.trim(),
          summary: seoDesc.trim().slice(0, 150) || blogTitle.trim(),
          payload,
        })
        : await enterpriseApi.contentCreate(token, 'blog', {
          title: blogTitle.trim(),
          summary: seoDesc.trim().slice(0, 150) || blogTitle.trim(),
          payload,
        });

      notify.success((res.item || res)?.status === 'pending_approval' ? 'Submitted for Approval' : 'Blog Post Saved', (res.item || res)?.message ?? 'Blog post saved.');
      emitUnreadRefresh();
      navigate('/app/blog');
    } catch (err) {
      notify.apiError(err, editId ? 'Failed to update blog post' : 'Failed to create blog post');
    } finally {
      setSubmitting(false);
    }
  };

  const getAuthorInitials = (name) => {
    if (!name) return 'RS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="cp-stack" style={{ overflow: showLivePreview ? 'hidden' : 'visible' }}>
      <PageBreadcrumb parent="Blogs" parentUrl="/app/blog" current={editId ? "Edit Blog Post" : "Create Blog Post"} />
      
      {/* Top Header matching Add Product page style */}
      <div className="cp-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="cp-page-title">{editId ? "Edit Blog Post" : "Add Blog Post"}</h1>
          <p className="cp-muted">Configure article headers, body content, SEO metadata and live preview.</p>
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
              1. Article Basic Information
            </h3>

            <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
              <label className="cp-field" style={{ gridColumn: 'span 2' }}>
                <span className="cp-field-label-text">Blog Article Title <span className="cp-req">*</span></span>
                <input
                  type="text"
                  className="cp-input"
                  value={blogTitle}
                  onChange={handleTitleChange}
                  placeholder="e.g. 10 Modern Glass Partition Ideas for Office Interiors in 2026"
                  required
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Category</span>
                <select
                  className="cp-input"
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                >
                  <option value="Design Trends">Design Trends</option>
                  <option value="Product Guides">Product Guides</option>
                  <option value="Industry News">Industry News</option>
                  <option value="Case Studies">Case Studies</option>
                  <option value="Tips & How-To's">Tips & How-To's</option>
                  <option value="Company News">Company News</option>
                </select>
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Reading Time</span>
                <input
                  type="text"
                  className="cp-input"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="e.g. 6 min read"
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Author Name</span>
                <input
                  type="text"
                  className="cp-input"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Author Name"
                />
              </label>

              <label className="cp-field">
                <span className="cp-field-label-text">Author Role / Title</span>
                <input
                  type="text"
                  className="cp-input"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g. Design Editor"
                />
              </label>

              <div className="cp-field" style={{ gridColumn: 'span 2' }}>
                <span className="cp-field-label-text">Author Profile Photo</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {authorImage && (
                    <img
                      src={resolveImageUrl(authorImage)}
                      alt="Author Avatar"
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--cp-border)' }}
                    />
                  )}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="cp-input"
                      style={{ width: '100%', paddingRight: '110px' }}
                      value={authorImage ? 'Photo Uploaded' : ''}
                      readOnly
                      placeholder="No photo uploaded"
                    />
                    <input
                      type="file"
                      id="blog-author-file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setAuthorImage)}
                    />
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => document.getElementById('blog-author-file').click()}
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
                      Choose File
                    </button>
                  </div>
                </div>
              </div>

              <label className="cp-field" style={{ gridColumn: 'span 2' }}>
                <span className="cp-field-label-text">Author Bio / Profile Summary</span>
                <textarea
                  className="cp-input"
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Short bio displayed at bottom of article..."
                  rows={2}
                />
              </label>

            </div>

            {/* Article Media & Content */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '10px', marginTop: '10px', margin: 0 }}>
              2. Featured Media & Article Content
            </h3>

            <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
              <div className="cp-field">
                <span className="cp-field-label-text">Featured Image</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {featuredImage && (
                    <img
                      src={resolveImageUrl(featuredImage)}
                      alt="Featured Image Preview"
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--cp-border)' }}
                    />
                  )}
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="cp-input"
                      style={{ width: '100%', paddingRight: '110px' }}
                      value={featuredImage ? 'Image Uploaded' : ''}
                      readOnly
                      placeholder="No image uploaded"
                    />
                    <input
                      type="file"
                      id="blog-featured-file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFeaturedImage)}
                    />
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary"
                      onClick={() => document.getElementById('blog-featured-file').click()}
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
                      Choose File
                    </button>
                  </div>
                </div>
              </div>

              <label className="cp-field">
                <span className="cp-field-label-text">Image Alt Text</span>
                <input
                  type="text"
                  className="cp-input"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Descriptive alt text for SEO"
                />
              </label>
            </div>

            <label className="cp-field cp-field--full">
              <span className="cp-field-label-text">Highlighted Key Quote (Optional)</span>
              <input
                type="text"
                className="cp-input"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="e.g. 'Glass partitions redefine workplace transparency...'"
              />
            </label>

            <label className="cp-field cp-field--full">
              <span className="cp-field-label-text">Full Article Body Content (Rich Text Editor)</span>
              <RichTextEditor
                value={blogContent}
                onChange={setBlogContent}
                onUploadImage={async (file) => {
                  const res = await enterpriseApi.uploadImage(token, file);
                  return resolveImageUrl(res.url);
                }}
                placeholder="Write full article body..."
              />
            </label>

            {/* SEO Management */}
            <h3 style={{ fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--cp-border)', paddingBottom: '10px', marginTop: '10px', margin: 0 }}>
              3. SEO & Search Engine Management
            </h3>

            <div className="cp-grid cp-grid-2" style={{ gap: '16px 20px' }}>
              <label className="cp-field">
                <span className="cp-field-label-text">SEO Meta Title <span className="cp-req">*</span></span>
                <input
                  type="text"
                  className="cp-input"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. 10 Modern Glass Partition Ideas for Office Interiors in 2026 | TAITON"
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
                  placeholder="e.g. glass partition ideas"
                />
              </label>

              <label className="cp-field cp-field--full">
                <span className="cp-field-label-text">SEO Meta Description <span className="cp-req">*</span></span>
                <textarea
                  className="cp-input"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="From frameless sliding systems to 5D embossed finishes, explore glass partition trends..."
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
                  placeholder="Glass Partitions, Office Design, 2026 Trends"
                />
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
                  <option value="live">Live / Published</option>
                </select>
              </label>
            </div>

            <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => navigate('/app/blog')}
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
                {submitting ? 'Saving Article…' : editId ? 'Update Blog Post' : 'Save Blog Post'}
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
                Live Website Blog Preview
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
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
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
                      gap: '6px'
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
                      gap: '6px'
                    }}
                    title="Desktop View"
                  >
                    Desktop
                  </button>
                </div>

                {/* Zoom Selector */}
                <select
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{
                    padding: '5px 8px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  <option value={0.75}>75%</option>
                  <option value={1.0}>100%</option>
                  <option value={1.25}>125%</option>
                </select>
              </div>
            </div>

            {/* PREVIEW FRAME WRAPPER */}
            <div style={{
              overflowX: 'auto',
              padding: '12px',
              background: '#E2E8F0',
              borderRadius: '8px',
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
              }}>

                {/* ARTICLE HEADER */}
                <div style={{ padding: '24px 20px 16px 20px', background: '#ffffff' }}>
                  <span style={{ background: '#EEF6FF', color: '#003E7E', fontSize: '0.7rem', fontWeight: '700', padding: '0.3rem 0.8rem', borderRadius: '20px', display: 'inline-block' }}>
                    {blogCategory}
                  </span>

                  <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', fontSize: previewDevice === 'mobile' ? '1.3rem' : '2.1rem', margin: '14px 0 14px 0', color: '#1E293B', lineHeight: '1.3' }}>
                    {blogTitle || '10 Modern Glass Partition Ideas for Office Interiors in 2026'}
                  </h1>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #DCE5F0', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#475569' }}>
                      {authorImage ? (
                        <img
                          src={resolveImageUrl(authorImage)}
                          alt={authorName}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#003E7E', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0 }}>
                          {getAuthorInitials(authorName)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: '#1E293B' }}>{authorName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{authorRole}</div>
                      </div>

                      {/* Calendar Icon */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        📅 Feb 2026
                      </span>

                      {/* Clock Icon */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ⏱️ {readingTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FEATURED IMAGE */}
                <div style={{ padding: '0 20px 20px 20px', background: '#ffffff' }}>
                  {featuredImage ? (
                    <img
                      src={resolveImageUrl(featuredImage)}
                      alt={imageAltText || blogTitle}
                      style={{ width: '100%', aspectRatio: '16/8', objectFit: 'cover', borderRadius: '12px', border: '1px solid #DCE5F0' }}
                    />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '16/8', background: 'repeating-linear-gradient(135deg,#EEF6FF,#EEF6FF 10px,#e3edfb 10px,#e3edfb 20px)', border: '1px dashed #4FA3FF', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0D63C9', fontSize: '0.75rem', fontWeight: '600', padding: '1rem' }}>
                      📷 Featured Article Cover Image
                    </div>
                  )}
                </div>

                {/* ARTICLE BODY */}
                <div style={{ padding: '20px', background: '#F8FAFC' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'desktop' ? '1fr 260px' : '1fr', gap: '1.8rem', alignItems: 'start' }}>
                    
                    <div>
                      {quoteText && (
                        <blockquote style={{ borderLeft: '4px solid #4FA3FF', background: '#EEF6FF', padding: '1rem 1.4rem', borderRadius: '0 8px 8px 0', fontStyle: 'italic', color: '#003E7E', fontWeight: '600', margin: '1rem 0' }}>
                          "{quoteText}"
                        </blockquote>
                      )}

                      <div
                        style={{ fontSize: '0.95rem', lineHeight: '1.85', color: '#1E293B' }}
                        dangerouslySetInnerHTML={{ __html: blogContent || DEFAULT_BLOG_CONTENT }}
                      />

                      {/* Author Card */}
                      <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: '1.2rem', display: 'flex', gap: '1rem', marginTop: '1.4rem' }}>
                        {authorImage ? (
                          <img
                            src={resolveImageUrl(authorImage)}
                            alt={authorName}
                            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' }}
                          />
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#003E7E', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', flex: '0 0 auto' }}>
                            {getAuthorInitials(authorName)}
                          </div>
                        )}
                        <div>
                          <h6 style={{ fontWeight: '700', margin: 0, fontSize: '0.9rem', color: '#1E293B' }}>{authorName}</h6>
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.3rem 0 0' }}>{authorBio}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Table of Contents (.toc-card) Dynamic Render from Headings */}
                    {previewDevice === 'desktop' && extractTocFromHtml(blogContent).length > 0 && (
                      <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '12px', padding: '1rem' }}>
                        <h6 style={{ fontWeight: '700', marginBottom: '0.6rem', fontSize: '0.85rem', color: '#1E293B' }}>On This Page</h6>
                        <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column' }}>
                          {extractTocFromHtml(blogContent).map((pt, idx) => (
                            <div key={idx} style={{ padding: '0.35rem 0', borderBottom: idx < extractTocFromHtml(blogContent).length - 1 ? '1px solid #DCE5F0' : 'none' }}>
                              {pt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
