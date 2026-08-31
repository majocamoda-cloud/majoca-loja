import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  User,
  MapPin,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerInfo, DeliveryMethod, PaymentMethod } from '../types';
import { generatePixQRCodeDataURL } from '../utils/pixPayload';

const SAVED_CUSTOMER_KEY = 'majoca_saved_customer_v1';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    placeOrder,
    settings,
    showToast,
  } = useStore();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('retirada_uba');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [copiedPixPayload, setCopiedPixPayload] = useState(false);
  const [pixQRCodeUrl, setPixQRCodeUrl] = useState<string>('');
  const [pixPayloadCode, setPixPayloadCode] = useState<string>('');
  const [showItemsSummary, setShowItemsSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      name: '',
      phone: '',
      email: '',
      cpf: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        complement: '',
        city: 'Ubá',
        state: 'MG',
        cep: '',
      },
      notes: '',
    };
  });

  // Save customer info locally when updated for faster future orders
  useEffect(() => {
    if (customer.name || customer.phone) {
      try {
        localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(customer));
      } catch {
        // ignore storage error
      }
    }
  }, [customer]);

  const deliveryFee = deliveryMethod === 'entrega_uba' ? 10.0 : 0;
  const total = cartSubtotal + deliveryFee;

  // Generate dynamic Pix QR Code whenever total or settings change (MUST BE BEFORE CONDITIONAL RETURN)
  useEffect(() => {
    if (paymentMethod === 'pix' && settings.pixKey && total > 0) {
      let isMounted = true;
      generatePixQRCodeDataURL({
        pixKey: settings.pixKey,
        merchantName: settings.pixHolderName || 'MAJOCA MODA',
        merchantCity: settings.addressCity ? settings.addressCity.split('-')[0].trim() : 'UBA',
        amount: total,
        txId: 'MJC' + Math.floor(1000 + Math.random() * 9000),
        description: 'Pedido Majoca Moda',
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
  }, [paymentMethod, settings.pixKey, settings.pixHolderName, settings.addressCity, total]);

  if (!isCheckoutOpen) return null;

  const totalItemsCount = cart.reduce((a, b) => a + (b.quantity || 1), 0);

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPixKey(true);
    showToast('Chave PIX copiada com sucesso!', 'success');
    setTimeout(() => setCopiedPixKey(false), 3000);
  };

  const handleCopyPixPayload = () => {
    if (pixPayloadCode) {
      navigator.clipboard.writeText(pixPayloadCode);
      setCopiedPixPayload(true);
      showToast('Código Pix Copia e Cola copiado com sucesso!', 'success');
      setTimeout(() => setCopiedPixPayload(false), 3000);
    } else {
      handleCopyPixKey();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    // Mask (XX) XXXXX-XXXX
    let formatted = val;
    if (val.length > 6) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    
    setCustomer({ ...customer, phone: formatted });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      showToast('Por favor, informe seu nome para o pedido.', 'error');
      return;
    }

    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Por favor, informe seu WhatsApp com DDD.', 'error');
      return;
    }

    if (deliveryMethod === 'entrega_uba') {
      if (!customer.address?.street?.trim() || !customer.address?.neighborhood?.trim()) {
        showToast('Por favor, informe a rua e bairro para a entrega em Ubá.', 'error');
        return;
      }
    }

    if (deliveryMethod === 'envio_calcular') {
      if (!customer.address?.city?.trim() || !customer.address?.state?.trim()) {
        showToast('Por favor, informe sua cidade e estado para o envio.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      placeOrder(customer, deliveryMethod, paymentMethod);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      
      <div
        id="checkout-modal-container"
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 duration-200 max-h-[96vh] flex flex-col"
      >
        {/* TOP BAR / HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-50/90 to-amber-50/90 border-b border-[#BB7F5D]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF751F] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#3D2518] leading-tight">
                Checkout Rápido • 1 Minuto
              </h2>
              <p className="text-[11px] text-[#BB7F5D] flex items-center gap-1">
                <span>Compra rápida e segura</span>
                <span>•</span>
                <span>{totalItemsCount} {totalItemsCount === 1 ? 'peça' : 'peças'}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-checkout"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-100/50 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* QUICK ITEMS ACCORDION (COLLAPSIBLE TO SAVE MOBILE SPACE) */}
          <div className="bg-orange-50/40 rounded-2xl border border-[#BB7F5D]/20 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowItemsSummary(!showItemsSummary)}
              className="w-full p-3 text-left flex items-center justify-between hover:bg-orange-50/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#3D2518]">
                  Resumo do Pedido ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'})
                </span>
                <span className="text-xs font-extrabold text-[#FF751F]">
                  {formatMoney(cartSubtotal)}
                </span>
              </div>
              <div className="text-[#BB7F5D] flex items-center gap-1 text-[11px]">
                <span>{showItemsSummary ? 'Ocultar' : 'Ver peças'}</span>
                {showItemsSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showItemsSummary && (
              <div className="p-3 pt-0 border-t border-[#BB7F5D]/15 divide-y divide-[#BB7F5D]/10 max-h-44 overflow-y-auto">
                {cart.map((item, idx) => {
                  const prodName = item.product?.name || 'Peça Majoca';
                  const prodImg = item.product?.images?.[0] || '/images/banner-hero.png';
                  const prodPrice = typeof item.product?.price === 'number' ? item.product.price : 0;
                  const itemTotal = prodPrice * (item.quantity || 1);

                  return (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-9 h-12 rounded-lg overflow-hidden border border-[#BB7F5D]/20 bg-white shrink-0"
                          style={{ aspectRatio: '3/4' }}
                        >
                          <img
                            src={prodImg}
                            alt={prodName}
                            style={{ objectFit: 'cover', width: '100%', height: '100%', aspectRatio: '3/4' }}
                            className="w-full h-full object-cover object-center aspect-[3/4] cart-item-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/banner-hero.png';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#3D2518] truncate">
                            {item.quantity || 1}x {prodName}
                          </div>
                          <div className="text-[10px] text-[#BB7F5D]">
                            Tam: <strong>{item.selectedSize || 'Único'}</strong>
                            {item.selectedColor && ` • Cor: ${item.selectedColor}`}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-[#FF751F] shrink-0">
                        {formatMoney(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 1. SEUS DADOS (APENAS 2 CAMPOS OBRIGATÓRIOS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xs sm:text-sm text-[#3D2518] flex items-center gap-1.5 uppercase tracking-wide">
                <User className="w-4 h-4 text-[#FF751F]" />
                <span>1. Quem está comprando</span>
              </h3>
              <span className="text-[10px] text-[#BB7F5D] bg-orange-50 px-2 py-0.5 rounded-full font-bold">
                Sem cadastro chato
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#5A3825] mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Nome e Sobrenome"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none shadow-2xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5A3825] mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={handlePhoneChange}
                  placeholder="(32) 99999-9999"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none shadow-2xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. ENTREGA OU RETIRADA */}
          <div className="space-y-2.5 pt-1">
            <h3 className="font-heading font-bold text-xs sm:text-sm text-[#3D2518] flex items-center gap-1.5 uppercase tracking-wide">
              <Truck className="w-4 h-4 text-[#FF751F]" />
              <span>2. Onde deseja receber</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Retirada em Ubá */}
              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryMethod === 'retirada_uba'
                    ? 'border-[#FF751F] bg-orange-50/60 shadow-2xs'
                    : 'border-[#BB7F5D]/20 bg-white hover:border-[#BB7F5D]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === 'retirada_uba'}
                    onChange={() => setDeliveryMethod('retirada_uba')}
                    className="accent-[#FF751F]"
                  />
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    GRÁTIS
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-[#3D2518]">Retirar no Showroom</div>
                  <div className="text-[10px] text-[#5A3825] mt-0.5">
                    Ubá/MG (Bairro Santa Rosa)
                  </div>
                </div>
              </label>

              {/* Motoboy Ubá */}
              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryMethod === 'entrega_uba'
                    ? 'border-[#FF751F] bg-orange-50/60 shadow-2xs'
                    : 'border-[#BB7F5D]/20 bg-white hover:border-[#BB7F5D]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === 'entrega_uba'}
                    onChange={() => setDeliveryMethod('entrega_uba')}
                    className="accent-[#FF751F]"
                  />
                  <span className="text-[9px] font-extrabold bg-orange-100 text-[#FF751F] px-1.5 py-0.5 rounded">
                    + R$ 10,00
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-[#3D2518]">Motoboy em Ubá</div>
                  <div className="text-[10px] text-[#5A3825] mt-0.5">
                    Direto na sua porta
                  </div>
                </div>
              </label>

              {/* Envio Brasil */}
              <label
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryMethod === 'envio_calcular'
                    ? 'border-[#FF751F] bg-orange-50/60 shadow-2xs'
                    : 'border-[#BB7F5D]/20 bg-white hover:border-[#BB7F5D]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === 'envio_calcular'}
                    onChange={() => setDeliveryMethod('envio_calcular')}
                    className="accent-[#FF751F]"
                  />
                  <span className="text-[9px] font-extrabold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                    Correios
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-[#3D2518]">Outras Cidades</div>
                  <div className="text-[10px] text-[#5A3825] mt-0.5">
                    Envio para todo Brasil
                  </div>
                </div>
              </label>
            </div>

            {/* Endereço Dinâmico Simplificado */}
            {deliveryMethod === 'retirada_uba' && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-[#5A3825] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF751F] shrink-0" />
                <span className="text-[11px]">
                  <strong>Endereço para retirada:</strong> Av. Elpidia da Silva Fagundes, 409 (Térreo), Bairro Santa Rosa - Ubá/MG.
                </span>
              </div>
            )}

            {deliveryMethod === 'entrega_uba' && (
              <div className="p-3.5 bg-orange-50/30 rounded-2xl border border-[#BB7F5D]/20 space-y-2 animate-in fade-in">
                <div className="text-[11px] font-bold text-[#3D2518] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF751F]" />
                  <span>Endereço de Entrega em Ubá:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Rua / Avenida *"
                      value={customer.address?.street}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, street: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nº *"
                      value={customer.address?.number}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, number: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Bairro em Ubá *"
                      value={customer.address?.neighborhood}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, neighborhood: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={customer.address?.complement || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, complement: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                </div>
              </div>
            )}

            {deliveryMethod === 'envio_calcular' && (
              <div className="p-3.5 bg-orange-50/30 rounded-2xl border border-[#BB7F5D]/20 space-y-2 animate-in fade-in">
                <div className="text-[11px] font-bold text-[#3D2518]">
                  Cidade para cálculo do frete Correios/Transportadora:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Sua Cidade *"
                      value={customer.address?.city || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="UF (Ex: MG) *"
                      maxLength={2}
                      value={customer.address?.state || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, state: e.target.value.toUpperCase() },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="CEP ou Bairro (opcional para cálculo)"
                      value={customer.address?.cep || ''}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address!, cep: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. FORMA DE PAGAMENTO */}
          <div className="space-y-2.5 pt-1">
            <h3 className="font-heading font-bold text-xs sm:text-sm text-[#3D2518] flex items-center gap-1.5 uppercase tracking-wide">
              <CreditCard className="w-4 h-4 text-[#FF751F]" />
              <span>3. Forma de Pagamento</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* PIX */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'pix'
                    ? 'border-[#FF751F] bg-orange-50/60 shadow-2xs'
                    : 'border-[#BB7F5D]/20 bg-white hover:border-[#BB7F5D]/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-[#3D2518] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#FF751F]" />
                    <span>PIX Instantâneo</span>
                  </span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="accent-[#FF751F]"
                  />
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1.5">
                  Aprovação imediata
                </div>
              </button>

              {/* CARTÃO TON */}
              <button
                type="button"
                onClick={() => setPaymentMethod('ton_cartao')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'ton_cartao'
                    ? 'border-[#FF751F] bg-orange-50/60 shadow-2xs'
                    : 'border-[#BB7F5D]/20 bg-white hover:border-[#BB7F5D]/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-[#3D2518] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#BB7F5D]" />
                    <span>Cartão de Crédito</span>
                  </span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'ton_cartao'}
                    onChange={() => setPaymentMethod('ton_cartao')}
                    className="accent-[#FF751F]"
                  />
                </div>
                <div className="text-[10px] text-[#5A3825] mt-1.5">
                  Link seguro TON no WhatsApp
                </div>
              </button>
            </div>

            {/* PIX BOX WITH AUTOMATIC QR CODE */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-gradient-to-b from-amber-50/80 to-orange-50/60 rounded-2xl border border-amber-300/80 text-xs space-y-3 animate-in fade-in">
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
                  {/* QR Code Container */}
                  <div className="shrink-0 flex flex-col items-center">
                    {pixQRCodeUrl ? (
                      <div className="p-2 bg-white rounded-xl border-2 border-[#FF751F]/40 shadow-xs">
                        <img
                          src={pixQRCodeUrl}
                          alt="QR Code Pix Majoca Moda"
                          className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-stone-100 rounded-xl flex items-center justify-center text-[10px] text-stone-400">
                        Gerando QR Code...
                      </div>
                    )}
                    <span className="text-[10px] font-extrabold text-[#FF751F] mt-1.5 uppercase tracking-wider">
                      Valor: {formatMoney(total)}
                    </span>
                  </div>

                  {/* Instructions & Quick Copy Buttons */}
                  <div className="flex-1 space-y-2 text-left w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3D2518] flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#FF751F]" />
                        <span>Pague via PIX Automático</span>
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Aprovação Imediata
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5A3825] leading-relaxed">
                      Escaneie o <strong>QR Code</strong> com o aplicativo do seu banco ou use o botão <strong>Pix Copia e Cola</strong> abaixo:
                    </p>

                    {/* Copia e Cola Payload Button */}
                    <button
                      type="button"
                      onClick={handleCopyPixPayload}
                      className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {copiedPixPayload ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedPixPayload ? 'Código Copiado com Sucesso!' : 'Copiar Código Pix (Copia e Cola)'}</span>
                    </button>

                    {/* Chave Direta */}
                    <div className="flex items-center justify-between bg-orange-50/80 p-2 rounded-xl border border-orange-200 text-[11px]">
                      <div>
                        <div className="text-[10px] text-[#BB7F5D] font-medium">Chave Celular:</div>
                        <div className="font-mono font-bold text-[#3D2518] select-all">{settings.pixKey}</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPixKey}
                        className="bg-white hover:bg-orange-100 text-[#5A3825] border border-[#BB7F5D]/30 px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedPixKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPixKey ? 'Copiado' : 'Copiar Chave'}</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-[#5A3825]">
                      Titular: <strong>{settings.pixHolderName}</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {paymentMethod === 'ton_cartao' && (
              <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-200 text-[11px] text-[#5A3825] leading-relaxed">
                Você receberá o link seguro da máquina <strong>TON</strong> direto no seu WhatsApp para pagar em até 12x com total segurança.
              </div>
            )}
          </div>

          {/* OBSERVAÇÕES OPCIONAIS */}
          <div>
            <input
              type="text"
              value={customer.notes || ''}
              onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
              placeholder="Alguma observação? Ex: embrulho para presente (opcional)"
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#BB7F5D]/25 text-[#3D2518] rounded-xl focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* TOTAL STICKY FOOTER */}
          <div className="pt-3 border-t border-[#BB7F5D]/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#5A3825]">
              <span>Subtotal: <strong>{formatMoney(cartSubtotal)}</strong></span>
              <span>Frete: <strong>{deliveryMethod === 'entrega_uba' ? formatMoney(deliveryFee) : 'Grátis / A calcular'}</strong></span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-sm text-[#3D2518]">Total do Pedido:</span>
              <span className="font-heading font-extrabold text-2xl text-[#FF751F]">
                {formatMoney(total)}
              </span>
            </div>

            <button
              id="btn-submit-order"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Finalizar Compra via WhatsApp</span>
            </button>

            <p className="text-[10px] text-center text-[#BB7F5D] flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF751F]" />
              <span>Seus dados ficam salvos no seu aparelho para a próxima compra.</span>
            </p>
          </div>

        </form>

      </div>

    </div>
  );
};
