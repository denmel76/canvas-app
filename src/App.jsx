import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Transformer } from 'react-konva';

// --- ИКОНКИ (SVG) ---
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
  Layers: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>,
};

// --- БАЗА ДАННЫХ ---
const FONTS = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Trebuchet MS', 'Tahoma', 'Impact', 'Comic Sans MS', 'Palatino Linotype',
  'Lucida Sans Unicode', 'Garamond', 'Bookman Old Style', 'Arial Black', 'Helvetica', 'Geneva', 'Monaco', 'Optima', 'Futura', 'Baskerville',
  'Didot', 'Copperplate', 'Papyrus', 'Brush Script MT', 'Luminari', 'Trattatello', 'Herculanum', 'Snell Roundhand', 'Zapfino', 'Chalkduster',
  'Bodoni 72', 'Bradley Hand', 'Chalkboard SE', 'Marker Felt', 'Noteworthy', 'Party LET', 'Savoye LET', 'SignPainter', 'Rockwell', 'Gill Sans',
  'Century Gothic', 'Franklin Gothic Medium', 'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins',
  'Merriweather', 'Playfair Display', 'Nunito', 'Rubik', 'Lora', 'Quicksand', 'Indie Flower', 'Shadows Into Light', 'Dancing Script', 'Pacifico',
  'Caveat', 'Comfortaa', 'Bebas Neue', 'Anton', 'Fjalla One', 'Abel', 'Arvo', 'Bitter', 'Cabin', 'Cinzel', 'Exo', 'Fira Sans', 'Josefin Sans',
  'Karla', 'Libre Baskerville', 'Lobster', 'Muli', 'Noto Sans', 'Oxygen', 'PT Sans', 'Source Sans Pro', 'Ubuntu', 'Varela Round', 'Work Sans',
  'Zilla Slab', 'Alfa Slab One', 'Abril Fatface', 'Righteous', 'Satisfy', 'Courgette', 'Kaushan Script', 'Great Vibes', 'Sacramento', 'Allura',
  'Alex Brush', 'Tangerine', 'Arial Narrow', 'Lucida Console', 'Courier', 'Georgia', 'Times'
];

const SHAPES = ['square', 'circle', 'triangle', 'star', 'heart', 'diamond', 'cross', 'moon'];
const FULL_SHAPES = Array(100).fill(null).map((_, i) => SHAPES[i % SHAPES.length]);

