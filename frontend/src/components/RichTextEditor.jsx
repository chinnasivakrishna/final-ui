import { useEffect, useRef, useState } from 'react';

export function RichTextEditor({ value, onChange, placeholder = 'Write your formatted content here…', minHeight = '320px', onUploadImage }) {
  const editorRef = useRef(null);
  const imageFileInputRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [textColor, setTextColor] = useState('#003E7E');
  const [bgColor, setBgColor] = useState('#EEF6FF');

  // Sync value from outside if changed and not focused
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isSourceMode]);

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
      checkActiveFormats();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (onChange) onChange(html);
    }
  };

  const checkActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    });
  };

  const addLink = () => {
    const url = prompt('Enter URL link:', 'https://');
    if (url) exec('createLink', url);
  };

  const addImage = () => {
    if (imageFileInputRef.current) {
      imageFileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let uploadedUrl = '';
      if (onUploadImage) {
        uploadedUrl = await onUploadImage(file);
      } else {
        uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target.result);
          reader.readAsDataURL(file);
        });
      }
      if (uploadedUrl) {
        exec('insertImage', uploadedUrl);
      }
    } catch (err) {
      console.error('Image upload failed in RichTextEditor:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const addQuote = () => {
    exec('formatBlock', 'blockquote');
  };

  return (
    <div style={{ border: '1px solid var(--cp-border, #DCE5F0)', borderRadius: '8px', overflow: 'hidden', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      {/* WORD TOOLBAR CONTROLS */}
      <div style={{
        background: '#F8FAFC',
        borderBottom: '1px solid var(--cp-border, #DCE5F0)',
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        userSelect: 'none'
      }}>

        {/* Text Format dropdown */}
        <select
          onChange={(e) => exec('formatBlock', e.target.value)}
          defaultValue="<p>"
          style={{ height: '30px', padding: '0 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
        >
          <option value="<p>">Paragraph</option>
          <option value="<h1>">Heading 1 (H1)</option>
          <option value="<h2>">Heading 2 (H2)</option>
          <option value="<h3>">Heading 3 (H3)</option>
          <option value="<h4>">Heading 4 (H4)</option>
          <option value="<blockquote>">Quote Block</option>
          <option value="<pre>">Code Block</option>
        </select>

        {/* Font Family */}
        <select
          onChange={(e) => exec('fontName', e.target.value)}
          defaultValue="Inter"
          style={{ height: '30px', padding: '0 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
        >
          <option value="Inter">Font: Inter</option>
          <option value="Poppins">Font: Poppins</option>
          <option value="Roboto">Font: Roboto</option>
          <option value="Arial">Font: Arial</option>
          <option value="Georgia">Font: Georgia</option>
          <option value="Courier New">Font: Courier New</option>
        </select>

        <span style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 2px' }} />

        {/* Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onClick={() => exec('bold')}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            background: activeFormats.bold ? '#EEF6FF' : '#ffffff',
            color: activeFormats.bold ? '#003E7E' : '#1E293B',
            fontWeight: '700',
            cursor: 'pointer'
          }}
          title="Bold (Ctrl+B)"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => exec('italic')}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            background: activeFormats.italic ? '#EEF6FF' : '#ffffff',
            color: activeFormats.italic ? '#003E7E' : '#1E293B',
            fontStyle: 'italic',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => exec('underline')}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            background: activeFormats.underline ? '#EEF6FF' : '#ffffff',
            color: activeFormats.underline ? '#003E7E' : '#1E293B',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
          title="Underline (Ctrl+U)"
        >
          U
        </button>

        <button
          type="button"
          onClick={() => exec('strikeThrough')}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            background: activeFormats.strikeThrough ? '#EEF6FF' : '#ffffff',
            color: activeFormats.strikeThrough ? '#003E7E' : '#1E293B',
            textDecoration: 'line-through',
            cursor: 'pointer'
          }}
          title="Strikethrough"
        >
          S
        </button>

        <span style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 2px' }} />

        {/* Text Color Picker & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Color:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              exec('foreColor', e.target.value);
            }}
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            title="Text Color"
          />
          {['#003E7E', '#0D63C9', '#1E293B', '#EF4444', '#10B981'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setTextColor(c);
                exec('foreColor', c);
              }}
              style={{ width: '18px', height: '18px', borderRadius: '50%', background: c, border: '1px solid #CBD5E1', cursor: 'pointer', padding: 0 }}
              title={`Set text color to ${c}`}
            />
          ))}
        </div>

        {/* Highlight Color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Highlight:</label>
          <button
            type="button"
            onClick={() => exec('hiliteColor', '#FEF08A')}
            style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#FEF08A', border: '1px solid #CBD5E1', cursor: 'pointer' }}
            title="Yellow Highlight"
          />
          <button
            type="button"
            onClick={() => exec('hiliteColor', '#EEF6FF')}
            style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#EEF6FF', border: '1px solid #CBD5E1', cursor: 'pointer' }}
            title="Blue Highlight"
          />
        </div>

        <span style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 2px' }} />

        {/* Lists */}
        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          style={{
            padding: '4px 8px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            background: activeFormats.insertUnorderedList ? '#EEF6FF' : '#ffffff',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Bulleted List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => exec('insertOrderedList')}
          style={{
            padding: '4px 8px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            background: activeFormats.insertOrderedList ? '#EEF6FF' : '#ffffff',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Numbered List"
        >
          1. List
        </button>

        {/* Alignments */}
        <button
          type="button"
          onClick={() => exec('justifyLeft')}
          style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
          title="Align Left"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => exec('justifyCenter')}
          style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
          title="Align Center"
        >
          ≂
        </button>
        <button
          type="button"
          onClick={() => exec('justifyRight')}
          style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
          title="Align Right"
        >
          ≡
        </button>

        <span style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 2px' }} />

        {/* Link, Image, Quote, HR */}
        <button
          type="button"
          onClick={addLink}
          style={{ padding: '4px 8px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
          title="Insert Link"
        >
          🔗 Link
        </button>

        <input
          type="file"
          ref={imageFileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onClick={addImage}
          style={{ padding: '4px 8px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
          title="Insert Image (Upload from device)"
        >
          🖼️ Image
        </button>

        <button
          type="button"
          onClick={addQuote}
          style={{ padding: '4px 8px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
          title="Quote Block"
        >
          “ Quote
        </button>

        <button
          type="button"
          onClick={() => exec('insertHorizontalRule')}
          style={{ padding: '4px 8px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
          title="Horizontal Divider Line"
        >
          ― HR
        </button>

        <span style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 2px' }} />

        {/* Clear & Undo/Redo */}
        <button
          type="button"
          onClick={() => exec('removeFormat')}
          style={{ padding: '4px 8px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '12px', cursor: 'pointer' }}
          title="Clear Formatting"
        >
          🧹 Clear
        </button>

        <button
          type="button"
          onClick={() => exec('undo')}
          style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>

        <button
          type="button"
          onClick={() => exec('redo')}
          style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>

        {/* Mode Toggle: Visual vs HTML Source */}
        <button
          type="button"
          onClick={() => setIsSourceMode(!isSourceMode)}
          style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            height: '30px',
            borderRadius: '4px',
            border: '1px solid #003E7E',
            background: isSourceMode ? '#003E7E' : '#EEF6FF',
            color: isSourceMode ? '#ffffff' : '#003E7E',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {isSourceMode ? 'Visual Editor Mode' : '&lt;/&gt; HTML Source'}
        </button>
      </div>

      {/* EDITING AREA */}
      {isSourceMode ? (
        <textarea
          value={value || ''}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          style={{
            width: '100%',
            minHeight,
            padding: '16px',
            border: 'none',
            outline: 'none',
            fontFamily: "'Courier New', monospace",
            fontSize: '13px',
            lineHeight: '1.6',
            background: '#1E293B',
            color: '#E2E8F0',
            boxSizing: 'border-box'
          }}
          placeholder="HTML Source Code..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={checkActiveFormats}
          onMouseUp={checkActiveFormats}
          style={{
            minHeight,
            padding: '16px',
            outline: 'none',
            fontSize: '15px',
            lineHeight: '1.8',
            color: '#1E293B',
            background: '#ffffff',
            boxSizing: 'border-box'
          }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
}
