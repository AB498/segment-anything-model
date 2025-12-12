const { useState, useRef, useEffect } = window.React;

function CanvasBoundingBoxes({ imageUrl, boxes, phrases }) {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset image loaded state when image URL changes
    setImageLoaded(false);
    
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas immediately when image changes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset canvas dimensions
    canvas.width = 0;
    canvas.height = 0;

    if (!boxes) return;

    const image = new Image();
    image.crossOrigin = "Anonymous";

    image.onload = () => {
      setImageLoaded(true);
      const maxWidth = 500;
      const scale = image.width > maxWidth ? maxWidth / image.width : 1;
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      // Clear the canvas before drawing the new image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      boxes.forEach((box, index) => {
        if (box && box.length === 4) {
          const cx = box[0] * canvas.width;
          const cy = box[1] * canvas.height;
          const width = box[2] * canvas.width;
          const height = box[3] * canvas.height;
          const x = cx - width / 2;
          const y = cy - height / 2;

          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          const phrase = phrases[index] || `Object ${index + 1}`;
          ctx.font = 'bold 12px system-ui';
          const textWidth = ctx.measureText(phrase).width;

          ctx.fillStyle = 'rgba(34, 211, 238, 0.95)';
          ctx.fillRect(x, y - 20, textWidth + 8, 18);
          ctx.fillStyle = '#0a0a0a';
          ctx.fillText(phrase, x + 4, y - 6);
        }
      });
    };

    image.src = imageUrl;
    
    // Cleanup function to clear canvas when component unmounts or dependencies change
    return () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [JSON.stringify(imageUrl), boxes, phrases]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-auto rounded-lg shadow-lg" style={{ display: imageLoaded ? 'block' : 'none' }} />
      {!imageLoaded && (
        <div className="flex items-center justify-center h-64 bg-slate-100 rounded-lg">
          <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const demos = [
    { id: 1, prompt: "cat", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400" },
    { id: 2, prompt: "dog", img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400" },
    { id: 3, prompt: "car", img: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400" },
    { id: 4, prompt: "person", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400" }
  ];

  const loadDemo = async (demo) => {
    setPrompt(demo.prompt);
    const res = await fetch(demo.img);
    const blob = await res.blob();
    const file = new File([blob], 'demo.jpg', { type: blob.type });
    setImage(file);
    setPreviewUrl(demo.img);
    // Clear the result when a new demo image is selected
    setResult(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
        // Clear the result when a new image is selected
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const detect = async () => {
    if (!image) return;
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('text_prompt', prompt);
    formData.append('box_threshold', '0.35');
    formData.append('text_threshold', '0.25');

    try {
      const res = await fetch('https://imagelabeling.vercel.app/label-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
  
      <div className="relative z-10 px-6">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-sm text-cyan-700 font-medium">Free Online AI Auto Annotation</span>
          </div>
          
          {/* Large Logo */}
          <div className="flex justify-center mb-6">
            <svg width="120" height="120" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#paint0_linear_1_2)"/>
              <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8Z" stroke="white" stroke-width="2"/>
              <path d="M16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12Z" fill="white"/>
              <path d="M22 16L26 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M6 16L10 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 6L16 10" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 22L16 26" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <defs>
                <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#6366F1"/>
                  <stop offset="1" stop-color="#8B5CF6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <h1 className="text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Auto Label Anything
            </span>
          </h1>
          
          <p className="text-xl text-slate-700 max-w-2xl mx-auto">
            Free online AI-powered auto annotation with SAM3 and Grounding DINO
          </p>
        </div>

        {/* Main Demo Area */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input */}
          <div className="space-y-6">
            <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-sm">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What objects should I label?"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              
              <div className="mt-4 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                ) : (
                  <label className="flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-slate-100 transition">
                    <svg className="w-12 h-12 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 text-sm">Click to upload image online</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <button
                onClick={detect}
                disabled={loading || !image}
                className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed rounded-xl font-semibold transition-all shadow-md shadow-cyan-500/20 text-white"
              >
                {loading ? 'Auto Labeling...' : 'Auto Label Objects'}
              </button>
            </div>

            {/* Quick Demos */}
            <div className="flex gap-3">
              {demos.map((demo, i) => (
                <button
                  key={i}
                  onClick={() => loadDemo(demo)}
                  className="flex-1 group relative overflow-hidden rounded-xl border border-slate-200 hover:border-cyan-500 transition-all shadow-sm"
                >
                  <img src={demo.img} alt={demo.prompt} className="w-full h-20 object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-800 to-transparent opacity-60"></div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-xs font-medium text-white capitalize">{demo.prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-slate-600 font-medium">Auto labeling image online...</p>
                <p className="text-slate-500 text-sm mt-1">AI is automatically detecting and labeling objects in your image</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <CanvasBoundingBoxes
                  imageUrl={previewUrl}
                  boxes={result.boxes}
                  phrases={result.phrases}
                />
                <div className="flex flex-wrap gap-2">
                  {result.phrases.map((phrase, i) => (
                    <span key={i} className="px-3 py-1 bg-cyan-100 border border-cyan-200 text-cyan-700 rounded-lg text-sm font-medium">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">Upload an image to begin labeling</p>
                <p className="text-slate-500 text-sm mt-1">AI-powered labeling results appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Render the app to the root-demo container
const container = document.getElementById('root-demo');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  console.warn('Container with id "root-demo" not found');
}