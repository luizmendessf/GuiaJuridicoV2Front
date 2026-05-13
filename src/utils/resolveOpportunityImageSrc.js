/**
 * Resolve o `src` final para imagens de oportunidades (presets locais vs ficheiros no backend).
 *
 * @param {string|null|undefined} raw Valor vindo da API (nome de ficheiro, URL completa, ou path /assets/…)
 * @param {Record<string, string>} imageMap Mapa de nomes lógicos (ex. estagio.jpg) para URLs de assets importados
 * @param {string} baseURL Base da API (ex. https://host/api)
 */
export function resolveOpportunityImageSrc(raw, imageMap, baseURL) {
  const defaultImg = imageMap['estagio.jpg'];
  if (raw == null || String(raw).trim() === '') {
    return defaultImg;
  }

  let s = String(raw).trim();
  const apiImagesMarker = '/api/images/';
  const markerIdx = s.indexOf(apiImagesMarker);
  if (markerIdx >= 0) {
    s = s.slice(markerIdx + apiImagesMarker.length).split('?')[0] || '';
  }

  if (!s) {
    return defaultImg;
  }

  if (s.startsWith('http') || s.startsWith('//')) {
    return s;
  }
  if (s.startsWith('/')) {
    return s;
  }

  const vitePresetKey = tryResolveViteHashedPresetKey(s, imageMap);
  if (vitePresetKey && imageMap[vitePresetKey]) {
    return imageMap[vitePresetKey];
  }

  if (imageMap[s]) {
    return imageMap[s];
  }

  const clean = s.replace(/^images\//, '');
  const slash = clean.startsWith('/') ? '' : '/';
  return `${baseURL}${slash}images/${clean}`;
}

/**
 * Assets do Vite usam o padrão `nome-<hash>.ext`; na BD às vezes cai só esse nome e o browser pedia /api/images/… (404).
 * @returns {string|null} chave em imageMap (ex. estagio.jpg) ou null
 */
export function tryResolveViteHashedPresetKey(filename, imageMapOrKeySet) {
  const m = filename.match(/^(.+)-([a-f0-9]{6,12})\.(jpe?g|png|gif|webp)$/i);
  if (!m) {
    return null;
  }
  const base = m[1];
  let ext = m[3].toLowerCase();
  if (ext === 'jpeg') {
    ext = 'jpg';
  }
  const key = `${base}.${ext}`;
  if (imageMapOrKeySet instanceof Set) {
    return imageMapOrKeySet.has(key) ? key : null;
  }
  return imageMapOrKeySet[key] ? key : null;
}

/** Valor do campo "imagem" no formulário: preset lógico ou nome de ficheiro enviado. */
export function logicalImageKeyForForm(raw, imageMapOrPresetKeySet) {
  if (raw == null || String(raw).trim() === '') {
    return 'estagio.jpg';
  }
  let s = String(raw).trim();
  if (s.includes('/api/images/')) {
    const f = imageFilenameFromUploadResponse(s);
    if (f) {
      s = f;
    }
  }
  const viteKey = tryResolveViteHashedPresetKey(s, imageMapOrPresetKeySet);
  if (viteKey) {
    return viteKey;
  }
  return s;
}

/** Extrai só o nome do ficheiro a partir da resposta de upload (URL completa). */
export function imageFilenameFromUploadResponse(uploadedUrl) {
  if (uploadedUrl == null || typeof uploadedUrl !== 'string') {
    return null;
  }
  const s = uploadedUrl.trim();
  const marker = '/api/images/';
  const i = s.indexOf(marker);
  if (i >= 0) {
    return s.slice(i + marker.length).split('?')[0] || null;
  }
  return s.includes('/') ? null : s;
}