const BACKGROUNDS = [
  { type: 'color', value: '#ffffff' }, { type: 'color', value: '#f0f0f0' }, { type: 'color', value: '#111111' },
  { type: 'gradient', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { type: 'gradient', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { type: 'gradient', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
];

// --- КОМПОНЕНТ КАРТИНКИ С ТРАНСФОРМАЦИЕЙ ---
const URLImage = ({ image, isSelected, onSelect, onChange, ...props }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={image}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...props}
        draggable
        onDragEnd={(e) => onChange({ ...props, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX(); const scaleY = node.scaleY();
          node.scaleX(1); node.scaleY(1);
          onChange({ ...props, x: node.x(), y: node.y(), width: Math.max(5, node.width() * scaleX), height: Math.max(5, node.height() * scaleY) });
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox} />}
    </React.Fragment>
  );
};

function CanvasEditor({ onBack }) {
  const [elements, setElements] = useState(() => {
    const saved = localStorage.getItem('canvas_elements');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lines, setLines] = useState(() => {
    const saved = localStorage.getItem('canvas_lines');
    return saved ? JSON.parse(saved) : [];
  });

  const [bgColor, setBgColor] = useState(() => localStorage.getItem('canvas_bg') || '#ffffff');

  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const isDrawing = useRef(false);
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const [activePanel, setActivePanel] = useState(null);
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('canvas_elements', JSON.stringify(elements));
    localStorage.setItem('canvas_lines', JSON.stringify(lines));
    localStorage.setItem('canvas_bg', bgColor);
  }, [elements, lines, bgColor]);

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
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 50, y: 50, text: 'Ваш текст', fontSize: 40, fill: '#111', fontFamily: font || 'Arial' }]);
    setActivePanel(null);
  };

  const addShape = (shapeType) => {
    setElements([...elements, { id: Date.now().toString(), type: 'shape', shapeType, x: 100, y: 100, width: 100, height: 100, fill: '#3b82f6' }]);
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

  const renderShape = (shape, props) => {
    const { x, y, width, height, fill } = props;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = Math.min(width, height) / 2;

    switch (shape) {
      case 'circle': return <Rect {...props} cornerRadius={r} />;
      case 'triangle': return <Line {...props} points={[cx, y, x + width, y + height, x, y + height]} closed fill={fill} />;
      case 'star': return <Text {...props} text="★" fontSize={width} fill={fill} x={x} y={y} />;
      case 'heart': return <Text {...props} text="♥" fontSize={width} fill={fill} x={x} y={y} />;
      case 'moon': return <Text {...props} text="☾" fontSize={width} fill={fill} x={x} y={y} />;
      case 'cross': return <Text {...props} text="✚" fontSize={width} fill={fill} x={x} y={y} />;
      default: return <Rect {...props} />;
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f9f9f9', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      <div style={{ height: '60px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}><Icons.Back /> Назад</button>
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
                  return <URLImage key={el.id} image={img} src={el.src} {...el} {...commonProps} isSelected={isSelected} onSelect={() => setSelectedId(el.id)} onChange={(newAttrs) => setElements(elements.map(item => item.id === el.id ? { ...item, ...newAttrs } : item))} />;
                }
                if (el.type === 'text') {
                  return <Text key={el.id} {...el} {...commonProps} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 1 : 0} />;
                }
                if (el.type === 'shape') {
                  return React.cloneElement(renderShape(el.shapeType, el), {
                    key: el.id, ...commonProps, stroke: isSelected ? '#d900a8' : undefined, strokeWidth: isSelected ? 2 : 0
                  });
                }
                return null;
              })}
              {selectedId && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox} />}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* ПАНЕЛЬ РЕДАКТИРОВАНИЯ */}
      {selectedElement && (
        <div style={{ position: 'absolute', bottom: '90px', left: '10px', right: '10px', backgroundColor: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Настройки элемента</span>
            <button onClick={deleteSelected} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }}>Удалить</button>
          </div>

          {selectedElement.type === 'text' && (
            <>
              <input type="text" value={selectedElement.text} onChange={(e) => updateSelected('text', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', boxSizing: 'border-box' }} />
              <select value={selectedElement.fontFamily} onChange={(e) => updateSelected('fontFamily', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <input type="range" min="10" max="100" value={selectedElement.fontSize} onChange={(e) => updateSelected('fontSize', parseInt(e.target.value))} />
            </>
          )}

          {(selectedElement.type === 'text' || selectedElement.type === 'shape') && (
            <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ height: '40px', width: '100%', cursor: 'pointer', border: 'none', borderRadius: '5px' }} />
          )}
        </div>
      )}

      {/* ПАНЕЛЬ ЦВЕТА / ФОНА */}
      {activePanel === 'color' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '150px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>Фоны</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
             {BACKGROUNDS.map((bg, i) => (
               <div key={i} onClick={() => { setBgColor(bg.value); setActivePanel(null); }} style={{ width: '50px', height: '50px', background: bg.value, borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }} />
             ))}
          </div>

          {selectedId && (
             <>
               <h4 style={{margin: '15px 0 10px 0'}}>Цвет элемента</h4>
               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                 {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
                    <div key={c} onClick={() => updateSelected('fill', c)} style={{ width: '40px', height: '40px', backgroundColor: c, border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }} />
                 ))}
               </div>
             </>
          )}
        </div>
      )}

      {/* ПАНЕЛЬ ШРИФТОВ */}
      {activePanel === 'text' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '200px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>100 Шрифтов</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {FONTS.map((f, i) => <div key={i} onClick={() => addText(f)} style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontFamily: f, cursor: 'pointer', fontSize: '14px' }}>{f}</div>)}
          </div>
        </div>
      )}

      {/* ПАНЕЛЬ ФИГУР */}
      {activePanel === 'shapes' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '200px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>100 Фигур</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '10px' }}>
            {FULL_SHAPES.map((s, i) => <div key={i} onClick={() => addShape(s)} style={{ height: '50px', backgroundColor: '#f5f5f5', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', cursor: 'pointer' }}>{s === 'star' ? '★' : s === 'heart' ? '♥' : s === 'circle' ? '●' : s === 'triangle' ? '▲' : s === 'moon' ? '☾' : s === 'cross' ? '✚' : '■'}</div>)}
          </div>
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <div style={{ height: '80px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', overflowX: 'auto', borderTop: '1px solid #eee', padding: '0 10px', flexShrink: 0, gap: '20px' }}>
        
        <div onClick={() => { setActivePanel('text'); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'text' ? '#d900a8' : '#333' }}>
          <Icons.Text /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Текст</span>
        </div>
        
        <div onClick={() => { setActivePanel('shapes'); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'shapes' ? '#d900a8' : '#333' }}>
          <Icons.Shape /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фигуры</span>
        </div>

        <div onClick={() => { setActivePanel('color'); setSelectedId(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'color' ? '#d900a8' : '#333' }}>
          <Icons.Color /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Цвет</span>
        </div>

        <div onClick={() => fileInputRef.current.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: '#333' }}>
          <Icons.Image /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фото</span>
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
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('dashboard');

  if (view === 'editor') {
    return <CanvasEditor onBack={() => setView('dashboard')} />;
  }

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
           <div key={i} onClick={() => setView('editor')} style={{ minWidth: '80px', textAlign: 'center', cursor: 'pointer' }}>
             <div style={iconBox}>{['✂️', 'T', '🩹', '✨', '🖼️', '🎨', '🖌️', '🔧'][i]}</div>
             <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>{tool}</div>
           </div>
         ))}
      </div>

      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#111' }}>ИИ-инструменты</h2>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          <div onClick={() => setView('editor')} style={{ minWidth: '280px', height: '180px', borderRadius: '20px', backgroundImage: `url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>ИИ-фон</div>
          </div>
          <div onClick={() => setView('editor')} style={{ minWidth: '280px', height: '180px', borderRadius: '20px', backgroundImage: `url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>Мои аватары</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#111' }}>Популярные фоны</h2>
          <span style={{ color: '#d900a8', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
            <div style={{ height: '140px', borderRadius: '20px', border: '1px solid #ddd', backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)', backgroundSize: '20px 20px', backgroundColor: 'white' }}></div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Пустой</div>
          </div>
          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
            <div style={{ height: '140px', borderRadius: '20px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '15px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>17</div>
            </div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Цвет</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <button onClick={() => setView('editor')} style={{ padding: '15px 30px', backgroundColor: '#c400a0', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(196, 0, 160, 0.3)' }}>
          <span>+</span> Начни с фото или видео
        </button>
      </div>

    </div>
  );
}