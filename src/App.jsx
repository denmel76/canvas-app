import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// ТВОИ КЛЮЧИ
// ==========================================
const SUPABASE_URL = 'https://iqvujenjffevijvtdvd.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_Cbcd0LznpbNCIA6JwOskig_4SkcqVhL';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ==========================================

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
        onDragEnd={(e) => {
          onChange({ ...props, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...props,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProject(session.user.id);
      else setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProject(session.user.id);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadProject = async (userId) => {
    const { data } = await supabase.from('projects').select('data').eq('user_id', userId).single();
    if (data && data.data) setElements(data.data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user || isLoading) return;
    const saveTimeout = setTimeout(async () => {
      await supabase.from('projects').upsert({ 
        user_id: user.id, 
        data: elements,
        updated_at: new Date()
      });
    }, 1500);
    return () => clearTimeout(saveTimeout);
  }, [elements, user, isLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Проверьте почту! Мы отправили ссылку для входа.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setElements([]);
  };

  const addSquare = () => {
    setElements([...elements, { id: Date.now().toString(), type: 'rect', x: 100, y: 100, width: 150, height: 150, fill: '#' + Math.floor(Math.random()*16777215).toString(16) }]);
  };

  const addText = () => {
    setElements([...elements, { id: Date.now().toString(), type: 'text', x: 100, y: 100, text: 'Напиши здесь', fontSize: 30, fill: '#000000' }]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        setElements([...elements, { id: Date.now().toString(), type: 'image', x: 100, y: 100, image: img, src: event.target.result, width: img.width > 300 ? 300 : img.width, height: img.width > 300 ? (img.height * 300) / img.width : img.height }]);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const changeColor = () => {
    if (!selectedId) return;
    const newColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    setElements(elements.map(el => el.id === selectedId ? { ...el, fill: newColor } : el));
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

  const downloadImage = () => {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'my-design.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  };

  const checkDeselect = (e) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white', flexDirection: 'column' }}>
        <h1>Вход в редактор</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
          <input 
            type="email" 
            placeholder="Ваш Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#7B61FF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Войти по ссылке
          </button>
        </form>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '20px' }}>Мы отправим ссылку для входа на вашу почту</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#121212' }}>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />

      <div style={{ width: '80px', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '15px', zIndex: 10 }}>
        <button onClick={addSquare} style={{ fontSize: '24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>⬛</button>
        <button onClick={addText} style={{ fontSize: '24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>T</button>
        <button onClick={() => fileInputRef.current.click()} style={{ fontSize: '24px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>🖼️</button>
        <div style={{ height: '1px', width: '60%', backgroundColor: '#444', margin: '10px 0' }}></div>
        <button onClick={() => moveLayer('up')} disabled={!selectedId} style={{ fontSize: '20px', background: 'transparent', border: 'none', color: selectedId ? 'white' : '#555' }}>⬆️</button>
        <button onClick={() => moveLayer('down')} disabled={!selectedId} style={{ fontSize: '20px', background: 'transparent', border: 'none', color: selectedId ? 'white' : '#555' }}>⬇️</button>
        <div style={{ height: '1px', width: '60%', backgroundColor: '#444', margin: '10px 0' }}></div>
        <button onClick={changeColor} disabled={!selectedId} style={{ fontSize: '20px', background: 'transparent', border: 'none', color: selectedId ? '#FFD700' : '#555' }}>🎨</button>
        <button onClick={deleteSelected} disabled={!selectedId} style={{ fontSize: '20px', background: 'transparent', border: 'none', color: selectedId ? '#ff4444' : '#555' }}>🗑️</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#2c2c2c', position: 'relative' }}>
        
        {selectedElement && selectedElement.type === 'text' && (
          <div style={{ position: 'absolute', top: '80px', right: '20px', width: '250px', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '10px', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Настройки текста</h3>
            <input type="text" value={selectedElement.text} onChange={(e) => setElements(elements.map(el => el.id === selectedId ? { ...el, text: e.target.value } : el))} style={{ padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }} />
            <label style={{ fontSize: '14px', color: '#aaa' }}>Размер: {selectedElement.fontSize}px</label>
            <input type="range" min="12" max="100" value={selectedElement.fontSize} onChange={(e) => setElements(elements.map(el => el.id === selectedId ? { ...el, fontSize: parseInt(e.target.value) } : el))} style={{ cursor: 'pointer' }} />
          </div>
        )}

        <div style={{ width: '100%', height: '60px', backgroundColor: '#1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box' }}>
          <div style={{ color: '#aaa', fontSize: '14px' }}>Вы вошли как: {user.email}</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '8px', cursor: 'pointer' }}>Выйти</button>
            <button onClick={downloadImage} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#7B61FF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬇️ Скачать</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <div style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
            <Stage width={600} height={800} onMouseDown={checkDeselect} onTouchStart={checkDeselect} style={{ backgroundColor: 'white' }} ref={stageRef}>
              <Layer>
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  if (el.type === 'image') {
                    const imageObj = new window.Image();
                    imageObj.src = el.src || (el.image && el.image.src);
                    return <URLImage key={el.id} image={imageObj} src={el.src} x={el.x} y={el.y} width={el.width} height={el.height} id={el.id} isSelected={isSelected} onSelect={() => setSelectedId(el.id)} onChange={(newAttrs) => setElements(elements.map(item => item.id === el.id ? { ...item, ...newAttrs } : item))} />;
                  }
                  return (
                    <React.Fragment key={el.id}>
                      {el.type === 'rect' && <Rect {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#7B61FF' : undefined} strokeWidth={isSelected ? 4 : 0} onDragEnd={(e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item))}/>}
                      {el.type === 'text' && <Text {...el} draggable onClick={() => setSelectedId(el.id)} onTap={() => setSelectedId(el.id)} stroke={isSelected ? '#7B61FF' : undefined} strokeWidth={isSelected ? 1 : 0} onDragEnd={(e) => setElements(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item))}/>}
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;