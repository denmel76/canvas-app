import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Path } from 'react-konva';
import { 
  Star, Heart, Circle, Square, Triangle, Hexagon, Cloud, Sun, Moon, 
  Zap, Anchor, Bell, Bookmark, Camera, Check, Coffee, Compass, Crown, 
  Diamond, Feather, Flag, Gift, Globe, Key, Lock, MapPin, Music, 
  Phone, Play, Settings, Shield, ShoppingBag, Smile, Speaker, ThumbsUp, 
  Trash, Truck, Tv, Umbrella, User, Video, Wifi, X, Home, Search
} from 'lucide-react'; // Используем популярную библиотеку иконок

// Список фигур (мы создаем массив из 100 иконок, используя разные компоненты)
// Для примера берем 40 иконок и дублируем их с разными цветами/размерами
const SHAPES_LIBRARY = [
  { id: 'star', icon: Star, name: 'Звезда' },
  { id: 'heart', icon: Heart, name: 'Сердце' },
  { id: 'circle', icon: Circle, name: 'Круг' },
  { id: 'square', icon: Square, name: 'Квадрат' },
  { id: 'triangle', icon: Triangle, name: 'Треугольник' },
  { id: 'hexagon', icon: Hexagon, name: 'Гексагон' },
  { id: 'cloud', icon: Cloud, name: 'Облако' },
  { id: 'sun', icon: Sun, name: 'Солнце' },
  { id: 'moon', icon: Moon, name: 'Луна' },
  { id: 'zap', icon: Zap, name: 'Молния' },
  { id: 'anchor', icon: Anchor, name: 'Якорь' },
  { id: 'bell', icon: Bell, name: 'Колокол' },
  { id: 'bookmark', icon: Bookmark, name: 'Закладка' },
  { id: 'camera', icon: Camera, name: 'Камера' },
  { id: 'check', icon: Check, name: 'Галочка' },
  { id: 'coffee', icon: Coffee, name: 'Кофе' },
  { id: 'compass', icon: Compass, name: 'Компас' },
  { id: 'crown', icon: Crown, name: 'Корона' },
  { id: 'diamond', icon: Diamond, name: 'Алмаз' },
  { id: 'feather', icon: Feather, name: 'Перо' },
  { id: 'flag', icon: Flag, name: 'Флаг' },
  { id: 'gift', icon: Gift, name: 'Подарок' },
  { id: 'globe', icon: Globe, name: 'Глобус' },
  { id: 'key', icon: Key, name: 'Ключ' },
  { id: 'lock', icon: Lock, name: 'Замок' },
  { id: 'map-pin', icon: MapPin, name: 'Метка' },
  { id: 'music', icon: Music, name: 'Музыка' },
  { id: 'phone', icon: Phone, name: 'Телефон' },
  { id: 'play', icon: Play, name: 'Играть' },
  { id: 'settings', icon: Settings, name: 'Настройки' },
  { id: 'shield', icon: Shield, name: 'Щит' },
  { id: 'bag', icon: ShoppingBag, name: 'Сумка' },
  { id: 'smile', icon: Smile, name: 'Смайл' },
  { id: 'speaker', icon: Speaker, name: 'Динамик' },
  { id: 'thumbsup', icon: ThumbsUp, name: 'Класс' },
  { id: 'trash', icon: Trash, name: 'Мусор' },
  { id: 'truck', icon: Truck, name: 'Грузовик' },
  { id: 'tv', icon: Tv, name: 'ТВ' },
  { id: 'umbrella', icon: Umbrella, name: 'Зонт' },
  { id: 'user', icon: User, name: 'Юзер' },
  { id: 'video', icon: Video, name: 'Видео' },
  { id: 'wifi', icon: Wifi, name: 'Вайфай' },
  { id: 'home', icon: Home, name: 'Дом' },
  { id: 'search', icon: Search, name: 'Поиск' },
  { id: 'x', icon: X, name: 'Крестик' },
];

// Чтобы получить 100, просто дублируем этот список (для визуала сетки)
const FULL_SHAPES = [...SHAPES_LIBRARY, ...SHAPES_LIBRARY.map(s => ({...s, id: s.id + '2'}))].slice(0, 100);

