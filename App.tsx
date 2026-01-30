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
      if (file.size > 4 * 1024 * 1024) {
        setError("Imagem muito grande. Use fotos de até 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setResultImages([]);
        setError(null);
        setStatus(GenerationStatus.IDLE);
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
        style: "Fotografia Publicitária Profissional"
      };
      
      const results = await generateStagedImages(sourceImage, config);
      setResultImages(results);
      setSelectedIndex(0);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error("Falha na geração:", err);
      setError("Houve um erro ao processar sua imagem. Tente novamente em instantes.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-sans selection:bg-orange-500/30">
      <header className="border-b border-white/5 bg-[#050608]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <i className="fas fa-magic text-xs text-white"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              Shopee<span className="text-orange-500 italic">Viral</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IA Conectada</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <section className="bg-[#0f1117] p-5 rounded-3xl border border-white/5">
              <h2 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                <i className="fas fa-upload text-orange-500"></i> 1. Foto do Produto
              </h2>
              <div className="relative">
                {sourceImage ? (
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-orange-500/30 shadow-2xl">
                    <img src={sourceImage} className="w-full h-full object-cover" alt="Original" />
                    <button 
                      onClick={() => { setSourceImage(null); setResultImages([]); }} 
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:border-orange-500/50 hover:bg-white/[0.04] cursor-pointer transition-all group">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <i className="fas fa-image text-gray-500 group-hover:text-orange-500"></i>
                    </div>
                    <span className="text-xs font-bold text-gray-500">Subir Produto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </section>

            <section className="bg-[#0f1117] p-5 rounded-3xl border border-white/5">
              <h2 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                <i className="fas fa-wand-magic-sparkles text-orange-500"></i> 2. Cenário IA
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env)}
                    className={`p-3 rounded-2xl border text-[11px] font-bold transition-all flex flex-col items-center gap-2 ${
                      selectedEnv.id === env.id 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' 
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
              className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                !sourceImage || status === GenerationStatus.GENERATING_IMAGE
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-orange-500 hover:text-white transform active:scale-95 shadow-xl'
              }`}
            >
              {status === GenerationStatus.GENERATING_IMAGE ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="fas fa-circle-notch fa-spin"></i> Criando...
                </span>
              ) : "Gerar Foto Profissional"}
            </button>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#0f1117] rounded-[2.5rem] border border-white/5 h-full min-h-[550px] flex flex-col overflow-hidden relative shadow-2xl">
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                {resultImages.length > 0 ? (
                  <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
                    <div className="relative w-full max-w-[450px] group">
                      <img 
                        src={resultImages[selectedIndex]} 
                        className="w-full h-auto rounded-[2rem] shadow-2xl border border-white/10" 
                        alt="Resultado" 
                      />
                    </div>
                    <div className="bg-orange-500/10 text-orange-500 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-3">
                      <i className="fas fa-check-circle"></i> Imagem Gerada com IA
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                      <i className="fas fa-star text-4xl text-gray-800"></i>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-[0.2em] text-gray-700 mb-3">Estúdio Shopee Viral</h3>
                    <p className="text-sm text-gray-500 max-w-[300px] mx-auto leading-relaxed">
                      Sua foto original será ambientada em um cenário profissional para aumentar suas vendas.
                    </p>
                  </div>
                )}
              </div>

              {resultImages.length > 0 && (
                <div className="p-6 bg-[#12141c]/50 border-t border-white/5">
                  <a 
                    href={resultImages[selectedIndex]} 
                    download={`shopee-viral.png`}
                    className="w-full bg-orange-600 text-white font-black py-5 rounded-[1.5rem] text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all hover:bg-orange-500"
                  >
                    <i className="fas fa-download"></i> Baixar Foto Final
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-2xl animate-fade-in z-[100] flex items-center gap-3 border border-red-400/20">
            <i className="fas fa-circle-exclamation"></i> {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;