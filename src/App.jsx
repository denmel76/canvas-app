import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Line, Ellipse, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import { createClient } from '@supabase/supabase-js';
import * as imgly from '@imgly/background-removal';
const removeBackground = imgly.removeBackground || imgly.default;

const SUPABASE_URL = 'https://iqvujenjffevijvtdvd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Cbcd0LznpbNCIA6JwOskig_4SkcqVhL';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const DRAFT_KEY = 'canvas-app-draft';
const THEME_KEY = 'canvas-app-theme';

const THEMES = {
  studio: { name: 'Studio Light', dot: ['#e6007e', '#7b61ff'], vars: { '--bg': '#f5f3f7', '--surface': '#ffffff', '--surface2': '#faf8fc', '--line': '#e6e0ec', '--ink': '#16121c', '--mut': '#6d6579', '--accent': '#e6007e', '--accent2': '#7b61ff', '--accent3': '#00c2d1', '--ok': '#12b76a', '--warn': '#f59e0b', '--danger': '#f04438', '--info': '#3b82f6', '--scrim': 'rgba(22,18,28,.45)', '--shadow': '0 18px 44px rgba(22,18,28,.13)', '--canvas': '#e9e6ee', '--onAccent': '#ffffff' } },
  midnight: { name: 'Midnight Pro', dot: ['#ff4fa3', '#8b7bff'], vars: { '--bg': '#0c0a11', '--surface': '#16131e', '--surface2': '#1e1a29', '--line': '#2d2739', '--ink': '#f3eff8', '--mut': '#9a92ab', '--accent': '#ff4fa3', '--accent2': '#8b7bff', '--accent3': '#22d3ee', '--ok': '#22c55e', '--warn': '#fbbf24', '--danger': '#fb7185', '--info': '#60a5fa', '--scrim': 'rgba(4,3,8,.66)', '--shadow': '0 20px 50px rgba(0,0,0,.55)', '--canvas': '#08070c', '--onAccent': '#12000a' } },
  editorial: { name: 'Editorial Warm', dot: ['#c2410c', '#0f766e'], vars: { '--bg': '#f4efe6', '--surface': '#fffdf8', '--surface2': '#faf5ec', '--line': '#e4dac9', '--ink': '#1d1913', '--mut': '#7a7062', '--accent': '#c2410c', '--accent2': '#b45309', '--accent3': '#0f766e', '--ok': '#15803d', '--warn': '#d97706', '--danger': '#b91c1c', '--info': '#0369a1', '--scrim': 'rgba(29,25,19,.45)', '--shadow': '0 18px 42px rgba(80,60,30,.16)', '--canvas': '#e8e0d2', '--onAccent': '#fff8f2' } },
  carbon: { name: 'Carbon Neon', dot: ['#00e5a0', '#3b82f6'], vars: { '--bg': '#07080b', '--surface': '#111319', '--surface2': '#171a22', '--line': '#242936', '--ink': '#e9edf5', '--mut': '#8b93a7', '--accent': '#00e5a0', '--accent2': '#3b82f6', '--accent3': '#f59e0b', '--ok': '#00e5a0', '--warn': '#f59e0b', '--danger': '#ff5d5d', '--info': '#3b82f6', '--scrim': 'rgba(3,4,7,.7)', '--shadow': '0 20px 50px rgba(0,0,0,.6)', '--canvas': '#040507', '--onAccent': '#04120c' } }
};
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;font-family:Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.app{min-height:100vh;background:var(--bg);color:var(--ink);position:relative;transition:background .35s,color .35s}
::-webkit-scrollbar{width:11px;height:11px}
::-webkit-scrollbar-track{background:var(--surface2)}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--accent),var(--accent2));border-radius:99px;border:3px solid var(--surface2)}
::-webkit-scrollbar-thumb:hover{background:var(--accent)}
*{scrollbar-width:thin;scrollbar-color:var(--accent) var(--surface2)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:8px}
.aurora{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.28;animation:drift 22s ease-in-out infinite alternate}
.grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.045;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>")}
.nav{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--surface) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.navin{max-width:1240px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:12px}
.logo{font-family:Unbounded;font-weight:900;font-size:20px;letter-spacing:-.4px;margin:0;display:flex;align-items:center;gap:9px}
.logomark{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:grid;place-items:center;color:var(--onAccent);box-shadow:0 6px 16px color-mix(in srgb,var(--accent) 40%,transparent)}
.spacer{flex:1}
.themes{display:flex;gap:5px;padding:4px;background:var(--surface2);border:1px solid var(--line);border-radius:99px}
.themedot{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;transition:.2s;position:relative}
.themedot:hover{transform:scale(1.12)}
.themedot.on{border-color:var(--ink);box-shadow:0 0 0 2px var(--surface)}
.home{max-width:1240px;margin:0 auto;padding:24px 20px 130px;position:relative;z-index:2}
.hero{border-radius:26px;padding:34px 30px;background:linear-gradient(120deg,color-mix(in srgb,var(--accent) 16%,var(--surface)),color-mix(in srgb,var(--accent2) 14%,var(--surface)) 55%,color-mix(in srgb,var(--accent3) 12%,var(--surface)));border:1px solid var(--line);box-shadow:var(--shadow);position:relative;overflow:hidden;animation:pop .5s both}
.hero h2{font-family:Unbounded;font-weight:900;font-size:clamp(24px,3.6vw,40px);margin:0 0 10px;letter-spacing:-1px;line-height:1.08}
.hero p{margin:0;color:var(--mut);font-weight:600;max-width:520px;font-size:14px}
.herobtns{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
.seg{display:flex;gap:4px;padding:5px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;margin:22px 0 4px;overflow-x:auto}
.segbtn{border:none;background:transparent;color:var(--mut);font:700 13px Manrope;padding:9px 15px;border-radius:10px;cursor:pointer;white-space:nowrap;display:flex;gap:6px;align-items:center;transition:.18s}
.segbtn:hover{color:var(--ink)}
.segbtn.on{background:var(--surface);color:var(--accent);box-shadow:0 2px 8px rgba(0,0,0,.08)}
.h2{font-family:Unbounded;font-weight:700;font-size:16px;margin:30px 0 14px;display:flex;align-items:center;gap:9px}
.h2 small{font:600 12px Manrope;color:var(--mut)}
.tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:12px}
.tool{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px 12px;display:flex;flex-direction:column;align-items:flex-start;gap:11px;cursor:pointer;transition:.22s;animation:pop .45s both;text-align:left}
.tool:hover{transform:translateY(-3px);border-color:var(--accent);box-shadow:var(--shadow)}
.tool:active{transform:translateY(-1px)}
.tool .ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 18%,var(--surface2)),color-mix(in srgb,var(--accent2) 18%,var(--surface2)));color:var(--accent)}
.tool b{font:700 13px Manrope}
.tool span{font:600 11px Manrope;color:var(--mut);line-height:1.35}
.tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.tpl{border-radius:18px;overflow:hidden;border:1px solid var(--line);background:var(--surface);cursor:pointer;transition:.22s;animation:pop .45s both}
.tpl:hover{transform:translateY(-3px);box-shadow:var(--shadow);border-color:var(--accent2)}
.tpl .prev{height:132px;display:grid;place-items:center;position:relative}
.tpl .meta{padding:11px 13px;font:700 12.5px Manrope;display:flex;justify-content:space-between;align-items:center;gap:8px}
.tpl .meta small{color:var(--mut);font-weight:600;font-size:11px}
.protag{display:inline-flex;gap:4px;align-items:center;color:var(--warn);font:800 10.5px Manrope}
.bgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:10px}
.bgsw{height:62px;border-radius:13px;border:1px solid var(--line);cursor:pointer;transition:.18s}
.bgsw:hover{transform:scale(1.06);border-color:var(--accent)}
.btn{background:linear-gradient(100deg,var(--accent),var(--accent2));color:var(--onAccent);border:none;border-radius:12px;padding:11px 18px;font:800 13px Manrope;cursor:pointer;display:inline-flex;gap:7px;align-items:center;justify-content:center;transition:.2s;box-shadow:0 8px 20px color-mix(in srgb,var(--accent) 30%,transparent)}
.btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.45;cursor:default;transform:none}
.btn.sec{background:var(--surface);color:var(--ink);border:1px solid var(--line);box-shadow:none}
.btn.sec:hover{border-color:var(--accent);color:var(--accent)}
.btn.full{width:100%}
.btn.sm{padding:8px 13px;font-size:12px;border-radius:10px}
.iconbtn{width:36px;height:36px;border-radius:10px;border:1px solid transparent;background:transparent;display:grid;place-items:center;cursor:pointer;color:var(--ink);transition:.16s;flex:none}
.iconbtn:hover{background:var(--surface2);border-color:var(--line);color:var(--accent)}
.iconbtn:disabled{opacity:.28;cursor:default}
.iconbtn.on{color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,var(--surface));border-color:var(--accent)}
.cta{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;border-radius:99px;padding:15px 28px;animation:float 3.4s ease-in-out infinite}
.ed{position:fixed;inset:0;display:flex;flex-direction:column;background:var(--canvas);z-index:2}
.edtop{height:54px;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:6px;padding:0 10px;z-index:8}
.docname{border:1px solid transparent;background:transparent;color:var(--ink);font:700 13px Manrope;padding:6px 9px;border-radius:9px;width:150px}
.docname:hover{background:var(--surface2)}
.docname:focus{border-color:var(--accent);background:var(--surface2);outline:none}
.status{font:600 11.5px Manrope;color:var(--mut);display:flex;align-items:center;gap:6px;white-space:nowrap}
.dot{width:6px;height:6px;border-radius:50%;background:var(--ok)}
.edbody{flex:1;position:relative;overflow:hidden}
.canvasWrap{position:absolute;inset:0;padding:16px 328px 16px 16px}
.canvasInner{width:100%;height:100%;display:grid;place-items:center;overflow:auto}
.rail{position:absolute;top:12px;right:12px;bottom:12px;width:304px;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);padding:14px;z-index:7}
@media(max-width:900px){.canvasWrap{padding:12px 12px 42vh 12px}.rail{left:12px;right:12px;top:auto;bottom:12px;width:auto;max-height:40vh}}
.railsec{border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:12px}
.railsec:last-child{border:none;margin:0;padding:0}
.railtitle{font:800 10.5px Manrope;letter-spacing:.9px;text-transform:uppercase;color:var(--mut);margin:0 0 10px;display:flex;align-items:center;gap:6px}
.row{display:flex;align-items:center;gap:9px;margin:9px 0}
.lbl{font:700 11.5px Manrope;color:var(--mut);min-width:66px}
.val{font:700 11px Manrope;color:var(--ink);min-width:38px;text-align:right}
input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:99px;background:var(--line);width:100%;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);border:2px solid var(--surface);box-shadow:0 2px 6px rgba(0,0,0,.25);cursor:pointer}
input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--accent);border:2px solid var(--surface);cursor:pointer}
input[type=color]{width:32px;height:32px;border:1px solid var(--line);border-radius:9px;padding:2px;background:var(--surface2);cursor:pointer}
.num{width:100%;border:1px solid var(--line);border-radius:9px;padding:7px 9px;font:700 12px Manrope;background:var(--surface2);color:var(--ink)}
.num:focus{border-color:var(--accent);outline:none}
.txt{width:100%;border:1px solid var(--line);border-radius:11px;padding:10px;font:600 13px Manrope;background:var(--surface2);color:var(--ink)}
.txt:focus{border-color:var(--accent);outline:none}
.chips{display:flex;flex-wrap:wrap;gap:5px}
.chip{border:1px solid var(--line);background:var(--surface2);color:var(--ink);border-radius:99px;padding:6px 11px;font:700 11.5px Manrope;cursor:pointer;display:inline-flex;gap:5px;align-items:center;transition:.16s}
.chip:hover{border-color:var(--accent)}
.chip.on{background:var(--accent);color:var(--onAccent);border-color:var(--accent)}
.chip small{opacity:.65;font-weight:600}
.toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:9px 0;font:700 11.5px Manrope;color:var(--mut)}
.sw{width:38px;height:21px;border-radius:99px;background:var(--line);border:none;cursor:pointer;position:relative;transition:.2s;flex:none}
.sw::after{content:'';position:absolute;top:2.5px;left:2.5px;width:16px;height:16px;border-radius:50%;background:var(--surface);transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.sw.on{background:var(--accent)}
.sw.on::after{transform:translateX(17px)}
.edbar{height:70px;background:var(--surface);border-top:1px solid var(--line);display:flex;gap:2px;overflow-x:auto;padding:6px 10px;z-index:8}
.edtool{min-width:68px;display:flex;flex-direction:column;align-items:center;gap:4px;border:none;background:transparent;border-radius:11px;cursor:pointer;font:700 10.5px Manrope;color:var(--mut);padding:6px 8px;transition:.16s}
.edtool:hover{color:var(--ink);background:var(--surface2)}
.edtool.on{color:var(--accent);background:color-mix(in srgb,var(--accent) 13%,var(--surface))}
.float{position:absolute;top:12px;left:12px;display:flex;gap:5px;z-index:7;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:4px;box-shadow:var(--shadow)}
.toasts{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:70;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.toast{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-left:3px solid var(--info);border-radius:12px;padding:10px 16px;font:700 12.5px Manrope;box-shadow:var(--shadow);animation:pop .28s both;display:flex;gap:8px;align-items:center;max-width:90vw}
.toast.ok{border-left-color:var(--ok)}.toast.err{border-left-color:var(--danger)}.toast.info{border-left-color:var(--accent2)}
.modal{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(6px);z-index:50;display:grid;place-items:center;padding:20px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:24px;width:min(470px,100%);max-height:85vh;overflow:auto;animation:pop .3s both;box-shadow:var(--shadow)}
.card h3{font-family:Unbounded;margin:0 0 14px;font-size:19px}
.busy{position:fixed;inset:0;z-index:60;background:var(--scrim);backdrop-filter:blur(5px);display:grid;place-items:center}
.busybox{display:flex;flex-direction:column;align-items:center;gap:13px;font:800 14px Manrope;color:var(--ink);background:var(--surface);border:1px solid var(--line);padding:28px 34px;border-radius:20px;box-shadow:var(--shadow)}
.busynote{font:600 11.5px Manrope;color:var(--mut);text-align:center;max-width:250px}
.spinner{width:46px;height:46px;border-radius:50%;border:4px solid var(--line);border-top-color:var(--accent);animation:spin .9s linear infinite}
.plan{border:1px solid var(--line);border-radius:14px;padding:13px;margin:9px 0;display:flex;justify-content:space-between;align-items:center;background:var(--surface2)}
.plan b{font-family:Unbounded;font-size:14px}
.unlock{display:flex;gap:8px;align-items:center;font:600 12.5px Manrope;margin:6px 0}
.unlock svg{color:var(--ok);flex:none}
.empty{text-align:center;color:var(--mut);font:600 12px Manrope;padding:14px 6px;line-height:1.5}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(70px,-50px) scale(1.18)}}
@keyframes pop{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes float{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px)}}
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
  apps: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  check: 'M20 6L9 17l-5-5',
  layers: 'M12 2l10 6-10 6L2 8z M2 16l10 6 10-6',
  lock: 'M6 11h12v9H6z M9 11V7a3 3 0 0 1 6 0v4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7',
  sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  dice: 'M4 4h16v16H4z M8.5 8.5h.01 M15.5 8.5h.01 M12 12h.01 M8.5 15.5h.01 M15.5 15.5h.01',
  reset: 'M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8 M3 3v5h5',
  zoom: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3 M8 11h6 M11 8v6',
  magnet: 'M6 3v8a6 6 0 0 0 12 0V3 M6 8h4 M14 8h4',
  doc: 'M6 2h8l4 4v16H6z M14 2v4h4',
  move: 'M12 2v20 M2 12h20 M9 5l3-3 3 3 M9 19l3 3 3-3 M5 9l-3 3 3 3 M19 9l3 3-3 3'
};
const Icon = ({ n, s = 18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const readAsDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('не удалось прочитать файл')); r.readAsDataURL(file); });

