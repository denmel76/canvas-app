import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Line, Ellipse, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iqvujenjffevijvtdvd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Cbcd0LznpbNCIA6JwOskig_4SkcqVhL';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const N8N_REMOVE_BG_URL = 'https://denismelgarez.app.n8n.cloud/webhook/remove-bg';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
:root{--ink:#17121f;--paper:#faf7fb;--surface:#fff;--mag:#e6007e;--mag2:#ff4fa3;--violet:#7b61ff;--amber:#ffb020;--cyan:#00c2d1;--green:#12b76a;--red:#f04438;--line:#eadfe9;--mut:#6b6472}
*{box-sizing:border-box}html,body,#root{height:100%}body{margin:0;font-family:Manrope,system-ui,sans-serif;background:var(--paper);color:var(--ink)}
::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-track{background:var(--paper)}::-webkit-scrollbar-thumb{background:linear-gradient(var(--mag),var(--violet));border-radius:99px;border:2px solid var(--paper)}::-webkit-scrollbar-thumb:hover{background:var(--mag2)}
*{scrollbar-width:thin;scrollbar-color:var(--mag) var(--paper)}
.app{min-height:100vh;position:relative}
.aurora{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.35;animation:drift 20s ease-in-out infinite alternate}
.grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.6'/></svg>")}
.home{max-width:1200px;margin:0 auto;padding:26px 20px 130px;position:relative;z-index:2}
.top{display:flex;align-items:center;gap:14px}
.logo{font-family:Unbounded;font-weight:900;font-size:clamp(26px,4vw,42px);letter-spacing:-.5px;margin:0}
.logo em{color:var(--mag);font-style:normal}
.spacer{flex:1}
.pill{border:1px solid var(--line);background:#fff;border-radius:999px;padding:9px 18px;font:700 13px Manrope;color:var(--violet);cursor:pointer;display:flex;gap:6px;align-items:center;transition:.2s}
.pill:hover{border-color:var(--violet);box-shadow:0 6px 18px rgba(123,97,255,.2)}
.tabs{display:flex;gap:24px;overflow-x:auto;padding:16px 0 0;border-bottom:1px solid var(--line);margin-top:8px}
.tab{border:none;background:none;font:700 15px Manrope;color:var(--mut);padding:0 2px 12px;cursor:pointer;white-space:nowrap;display:flex;gap:6px;align-items:center}
.tab.on{color:var(--mag);box-shadow:inset 0 -3px 0 var(--mag)}
.h2{font-family:Unbounded;font-weight:700;font-size:18px;margin:30px 0 14px}
.tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:14px;margin:22px 0 6px}
.tool{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:18px 8px 14px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:.25s;animation:pop .5s both}
.tool:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(230,0,126,.16);border-color:var(--mag2)}
.tool .ic{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#ffe3f1,#efe9ff);color:var(--mag)}
.tool span{font-size:12px;font-weight:700;text-align:center}
.tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.tpl{border-radius:20px;overflow:hidden;border:1px solid var(--line);background:#fff;cursor:pointer;transition:.25s;animation:pop .5s both}
.tpl:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(23,18,31,.14)}
.tpl .prev{height:150px;display:grid;place-items:center;position:relative;overflow:hidden}
.tpl .meta{padding:12px 14px;font-weight:700;font-size:13px;display:flex;justify-content:space-between;align-items:center}
.tpl .meta small{color:var(--mut);font-weight:600}
.bgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:12px}
.bgsw{height:70px;border-radius:16px;border:1px solid var(--line);cursor:pointer;transition:.2s}
.bgsw:hover{transform:scale(1.05)}
.cta{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:5;background:linear-gradient(90deg,var(--mag),#b1006a);color:#fff;border:none;border-radius:999px;padding:16px 30px;font:800 15px Manrope;box-shadow:0 16px 40px rgba(230,0,126,.4);cursor:pointer;display:flex;gap:8px;align-items:center;animation:float 3s ease-in-out infinite}
.ed{position:fixed;inset:0;display:flex;flex-direction:column;background:#efeaf0;z-index:2}
.edtop{height:56px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:6px;padding:0 10px;z-index:6}
.iconbtn{width:38px;height:38px;border-radius:12px;border:none;background:transparent;display:grid;place-items:center;cursor:pointer;color:var(--ink);transition:.15s}
.iconbtn:hover{background:#f6eef5;color:var(--mag)}
.iconbtn:disabled{opacity:.3;cursor:default}
.iconbtn.on{color:var(--mag);background:#ffe9f4}
.edbody{flex:1;position:relative;overflow:hidden}
.canvasWrap{position:absolute;inset:0;display:grid;place-items:center;overflow:auto}
.panel{position:absolute;top:12px;right:12px;width:272px;max-height:calc(100% - 24px);overflow:auto;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 20px 50px rgba(23,18,31,.16);padding:16px;z-index:7;animation:slidein .25s both}
@media(max-width:760px){.panel{left:12px;right:12px;width:auto;top:auto;bottom:80px;max-height:44%}}
.panel h4{margin:0 0 8px;font:700 14px Manrope}
.edbar{height:74px;background:#fff;border-top:1px solid var(--line);display:flex;gap:2px;overflow-x:auto;padding:6px 10px;z-index:6}
.edtool{min-width:70px;display:flex;flex-direction:column;align-items:center;gap:4px;border:none;background:transparent;border-radius:12px;cursor:pointer;font:600 11px Manrope;color:var(--mut);padding:6px 8px}
.edtool.on{color:var(--mag);background:#ffe9f4}
.row{display:flex;align-items:center;gap:8px;margin:10px 0}
.lbl{font-size:12px;font-weight:700;color:var(--mut);min-width:64px}
input[type=range]{accent-color:var(--mag);width:100%}
input[type=color]{width:36px;height:36px;border:none;border-radius:10px;padding:0;background:none;cursor:pointer}
.txt{width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:600 14px Manrope;background:#fbf8fb;color:var(--ink)}
.btn{background:linear-gradient(90deg,var(--mag),#b1006a);color:#fff;border:none;border-radius:12px;padding:11px 16px;font:800 13px Manrope;cursor:pointer;display:flex;gap:6px;align-items:center;justify-content:center;width:100%}
.btn.ghost{background:#fff;color:var(--mag);border:1px solid var(--mag)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font:600 12px Manrope;cursor:pointer}
.chip.on{background:var(--mag);color:#fff;border-color:var(--mag)}
.toasts{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.toast{background:var(--ink);color:#fff;border-radius:14px;padding:10px 18px;font:600 13px Manrope;box-shadow:0 12px 30px rgba(0,0,0,.25);animation:pop .3s both;display:flex;gap:8px;align-items:center;max-width:90vw}
.toast.ok{background:var(--green)}.toast.err{background:var(--red)}.toast.info{background:var(--violet)}
.modal{position:fixed;inset:0;background:rgba(23,18,31,.45);backdrop-filter:blur(4px);z-index:40;display:grid;place-items:center;padding:20px}
.card{background:#fff;border-radius:22px;padding:24px;width:min(480px,100%);max-height:85vh;overflow:auto;animation:pop .3s both}
.card h3{font-family:Unbounded;margin:0 0 14px}
.busy{position:fixed;inset:0;z-index:50;background:rgba(255,255,255,.65);backdrop-filter:blur(3px);display:grid;place-items:center}
.busybox{display:flex;flex-direction:column;align-items:center;gap:14px;font:700 14px Manrope;color:var(--mag)}
.spinner{width:54px;height:54px;border-radius:50%;border:5px solid #ffd7ea;border-top-color:var(--mag);animation:spin 1s linear infinite}
.plan{border:1px solid var(--line);border-radius:16px;padding:14px;margin:10px 0;display:flex;justify-content:space-between;align-items:center}
.plan b{font-family:Unbounded}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(60px,-40px) scale(1.15)}}
@keyframes pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
@keyframes slidein{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes float{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}
`;

const P = {
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M20 4L8.1 15.9 M14.5 14.5L20 20 M8.1 8.1L12 12',
  type: 'M4 7V4h16v3 M12 4v16 M9 20h6',
  image: 'M3 5h18v14H3z M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5-9 9',
  shapes: 'M4 4h8v8H4z M16 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-.5-2 1-2h2a4 4 0 0 0 4-4c0-5-4-10-9-10z M7.5 10h.01 M12 7h.01 M16.5 10h.01',
  sparkles: 'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',
  brush: 'M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.07 M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3z',
  eraser: 'M20 20H8.5l-4.2-4.2a2 2 0 0 1 0-2.8L13 4.3a2 2 0 0 1 2.8 0l4.9 4.9a2 2 0 0 1 0 2.8L13 19.7',
  grid: 'M3 9h18 M3 15h18 M9 3v18 M15 3v18',
  frame: 'M6 2v20 M18 2v20 M2 6h20 M2 18h20',
  undo: 'M3 7v6h6 M3 13a9 9 0 1 0 3-7.7L3 7',
  redo: 'M21 7v6h-6 M21 13a9 9 0 1 1-3-7.7L21 7',
  trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 14h10l1-14 M10 11v6 M14 11v6',
  copy: 'M9 9h11v11H9z M5 15H4V4h11v1',
  download: 'M12 3v12 M6 11l6 6 6-6 M4 21h16',
  x: 'M6 6l12 12 M18 6L6 18',
  plus: 'M12 5v14 M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3',
  crown: 'M3 17l2-9 5 5 2-7 2 7 5-5 2 9z M3 20h18',
  up: 'M12 19V5 M5 12l7-7 7 7',
  down: 'M12 5v14 M19 12l-7 7-7-7',
  back: 'M15 18l-6-6 6-6',
  wand: 'M15 4V2 M15 10V8 M11.5 6h-2 M20.5 6h-2 M17.8 3.2l1.4-1.4 M17.8 8.8l1.4 1.4 M3 21L14 10',
  video: 'M3 6h13v12H3z M16 10l5-3v10l-5-3',
  bot: 'M12 2v4 M8 6h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4z M9 12h.01 M15 12h.01',
  apps: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  check: 'M20 6L9 17l-5-5',
  layers: 'M12 2l10 6-10 6L2 8z M2 16l10 6 10-6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7'
};
const Icon = ({ n, s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>
);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sampleImg = (c1, c2) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='600' height='600' fill='url(#g)'/><circle cx='300' cy='250' r='140' fill='#fff' opacity='.85'/><rect x='140' y='430' width='320' height='42' rx='21' fill='#fff' opacity='.7'/></svg>`);

function useImage(src) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (!src) { setImage(null); return; }
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = src;
    return () => { img.onload = null; };
  }, [src]);
  return image;
}

function NodeView({ el, selected, onSelect, onChange, register, tool }) {
  const ref = useRef(null);
  const img = useImage(el.type === 'image' ? el.src : null);
  useEffect(() => { register(el.id, ref.current); return () => register(el.id, null); }, [el.id, img, register]);
  useEffect(() => {
    if (el.type === 'image' && img && ref.current) ref.current.cache();
  }, [img, el.type, el.width, el.height, el.fx && el.fx.b, el.fx && el.fx.c, el.fx && el.fx.s, el.fx && el.fx.blur]);
  const common = {
    ref, x: el.x, y: el.y, rotation: el.rotation || 0, opacity: el.opacity == null ? 1 : el.opacity,
    draggable: tool === 'select', onClick: onSelect, onTap: onSelect,
    onDragEnd: (e) => onChange({ x: e.target.x(), y: e.target.y() })
  };
  const selStroke = selected ? '#e6007e' : undefined;
  if (el.type === 'image') {
    if (!img) return null;
    const fx = el.fx || {}; const filters = [];
    if (fx.b) filters.push(Konva.Filters.Brighten);
    if (fx.c) filters.push(Konva.Filters.Contrast);
    if (fx.s) filters.push(Konva.Filters.Saturate);
    if (fx.blur) filters.push(Konva.Filters.Blur);
    return <KonvaImage {...common} image={img} width={el.width} height={el.height} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} filters={filters} brightness={fx.b || 0} contrast={fx.c || 0} saturation={fx.s || 0} blurRadius={fx.blur || 0} stroke={selStroke} strokeWidth={selected ? 3 : 0} />;
  }
  if (el.type === 'text') return <Text {...common} text={el.text} fontSize={el.fontSize} fontFamily={el.fontFamily} fontStyle={el.fontStyle || 'normal'} fill={el.fill} align={el.align || 'left'} width={el.width} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={selStroke} strokeWidth={selected ? 1 : 0} />;
  if (el.type === 'rect') return <Rect {...common} width={el.width} height={el.height} fill={el.fill} cornerRadius={el.radius || 0} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={selStroke} strokeWidth={selected ? 3 : 0} />;
  if (el.type === 'circle') return <Ellipse {...common} radiusX={el.width / 2} radiusY={el.height / 2} fill={el.fill} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={selStroke} strokeWidth={selected ? 3 : 0} />;
  if (el.type === 'triangle') return <RegularPolygon {...common} sides={3} radius={el.width / 2} fill={el.fill} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={selStroke} strokeWidth={selected ? 3 : 0} />;
  if (el.type === 'line') return <Line {...common} points={el.points} stroke={el.fill} strokeWidth={el.strokeWidth || 6} lineCap="round" scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} />;
  if (el.type === 'draw') return <Line points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth} lineCap="round" lineJoin="round" tension={0.5} listening={false} opacity={el.opacity == null ? 1 : el.opacity} />;
  return null;
}
export default function App() {
  const [screen, setScreen] = useState('home');
  const [tab, setTab] = useState('Фото');
  const [elements, setElements] = useState([]);
  const [bg, setBg] = useState({ mode: 'solid', color: '#ffffff', from: '#ff2fb3', to: '#7b61ff' });
  const [format, setFormat] = useState({ label: 'Пост Instagram', w: 1080, h: 1080 });
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [gridOn, setGridOn] = useState(false);
  const [brushColor, setBrushColor] = useState('#e6007e');
  const [brushSize, setBrushSize] = useState(8);
  const [pro, setPro] = useState(false);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [proOpen, setProOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [cs, setCs] = useState({ w: 800, h: 600 });

  const stageRef = useRef(null); const trRef = useRef(null);
  const nodeRefs = useRef({}); const containerRef = useRef(null);
  const undoStack = useRef([]); const redoStack = useRef([]); const lastHist = useRef(0);
  const elementsRef = useRef(elements); const bgRef = useRef(bg); const formatRef = useRef(format);
  const drawingRef = useRef(null); const erasingRef = useRef(false);
  useEffect(() => { elementsRef.current = elements; bgRef.current = bg; formatRef.current = format; }, [elements, bg, format]);

  const register = useCallback((id, node) => { if (node) nodeRefs.current[id] = node; else delete nodeRefs.current[id]; }, []);
  const toast = (msg, type = 'info') => { const id = uid(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200); };
  const scale = Math.max(0.05, Math.min((cs.w - 32) / format.w, (cs.h - 32) / format.h, 1));

  const pushHist = () => { const now = Date.now(); if (now - lastHist.current > 500) { undoStack.current.push({ elements: elementsRef.current, bg: bgRef.current, format: formatRef.current }); if (undoStack.current.length > 60) undoStack.current.shift(); redoStack.current = []; } lastHist.current = now; };
  const undo = () => { const s = undoStack.current.pop(); if (!s) return; redoStack.current.push({ elements: elementsRef.current, bg: bgRef.current, format: formatRef.current }); setElements(s.elements); setBg(s.bg); setFormat(s.format); setSelectedId(null); };
  const redo = () => { const s = redoStack.current.pop(); if (!s) return; undoStack.current.push({ elements: elementsRef.current, bg: bgRef.current, format: formatRef.current }); setElements(s.elements); setBg(s.bg); setFormat(s.format); setSelectedId(null); };
  const mutate = (fn) => { pushHist(); setElements(fn); };
  const updateEl = (id, patch) => mutate(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));

  useLayoutEffect(() => {
    if (screen !== 'editor') return;
    const measure = () => { const r = containerRef.current && containerRef.current.getBoundingClientRect(); if (r) setCs({ w: r.width, h: r.height }); };
    measure(); window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [screen]);

  useEffect(() => {
    const tr = trRef.current; if (!tr) return;
    const node = selectedId && tool === 'select' ? nodeRefs.current[selectedId] : null;
    tr.nodes(node ? [node] : []); tr.getLayer() && tr.getLayer().batchDraw();
  }, [selectedId, elements, tool, screen]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { deleteSel(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); dupSel(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, elements]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session ? data.session.user : null)).catch(() => {});
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setUser(s ? s.user : null));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user || screen !== 'editor') return;
    setSaveStatus('Сохранение...');
    const t = setTimeout(async () => {
      const { error } = await supabase.from('projects').upsert({ user_id: user.id, data: { elements, bg, format }, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      setSaveStatus(error ? 'Ошибка сохранения' : 'Сохранено');
    }, 1200);
    return () => clearTimeout(t);
  }, [elements, bg, format, user, screen]);

  const addText = () => { const id = uid(); mutate(p => [...p, { id, type: 'text', x: format.w / 2 - 200, y: format.h / 2 - 40, width: 400, text: 'Напиши здесь', fontSize: 64, fill: '#17121f', fontFamily: 'Unbounded', fontStyle: 'normal', align: 'left' }]); setSelectedId(id); setTool('select'); };
  const addShape = (kind) => { const id = uid(); const base = { id, type: kind, x: format.w / 2, y: format.h / 2, fill: '#7b61ff', opacity: 1 }; const el = kind === 'rect' ? { ...base, x: format.w / 2 - 150, y: format.h / 2 - 150, width: 300, height: 300, radius: 24 } : kind === 'line' ? { ...base, points: [0, 0, 300, 0], strokeWidth: 8, fill: '#e6007e' } : { ...base, width: 300, height: 300 }; mutate(p => [...p, el]); setSelectedId(id); setTool('select'); };
  const addImage = (src, w, h, thenRemove) => { const id = uid(); const fit = Math.min(format.w * 0.7 / w, format.h * 0.7 / h, 1); const width = w * fit, height = h * fit; mutate(p => [...p, { id, type: 'image', src, x: (format.w - width) / 2, y: (format.h - height) / 2, width, height, fx: {}, opacity: 1 }]); setScreen('editor'); setSelectedId(id); setTool('select'); if (thenRemove) removeBg(id, src); };
  const pickImage = (cb) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const img = new window.Image(); img.onload = () => cb(r.result, img.width, img.height); img.src = r.result; }; r.readAsDataURL(f); }; inp.click(); };

  const removeBg = async (id, src) => {
    setBusy(true);
    try {
      const base64 = src.split(',')[1];
      const res = await fetch(N8N_REMOVE_BG_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) });
      if (!res.ok) throw new Error('n8n вернул ' + res.status);
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) throw new Error('n8n вернул JSON, а не картинку');
      const blob = await res.blob();
      const dataUrl = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(new Error('чтение ответа')); r.readAsDataURL(blob); });
      mutate(p => p.map(e => e.id === id ? { ...e, src: dataUrl } : e));
      toast('Фон удалён', 'ok');
    } catch (err) { toast('Не вышло: ' + err.message + '. Проверь n8n Active и URL /webhook/remove-bg', 'err'); }
    finally { setBusy(false); }
  };
  const removeBgSelected = () => { const el = elements.find(e => e.id === selectedId && e.type === 'image') || [...elements].reverse().find(e => e.type === 'image'); if (!el) { toast('Сначала добавь фото', 'err'); return; } removeBg(el.id, el.src); };

  const deleteSel = () => { if (!selectedId) return; mutate(p => p.filter(e => e.id !== selectedId)); setSelectedId(null); toast('Удалено', 'info'); };
  const dupSel = () => { const el = elements.find(e => e.id === selectedId); if (!el) return; const id = uid(); mutate(p => [...p, { ...el, id, x: el.x + 30, y: el.y + 30 }]); setSelectedId(id); };
  const layer = (dir) => { const i = elements.findIndex(e => e.id === selectedId); if (i < 0) return; mutate(p => { const n = [...p]; const [it] = n.splice(i, 1); n.splice(dir === 'up' ? Math.min(i + 1, n.length) : Math.max(i - 1, 0), 0, it); return n; }); };

  const ptr = () => { const pos = stageRef.current.getPointerPosition(); return { x: pos.x / scale, y: pos.y / scale }; };
  const eraseAt = (p) => setElements(prev => prev.filter(e => e.type !== 'draw' || !e.points.some((pt, i) => i % 2 === 0 && Math.hypot(pt - p.x, e.points[i + 1] - p.y) < brushSize + 8)));
  const onDown = (e) => {
    if (tool === 'select') { if (e.target === e.target.getStage()) setSelectedId(null); return; }
    const p = ptr();
    if (tool === 'draw') { pushHist(); const id = uid(); drawingRef.current = id; setElements(prev => [...prev, { id, type: 'draw', points: [p.x, p.y], stroke: brushColor, strokeWidth: brushSize }]); }
    if (tool === 'erase') { pushHist(); erasingRef.current = true; eraseAt(p); }
  };
  const onMove = () => { if (!stageRef.current) return; const p = ptr(); if (drawingRef.current) setElements(prev => prev.map(e => e.id === drawingRef.current ? { ...e, points: [...e.points, p.x, p.y] } : e)); if (erasingRef.current) eraseAt(p); };
  const onUp = () => { drawingRef.current = null; erasingRef.current = false; };

  const onTransformEnd = () => {
    const node = nodeRefs.current[selectedId]; const el = elements.find(e => e.id === selectedId);
    if (!node || !el) return; const sx = node.scaleX(), sy = node.scaleY(); pushHist();
    if (el.type === 'image' || el.type === 'rect') { updateEl(el.id, { x: node.x(), y: node.y(), width: Math.max(10, node.width() * sx), height: Math.max(10, node.height() * sy), scaleX: 1, scaleY: 1, rotation: node.rotation() }); node.scaleX(1); node.scaleY(1); }
    else if (el.type === 'text') { updateEl(el.id, { x: node.x(), y: node.y(), fontSize: Math.max(8, el.fontSize * sy), width: Math.max(40, node.width() * sx), scaleX: 1, scaleY: 1, rotation: node.rotation() }); node.scaleX(1); node.scaleY(1); }
    else updateEl(el.id, { x: node.x(), y: node.y(), scaleX: sx, scaleY: sy, rotation: node.rotation() });
  };

  const exportPNG = () => { setSelectedId(null); setTimeout(() => { const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); const a = document.createElement('a'); a.download = 'design.png'; a.href = uri; document.body.appendChild(a); a.click(); a.remove(); toast('PNG скачан', 'ok'); }, 120); };
  const openEditor = () => { setScreen('editor'); setTool('select'); setSelectedId(null); };
  const applyTemplate = (t) => { pushHist(); setElements(t.elements); setBg(t.bg); setFormat(t.format); openEditor(); toast('Шаблон загружен', 'ok'); };
  const doAuth = async (e) => { e.preventDefault(); setAuthErr(''); setAuthBusy(true); const fn = authMode === 'in' ? supabase.auth.signInWithPassword({ email, password }) : supabase.auth.signUp({ email, password }); const { error } = await fn; setAuthBusy(false); if (error) setAuthErr(error.message); else { setAuthOpen(false); toast(authMode === 'in' ? 'Вы вошли' : 'Аккаунт создан', 'ok'); } };

  const FORMATS = [{ label: 'Пост Instagram', w: 1080, h: 1080 }, { label: 'Сторис', w: 1080, h: 1920 }, { label: 'YouTube', w: 1280, h: 720 }, { label: 'Shorts', w: 1080, h: 1920 }, { label: 'A4', w: 1240, h: 1754 }];
  const EFFECTS = [{ name: 'Нет', fx: {} }, { name: 'Моно', fx: { s: -1 } }, { name: 'Тёплый', fx: { b: .08, s: .3 } }, { name: 'Холодный', fx: { s: -.3, b: .05 } }, { name: 'Яркий', fx: { c: 25, s: .6 } }, { name: 'Мягкий', fx: { blur: 2, b: .06 } }];
  const BGS = [{ mode: 'solid', color: '#ffffff' }, { mode: 'solid', color: '#17121f' }, { mode: 'gradient', from: '#ff2fb3', to: '#7b61ff' }, { mode: 'gradient', from: '#ffb020', to: '#ff5e62' }, { mode: 'gradient', from: '#00c2d1', to: '#7b61ff' }, { mode: 'gradient', from: '#12b76a', to: '#00c2d1' }, { mode: 'gradient', from: '#f6f2f7', to: '#ffd7ea' }, { mode: 'gradient', from: '#17121f', to: '#e6007e' }];
  const TEMPLATES = [
    { name: 'MY BRAND', tag: 'Пост Instagram', bg: { mode: 'solid', color: '#f6f2f7' }, format: FORMATS[0], elements: [{ id: uid(), type: 'text', x: 140, y: 420, width: 800, text: 'MY BRAND', fontSize: 130, fill: '#e6007e', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }, { id: uid(), type: 'rect', x: 340, y: 620, width: 400, height: 14, radius: 7, fill: '#7b61ff' }] },
    { name: 'Скидка 50%', tag: 'Сторис', bg: { mode: 'gradient', from: '#ff2fb3', to: '#7b61ff' }, format: FORMATS[1], elements: [{ id: uid(), type: 'text', x: 140, y: 700, width: 800, text: 'SALE', fontSize: 200, fill: '#ffffff', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }, { id: uid(), type: 'text', x: 140, y: 980, width: 800, text: '-50% до конца недели', fontSize: 60, fill: '#ffd7ea', fontFamily: 'Manrope', align: 'center' }] },
    { name: 'Цитата дня', tag: 'Пост', bg: { mode: 'solid', color: '#17121f' }, format: FORMATS[0], elements: [{ id: uid(), type: 'text', x: 140, y: 400, width: 800, text: 'Делай просто.\nДелай красиво.', fontSize: 84, fill: '#ffffff', fontFamily: 'Unbounded', align: 'center' }, { id: uid(), type: 'circle', x: 540, y: 800, width: 120, height: 120, fill: '#e6007e' }] },
    { name: 'Неон промо', tag: 'YouTube', bg: { mode: 'gradient', from: '#17121f', to: '#e6007e' }, format: FORMATS[2], elements: [{ id: uid(), type: 'text', x: 90, y: 260, width: 1100, text: 'НОВЫЙ ВЫПУСК', fontSize: 110, fill: '#00c2d1', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }] }
  ];
  const TOOLS = [
    { icon: 'scissors', title: 'Убрать фон', act: () => pickImage((s, w, h) => addImage(s, w, h, true)) },
    { icon: 'type', title: 'Добавить текст', act: () => { openEditor(); addText(); } },
    { icon: 'eraser', title: 'Удаление', act: () => { openEditor(); setTool('erase'); } },
    { icon: 'sparkles', title: 'ИИ Улучшить', act: () => pickImage((s, w, h) => { addImage(s, w, h); setTimeout(() => toast('Применён эффект «Яркий»', 'ok'), 300); }) },
    { icon: 'image', title: 'Коллаж', act: () => { applyTemplate(TEMPLATES[0]); } },
    { icon: 'palette', title: 'Эффекты', act: () => { addImage(sampleImg('#ff2fb3', '#7b61ff'), 600, 600); } },
    { icon: 'brush', title: 'Фристайл', act: () => { openEditor(); setTool('draw'); } },
    { icon: 'wand', title: 'Корректор', act: () => { addImage(sampleImg('#00c2d1', '#12b76a'), 600, 600); } }
  ];
  const AGENTS = [
    { icon: 'sparkles', title: 'ИИ Улучшить', act: TOOLS[3].act },
    { icon: 'scissors', title: 'Убрать фон', act: TOOLS[0].act },
    { icon: 'palette', title: 'Ч/Б моно', act: () => pickImage((s, w, h) => addImage(s, w, h)) },
    { icon: 'wand', title: 'Тёплый тон', act: () => pickImage((s, w, h) => addImage(s, w, h)) }
  ];
  const VIDEO = [{ icon: 'video', title: 'Обложка YouTube', act: () => { setFormat(FORMATS[2]); openEditor(); addText(); } }, { icon: 'video', title: 'Обложка Shorts', act: () => { setFormat(FORMATS[3]); openEditor(); addText(); } }];
  const APPS = [{ icon: 'image', title: 'Коллаж', act: TOOLS[4].act }, { icon: 'palette', title: 'Эффекты', act: TOOLS[5].act }, { icon: 'wand', title: 'Корректор', act: TOOLS[7].act }, { icon: 'grid', title: 'Фоны', act: () => { openEditor(); setTool('bg'); } }];
  const DRAWC = [{ icon: 'brush', title: 'Фристайл', act: TOOLS[6].act }, { icon: 'brush', title: 'Неон-кисть', act: () => { setBrushColor('#00c2d1'); setBrushSize(14); openEditor(); setTool('draw'); } }, { icon: 'brush', title: 'Скетч', act: () => { setBrushColor('#17121f'); setBrushSize(4); openEditor(); setTool('draw'); } }];
    const selectedEl = elements.find(e => e.id === selectedId);
  const bgStyle = (b) => b.mode === 'gradient' ? { background: `linear-gradient(135deg,${b.from},${b.to})` } : { background: b.color };

  const renderHome = () => (
    <div className="home">
      <div className="top">
        <h1 className="logo">Редак<em>тор</em></h1>
        <div className="spacer" />
        <button className="pill" onClick={() => setProOpen(true)}><Icon n="crown" s={16} />{pro ? 'PRO активен' : 'Try PRO'}</button>
        <button className="iconbtn" onClick={() => setSearchOpen(true)}><Icon n="search" /></button>
      </div>
      <div className="tabs">
        {['Фото', 'Видео', 'Agents', 'Шаблоны', 'Приложения', 'Рисовать'].map(t => (
          <button key={t} className={'tab' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t === 'Agents' && <Icon n="sparkles" s={16} />}{t}</button>
        ))}
      </div>

      {tab === 'Фото' && <>
        <div className="tools">{TOOLS.map((t, i) => <button key={t.title} className="tool" style={{ animationDelay: `${i * 0.05}s` }} onClick={t.act}><span className="ic"><Icon n={t.icon} s={24} /></span><span>{t.title}</span></button>)}</div>
        <div className="h2">Шаблоны</div>
        <div className="tpls">{TEMPLATES.map((t, i) => <div key={t.name} className="tpl" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => applyTemplate(t)}><div className="prev" style={bgStyle(t.bg)}><span style={{ fontFamily: 'Unbounded', fontWeight: 900, fontSize: 26, color: t.bg.mode === 'solid' && t.bg.color === '#17121f' ? '#fff' : '#e6007e' }}>{t.name}</span></div><div className="meta">{t.name}<small>{t.tag}</small></div></div>)}</div>
        <div className="h2">Популярные фоны</div>
        <div className="bgs">{BGS.map((b, i) => <div key={i} className="bgsw" style={bgStyle(b)} onClick={() => { setBg(b); openEditor(); setTool('bg'); }} />)}</div>
      </>}
      {tab === 'Видео' && <div className="tools">{VIDEO.map(t => <button key={t.title} className="tool" onClick={t.act}><span className="ic"><Icon n={t.icon} s={24} /></span><span>{t.title}</span></button>)}</div>}
      {tab === 'Agents' && <div className="tools">{AGENTS.map(t => <button key={t.title} className="tool" onClick={t.act}><span className="ic"><Icon n={t.icon} s={24} /></span><span>{t.title}</span></button>)}</div>}
      {tab === 'Шаблоны' && <div className="tpls" style={{ marginTop: 22 }}>{TEMPLATES.map(t => <div key={t.name} className="tpl" onClick={() => applyTemplate(t)}><div className="prev" style={bgStyle(t.bg)}><span style={{ fontFamily: 'Unbounded', fontWeight: 900, fontSize: 26, color: '#e6007e' }}>{t.name}</span></div><div className="meta">{t.name}<small>{t.tag}</small></div></div>)}</div>}
      {tab === 'Приложения' && <div className="tools">{APPS.map(t => <button key={t.title} className="tool" onClick={t.act}><span className="ic"><Icon n={t.icon} s={24} /></span><span>{t.title}</span></button>)}</div>}
      {tab === 'Рисовать' && <div className="tools">{DRAWC.map(t => <button key={t.title} className="tool" onClick={t.act}><span className="ic"><Icon n={t.icon} s={24} /></span><span>{t.title}</span></button>)}</div>}

      <button className="cta" onClick={() => pickImage((s, w, h) => addImage(s, w, h))}><Icon n="plus" s={18} />Начни с фото или видео</button>
    </div>
  );

  const renderModals = () => (<>
    {proOpen && <div className="modal" onClick={() => setProOpen(false)}><div className="card" onClick={e => e.stopPropagation()}>
      <h3>PRO</h3>
      <div className="plan"><div><b>Месяц</b><div style={{ color: 'var(--mut)', fontSize: 13 }}>Все эффекты и шаблоны</div></div><span>299 ₽</span></div>
      <div className="plan"><div><b>Год</b><div style={{ color: 'var(--mut)', fontSize: 13 }}>Выгоднее на 40%</div></div><span>2 190 ₽</span></div>
      <button className="btn" onClick={() => { setPro(true); setProOpen(false); toast('PRO активирован (демо)', 'ok'); }}><Icon n="crown" s={16} />Активировать демо-PRO</button>
    </div></div>}
    {searchOpen && <div className="modal" onClick={() => setSearchOpen(false)}><div className="card" onClick={e => e.stopPropagation()}>
      <h3>Поиск</h3>
      <input className="txt" autoFocus placeholder="Инструмент или шаблон..." value={query} onChange={e => setQuery(e.target.value)} />
      <div className="chips" style={{ marginTop: 12 }}>
        {[...TOOLS, ...TEMPLATES.map(t => ({ title: t.name, act: () => applyTemplate(t) }))].filter(x => x.title.toLowerCase().includes(query.toLowerCase())).map(x => <button key={x.title} className="chip" onClick={() => { setSearchOpen(false); x.act(); }}>{x.title}</button>)}
      </div>
    </div></div>}
    {authOpen && <div className="modal" onClick={() => setAuthOpen(false)}><div className="card" onClick={e => e.stopPropagation()}>
      <h3>{authMode === 'in' ? 'Вход' : 'Регистрация'}</h3>
      <form onSubmit={doAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="txt" type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="txt" type="password" required placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn" disabled={authBusy}>{authBusy ? '...' : authMode === 'in' ? 'Войти' : 'Создать'}</button>
      </form>
      {authErr && <p style={{ color: 'var(--red)', fontSize: 13 }}>{authErr}</p>}
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setAuthMode(authMode === 'in' ? 'up' : 'in')}>{authMode === 'in' ? 'Нет аккаунта? Создать' : 'Уже есть? Войти'}</button>
    </div></div>}
  </>);
    const renderPanel = () => {
    if (tool === 'draw' || tool === 'erase') return <div className="panel"><h4>{tool === 'draw' ? 'Кисть' : 'Ластик'}</h4>
      <div className="row"><span className="lbl">Цвет</span><input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} /></div>
      <div className="row"><span className="lbl">Размер</span><input type="range" min="2" max="60" value={brushSize} onChange={e => setBrushSize(+e.target.value)} /></div>
    </div>;
    if (tool === 'bg') return <div className="panel"><h4>Фон</h4>
      <div className="row"><span className="lbl">Цвет</span><input type="color" value={bg.color} onChange={e => { pushHist(); setBg({ ...bg, mode: 'solid', color: e.target.value }); }} /></div>
      <div className="row"><span className="lbl">Градиент</span><input type="color" value={bg.from} onChange={e => { pushHist(); setBg({ ...bg, mode: 'gradient', from: e.target.value }); }} /><input type="color" value={bg.to} onChange={e => { pushHist(); setBg({ ...bg, mode: 'gradient', to: e.target.value }); }} /></div>
      <div className="bgs">{BGS.map((b, i) => <div key={i} className="bgsw" style={bgStyle(b)} onClick={() => { pushHist(); setBg(b); }} />)}</div>
    </div>;
    if (tool === 'shapes') return <div className="panel"><h4>Фигуры</h4><div className="chips">
      <button className="chip" onClick={() => addShape('rect')}>Квадрат</button>
      <button className="chip" onClick={() => addShape('circle')}>Круг</button>
      <button className="chip" onClick={() => addShape('triangle')}>Треугольник</button>
      <button className="chip" onClick={() => addShape('line')}>Линия</button>
    </div></div>;
    if (tool === 'format') return <div className="panel"><h4>Формат</h4><div className="chips">{FORMATS.map(f => <button key={f.label} className={'chip' + (format.label === f.label ? ' on' : '')} onClick={() => { pushHist(); setFormat(f); }}>{f.label}</button>)}</div></div>;
    if (!selectedEl) return null;
    if (selectedEl.type === 'text') return <div className="panel"><h4>Текст</h4>
      <textarea className="txt" rows="2" value={selectedEl.text} onChange={e => updateEl(selectedEl.id, { text: e.target.value })} />
      <div className="row"><span className="lbl">Размер</span><input type="range" min="12" max="240" value={selectedEl.fontSize} onChange={e => updateEl(selectedEl.id, { fontSize: +e.target.value })} /></div>
      <div className="row"><span className="lbl">Цвет</span><input type="color" value={selectedEl.fill} onChange={e => updateEl(selectedEl.id, { fill: e.target.value })} /></div>
      <div className="chips">{['Unbounded', 'Manrope', 'Georgia', 'Courier New'].map(f => <button key={f} className={'chip' + (selectedEl.fontFamily === f ? ' on' : '')} onClick={() => updateEl(selectedEl.id, { fontFamily: f })}>{f}</button>)}</div>
      <div className="chips" style={{ marginTop: 8 }}>
        <button className={'chip' + (selectedEl.fontStyle === 'bold' ? ' on' : '')} onClick={() => updateEl(selectedEl.id, { fontStyle: selectedEl.fontStyle === 'bold' ? 'normal' : 'bold' })}>Жирный</button>
        {['left', 'center', 'right'].map(a => <button key={a} className={'chip' + (selectedEl.align === a ? ' on' : '')} onClick={() => updateEl(selectedEl.id, { align: a })}>{a === 'left' ? 'Лево' : a === 'center' ? 'Центр' : 'Право'}</button>)}
      </div>
    </div>;
    if (selectedEl.type === 'image') return <div className="panel"><h4>Фото</h4>
      <button className="btn" onClick={removeBgSelected}><Icon n="scissors" s={16} />Убрать фон</button>
      <div className="row" style={{ marginTop: 12 }}><span className="lbl">Эффекты</span></div>
      <div className="chips">{EFFECTS.map(f => <button key={f.name} className="chip" onClick={() => updateEl(selectedEl.id, { fx: f.fx })}>{f.name}</button>)}</div>
      <div className="row"><span className="lbl">Яркость</span><input type="range" min="-1" max="1" step="0.05" value={(selectedEl.fx || {}).b || 0} onChange={e => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, b: +e.target.value } })} /></div>
      <div className="row"><span className="lbl">Контраст</span><input type="range" min="-100" max="100" value={(selectedEl.fx || {}).c || 0} onChange={e => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, c: +e.target.value } })} /></div>
      <div className="row"><span className="lbl">Насыщ.</span><input type="range" min="-2" max="2" step="0.1" value={(selectedEl.fx || {}).s || 0} onChange={e => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, s: +e.target.value } })} /></div>
      <div className="row"><span className="lbl">Размытие</span><input type="range" min="0" max="20" value={(selectedEl.fx || {}).blur || 0} onChange={e => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, blur: +e.target.value } })} /></div>
      <div className="row"><span className="lbl">Прозрачн.</span><input type="range" min="0" max="1" step="0.05" value={selectedEl.opacity == null ? 1 : selectedEl.opacity} onChange={e => updateEl(selectedEl.id, { opacity: +e.target.value })} /></div>
    </div>;
    return <div className="panel"><h4>Фигура</h4>
      <div className="row"><span className="lbl">Цвет</span><input type="color" value={selectedEl.fill} onChange={e => updateEl(selectedEl.id, { fill: e.target.value })} /></div>
      <div className="row"><span className="lbl">Прозрачн.</span><input type="range" min="0" max="1" step="0.05" value={selectedEl.opacity == null ? 1 : selectedEl.opacity} onChange={e => updateEl(selectedEl.id, { opacity: +e.target.value })} /></div>
    </div>;
  };

  const renderEditor = () => (
    <div className="ed">
      <div className="edtop">
        <button className="iconbtn" onClick={() => setScreen('home')}><Icon n="back" /></button>
        <button className="iconbtn" onClick={undo} disabled={!undoStack.current.length}><Icon n="undo" /></button>
        <button className="iconbtn" onClick={redo} disabled={!redoStack.current.length}><Icon n="redo" /></button>
        <div className="spacer" />
        <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 700 }}>{user ? saveStatus : ''}</span>
        <button className={'iconbtn' + (pro ? ' on' : '')} onClick={() => setProOpen(true)}><Icon n="crown" /></button>
        <button className="iconbtn" onClick={() => setAuthOpen(true)}><Icon n="user" /></button>
        <button className="btn" style={{ width: 'auto', padding: '9px 16px' }} onClick={exportPNG}><Icon n="download" s={16} />Скачать</button>
      </div>
      <div className="edbody">
        <div className="canvasWrap" ref={containerRef}>
          <Stage ref={stageRef} width={format.w * scale} height={format.h * scale} scaleX={scale} scaleY={scale}
            onMouseDown={onDown} onTouchStart={onDown} onMouseMove={onMove} onTouchMove={onMove} onMouseUp={onUp} onTouchEnd={onUp}
            style={{ background: '#fff', boxShadow: '0 20px 60px rgba(23,18,31,.2)' }}>
            <Layer>
              {bg.mode === 'gradient'
                ? <Rect x={0} y={0} width={format.w} height={format.h} listening={false} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: format.w, y: format.h }} fillLinearGradientColorStops={[0, bg.from, 1, bg.to]} />
                : <Rect x={0} y={0} width={format.w} height={format.h} listening={false} fill={bg.color} />}
              {elements.map(el => <NodeView key={el.id} el={el} selected={el.id === selectedId} tool={tool} register={register} onSelect={() => { setSelectedId(el.id); setTool('select'); }} onChange={(p) => updateEl(el.id, p)} />)}
              {gridOn && <>{Array.from({ length: Math.floor(format.w / 100) + 1 }, (_, i) => <Line key={'v' + i} points={[i * 100, 0, i * 100, format.h]} stroke="#e9dfe9" strokeWidth={1} listening={false} />)}{Array.from({ length: Math.floor(format.h / 100) + 1 }, (_, i) => <Line key={'h' + i} points={[0, i * 100, format.w, i * 100]} stroke="#e9dfe9" strokeWidth={1} listening={false} />)}</>}
              <Transformer ref={trRef} onTransformEnd={onTransformEnd} rotateEnabled={true} boundBoxFunc={(o, n) => (n.width < 10 || n.height < 10 ? o : n)} />
            </Layer>
          </Stage>
        </div>
        {selectedEl && <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 7 }}>
          <button className="iconbtn" style={{ background: '#fff' }} onClick={dupSel}><Icon n="copy" s={18} /></button>
          <button className="iconbtn" style={{ background: '#fff' }} onClick={() => layer('up')}><Icon n="up" s={18} /></button>
          <button className="iconbtn" style={{ background: '#fff' }} onClick={() => layer('down')}><Icon n="down" s={18} /></button>
          <button className="iconbtn" style={{ background: '#fff', color: 'var(--red)' }} onClick={deleteSel}><Icon n="trash" s={18} /></button>
        </div>}
        {renderPanel()}
      </div>
      <div className="edbar">
        <button className="edtool" onClick={addText}><Icon n="type" />Текст</button>
        <button className={'edtool' + (tool === 'shapes' ? ' on' : '')} onClick={() => setTool('shapes')}><Icon n="shapes" />Фигуры</button>
        <button className={'edtool' + (tool === 'bg' ? ' on' : '')} onClick={() => setTool('bg')}><Icon n="palette" />Фон</button>
        <button className="edtool" onClick={() => pickImage((s, w, h) => addImage(s, w, h))}><Icon n="image" />Фото</button>
        <button className="edtool" onClick={removeBgSelected}><Icon n="scissors" />Убрать фон</button>
        <button className={'edtool' + (tool === 'draw' ? ' on' : '')} onClick={() => setTool('draw')}><Icon n="brush" />Рисовать</button>
        <button className={'edtool' + (tool === 'erase' ? ' on' : '')} onClick={() => setTool('erase')}><Icon n="eraser" />Стереть</button>
        <button className={'edtool' + (gridOn ? ' on' : '')} onClick={() => setGridOn(g => !g)}><Icon n="grid" />Сетка</button>
        <button className={'edtool' + (tool === 'format' ? ' on' : '')} onClick={() => setTool('format')}><Icon n="frame" />Формат</button>
      </div>
    </div>
  );

  return (<>
    <style>{CSS}</style>
    <div className="app">
      <div className="aurora">
        <div className="blob" style={{ width: 420, height: 420, left: '-8%', top: '-10%', background: '#ff4fa3' }} />
        <div className="blob" style={{ width: 380, height: 380, right: '-6%', top: '20%', background: '#7b61ff', animationDelay: '-6s' }} />
        <div className="blob" style={{ width: 300, height: 300, left: '30%', bottom: '-12%', background: '#00c2d1', animationDelay: '-12s' }} />
      </div>
      <div className="grain" />
      {screen === 'home' ? renderHome() : renderEditor()}
      {renderModals()}
      <div className="toasts">{toasts.map(t => <div key={t.id} className={'toast ' + t.type}><Icon n={t.type === 'ok' ? 'check' : t.type === 'err' ? 'x' : 'sparkles'} s={16} />{t.msg}</div>)}</div>
      {busy && <div className="busy"><div className="busybox"><div className="spinner" />Убираю фон через n8n...</div></div>}
    </div>
  </>);
}