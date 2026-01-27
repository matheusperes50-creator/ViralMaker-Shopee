
import React, { useState, useRef } from 'react';
import { GenerationStatus } from './types';
import { generateStagedImages, StagingConfig } from './services/geminiService';

const ENVIRONMENTS = [
  { id: 'auto', label: 'Automático', desc: 'IA inteligente', icon: 'fa-robot' },
  { id: 'luxury_living', label: 'Sala Luxo', desc: 'Sofisticado', icon: 'fa-couch' },
  { id: 'minimal_studio', label: 'Estúdio', desc: 'Clean', icon: 'fa-camera-retro' },
  { id: 'nature_zen', label: 'Zen', desc: 'Natural', icon: 'fa-leaf' },
  { id: 'tech_office', label: 'Escritório', desc: 'Moderno', icon: 'fa-laptop' },
  { id: 'scandinavian', label: 'Escandinavo', desc: 'Suave', icon: 'fa-sun' },
];

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState(ENVIRONMENTS[0]);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setResultImages([]);
        setResultVideo(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImages = async () => {
    if (!sourceImage) return;

    try {
      setStatus(GenerationStatus.GENERATING_IMAGE);
      setError(null);
      setResultVideo(null);
      
      const config: StagingConfig = {
        environment: selectedEnv.label,
        lighting: "Cinematográfica Suave",
        style: "Fotografia Publicitária 8k"
      };
      
      const results = await generateStagedImages(sourceImage, config);
      setResultImages(results);
      setSelectedIndex(0);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error("Image generation failed:", err);
      setError("Falha na conexão com o motor de IA. Tente novamente em instantes.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const createCinematicVideo = async () => {
    const imageToUse = resultImages[selectedIndex];
    if (!imageToUse || !canvasRef.current) return;

    setIsProcessingVideo(true);
    setStatus(GenerationStatus.GENERATING_VIDEO);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context error");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageToUse;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Image load error"));
      });

      // Formato Vertical Shopee (9:16)
      const width = 720;
      const height = 1280;
      canvas.width = width;
      canvas.height = height;

      const stream = canvas.captureStream(30);
      
      // Browser compatibility for Video MIME types
      const possibleTypes = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
      const mimeType = possibleTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setResultVideo(URL.createObjectURL(blob));
        setIsProcessingVideo(false);
        setStatus(GenerationStatus.SUCCESS);
      };

      recorder.start();

      const duration = 6000; // 6 segundos de luxo
      const startTime = performance.now();

      const renderFrame = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Efeito Ken Burns: Zoom in lento e sutil
        const scale = 1.0 + (progress * 0.12); 
        
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, width, height);

        const drawWidth = width * scale;
        const drawHeight = (width / (img.width / img.height)) * scale;
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        // Overlay cinematográfico (vinheta e gradiente de branding)
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(0.3, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.7, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(238,77,45,0.15)'); // Shopee Orange glow at bottom
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        if (progress < 1) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      };

      requestAnimationFrame(renderFrame);
    } catch (err) {
      console.error("Video rendering error:", err);
      setError("Erro ao renderizar vídeo no navegador.");
      setIsProcessingVideo(false);
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Header Premium */}
      <header className="border-b border-white/5 bg-[#050608]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <i className="fas fa-play text-xs text-white"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              Shopee<span className="text-orange-500 italic">Viral</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IA Engine v2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 w-full flex flex-col gap-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna de Controles (Esquerda) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* 1. Upload Section */}
            <section className="bg-[#0f1117] p-5 rounded-3xl border border-white/5">
              <h2 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                <i className="fas fa-camera text-orange-500"></i> 1. Foto do Produto
              </h2>
              <div className="relative group">
                {sourceImage ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-orange-500/30">
                    <img src={sourceImage} className="w-full h-full object-cover" alt="Upload" />
                    <button 
                      onClick={() => { setSourceImage(null); setResultImages([]); setResultVideo(null); }} 
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs shadow-2xl hover:scale-110 transition-transform"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-orange-500/50 hover:bg-white/[0.04] cursor-pointer transition-all">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-upload text-gray-500"></i>
                    </div>
                    <span className="text-xs font-bold text-gray-500">Carregar Imagem</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </section>

            {/* 2. Style Selector */}
            <section className="bg-[#0f1117] p-5 rounded-3xl border border-white/5">
              <h2 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                <i className="fas fa-magic text-orange-500"></i> 2. Estilo
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env)}
                    className={`p-3 rounded-2xl border text-[11px] font-bold transition-all flex flex-col items-center gap-2 ${
                      selectedEnv.id === env.id 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <i className={`fas ${env.icon} text-sm`}></i>
                    {env.label}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={handleGenerateImages}
              disabled={!sourceImage || status === GenerationStatus.GENERATING_IMAGE}
              className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${
                !sourceImage || status === GenerationStatus.GENERATING_IMAGE
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-orange-500 hover:text-white transform active:scale-95'
              }`}
            >
              {status === GenerationStatus.GENERATING_IMAGE ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="fas fa-circle-notch fa-spin"></i> Criando Cenários...
                </span>
              ) : "Gerar Anúncio IA"}
            </button>
          </div>

          {/* Coluna de Visualização (Direita) */}
          <div className="lg:col-span-8">
            <div className="bg-[#0f1117] rounded-[2.5rem] border border-white/5 h-full min-h-[600px] flex flex-col overflow-hidden relative shadow-2xl">
              
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                {resultVideo ? (
                  <div className="w-full max-w-[320px] aspect-[9/16] relative animate-in fade-in zoom-in duration-700">
                    <video 
                      src={resultVideo} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full rounded-3xl shadow-[0_0_50px_rgba(238,77,45,0.2)] border border-white/10 object-cover" 
                    />
                    <button 
                      onClick={() => setResultVideo(null)} 
                      className="absolute -top-4 -right-4 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-sm flex items-center justify-center shadow-2xl hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-orange-500">Vídeo Viral Gerado</span>
                    </div>
                  </div>
                ) : resultImages.length > 0 ? (
                  <div className="w-full flex flex-col items-center gap-8">
                    <div className="relative w-full max-w-[450px] group">
                      <img 
                        src={resultImages[selectedIndex]} 
                        className="w-full h-auto rounded-[2rem] shadow-2xl border border-white/10 transition-transform duration-700" 
                        alt="Preview" 
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-[2px] rounded-[2rem]">
                        <button 
                          onClick={createCinematicVideo}
                          className="bg-orange-600 text-white px-10 py-5 rounded-full font-black text-[11px] flex items-center gap-3 shadow-2xl transform transition hover:scale-105"
                        >
                          <i className="fas fa-play"></i> GERAR VÍDEO CINEMÁTICO 9:16
                        </button>
                      </div>

                      <div className="absolute bottom-6 right-6 flex gap-3">
                        <a 
                          href={resultImages[selectedIndex]} 
                          download={`shopee-viral-${selectedIndex}.png`}
                          className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                          <i className="fas fa-download text-lg"></i>
                        </a>
                      </div>
                    </div>

                    {/* Selector Dots/Thumbs */}
                    <div className="flex gap-4 p-2 bg-black/20 rounded-3xl border border-white/5">
                      {resultImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setSelectedIndex(idx); setResultVideo(null); }}
                          className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedIndex === idx ? 'border-orange-500 scale-105 shadow-lg' : 'border-transparent opacity-30 hover:opacity-100'}`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt={`Variant ${idx}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 animate-pulse">
                    <div className="w-24 h-24 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                      <i className="fas fa-sparkles text-4xl text-gray-800"></i>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-[0.2em] text-gray-600 mb-3">Estúdio IA</h3>
                    <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                      Sua vitrine virtual premium começa aqui. Envie uma foto do produto para iniciar a mágica.
                    </p>
                  </div>
                )}
              </div>

              {/* Ação Mobile Inferior */}
              {resultImages.length > 0 && !resultVideo && (
                <div className="p-6 bg-[#12141c] border-t border-white/5">
                  <button 
                    onClick={createCinematicVideo}
                    disabled={isProcessingVideo}
                    className={`w-full bg-orange-600 text-white font-black py-5 rounded-[1.5rem] text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${isProcessingVideo ? 'opacity-50 cursor-wait' : 'hover:bg-orange-700 active:scale-95'}`}
                  >
                    {isProcessingVideo ? (
                      <><i className="fas fa-circle-notch fa-spin"></i> RENDERIZANDO VÍDEO...</>
                    ) : (
                      <><i className="fas fa-video"></i> TRANSFORMAR EM VÍDEO PARA SHOPEE</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden rendering tools */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-full font-bold text-sm shadow-2xl animate-in slide-in-from-bottom duration-500">
            <i className="fas fa-exclamation-triangle mr-3"></i> {error}
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-[#050608]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Shopee Viral Studio &copy; 2025</span>
          </div>
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            <span className="hover:text-orange-500 cursor-pointer">Segurança IA</span>
            <span className="hover:text-orange-500 cursor-pointer">Qualidade 8K</span>
            <span className="hover:text-orange-500 cursor-pointer">Termos</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.9); } to { transform: scale(1); } }
        .animate-in { animation: fade-in 0.5s ease-out, zoom-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
