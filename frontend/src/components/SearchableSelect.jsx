import { useEffect, useRef, useState } from 'react';

export function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = '-- Select Option --',
  disabled = false,
  isMulti = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Multi-select vs single-select values
  const selectedValues = isMulti
    ? (Array.isArray(value) ? value : String(value || '').split(',').map((s) => s.trim()).filter(Boolean))
    : [];

  const selectedOptions = isMulti
    ? options.filter((opt) => selectedValues.includes(String(opt.value)))
    : [];

  const singleSelectedOption = !isMulti
    ? options.find((opt) => String(opt.value) === String(value))
    : null;

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      String(opt.label || '').toLowerCase().includes(search.toLowerCase()) ||
      String(opt.value || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    if (isMulti) {
      const valStr = String(val);
      let newVals;
      if (selectedValues.includes(valStr)) {
        newVals = selectedValues.filter((v) => v !== valStr);
      } else {
        newVals = [...selectedValues, valStr];
      }
      onChange(newVals);
    } else {
      onChange(val);
      setIsOpen(false);
      setSearch('');
    }
  };

  const removeTag = (e, valToRemove) => {
    e.stopPropagation();
    if (isMulti) {
      const newVals = selectedValues.filter((v) => v !== String(valToRemove));
      onChange(newVals);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'inherit',
      }}
    >
      {/* Collapsed Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: isMulti && selectedOptions.length ? '5px 10px' : '9px 12px',
          backgroundColor: disabled ? 'var(--cp-bg, #f1f5f9)' : 'var(--cp-bg, #eef2f6)',
          border: '1px solid var(--cp-border, #e2e8f0)',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          fontSize: '13px',
          color: (isMulti ? selectedOptions.length : singleSelectedOption) ? 'var(--cp-text, #0f172a)' : 'var(--cp-muted, #64748b)',
          fontWeight: (isMulti ? selectedOptions.length : singleSelectedOption) ? '500' : 'normal',
          minHeight: '40px',
          boxSizing: 'border-box',
          flexWrap: isMulti ? 'wrap' : 'nowrap',
          gap: isMulti ? '4px' : '0',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {isMulti ? (
            selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--cp-surface, #ffffff)',
                    border: '1px solid var(--cp-border, #cbd5e1)',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--cp-text, #0f172a)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                  <span
                    onClick={(e) => removeTag(e, opt.value)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      lineHeight: 1,
                      color: 'var(--cp-muted, #64748b)',
                      marginLeft: '2px',
                      fontWeight: 'bold',
                    }}
                    title="Remove"
                  >
                    ×
                  </span>
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--cp-muted, #64748b)' }}>{placeholder}</span>
            )
          ) : (
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {singleSelectedOption ? singleSelectedOption.label : placeholder}
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: '10px',
            color: 'var(--cp-muted, #64748b)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            marginLeft: '6px',
            flexShrink: 0,
          }}
        >
          ▲
        </span>
      </div>

      {/* Popover Dropdown Panel */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            minWidth: '240px',
            backgroundColor: 'var(--cp-surface, #ffffff)',
            border: '1px solid var(--cp-border, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            zIndex: 9999,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxSizing: 'border-box',
          }}
        >
          {/* Internal Search Input */}
          <input
            ref={searchInputRef}
            type="text"
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '12px',
              border: '1px solid var(--cp-border, #cbd5e1)',
              outline: 'none',
              borderRadius: '6px',
              backgroundColor: 'var(--cp-bg, #f8fafc)',
              boxSizing: 'border-box',
            }}
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Options List */}
          <ul
            style={{
              maxHeight: '190px',
              overflowY: 'auto',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {filteredOptions.length === 0 ? (
              <li
                style={{
                  padding: '8px 10px',
                  color: 'var(--cp-muted, #64748b)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                }}
              >
                No options found
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = isMulti
                  ? selectedValues.includes(String(opt.value))
                  : String(opt.value) === String(value);
                const optDisabled = Boolean(opt.disabled);

                return (
                  <li
                    key={opt.value}
                    style={{
                      padding: '7px 10px',
                      fontSize: '13px',
                      cursor: optDisabled ? 'not-allowed' : 'pointer',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? 'var(--cp-bg, #f1f5f9)' : 'transparent',
                      color: optDisabled ? 'var(--cp-muted, #94a3b8)' : 'var(--cp-text, #0f172a)',
                      opacity: optDisabled ? 0.6 : 1,
                      transition: 'background-color 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!optDisabled) e.currentTarget.style.backgroundColor = 'var(--cp-bg, #f1f5f9)';
                    }}
                    onMouseLeave={(e) => {
                      if (!optDisabled) {
                        e.currentTarget.style.backgroundColor = isSelected ? 'var(--cp-bg, #f1f5f9)' : 'transparent';
                      }
                    }}
                    onClick={() => !optDisabled && handleSelect(opt.value)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {isMulti && (
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            minWidth: '16px',
                            minHeight: '16px',
                            maxWidth: '16px',
                            maxHeight: '16px',
                            borderRadius: '4px',
                            border: isSelected
                              ? '1px solid var(--cp-primary, #2563eb)'
                              : '1px solid var(--cp-border, #cbd5e1)',
                            backgroundColor: isSelected
                              ? 'var(--cp-primary, #2563eb)'
                              : 'var(--cp-surface, #ffffff)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: optDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      <span
                        style={{
                          fontWeight: isSelected ? '600' : '400',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>

                    {opt.subLabel && (
                      <span
                        style={{
                          color: 'var(--cp-muted, #94a3b8)',
                          fontSize: '11px',
                          fontStyle: 'italic',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {opt.subLabel}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
