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

  const addText = () => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 50, y: 50, text: 'Ваш текст', fontSize: 40, fill: '#111' }]);
    setTool('select');
  };

  const addShape = () => {
    setElements([...elements, { id: Date.now().toString(), type: 'rect', x: 100, y: 100, width: 150, height: 150, fill: '#3b82f6' }]);
    setTool('select');
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

  const changeColor = () => {
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (selectedId) {
      setElements(elements.map(el => el.id === selectedId ? { ...el, fill: randomColor } : el));
    } else {
      setBgColor(randomColor);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', backgroundColor: '#f5f5f5', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div style={{ height: '50px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', padding: '0 15px', justifyContent: 'space-between', color: '#fff', flexShrink: 0 }}>
        <div style={{ fontWeight: 'bold' }}>Редактор</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={downloadImage} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Скачать</button>
        </div>
      </div>

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
                if (el.type === 'rect') {
                  return <Rect key={el.id} {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#d900a8' : undefined} strokeWidth={isSelected ? 2 : 0} />;
                }
                return null;
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ (Минималистичная) */}
      <div style={{ height: '80px', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', color: '#fff', flexShrink: 0 }}>
        
        <div onClick={addText} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>T</span>
          <span style={{ fontSize: '10px' }}>Текст</span>
        </div>
        
        <div onClick={addShape} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>■</span>
          <span style={{ fontSize: '10px' }}>Фигура</span>
        </div>

        <div onClick={changeColor} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>🎨</span>
          <span style={{ fontSize: '10px' }}>Цвет</span>
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