
import React, { useState, useRef } from 'react';
import { GenerationStatus } from './types';
import { generateStagedImages, StagingConfig } from './services/geminiService';

const ENVIRONMENTS = [
  { id: 'auto', label: 'Automático', desc: 'IA escolhe', icon: 'fa-robot' },
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
        lighting: "Suave e Direcionada",
        style: "Fotografia de Produto Profissional"
      };
      
      const results = await generateStagedImages(sourceImage, config);
      setResultImages(results);
      setSelectedIndex(0);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao gerar imagens. Verifique se o produto está visível na foto.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const createCinematicVideo = async () => {
    const imageToUse = resultImages[selectedIndex];
    if (!imageToUse || !canvasRef.current) return;

    setIsProcessingVideo(true);
    setStatus(GenerationStatus.GENERATING_VIDEO);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageToUse;
    await new Promise((resolve) => (img.onload = resolve));

    // Shopee format (9:16)
    const width = 720;
    const height = 1280;
    canvas.width = width;
    canvas.height = height;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setResultVideo(URL.createObjectURL(blob));
      setIsProcessingVideo(false);
      setStatus(GenerationStatus.SUCCESS);
    };

    recorder.start();

    const duration = 5000; // 5 seconds
    const start = performance.now();

    const renderFrame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ken Burns: Slow zoom in
      const scale = 1 + (progress * 0.2); // zoom from 100% to 120%
      
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, width, height);

      // Center image and apply zoom
      const drawWidth = width * scale;
      const drawHeight = (width / (img.width / img.height)) * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Add a subtle vignette or overlay for professional look
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height/1.5);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (progress < 1) {
        requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    };

    requestAnimationFrame(renderFrame);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <header className="border-b border-white/5 bg-[#050608]/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <i className="fas fa-bolt text-xs"></i>
            </div>
            <h1 className="text-lg font-black tracking-tight">Viral<span className="text-orange-500 italic">Maker</span></h1>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            IA Shopee
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 flex flex-col gap-5">
        
        {/* Superior: Upload e Estilo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload de Imagem */}
          <section className="bg-[#0f1117] p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="w-20 h-20 shrink-0">
              {sourceImage ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden border border-orange-500/30">
                  <img src={sourceImage} className="w-full h-full object-cover" alt="Produto" />
                  <button 
                    onClick={() => { setSourceImage(null); setResultImages([]); setResultVideo(null); }} 
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] shadow-lg"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed border-white/10 bg-black/20 hover:border-orange-500/50 cursor-pointer transition-all">
                  <i className="fas fa-plus text-gray-600 text-lg"></i>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">1. Envie seu Produto</h2>
              <p className="text-[11px] text-gray-400 leading-tight">Carregue a foto original para que a IA processe o cenário.</p>
            </div>
          </section>

          {/* Escolha do Estilo */}
          <section className="bg-[#0f1117] p-4 rounded-2xl border border-white/5">
            <h2 className="text-[10px] font-black uppercase text-gray-500 mb-3 tracking-widest">2. Estilo do Cenário</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env.id}
                  onClick={() => setSelectedEnv(env)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${
                    selectedEnv.id === env.id 
                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' 
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <i className={`fas ${env.icon} text-[10px]`}></i> {env.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Ação Principal */}
        <button
          onClick={handleGenerateImages}
          disabled={!sourceImage || status === GenerationStatus.GENERATING_IMAGE}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${
            !sourceImage || status === GenerationStatus.GENERATING_IMAGE
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : 'bg-white text-black hover:bg-orange-500 hover:text-white transform active:scale-[0.98]'
          }`}
        >
          {status === GenerationStatus.GENERATING_IMAGE ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch fa-spin"></i> GERANDO SEU ANÚNCIO...
            </span>
          ) : "CRIAR ANÚNCIO DE ALTA CONVERSÃO"}
        </button>

        {/* Visualização de Resultados */}
        <div className="bg-[#0f1117] rounded-3xl border border-white/5 min-h-[500px] flex flex-col relative overflow-hidden shadow-inner">
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            
            {resultVideo ? (
              <div className="w-full max-w-[300px] aspect-[9/16] relative animate-in fade-in zoom-in duration-500">
                <video src={resultVideo} controls autoPlay loop className="w-full h-full rounded-2xl shadow-2xl border border-white/10 object-cover" />
                <button 
                  onClick={() => setResultVideo(null)} 
                  className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full text-xs flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
                <div className="absolute top-4 left-4">
                  <span className="bg-orange-500 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Vídeo Gerado</span>
                </div>
              </div>
            ) : resultImages.length > 0 ? (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="relative w-full max-w-sm group">
                  <img src={resultImages[selectedIndex]} className="w-full h-auto rounded-2xl shadow-2xl border border-white/10 transition-transform duration-500" alt="Resultado" />
                  
                  {/* Botão de vídeo overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px] rounded-2xl">
                    <button 
                      onClick={createCinematicVideo}
                      className="bg-orange-600 text-white px-8 py-4 rounded-full font-black text-[11px] flex items-center gap-3 shadow-2xl transform transition hover:scale-105"
                    >
                      <i className="fas fa-play"></i> GERAR VÍDEO CINEMÁTICO
                    </button>
                  </div>

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <a 
                      href={resultImages[selectedIndex]} 
                      download={`shopee-viral-${selectedIndex}.png`}
                      className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center shadow-2xl hover:bg-orange-600 hover:text-white transition-all"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                  </div>
                </div>

                {/* Seleção de Variantes */}
                <div className="flex gap-3 overflow-x-auto w-full justify-center pb-2">
                  {resultImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedIndex(idx); setResultVideo(null); }}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedIndex === idx ? 'border-orange-500 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Variante ${idx}`} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-wand-magic-sparkles text-3xl text-gray-700"></i>
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-600 mb-2">Aguardando Produto</h3>
                <p className="text-[11px] text-gray-500 max-w-[220px] mx-auto leading-relaxed">
                  Envie uma foto clara e escolha um estilo para ver a mágica acontecer instantaneamente.
                </p>
              </div>
            )}
          </div>

          {/* Ação Mobile de Vídeo */}
          {resultImages.length > 0 && !resultVideo && (
            <div className="p-4 pt-0">
              <button 
                onClick={createCinematicVideo}
                disabled={isProcessingVideo}
                className={`w-full bg-orange-600 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${isProcessingVideo ? 'opacity-50 cursor-wait' : 'hover:bg-orange-700 active:scale-95'}`}
              >
                {isProcessingVideo ? (
                  <><i className="fas fa-circle-notch fa-spin"></i> PROCESSANDO VÍDEO...</>
                ) : (
                  <><i className="fas fa-video"></i> TRANSFORMAR EM VÍDEO 9:16</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for video processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center text-[11px] font-bold text-red-500 animate-in slide-in-from-bottom duration-300">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}
      </main>

      <footer className="p-10 text-center opacity-20 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">Shopee Viral Maker &copy; 2025</p>
        <p className="text-[9px] font-medium">Powered by Gemini 2.5 Flash Engine</p>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
