import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  X,
  MessageCircle,
  Copy,
  Check,
  Truck,
  CreditCard,
  QrCode,
  Download,
  FileText,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generatePixQRCodeDataURL } from '../utils/pixPayload';
import { exportOrderReceiptPDF } from '../utils/pdfGenerator';

export const OrderConfirmationModal: React.FC = () => {
  const { lastCreatedOrder, setLastCreatedOrder, settings, showToast } = useStore();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [pixQRCodeUrl, setPixQRCodeUrl] = useState<string>('');
  const [pixPayloadCode, setPixPayloadCode] = useState<string>('');

  useEffect(() => {
    if (lastCreatedOrder && lastCreatedOrder.paymentMethod === 'pix' && settings.pixKey) {
      let isMounted = true;
      generatePixQRCodeDataURL({
        pixKey: settings.pixKey,
        merchantName: settings.pixHolderName || 'MAJOCA MODA',
        merchantCity: settings.addressCity ? settings.addressCity.split('-')[0].trim() : 'UBA',
        amount: lastCreatedOrder.total,
        txId: lastCreatedOrder.orderNumber.replace(/[^A-Z0-9]/gi, '').slice(-15) || 'PEDIDO',
        description: `Pedido ${lastCreatedOrder.orderNumber}`,
      }).then(({ qrCodeDataUrl, pixCopiaECola }) => {
        if (isMounted) {
          setPixQRCodeUrl(qrCodeDataUrl);
          setPixPayloadCode(pixCopiaECola);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [lastCreatedOrder, settings]);

  if (!lastCreatedOrder) return null;

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCopyPixKey = () => {
    if (lastCreatedOrder.pixKey || settings.pixKey) {
      navigator.clipboard.writeText(lastCreatedOrder.pixKey || settings.pixKey);
      setCopiedKey(true);
      showToast('Chave Pix copiada!', 'success');
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  const handleCopyPixPayload = () => {
    if (pixPayloadCode) {
      navigator.clipboard.writeText(pixPayloadCode);
      setCopiedPayload(true);
      showToast('Código Pix Copia e Cola copiado!', 'success');
      setTimeout(() => setCopiedPayload(false), 3000);
    } else {
      handleCopyPixKey();
    }
  };

  const handleDownloadPDF = () => {
    exportOrderReceiptPDF(lastCreatedOrder, settings);
    showToast('Comprovante em PDF baixado com sucesso!', 'success');
  };

  const handleSendToWhatsApp = () => {
    const rawNumber = settings.whatsappNumber.replace(/\D/g, '');
    const itemsList = lastCreatedOrder.items
      .map((it) => {
        const colorPart = it.selectedColor ? ` | Cor: ${it.selectedColor}` : '';
        return `• ${it.quantity}x ${it.product.name} (Tam: ${it.selectedSize}${colorPart}) - ${formatMoney(
          it.product.price * it.quantity
        )}`;
      })
      .join('\n');

    const message = encodeURIComponent(
      `Olá Majoca Moda! Acabei de fazer o pedido ${lastCreatedOrder.orderNumber}:\n\n` +
      `*Cliente:* ${lastCreatedOrder.customer.name}\n` +
      `*Telefone:* ${lastCreatedOrder.customer.phone}\n` +
      `*Entrega:* ${lastCreatedOrder.deliveryEstimate}\n` +
      `*Forma de Pagamento:* ${lastCreatedOrder.paymentMethod === 'pix' ? 'PIX' : 'Cartão TON'}\n` +
      `*Status:* ${lastCreatedOrder.status}\n\n` +
      `*Itens do Pedido:*\n${itemsList}\n\n` +
      `*Total:* ${formatMoney(lastCreatedOrder.total)}\n\n` +
      `Gostaria de dar andamento no meu atendimento! Obrigado(a)!`
    );

    window.open(`https://wa.me/55${rawNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in">
      <div
        id="order-confirmation-modal"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 duration-200"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setLastCreatedOrder(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER SUCCESS */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-orange-50/80 to-white text-center border-b border-[#BB7F5D]/15">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <span className="text-xs font-bold text-[#FF751F] uppercase tracking-wider">
            Pedido Recebido com Sucesso!
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3D2518] mt-1">
            {lastCreatedOrder.orderNumber}
          </h2>
          <p className="text-xs sm:text-sm text-[#5A3825] mt-1">
            Obrigado pela preferência, <strong>{lastCreatedOrder.customer.name}</strong>!
          </p>

          {/* STATUS PILL */}
          <div className="mt-3 inline-flex items-center gap-2 bg-[#BB7F5D] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Status: {lastCreatedOrder.status}</span>
          </div>
        </div>

        {/* BODY DETAILS */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* PAYMENT INSTRUCTIONS */}
          {lastCreatedOrder.paymentMethod === 'pix' ? (
            <div className="p-4 bg-gradient-to-b from-amber-50/80 to-orange-50/60 rounded-2xl border border-amber-300/80 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#3D2518]">
                  <QrCode className="w-4 h-4 text-[#FF751F]" />
                  <span>Pague via PIX para Confirmar:</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  Aprovação Automática
                </span>
              </div>

              {/* QR Code and Actions */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
                {pixQRCodeUrl && (
                  <div className="shrink-0 flex flex-col items-center">
                    <img
                      src={pixQRCodeUrl}
                      alt="QR Code Pix do Pedido"
                      className="w-28 h-28 object-contain rounded-lg border border-[#BB7F5D]/20 shadow-xs"
                    />
                    <span className="text-[10px] font-bold text-[#FF751F] mt-1">
                      {formatMoney(lastCreatedOrder.total)}
                    </span>
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <p className="text-[11px] text-[#5A3825]">
                    Escaneie o QR Code no seu banco ou use o botão <strong>Pix Copia e Cola</strong>:
                  </p>

                  <button
                    onClick={handleCopyPixPayload}
                    className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPayload ? 'Código Copiado com Sucesso!' : 'Copiar Código Pix (Copia e Cola)'}</span>
                  </button>

                  <div className="flex items-center justify-between bg-orange-50/70 p-2 rounded-xl border border-orange-200 text-[11px]">
                    <div>
                      <div className="text-[10px] text-[#BB7F5D]">Chave Celular:</div>
                      <div className="font-mono font-bold text-[#3D2518] select-all">
                        {lastCreatedOrder.pixKey || settings.pixKey}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyPixKey}
                      className="bg-white hover:bg-orange-100 text-[#5A3825] border border-[#BB7F5D]/30 px-2 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Copiado' : 'Copiar Chave'}</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-[#5A3825]">
                    Favorecido: <strong>{settings.pixHolderName}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-[#BB7F5D]/20 text-xs space-y-2 text-[#5A3825]">
              <div className="flex items-center gap-2 font-bold text-[#FF751F]">
                <CreditCard className="w-4 h-4" />
                <span>Link de Pagamento TON:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Nossa equipe enviará o link da plataforma <strong>TON</strong> para o seu WhatsApp cadastrado ({lastCreatedOrder.customer.phone}) para parcelamento e aprovação rápida.
              </p>
            </div>
          )}

          {/* DELIVERY & ADDRESS */}
          <div className="bg-orange-50/20 p-4 rounded-2xl border border-[#BB7F5D]/20 text-xs space-y-2">
            <div className="font-bold text-[#3D2518] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#BB7F5D]" />
              <span>Modalidade de Entrega:</span>
            </div>
            <p className="text-[#5A3825]">{lastCreatedOrder.deliveryEstimate}</p>
            {lastCreatedOrder.customer.address?.street && (
              <p className="text-[#BB7F5D] text-[11px]">
                Endereço: {lastCreatedOrder.customer.address.street}, {lastCreatedOrder.customer.address.number} - {lastCreatedOrder.customer.address.neighborhood} ({lastCreatedOrder.customer.address.city}/{lastCreatedOrder.customer.address.state})
              </p>
            )}
          </div>

          {/* ORDER ITEMS LIST */}
          <div className="space-y-2">
            <div className="font-bold text-xs text-[#3D2518] uppercase tracking-wider">
              Peças Selecionadas:
            </div>
            <div className="divide-y divide-[#BB7F5D]/10 border border-[#BB7F5D]/20 rounded-2xl p-3 bg-white">
              {lastCreatedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-10 h-13 rounded-lg object-cover object-center bg-stone-100 border border-[#BB7F5D]/20 shrink-0 aspect-[3/4]"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[#3D2518] truncate block">{item.quantity}x {item.product.name}</span>
                      <div className="text-[#5A3825] text-[11px] flex items-center gap-2">
                        <span>Tamanho: <strong>{item.selectedSize}</strong></span>
                        {item.selectedColor && (
                          <span>• Cor: <strong>{item.selectedColor}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-[#FF751F] shrink-0">
                    {formatMoney(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold text-sm text-[#3D2518]">
                <span>Total do Pedido:</span>
                <span className="text-[#FF751F] font-heading text-base">
                  {formatMoney(lastCreatedOrder.total)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-orange-50/30 border-t border-[#BB7F5D]/20 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSendToWhatsApp}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="bg-[#BB7F5D] hover:bg-[#a66e4d] text-white py-3.5 px-5 rounded-full font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Baixar comprovante de pedido em formato PDF"
          >
            <Download className="w-4 h-4" />
            <span>Salvar PDF</span>
          </button>

          <button
            onClick={() => setLastCreatedOrder(null)}
            className="bg-white hover:bg-orange-50 text-[#3D2518] border border-[#BB7F5D]/30 py-3.5 px-6 rounded-full font-bold text-sm transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
