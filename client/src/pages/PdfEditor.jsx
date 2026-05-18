import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Toolbar from './editor/Toolbar';
import FloatingToolbar from './editor/FloatingToolbar';
import {
  FONT_MAP, CANVAS_SCALE, hexToRgb, dataUrlToBytes,
  cssFontFamily, makeId, extractTextBlocks, pdfLibFontKey
} from './editor/helpers';
import './PdfEditor.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function PdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageDims, setPageDims] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [elements, setElements] = useState([]);
  const [textBlocks, setTextBlocks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawCur, setDrawCur] = useState(null);
  const [showFR, setShowFR] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [frMsg, setFrMsg] = useState('');
  const [history, setHistory] = useState([]);
  const [alignGuides, setAlignGuides] = useState([]);

  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  /* ── Undo support ── */
  const pushHistory = useCallback(() => {
    setHistory(h => [...h.slice(-30), JSON.stringify(elements)]);
  }, [elements]);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setElements(JSON.parse(prev));
      setSelectedId(null);
      return h.slice(0, -1);
    });
  }, []);

  /* ── Load PDF ── */
  const loadPdf = useCallback(async (buf) => {
    // Create all copies UPFRONT before any pdfjs call detaches the ArrayBuffer
    const original = new Uint8Array(new Uint8Array(buf));        // for saving
    const renderCopy = new Uint8Array(new Uint8Array(buf));      // for page rendering
    const extractCopy = new Uint8Array(new Uint8Array(buf));     // for text extraction

    setPdfBytes(original);

    const pdf = await pdfjsLib.getDocument({ data: renderCopy }).promise;
    const imgs = [], dims = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const vp = pg.getViewport({ scale: CANVAS_SCALE });
      const c = document.createElement('canvas');
      c.width = vp.width; c.height = vp.height;
      await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      imgs.push(c.toDataURL());
      dims.push({ w: vp.width / CANVAS_SCALE, h: vp.height / CANVAS_SCALE });
    }
    setPages(imgs);
    setPageDims(dims);
    setCurrentPage(0);
    setElements([]);
    setSelectedId(null);
    setHistory([]);

    try {
      const blocks = await extractTextBlocks(extractCopy, dims);
      setTextBlocks(blocks);
    } catch (err) {
      console.error('Text extraction failed', err);
    }
  }, []);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPdfFile(f);
    await loadPdf(await f.arrayBuffer());
  };

  /* ── Element CRUD ── */
  const updateEl = (id, patch) => {
    pushHistory();
    setElements(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
  };
  const updateElFast = (id, patch) => {
    // For drag/resize during mousemove to avoid flooding history
    setElements(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
  };
  const deleteEl = (id) => {
    pushHistory();
    setElements(p => p.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };
  const dupEl = (id) => {
    pushHistory();
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const nid = makeId();
    setElements(p => [...p, { ...el, id: nid, x: el.x + 15, y: el.y + 15 }]);
    setSelectedId(nid);
  };

  const selectedEl = elements.find(e => e.id === selectedId);
  const pageEls = elements.filter(e => e.pageIdx === currentPage);
  const pageBlocks = textBlocks.filter(b => b.pageIdx === currentPage);

  const getPos = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
  };

  /* ── Image upload ── */
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const id = makeId();
          const maxW = 300;
          const ratio = img.height / img.width;
          const w = Math.min(img.width, maxW);
          const h = w * ratio;
          pushHistory();
          setElements(p => [...p, {
            id, type: 'image', pageIdx: currentPage,
            x: 50, y: 50, w, h, src: ev.target.result
          }]);
          setSelectedId(id);
          setActiveTool('select');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  /* ── Canvas mouse handlers ── */
  const onCanvasDown = (e) => {
    if (e.target !== wrapRef.current && !e.target.classList.contains('page-image') && !e.target.classList.contains('text-block-hit')) return;
    const pos = getPos(e);

    if (activeTool === 'select') {
      setSelectedId(null);
      return;
    }

    if (activeTool === 'text') {
      pushHistory();
      const id = makeId();
      setElements(p => [...p, {
        id, type: 'text', pageIdx: currentPage, x: pos.x, y: pos.y,
        text: 'Type here', fontSize: 16, fontFamily: 'Helvetica', color: '#000000',
        bold: false, italic: false, underline: false, link: '', w: 160, h: 30
      }]);
      setSelectedId(id);
      setActiveTool('select');
      return;
    }

    if (['rect', 'ellipse', 'whiteout', 'highlight', 'strikethrough'].includes(activeTool)) {
      setIsDrawing(true);
      setDrawStart(pos);
      setDrawCur(pos);
    }
  };

  /* ── Click on existing PDF text ── */
  const onTextBlockClick = (block) => {
    if (activeTool !== 'select') return;

    // Check if we already have an element for this block area
    const exists = elements.some(e => e.pageIdx === block.pageIdx && Math.abs(e.x - block.x) < 2 && Math.abs(e.y - block.y) < 2);
    if (exists) return;

    pushHistory();

    // Create a whiteout and a text element to "edit" existing text
    const wId = makeId();
    const tId = makeId();

    // Map original font to best CSS font for preview
    const mappedFont = block.fontName.includes('Times') ? 'Times-Roman'
      : block.fontName.includes('Courier') ? 'Courier'
        : block.fontName.includes('Georgia') ? 'Georgia'
          : block.fontName.includes('Calibri') ? 'Calibri'
            : block.fontName.includes('Verdana') ? 'Verdana'
              : block.fontName.includes('Arial') ? 'Arial'
                : 'Helvetica';

    const img = new Image();
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const sampleX = Math.max(0, block.x - 4);
      const sampleY = Math.max(0, block.y - 4);
      const data = ctx.getImageData(sampleX, sampleY, 1, 1).data;
      const bgColor = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;

      setElements(p => [
        ...p,
        {
          id: wId, type: 'whiteout', pageIdx: block.pageIdx,
          x: block.x, y: block.y, w: block.w, h: block.h,
          fillColor: bgColor
        },
        {
          id: tId, type: 'text', pageIdx: block.pageIdx,
          x: block.x, y: block.y,
          text: block.text,
          fontSize: Math.round(block.fontSize),
          fontFamily: mappedFont,
          color: block.color,
          bold: block.bold,
          italic: block.italic,
          underline: false,
          link: '',
          w: block.w + 40,
          h: block.h + 10,
          _whiteoutId: wId  // Link to whiteout for cleanup
        }
      ]);
      setSelectedId(tId);
    };
    img.src = pages[currentPage];
  };

  /* ── Alignment guide computation ── */
  const SNAP_THRESHOLD = 5;

  const computeAlignGuides = (draggedEl, newX, newY) => {
    const others = elements.filter(e => e.id !== draggedEl.id && e.pageIdx === currentPage);
    const otherBlocks = textBlocks.filter(b => b.pageIdx === currentPage);
    let snapX = newX, snapY = newY;
    const dw = draggedEl.w || 0, dh = draggedEl.h || 0;

    const dLeft = newX, dRight = newX + dw, dCx = newX + dw / 2;
    const dTop = newY, dBottom = newY + dh, dCy = newY + dh / 2;

    const pageDim = pageDims[currentPage];
    const targets = [];
    if (pageDim) {
      targets.push({ left: 0, right: pageDim.w, cx: pageDim.w / 2, top: 0, bottom: pageDim.h, cy: pageDim.h / 2, isPage: true });
    }
    for (const o of others) {
      targets.push({ left: o.x, right: o.x + (o.w || 0), cx: o.x + (o.w || 0) / 2, top: o.y, bottom: o.y + (o.h || 0), cy: o.y + (o.h || 0) / 2 });
    }
    for (const b of otherBlocks) {
      targets.push({ left: b.x, right: b.x + (b.w || 0), cx: b.x + (b.w || 0) / 2, top: b.y, bottom: b.y + (b.h || 0), cy: b.y + (b.h || 0) / 2 });
    }

    let bestDx = SNAP_THRESHOLD + 1;
    let bestDy = SNAP_THRESHOLD + 1;
    let bestVGuide = null;
    let bestHGuide = null;

    for (const t of targets) {
      const vChecks = [
        { dragEdge: dLeft, targetEdge: t.left },
        { dragEdge: dLeft, targetEdge: t.right },
        { dragEdge: dRight, targetEdge: t.left },
        { dragEdge: dRight, targetEdge: t.right },
        { dragEdge: dCx, targetEdge: t.cx },
      ];
      for (const vc of vChecks) {
        const diff = Math.abs(vc.dragEdge - vc.targetEdge);
        if (diff < bestDx) {
          bestDx = diff;
          snapX = newX + (vc.targetEdge - vc.dragEdge);
          bestVGuide = { type: 'v', pos: vc.targetEdge };
        }
      }

      const hChecks = [
        { dragEdge: dTop, targetEdge: t.top },
        { dragEdge: dTop, targetEdge: t.bottom },
        { dragEdge: dBottom, targetEdge: t.top },
        { dragEdge: dBottom, targetEdge: t.bottom },
        { dragEdge: dCy, targetEdge: t.cy },
      ];
      for (const hc of hChecks) {
        const diff = Math.abs(hc.dragEdge - hc.targetEdge);
        if (diff < bestDy) {
          bestDy = diff;
          snapY = newY + (hc.targetEdge - hc.dragEdge);
          bestHGuide = { type: 'h', pos: hc.targetEdge };
        }
      }
    }

    const guides = [];
    if (bestVGuide) guides.push(bestVGuide);
    if (bestHGuide) guides.push(bestHGuide);

    return { guides, snapX, snapY };
  };

  const onCanvasMove = (e) => {
    if (isDrawing) { setDrawCur(getPos(e)); return; }
    if (dragging) {
      const r = wrapRef.current.getBoundingClientRect();
      const rawX = Math.max(0, (e.clientX - r.left) / zoom - dragging.ox);
      const rawY = Math.max(0, (e.clientY - r.top) / zoom - dragging.oy);

      const draggedEl = elements.find(el => el.id === dragging.id);
      if (draggedEl) {
        const { guides, snapX, snapY } = computeAlignGuides(draggedEl, rawX, rawY);
        setAlignGuides(guides);
        updateElFast(dragging.id, { x: snapX, y: snapY });
      } else {
        setAlignGuides([]);
        updateElFast(dragging.id, { x: rawX, y: rawY });
      }
      return;
    }
    if (resizing) {
      const r = wrapRef.current.getBoundingClientRect();
      const el = elements.find(x => x.id === resizing.id);
      if (!el) return;
      updateElFast(resizing.id, {
        w: Math.max(20, (e.clientX - r.left) / zoom - el.x),
        h: Math.max(10, (e.clientY - r.top) / zoom - el.y)
      });
    }
  };

  const onCanvasUp = () => {
    if (isDrawing && drawStart && drawCur) {
      const x = Math.min(drawStart.x, drawCur.x), y = Math.min(drawStart.y, drawCur.y);
      const w = Math.abs(drawCur.x - drawStart.x), h = Math.abs(drawCur.y - drawStart.y);
      if (w > 5 && h > 5) {
        pushHistory();
        const id = makeId();
        let el = { id, pageIdx: currentPage, x, y, w, h };
        if (activeTool === 'rect') el = { ...el, type: 'rect', borderColor: '#000000', fillColor: 'transparent', borderWidth: 2 };
        else if (activeTool === 'ellipse') el = { ...el, type: 'ellipse', borderColor: '#000000', fillColor: 'transparent', borderWidth: 2 };
        else if (activeTool === 'whiteout') el = { ...el, type: 'whiteout' };
        else if (activeTool === 'highlight') el = { ...el, type: 'highlight', color: '#ffff00' };
        else if (activeTool === 'strikethrough') el = { ...el, type: 'strikethrough', h: Math.max(3, h) };
        setElements(p => [...p, el]);
        setSelectedId(id);
      }
      setIsDrawing(false); setDrawStart(null); setDrawCur(null); setActiveTool('select');
    }
    setDragging(null); setResizing(null); setAlignGuides([]);
  };

  useEffect(() => {
    const up = () => { setDragging(null); setResizing(null); setAlignGuides([]); };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.key === 'Delete' && selectedId) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          deleteEl(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, selectedId, deleteEl]);

  /* ── Find & Replace ── */
  const handleFindReplace = () => {
    if (!findText.trim()) { setFrMsg('Enter search text'); return; }
    let count = 0;
    setElements(prev => prev.map(el => {
      if (el.type === 'text' && el.text.includes(findText)) {
        count += (el.text.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        return { ...el, text: el.text.replaceAll(findText, replaceText) };
      }
      return el;
    }));
    setFrMsg(count > 0 ? `Replaced ${count} occurrence(s)` : 'No matches found');
  };

  /* ── Save / Export ── */
  const handleSave = async () => {
    if (!pdfBytes) return;
    setSaving(true);
    try {
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      // Embed all standard fonts
      const fc = {};
      for (const k of Object.keys(FONT_MAP)) {
        fc[k] = await doc.embedFont(FONT_MAP[k]);
      }

      // Helper: parse color from hex (#rrggbb) OR css rgb(r,g,b)
      const parseColor = (c) => {
        if (!c || c === 'transparent') return null;
        if (c.startsWith('rgb')) {
          const m = c.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (m) return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255 };
          return { r: 1, g: 1, b: 1 }; // fallback white
        }
        return hexToRgb(c);
      };

      const pp = doc.getPages();
      for (const el of elements) {
        const page = pp[el.pageIdx];
        if (!page) continue;
        const { width: pw, height: ph } = page.getSize();
        const d = pageDims[el.pageIdx];
        const sx = pw / d.w, sy = ph / d.h;

        if (el.type === 'text') {
          const fontKey = pdfLibFontKey(el.fontFamily, el.bold, el.italic);
          const font = fc[fontKey] || fc['Helvetica'];
          const { r, g, b } = hexToRgb(el.color);

          el.text.split('\n').forEach((ln, li) => {
            const yPos = ph - (el.y + el.fontSize + li * el.fontSize * 1.3) * sy;
            page.drawText(ln, {
              x: el.x * sx,
              y: yPos,
              size: el.fontSize * sy,
              font,
              color: rgb(r, g, b),
            });

            // Draw underline if enabled
            if (el.underline) {
              const textWidth = font.widthOfTextAtSize(ln, el.fontSize * sy);
              page.drawLine({
                start: { x: el.x * sx, y: yPos - 2 },
                end: { x: el.x * sx + textWidth, y: yPos - 2 },
                thickness: 1,
                color: rgb(r, g, b),
              });
            }
          });
        } else if (el.type === 'image') {
          const bytes = dataUrlToBytes(el.src);
          const img = el.src.includes('png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
          page.drawImage(img, { x: el.x * sx, y: ph - (el.y + el.h) * sy, width: el.w * sx, height: el.h * sy });
        } else if (el.type === 'rect' || el.type === 'ellipse') {
          const { r, g, b } = hexToRgb(el.borderColor);
          const fill = el.fillColor !== 'transparent' ? hexToRgb(el.fillColor) : null;
          const method = el.type === 'rect' ? 'drawRectangle' : 'drawEllipse';
          const props = el.type === 'rect'
            ? { x: el.x * sx, y: ph - (el.y + el.h) * sy, width: el.w * sx, height: el.h * sy }
            : { x: (el.x + el.w / 2) * sx, y: ph - (el.y + el.h / 2) * sy, xScale: el.w / 2 * sx, yScale: el.h / 2 * sy };
          page[method]({
            ...props,
            borderColor: rgb(r, g, b),
            borderWidth: el.borderWidth,
            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined
          });
        } else if (el.type === 'whiteout') {
          const wc = parseColor(el.fillColor) || { r: 1, g: 1, b: 1 };
          page.drawRectangle({ x: el.x * sx, y: ph - (el.y + el.h) * sy, width: el.w * sx, height: el.h * sy, color: rgb(wc.r, wc.g, wc.b) });
        } else if (el.type === 'highlight') {
          const { r, g, b } = hexToRgb(el.color || '#ffff00');
          page.drawRectangle({ x: el.x * sx, y: ph - (el.y + el.h) * sy, width: el.w * sx, height: el.h * sy, color: rgb(r, g, b), opacity: 0.35 });
        } else if (el.type === 'strikethrough') {
          page.drawRectangle({ x: el.x * sx, y: ph - (el.y + el.h / 2) * sy, width: el.w * sx, height: 2 * sy, color: rgb(1, 0, 0) });
        }
      }

      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile ? pdfFile.name.replace('.pdf', '_edited.pdf') : 'edited.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
    setSaving(false);
  };

  /* ── Render individual elements ── */
  const renderEl = (el) => {
    const isSel = el.id === selectedId;
    const onDown = (e) => {
      e.stopPropagation();
      setSelectedId(el.id);
      pushHistory(); // Save state before dragging starts
      const r = wrapRef.current.getBoundingClientRect();
      setDragging({ id: el.id, ox: (e.clientX - r.left) / zoom - el.x, oy: (e.clientY - r.top) / zoom - el.y });
    };
    const onResizeDown = (e) => { e.stopPropagation(); e.preventDefault(); pushHistory(); setResizing({ id: el.id }); };
    const style = { left: el.x, top: el.y, width: el.w, height: el.h };

    if (el.type === 'text') {
      return (
        <div key={el.id} className={`el-overlay${isSel ? ' selected' : ''}`} style={style} onMouseDown={onDown}>
          {isSel && (
            <div className="text-drag-bar" onMouseDown={e => { e.preventDefault(); onDown(e); }} title="Drag to move">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>
            </div>
          )}
          <textarea
            className="el-text-area"
            value={el.text}
            onChange={e => updateEl(el.id, { text: e.target.value })}
            onMouseDown={e => {
              if (selectedId !== el.id) setSelectedId(el.id);
            }}
            onDragStart={e => e.preventDefault()}
            style={{
              fontSize: el.fontSize,
              color: el.color,
              fontFamily: cssFontFamily(el.fontFamily),
              fontWeight: el.bold ? 700 : 400,
              fontStyle: el.italic ? 'italic' : 'normal',
              textDecoration: el.underline ? 'underline' : 'none',
            }}
          />
          {el.link && (
            <a
              href={el.link}
              target="_blank"
              rel="noopener noreferrer"
              className="el-link-indicator"
              title={el.link}
              onClick={e => e.stopPropagation()}
            >
              🔗
            </a>
          )}
          {isSel && <div className="el-resize se" onMouseDown={onResizeDown} />}
        </div>
      );
    }
    if (el.type === 'image') {
      return (
        <div key={el.id} className={`el-overlay${isSel ? ' selected' : ''}`} style={style} onMouseDown={onDown}>
          <img src={el.src} alt="" className="el-img" draggable={false} />
          {isSel && <div className="el-resize se" onMouseDown={onResizeDown} />}
        </div>
      );
    }
    if (el.type === 'rect' || el.type === 'ellipse') {
      return (
        <div key={el.id} className={`el-overlay${isSel ? ' selected' : ''}`} style={style} onMouseDown={onDown}>
          <div className={`el-shape-inner${el.type === 'ellipse' ? ' ellipse' : ''}`}
            style={{ border: `${el.borderWidth}px solid ${el.borderColor}`, background: el.fillColor === 'transparent' ? 'transparent' : el.fillColor }} />
          {isSel && <div className="el-resize se" onMouseDown={onResizeDown} />}
        </div>
      );
    }
    if (el.type === 'whiteout') return <div key={el.id} className="el-overlay" style={{ ...style, background: el.fillColor || '#fff', pointerEvents: 'none' }} />;
    if (el.type === 'highlight') return <div key={el.id} className={`el-overlay${isSel ? ' selected' : ''}`} style={{ ...style, background: el.color || '#ffff00', opacity: 0.35 }} onMouseDown={onDown}>{isSel && <div className="el-resize se" onMouseDown={onResizeDown} />}</div>;
    if (el.type === 'strikethrough') return <div key={el.id} className={`el-overlay${isSel ? ' selected' : ''}`} style={{ ...style, background: 'red', height: 2 }} onMouseDown={onDown} />;
    return null;
  };

  /* ── Upload screen ── */
  if (!pages.length) {
    return (
      <div className="pdf-editor-page">
        <div className="editor-upload-zone">
          <div className="upload-inner" onClick={() => fileRef.current?.click()}>
            <svg viewBox="0 0 64 64" fill="none" className="upload-icon">
              <rect x="8" y="8" width="48" height="48" rx="8" fill="#fff3f0" stroke="#e2514a" strokeWidth="2" />
              <path d="M32 20v20M22 30l10-10 10 10" stroke="#e2514a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 44h24" stroke="#e2514a" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2>Upload PDF to Edit</h2>
            <p>Add text, images, shapes, whiteout, annotations &amp; more</p>
            <button className="upload-btn">Choose PDF File</button>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>
    );
  }

  /* ── Editor UI ── */
  return (
    <div className="pdf-editor-page">
      <div className="editor-container">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onUndo={undo}
          hasElements={elements.length > 0}
          setShowFR={setShowFR}
          showFR={showFR}
          onImageUpload={handleImageUpload}
        />

        <div className="page-controls-bar">
          <span className="page-num">{currentPage + 1}</span>
          <button className="page-ctrl-btn" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
          <button className="page-ctrl-btn" disabled={currentPage === pages.length - 1} onClick={() => setCurrentPage(p => p + 1)}>›</button>
          <div className="page-ctrl-divider" />
          <button className="page-ctrl-btn" onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}>🔍−</button>
          <button className="page-ctrl-btn" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>🔍+</button>
          <span className="page-num" style={{ fontSize: '12px', color: '#888' }}>{Math.round(zoom * 100)}%</span>
        </div>

        <div className="editor-body">
          <div className="thumb-panel">
            {pages.map((src, i) => (
              <div key={i} className={`thumb-item${i === currentPage ? ' active' : ''}`} onClick={() => setCurrentPage(i)}>
                <img src={src} alt="" /><span className="thumb-label">{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="editor-canvas-area" onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}>
            <div ref={wrapRef} className={`canvas-wrapper${activeTool !== 'select' ? ' crosshair' : ''}`}
              style={{ width: pageDims[currentPage]?.w, height: pageDims[currentPage]?.h, transform: `scale(${zoom})` }}
              onMouseDown={onCanvasDown} onMouseMove={onCanvasMove} onMouseUp={onCanvasUp}>

              <img src={pages[currentPage]} alt="" className="page-image" draggable={false}
                style={{ width: pageDims[currentPage]?.w, height: pageDims[currentPage]?.h }} />

              {/* Clickable text hit areas for existing PDF text */}
              {activeTool === 'select' && pageBlocks.map(b => {
                const isConverted = elements.some(e => e.type === 'whiteout' && e.pageIdx === currentPage && Math.abs(e.x - b.x) < 2 && Math.abs(e.y - b.y) < 2);
                if (isConverted) return null;
                return (
                  <div key={b.id} className="text-block-hit" onClick={() => onTextBlockClick(b)}
                    style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                    title={`Click to edit: "${b.text.slice(0, 40)}${b.text.length > 40 ? '…' : ''}"`}
                  />
                );
              })}

              {pageEls.map(renderEl)}

              <FloatingToolbar
                el={selectedEl}
                wrapRef={wrapRef}
                zoom={zoom}
                updateEl={updateEl}
                deleteEl={deleteEl}
                dupEl={dupEl}
                startDrag={(e) => {
                  e.stopPropagation();
                  pushHistory();
                  const r = wrapRef.current.getBoundingClientRect();
                  setDragging({ id: selectedEl.id, ox: (e.clientX - r.left) / zoom - selectedEl.x, oy: (e.clientY - r.top) / zoom - selectedEl.y });
                }}
              />

              {/* ── Alignment guide lines ── */}
              {alignGuides.map((g, i) => (
                <div
                  key={`guide-${i}`}
                  className={`align-guide ${g.type === 'v' ? 'vertical' : 'horizontal'}`}
                  style={
                    g.type === 'v'
                      ? { left: g.pos, top: 0, height: pageDims[currentPage]?.h || '100%' }
                      : { top: g.pos, left: 0, width: pageDims[currentPage]?.w || '100%' }
                  }
                />
              ))}

              {isDrawing && drawStart && drawCur && (
                <div className={`draw-preview${activeTool === 'whiteout' ? ' whiteout' : ''}${activeTool === 'highlight' ? ' highlight' : ''}${activeTool === 'strikethrough' ? ' strikethrough' : ''}${activeTool === 'ellipse' ? ' ellipse-preview' : ''}`}
                  style={{
                    left: Math.min(drawStart.x, drawCur.x), top: Math.min(drawStart.y, drawCur.y),
                    width: Math.abs(drawCur.x - drawStart.x), height: Math.abs(drawCur.y - drawStart.y)
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Find & Replace panel ── */}
        {showFR && (
          <div className="find-replace-panel">
            <button className="fr-close" onClick={() => setShowFR(false)}>×</button>
            <h4>Find &amp; Replace</h4>
            <div className="fr-row">
              <input placeholder="Find..." value={findText} onChange={e => setFindText(e.target.value)} />
            </div>
            <div className="fr-row">
              <input placeholder="Replace with..." value={replaceText} onChange={e => setReplaceText(e.target.value)} />
              <button className="fr-btn primary" onClick={handleFindReplace}>Replace All</button>
            </div>
            {frMsg && <div className="fr-results">{frMsg}</div>}
          </div>
        )}

        <div className="bottom-apply-bar">
          <button className="apply-btn" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner-sm" /> : <>Apply changes <span className="apply-arrow">›</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
