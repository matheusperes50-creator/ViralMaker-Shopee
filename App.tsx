import React, { useState } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState(ENVIRONMENTS[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setResultImages([]);
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
      
      const config: StagingConfig = {
        environment: selectedEnv.label,
        lighting: "Cinematográfica Suave",
        style: "Fotografia Publicitária 8k de Alto Padrão"
      };
      
      const results = await generateStagedImages(sourceImage, config);
      setResultImages(results);
      setSelectedIndex(0);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error("Image generation failed:", err);
      setError("Falha na conexão com o motor de IA. Verifique sua chave de API e tente novamente.");
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
              <i className="fas fa-camera text-xs text-white"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              Shopee<span className="text-orange-500 italic">Viral</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IA Engine Ativa</span>
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
                <i className="fas fa-image text-orange-500"></i> 1. Foto do Produto
              </h2>
              <div className="relative group">
                {sourceImage ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-orange-500/30">
                    <img src={sourceImage} className="w-full h-full object-cover" alt="Upload" />
                    <button 
                      onClick={() => { setSourceImage(null); setResultImages([]); }} 
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
                    <span className="text-xs font-bold text-gray-500 text-center px-4">Carregar Foto Original</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </section>

            {/* 2. Style Selector */}
            <section className="bg-[#0f1117] p-5 rounded-3xl border border-white/5">
              <h2 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-orange-500"></i> 2. Cenário
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
                  <i className="fas fa-circle-notch fa-spin"></i> Transformando...
                </span>
              ) : "Gerar Cenários IA"}
            </button>
          </div>

          {/* Coluna de Visualização (Direita) */}
          <div className="lg:col-span-8">
            <div className="bg-[#0f1117] rounded-[2.5rem] border border-white/5 h-full min-h-[600px] flex flex-col overflow-hidden relative shadow-2xl">
              
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                {resultImages.length > 0 ? (
                  <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
                    <div className="relative w-full max-w-[450px] group">
                      <img 
                        src={resultImages[selectedIndex]} 
                        className="w-full h-auto rounded-[2rem] shadow-2xl border border-white/10 transition-all duration-700" 
                        alt="Preview" 
                      />
                      
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

                    {/* Selector Thumbs */}
                    <div className="flex gap-4 p-2 bg-black/20 rounded-3xl border border-white/5 overflow-x-auto max-w-full scrollbar-hide">
                      {resultImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedIndex(idx)}
                          className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedIndex === idx ? 'border-orange-500 scale-105 shadow-lg' : 'border-transparent opacity-30 hover:opacity-100'}`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt={`Variação ${idx}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                      <i className="fas fa-wand-magic-sparkles text-4xl text-gray-800"></i>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-[0.2em] text-gray-600 mb-3">Estúdio Fotográfico IA</h3>
                    <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                      Transforme fotos comuns em anúncios profissionais de alto padrão em segundos.
                    </p>
                  </div>
                )}
              </div>

              {/* Botão de download principal mobile */}
              {resultImages.length > 0 && (
                <div className="p-6 bg-[#12141c] border-t border-white/5 lg:hidden">
                  <a 
                    href={resultImages[selectedIndex]} 
                    download={`shopee-viral-${selectedIndex}.png`}
                    className="w-full bg-orange-600 text-white font-black py-5 rounded-[1.5rem] text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                  >
                    <i className="fas fa-download"></i> Baixar Foto em HD
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-full font-bold text-sm shadow-2xl animate-fade-in z-[100]">
            <i className="fas fa-exclamation-triangle mr-3"></i> {error}
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 px-6 border-t border-white/5 bg-[#050608]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">ViralMaker &copy; 2025</span>
          </div>
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest">
            <span className="hover:text-orange-500 cursor-pointer">Segurança IA</span>
            <span className="hover:text-orange-500 cursor-pointer">Qualidade 8K</span>
            <span className="hover:text-orange-500 cursor-pointer">Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;