import React, { useState } from 'react';
import { X, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { faqList } from '../data/initialData';

export const InstitutionalModal: React.FC = () => {
  const { institutionalModal, closeInstitutionalModal, settings } = useStore();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  if (!institutionalModal.isOpen) return null;

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  const renderContent = () => {
    switch (institutionalModal.slug) {
      case 'sobre':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-[#5A3825] leading-relaxed">
            <div className="p-4 bg-orange-50/70 rounded-2xl border border-[#BB7F5D]/20">
              <h3 className="font-heading font-bold text-base text-[#3D2518] mb-1">
                Majoca — Moda infanto-juvenil com conforto e qualidade desde 2024.
              </h3>
              <p className="text-xs text-[#BB7F5D]">
                De Ubá/MG para todo o Brasil.
              </p>
            </div>
            <p>
              A <strong>Majoca Moda</strong> nasceu em 2024 com a missão de vestir cada fase da infância e da juventude com peças que unem alta durabilidade, toque macio e estilo genuíno. Do tamanho RN (recém-nascido) até o tamanho 18 juvenil, acompanhamos o crescimento de bebês, crianças e adolescentes com carinho e respeito.
            </p>
            <p>
              Nossa loja física está localizada no endereço <strong>{settings.addressFull}</strong>, onde oferecemos um ambiente acolhedor para famílias de Ubá e região. Pelo nosso catálogo interativo, levamos nossa curadoria para mamães, papais e jovens em qualquer lugar do Brasil.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-orange-50/30 rounded-xl border border-[#BB7F5D]/20">
                <div className="font-bold text-[#3D2518] mb-1">Nossos Valores:</div>
                <ul className="text-xs text-[#5A3825] space-y-1 list-disc list-inside">
                  <li>Tecidos que respeitam a pele infantil;</li>
                  <li>Preço justo e transparente;</li>
                  <li>Atendimento humanizado e carinhoso.</li>
                </ul>
              </div>
              <div className="p-3 bg-orange-50/30 rounded-xl border border-[#BB7F5D]/20">
                <div className="font-bold text-[#3D2518] mb-1">Dados da Empresa:</div>
                <div className="text-xs text-[#5A3825] space-y-0.5">
                  <div><strong>CNPJ:</strong> {settings.cnpj}</div>
                  <div><strong>WhatsApp:</strong> {settings.whatsappNumber}</div>
                  <div><strong>E-mail:</strong> {settings.contactEmail}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacidade':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-[#5A3825] leading-relaxed">
            <p>
              A <strong>Majoca Moda</strong> (CNPJ: {settings.cnpj}) valoriza a sua privacidade e a proteção dos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
            </p>
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-[#3D2518]">1. Coleta de Informações</h4>
              <p>
                Coletamos apenas as informações estritamente necessárias para o processamento de pedidos, faturamento e entrega (Nome, Telefone/WhatsApp, E-mail e Endereço de entrega).
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-[#3D2518]">2. Uso de Cookies</h4>
              <p>
                Utilizamos cookies estritamente necessários para manter os itens da sua sacola de compras e lembrar preferências de navegação.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-[#3D2518]">3. Segurança e Pagamentos</h4>
              <p>
                Os pagamentos são processados com total segurança através do PIX direto e da plataforma de pagamentos TON.
              </p>
            </div>
          </div>
        );

      case 'trocas':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-[#5A3825] leading-relaxed">
            <p>
              Queremos que sua experiência com a Majoca Moda seja impecável. Nossa política de trocas segue o Código de Defesa do Consumidor:
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold">Prazo para Troca ou Devolução:</div>
              <p>Até <strong>7 (sete) dias corridos</strong> após a retirada na loja ou recebimento no endereço informado.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-[#3D2518]">Condições das Peças:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>A peça deve estar sem indícios de uso ou lavagem;</li>
                <li>Etiquetas originais devidamente fixadas;</li>
                <li>Acompanhada do comprovante ou número do pedido.</li>
              </ul>
            </div>
            <p className="text-xs text-[#5A3825]">
              Para solicitar a troca, envie uma mensagem no nosso WhatsApp oficial <strong>{settings.whatsappNumber}</strong> com o número do seu pedido.
            </p>
          </div>
        );

      case 'termos':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-[#5A3825] leading-relaxed">
            <h4 className="font-heading font-bold text-[#3D2518]">Termos e Condições de Compra</h4>
            <p>
              Ao realizar um pedido na Majoca Moda, o cliente concorda com os preços, prazos e condições de entrega estipulados no momento da finalização da compra.
            </p>
            <p>
              As imagens dos produtos buscam reproduzir com a máxima fidelidade as tonalidades reais das peças. Pequenas variações de tonalidade podem ocorrer em função da calibração de cada tela.
            </p>
            <p>
              A reserva das peças no estoque é confirmada mediante a emissão do pedido e confirmação do pagamento via PIX ou link de pagamento TON.
            </p>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3">
            <p className="text-xs text-[#5A3825] mb-3">
              Tire suas principais dúvidas sobre compras, prazos, formas de pagamento e retiradas na Majoca Moda:
            </p>
            {faqList.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#BB7F5D]/20 rounded-2xl overflow-hidden bg-white shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-3.5 text-left text-xs sm:text-sm font-bold text-[#3D2518] hover:bg-orange-50/50 flex items-center justify-between gap-2"
                >
                  <span>{faq.q}</span>
                  {openFaqIdx === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#FF751F] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#BB7F5D] shrink-0" />
                  )}
                </button>
                {openFaqIdx === idx && (
                  <div className="p-3.5 pt-0 text-xs text-[#5A3825] leading-relaxed border-t border-[#BB7F5D]/10 bg-orange-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className="text-xs text-[#5A3825]">
            Entre em contato com nossa equipe pelo WhatsApp {settings.whatsappNumber} ou e-mail {settings.contactEmail} para mais detalhes.
          </p>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in">
      <div
        id="institutional-modal-container"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-orange-50/30 border-b border-[#BB7F5D]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF751F] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-[#3D2518]">
                {institutionalModal.title}
              </h2>
              <p className="text-xs text-[#BB7F5D]">Majoca Moda • Transparência e Qualidade</p>
            </div>
          </div>

          <button
            onClick={closeInstitutionalModal}
            className="p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {renderContent()}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-orange-50/30 border-t border-[#BB7F5D]/20 text-center">
          <button
            onClick={closeInstitutionalModal}
            className="bg-[#FF751F] hover:bg-[#e06316] text-white px-8 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
