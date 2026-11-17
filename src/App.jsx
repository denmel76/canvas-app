import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Path, Transformer } from 'react-konva';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iqvujenjffevijvtdvd.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_Cbcd0LznpbNCIA6JwOskig_4SkcqVhL';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const N8N_WEBHOOK_URL = 'https://denismelgarez.app.n8n.cloud/webhook/ce33b5ec-0f58-485b-8f93-5f7391d46c5d';

const getDeviceId = () => {
  let id = localStorage.getItem('canvas_device_id');
  if (!id) {
    id = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('canvas_device_id', id);
  }
  return id;
};
const DEVICE_ID = getDeviceId();

const Icons = {
  Text: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>,
  Shape: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Color: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 2v20"/></svg>,
  Image: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Draw: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  Eraser: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>,
  Grid: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Cut: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v12"/><path d="M18 9v12"/><path d="M6 12h12"/></svg>,
  Back: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Download: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Magic: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>,
};

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact', 'Comic Sans MS', 'Palatino', 'Garamond', 'Helvetica'];

const SHAPES_LIBRARY = [
  { path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' },
  { path: 'M3 3h18v18H3z' },
  { path: 'M12 2L2 22h20L12 2z' },
  { path: 'M12 2l10 10-10 10L2 12z' },
  { path: 'M12 2l8.66 5v10L12 22l-8.66-5V7z' },
  { path: 'M12 2l9.5 6.9-3.6 11.1H6.1L2.5 8.9z' },
  { path: 'M8 2h8l6 6v8l-6 6H8l-6-6V8z' },
  { path: 'M12 2l-8 10h5v10h6V12h5L12 2z' },
];

const FULL_SHAPES = Array(100).fill(null).map((_, i) => SHAPES_LIBRARY[i % SHAPES_LIBRARY.length]);
const BACKGROUNDS = ['#ffffff', '#f0f0f0', '#111111', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

const TEMPLATES = {
  'instagram-post': {
    name: 'Пост Instagram',
    size: { width: 600, height: 600 },
    bgColor: '#f0f0f0',
    elements: [
      { id: 't1', type: 'shape', shapeType: 'svg', path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', x: 200, y: 100, width: 200, height: 200, fill: '#d900a8' },
      { id: 't2', type: 'text', x: 150, y: 350, text: 'МОЙ БРЕНД', fontSize: 40, fill: '#111', fontFamily: 'Impact', strokeColor: '#fff', strokeWidth: 2 }
    ]
  }
};
function CanvasEditor({ onBack, templateKey }) {
  const [elements, setElements] = useState([]);
  const [lines, setLines] = useState([]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const isDrawing = useRef(false);
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const [activePanel, setActivePanel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    const loadProject = async () => {
      if (templateKey && TEMPLATES[templateKey]) {
        const template = TEMPLATES[templateKey];
        setElements(template.elements);
        setBgColor(template.bgColor);
        setCanvasSize(template.size);
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('projects').select('data').eq('user_id', DEVICE_ID).single();
        if (data && data.data) {
          setElements(data.data.elements || []);
          setLines(data.data.lines || []);
          setBgColor(data.data.bgColor || '#ffffff');
          if (data.data.canvasSize) setCanvasSize(data.data.canvasSize);
        }
      } catch (error) { console.log("Нет сохраненных проектов"); }
      setIsLoading(false);
    };
    loadProject();
  }, [templateKey]);

  useEffect(() => {
    if (isLoading) return;
    const saveTimeout = setTimeout(async () => {
      try {
        await supabase.from('projects').upsert({ user_id: DEVICE_ID, data: { elements, lines, bgColor, canvasSize }, updated_at: new Date() });
      } catch (error) { console.log("Ошибка сохранения"); }
    }, 2000);
    return () => clearTimeout(saveTimeout);
  }, [elements, lines, bgColor, canvasSize, isLoading]);

  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) { trRef.current.nodes([node]); trRef.current.getLayer().batchDraw(); }
    }
  }, [selectedId]);

  const addText = (font) => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 50, y: 50, text: 'Ваш текст', fontSize: 40, fill: '#111', fontFamily: font || 'Arial', strokeColor: '#000000', strokeWidth: 0 }]);
    setActivePanel(null);
  };

  const addShape = (shapePath) => {
    setElements([...elements, { id: Date.now().toString(), type: 'shape', shapeType: 'svg', path: shapePath, x: 100, y: 100, width: 100, height: 100, fill: '#3b82f6' }]);
    setActivePanel(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => setElements([...elements, { id: Date.now().toString(), type: 'image', x: 50, y: 50, image: img, src: event.target.result, width: 200, height: (img.height * 200) / img.width }]);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
    setActivePanel(null);
  };

  const removeBackground = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsRemovingBg(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        const data = await response.json();
        if (data.image) {
          const img = new window.Image();
          img.src = data.image;
          img.onload = () => {
            setElements([...elements, { id: Date.now().toString(), type: 'image', x: 50, y: 50, image: img, src: data.image, width: 200, height: (img.height * 200) / img.width }]);
            setIsRemovingBg(false);
          };
        } else {
          alert("n8n не вернул картинку");
          setIsRemovingBg(false);
        }
      } catch (error) {
        alert("Ошибка соединения с n8n");
        setIsRemovingBg(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };
    const handleMouseDown = (e) => {
    if (tool === 'draw') {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      setLines([...lines, { points: [pos.x, pos.y] }]);
    } else if (tool === 'select') {
      if (e.target === e.target.getStage()) setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || tool !== 'draw') return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    if(lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    }
  };

  const handleMouseUp = () => { isDrawing.current = false; };
  const clearDrawings = () => { setLines([]); setTool('select'); setActivePanel(null); };
  const clearCanvas = () => { if(window.confirm('Очистить холст?')) { setElements([]); setLines([]); setBgColor('#ffffff'); } };

  const downloadImage = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'design.png'; link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, 100);
  };

  const deleteSelected = () => {
    if (selectedId) { setElements(elements.filter(el => el.id !== selectedId)); setSelectedId(null); }
  };

  const updateSelected = (key, value) => {
    setElements(elements.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
  };

  const moveLayer = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex(el => el.id === selectedId);
    if (index === -1) return;
    const newElements = [...elements];
    const element = newElements.splice(index, 1)[0];
    if (direction === 'up' && index < newElements.length) newElements.splice(index + 1, 0, element);
    else if (direction === 'down' && index > 0) newElements.splice(index - 1, 0, element);
    else newElements.splice(index, 0, element);
    setElements(newElements);
  };

  const renderShape = (path, props) => {
    return <Path {...props} data={path} fill={props.fill} stroke={props.stroke} strokeWidth={props.strokeWidth} scaleX={props.width / 24} scaleY={props.height / 24} />;
  };

  const selectedElement = elements.find(el => el.id === selectedId);
    return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f9f9f9', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      <div style={{ height: '60px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}><Icons.Back /> Назад</button>
          <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px' }}>Очистить всё</button>
        </div>
        <div style={{ fontWeight: 'bold' }}>{isRemovingBg ? 'Удаляем фон...' : 'Редактор'}</div>
        <button onClick={downloadImage} style={{ background: '#d900a8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><Icons.Download /> Скачать</button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '20px', backgroundColor: '#e0e0e0' }}>
        <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: bgColor }}>
          <Stage width={canvasSize.width} height={canvasSize.height} onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp} ref={stageRef} style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}>
            <Layer>
              {showGrid && Array.from({ length: Math.floor(canvasSize.width / 50) }).map((_, i) => (
                <React.Fragment key={i}>
                  <Line points={[i * 50, 0, i * 50, canvasSize.height]} stroke="#eee" strokeWidth={1} />
                  <Line points={[0, i * 50, canvasSize.width, i * 50]} stroke="#eee" strokeWidth={1} />
                </React.Fragment>
              ))}
              {lines.map((line, i) => <Line key={i} points={line.points} stroke="#111" strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" />)}
              
              {elements.map((el) => {
                const isSelected = el.id === selectedId;
                const commonProps = {
                  id: el.id, draggable: true, onClick: () => setSelectedId(el.id), onTap: () => setSelectedId(el.id),
                  onDragEnd: (e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item)),
                };

                if (el.type === 'image') {
                  const img = new window.Image(); img.src = el.src;
                  return <KonvaImage key={el.id} image={img} {...el} {...commonProps} />;
                }
                if (el.type === 'text') {
                  return <Text key={el.id} {...el} {...commonProps} stroke={isSelected ? '#d900a8' : el.strokeColor} strokeWidth={isSelected ? 1 : el.strokeWidth} />;
                }
                if (el.type === 'shape' && el.shapeType === 'svg') {
                  return React.cloneElement(renderShape(el.path, el), { key: el.id, ...commonProps, stroke: isSelected ? '#d900a8' : undefined, strokeWidth: isSelected ? 2 : 0 });
                }
                return null;
              })}
              {selectedId && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox} onTransformEnd={(e) => {
                   const node = e.target;
                   const scaleX = node.scaleX(); const scaleY = node.scaleY();
                   node.scaleX(1); node.scaleY(1);
                   setElements(elements.map(item => item.id === selectedId ? { ...item, x: node.x(), y: node.y(), width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY) } : item));
                }} />}
            </Layer>
          </Stage>
        </div>
      </div>

      {selectedElement && (
        <div style={{ position: 'absolute', bottom: '90px', left: '10px', right: '10px', backgroundColor: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Настройки</span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => moveLayer('up')} style={{ border: '1px solid #ddd', background: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Вверх</button>
              <button onClick={() => moveLayer('down')} style={{ border: '1px solid #ddd', background: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Вниз</button>
              <button onClick={deleteSelected} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Удалить</button>
            </div>
          </div>
          {selectedElement.type === 'text' && (
            <>
              <input type="text" value={selectedElement.text} onChange={(e) => updateSelected('text', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={selectedElement.fontFamily} onChange={(e) => updateSelected('fontFamily', e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '5px' }} />
              </div>
              <label style={{ fontSize: '12px', color: '#666' }}>Размер шрифта</label>
              <input type="range" min="10" max="100" value={selectedElement.fontSize} onChange={(e) => updateSelected('fontSize', parseInt(e.target.value))} />
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                 <div style={{ flex: 1 }}>
                   <label style={{ fontSize: '12px', color: '#666' }}>Цвет обводки</label>
                   <input type="color" value={selectedElement.strokeColor || '#000000'} onChange={(e) => updateSelected('strokeColor', e.target.value)} style={{ width: '100%', height: '40px', padding: 0, border: 'none', borderRadius: '5px' }} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{ fontSize: '12px', color: '#666' }}>Толщина обводки</label>
                   <input type="range" min="0" max="10" value={selectedElement.strokeWidth || 0} onChange={(e) => updateSelected('strokeWidth', parseInt(e.target.value))} />
                 </div>
              </div>
            </>
          )}
          {(selectedElement.type === 'shape') && (
            <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ height: '40px', width: '100%', cursor: 'pointer', border: 'none', borderRadius: '5px' }} />
          )}
        </div>
      )}

      {activePanel === 'color' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '150px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>Цвета</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
             {BACKGROUNDS.map((bg, i) => (
               <div key={i} onClick={() => { setBgColor(bg); setActivePanel(null); }} style={{ width: '50px', height: '50px', background: bg, borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }} />
             ))}
          </div>
        </div>
      )}

      {activePanel === 'text' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '200px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>Шрифты</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {FONTS.map((f, i) => <div key={i} onClick={() => addText(f)} style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontFamily: f, cursor: 'pointer', fontSize: '14px' }}>{f}</div>)}
          </div>
        </div>
      )}

      {activePanel === 'shapes' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '200px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>100 Фигур</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '10px' }}>
            {FULL_SHAPES.map((s, i) => (
              <div key={i} onClick={() => addShape(s.path)} style={{ height: '50px', backgroundColor: '#f5f5f5', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#333"><path d={s.path} /></svg>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: '80px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', overflowX: 'auto', borderTop: '1px solid #eee', padding: '0 10px', flexShrink: 0, gap: '20px' }}>
        <div onClick={() => { setActivePanel('text'); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'text' ? '#d900a8' : '#333' }}>
          <Icons.Text /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Текст</span>
        </div>
        <div onClick={() => { setActivePanel('shapes'); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'shapes' ? '#d900a8' : '#333' }}>
          <Icons.Shape /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фигуры</span>
        </div>
        <div onClick={() => { setActivePanel('color'); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'color' ? '#d900a8' : '#333' }}>
          <Icons.Color /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фон</span>
        </div>
        <div onClick={() => fileInputRef.current.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: '#333' }}>
          <Icons.Image /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фото</span>
        </div>
        <div onClick={() => bgInputRef.current.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: '#333' }}>
          <Icons.Magic /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Убрать фон</span>
        </div>
        <div onClick={() => { setTool('draw'); setActivePanel(null); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: tool === 'draw' ? '#d900a8' : '#333' }}>
          <Icons.Draw /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Рисовать</span>
        </div>
        <div onClick={clearDrawings} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: '#333' }}>
          <Icons.Eraser /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Стереть</span>
        </div>
        <div onClick={() => { setShowGrid(!showGrid); setActivePanel(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: showGrid ? '#d900a8' : '#333' }}>
          <Icons.Grid /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Сетка</span>
        </div>
        <div onClick={() => { setCanvasSize(canvasSize.width === 600 ? { width: 800, height: 600 } : { width: 600, height: 800 }); setActivePanel(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: '#333' }}>
          <Icons.Cut /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Формат</span>
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={bgInputRef} onChange={removeBackground} style={{ display: 'none' }} />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [template, setTemplate] = useState(null);

  const openEditor = (templateKey = null) => { setTemplate(templateKey); setView('editor'); };
  if (view === 'editor') return <CanvasEditor onBack={() => setView('dashboard')} templateKey={template} />;

  const iconBox = { width: '70px', height: '70px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', marginBottom: '10px', color: '#d900a8', border: '1px solid #f0f0f0' };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px', color: '#111' }}>
      <header style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#111' }}>Редактор</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button style={{ border: '1px solid #ddd', background: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Try PRO</button>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>🔍</span>
        </div>
      </header>
      <div style={{ padding: '0 30px', display: 'flex', gap: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '30px', overflowX: 'auto' }}>
        {['Фото', 'Видео', '✨ Agents', 'Шаблоны', 'Приложения', 'Рисовать'].map((tab, i) => (
          <span key={tab} style={{ color: i === 0 ? '#d900a8' : '#555', borderBottom: i === 0 ? '2px solid #d900a8' : 'none', paddingBottom: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>{tab}</span>
        ))}
      </div>
      <div style={{ padding: '0 30px', display: 'flex', gap: '20px', marginBottom: '40px', overflowX: 'auto' }}>
         {['Убрать фон', 'Добавить т...', 'Удаление', 'ИИ Улучшить', 'Коллаж', 'Эффекты', 'Фристайл', 'Корректор'].map((tool, i) => (
           <div key={i} onClick={() => openEditor()} style={{ minWidth: '80px', textAlign: 'center', cursor: 'pointer' }}>
             <div style={iconBox}>{['✂️', 'T', '🩹', '✨', '🖼️', '🎨', '🖌️', '🔧'][i]}</div>
             <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>{tool}</div>
           </div>
         ))}
      </div>
      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#111' }}>Шаблоны</h2>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          <div onClick={() => openEditor('instagram-post')} style={{ minWidth: '280px', height: '180px', borderRadius: '20px', background: '#f0f0f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', cursor: 'pointer', border: '2px solid #ddd' }}>
            <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#d900a8', fontFamily: 'Impact' }}>MY BRAND</span>
            <span style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>Пост для Instagram</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#111' }}>Популярные фоны</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          <div onClick={() => openEditor()} style={{ cursor: 'pointer' }}>
            <div style={{ height: '140px', borderRadius: '20px', border: '1px solid #ddd', backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)', backgroundSize: '20px 20px', backgroundColor: 'white' }}></div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Пустой</div>
          </div>
          <div onClick={() => openEditor()} style={{ cursor: 'pointer' }}>
            <div style={{ height: '140px', borderRadius: '20px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '15px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>17</div>
            </div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Цвет</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <button onClick={() => openEditor()} style={{ padding: '15px 30px', backgroundColor: '#c400a0', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(196, 0, 160, 0.3)' }}>
          <span>+</span> Начни с фото или видео
        </button>
      </div>
    </div>
  );
}