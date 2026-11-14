import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line, Circle } from 'react-konva';

export default function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState('select');
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  
  const stageRef = useRef(null);

  // Добавление элементов
  const addText = () => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 50, y: 50, text: 'Ваш текст', fontSize: 40, fill: '#111', fontFamily: 'Arial' }]);
    setTool('select');
  };

  const addShape = (shapeType) => {
    let newElement = { id: Date.now().toString(), type: shapeType, x: 100, y: 100, width: 150, height: 150, fill: '#3b82f6' };
    if (shapeType === 'circle') {
      newElement = { id: Date.now().toString(), type: 'circle', x: 150, y: 150, radius: 75, fill: '#3b82f6' };
    }
    setElements([...elements, newElement]);
    setTool('select');
  };

  // Удаление выбранного элемента
  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Очистка всего холста
  const clearCanvas = () => {
    if(window.confirm('Очистить весь холст?')) {
      setElements([]);
      setLines([]);
      setSelectedId(null);
    }
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

  const updateSelected = (key, value) => {
    setElements(elements.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f5f5f5', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div style={{ height: '50px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', padding: '0 15px', justifyContent: 'space-between', color: '#fff', flexShrink: 0 }}>
        <div style={{ fontWeight: 'bold' }}>Редактор</div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={clearCanvas} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Очистить всё</button>
          <button onClick={downloadImage} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Скачать</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ХОЛСТ */}
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
                {/* Сетка */}
                {showGrid && Array.from({ length: Math.floor(canvasSize.width / 50) }).map((_, i) => (
                  <React.Fragment key={i}>
                    <Line points={[i * 50, 0, i * 50, canvasSize.height]} stroke="#eee" strokeWidth={1} />
                    <Line points={[0, i * 50, canvasSize.width, i * 50]} stroke="#eee" strokeWidth={1} />
                  </React.Fragment>
                ))}

                {/* Линии рисования */}
                {lines.map((line, i) => <Line key={i} points={line.points} stroke="#111" strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" />)}

                {/* Элементы */}
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  if (el.type === 'text') {
                    return <Text key={el.id} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 1 : 0} />;
                  }
                  if (el.type === 'rect' || el.type === 'circle') {
                    return <Rect key={el.id} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 2 : 0} />;
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ (Для настроек) */}
        <div style={{ width: '250px', backgroundColor: 'white', padding: '15px', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Свойства</h3>
          
          {!selectedId && (
            <>
              <label style={{ fontSize: '12px', color: '#666' }}>Цвет фона:</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ height: '40px', cursor: 'pointer' }} />
            </>
          )}

          {selectedElement && selectedElement.type === 'text' && (
            <>
              <button onClick={deleteSelected} style={{ padding: '8px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Удалить текст</button>
              <label style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Текст:</label>
              <input type="text" value={selectedElement.text} onChange={(e) => updateSelected('text', e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }} />
              
              <label style={{ fontSize: '12px', color: '#666' }}>Шрифт:</label>
              <select value={selectedElement.fontFamily} onChange={(e) => updateSelected('fontFamily', e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Impact">Impact</option>
                <option value="Georgia">Georgia</option>
              </select>

              <label style={{ fontSize: '12px', color: '#666' }}>Размер шрифта:</label>
              <input type="range" min="10" max="100" value={selectedElement.fontSize} onChange={(e) => updateSelected('fontSize', parseInt(e.target.value))} />
              
              <label style={{ fontSize: '12px', color: '#666' }}>Цвет текста:</label>
              <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ height: '40px', cursor: 'pointer' }} />
            </>
          )}

          {selectedElement && (selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
            <>
              <button onClick={deleteSelected} style={{ padding: '8px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Удалить фигуру</button>
              <label style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Цвет фигуры:</label>
              <input type="color" value={selectedElement.fill} onChange={(e) => updateSelected('fill', e.target.value)} style={{ height: '40px', cursor: 'pointer' }} />
            </>
          )}
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ (Красивая, с розовыми иконками) */}
      <div style={{ height: '80px', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', color: '#fff', flexShrink: 0 }}>
        
        <div onClick={addText} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px', color: '#d900a8', fontWeight: 'bold' }}>T</span>
          <span style={{ fontSize: '10px' }}>Текст</span>
        </div>
        
        <div onClick={() => addShape('rect')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px', color: '#d900a8' }}>■</span>
          <span style={{ fontSize: '10px' }}>Квадрат</span>
        </div>

        <div onClick={() => addShape('circle')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px', color: '#d900a8' }}>●</span>
          <span style={{ fontSize: '10px' }}>Круг</span>
        </div>

        <div onClick={() => setTool(tool === 'draw' ? 'select' : 'draw')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: tool === 'draw' ? '#d900a8' : '#fff' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>✏️</span>
          <span style={{ fontSize: '10px' }}>Рисовать</span>
        </div>

        <div onClick={toggleCanvasSize} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>⛶</span>
          <span style={{ fontSize: '10px' }}>Формат</span>
        </div>

        <div onClick={() => setShowGrid(!showGrid)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: showGrid ? '#d900a8' : '#fff' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>#</span>
          <span style={{ fontSize: '10px' }}>Сетка</span>
        </div>

      </div>
    </div>
  );
}