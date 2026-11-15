import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage } from 'react-konva';

// --- ИКОНКИ (Тонкие, как на скрине) ---
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Export: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Text: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>,
  Shape: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Color: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 2v20"/></svg>,
  Image: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Draw: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  Grid: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Cut: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3v12"/><path d="M18 9v12"/><path d="M6 12h12"/></svg>,
};

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact', 'Comic Sans MS', 'Palatino', 'Garamond', 'Helvetica'];
const SHAPES = ['square', 'circle', 'triangle', 'star', 'heart', 'diamond'];

// --- РЕДАКТОР (Открывается при нажатии на карточку) ---
function CanvasEditor({ onBack, initialImage }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const [activePanel, setActivePanel] = useState(null);
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Если мы пришли из карточки, загружаем картинку
  React.useEffect(() => {
    if (initialImage) {
      const img = new window.Image();
      img.src = initialImage;
      img.onload = () => setElements([{ id: Date.now().toString(), type: 'image', x: 100, y: 100, image: img, src: initialImage, width: 300, height: (img.height * 300) / img.width }]);
    }
  }, [initialImage]);

  const addText = (font) => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 50, y: 50, text: 'Текст', fontSize: 40, fill: '#111', fontFamily: font || 'Arial' }]);
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

  const downloadImage = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'design.png'; link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, 100);
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
      default: return <Rect {...props} />;
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f9f9f9', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div style={{ height: '60px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', borderBottom: '1px solid #eee', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontWeight: 'bold' }}>← Назад</button>
        <div style={{ fontWeight: 'bold' }}>Редактор</div>
        <button onClick={downloadImage} style={{ background: '#d900a8', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Скачать</button>
      </div>

      {/* ХОЛСТ */}
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

      {/* ВСПЛЫВАЮЩИЕ ПАНЕЛИ РЕДАКТОРА */}
      {activePanel === 'text' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '200px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>Шрифты</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {FONTS.map((f, i) => <div key={i} onClick={() => addText(f)} style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontFamily: f, cursor: 'pointer' }}>{f}</div>)}
          </div>
        </div>
      )}

      {activePanel === 'shapes' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '150px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', overflowY: 'auto', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{margin: 0}}>Фигуры</h4>
            <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '10px' }}>
            {SHAPES.map((s, i) => <div key={i} onClick={() => addShape(s)} style={{ height: '50px', backgroundColor: '#f5f5f5', borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', cursor: 'pointer' }}>{s === 'star' ? '★' : s === 'heart' ? '♥' : s === 'circle' ? '●' : s === 'triangle' ? '▲' : '■'}</div>)}
          </div>
        </div>
      )}

      {activePanel === 'color' && (
        <div style={{ position: 'absolute', bottom: '80px', left: '10px', right: '10px', height: '80px', backgroundColor: '#fff', borderRadius: '10px', padding: '15px', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 100, boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
          {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
             <div key={c} onClick={() => { if (selectedId) setElements(elements.map(el => el.id === selectedId ? { ...el, fill: c } : el)); else setBgColor(c); }} style={{ width: '40px', height: '40px', backgroundColor: c, border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ РЕДАКТОРА */}
      <div style={{ height: '80px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', overflowX: 'auto', borderTop: '1px solid #eee', padding: '0 10px', flexShrink: 0, gap: '20px' }}>
        <div onClick={() => setActivePanel('text')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'text' ? '#d900a8' : '#333' }}>
          <Icons.Text /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Текст</span>
        </div>
        <div onClick={() => setActivePanel('shapes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'shapes' ? '#d900a8' : '#333' }}>
          <Icons.Shape /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фигуры</span>
        </div>
        <div onClick={() => setActivePanel('color')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: activePanel === 'color' ? '#d900a8' : '#333' }}>
          <Icons.Color /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Цвет</span>
        </div>
        <div onClick={() => fileInputRef.current.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: '#333' }}>
          <Icons.Image /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Фото</span>
        </div>
        <div onClick={() => { setTool('draw'); setActivePanel(null); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', cursor: 'pointer', color: tool === 'draw' ? '#d900a8' : '#333' }}>
          <Icons.Draw /> <span style={{ fontSize: '11px', marginTop: '5px' }}>Рисовать</span>
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

// --- ДАШБОРД (Главный экран с картинки) ---
export default function App() {
  const [view, setView] = useState('dashboard');
  const [selectedImage, setSelectedImage] = useState(null);

  const openEditor = (img = null) => {
    setSelectedImage(img);
    setView('editor');
  };

  if (view === 'editor') {
    return <CanvasEditor onBack={() => setView('dashboard')} initialImage={selectedImage} />;
  }

  // Стили для розовых иконок
  const iconBox = { width: '70px', height: '70px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', marginBottom: '10px', color: '#d900a8', border: '1px solid #f0f0f0' };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', paddingBottom: '100px', color: '#111' }}>
      
      {/* ШАПКА */}
      <header style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#111' }}>Редактор</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => alert('PRO')} style={{ border: '1px solid #ddd', background: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Try PRO</button>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>🔍</span>
        </div>
      </header>

      {/* ВКЛАДКИ */}
      <div style={{ padding: '0 30px', display: 'flex', gap: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '30px', overflowX: 'auto' }}>
        {['Фото', 'Видео', '✨ Agents', 'Шаблоны', 'Приложения', 'Рисовать'].map((tab, i) => (
          <span key={tab} onClick={() => alert(tab)} style={{ color: i === 0 ? '#d900a8' : '#555', borderBottom: i === 0 ? '2px solid #d900a8' : 'none', paddingBottom: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tab}
          </span>
        ))}
      </div>

      {/* ИНСТРУМЕНТЫ */}
      <div style={{ padding: '0 30px', display: 'flex', gap: '20px', marginBottom: '40px', overflowX: 'auto' }}>
         {['Убрать фон', 'Добавить т...', 'Удаление', 'ИИ Улучшить', 'Коллаж', 'Эффекты', 'Фристайл', 'Корректор'].map((tool, i) => (
           <div key={i} onClick={() => openEditor()} style={{ minWidth: '80px', textAlign: 'center', cursor: 'pointer' }}>
             <div style={iconBox}>
               {['✂️', 'T', '🩹', '✨', '🖼️', '🎨', '🖌️', '🔧'][i]}
             </div>
             <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>{tool}</div>
           </div>
         ))}
      </div>

      {/* ИИ-ИНСТРУМЕНТЫ */}
      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#111' }}>ИИ-инструменты</h2>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          
          <div onClick={() => openEditor('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop')} style={{ minWidth: '280px', height: '180px', borderRadius: '20px', backgroundImage: `url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>ИИ-фон</div>
          </div>

          <div onClick={() => openEditor('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop')} style={{ minWidth: '280px', height: '180px', borderRadius: '20px', backgroundImage: `url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>Мои аватары</div>
          </div>

          <div onClick={() => openEditor()} style={{ minWidth: '280px', height: '180px', borderRadius: '20px', backgroundColor: '#1a1a2e', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
             <span style={{ fontSize: '60px' }}>🐈</span>
             <div style={{ position: 'absolute', bottom: '15px', left: '15px', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>Фото из текста</div>
          </div>

        </div>
      </div>

      {/* ПОПУЛЯРНЫЕ ФОНЫ */}
      <div style={{ padding: '0 30px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#111' }}>Популярные фоны</h2>
          <span onClick={() => alert('Все фоны')} style={{ color: '#d900a8', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>See all</span>
        </div>
        
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

          <div onClick={() => openEditor()} style={{ cursor: 'pointer' }}>
             <div style={{ height: '140px', borderRadius: '20px', backgroundColor: '#2b1a12', backgroundImage: 'url(https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=400&auto=format&fit=crop)', backgroundSize: 'cover', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '15px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>10</div>
             </div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Pumpkin day</div>
          </div>

        </div>
      </div>

      {/* ПЛАВАЮЩАЯ КНОПКА */}
      <div style={{ position: 'fixed', bottom: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <button onClick={() => openEditor()} style={{ padding: '15px 30px', backgroundColor: '#c400a0', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(196, 0, 160, 0.3)' }}>
          <span>+</span> Начни с фото или видео
        </button>
      </div>

    </div>
  );
}