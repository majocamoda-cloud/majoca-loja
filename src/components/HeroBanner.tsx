import React, { useRef, useState } from 'react';
import { ArrowRight, Heart, MapPin, Shield, Upload, Link as LinkIcon, Camera, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { settings, updateSettings, showToast, setFilterSort } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const handleNovidadesClick = () => {
    setFilterSort('recentes');
    const catalogElem = document.getElementById('catalogo-produtos');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoriasClick = () => {
    const categoriesElem = document.getElementById('secao-categorias');
    if (categoriesElem) {
      categoriesElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateSettings({ heroImage: reader.result });
          showToast('Foto do Banner Principal atualizada com sucesso!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      updateSettings({ heroImage: inputUrl.trim() });
      showToast('Foto do Banner Principal atualizada com sucesso!', 'success');
      setShowUrlModal(false);
      setInputUrl('');
    }
  };

  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F5] via-white to-white py-8 sm:py-12 lg:py-14 border-b border-[#BB7F5D]/15">
      {/* Decorative subtle ambient glows in brand orange/terracotta */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CLEAN 2-COLUMN (50% / 50%) BALANCED LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LADO ESQUERDO: FRASE PRINCIPAL OFICIAL */}
          <div className="flex flex-col justify-center text-left space-y-6">
            
            {/* Título Principal */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#3D2518] leading-tight tracking-tight">
              {settings.heroTitle || 'Dos primeiros passos ao estilo próprio.'}
            </h1>

            {/* Subtítulo / Frase Principal com "anos" */}
            <p className="text-base sm:text-lg text-[#5A3825] leading-relaxed font-normal max-w-xl">
              {settings.heroSubtitle || 'A Majoca Moda acompanha todas as fases do RN ao 18 anos, do bebê ao estilo único da juventude.'}
            </p>

            {/* Botões Funcionais */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-btn-novidades"
                onClick={handleNovidadesClick}
                className="bg-[#FF751F] hover:bg-[#e06316] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{settings.heroButtonPrimaryText || 'Ver novidades'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-btn-categorias"
                onClick={handleCategoriasClick}
                className="bg-white hover:bg-orange-50/50 text-[#3D2518] border-2 border-[#BB7F5D]/30 hover:border-[#BB7F5D] px-6 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all cursor-pointer"
              >
                {settings.heroButtonSecondaryText || 'Explorar categorias'}
              </button>
            </div>

            {/* Pilares de Confiança & Loja Física */}
            <div className="pt-6 border-t border-[#BB7F5D]/20 grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF751F] shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#3D2518]">Doce Conforto</div>
                  <div className="text-[11px] text-[#BB7F5D]">100% carinho</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#BB7F5D] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#3D2518]">Loja em Ubá/MG</div>
                  <div className="text-[11px] text-[#BB7F5D]">Retirada & Envio</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#3D2518]">Compra Segura</div>
                  <div className="text-[11px] text-[#BB7F5D]">PIX & Cartão</div>
                </div>
              </div>
            </div>

          </div>

          {/* LADO DIREITO: ÁREA DO BANNER VISUAL (FOTO PRINCIPAL COM BOTÃO DE SUBSTITUIÇÃO FÁCIL) */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="group relative w-full max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-orange-50/50 aspect-[4/3] sm:aspect-[16/11]">
              
              {/* Imagem do Banner */}
              <img
                src={settings.heroImage}
                alt="Majoca Moda - Bebês, Crianças e Adolescentes com conforto e estilo"
                className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
                loading="eager"
              />

              {/* Botão de Trocar Imagem do Banner */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#2B1B12]/80 backdrop-blur-xs p-1.5 rounded-2xl border border-white/20 shadow-lg">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  id="btn-upload-banner-hero"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#FF751F] hover:bg-[#e06316] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Enviar imagem do seu dispositivo"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Trocar Imagem</span>
                </button>

                <button
                  id="btn-link-banner-hero"
                  onClick={() => {
                    setInputUrl(settings.heroImage);
                    setShowUrlModal(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold p-1.5 rounded-xl transition-colors cursor-pointer"
                  title="Inserir link/URL da imagem"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Helper label below banner */}
            <div className="mt-2 text-center text-[11px] text-[#BB7F5D]">
              Espaço reservado para o Banner Principal • Substituição rápida via upload ou link
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DE URL DO BANNER */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#BB7F5D]/20 overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-orange-50/50 border-b border-[#BB7F5D]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FF751F]" />
                <h3 className="font-heading font-bold text-sm text-[#3D2518]">Alterar Imagem do Banner</h3>
              </div>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1 rounded-full text-[#5A3825] hover:text-[#FF751F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUrlSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#5A3825] mb-1">
                  Cole a URL ou Link da Imagem:
                </label>
                <input
                  type="url"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  className="w-full px-3 py-2 border border-[#BB7F5D]/30 rounded-xl text-[#3D2518] focus:border-[#FF751F] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-4 py-2 font-bold text-[#5A3825] hover:bg-orange-50 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FF751F] hover:bg-[#e06316] text-white px-5 py-2 font-bold rounded-xl shadow-xs"
                >
                  Aplicar Imagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
