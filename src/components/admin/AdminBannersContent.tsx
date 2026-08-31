import React, { useRef, useState } from 'react';
import { Save, Layout, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';

export const AdminBannersContent: React.FC = () => {
  const { settings, updateSettings, showToast } = useStore();
  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    showToast('Banners e textos do site atualizados com sucesso!', 'success');
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
          setFormSettings({ ...formSettings, heroImage: reader.result });
          showToast('Imagem carregada! Clique em "Salvar Alterações" para aplicar.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. HERO BANNER & TEXTS */}
      <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#BB7F5D]/10">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF751F] flex items-center justify-center">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#3D2518]">
              Banner Principal (Hero 50/50) & Tarja Superior
            </h3>
            <p className="text-[11px] text-[#5A3825]">
              Controle total das frases e imagem exibidas no topo do site da Majoca Moda.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#5A3825] mb-1">
              Tarja Superior (Barra de Anúncios no Topo)
            </label>
            <input
              type="text"
              required
              value={formSettings.topAnnouncement}
              onChange={(e) =>
                setFormSettings({ ...formSettings, topAnnouncement: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Título Principal do Banner (Lado Esquerdo)
              </label>
              <input
                type="text"
                required
                value={formSettings.heroTitle}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, heroTitle: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Subtítulo Oficial do Banner (Lado Esquerdo)
              </label>
              <input
                type="text"
                required
                value={formSettings.heroSubtitle}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, heroSubtitle: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Texto do Botão Primário (CTA)
              </label>
              <input
                type="text"
                required
                value={formSettings.heroButtonPrimaryText}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, heroButtonPrimaryText: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Texto do Botão Secundário
              </label>
              <input
                type="text"
                required
                value={formSettings.heroButtonSecondaryText}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, heroButtonSecondaryText: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>
          </div>

          {/* Banner Image Upload & URL */}
          <div className="pt-2 border-t border-[#BB7F5D]/15 space-y-3">
            <label className="block font-semibold text-[#5A3825]">
              Foto / Imagem do Banner Principal (Lado Direito)
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview Thumbnail */}
              <div className="relative w-36 h-24 sm:w-48 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#BB7F5D]/30 bg-stone-100 shrink-0">
                <img
                  src={formSettings.heroImage}
                  alt="Prévia do Banner"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#FF751F] hover:bg-[#e06316] text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Fazer Upload do Computador/Celular</span>
                  </button>
                  <span className="text-[11px] text-[#BB7F5D]">PNG, JPG ou WEBP até 5MB</span>
                </div>

                <div>
                  <label className="block font-medium text-[#5A3825] mb-1 text-[11px]">
                    Ou informe a URL direta da imagem:
                  </label>
                  <input
                    type="url"
                    value={formSettings.heroImage}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, heroImage: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-[#FF751F] hover:bg-[#e06316] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações do Banner</span>
        </button>
      </div>

    </form>
  );
};
