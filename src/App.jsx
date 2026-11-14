import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';

// --- КОМПОНЕНТ ДЛЯ КАРТИНОК ---
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

// --- РЕДАКТОР (ХОЛСТ) ---
function Editor({ onBack }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const addSquare = () => setElements([...elements, { id: Date.now().toString(), type: 'rect', x: 100, y: 100, width: 150, height: 150, fill: '#FFD700' }]);
  const addText = () => setElements([...elements, { id: Date.now().toString(), type: 'text', x: 100, y: 100, text: 'Новый текст', fontSize: 30, fill: '#000000', fontFamily: 'Arial', fontStyle: 'normal' }]);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => setElements([...elements, { id: Date.now().toString(), type: 'image', x: 100, y: 100, image: img, src: event.target.result, width: img.width > 300 ? 300 : img.width, height: img.width > 300 ? (img.height * 300) / img.width : img.height }]);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const deleteSelected = () => { if (selectedId) { setElements(elements.filter(el => el.id !== selectedId)); setSelectedId(null); } };
  
  const downloadImage = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'design.png'; link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, 100);
  };

  const selectedElement = elements.find(el => el.id === selectedId);
  const updateSelected = (key, value) => setElements(elements.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
      <div style={{ height: '60px', backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #ddd', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>← Назад</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={downloadImage} style={{ padding: '10px 20px', backgroundColor: '#d900a8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬇️ Скачать</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '70px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '20px', borderRight: '1px solid #ddd', zIndex: 10 }}>
          <button onClick={addSquare} style={{ fontSize: '24px', background: 'transparent', border: 'none' }}>⬛</button>
          <button onClick={addText} style={{ fontSize: '24px', background: 'transparent', border: 'none' }}>T</button>
          <button onClick={() => fileInputRef.current.click()} style={{ fontSize: '24px', background: 'transparent', border: 'none' }}>🖼️</button>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '20px' }}>
          <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <Stage width={600} height={800} onMouseDown={(e) => { if(e.target === e.target.getStage()) setSelectedId(null) }} onTouchStart={(e) => { if(e.target === e.target.getStage()) setSelectedId(null) }} style={{ backgroundColor: bgColor }} ref={stageRef}>
              <Layer>
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  if (el.type === 'image') {
                    const imageObj = new window.Image(); imageObj.src = el.src;
                    return <URLImage key={el.id} image={imageObj} src={el.src} x={el.x} y={el.y} width={el.width} height={el.height} id={el.id} isSelected={isSelected} onSelect={() => setSelectedId(el.id)} onChange={(newAttrs) => setElements(elements.map(item => item.id === el.id ? { ...item, ...newAttrs } : item))} />;
                  }
                  return (
                    <React.Fragment key={el.id}>
                      {el.type === 'rect' && <Rect {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 4 : 0} onDragEnd={(e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item))}/>}
                      {el.type === 'text' && <Text {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 1 : 0} onDragEnd={(e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item))}/>}
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* ПАНЕЛЬ СВОЙСТВ ДЛЯ ПК */}
        {!isTouchDevice && (
          <div style={{ width: '250px', backgroundColor: 'white', padding: '20px', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Свойства</h3>
            {!selectedId && (<><label style={{ fontSize: '12px', color: '#666' }}>Фон:</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ height: '40px', cursor: 'pointer' }} /></>)}
            {selectedElement && selectedElement.type === 'text' && (
              <>
                <input type="text" value={selectedElement.text} onChange={(e) => updateSelected('text', e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }} />
                <select value={selectedElement.fontFamily} onChange={(e) => updateSelected('fontFamily', e.target.value)} style={{ padding: '8px' }}>
                  <option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Impact">Impact</option>
                </select>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => updateSelected('fontStyle', selectedElement.fontStyle === 'bold' ? 'normal' : 'bold')} style={{ flex: 1, fontWeight: 'bold' }}>B</button>
                  <button onClick={() => updateSelected('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')} style={{ flex: 1, fontStyle: 'italic' }}>I</button>
                </div>
                <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ height: '40px' }} />
              </>
            )}
          </div>
        )}
      </div>

      {/* ПАНЕЛЬ СВОЙСТВ ДЛЯ IPAD (СНИЗУ) */}
      {isTouchDevice && selectedId && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: '15px', borderTop: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 100, boxShadow: '0 -4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Настройки</span>
            <button onClick={deleteSelected} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px' }}>Удалить</button>
          </div>
          {selectedElement && selectedElement.type === 'text' && (
            <>
              <input type="text" value={selectedElement.text} onChange={(e) => updateSelected('text', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                <select value={selectedElement.fontFamily} onChange={(e) => updateSelected('fontFamily', e.target.value)} style={{ padding: '8px', flex: 1 }}>
                  <option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Impact">Impact</option>
                </select>
                <button onClick={() => updateSelected('fontStyle', selectedElement.fontStyle === 'bold' ? 'normal' : 'bold')} style={{ padding: '8px 15px', fontWeight: 'bold', backgroundColor: selectedElement.fontStyle === 'bold' ? '#d900a8' : '#eee', color: selectedElement.fontStyle === 'bold' ? 'white' : 'black', border: 'none', borderRadius: '5px' }}>B</button>
                <button onClick={() => updateSelected('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')} style={{ padding: '8px 15px', fontStyle: 'italic', backgroundColor: selectedElement.fontStyle === 'italic' ? '#d900a8' : '#eee', color: selectedElement.fontStyle === 'italic' ? 'white' : 'black', border: 'none', borderRadius: '5px' }}>I</button>
              </div>
            </>
          )}
          {(selectedElement && selectedElement.type === 'rect') && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span>Цвет:</span>
               <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ height: '40px', width: '100%' }} />
             </div>
          )}
        </div>
      )}
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
    </div>
  );
}

