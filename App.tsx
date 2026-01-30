import React, { useState } from 'react';
import { GenerationStatus } from './types';
import { generateStagedImages, StagingConfig } from './services/geminiService';

const ENVIRONMENTS = [
  { id: 'auto', label: 'Estúdio IA', desc: 'Minimalista', icon: 'fa-wand-sparkles' },
  { id: 'modern_living', label: 'Home Decor', desc: 'Sofisticado', icon: 'fa-house-chimney' },
  { id: 'professional_office', label: 'Corporativo', desc: 'Moderno', icon: 'fa-briefcase' },
  { id: 'nature_outdoor', label: 'Ar Livre', desc: 'Natural', icon: 'fa-leaf' },
  { id: 'lux_background', label: 'Luxo', desc: 'Premium', icon: 'fa-gem' },
  { id: 'tech_setup', label: 'Gamer/Tech', desc: 'Neon', icon: 'fa-gamepad' },
];

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnv, setSelectedEnv] = useState(ENVIRONMENTS[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 4MB.");
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

  const handleGenerate = async () => {
    if (!sourceImage) return;

    try {
      setStatus(GenerationStatus.GENERATING_IMAGE);
      setError(null);
      
      const config: StagingConfig = {
        environment: selectedEnv.label,
        lighting: "Suave e Profissional",
        style: "Fotografia Publicitária Realista"
      };
      
      const results = await generateStagedImages(sourceImage, config);
      setResultImages(results);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível gerar a imagem. Verifique sua conexão e tente novamente.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased">
      {/* Navbar Minimalista */}
      <nav className="h-14 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shopee-gradient rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-camera text-xs text-white"></i>
            </div>
            <span className="font-extrabold tracking-tight text-lg">Shopee<span className="text-orange-500 font-medium">Viral</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              Vercel Edge Ready
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar de Controle */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">1. Upload do Produto</label>
              {sourceImage ? (
                <div className="relative group rounded-2xl overflow-hidden aspect-square border border-white/10">
                  <img src={sourceImage} className="w-full h-full object-cover" alt="Source" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setSourceImage(null)} className="p-3 bg-red-500 rounded-full hover:scale-110 transition-transform">
                      <i className="fas fa-trash text-white"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-orange-500/40 hover:bg-white/[0.02] transition-all cursor-pointer">
                  <i className="fas fa-cloud-arrow-up text-3xl text-gray-600 mb-4"></i>
                  <span className="text-xs font-medium text-gray-500">Arraste ou clique para subir</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">2. Estilo de Fundo</label>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env)}
                    className={`p-3 rounded-xl border text-[11px] font-semibold transition-all flex flex-col items-center gap-2 ${
                      selectedEnv.id === env.id 
                      ? 'bg-orange-600 border-orange-500 text-white' 
                      : 'glass hover:bg-white/5 border-white/5 text-gray-400'
                    }`}
                  >
                    <i className={`fas ${env.icon}`}></i>
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!sourceImage || status === GenerationStatus.GENERATING_IMAGE}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                !sourceImage || status === GenerationStatus.GENERATING_IMAGE
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'shopee-gradient text-white hover:opacity-90 active:scale-[0.98] shadow-2xl shadow-orange-600/20'
              }`}
            >
              {status === GenerationStatus.GENERATING_IMAGE ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="fas fa-spinner fa-spin"></i> Criando Magia...
                </span>
              ) : "Transformar Foto"}
            </button>
          </div>
        </aside>

        {/* Preview Principal */}
        <section className="lg:col-span-8">
          <div className="glass rounded-[2.5rem] min-h-[600px] flex flex-col relative overflow-hidden group">
            {status === GenerationStatus.GENERATING_IMAGE && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-pulse">
                <div className="w-16 h-1 w-32 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-orange-500 animate-shine" style={{width: '100%'}}></div>
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Processando IA...</span>
              </div>
            )}

            <div className="flex-1 p-8 flex items-center justify-center">
              {resultImages.length > 0 ? (
                <div className="w-full max-w-2xl animate-fade-in text-center space-y-8">
                  <img src={resultImages[0]} className="w-full h-auto rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10" alt="Generated" />
                  <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-[10px] font-bold uppercase border border-green-500/20">
                    <i className="fas fa-check"></i> Pronto para postar
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 glass rounded-3xl mx-auto flex items-center justify-center">
                    <i className="fas fa-images text-3xl text-gray-700"></i>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Aguardando seu produto</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Suba uma foto e escolha um cenário para ver a mágica acontecer.</p>
                  </div>
                </div>
              )}
            </div>

            {resultImages.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-black/20">
                <a 
                  href={resultImages[0]} 
                  download="shopee-viral-pro.png"
                  className="w-full bg-white text-black font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-xl"
                >
                  <i className="fas fa-download"></i> Baixar em Alta Resolução
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Erro Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 glass border-red-500/30 bg-red-500/5 p-4 rounded-2xl flex items-center gap-4 animate-fade-in shadow-2xl">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
            <i className="fas fa-exclamation text-xs"></i>
          </div>
          <span className="text-xs font-bold text-red-200">{error}</span>
        </div>
      )}
    </div>
  );
};

export default App;