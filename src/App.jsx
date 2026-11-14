import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';

// --- БАЗОВЫЕ КОМПОНЕНТЫ РЕДАКТОРА ---
const URLImage = ({ image, isSelected, onSelect, onChange, ...props }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  React.useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  return (
    <React.Fragment>
      <KonvaImage image={image} onClick={onSelect} onTap={onSelect} ref={shapeRef} {...props} draggable
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

function Editor({ onBack }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const addSquare = () => setElements([...elements, { id: Date.now().toString(), type: 'rect', x: 100, y: 100, width: 150, height: 150, fill: '#FFD700' }]);
  const addText = () => setElements([...elements, { id: Date.now().toString(), type: 'text', x: 100, y: 100, text: 'Новый текст', fontSize: 30, fill: '#000000' }]);
  
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
      link.download = 'my-design.png';
      link.href = uri;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f9f9f9', color: '#111' }}>
      <div style={{ height: '60px', backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #eee' }}>
        <button onClick={onBack} style={{ background: 'transparent', color: '#111', border: 'none', fontSize: '16px', cursor: 'pointer', marginRight: '20px', fontWeight: 'bold' }}>← Назад</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={downloadImage} style={{ padding: '10px 20px', backgroundColor: '#d900a8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬇️ Скачать</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '70px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '15px', borderRight: '1px solid #eee' }}>
          <button onClick={addSquare} style={{ fontSize: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>⬛</button>
          <button onClick={addText} style={{ fontSize: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>T</button>
          <button onClick={() => fileInputRef.current.click()} style={{ fontSize: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>🖼️</button>
          <div style={{ height: '1px', width: '60%', backgroundColor: '#eee', margin: '10px 0' }}></div>
          <button onClick={deleteSelected} disabled={!selectedId} style={{ fontSize: '20px', background: 'transparent', border: 'none', color: selectedId ? '#d900a8' : '#ccc' }}>🗑️</button>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', backgroundColor: '#f0f0f0', overflow: 'auto' }}>
          <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Stage width={600} height={800} onMouseDown={(e) => { if(e.target === e.target.getStage()) setSelectedId(null) }} style={{ backgroundColor: bgColor }} ref={stageRef}>
              <Layer>
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  if (el.type === 'image') {
                    const imageObj = new window.Image(); imageObj.src = el.src;
                    return <URLImage key={el.id} image={imageObj} src={el.src} x={el.x} y={el.y} width={el.width} height={el.height} id={el.id} isSelected={isSelected} onSelect={() => setSelectedId(el.id)} onChange={(newAttrs) => setElements(elements.map(item => item.id === el.id ? { ...item, ...newAttrs } : item))} />;
                  }
                  return (
                    <React.Fragment key={el.id}>
                      {el.type === 'rect' && <Rect {...el} draggable onClick={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 4 : 0} onDragEnd={(e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item))}/>}
                      {el.type === 'text' && <Text {...el} draggable onClick={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 1 : 0} onDragEnd={(e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item))}/>}
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>

        <div style={{ width: '250px', backgroundColor: 'white', padding: '20px', borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Свойства</h3>
          {!selectedId && <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ height: '50px', cursor: 'pointer' }} />}
          {selectedId && elements.find(el => el.id === selectedId)?.type === 'text' && (
             <input type="text" value={elements.find(el => el.id === selectedId).text} onChange={(e) => setElements(elements.map(el => el.id === selectedId ? { ...el, text: e.target.value } : el))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
          )}
        </div>
      </div>
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

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '100px', color: '#111' }}>
      
      {/* ШАПКА */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Редактор</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => showAlert('PRO подписка')} style={{ border: '1px solid #ddd', background: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Try PRO</button>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>🔍</span>
        </div>
      </header>

      {/* ВКЛАДКИ */}
      <div style={{ padding: '0 40px', display: 'flex', gap: '30px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', marginBottom: '30px', overflowX: 'auto' }}>
        {['Фото', 'Видео', '✨ Agents', 'Шаблоны', 'Приложения', 'Рисовать'].map(tab => (
          <span 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              color: activeTab === tab ? '#d900a8' : '#555', 
              borderBottom: activeTab === tab ? '2px solid #d900a8' : 'none', 
              paddingBottom: '10px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* ИНСТРУМЕНТЫ (Круглые/Квадратные кнопки) */}
      <div style={{ padding: '0 40px', display: 'flex', gap: '20px', marginBottom: '40px', overflowX: 'auto' }}>
         {['Убрать фон', 'Добавить т...', 'Удаление', 'ИИ Улучшить', 'Коллаж', 'Эффекты', 'Фристайл', 'Корректор'].map((tool, i) => (
           <div key={i} onClick={() => showAlert(tool)} style={{ minWidth: '80px', textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', marginBottom: '10px' }}>
               {['✂️', 'T', '🩹', '✨', '🖼️', '🎨', '🖌️', '🔧'][i]}
             </div>
             <div style={{ fontSize: '12px', color: '#555' }}>{tool}</div>
           </div>
         ))}
      </div>

      {/* ИИ-ИНСТРУМЕНТЫ */}
      <div style={{ padding: '0 40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>ИИ-инструменты</h2>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
          
          <div onClick={() => setView('editor')} style={{ minWidth: '300px', height: '200px', borderRadius: '15px', backgroundImage: `url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' }}>ИИ-фон</div>
          </div>
          
          <div onClick={() => setView('editor')} style={{ minWidth: '300px', height: '200px', borderRadius: '15px', backgroundImage: `url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop)`, backgroundSize: 'cover', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' }}>Мои аватары</div>
          </div>

          <div onClick={() => setView('editor')} style={{ minWidth: '300px', height: '200px', borderRadius: '15px', backgroundColor: '#1a1a2e', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
             <span style={{ fontSize: '60px' }}>🐈</span>
             <div style={{ position: 'absolute', bottom: '15px', left: '15px', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>Фото из текста</div>
          </div>

        </div>
      </div>

      {/* ПОПУЛЯРНЫЕ ФОНЫ */}
      <div style={{ padding: '0 40px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Популярные фоны</h2>
          <span onClick={() => showAlert('Все фоны')} style={{ color: '#d900a8', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          
          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
            <div style={{ height: '150px', borderRadius: '15px', border: '1px solid #ddd', backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)', backgroundSize: '20px 20px', backgroundColor: 'white' }}></div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Пустой</div>
          </div>

          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
            <div style={{ height: '150px', borderRadius: '15px', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '10px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>17</div>
            </div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Цвет</div>
          </div>

          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
             <div style={{ height: '150px', borderRadius: '15px', backgroundColor: '#2b1a12', backgroundImage: 'url(https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=400&auto=format&fit=crop)', backgroundSize: 'cover', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '10px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>10</div>
             </div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Pumpkin day</div>
          </div>

          <div onClick={() => setView('editor')} style={{ cursor: 'pointer' }}>
             <div style={{ height: '150px', borderRadius: '15px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop)', backgroundSize: 'cover', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '10px' }}>
               <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>14</div>
             </div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#555' }}>Retail promo</div>
          </div>

        </div>
      </div>

      {/* ПЛАВАЮЩАЯ КНОПКА */}
      <div style={{ position: 'fixed', bottom: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
        <button onClick={() => setView('editor')} style={{ padding: '15px 30px', backgroundColor: '#c400a0', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(196, 0, 160, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>+</span> Начни с фото или видео
        </button>
      </div>

    </div>
  );
}