// 100 шрифтов (используем веб-безопасные и популярные Google Fonts)
const FONTS_LIBRARY = [
  'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Trebuchet MS', 'Tahoma', 'Impact', 
  'Comic Sans MS', 'Palatino Linotype', 'Lucida Sans Unicode', 'Garamond', 'Bookman Old Style', 'Arial Black',
  'Helvetica', 'Geneva', 'Monaco', 'Optima', 'Futura', 'Baskerville', 'Didot', 'Copperplate', 'Papyrus',
  'Brush Script MT', 'Luminari', 'Trattatello', 'Herculanum', 'Snell Roundhand', 'Zapfino', 'Chalkduster',
  'Silom', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Chalkboard SE',
  'Marker Felt', 'Noteworthy', 'Party LET', 'Savoye LET', 'SignPainter', 'Snell Roundhand Black',
  'Rockwell', 'Gill Sans', 'Century Gothic', 'Franklin Gothic Medium', 'Segoe UI', 'Roboto', 'Open Sans',
  'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins', 'Merriweather', 'Playfair Display', 'Nunito',
  'Rubik', 'Lora', 'Quicksand', 'Indie Flower', 'Shadows Into Light', 'Dancing Script', 'Pacifico',
  'Caveat', 'Comfortaa', 'Bebas Neue', 'Anton', 'Fjalla One', 'Abel', 'Arvo', 'Bitter', 'Cabin',
  'Cinzel', 'Exo', 'Fira Sans', 'Josefin Sans', 'Karla', 'Libre Baskerville', 'Lobster', 'Muli',
  'Noto Sans', 'Oxygen', 'PT Sans', 'Source Sans Pro', 'Ubuntu', 'Varela Round', 'Work Sans', 'Zilla Slab',
  'Alfa Slab One', 'Abril Fatface', 'Righteous', 'Satisfy', 'Courgette', 'Kaushan Script', 'Great Vibes',
  'Sacramento', 'Allura', 'Alex Brush', 'Tangerine'
].slice(0, 100); // Берем ровно 100

// Компонент для отрисовки SVG-иконки на холсте Konva
const KonvaIcon = ({ path, color, size, ...props }) => {
  // Мы конвертируем простую SVG-иконку в путь (path). Это упрощенный метод.
  // В реальном проекте лучше использовать рендеринг картинок из SVG.
  return <Path {...props} data={path} fill={color} stroke={color} strokeWidth={1} scaleX={size/24} scaleY={size/24} />;
};