const videoFrame = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
  const cleanup = () => URL.revokeObjectURL(url);
  const timer = setTimeout(() => { cleanup(); reject(new Error('видео не загрузилось')); }, 20000);
  v.onloadeddata = () => { try { v.currentTime = Math.min(1, (v.duration || 2) * 0.1); } catch (e) {} };
  v.onseeked = () => {
    try {
      const c = document.createElement('canvas');
      c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      clearTimeout(timer); cleanup(); resolve({ src: c.toDataURL('image/png'), w: c.width, h: c.height });
    } catch (e) { clearTimeout(timer); cleanup(); reject(new Error('не удалось взять кадр')); }
  };
  v.onerror = () => { clearTimeout(timer); cleanup(); reject(new Error('формат видео не поддерживается')); };
});

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

function NodeView({ el, selected, onSelect, onChange, register, tool, accent }) {
  const ref = useRef(null);
  const img = useImage(el.type === 'image' ? el.src : null);
  useEffect(() => { register(el.id, ref.current); return () => register(el.id, null); }, [el.id, img, register]);
  useEffect(() => { if (el.type === 'image' && img && ref.current) ref.current.cache(); },
    [img, el.type, el.width, el.height, el.fx && el.fx.b, el.fx && el.fx.c, el.fx && el.fx.s, el.fx && el.fx.blur, el.crop && el.crop.x, el.crop && el.crop.y, el.crop && el.crop.width, el.crop && el.crop.height]);
  const common = {
    ref, x: el.x, y: el.y, rotation: el.rotation || 0, opacity: el.opacity == null ? 1 : el.opacity,
    draggable: tool === 'select', onClick: onSelect, onTap: onSelect,
    onDragEnd: (e) => onChange({ x: e.target.x(), y: e.target.y() })
  };
  const st = selected ? accent : (el.stroke || undefined);
  const sw = selected ? 3 : (el.strokeWidth || 0);
  if (el.type === 'image') {
    if (!img) return null;
    const fx = el.fx || {}; const filters = [];
    if (fx.b) filters.push(Konva.Filters.Brighten);
    if (fx.c) filters.push(Konva.Filters.Contrast);
    if (fx.s) filters.push(Konva.Filters.Saturate);
    if (fx.blur) filters.push(Konva.Filters.Blur);
    return <KonvaImage {...common} image={img} width={el.width} height={el.height} crop={el.crop || undefined} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} filters={filters} brightness={fx.b || 0} contrast={fx.c || 0} saturation={fx.s || 0} blurRadius={fx.blur || 0} stroke={st} strokeWidth={sw} />;
  }
  if (el.type === 'text') return <Text {...common} text={el.text} fontSize={el.fontSize} fontFamily={el.fontFamily} fontStyle={el.fontStyle || 'normal'} fill={el.fill} align={el.align || 'left'} width={el.width} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={selected ? accent : undefined} strokeWidth={selected ? 1 : 0} />;
  if (el.type === 'rect') return <Rect {...common} width={el.width} height={el.height} fill={el.fill} cornerRadius={el.radius || 0} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={st} strokeWidth={sw} />;
  if (el.type === 'circle') return <Ellipse {...common} radiusX={el.width / 2} radiusY={el.height / 2} fill={el.fill} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={st} strokeWidth={sw} />;
  if (el.type === 'triangle') return <RegularPolygon {...common} sides={3} radius={el.width / 2} fill={el.fill} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} stroke={st} strokeWidth={sw} />;
  if (el.type === 'line') return <Line {...common} points={el.points} stroke={el.fill} strokeWidth={el.strokeWidth || 6} lineCap="round" scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} />;
  if (el.type === 'draw') return <Line points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth} lineCap="round" lineJoin="round" tension={0.5} listening={false} opacity={el.opacity == null ? 1 : el.opacity} />;
  return null;
}
export default function App() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem(THEME_KEY) || 'studio'; } catch (e) { return 'studio'; } });
  const T = THEMES[theme] || THEMES.studio;
  const accent = T.vars['--accent'];
  const [screen, setScreen] = useState('home');
  const [tab, setTab] = useState('Фото');
  const [docName, setDocName] = useState('Без названия');
  const [elements, setElements] = useState([]);
  const [bg, setBg] = useState({ mode: 'solid', color: '#ffffff', from: '#ff2fb3', to: '#7b61ff' });
  const [format, setFormat] = useState({ label: 'Пост Instagram', w: 1080, h: 1080 });
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [gridOn, setGridOn] = useState(false);
  const [gridSize, setGridSize] = useState(100);
  const [snap, setSnap] = useState(false);
  const [zoom, setZoom] = useState(1);
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
  const [bgProgress, setBgProgress] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [cs, setCs] = useState({ w: 800, h: 600 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const stageRef = useRef(null); const trRef = useRef(null);
  const nodeRefs = useRef({}); const containerRef = useRef(null);
  const lastHist = useRef(0);
  const elementsRef = useRef(elements); const bgRef = useRef(bg); const formatRef = useRef(format);
  const drawingRef = useRef(null); const erasingRef = useRef(false);
  useEffect(() => { elementsRef.current = elements; bgRef.current = bg; formatRef.current = format; }, [elements, bg, format]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }, [theme]);

  const register = useCallback((id, node) => { if (node) nodeRefs.current[id] = node; else delete nodeRefs.current[id]; }, []);
  const toast = (msg, type = 'info') => { const id = uid(); setToasts(t => [...t, { id, msg, type }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };
  const fit = Math.max(0.05, Math.min((cs.w - 24) / format.w, (cs.h - 24) / format.h, 1));
  const scale = fit * zoom;

  const pushHist = () => {
    const now = Date.now();
    if (now - lastHist.current > 450) {
      setUndoStack(s => [...s.slice(-59), { elements: elementsRef.current, bg: bgRef.current, format: formatRef.current }]);
      setRedoStack([]);
    }
    lastHist.current = now;
  };
  const undo = () => { if (!undoStack.length) return; const s = undoStack[undoStack.length - 1]; setRedoStack(r => [...r, { elements: elementsRef.current, bg: bgRef.current, format: formatRef.current }]); setUndoStack(u => u.slice(0, -1)); setElements(s.elements); setBg(s.bg); setFormat(s.format); setSelectedId(null); };
  const redo = () => { if (!redoStack.length) return; const s = redoStack[redoStack.length - 1]; setUndoStack(u => [...u, { elements: elementsRef.current, bg: bgRef.current, format: formatRef.current }]); setRedoStack(r => r.slice(0, -1)); setElements(s.elements); setBg(s.bg); setFormat(s.format); setSelectedId(null); };
  const mutate = (fn) => { pushHist(); setElements(fn); };
  const updateEl = (id, patch) => mutate(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const snapVal = (v) => snap ? Math.round(v / gridSize) * gridSize : v;

  useEffect(() => {
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) { const d = JSON.parse(raw); if (d && Array.isArray(d.elements)) { setElements(d.elements); if (d.bg) setBg(d.bg); if (d.format) setFormat(d.format); if (d.docName) setDocName(d.docName); } } } catch (e) {}
  }, []);
  useEffect(() => {
    if (user) return;
    const t = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ elements, bg, format, docName })); setSaveStatus('Черновик сохранён'); } catch (e) { setSaveStatus('Черновик не сохранён'); } }, 800);
    return () => clearTimeout(t);
  }, [elements, bg, format, docName, user]);

  const loadProject = async (u) => {
    const { data } = await supabase.from('projects').select('data').eq('user_id', u.id).maybeSingle();
    if (data && data.data && Array.isArray(data.data.elements)) { setElements(data.data.elements); if (data.data.bg) setBg(data.data.bg); if (data.data.format) setFormat(data.data.format); if (data.data.docName) setDocName(data.data.docName); }
  };

  useLayoutEffect(() => {
    if (screen !== 'editor') return;
    const measure = () => { const r = containerRef.current && containerRef.current.getBoundingClientRect(); if (r) setCs({ w: r.width, h: r.height }); };
    measure(); const id = setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(id); window.removeEventListener('resize', measure); };
  }, [screen]);

  useEffect(() => {
    const tr = trRef.current; if (!tr) return;
    const node = selectedId && tool === 'select' ? nodeRefs.current[selectedId] : null;
    tr.nodes(node ? [node] : []); tr.getLayer() && tr.getLayer().batchDraw();
  }, [selectedId, elements, tool, screen, theme]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) deleteSel();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); dupSel(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, elements, undoStack, redoStack]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { const u = data.session ? data.session.user : null; setUser(u); if (u) loadProject(u); }).catch(() => {});
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => { const u = s ? s.user : null; setUser(u); if (u) loadProject(u); });
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!user || screen !== 'editor') return;
    setSaveStatus('Сохранение...');
    const t = setTimeout(async () => {
      const { error } = await supabase.from('projects').upsert({ user_id: user.id, data: { elements, bg, format, docName }, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      setSaveStatus(error ? 'Ошибка сохранения' : 'Сохранено в аккаунт');
    }, 1200);
    return () => clearTimeout(t);
  }, [elements, bg, format, docName, user, screen]);
    const addText = () => { const id = uid(); mutate(p => [...p, { id, type: 'text', x: format.w / 2 - 200, y: format.h / 2 - 40, width: 400, text: 'Напиши здесь', fontSize: 64, fill: '#17121f', fontFamily: 'Unbounded', fontStyle: 'normal', align: 'left' }]); setSelectedId(id); setTool('select'); };
  const addShape = (kind) => { const id = uid(); const base = { id, type: kind, x: format.w / 2, y: format.h / 2, fill: accent, opacity: 1, strokeWidth: 0, stroke: '#17121f' }; const el = kind === 'rect' ? { ...base, x: format.w / 2 - 150, y: format.h / 2 - 150, width: 300, height: 300, radius: 24 } : kind === 'line' ? { ...base, points: [0, 0, 300, 0], strokeWidth: 8, fill: accent } : { ...base, width: 300, height: 300 }; mutate(p => [...p, el]); setSelectedId(id); setTool('select'); };
  const addImage = (src, w, h, thenRemove, fx) => { const id = uid(); const f = Math.min(format.w * 0.7 / w, format.h * 0.7 / h, 1); const width = w * f, height = h * f; mutate(p => [...p, { id, type: 'image', src, x: (format.w - width) / 2, y: (format.h - height) / 2, width, height, fx: fx || {}, opacity: 1 }]); setScreen('editor'); setSelectedId(id); setTool('select'); if (thenRemove) removeBg(id, src); };
  const pickImage = (cb) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const img = new window.Image(); img.onload = () => cb(r.result, img.width, img.height); img.src = r.result; }; r.readAsDataURL(f); }; inp.click(); };
  const pickAny = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*,video/*'; inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return; if (f.type.startsWith('video')) { setBusy(true); try { const fr = await videoFrame(f); addImage(fr.src, fr.w, fr.h); toast('Кадр из видео добавлен', 'ok'); } catch (e) { toast(e.message, 'err'); } finally { setBusy(false); } } else { const src = await readAsDataURL(f); const img = new window.Image(); img.onload = () => addImage(src, img.width, img.height); img.src = src; } }; inp.click(); };
  const pickMulti = (cb) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true; inp.onchange = async () => { const files = Array.from(inp.files || []).slice(0, 4); if (!files.length) return; const imgs = await Promise.all(files.map(async f => { const src = await readAsDataURL(f); return new Promise(res => { const i = new window.Image(); i.onload = () => res({ src, w: i.width, h: i.height }); i.src = src; }); })); cb(imgs); }; inp.click(); };
  const makeCollage = () => pickMulti(imgs => {
    if (imgs.length < 2) { addImage(imgs[0].src, imgs[0].w, imgs[0].h); toast('Для коллажа выбери 2–4 фото', 'info'); return; }
    const n = imgs.length, cols = 2, rows = Math.ceil(n / cols), gap = 24;
    const cw = (format.w - gap * (cols + 1)) / cols, ch = (format.h - gap * (rows + 1)) / rows;
    const els = imgs.map((im, i) => { const cx = i % cols, cy = Math.floor(i / cols); const sc = Math.max(cw / im.w, ch / im.h); const cropW = cw / sc, cropH = ch / sc; return { id: uid(), type: 'image', src: im.src, x: gap + cx * (cw + gap), y: gap + cy * (ch + gap), width: cw, height: ch, crop: { x: (im.w - cropW) / 2, y: (im.h - cropH) / 2, width: cropW, height: cropH }, fx: {}, opacity: 1 }; });
    pushHist(); setElements(els); setScreen('editor'); setTool('select'); setSelectedId(null); toast('Коллаж из ' + n + ' фото собран', 'ok');
  });

  const removeBg = async (id, src) => {
    setBusy(true); setBgProgress(0);
    try {
      const inputBlob = await (await fetch(src)).blob();
      const outBlob = await Promise.race([
        removeBackground(inputBlob, { model: 'medium', output: { format: 'image/png', quality: 1 }, progress: (k, c, t) => { if (t) setBgProgress(Math.round((c / t) * 100)); } }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('долго грузится модель — проверь интернет')), 180000))
      ]);
      const dataUrl = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(new Error('чтение результата')); r.readAsDataURL(outBlob); });
      mutate(p => p.map(e => e.id === id ? { ...e, src: dataUrl, crop: undefined } : e));
      toast('Фон удалён на устройстве', 'ok');
    } catch (e) { toast('Ошибка: ' + (e && e.message ? e.message : e), 'err'); }
    finally { setBusy(false); }
  };
  const removeBgSelected = () => { const el = elements.find(e => e.id === selectedId && e.type === 'image') || [...elements].reverse().find(e => e.type === 'image'); if (!el) { toast('Сначала добавь фото', 'err'); return; } removeBg(el.id, el.src); };

  const deleteSel = () => { if (!selectedId) return; mutate(p => p.filter(e => e.id !== selectedId)); setSelectedId(null); toast('Объект удалён — можно отменить', 'info'); };
  const dupSel = () => { const el = elements.find(e => e.id === selectedId); if (!el) return; const id = uid(); mutate(p => [...p, { ...el, id, x: el.x + 30, y: el.y + 30 }]); setSelectedId(id); };
  const layer = (dir) => { const i = elements.findIndex(e => e.id === selectedId); if (i < 0) return; mutate(p => { const n = [...p]; const [it] = n.splice(i, 1); n.splice(dir === 'up' ? Math.min(i + 1, n.length) : Math.max(i - 1, 0), 0, it); return n; }); };

  const ptr = () => { const pos = stageRef.current.getPointerPosition(); return { x: pos.x / scale, y: pos.y / scale }; };
  const eraseAt = (p) => {
    const before = elementsRef.current;
    let next = before.filter(e => e.type !== 'draw' || !e.points.some((pt, i) => i % 2 === 0 && Math.hypot(pt - p.x, e.points[i + 1] - p.y) < brushSize + 8));
    if (next.length === before.length) {
      const shape = stageRef.current.getIntersection(stageRef.current.getPointerPosition());
      if (shape) { const entry = Object.entries(nodeRefs.current).find(([, nd]) => nd === shape); if (entry) next = before.filter(e => e.id !== entry[0]); }
    }
    if (next.length !== before.length) setElements(next);
  };
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
    if (el.type === 'image' || el.type === 'rect') { updateEl(el.id, { x: snapVal(node.x()), y: snapVal(node.y()), width: Math.max(10, node.width() * sx), height: Math.max(10, node.height() * sy), scaleX: 1, scaleY: 1, rotation: node.rotation() }); node.scaleX(1); node.scaleY(1); }
    else if (el.type === 'text') { updateEl(el.id, { x: snapVal(node.x()), y: snapVal(node.y()), fontSize: Math.max(8, el.fontSize * sy), width: Math.max(40, node.width() * sx), scaleX: 1, scaleY: 1, rotation: node.rotation() }); node.scaleX(1); node.scaleY(1); }
    else updateEl(el.id, { x: snapVal(node.x()), y: snapVal(node.y()), scaleX: sx, scaleY: sy, rotation: node.rotation() });
  };

  const exportPNG = () => {
    setSelectedId(null);
    setTimeout(() => {
      const stage = stageRef.current; if (!stage) return;
      stage.scale({ x: 1, y: 1 }); stage.width(format.w); stage.height(format.h);
      const uri = stage.toDataURL({ pixelRatio: 2 });
      stage.scale({ x: scale, y: scale }); stage.width(format.w * scale); stage.height(format.h * scale);
      const a = document.createElement('a'); a.download = (docName || 'design') + '.png'; a.href = uri; document.body.appendChild(a); a.click(); a.remove();
      toast('PNG ' + format.w * 2 + '×' + format.h * 2 + ' скачан', 'ok');
    }, 120);
  };
  const openEditor = () => { setScreen('editor'); setTool('select'); setSelectedId(null); };
  const applyTemplate = (t) => { if (t.pro && !pro) { setProOpen(true); return; } pushHist(); setElements(t.elements); setBg(t.bg); setFormat(t.format); setDocName(t.name); openEditor(); toast('Шаблон «' + t.name + '» загружен', 'ok'); };
  const resetDoc = () => { pushHist(); setElements([]); setBg({ mode: 'solid', color: '#ffffff', from: '#ff2fb3', to: '#7b61ff' }); setSelectedId(null); setZoom(1); toast('Холст очищен — Undo вернёт', 'info'); };
  const randomize = () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const pal = [['#e6007e', '#7b61ff'], ['#00c2d1', '#3b82f6'], ['#f59e0b', '#ef4444'], ['#12b76a', '#00c2d1'], ['#8b5cf6', '#ec4899']];
    const [c1, c2] = pick(pal);
    pushHist();
    setBg({ mode: 'gradient', from: c1, to: c2 });
    const els = [];
    for (let i = 0; i < 4; i++) {
      const kind = pick(['rect', 'circle', 'triangle']);
      const size = 120 + Math.random() * 320;
      const base = { id: uid(), type: kind, x: Math.random() * format.w, y: Math.random() * format.h, width: size, height: size, fill: pick([c1, c2, '#ffffff', '#17121f']), opacity: 0.35 + Math.random() * 0.5, rotation: Math.random() * 360, strokeWidth: 0, stroke: '#ffffff' };
      els.push(kind === 'rect' ? { ...base, radius: Math.random() * 60 } : base);
    }
    els.push({ id: uid(), type: 'text', x: format.w * 0.1, y: format.h * 0.42, width: format.w * 0.8, text: pick(['BOLD IDEA', 'NEW DROP', 'STUDIO', 'MAKE IT']), fontSize: Math.round(format.w * 0.11), fill: '#ffffff', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center', opacity: 1 });
    setElements(els); setScreen('editor'); setSelectedId(null); toast('Случайная композиция собрана', 'ok');
  };
  const doAuth = async (e) => { e.preventDefault(); setAuthErr(''); setAuthBusy(true); const fn = authMode === 'in' ? supabase.auth.signInWithPassword({ email, password }) : supabase.auth.signUp({ email, password }); const { error } = await fn; setAuthBusy(false); if (error) setAuthErr(error.message); else { setAuthOpen(false); toast(authMode === 'in' ? 'Вы вошли' : 'Аккаунт создан', 'ok'); } };

  const FORMATS = [{ label: 'Пост IG', w: 1080, h: 1080 }, { label: 'Сторис', w: 1080, h: 1920 }, { label: 'YouTube', w: 1280, h: 720 }, { label: 'Shorts', w: 1080, h: 1920 }, { label: 'A4', w: 1240, h: 1754 }, { label: 'Баннер', w: 1500, h: 500 }];
  const EFFECTS = [{ name: 'Нет', fx: {} }, { name: 'Моно', fx: { s: -1 } }, { name: 'Тёплый', fx: { b: .08, s: .3 } }, { name: 'Холодный', fx: { s: -.3, b: .05 } }, { name: 'Яркий', fx: { c: 25, s: .6 } }, { name: 'Мягкий', fx: { blur: 2, b: .06 } }, { name: 'Драма', fx: { c: 45, s: -.2 }, pro: true }, { name: 'Закат', fx: { b: .1, s: .5, blur: 1 }, pro: true }];
  const BGS = [{ mode: 'solid', color: '#ffffff' }, { mode: 'solid', color: '#17121f' }, { mode: 'gradient', from: '#ff2fb3', to: '#7b61ff' }, { mode: 'gradient', from: '#ffb020', to: '#ff5e62' }, { mode: 'gradient', from: '#00c2d1', to: '#7b61ff' }, { mode: 'gradient', from: '#12b76a', to: '#00c2d1' }, { mode: 'gradient', from: '#f6f2f7', to: '#ffd7ea' }, { mode: 'gradient', from: '#17121f', to: '#e6007e' }];
  const TEMPLATES = [
    { name: 'MY BRAND', tag: 'Пост IG', bg: { mode: 'solid', color: '#f6f2f7' }, format: FORMATS[0], elements: [{ id: uid(), type: 'text', x: 140, y: 420, width: 800, text: 'MY BRAND', fontSize: 130, fill: '#e6007e', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }, { id: uid(), type: 'rect', x: 340, y: 620, width: 400, height: 14, radius: 7, fill: '#7b61ff', strokeWidth: 0 }] },
    { name: 'Скидка 50%', tag: 'Сторис', bg: { mode: 'gradient', from: '#ff2fb3', to: '#7b61ff' }, format: FORMATS[1], elements: [{ id: uid(), type: 'text', x: 140, y: 700, width: 800, text: 'SALE', fontSize: 200, fill: '#ffffff', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }, { id: uid(), type: 'text', x: 140, y: 980, width: 800, text: '-50% до конца недели', fontSize: 60, fill: '#ffd7ea', fontFamily: 'Manrope', align: 'center' }] },
    { name: 'Цитата дня', tag: 'Пост', bg: { mode: 'solid', color: '#17121f' }, format: FORMATS[0], elements: [{ id: uid(), type: 'text', x: 140, y: 400, width: 800, text: 'Делай просто.\nДелай красиво.', fontSize: 84, fill: '#ffffff', fontFamily: 'Unbounded', align: 'center' }, { id: uid(), type: 'circle', x: 540, y: 800, width: 120, height: 120, fill: '#e6007e', strokeWidth: 0 }] },
    { name: 'Неон промо', tag: 'YouTube', bg: { mode: 'gradient', from: '#17121f', to: '#e6007e' }, format: FORMATS[2], elements: [{ id: uid(), type: 'text', x: 90, y: 260, width: 1100, text: 'НОВЫЙ ВЫПУСК', fontSize: 110, fill: '#00c2d1', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }] },
    { name: 'Gold VIP', tag: 'PRO', pro: true, bg: { mode: 'solid', color: '#17121f' }, format: FORMATS[0], elements: [{ id: uid(), type: 'text', x: 140, y: 430, width: 800, text: 'VIP ACCESS', fontSize: 110, fill: '#ffb020', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }, { id: uid(), type: 'rect', x: 340, y: 620, width: 400, height: 14, radius: 7, fill: '#ffb020', strokeWidth: 0 }] },
    { name: 'Cyber Story', tag: 'PRO', pro: true, bg: { mode: 'gradient', from: '#0f0c29', to: '#00c2d1' }, format: FORMATS[1], elements: [{ id: uid(), type: 'text', x: 140, y: 800, width: 800, text: 'CYBER\nMONDAY', fontSize: 150, fill: '#00c2d1', fontFamily: 'Unbounded', fontStyle: 'bold', align: 'center' }] }
  ];
  const TOOLS = [
    { icon: 'scissors', title: 'Убрать фон', desc: 'Нейросеть на устройстве', act: () => pickImage((s, w, h) => addImage(s, w, h, true)) },
    { icon: 'type', title: 'Текст', desc: 'Заголовки и подписи', act: () => { openEditor(); addText(); } },
    { icon: 'eraser', title: 'Удаление', desc: 'Ластик по объектам', act: () => { openEditor(); setTool('erase'); } },
    { icon: 'sparkles', title: 'ИИ Улучшить', desc: 'Автокоррекция цвета', act: () => pickImage((s, w, h) => { addImage(s, w, h, false, { c: 25, s: .6 }); toast('Эффект «Яркий» применён', 'ok'); }) },
    { icon: 'image', title: 'Коллаж', desc: 'Сетка из 2–4 фото', act: makeCollage },
    { icon: 'palette', title: 'Эффекты', desc: '8 пресетов обработки', act: () => pickImage((s, w, h) => addImage(s, w, h)) },
    { icon: 'brush', title: 'Фристайл', desc: 'Кисть и скетч', act: () => { openEditor(); setTool('draw'); } },
    { icon: 'wand', title: 'Корректор', desc: 'Экспозиция и цвет', act: () => pickImage((s, w, h) => addImage(s, w, h)) }
  ];
  const AGENTS = [
    { icon: 'sparkles', title: 'ИИ Улучшить', desc: 'Контраст + насыщенность', act: TOOLS[3].act },
    { icon: 'scissors', title: 'Убрать фон', desc: 'Прозрачный PNG', act: TOOLS[0].act },
    { icon: 'palette', title: 'Ч/Б моно', desc: 'Чёрно-белый кадр', act: () => pickImage((s, w, h) => { addImage(s, w, h, false, { s: -1 }); toast('Ч/Б применён', 'ok'); }) },
    { icon: 'wand', title: 'Тёплый тон', desc: 'Мягкая теплота', act: () => pickImage((s, w, h) => { addImage(s, w, h, false, { b: .08, s: .3 }); toast('Тёплый тон применён', 'ok'); }) }
  ];
  const VIDEO = [{ icon: 'video', title: 'Обложка YouTube', desc: '1280×720', act: () => { setFormat(FORMATS[2]); openEditor(); addText(); } }, { icon: 'video', title: 'Обложка Shorts', desc: '1080×1920', act: () => { setFormat(FORMATS[3]); openEditor(); addText(); } }, { icon: 'frame', title: 'Кадр из видео', desc: 'Загрузить ролик', act: pickAny }];
  const APPS = [{ icon: 'image', title: 'Коллаж', desc: 'Мультисетка', act: makeCollage }, { icon: 'palette', title: 'Эффекты', desc: 'Пресеты', act: TOOLS[5].act }, { icon: 'wand', title: 'Корректор', desc: 'Ползунки', act: TOOLS[7].act }, { icon: 'grid', title: 'Фоны', desc: 'Градиенты', act: () => { openEditor(); setTool('bg'); } }, { icon: 'dice', title: 'Рандом', desc: 'Случайный дизайн', act: randomize }];
  const DRAWC = [{ icon: 'brush', title: 'Фристайл', desc: 'Базовая кисть', act: TOOLS[6].act }, { icon: 'brush', title: 'Неон-кисть', desc: 'Циан, 14px', act: () => { setBrushColor('#00c2d1'); setBrushSize(14); openEditor(); setTool('draw'); } }, { icon: 'brush', title: 'Скетч', desc: 'Графит, 4px', act: () => { setBrushColor('#17121f'); setBrushSize(4); openEditor(); setTool('draw'); } }];
  const SEARCH_INDEX = [
    ...TOOLS.map(t => ({ title: t.title, kind: 'Инструмент', act: t.act })),
    ...TEMPLATES.map(t => ({ title: t.name, kind: t.pro ? 'Шаблон PRO' : 'Шаблон', act: () => applyTemplate(t) })),
    ...APPS.map(t => ({ title: t.title, kind: 'Приложение', act: t.act })),
    ...AGENTS.map(t => ({ title: t.title, kind: 'Agent', act: t.act })),
    ...VIDEO.map(t => ({ title: t.title, kind: 'Видео', act: t.act })),
    ...DRAWC.map(t => ({ title: t.title, kind: 'Рисование', act: t.act })),
    ...BGS.map((b, i) => ({ title: 'Фон ' + (i + 1), kind: 'Фон', act: () => { pushHist(); setBg(b); openEditor(); setTool('bg'); } })),
    ...FORMATS.map(f => ({ title: f.label, kind: 'Формат', act: () => { pushHist(); setFormat(f); openEditor(); setTool('format'); } })),
    ...Object.entries(THEMES).map(([k, v]) => ({ title: v.name, kind: 'Тема', act: () => { setTheme(k); toast('Тема: ' + v.name, 'ok'); } }))
  ];
    const selectedEl = elements.find(e => e.id === selectedId);
  const bgStyle = (b) => b.mode === 'gradient' ? { background: `linear-gradient(135deg,${b.from},${b.to})` } : { background: b.color };
  const ThemePicker = () => (
    <div className="themes" title="Тема интерфейса">
      {Object.entries(THEMES).map(([k, v]) => (
        <button key={k} className={'themedot' + (theme === k ? ' on' : '')} title={v.name} onClick={() => { setTheme(k); toast('Тема: ' + v.name, 'ok'); }} style={{ background: `linear-gradient(135deg,${v.dot[0]},${v.dot[1]})` }} />
      ))}
    </div>
  );
  const Grid = ({ items }) => (
    <div className="tools">{items.map((t, i) => (
      <button key={t.title} className="tool" style={{ animationDelay: `${i * 0.04}s` }} onClick={t.act}>
        <span className="ic"><Icon n={t.icon} s={21} /></span>
        <b>{t.title}</b><span>{t.desc}</span>
      </button>))}
    </div>
  );
  const TplGrid = () => (
    <div className="tpls">{TEMPLATES.map((t, i) => (
      <div key={t.name} className="tpl" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => applyTemplate(t)}>
        <div className="prev" style={bgStyle(t.bg)}>
          <span style={{ fontFamily: 'Unbounded', fontWeight: 900, fontSize: 22, color: t.bg.mode === 'solid' && t.bg.color === '#17121f' ? '#fff' : '#e6007e', textAlign: 'center', padding: '0 10px' }}>{t.name}</span>
        </div>
        <div className="meta">{t.name}{t.pro && !pro ? <span className="protag"><Icon n="lock" s={12} />PRO</span> : <small>{t.tag}</small>}</div>
      </div>))}
    </div>
  );

  const renderHome = () => (
    <>
      <div className="nav"><div className="navin">
        <h1 className="logo"><span className="logomark"><Icon n="layers" s={17} /></span>Редактор</h1>
        <div className="spacer" />
        <ThemePicker />
        <button className="iconbtn" onClick={() => setSearchOpen(true)} title="Поиск"><Icon n="search" /></button>
        <button className="iconbtn" onClick={() => setAuthOpen(true)} title="Аккаунт"><Icon n="user" /></button>
        <button className="btn sm" onClick={() => setProOpen(true)}><Icon n="crown" s={14} />{pro ? 'PRO' : 'Try PRO'}</button>
      </div></div>
      <div className="home">
        <div className="hero">
          <h2>Дизайн, который<br />собирается за минуту</h2>
          <p>Холст, фото, текст и нейросетевое удаление фона прямо на устройстве. Без ключей, без лимитов, без загрузки на чужие серверы.</p>
          <div className="herobtns">
            <button className="btn" onClick={pickAny}><Icon n="plus" s={16} />Начать с фото или видео</button>
            <button className="btn sec" onClick={randomize}><Icon n="dice" s={16} />Случайный дизайн</button>
            <button className="btn sec" onClick={() => { openEditor(); }}><Icon n="doc" s={16} />Пустой холст</button>
          </div>
        </div>
        <div className="seg">
          {['Фото', 'Видео', 'Agents', 'Шаблоны', 'Приложения', 'Рисовать'].map(t => (
            <button key={t} className={'segbtn' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t === 'Agents' && <Icon n="sparkles" s={14} />}{t}</button>))}
        </div>
        {tab === 'Фото' && <>
          <div className="h2">Инструменты <small>8 действий</small></div><Grid items={TOOLS} />
          <div className="h2">Шаблоны <small>готовые макеты</small></div><TplGrid />
          <div className="h2">Популярные фоны</div>
          <div className="bgs">{BGS.map((b, i) => <div key={i} className="bgsw" style={bgStyle(b)} onClick={() => { pushHist(); setBg(b); openEditor(); setTool('bg'); }} />)}</div>
        </>}
        {tab === 'Видео' && <><div className="h2">Видео и обложки</div><Grid items={VIDEO} /></>}
        {tab === 'Agents' && <><div className="h2">AI-агенты <small>обработка в один клик</small></div><Grid items={AGENTS} /></>}
        {tab === 'Шаблоны' && <><div className="h2">Все шаблоны</div><TplGrid /></>}
        {tab === 'Приложения' && <><div className="h2">Приложения</div><Grid items={APPS} /></>}
        {tab === 'Рисовать' && <><div className="h2">Кисти</div><Grid items={DRAWC} /></>}
      </div>
      <button className="btn cta" onClick={pickAny}><Icon n="plus" s={17} />Начни с фото или видео</button>
    </>
  );

  const renderModals = () => (<>
    {proOpen && <div className="modal" onClick={() => setProOpen(false)}><div className="card" onClick={e => e.stopPropagation()}>
      <h3>PRO-доступ</h3>
      <div className="unlock"><Icon n="check" s={15} />Шаблоны Gold VIP и Cyber Story</div>
      <div className="unlock"><Icon n="check" s={15} />Эффекты «Драма» и «Закат»</div>
      <div className="unlock"><Icon n="check" s={15} />Экспорт без ограничений</div>
      <div className="plan"><div><b>Месяц</b><div style={{ color: 'var(--mut)', fontSize: 12 }}>Отмена в любой момент</div></div><span>299 ₽</span></div>
      <div className="plan"><div><b>Год</b><div style={{ color: 'var(--mut)', fontSize: 12 }}>Выгоднее на 40%</div></div><span>2 190 ₽</span></div>
      <button className="btn full" onClick={() => { setPro(true); setProOpen(false); toast('PRO активирован: 2 шаблона и 2 эффекта открыты', 'ok'); }}><Icon n="crown" s={15} />{pro ? 'PRO уже активен' : 'Активировать демо-PRO'}</button>
    </div></div>}
    {searchOpen && <div className="modal" onClick={() => setSearchOpen(false)}><div className="card" onClick={e => e.stopPropagation()}>
      <h3>Поиск по всему</h3>
      <input className="txt" autoFocus placeholder="Инструмент, шаблон, фон, формат, тема..." value={query} onChange={e => setQuery(e.target.value)} />
      <div className="chips" style={{ marginTop: 12 }}>
        {SEARCH_INDEX.filter(x => x.title.toLowerCase().includes(query.toLowerCase())).map((x, i) => (
          <button key={x.title + i} className="chip" onClick={() => { setSearchOpen(false); setQuery(''); x.act(); }}>{x.title}<small>{x.kind}</small></button>))}
      </div>
      {SEARCH_INDEX.filter(x => x.title.toLowerCase().includes(query.toLowerCase())).length === 0 && <div className="empty">Ничего не найдено. Попробуй «фон», «шаблон» или «тема».</div>}
    </div></div>}
    {authOpen && <div className="modal" onClick={() => setAuthOpen(false)}><div className="card" onClick={e => e.stopPropagation()}>
      <h3>{authMode === 'in' ? 'Вход в аккаунт' : 'Регистрация'}</h3>
      <p style={{ color: 'var(--mut)', fontSize: 12.5, marginTop: -6 }}>С аккаунтом проекты сохраняются в облако. Без него — черновик на устройстве.</p>
      <form onSubmit={doAuth} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="txt" type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="txt" type="password" required placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn full" disabled={authBusy}>{authBusy ? 'Подождите...' : authMode === 'in' ? 'Войти' : 'Создать аккаунт'}</button>
      </form>
      {authErr && <p style={{ color: 'var(--danger)', fontSize: 12.5 }}>{authErr}</p>}
      <button className="btn sec full" style={{ marginTop: 10 }} onClick={() => setAuthMode(authMode === 'in' ? 'up' : 'in')}>{authMode === 'in' ? 'Нет аккаунта? Создать' : 'Уже есть? Войти'}</button>
      {user && <button className="btn sec full" style={{ marginTop: 8 }} onClick={async () => { await supabase.auth.signOut(); setAuthOpen(false); toast('Вы вышли', 'info'); }}>Выйти из {user.email}</button>}
    </div></div>}
  </>);

  const Slider = ({ label, min, max, step, value, onChange, suffix }) => (
    <div className="row"><span className="lbl">{label}</span>
      <input type="range" min={min} max={max} step={step || 1} value={value} onChange={e => onChange(+e.target.value)} />
      <span className="val">{Math.round(value * 100) / 100}{suffix || ''}</span>
    </div>
  );
  const Toggle = ({ label, on, set }) => (<div className="toggle"><span>{label}</span><button className={'sw' + (on ? ' on' : '')} onClick={() => set(!on)} /></div>);

  const renderRail = () => (
    <div className="rail">
      <div className="railsec">
        <p className="railtitle"><Icon n="doc" s={13} />Документ</p>
        <div className="chips">{FORMATS.map(f => <button key={f.label} className={'chip' + (format.label === f.label ? ' on' : '')} onClick={() => { pushHist(); setFormat(f); }}>{f.label}</button>)}</div>
        <Slider label="Масштаб" min={0.25} max={3} step={0.05} value={zoom} onChange={setZoom} suffix="×" />
        <Toggle label="Сетка" on={gridOn} set={setGridOn} />
        <Slider label="Шаг сетки" min={20} max={200} step={10} value={gridSize} onChange={setGridSize} suffix="px" />
        <Toggle label="Прилипание" on={snap} set={setSnap} />
      </div>
      <div className="railsec">
        <p className="railtitle"><Icon n="palette" s={13} />Фон холста</p>
        <div className="chips" style={{ marginBottom: 8 }}>
          <button className={'chip' + (bg.mode === 'solid' ? ' on' : '')} onClick={() => { pushHist(); setBg({ ...bg, mode: 'solid' }); }}>Сплошной</button>
          <button className={'chip' + (bg.mode === 'gradient' ? ' on' : '')} onClick={() => { pushHist(); setBg({ ...bg, mode: 'gradient' }); }}>Градиент</button>
        </div>
        {bg.mode === 'solid'
          ? <div className="row"><span className="lbl">Цвет</span><input type="color" value={bg.color} onChange={e => { pushHist(); setBg({ ...bg, color: e.target.value }); }} /></div>
          : <div className="row"><span className="lbl">Переход</span><input type="color" value={bg.from} onChange={e => { pushHist(); setBg({ ...bg, from: e.target.value }); }} /><input type="color" value={bg.to} onChange={e => { pushHist(); setBg({ ...bg, to: e.target.value }); }} /></div>}
        <div className="bgs" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>{BGS.map((b, i) => <div key={i} className="bgsw" style={{ ...bgStyle(b), height: 40 }} onClick={() => { pushHist(); setBg(b); }} />)}</div>
      </div>
      {(tool === 'draw' || tool === 'erase') && <div className="railsec">
        <p className="railtitle"><Icon n={tool === 'draw' ? 'brush' : 'eraser'} s={13} />{tool === 'draw' ? 'Кисть' : 'Ластик'}</p>
        {tool === 'erase' && <div className="empty" style={{ padding: '4px 0 8px', textAlign: 'left' }}>Води по холсту — стирает штрихи и удаляет объекты.</div>}
        <div className="row"><span className="lbl">Цвет</span><input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} /></div>
        <Slider label="Размер" min={2} max={60} value={brushSize} onChange={setBrushSize} suffix="px" />
      </div>}
      {tool === 'shapes' && <div className="railsec">
        <p className="railtitle"><Icon n="shapes" s={13} />Добавить фигуру</p>
        <div className="chips">
          <button className="chip" onClick={() => addShape('rect')}>Квадрат</button>
          <button className="chip" onClick={() => addShape('circle')}>Круг</button>
          <button className="chip" onClick={() => addShape('triangle')}>Треугольник</button>
          <button className="chip" onClick={() => addShape('line')}>Линия</button>
        </div>
      </div>}
      <div className="railsec">
        <p className="railtitle"><Icon n="sliders" s={13} />{selectedEl ? 'Свойства объекта' : 'Объект не выбран'}</p>
        {!selectedEl && <div className="empty" style={{ textAlign: 'left', padding: '2px 0 6px' }}>Кликни по объекту на холсте — здесь появятся его настройки.</div>}
        {selectedEl && <>
          <div className="row">
            <span className="lbl">Позиция</span>
            <input className="num" type="number" value={Math.round(selectedEl.x)} onChange={e => updateEl(selectedEl.id, { x: +e.target.value })} />
            <input className="num" type="number" value={Math.round(selectedEl.y)} onChange={e => updateEl(selectedEl.id, { y: +e.target.value })} />
          </div>
          {selectedEl.width != null && <div className="row">
            <span className="lbl">Размер</span>
            <input className="num" type="number" value={Math.round(selectedEl.width)} onChange={e => updateEl(selectedEl.id, { width: Math.max(5, +e.target.value) })} />
            {selectedEl.type !== 'text' && <input className="num" type="number" value={Math.round(selectedEl.height)} onChange={e => updateEl(selectedEl.id, { height: Math.max(5, +e.target.value) })} />}
          </div>}
          <Slider label="Поворот" min={0} max={360} value={selectedEl.rotation || 0} onChange={v => updateEl(selectedEl.id, { rotation: v })} suffix="°" />
          <Slider label="Прозрачн." min={0} max={1} step={0.05} value={selectedEl.opacity == null ? 1 : selectedEl.opacity} onChange={v => updateEl(selectedEl.id, { opacity: v })} />
          {selectedEl.type === 'rect' && <Slider label="Скругление" min={0} max={200} value={selectedEl.radius || 0} onChange={v => updateEl(selectedEl.id, { radius: v })} suffix="px" />}
          {(selectedEl.type === 'rect' || selectedEl.type === 'circle' || selectedEl.type === 'triangle') && <>
            <div className="row"><span className="lbl">Заливка</span><input type="color" value={selectedEl.fill} onChange={e => updateEl(selectedEl.id, { fill: e.target.value })} /></div>
            <div className="row"><span className="lbl">Обводка</span><input type="color" value={selectedEl.stroke || '#17121f'} onChange={e => updateEl(selectedEl.id, { stroke: e.target.value })} /></div>
            <Slider label="Толщина" min={0} max={40} value={selectedEl.strokeWidth || 0} onChange={v => updateEl(selectedEl.id, { strokeWidth: v })} suffix="px" />
          </>}
          {selectedEl.type === 'text' && <>
            <textarea className="txt" rows="2" value={selectedEl.text} onChange={e => updateEl(selectedEl.id, { text: e.target.value })} />
            <Slider label="Кегль" min={10} max={280} value={selectedEl.fontSize} onChange={v => updateEl(selectedEl.id, { fontSize: v })} suffix="px" />
            <div className="row"><span className="lbl">Цвет</span><input type="color" value={selectedEl.fill} onChange={e => updateEl(selectedEl.id, { fill: e.target.value })} /></div>
            <div className="chips">{['Unbounded', 'Manrope', 'Georgia', 'Courier New'].map(f => <button key={f} className={'chip' + (selectedEl.fontFamily === f ? ' on' : '')} onClick={() => updateEl(selectedEl.id, { fontFamily: f })}>{f}</button>)}</div>
            <div className="chips" style={{ marginTop: 6 }}>
              <button className={'chip' + (selectedEl.fontStyle === 'bold' ? ' on' : '')} onClick={() => updateEl(selectedEl.id, { fontStyle: selectedEl.fontStyle === 'bold' ? 'normal' : 'bold' })}>Жирный</button>
              {['left', 'center', 'right'].map(a => <button key={a} className={'chip' + (selectedEl.align === a ? ' on' : '')} onClick={() => updateEl(selectedEl.id, { align: a })}>{a === 'left' ? 'Лево' : a === 'center' ? 'Центр' : 'Право'}</button>)}
            </div>
          </>}
          {selectedEl.type === 'image' && <>
            <button className="btn full sm" onClick={removeBgSelected} style={{ marginBottom: 8 }}><Icon n="scissors" s={14} />Убрать фон</button>
            <div className="chips">{EFFECTS.map(f => <button key={f.name} className="chip" onClick={() => { if (f.pro && !pro) { setProOpen(true); return; } updateEl(selectedEl.id, { fx: f.fx }); }}>{f.name}{f.pro && !pro && <Icon n="lock" s={11} />}</button>)}</div>
            <Slider label="Яркость" min={-1} max={1} step={0.05} value={(selectedEl.fx || {}).b || 0} onChange={v => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, b: v } })} />
            <Slider label="Контраст" min={-100} max={100} value={(selectedEl.fx || {}).c || 0} onChange={v => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, c: v } })} />
            <Slider label="Насыщ." min={-2} max={2} step={0.1} value={(selectedEl.fx || {}).s || 0} onChange={v => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, s: v } })} />
            <Slider label="Размытие" min={0} max={20} value={(selectedEl.fx || {}).blur || 0} onChange={v => updateEl(selectedEl.id, { fx: { ...selectedEl.fx, blur: v } })} />
          </>}
        </>}
      </div>
      <div className="railsec">
        <p className="railtitle"><Icon n="wand" s={13} />Действия</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <button className="btn sec sm full" onClick={randomize}><Icon n="dice" s={14} />Случайный дизайн</button>
          <button className="btn sec sm full" onClick={resetDoc}><Icon n="reset" s={14} />Очистить холст</button>
          <button className="btn sm full" onClick={exportPNG}><Icon n="download" s={14} />Экспорт PNG ×2</button>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="ed">
      <div className="edtop">
        <button className="iconbtn" onClick={() => setScreen('home')} title="На главную"><Icon n="back" /></button>
        <button className="iconbtn" onClick={undo} disabled={!undoStack.length} title="Отменить"><Icon n="undo" /></button>
        <button className="iconbtn" onClick={redo} disabled={!redoStack.length} title="Повторить"><Icon n="redo" /></button>
        <input className="docname" value={docName} onChange={e => setDocName(e.target.value)} />
        <div className="spacer" />
        <span className="status"><span className="dot" style={{ background: saveStatus.includes('Ошибка') ? 'var(--danger)' : 'var(--ok)' }} />{saveStatus || 'Готово'}</span>
        <ThemePicker />
        <button className={'iconbtn' + (pro ? ' on' : '')} onClick={() => setProOpen(true)} title="PRO"><Icon n="crown" /></button>
        <button className="iconbtn" onClick={() => setAuthOpen(true)} title="Аккаунт"><Icon n="user" /></button>
        <button className="btn sm" onClick={exportPNG}><Icon n="download" s={15} />Скачать</button>
      </div>
      <div className="edbody">
        <div className="canvasWrap"><div className="canvasInner" ref={containerRef}>
          <Stage ref={stageRef} width={format.w * scale} height={format.h * scale} scaleX={scale} scaleY={scale}
            onMouseDown={onDown} onTouchStart={onDown} onMouseMove={onMove} onTouchMove={onMove} onMouseUp={onUp} onTouchEnd={onUp}
            style={{ background: '#fff', boxShadow: 'var(--shadow)', borderRadius: 2 }}>
            <Layer>
              {bg.mode === 'gradient'
                ? <Rect x={0} y={0} width={format.w} height={format.h} listening={false} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: format.w, y: format.h }} fillLinearGradientColorStops={[0, bg.from, 1, bg.to]} />
                : <Rect x={0} y={0} width={format.w} height={format.h} listening={false} fill={bg.color} />}
              {elements.map(el => <NodeView key={el.id} el={el} selected={el.id === selectedId} tool={tool} accent={accent} register={register} onSelect={() => { setSelectedId(el.id); setTool('select'); }} onChange={(p) => updateEl(el.id, { x: snapVal(p.x), y: snapVal(p.y) })} />)}
              {gridOn && <>
                {Array.from({ length: Math.floor(format.w / gridSize) + 1 }, (_, i) => <Line key={'v' + i} points={[i * gridSize, 0, i * gridSize, format.h]} stroke={accent} opacity={0.16} strokeWidth={1} listening={false} />)}
                {Array.from({ length: Math.floor(format.h / gridSize) + 1 }, (_, i) => <Line key={'h' + i} points={[0, i * gridSize, format.w, i * gridSize]} stroke={accent} opacity={0.16} strokeWidth={1} listening={false} />)}
              </>}
              <Transformer ref={trRef} onTransformEnd={onTransformEnd} rotateEnabled borderStroke={accent} anchorStroke={accent} anchorFill={T.vars['--surface']} anchorSize={9} anchorCornerRadius={3} boundBoxFunc={(o, n) => (n.width < 10 || n.height < 10 ? o : n)} />
            </Layer>
          </Stage>
        </div></div>
        {selectedEl && <div className="float">
          <button className="iconbtn" onClick={dupSel} title="Дублировать"><Icon n="copy" s={16} /></button>
          <button className="iconbtn" onClick={() => layer('up')} title="Выше"><Icon n="up" s={16} /></button>
          <button className="iconbtn" onClick={() => layer('down')} title="Ниже"><Icon n="down" s={16} /></button>
          <button className="iconbtn" onClick={deleteSel} title="Удалить" style={{ color: 'var(--danger)' }}><Icon n="trash" s={16} /></button>
        </div>}
        {renderRail()}
      </div>
      <div className="edbar">
        <button className={'edtool' + (tool === 'select' ? ' on' : '')} onClick={() => setTool('select')}><Icon n="move" />Выбор</button>
        <button className="edtool" onClick={addText}><Icon n="type" />Текст</button>
        <button className={'edtool' + (tool === 'shapes' ? ' on' : '')} onClick={() => setTool('shapes')}><Icon n="shapes" />Фигуры</button>
        <button className={'edtool' + (tool === 'bg' ? ' on' : '')} onClick={() => setTool('bg')}><Icon n="palette" />Фон</button>
        <button className="edtool" onClick={() => pickImage((s, w, h) => addImage(s, w, h))}><Icon n="image" />Фото</button>
        <button className="edtool" onClick={removeBgSelected}><Icon n="scissors" />Убрать фон</button>
        <button className={'edtool' + (tool === 'draw' ? ' on' : '')} onClick={() => setTool('draw')}><Icon n="brush" />Рисовать</button>
        <button className={'edtool' + (tool === 'erase' ? ' on' : '')} onClick={() => setTool('erase')}><Icon n="eraser" />Стереть</button>
        <button className={'edtool' + (gridOn ? ' on' : '')} onClick={() => setGridOn(g => !g)}><Icon n="grid" />Сетка</button>
        <button className="edtool" onClick={() => setZoom(1)}><Icon n="zoom" />Сброс зума</button>
      </div>
    </div>
  );

  return (<>
    <style>{CSS}</style>
    <div className="app" style={T.vars}>
      <div className="aurora">
        <div className="blob" style={{ width: 440, height: 440, left: '-10%', top: '-12%', background: T.vars['--accent'] }} />
        <div className="blob" style={{ width: 400, height: 400, right: '-8%', top: '18%', background: T.vars['--accent2'], animationDelay: '-7s' }} />
        <div className="blob" style={{ width: 320, height: 320, left: '28%', bottom: '-14%', background: T.vars['--accent3'], animationDelay: '-13s' }} />
      </div>
      <div className="grain" />
      {screen === 'home' ? renderHome() : renderEditor()}
      {renderModals()}
      <div className="toasts">{toasts.map(t => <div key={t.id} className={'toast ' + t.type}><Icon n={t.type === 'ok' ? 'check' : t.type === 'err' ? 'x' : 'sparkles'} s={15} />{t.msg}</div>)}</div>
      {busy && <div className="busy"><div className="busybox"><div className="spinner" />Обработка... {bgProgress}%<div className="busynote">Первый запуск скачивает нейромодель (~40 МБ), дальше работает быстро и офлайн</div></div></div>}
    </div>
  </>);
}