import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppFloating: React.FC = () => {
  const { settings } = useStore();
  const [showBubble, setShowBubble] = useState(true);

  const rawNumber = settings.whatsappNumber.replace(/\D/g, '');

  const handleOpenWhatsApp = () => {
    const defaultMsg = encodeURIComponent(
      'Olá Majoca Moda! Estou navegando no catálogo e gostaria de tirar uma dúvida sobre as peças.'
    );
    window.open(`https://wa.me/55${rawNumber}?text=${defaultMsg}`, '_blank');
  };

  return (
    <div id="whatsapp-floating-container" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Help bubble tooltip */}
      {showBubble && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-[#3D2518] text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-[#BB7F5D]/20 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">
            Atendimento Online no WhatsApp!
          </span>
          <button
            onClick={() => setShowBubble(false)}
            className="text-[#BB7F5D] hover:text-[#FF751F] ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main floating button */}
      <button
        id="btn-whatsapp-floating"
        onClick={handleOpenWhatsApp}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer group"
        aria-label="Falar no WhatsApp com a Majoca Moda"
        title={`WhatsApp Majoca Moda: ${settings.whatsappNumber}`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="sr-only">WhatsApp {settings.whatsappNumber}</span>
      </button>
    </div>
  );
};
