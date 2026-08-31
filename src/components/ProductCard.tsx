import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product, ProductSize, sortSizesByOrder } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart, setIsCartOpen } = useStore();

  const totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0);
  const isOutOfStock = totalStock === 0;

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent, size: ProductSize) => {
    e.stopPropagation();
    addToCart(product, size, 1);
    setIsCartOpen(true);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-[#BB7F5D]/20 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* IMAGE CONTAINER (3:4 PORTRAIT LOCK) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 flex items-center justify-center">
        {product.images?.[0] ? (
          <>
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full h-full object-cover object-center transition-all duration-500 ${
                product.images[1] ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
              }`}
              loading="lazy"
            />

            {/* Secondary Image on Hover (Foto 2 / Conjunto completo) */}
            {product.images[1] && (
              <img
                src={product.images[1]}
                alt={`${product.name} - Conjunto`}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-orange-50/50 text-[#FF751F]">
            <ShoppingBag className="w-12 h-12 opacity-60 mb-2" />
            <span className="text-[11px] font-bold text-[#3D2518] text-center line-clamp-2 px-2">
              {product.name}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-[#FF751F] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
              Novo
            </span>
          )}
          {product.featured && !product.isNew && (
            <span className="bg-[#BB7F5D] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
              Destaque
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#BB7F5D] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Multi-photo indicator tag if more than 1 photo */}
        {product.images.filter(Boolean).length > 1 && (
          <div className="absolute top-2.5 right-2.5 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs z-10">
            {product.images.filter(Boolean).length} fotos
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-[#2B1B12]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
          <span className="bg-white text-[#3D2518] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#FF751F]" />
            Ver detalhes
          </span>
        </div>

        {/* Stock Alert */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-[#2B1B12]/70 flex items-center justify-center z-20">
            <span className="bg-white text-[#FF751F] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Esgotado
            </span>
          </div>
        ) : totalStock <= 3 ? (
          <div className="absolute bottom-2 left-2 bg-[#FF751F]/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs z-10">
            Últimas {totalStock} un.
          </div>
        ) : null}
      </div>

      {/* PRODUCT INFO */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between text-[11px] text-[#BB7F5D] font-semibold uppercase tracking-wider">
            <span>{product.categoryLabel}</span>
            <span className="text-[10px] text-[#BB7F5D]/70 font-mono">#{product.sku}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-heading font-semibold text-sm sm:text-base text-[#3D2518] line-clamp-2 mt-1 group-hover:text-[#FF751F] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* COLORS AVAILABLE SWATCHES */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-[#5A3825] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Cores disponíveis:</span>
              <span className="text-[10px] text-[#BB7F5D] lowercase">({product.colors.length} {product.colors.length === 1 ? 'opção' : 'opções'})</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {product.colors.map((color, cIdx) => (
                <div
                  key={cIdx}
                  title={`Cor: ${color.name}`}
                  className="group/color relative"
                >
                  <span
                    className="block w-4 h-4 rounded-full border border-[#BB7F5D]/30 shadow-2xs cursor-pointer hover:scale-125 transition-transform"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/color:block z-30 bg-[#3D2518] text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIZES AVAILABLE BUBBLES */}
        <div>
          <div className="text-[10px] font-semibold text-[#5A3825] uppercase tracking-wider mb-1">
            Tamanhos disponíveis:
          </div>
          <div className="flex flex-wrap gap-1">
            {sortSizesByOrder(product.sizes || []).map((s) => (
              <button
                key={s.size}
                disabled={s.stock === 0}
                onClick={(e) => handleQuickAdd(e, s.size)}
                title={s.stock === 0 ? 'Tamanho esgotado' : `Clique para adicionar Tam: ${s.size} (${s.stock} em estoque)`}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                  s.stock === 0
                    ? 'border-stone-200 text-stone-300 bg-stone-50 line-through cursor-not-allowed'
                    : 'border-[#BB7F5D]/30 text-[#3D2518] bg-white hover:border-[#FF751F] hover:bg-orange-50 hover:text-[#FF751F]'
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* PRICING & ACTION */}
        <div className="pt-2 border-t border-[#BB7F5D]/15 flex items-center justify-between">
          <div>
            {product.originalPrice && (
              <span className="text-[11px] text-[#BB7F5D]/70 line-through mr-1.5">
                {formatMoney(product.originalPrice)}
              </span>
            )}
            <div className="font-heading font-bold text-base sm:text-lg text-[#FF751F] leading-none">
              {formatMoney(product.price)}
            </div>
            <div className="text-[10px] text-[#5A3825] mt-0.5">
              ou PIX / Cartão
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="p-2 rounded-xl bg-orange-50 hover:bg-[#FF751F] text-[#FF751F] hover:text-white transition-colors cursor-pointer"
            title="Escolher tamanho e comprar"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
