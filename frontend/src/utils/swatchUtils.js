/**
 * Map a product variant color/finish string to a CSS class or inline background style.
 */
export function getSwatchPresentation(rawColor) {
  const label = String(rawColor || '').trim();
  if (!label) return null;

  const lower = label.toLowerCase();
  if (/^#([0-9a-f]{3,8})$/i.test(label) || /^rgba?\(/i.test(label)) {
    return {
      name: label,
      label,
      dotClass: '',
      style: { backgroundColor: label, borderColor: '#cbd5e1' },
    };
  }

  let dotClass = 'swatch-bg-sss';
  if (lower.includes('rose')) {
    dotClass = 'swatch-bg-rosegold';
  } else if (lower.includes('warm white')) {
    dotClass = 'swatch-bg-warm-white';
  } else if (lower.includes('neutral white') || lower === 'white') {
    dotClass = 'swatch-bg-neutral-white';
  } else if (lower === 'clear' || lower.includes('transparent')) {
    dotClass = 'swatch-bg-clear';
  } else if (lower.includes('nickel')) {
    dotClass = 'swatch-bg-nickel';
  } else if (lower.includes('silver')) {
    dotClass = 'swatch-bg-silver';
  } else if (lower.includes('antique') || lower.includes('brass') || lower.includes('bronze')) {
    dotClass = 'swatch-bg-antique-brass';
  } else if (lower.includes('gold')) {
    dotClass = 'swatch-bg-gold';
  } else if (lower.includes('black') || lower === 'bm' || lower.includes('matt black')) {
    dotClass = 'swatch-bg-bm';
  } else if (lower.includes('pss') || lower.includes('polished') || lower.includes('chrome')) {
    dotClass = 'swatch-bg-pss';
  } else if (lower === 'wd' || lower.includes('wood') || lower.includes('walnut')) {
    dotClass = 'swatch-bg-wd';
  } else if (lower.includes('phantom') || lower.includes('grey') || lower.includes('gray')) {
    dotClass = 'swatch-bg-phantom-grey';
  }

  return {
    name: label,
    label,
    dotClass,
    style: undefined,
  };
}

/**
 * Extract deduplicated swatch descriptors from a product's variants array.
 */
export function extractVariantSwatches(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return [];

  const seen = new Set();
  const swatches = [];
  for (const v of variants) {
    const raw = v?.color || v?.colour || v?.name || '';
    const swatch = getSwatchPresentation(raw);
    if (!swatch) continue;
    const key = swatch.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    swatches.push(swatch);
  }
  return swatches;
}

