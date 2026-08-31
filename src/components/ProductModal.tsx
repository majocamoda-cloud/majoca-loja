import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Truck,
  MapPin,
  Ruler,
  MessageCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Tag,
  SunMedium,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductSize, sortSizesByOrder } from '../types';

const PHOTO_SLOT_LABELS = [
  'Foto 1: Capa',
  'Foto 2: Conjunto',
  'Foto 3: Acessórios',
  'Foto 4: Detalhes',
];

export const ProductModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    setIsCartOpen,
    setIsSizeGuideOpen,
    settings,
  } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Sync state when selected product opens
  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIdx(0);
      setSelectedSize(null);
      setSelectedColor(
        selectedProduct.colors && selectedProduct.colors.length > 0
          ? selectedProduct.colors[0].name
          : null
      );
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const chosenSizeStock = selectedProduct.sizes.find((s) => s.size === selectedSize);
  const currentStock = chosenSizeStock ? chosenSizeStock.stock : 0;
  const isSelectedSizeOutOfStock = selectedSize !== null && currentStock === 0;

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Por favor, selecione um tamanho antes de adicionar à sacola.');
      return;
    }
    if (currentStock === 0) {
      alert('Este tamanho está esgotado no momento.');
      return;
    }

    addToCart(selectedProduct, selectedSize, quantity, selectedColor || undefined);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleWhatsAppInquiry = () => {
    const rawNumber = settings.whatsappNumber.replace(/\D/g, '');
    const sizeText = selectedSize ? ` no tamanho ${selectedSize}` : '';
    const colorText = selectedColor ? ` na cor ${selectedColor}` : '';
    const message = encodeURIComponent(
      `Olá Majoca Moda! Tenho interesse na peça "${selectedProduct.name}" (Ref: ${selectedProduct.sku})${sizeText}${colorText}. Poderiam me atender?`
    );
    window.open(`https://wa.me/55${rawNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in">
      
      {/* MODAL BOX */}
      <div
        id="product-detail-modal"
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* CLOSE BUTTON */}
        <button
          id="btn-close-product-modal"
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-[#3D2518] hover:text-[#FF751F] transition-colors"
          aria-label="Fechar detalhes do produto"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: IMAGES GALLERY (3:4 PORTRAIT LOCK) */}
        <div className="md:w-1/2 bg-orange-50/30 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#BB7F5D]/20 overflow-y-auto">
          <div>
            {/* Main Large Image (3:4 Aspect Ratio) */}
            <div className="relative aspect-[3/4] w-full max-h-[460px] rounded-2xl overflow-hidden bg-stone-100 shadow-inner border border-[#BB7F5D]/10 mx-auto flex items-center justify-center">
              {selectedProduct.images?.[activeImageIdx] || selectedProduct.images?.[0] ? (
                <img
                  src={selectedProduct.images[activeImageIdx] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-orange-50/50 text-[#FF751F]">
                  <ShoppingBag className="w-16 h-16 opacity-50 mb-3" />
                  <span className="text-sm font-bold text-[#3D2518] text-center">
                    {selectedProduct.name}
                  </span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {selectedProduct.isNew && (
                  <span className="bg-[#FF751F] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    Novidade
                  </span>
                )}
                <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {PHOTO_SLOT_LABELS[activeImageIdx] || `Foto ${activeImageIdx + 1}`}
                </span>
              </div>

              {/* Navigation Chevrons if multiple photos */}
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : selectedProduct.images.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#3D2518] shadow-md flex items-center justify-center transition-all cursor-pointer z-10"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev < selectedProduct.images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#3D2518] shadow-md flex items-center justify-center transition-all cursor-pointer z-10"
                    title="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* 4-Slots Miniatures Grid (3:4 ratio thumbnails) */}
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-bold text-[#5A3825] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Galeria de Fotos ({selectedProduct.images.length} {selectedProduct.images.length === 1 ? 'foto' : 'fotos'}):</span>
                  <span className="text-[#BB7F5D] lowercase text-[10px]">proporção 3:4</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col justify-end p-1 text-left ${
                        activeImageIdx === idx
                          ? 'border-[#FF751F] shadow-sm ring-2 ring-[#FF751F]/30 scale-102'
                          : 'border-[#BB7F5D]/20 opacity-75 hover:opacity-100 hover:border-[#BB7F5D]'
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover object-center" />
                      <div className="relative z-10 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1 py-0.5 rounded text-center truncate">
                        {idx === 0 ? 'Capa' : idx === 1 ? 'Conjunto' : idx === 2 ? 'Acessórios' : 'Detalhes'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#BB7F5D]/10 text-center">
            <span className="text-[11px] text-[#5A3825]">
              ✨ Dica: Clique nas miniaturas para ver o conjunto completo e detalhes do tecido.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO & PURCHASE FLOW */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between text-xs text-[#BB7F5D] font-bold uppercase tracking-wider">
              <span>{selectedProduct.categoryLabel}</span>
              <span className="text-[#BB7F5D]/70 font-mono">Ref: {selectedProduct.sku}</span>
            </div>

            <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#3D2518] mt-1 leading-snug">
              {selectedProduct.name}
            </h2>

            {/* Pricing */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#FF751F]">
                {formatMoney(selectedProduct.price)}
              </span>
              {selectedProduct.originalPrice && (
                <span className="text-sm sm:text-base text-[#BB7F5D]/70 line-through">
                  {formatMoney(selectedProduct.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A3825] mt-1">
              Pague via <strong>PIX</strong> com confirmação imediata ou <strong>Cartão TON</strong> com link seguro.
            </p>

            {/* COLOR SELECTOR */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#3D2518] uppercase tracking-wider">
                    Variações de Cor:
                  </span>
                  {selectedColor && (
                    <span className="text-xs text-[#FF751F] font-bold">
                      Cor: {selectedColor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedProduct.colors.map((c, idx) => {
                    const isColorSelected = selectedColor === c.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isColorSelected
                            ? 'border-[#FF751F] bg-orange-50 text-[#3D2518] ring-2 ring-[#FF751F]/30 shadow-xs'
                            : 'border-[#BB7F5D]/30 bg-white text-[#5A3825] hover:border-[#FF751F]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border border-stone-300 shrink-0 shadow-2xs transition-transform ${
                            isColorSelected ? 'scale-110' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#3D2518] uppercase tracking-wider">
                  Selecione o Tamanho:
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-[#BB7F5D] hover:text-[#FF751F] font-semibold flex items-center gap-1 underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Guia de Medidas
                </button>
              </div>

              {/* Optional Size / Fit Recommendation */}
              {selectedProduct.sizeRecommendation && (
                <div className="mb-2.5 px-3 py-1.5 bg-orange-50 rounded-xl border border-[#FF751F]/30 text-xs text-[#5A3825] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#FF751F] shrink-0" />
                  <span>
                    <strong>Dica de Vestimenta:</strong> {selectedProduct.sizeRecommendation}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2">
                {sortSizesByOrder(selectedProduct.sizes || []).map((s) => {
                  const isOut = s.stock === 0;
                  const isSelected = selectedSize === s.size;

                  return (
                    <button
                      key={s.size}
                      disabled={isOut}
                      onClick={() => setSelectedSize(s.size)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all relative cursor-pointer ${
                        isOut
                          ? 'border-stone-200 text-stone-300 bg-stone-50 line-through cursor-not-allowed'
                          : isSelected
                          ? 'border-[#FF751F] bg-[#FF751F] text-white shadow-sm'
                          : 'border-[#BB7F5D]/30 text-[#3D2518] bg-white hover:border-[#FF751F] hover:bg-orange-50'
                      }`}
                    >
                      {s.size}
                      {s.stock > 0 && s.stock <= 2 && (
                        <span className="block text-[8px] font-normal opacity-90">
                          {s.stock} un
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic stock indicator message */}
              {selectedSize && (
                <div className="mt-2 text-xs">
                  {isSelectedSizeOutOfStock ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Tamanho {selectedSize} esgotado no momento.
                    </span>
                  ) : currentStock <= 3 ? (
                    <span className="text-amber-600 font-semibold">
                      Restam apenas {currentStock} unidades no tamanho {selectedSize}!
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      Tamanho {selectedSize} disponível para envio imediato ({currentStock} peças).
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* QUANTITY SELECTOR */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-bold text-[#3D2518] uppercase tracking-wider">
                Quantidade:
              </span>
              <div className="flex items-center border border-[#BB7F5D]/30 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-[#3D2518] hover:bg-orange-50 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-[#3D2518]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock || 10, q + 1))}
                  className="px-3 py-1.5 text-[#3D2518] hover:bg-orange-50 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* DESCRIPTION, COMPOSITION, SEASON & ACCESSORIES DISCLAIMER */}
            <div className="mt-6 pt-4 border-t border-[#BB7F5D]/15 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#3D2518] uppercase tracking-wider mb-1">
                  Descrição da Peça:
                </h4>
                <p className="text-xs sm:text-sm text-[#5A3825] leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5A3825]">
                {selectedProduct.season && (
                  <div className="flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5 text-[#FF751F]" />
                    <strong>Estação/Coleção:</strong> {selectedProduct.season}
                  </div>
                )}
                <div>
                  <strong>Composição:</strong> {selectedProduct.composition}
                </div>
                {selectedProduct.weight && (
                  <div>
                    <strong>Peso Estimado:</strong> {selectedProduct.weight}
                  </div>
                )}
              </div>

              {/* ACCESSORIES AUTOMATIC DISCLAIMER NOTICE */}
              <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200/80 text-xs text-[#5A3825] flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Atenção:</strong> Os acessórios presentes nas fotos são meramente ilustrativos e não acompanham o produto, exceto quando especificado no título.
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2.5 pt-4 border-t border-[#BB7F5D]/20">
            <button
              id="modal-btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={isSelectedSizeOutOfStock}
              className="w-full bg-[#FF751F] hover:bg-[#e06316] disabled:bg-stone-300 text-white py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Adicionar à Sacola</span>
            </button>

            <button
              id="modal-btn-whatsapp-inquiry"
              onClick={handleWhatsAppInquiry}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Dúvidas? Chamar no WhatsApp</span>
            </button>

            {/* Delivery highlights */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#5A3825]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#BB7F5D] shrink-0" />
                <span>Retirada grátis em Ubá/MG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#FF751F] shrink-0" />
                <span>Entrega local ou Envio</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
