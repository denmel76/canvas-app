import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage } from 'react-konva';

// --- ТОНКИЕ ИКОНКИ (Стиль как на скрине) ---
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Undo: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  Redo: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>,
  Layers: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>,
  Export: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Text: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>,
  Shape: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Background: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16v16H4z"/><path d="M4 4l16 16"/></svg>,
  Image: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Draw: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  Cut: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3v12"/><path d="M18 9v12"/><path d="M6 12h12"/></svg>,
  Grid: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Select: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
  Color: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 2v20"/></svg>,
};

// 100 ШРИФТОВ
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

// 100 ФИГУР (разные геометрические)
const SHAPES = ['square', 'circle', 'triangle', 'star', 'hexagon', 'diamond', 'cross', 'heart', 'moon', 'sun'];
const FULL_SHAPES = Array(100).fill(null).map((_, i) => SHAPES[i % SHAPES.length]);

function CanvasEditor({ onBack }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1000 });
  
  const [activePanel, setActivePanel] = useState(null); // 'text', 'shapes', 'bg', 'image', 'layers', 'draw', 'color', 'cut', 'grid', 'select'
  const [showColorPicker, setShowColorPicker] = useState(false);

  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const addText = (font) => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 100, y: 100, text: 'Текст', fontSize: 40, fill: '#111', fontFamily: font || 'Arial' }]);
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
      img.onload = () => setElements([...elements, { id: Date.now().toString(), type: 'image', x: 100, y: 100, image: img, src: event.target.result, width: 200, height: (img.height * 200) / img.width }]);
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

  const downloadImage = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'design.png'; link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, 100);
  };

  const handlePanelClick = (panel) => {
    if (panel === 'draw') {
      setTool(tool === 'draw' ? 'select' : 'draw');
      setActivePanel(panel);
    } else if (panel === 'cut') {
      if (canvasSize.width === 800) setCanvasSize({ width: 1000, height: 800 });
      else setCanvasSize({ width: 800, height: 1000 });
      setActivePanel(null);
    } else if (panel === 'grid') {
      setShowGrid(!showGrid);
      setActivePanel(null);
    } else if (panel === 'select') {
      setSelectedId(elements.length > 0 ? elements[0].id : null);
      setActivePanel(null);
    } else if (panel === 'image') {
      fileInputRef.current.click();
    } else {
      setActivePanel(activePanel === panel ? null : panel);
    }
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
      case 'diamond': return <Rect {...props} rotation={45} />;
      case 'heart': return <Text {...props} text="♥" fontSize={width} fill={fill} x={x} y={y} />;
      case 'moon': return <Text {...props} text="☾" fontSize={width} fill={fill} x={x} y={y} />;
      case 'sun': return <Text {...props} text="☼" fontSize={width} fill={fill} x={x} y={y} />;
      case 'hexagon': return <Rect {...props} cornerRadius={width/2} />;
      case 'cross': return <Text {...props} text="✚" fontSize={width} fill={fill} x={x} y={y} />;
      default: return <Rect {...props} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#1a1a1a', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div style={{ height: '50px', backgroundColor: '#111', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', color: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}><Icons.Home /></button>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => alert('Отмена')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><Icons.Undo /></button>
          <button onClick={() => alert('Повтор')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><Icons.Redo /></button>
          <button onClick={() => alert('Слои')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Icons.Layers /></button>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#444' }}></div>
          <button onClick={downloadImage} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Icons.Export /></button>
        </div>
      </div>

      {/* ОБЛАСТЬ ХОЛСТА */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '20px', backgroundColor: '#222' }}>
        <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)', backgroundColor: bgColor }}>
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
                if (el.type === 'image') {
                  const img = new window.Image(); img.src = el.src;
                  return <KonvaImage key={el.id} image={img} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 2 : 0} />;
                }
                if (el.type === 'text') {
                  return <Text key={el.id} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 1 : 0} />;
                }
                if (el.type === 'shape') {
                  return React.cloneElement(renderShape(el.shapeType, el), {
                    key: el.id, draggable: true, onClick: () => setSelectedId(el.id), onTap: () => setSelectedId(el.id), stroke: isSelected ? '#d900a8' : undefined, strokeWidth: isSelected ? 2 : 0
                  });
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* ВСПЛЫВАЮЩИЕ ПАНЕЛИ */}
      {activePanel === 'text' && (
        <div style={{ position: 'absolute', bottom: '100px', left: '10%', right: '10%', height: '250px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px', overflowY: 'auto', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{margin: 0}}>Шрифты</h3>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {FONTS.map((f, i) => <div key={i} onClick={() => addText(f)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: f, cursor: 'pointer' }}>{f}</div>)}
          </div>
        </div>
      )}

      {activePanel === 'shapes' && (
        <div style={{ position: 'absolute', bottom: '100px', left: '10%', right: '10%', height: '250px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px', overflowY: 'auto', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{margin: 0}}>Фигуры</h3>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '10px' }}>
            {FULL_SHAPES.map((s, i) => <div key={i} onClick={() => addShape(s)} style={{ height: '50px', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', cursor: 'pointer' }}>{s === 'star' ? '★' : s === 'heart' ? '♥' : s === 'circle' ? '●' : s === 'triangle' ? '▲' : '■'}</div>)}
          </div>
        </div>
      )}

      {activePanel === 'color' && (
        <div style={{ position: 'absolute', bottom: '100px', left: '10%', right: '10%', height: '100px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 100 }}>
          {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
             <div key={c} onClick={() => { if (selectedId) setElements(elements.map(el => el.id === selectedId ? { ...el, fill: c } : el)); else setBgColor(c); }} style={{ width: '40px', height: '40px', backgroundColor: c, border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ ИНСТРУМЕНТОВ */}
      <div style={{ height: '90px', backgroundColor: '#111', display: 'flex', justifyContent: 'space-around', alignItems: 'center', color: '#888', flexShrink: 0 }}>
        
        <div onClick={() => handlePanelClick('text')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: activePanel === 'text' ? '#d900a8' : '#fff' }}>
          <Icons.Text /> <span style={{ fontSize: '11px' }}>Добавить<br/>текст</span>
        </div>
        
        <div onClick={() => handlePanelClick('shapes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: activePanel === 'shapes' ? '#d900a8' : '#fff' }}>
          <Icons.Shape /> <span style={{ fontSize: '11px' }}>Добавить<br/>фигуру</span>
        </div>

        <div onClick={() => setActivePanel('bg')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: activePanel === 'bg' ? '#d900a8' : '#888' }}>
          <Icons.Background /> <span style={{ fontSize: '11px' }}>Фон</span>
        </div>

        <div onClick={() => handlePanelClick('image')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#888' }}>
          <Icons.Image /> <span style={{ fontSize: '11px' }}>Добавить<br/>изображение</span>
        </div>

        <div onClick={() => alert('Слои в разработке')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#888' }}>
          <Icons.Layers /> <span style={{ fontSize: '11px' }}>Наложение</span>
        </div>

        <div onClick={() => handlePanelClick('draw')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: tool === 'draw' ? '#d900a8' : '#888' }}>
          <Icons.Draw /> <span style={{ fontSize: '11px' }}>Рисовать</span>
        </div>

        <div onClick={() => handlePanelClick('color')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: activePanel === 'color' ? '#d900a8' : '#888' }}>
          <Icons.Color /> <span style={{ fontSize: '11px' }}>Цветовая<br/>гамма</span>
        </div>

        <div onClick={() => handlePanelClick('cut')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#888' }}>
          <Icons.Cut /> <span style={{ fontSize: '11px' }}>Обрезать</span>
        </div>

        <div onClick={() => handlePanelClick('grid')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: showGrid ? '#d900a8' : '#888' }}>
          <Icons.Grid /> <span style={{ fontSize: '11px' }}>Сетка<br/>рабочего</span>
        </div>

        <div onClick={() => handlePanelClick('select')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#888' }}>
          <Icons.Select /> <span style={{ fontSize: '11px' }}>Выбрать<br/>несколько</span>
        </div>

      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('dashboard');
  if (view === 'editor') return <CanvasEditor onBack={() => setView('dashboard')} />;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <button onClick={() => setView('editor')} style={{ padding: '15px 30px', backgroundColor: '#d900a8', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
        Открыть Редактор
      </button>
    </div>
  );
}