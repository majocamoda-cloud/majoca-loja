import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    setIsCheckoutOpen,
  } = useStore();

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#2B231D]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-[#FF751F] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="font-heading font-bold text-lg tracking-wide">
                Minha Sacola ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-stone-400 space-y-3">
                <ShoppingBag className="w-16 h-16 mx-auto stroke-1 opacity-40" />
                <p className="text-base font-semibold text-stone-600">Sua sacola está vazia</p>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Navegue pelos produtos e adicione suas peças favoritas para concluir o pedido.
                </p>
              </div>
            ) : (
              cart.map((item, index) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div
                    key={`${product.id}-${item.selectedSize}-${index}`}
                    className="flex gap-4 p-3.5 bg-[#FFF9F5] rounded-2xl border border-[#BB7F5D]/20 shadow-sm relative group"
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-24 object-cover rounded-xl border border-stone-200 cart-item-thumbnail shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-xl border border-stone-200 bg-orange-50 flex items-center justify-center text-[#FF751F] shrink-0">
                        <ShoppingBag className="w-8 h-8 opacity-60" />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-heading font-bold text-stone-800 text-xs sm:text-sm truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                          <span>Tam: <strong className="text-[#FF751F] font-bold">{item.selectedSize}</strong></span>
                          {item.selectedColor && (
                            <>
                              <span>•</span>
                              <span>Cor: <strong className="text-stone-700">{item.selectedColor}</strong></span>
                            </>
                          )}
                        </div>
                        <p className="font-bold text-[#FF751F] text-sm mt-1">
                          {formatMoney(Number(product.price) || 0)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-inner overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(index, -1)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-stone-800 min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(index, 1)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-[#FDFBF9] space-y-4 shadow-lg">
              <div className="flex justify-between items-center text-base font-bold text-stone-800">
                <span>Subtotal:</span>
                <span className="text-[#FF751F] font-heading text-lg">
                  {formatMoney(cartSubtotal)}
                </span>
              </div>

              <button
                onClick={handleGoToCheckout}
                className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
              >
                <span>Avançar para Finalizar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};