// --- ДАШБОРД (ГЛАВНЫЙ ЭКРАН) ---
export default function App() {
  const [view, setView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('Фото');
  
  const showAlert = (toolName) => alert(`Инструмент "${toolName}" в разработке. Скоро появится!`);

  if (view === 'editor') {
    return <Editor onBack={() => setView('dashboard')} />;
  }

  // Стили для розовых иконок (как на твоем референсе)
  const iconStyle = { 
    width: '60px', 
    height: '60px', 
    backgroundColor: 'white', 
    borderRadius: '15px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontSize: '28px', 
    marginBottom: '10px',
    color: '#d900a8', // Розовый цвет для иконок
    fontWeight: 'bold'
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '100px', color: '#111' }}>
      
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Исправлен цвет и размер заголовка */}
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#111' }}>Редактор</h1>
        <button onClick={() => showAlert('PRO подписка')} style={{ border: '1px solid #ddd', background: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Try PRO</button>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', gap: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px', overflowX: 'auto' }}>
        {['Фото', 'Видео', '✨ Agents', 'Шаблоны', 'Приложения', 'Рисовать'].map(tab => (
          <span key={tab} onClick={() => setActiveTab(tab)} style={{ color: activeTab === tab ? '#d900a8' : '#555', borderBottom: activeTab === tab ? '2px solid #d900a8' : 'none', paddingBottom: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tab}
          </span>
        ))}
      </div>

      {/* ИНСТРУМЕНТЫ (Стилизованные под референс) */}
      <div style={{ padding: '0 20px', display: 'flex', gap: '15px', marginBottom: '30px', overflowX: 'auto' }}>
         {['Убрать фон', 'Добавить т...', 'Удаление', 'ИИ Улучшить', 'Коллаж', 'Эффекты'].map((tool, i) => (
           <div key={i} onClick={() => showAlert(tool)} style={{ minWidth: '70px', textAlign: 'center', cursor: 'pointer' }}>
             <div style={iconStyle}>
               {/* Используем символы, чтобы было похоже на иконки */}
               {['✂', 'T', '↺', '✨', '🖼', '🎨'][i]}
             </div>
             <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>{tool}</div>
           </div>
         ))}
      </div>

      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#111' }}>ИИ-инструменты</h2>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
          <div onClick={() => setView('editor')} style={{ minWidth: '250px', height: '180px', borderRadius: '15px', backgroundImage: `url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' }}>ИИ-фон</div>
          </div>
          <div onClick={() => setView('editor')} style={{ minWidth: '250px', height: '180px', borderRadius: '15px', backgroundImage: `url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' }}>Мои аватары</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#111' }}>Популярные фоны</h2>
          <span onClick={() => showAlert('Все фоны')} style={{ color: '#d900a8', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          
          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
            <div style={{ height: '120px', borderRadius: '15px', border: '1px solid #ddd', backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)', backgroundSize: '20px 20px', backgroundColor: 'white' }}></div>
            <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>Пустой</div>
          </div>

          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
            <div style={{ height: '120px', borderRadius: '15px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '10px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>17</div>
            </div>
            <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>Цвет</div>
          </div>

        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <button onClick={() => setView('editor')} style={{ padding: '15px 30px', backgroundColor: '#c400a0', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(196, 0, 160, 0.3)' }}>
          <span>+</span> Начни с фото
        </button>
      </div>

    </div>
  );
}