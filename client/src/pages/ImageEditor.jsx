import { useState, useRef, useCallback } from 'react';
import './ImageEditor.css';

/* ── Constants ── */
const SOLID_COLORS = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'White',       value: '#ffffff' },
  { label: 'Black',       value: '#000000' },
  { label: 'Light Gray',  value: '#f1f5f9' },
  { label: 'Navy',        value: '#1e293b' },
  { label: 'Indigo',      value: '#4f46e5' },
  { label: 'Teal',        value: '#0d9488' },
  { label: 'Rose',        value: '#e11d48' },
  { label: 'Amber',       value: '#f59e0b' },
  { label: 'Emerald',     value: '#10b981' },
];

const GRADIENTS = [
  { label: 'Sunset',   value: 'linear-gradient(135deg,#f97316,#ec4899)' },
  { label: 'Ocean',    value: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  { label: 'Forest',   value: 'linear-gradient(135deg,#16a34a,#065f46)' },
  { label: 'Aurora',   value: 'linear-gradient(135deg,#a78bfa,#38bdf8)' },
  { label: 'Fire',     value: 'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { label: 'Midnight', value: 'linear-gradient(135deg,#1e1b4b,#312e81)' },
];

const FORMATS = ['PNG', 'JPEG', 'WEBP', 'GIF', 'BMP'];
const MIME_MAP = {
  PNG: 'image/png', JPEG: 'image/jpeg',
  WEBP: 'image/webp', GIF: 'image/gif', BMP: 'image/bmp',
};

/* ── Helpers ── */
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

/* ── Collapsible Card ── */
function PanelCard({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="img-card">
      <div className={`img-card-header${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="ih-icon">{icon}</span>
        <h3>{title}</h3>
        <span className="ih-caret">▼</span>
      </div>
      {open && <div className="img-card-body">{children}</div>}
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg }) {
  if (!msg) return null;
  return <div className="img-toast">✓ {msg}</div>;
}

/* ── Main Component ── */
export default function ImageEditor() {
  const [originalURL, setOriginalURL]   = useState(null);
  const [processedURL, setProcessedURL] = useState(null);
  const [compositeURL, setCompositeURL] = useState(null);
  const [processing, setProcessing]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const [progressMsg, setProgressMsg]   = useState('');
  const [dragging, setDragging]         = useState(false);
  const [toast, setToast]               = useState('');

  // Background
  const [activeBg, setActiveBg]     = useState('transparent');
  const [activeGrad, setActiveGrad] = useState(null);
  const [customColor, setCustomColor] = useState('#ffffff');

  // Resize
  const [resW, setResW]   = useState('');
  const [resH, setResH]   = useState('');
  const [keepAR, setKeepAR] = useState(true);
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 });

  // Export
  const [exportFormat, setExportFormat] = useState('PNG');
  const [quality, setQuality]           = useState(92);
  const [exportName, setExportName]     = useState('konvert-image');

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* ── File load ── */
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setOriginalURL(url);
    setProcessedURL(null);
    setCompositeURL(null);
    const img = await loadImage(url);
    setOrigSize({ w: img.naturalWidth, h: img.naturalHeight });
    setResW(img.naturalWidth.toString());
    setResH(img.naturalHeight.toString());
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    setExportName(base);
  }, []);

  const onInputChange  = (e) => handleFile(e.target.files[0]);
  const onDrop         = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  /* ── Background Removal ── */
  const removeBackground = async () => {
    if (!originalURL) return;
    setProcessing(true); setProgress(5); setProgressMsg('Loading AI model…');
    try {
      const { removeBackground: removeBg } = await import('@imgly/background-removal');
      setProgress(30); setProgressMsg('Analysing image…');
      const res   = await fetch(originalURL);
      const blob  = await res.blob();
      setProgress(55); setProgressMsg('Removing background…');
      const resultBlob = await removeBg(blob, {
        progress: (key, cur, total) => {
          if (total > 0) setProgress(55 + Math.round((cur / total) * 40));
        },
      });
      setProgress(98); setProgressMsg('Finalising…');
      const resultURL = URL.createObjectURL(resultBlob);
      setProcessedURL(resultURL);
      await applyBackground(resultURL, activeBg, activeGrad);
      setProgress(100);
      showToast('Background removed!');
    } catch (err) {
      console.error(err);
      alert('Background removal failed. Please try a different image.');
    } finally {
      setProcessing(false); setProgress(0);
    }
  };

  /* ── Apply Background ── */
  const applyBackground = useCallback(async (srcURL, solid, grad) => {
    const src = srcURL || processedURL;
    if (!src) return;
    const img    = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (solid === 'transparent' && !grad) {
      // nothing — keep alpha
    } else if (grad) {
      const g     = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const stops = grad.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi) || ['#000', '#fff'];
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = solid || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    setCompositeURL(canvas.toDataURL('image/png'));
  }, [processedURL]);

  const selectSolid = (color) => {
    setActiveBg(color); setActiveGrad(null);
    applyBackground(null, color, null);
  };
  const selectGrad = (grad) => {
    setActiveGrad(grad); setActiveBg(null);
    applyBackground(null, null, grad);
  };
  const applyCustom = () => {
    setActiveBg(customColor); setActiveGrad(null);
    applyBackground(null, customColor, null);
  };

  /* ── Resize ── */
  const handleResW = (v) => {
    setResW(v);
    if (keepAR && origSize.w > 0)
      setResH(Math.round((parseInt(v) || 0) * origSize.h / origSize.w).toString());
  };
  const handleResH = (v) => {
    setResH(v);
    if (keepAR && origSize.h > 0)
      setResW(Math.round((parseInt(v) || 0) * origSize.w / origSize.h).toString());
  };
  const applyResize = async () => {
    const src = compositeURL || processedURL || originalURL;
    if (!src) return;
    const w = parseInt(resW), h = parseInt(resH);
    if (!w || !h) return;
    const img    = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    setCompositeURL(canvas.toDataURL('image/png'));
    setOrigSize({ w, h });
    showToast(`Resized to ${w}×${h}px`);
  };

  /* ── Export ── */
  const exportImage = async () => {
    const src = compositeURL || processedURL || originalURL;
    if (!src) return;
    const img    = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const mime = MIME_MAP[exportFormat];
    const q    = ['JPEG', 'WEBP'].includes(exportFormat) ? quality / 100 : undefined;
    canvas.toBlob((blob) => {
      if (!blob) return;
      saveFile(blob, `${exportName}.${exportFormat.toLowerCase()}`);
      showToast(`Downloaded as ${exportFormat}!`);
    }, mime, q);
  };

  const displayURL = compositeURL || processedURL || originalURL;

  /* ── Render ── */
  return (
    <div className="img-editor-page">
      <Toast msg={toast} />

      {/* Header */}
      <div className="img-editor-header">
        <div className="img-editor-badge">🖼️ AI Powered</div>
        <h2>Image Editor</h2>
        <p>Remove backgrounds, change colours, resize and convert images — everything runs in your browser.</p>
      </div>

      {/* Upload */}
      <div
        className={`img-upload-card${dragging ? ' dragging' : ''}${originalURL ? ' has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onInputChange} style={{ display: 'none' }} />
        <div className="img-upload-icon">🖼️</div>
        <h3>{originalURL ? 'Drop a new image to replace' : 'Drop your image here or click to browse'}</h3>
        <p>{originalURL ? '' : 'Supports JPEG · PNG · WebP · GIF · BMP · SVG'}</p>
        {originalURL && <div className="img-file-name">📎 Image loaded — click to change</div>}
      </div>

      {/* Editor grid */}
      {originalURL && (
        <div className="img-editor-grid">

          {/* Canvas Preview */}
          <div className="img-canvas-wrap">
            <span className="img-canvas-label">{processedURL ? 'Processed' : 'Original'}</span>
            <div className="img-checker">
              <img src={displayURL} alt="Preview" />
            </div>
            {processing && (
              <div className="img-processing-overlay">
                <div className="img-spinner" />
                <p>{progressMsg}</p>
                <div className="img-progress-bar">
                  <div className="img-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="img-panel">

            {/* 1 — Background Remover */}
            <PanelCard icon="✂️" title="Remove Background">
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                AI‑powered one‑click background removal — runs entirely in your browser, no uploads.
              </p>
              <button className="img-btn img-btn-primary" onClick={removeBackground} disabled={processing}>
                {processing ? <><span className="img-spinner" style={{ width:16, height:16, borderWidth:2.5 }} /> Processing…</> : '✂️ Remove Background'}
              </button>
              {processedURL && (
                <button className="img-btn img-btn-ghost" onClick={() => { setProcessedURL(null); setCompositeURL(null); }}>
                  🔄 Reset
                </button>
              )}
            </PanelCard>

            {/* 2 — Background Replace (only shown after removal) */}
            {processedURL && (
              <PanelCard icon="🎨" title="Change Background">
                <p className="img-section-label">Solid Colours</p>
                <div className="img-swatches">
                  {SOLID_COLORS.map(({ label, value }) => (
                    <div
                      key={value}
                      title={label}
                      className={`img-swatch${value === 'transparent' ? ' img-swatch-transparent' : ''}${activeBg === value && !activeGrad ? ' active' : ''}`}
                      style={value !== 'transparent' ? { background: value } : {}}
                      onClick={() => selectSolid(value)}
                    />
                  ))}
                </div>

                <p className="img-section-label" style={{ marginTop: 12 }}>Gradients</p>
                <div className="img-grad-swatches">
                  {GRADIENTS.map(({ label, value }) => (
                    <div
                      key={label}
                      title={label}
                      className={`img-grad-swatch${activeGrad === value ? ' active' : ''}`}
                      style={{ background: value }}
                      onClick={() => selectGrad(value)}
                    />
                  ))}
                </div>

                <p className="img-section-label" style={{ marginTop: 12 }}>Custom Colour</p>
                <div className="img-color-row">
                  <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
                  <span>{customColor}</span>
                  <button className="img-btn img-btn-ghost" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }} onClick={applyCustom}>
                    Apply
                  </button>
                </div>
              </PanelCard>
            )}

            {/* 3 — Resize */}
            <PanelCard icon="↔️" title="Resize Image" defaultOpen={false}>
              <div className="img-input-row">
                <div className="img-input-group">
                  <label>Width (px)</label>
                  <input type="number" value={resW} min={1} onChange={(e) => handleResW(e.target.value)} />
                </div>
                <span className="img-sep">×</span>
                <div className="img-input-group">
                  <label>Height (px)</label>
                  <input type="number" value={resH} min={1} onChange={(e) => handleResH(e.target.value)} />
                </div>
              </div>
              <label className="img-checkbox-row">
                <input type="checkbox" checked={keepAR} onChange={(e) => setKeepAR(e.target.checked)} />
                <span>Keep aspect ratio</span>
              </label>
              <button className="img-btn img-btn-primary" onClick={applyResize}>↔️ Apply Resize</button>
            </PanelCard>

            {/* 4 & 5 — Format + Export */}
            <PanelCard icon="📤" title="Convert & Export" defaultOpen={false}>
              <p className="img-section-label">Output Format</p>
              <div className="img-format-grid">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt}
                    className={`img-format-btn${exportFormat === fmt ? ' active' : ''}`}
                    onClick={() => setExportFormat(fmt)}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {['JPEG', 'WEBP'].includes(exportFormat) && (
                <div className="img-slider-row" style={{ marginTop: 10 }}>
                  <div className="img-slider-label">
                    Quality <span>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    className="img-slider"
                    min={10} max={100} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="img-input-group" style={{ marginTop: 10 }}>
                <label>File name</label>
                <input
                  type="text"
                  className="img-text-input"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                />
              </div>

              <button className="img-btn img-btn-success" style={{ marginTop: 4 }} onClick={exportImage}>
                ⬇ Download as {exportFormat}
              </button>
            </PanelCard>

          </div>
        </div>
      )}

      {/* Empty state */}
      {!originalURL && (
        <div className="img-canvas-wrap" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="img-empty-canvas">
            <span>🖼️</span>
            <p>Upload an image above to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
