import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const {
    settings,
    openInstitutionalModal,
    setIsSizeGuideOpen,
    setIsAdminOpen,
    isAdminLoggedIn,
    showToast,
  } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Por favor, informe um e-mail válido.', 'error');
      return;
    }
    setNewsletterSubscribed(true);
    showToast('Obrigado! Seu e-mail foi cadastrado para receber novidades.', 'success');
  };

  return (
    <footer id="site-footer" className="bg-[#BB7F5D] text-white pt-14 pb-8 border-t border-[#BB7F5D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MAIN FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/20">
          
          {/* 1. BRAND LOGOMARK (Sem repetições do nome) */}
          <div className="space-y-4">
            <div className="inline-block">
              <BrandLogo className="h-12 px-4 shadow-sm" />
            </div>

            <p className="text-xs text-white/90 leading-relaxed">
              Peças selecionadas com carinho para vestir bebês, crianças e adolescentes do RN ao 18 anos.
            </p>

            <div className="text-xs text-white/90 space-y-1 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white shrink-0" />
                <span className="font-semibold">Ubá, Minas Gerais</span>
              </div>
              <div className="text-[11px] text-white/80 pl-6">
                Av. Elpidia da Silva Fagundes, 409, Térreo, Santa Edwiges
              </div>
            </div>
          </div>

          {/* 2. LINKS INSTITUCIONAIS */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs text-white/90">
              <li>
                <button
                  onClick={() => openInstitutionalModal('sobre', 'Sobre a Majoca Moda')}
                  className="hover:text-orange-200 transition-colors text-left"
                >
                  Sobre a Loja
                </button>
              </li>
              <li>
                <button
                  onClick={() => openInstitutionalModal('privacidade', 'Política de Privacidade & LGPD')}
                  className="hover:text-orange-200 transition-colors text-left"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => openInstitutionalModal('trocas', 'Política de Trocas e Devoluções')}
                  className="hover:text-orange-200 transition-colors text-left"
                >
                  Política de Trocas e Devoluções
                </button>
              </li>
              <li>
                <button
                  onClick={() => openInstitutionalModal('termos', 'Termos e Condições')}
                  className="hover:text-orange-200 transition-colors text-left"
                >
                  Termos e Condições
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="hover:text-orange-200 transition-colors text-left font-medium"
                >
                  Tabela de Medidas (0 ao 18 anos)
                </button>
              </li>
              <li>
                <button
                  onClick={() => openInstitutionalModal('faq', 'Perguntas Frequentes')}
                  className="hover:text-orange-200 transition-colors text-left"
                >
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* 3. ATENDIMENTO */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Atendimento
            </h4>
            <div className="space-y-2.5 text-xs text-white/90">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">{settings.scheduleWeek}</div>
                  <div className="text-white font-semibold">{settings.scheduleSaturday}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:underline transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a
                  href={`https://wa.me/55${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white font-bold hover:underline"
                >
                  WhatsApp: {settings.whatsappNumber}
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAdminLoggedIn ? 'Painel do Lojista (Conectado)' : 'Área do Lojista'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. NEWSLETTER */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Novidades por E-mail
            </h4>
            <p className="text-xs text-white/90 leading-relaxed">
              Cadastre seu e-mail para acompanhar lançamentos e reposições para todas as idades.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3 bg-white/20 border border-white/40 text-white rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Obrigado! Seu e-mail está cadastrado.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Seu e-mail..."
                    className="w-full px-3.5 py-2.5 bg-white/15 border border-white/30 text-xs text-white placeholder:text-white/60 rounded-xl focus:outline-none focus:bg-white/25"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#FF751F] hover:bg-[#e06316] text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Cadastrar"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* BOTTOM LEGAL SINGLE-LINE BAR (Sem repetições ou hífens desnecessários) */}
        <div className="pt-6 text-center text-xs text-white/80">
          <p>
            Copyright © 2026 Majoca Moda • CNPJ: 66.570.851/0001-88 • Av. Elpidia da Silva Fagundes, 409, Térreo, Santa Edwiges, Ubá/MG
          </p>
        </div>

      </div>
    </footer>
  );
};
