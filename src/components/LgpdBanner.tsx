import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const COOKIE_STORAGE_KEY = 'majoca_cookie_consent';

export const LgpdBanner: React.FC = () => {
  const { openInstitutionalModal, acceptLgpd, lgpdAccepted } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY) || localStorage.getItem('majoca_lgpd_accepted_v1');
      if (stored !== 'true' && !lgpdAccepted) {
        // Small delay for smooth entry on page load
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, [lgpdAccepted]);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'true');
      localStorage.setItem('majoca_lgpd_accepted_v1', 'true');
    } catch (err) {
      console.error(err);
    }
    acceptLgpd();
    setIsVisible(false);
  };

  if (!isVisible || lgpdAccepted) return null;

  return (
    <aside
      id="lgpd-cookie-banner"
      aria-label="Aviso de Cookies e Privacidade LGPD"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 bg-[#2B1B12] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-[#BB7F5D]/30 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#FF751F] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF751F]" />
              <span>Privacidade & Cookies</span>
            </h4>
            <button
              onClick={handleAccept}
              className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Utilizamos cookies e tecnologias para melhorar sua navegação, salvar preferências do carrinho e personalizar sua experiência em conformidade com a LGPD. Saiba mais na nossa{' '}
            <button
              onClick={() => openInstitutionalModal('privacidade', 'Política de Privacidade & Cookies')}
              className="text-[#FF751F] underline font-bold hover:text-orange-300 transition-colors"
            >
              Política de Privacidade
            </button>.
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              onClick={() => openInstitutionalModal('privacidade', 'Política de Privacidade & Cookies')}
              className="text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Detalhes
            </button>
            <button
              id="btn-accept-lgpd"
              onClick={handleAccept}
              className="bg-[#FF751F] hover:bg-[#e06316] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Aceitar Cookies
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
