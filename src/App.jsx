import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Path, Transformer } from 'react-konva';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iqvujenjffevijvtdvd.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_Cbcd0LznpbNCIA6JwOskig_4SkcqVhL';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  { path: 'M12 22l8-10h-5V2H9v10H4l8 10z' },
  { path: 'M2 12l10 8v-5h10V9H12V4L2 12z' },
  { path: 'M22 12l-10-8v5H2v6h10v5l10-8z' },
  { path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' },
  { path: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' },
  { path: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
  { path: 'M19 13H5v-2h14v2z' },
  { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
  { path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
  { path: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z' },
  { path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z' },
  { path: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
  { path: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
  { path: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z' },
  { path: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z' },
  { path: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z' },
  { path: 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z' },
  { path: 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z' },
  { path: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
];

const FULL_SHAPES = Array(100).fill(null).map((_, i) => SHAPES_LIBRARY[i % SHAPES_LIBRARY.length]);

const BACKGROUNDS = ['#ffffff', '#f0f0f0', '#111111', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

// ШАБЛОНЫ
const TEMPLATES = {
  'instagram-post': {
    name: 'Пост Instagram',
    size: { width: 600, height: 600 },
    bgColor: '#f0f0f0',
    elements: [
      { id: 't1', type: 'shape', shapeType: 'svg', path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', x: 200, y: 100, width: 200, height: 200, fill: '#d900a8' },
      { id: 't2', type: 'text', x: 150, y: 350, text: 'МОЙ БРЕНД', fontSize: 40, fill: '#111', fontFamily: 'Impact', strokeColor: '#fff', strokeWidth: 2 },
      { id: 't3', type: 'text', x: 180, y: 420, text: 'Новая коллекция', fontSize: 20, fill: '#555', fontFamily: 'Arial', strokeColor: '#000', strokeWidth: 0 }
    ]
  },
  'story': {
    name: 'Сторис',
    size: { width: 600, height: 800 },
    bgColor: '#111111',
    elements: [
      { id: 's1', type: 'text', x: 50, y: 300, text: 'СМОТРИ', fontSize: 60, fill: '#fff', fontFamily: 'Impact', strokeColor: '#d900a8', strokeWidth: 3 },
      { id: 's2', type: 'text', x: 50, y: 400, text: 'НОВЫЙ ДИЗАЙН', fontSize: 40, fill: '#d900a8', fontFamily: 'Arial', strokeColor: '#fff', strokeWidth: 1 },
      { id: 's3', type: 'shape', shapeType: 'svg', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', x: 250, y: 500, width: 100, height: 100, fill: '#ff0000' }
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
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const trRef = useRef(null);

  // Загрузка шаблона или сохраненного проекта
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

  // Сохранение в облако
  useEffect(() => {
    if (isLoading) return;
    const saveTimeout = setTimeout(async () => {
      try {
        await supabase.from('projects').upsert({ 
          user_id: DEVICE_ID, 
          data: { elements, lines, bgColor, canvasSize },
          updated_at: new Date()
        });
      } catch (error) { console.log("Ошибка сохранения"); }
    }, 2000);
    return () => clearTimeout(saveTimeout);
  }, [elements, lines, bgColor, canvasSize, isLoading]);

  // Привязка трансформера
  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const addText = (font) => {
    setElements([...elements, { 
      id: Date.now().toString(), 
      type: 'text', 
      x: 50, y: 50, 
      text: 'Ваш текст', 
      fontSize: 40, 
      fill: '#111', 
      fontFamily: font || 'Arial',
      strokeColor: '#000000',
      strokeWidth: 0
    }]);
    setActivePanel(null);
  };

  const addShape = (shapePath) => {
    setElements([...elements, { 
      id: Date.now().toString(), 
      type: 'shape', 
      shapeType: 'svg',
      path: shapePath, 
      x: 100, y: 100, 
      width: 100, height: 100, 
      fill: '#3b82f6' 
    }]);
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

  const clearCanvas = () => {
    if(window.confirm('Очистить холст? Все элементы удалятся.')) {
      setElements([]);
      setLines([]);
      setBgColor('#ffffff');
    }
  };

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
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
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
    if (direction === 'up' && index < newElements.length) {
      newElements.splice(index + 1, 0, element);
    } else if (direction === 'down' && index > 0) {
      newElements.splice(index - 1, 0, element);
    } else {
      newElements.splice(index, 0, element);
    }
    setElements(newElements);
  };

  const renderShape = (path, props) => {
    return (
      <Path
        {...props}
        data={path}
        fill={props.fill}
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        scaleX={props.width / 24}
        scaleY={props.height / 24}
      />
    );
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f9f9f9', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      <div style={{ height: '60px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}><Icons.Back /> Назад</button>
          <button onClick={clearCanvas} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px' }}>Очистить всё</button>
        </div>
        <div style={{ fontWeight: 'bold' }}>Редактор</div>
        <button onClick={downloadImage} style={{ background: '#d900a8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><Icons.Download /> Скачать</button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '20px', backgroundColor: '#e0e0e0' }}>
        <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: bgColor }}>
          <Stage 
            width={canvasSize.width} height={canvasSize.height} 
            onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
            ref={stageRef}
            style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
          >
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
                  id: el.id,
                  draggable: true,
                  onClick: () => setSelectedId(el.id),
                  onTap: () => setSelectedId(el.id),
                  onDragEnd: (e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item)),
                };

                if (el.type === 'image') {
                  const img = new window.Image(); img.src = el.src;
                  return <KonvaImage key={el.id} image={img} {...el} {...commonProps} />;
                }
                if (el.type === 'text') {
                  return <Text key={el.id} {...el} {...commonProps} 
                    stroke={isSelected ? '#d900a8' : el.strokeColor} 
                    strokeWidth={isSelected ? 1 : el.strokeWidth} 
                  />;
                }
                if (el.type === 'shape' && el.shapeType === 'svg') {
                  return React.cloneElement(renderShape(el.path, el), {
                    key: el.id, ...commonProps, stroke: isSelected ? '#d900a8' : undefined, strokeWidth: isSelected ? 2 : 0
                  });
                }
                return null;
              })}
              {selectedId && <Transformer 
                ref={trRef} 
                boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox}
                onTransformEnd={(e) => {
                   const node = e.target;
                   const scaleX = node.scaleX(); const scaleY = node.scaleY();
                   node.scaleX(1); node.scaleY(1);
                   setElements(elements.map(item => item.id === selectedId ? { ...item, x: node.x(), y: node.y(), width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY) } : item));
                }}
              />}
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
              <input type