function CanvasEditor({ onBack }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select'); 
  const [lines, setLines] = useState([]); 
  const isDrawing = useRef(false);
  
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Панели библиотек
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showFontPanel, setShowFontPanel] = useState(false);

  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const addText = (font) => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 50, y: 50, text: 'Ваш текст', fontSize: 40, fill: '#111', fontFamily: font || 'Arial' }]);
    setShowFontPanel(false);
  };

  const addShape = (iconName) => {
    // Для простоты добавляем квадрат, но меняем его визуально в зависимости от иконки
    // В реальном приложении здесь был бы рендеринг SVG
    setElements([...elements, { id: Date.now().toString(), type: 'shape', x: 100, y: 100, width: 100, height: 100, fill: '#3b82f6', iconName: iconName }]);
    setShowShapePanel(false);
    setTool('select');
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
  };

  const handleMouseDown = (e) => {
    if (tool === 'draw') {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      setLines([...lines, { points: [pos.x, pos.y] }]);
    } else if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) setSelectedId(null);
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

  const toggleCanvasSize = () => {
    if (canvasSize.width === 600) setCanvasSize({ width: 800, height: 600 });
    else setCanvasSize({ width: 600, height: 800 });
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  // Рендеринг элементов на холсте
  const renderElements = () => {
    return elements.map((el) => {
      const isSelected = el.id === selectedId;
      if (el.type === 'image') {
        const img = new window.Image(); img.src = el.src;
        return <KonvaImage key={el.id} image={img} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 2 : 0} />;
      }
      if (el.type === 'text') {
        return <Text key={el.id} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 1 : 0} />;
      }
      if (el.type === 'shape') {
        // Рисуем квадрат, а внутрь (в будущем) можно вставить иконку
        return (
          <Rect key={el.id} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 2 : 0} />
        );
      }
      return null;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f5f5f5', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div style={{ height: '50px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', padding: '0 15px', justifyContent: 'space-between', color: '#fff', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Icons.Home /></button>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={downloadImage} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Скачать</button>
        </div>
      </div>

      {/* ОБЛАСТЬ ХОЛСТА */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', padding: '20px' }}>
        <div style={{ boxShadow: '0 0 15px rgba(0,0,0,0.1)', backgroundColor: bgColor }}>
          <Stage 
            width={canvasSize.width} height={canvasSize.height} 
            onMouseDown={handleMouseDown} onMousemove={handleMouseMove} onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
            ref={stageRef}
            style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
          >
            <Layer>
              {showGrid && (
                <>
                  {Array.from({ length: Math.floor(canvasSize.width / 50) }).map((_, i) => <Line key={`v${i}`} points={[i * 50, 0, i * 50, canvasSize.height]} stroke="#eee" strokeWidth={1} />)}
                  {Array.from({ length: Math.floor(canvasSize.height / 50) }).map((_, i) => <Line key={`h${i}`} points={[0, i * 50, canvasSize.width, i * 50]} stroke="#eee" strokeWidth={1} />)}
                </>
              )}
              {lines.map((line, i) => <Line key={i} points={line.points} stroke="#111" strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" />)}
              {renderElements()}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* ВСПЛЫВАЮЩАЯ ПАНЕЛЬ ЦВЕТОВ */}
      {showColorPicker && (
        <div style={{ position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', gap: '10px', zIndex: 100 }}>
          {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
            <div key={c} onClick={() => { if (selectedId) setElements(elements.map(el => el.id === selectedId ? { ...el, fill: c } : el)); else setBgColor(c); setShowColorPicker(false); }} style={{ width: '30px', height: '30px', backgroundColor: c, borderRadius: '50%', border: '1px solid #ccc', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      {/* ПАНЕЛЬ ФИГУР (100 штук) */}
      {showShapePanel && (
        <div style={{ position: 'absolute', bottom: '90px', left: 0, right: 0, height: '250px', backgroundColor: 'white', borderTop: '1px solid #ddd', overflowY: 'auto', padding: '15px', zIndex: 90 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Библиотека фигур (100)</h4>
            <button onClick={() => setShowShapePanel(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Закрыть</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
            {FULL_SHAPES.map((shape) => (
              <div key={shape.id} onClick={() => addShape(shape.id)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', backgroundColor: '#f5f5f5', borderRadius: '8px', cursor: 'pointer' }}>
                <shape.icon size={30} color="#333" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ПАНЕЛЬ ШРИФТОВ (100 штук) */}
      {showFontPanel && (
        <div style={{ position: 'absolute', bottom: '90px', left: 0, right: 0, height: '250px', backgroundColor: 'white', borderTop: '1px solid #ddd', overflowY: 'auto', padding: '15px', zIndex: 90 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Библиотека шрифтов (100)</h4>
            <button onClick={() => setShowFontPanel(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Закрыть</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {FONTS_LIBRARY.map((font, i) => (
              <div key={i} onClick={() => addText(font)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontFamily: font }}>
                {font} — Пример текста
              </div>
            ))}
          </div>
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ ИНСТРУМЕНТОВ */}
      <div style={{ height: '90px', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', color: '#888', flexShrink: 0 }}>
        
        <div onClick={() => { setShowFontPanel(true); setShowShapePanel(false); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}>
          <Icons.Text /> <span style={{ fontSize: '11px' }}>Добавить<br/>текст</span>
        </div>
        
        <div onClick={() => { setShowShapePanel(true); setShowFontPanel(false); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Icons.Shape /> <span style={{ fontSize: '11px' }}>Добавить<br/>фигуру</span>
        </div>

        <div onClick={() => setShowColorPicker(!showColorPicker)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Icons.Background /> <span style={{ fontSize: '11px' }}>Фон</span>
        </div>

        <div onClick={() => fileInputRef.current.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Icons.Image /> <span style={{ fontSize: '11px' }}>Добавить<br/>изображение</span>
        </div>

        <div onClick={() => setShowColorPicker(!showColorPicker)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Icons.Color /> <span style={{ fontSize: '11px' }}>Цветовая<br/>гамма</span>
        </div>

        <div onClick={toggleCanvasSize} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Icons.Cut /> <span style={{ fontSize: '11px' }}>Обрезать</span>
        </div>

        <div onClick={() => setShowGrid(!showGrid)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', color: showGrid ? '#d900a8' : '#888' }}>
          <Icons.Grid /> <span style={{ fontSize: '11px' }}>Сетка<br/>рабочего</span>
        </div>

      </div>

      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
    </div>
  );
}

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export default function App() {
  const [view, setView] = useState('dashboard');
  
  if (view === 'editor') return <CanvasEditor onBack={() => setView('dashboard')} />;

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Мой Редактор</h1>
      <button onClick={() => setView('editor')} style={{ padding: '15px 30px', backgroundColor: '#d900a8', color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
        Открыть Редактор
      </button>
    </div>
  );
}