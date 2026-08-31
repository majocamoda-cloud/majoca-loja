import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Save,
  RotateCcw,
  Check,
  Package,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  X,
  CreditCard,
  Building2,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface AdminPricingCalculatorProps {
  onApplyPrice?: (calculatedPrice: number) => void;
  isModalMode?: boolean;
  onCloseModal?: () => void;
  initialProduct?: Product | null;
}

interface ShopCostSettings {
  fixedCostsPercent: number; // Ex: 10% (aluguel, luz, embalagem, sacolas, etiquetas)
  cardFeePercent: number; // Ex: 3.8% (taxa média maquininha TON / PIX)
  taxPercent: number; // Ex: 4.0% (Simples / MEI / Impostos / perdas)
  defaultShippingRate: number; // Ex: R$ 3.00 por peça (frete rateado da viagem/pedido)
  defaultMarkup: number; // Ex: 2.2x
}

const DEFAULT_SHOP_COSTS: ShopCostSettings = {
  fixedCostsPercent: 8.0,
  cardFeePercent: 3.5,
  taxPercent: 4.0,
  defaultShippingRate: 3.50,
  defaultMarkup: 2.2,
};

export const AdminPricingCalculator: React.FC<AdminPricingCalculatorProps> = ({
  onApplyPrice,
  isModalMode = false,
  onCloseModal,
  initialProduct,
}) => {
  const { products, updateProduct, showToast } = useStore();

  // 1. Store global cost parameters (saved in localStorage)
  const [shopCosts, setShopCosts] = useState<ShopCostSettings>(() => {
    try {
      const saved = localStorage.getItem('majoca_shop_costs_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SHOP_COSTS;
  });

  const [isEditingShopCosts, setIsEditingShopCosts] = useState(false);

  // 2. Piece specific input states
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || ''
  );
  const [costPrice, setCostPrice] = useState<number>(35.0); // Valor de compra no fornecedor
  const [shippingPerPiece, setShippingPerPiece] = useState<number>(
    shopCosts.defaultShippingRate
  ); // Frete / viagem por peça
  const [pricingMode, setPricingMode] = useState<'markup' | 'margin'>('markup');
  const [markupMultiplier, setMarkupMultiplier] = useState<number>(
    shopCosts.defaultMarkup
  ); // Ex: 2.2x
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(45.0); // Ex: 45%
  const [roundToCommercial, setRoundToCommercial] = useState<boolean>(true); // Arredondar para .90

  // Quick preset markup buttons
  const presetMarkups = [
    { label: '1.8x (Promoção)', val: 1.8 },
    { label: '2.0x (Padrão 100%)', val: 2.0 },
    { label: '2.2x (Recomendado)', val: 2.2 },
    { label: '2.5x (Premium)', val: 2.5 },
    { label: '2.8x (Alta Margem)', val: 2.8 },
  ];

  // If a product is picked from catalog in the standalone page
  useEffect(() => {
    if (selectedProductId) {
      const found = products.find((p) => p.id === selectedProductId);
      if (found) {
        // Reverse calculate an estimated cost if starting from price
        const estimatedCost = Math.max(10, Math.round((found.price / 2.2) * 10) / 10);
        setCostPrice(estimatedCost);
      }
    }
  }, [selectedProductId, products]);

  // When initial product prop changes
  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
      const estimatedCost = Math.max(10, Math.round((initialProduct.price / 2.2) * 10) / 10);
      setCostPrice(estimatedCost);
    }
  }, [initialProduct]);

  // Save shop costs to localStorage
  const handleSaveShopCosts = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('majoca_shop_costs_v1', JSON.stringify(shopCosts));
    setIsEditingShopCosts(false);
    showToast('Parâmetros de custos da loja salvos com sucesso!', 'success');
  };

  // Calculations
  const calculations = useMemo(() => {
    const rawCost = Math.max(0, costPrice);
    const shipping = Math.max(0, shippingPerPiece);
    const directCost = rawCost + shipping; // Custo Direto Total da Peça

    const totalDeductionPercent =
      (shopCosts.fixedCostsPercent || 0) +
      (shopCosts.cardFeePercent || 0) +
      (shopCosts.taxPercent || 0);

    let calculatedRawPrice = 0;

    if (pricingMode === 'markup') {
      calculatedRawPrice = directCost * Math.max(1, markupMultiplier);
    } else {
      // By target net margin
      const totalPercentRequired = totalDeductionPercent + targetMarginPercent;
      if (totalPercentRequired >= 98) {
        // Prevent division by zero or negative
        calculatedRawPrice = directCost * 3.5;
      } else {
        calculatedRawPrice = directCost / (1 - totalPercentRequired / 100);
      }
    }

    // Apply commercial rounding (e.g. 79.90 instead of 77.34)
    let finalSellingPrice = calculatedRawPrice;
    if (roundToCommercial && calculatedRawPrice > 0) {
      const integerPart = Math.floor(calculatedRawPrice);
      // Make it end in .90
      finalSellingPrice = integerPart + 0.9;
      if (finalSellingPrice < calculatedRawPrice) {
        finalSellingPrice += 1.0;
      }
    }

    // Deductions in R$
    const fixedCostsAmount = (finalSellingPrice * shopCosts.fixedCostsPercent) / 100;
    const cardFeeAmount = (finalSellingPrice * shopCosts.cardFeePercent) / 100;
    const taxAmount = (finalSellingPrice * shopCosts.taxPercent) / 100;
    const totalDeductionsAmount = fixedCostsAmount + cardFeeAmount + taxAmount;

    // Net Profit in R$
    const netProfitAmount = finalSellingPrice - directCost - totalDeductionsAmount;

    // Effective Net Margin %
    const effectiveNetMarginPercent =
      finalSellingPrice > 0 ? (netProfitAmount / finalSellingPrice) * 100 : 0;

    // Effective Markup Multiplier
    const effectiveMarkupMultiplier =
      directCost > 0 ? finalSellingPrice / directCost : 0;

    // Total Cost including overheads (Breakeven Price)
    const breakevenPrice = directCost + totalDeductionsAmount;

    return {
      directCost,
      rawCost,
      shipping,
      totalDeductionPercent,
      finalSellingPrice,
      fixedCostsAmount,
      cardFeeAmount,
      taxAmount,
      totalDeductionsAmount,
      netProfitAmount,
      effectiveNetMarginPercent,
      effectiveMarkupMultiplier,
      breakevenPrice,
    };
  }, [
    costPrice,
    shippingPerPiece,
    pricingMode,
    markupMultiplier,
    targetMarginPercent,
    roundToCommercial,
    shopCosts,
  ]);

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Handler to apply directly to open product in modal or selected product
  const handleApply = () => {
    const finalPrice = Math.round(calculations.finalSellingPrice * 100) / 100;

    if (onApplyPrice) {
      onApplyPrice(finalPrice);
      showToast(`Preço de ${formatMoney(finalPrice)} aplicado no produto!`, 'success');
      if (onCloseModal) onCloseModal();
      return;
    }

    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        updateProduct({
          ...prod,
          price: finalPrice,
        });
        showToast(
          `Preço de "${prod.name}" atualizado para ${formatMoney(finalPrice)}!`,
          'success'
        );
      }
    } else {
      showToast('Selecione um produto do catálogo ou copie o valor sugerido.', 'info');
    }
  };

  return (
    <div
      className={`space-y-6 ${
        isModalMode ? 'p-2' : 'animate-in fade-in duration-300'
      }`}
    >
      {/* HEADER SECTION */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF751F] flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#3D2518]">
              Calculadora de Precificação & Markup
            </h2>
            <span className="bg-orange-100 text-[#FF751F] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Inteligente
            </span>
          </div>
          <p className="text-xs text-[#5A3825] mt-1">
            Calcule o preço de venda ideal considerando custo do fornecedor, frete rateado, despesas da loja, taxas de maquininha e seu lucro líquido real.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsEditingShopCosts(!isEditingShopCosts)}
            className="bg-stone-100 hover:bg-orange-50 text-[#5A3825] hover:text-[#FF751F] border border-[#BB7F5D]/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isEditingShopCosts ? 'Fechar Custos Loja' : 'Ajustar Custos da Loja'}</span>
          </button>
        </div>
      </div>

      {/* SHOP COSTS ACCORDION / EDITOR */}
      {isEditingShopCosts && (
        <form
          onSubmit={handleSaveShopCosts}
          className="bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 p-5 rounded-3xl border border-[#FF751F]/30 shadow-sm space-y-4 animate-in slide-in-from-top-3"
        >
          <div className="flex items-center justify-between border-b border-[#BB7F5D]/20 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FF751F]" />
              <h3 className="font-heading font-bold text-sm text-[#3D2518]">
                Custos Operacionais & Taxas Padrão da Loja (Majoca Moda)
              </h3>
            </div>
            <span className="text-[11px] text-[#5A3825]">
              Total de deduções sobre a venda:{' '}
              <strong className="text-[#FF751F]">
                {(shopCosts.fixedCostsPercent + shopCosts.cardFeePercent + shopCosts.taxPercent).toFixed(1)}%
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Custos Fixos / Operacionais */}
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Custos Fixos / Operacionais (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  required
                  value={shopCosts.fixedCostsPercent}
                  onChange={(e) =>
                    setShopCosts({ ...shopCosts, fixedCostsPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-3 pr-8 py-2 bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Aluguel, luz, embalagem, sacolas e etiquetas.</p>
            </div>

            {/* Taxa Média Maquininha / Cartão */}
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Taxa Média Maquininha / TON (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  required
                  value={shopCosts.cardFeePercent}
                  onChange={(e) =>
                    setShopCosts({ ...shopCosts, cardFeePercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-3 pr-8 py-2 bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Taxa média de parcelamento e transação.</p>
            </div>

            {/* Impostos / MEI / Perdas */}
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Impostos / Simples / Reserva (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  required
                  value={shopCosts.taxPercent}
                  onChange={(e) =>
                    setShopCosts({ ...shopCosts, taxPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-3 pr-8 py-2 bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Simples Nacional, tributos ou perdas.</p>
            </div>

            {/* Frete Padrão por Peça */}
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Frete Rateado Padrão (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#5A3825] font-bold">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={shopCosts.defaultShippingRate}
                  onChange={(e) =>
                    setShopCosts({ ...shopCosts, defaultShippingRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Rateio médio da viagem/frete por peça.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShopCosts(DEFAULT_SHOP_COSTS);
                localStorage.setItem('majoca_shop_costs_v1', JSON.stringify(DEFAULT_SHOP_COSTS));
                showToast('Custos restaurados para os padrões!', 'info');
              }}
              className="text-stone-500 hover:text-stone-700 text-xs px-3 py-1.5 font-bold cursor-pointer"
            >
              Restaurar Padrão
            </button>
            <button
              type="submit"
              className="bg-[#FF751F] hover:bg-[#e06316] text-white px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Parâmetros da Loja</span>
            </button>
          </div>
        </form>
      )}

      {/* MAIN TWO-COLUMN CALCULATOR INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INPUTS & PARAMETERS (7 COLS) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs space-y-5">
          
          {/* Optional Product Selector (when in standalone mode) */}
          {!onApplyPrice && (
            <div className="p-3.5 bg-orange-50/40 rounded-2xl border border-[#BB7F5D]/20 space-y-1.5">
              <label className="block text-xs font-bold text-[#3D2518]">
                Vincular a um Produto do Catálogo (Opcional)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              >
                <option value="">-- Cálculo Livre / Nova Peça --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatMoney(p.price)}) - #{p.sku}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1. CUSTOS DIRETOS DA PEÇA */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#3D2518] flex items-center gap-2 border-b border-[#BB7F5D]/15 pb-2">
              <Package className="w-4 h-4 text-[#FF751F]" />
              <span>1. Custos Diretos de Aquisição da Peça</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Valor de Custo do Fornecedor */}
              <div>
                <label className="block text-xs font-bold text-[#5A3825] mb-1">
                  Valor de Compra no Fornecedor *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[#5A3825] font-bold text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2.5 text-base font-extrabold text-[#3D2518] bg-orange-50/20 border border-[#BB7F5D]/30 rounded-xl focus:border-[#FF751F] focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Preço pago no atacado/fabricante por peça.
                </span>
              </div>

              {/* Frete / Viagem Rateado */}
              <div>
                <label className="block text-xs font-bold text-[#5A3825] mb-1">
                  Frete / Viagem Rateado por Peça
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[#5A3825] font-bold text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={shippingPerPiece || ''}
                    onChange={(e) => setShippingPerPiece(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2.5 text-base font-extrabold text-[#3D2518] bg-orange-50/20 border border-[#BB7F5D]/30 rounded-xl focus:border-[#FF751F] focus:bg-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Ex: Frete total de R$ 150 / 50 peças = R$ 3,00.
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
              <span className="text-[#5A3825] font-medium">Custo Direto Base (Compra + Frete):</span>
              <strong className="text-[#3D2518] font-heading font-extrabold text-sm">
                {formatMoney(calculations.directCost)}
              </strong>
            </div>
          </div>

          {/* 2. ESTRATÉGIA DE PRECIFICAÇÃO (MARKUP OU MARGEM) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-[#BB7F5D]/15 pb-2">
              <h3 className="font-heading font-bold text-sm text-[#3D2518] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FF751F]" />
                <span>2. Margem & Multiplicador Markup</span>
              </h3>

              {/* Mode Toggle */}
              <div className="bg-stone-100 p-0.5 rounded-lg flex items-center gap-1 border border-[#BB7F5D]/20 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPricingMode('markup')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    pricingMode === 'markup'
                      ? 'bg-white text-[#FF751F] shadow-2xs'
                      : 'text-[#5A3825] hover:text-[#3D2518]'
                  }`}
                >
                  Multiplicador Markup (x)
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('margin')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    pricingMode === 'margin'
                      ? 'bg-white text-[#FF751F] shadow-2xs'
                      : 'text-[#5A3825] hover:text-[#3D2518]'
                  }`}
                >
                  Margem Líquida (%)
                </button>
              </div>
            </div>

            {/* If Markup Mode */}
            {pricingMode === 'markup' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-[#5A3825] mb-1">
                      Multiplicador Markup Desejado (Ex: 2.0x = dobro do custo)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="1.0"
                        max="5.0"
                        value={markupMultiplier}
                        onChange={(e) => setMarkupMultiplier(parseFloat(e.target.value) || 1)}
                        className="w-full pl-3 pr-10 py-2 text-base font-extrabold text-[#FF751F] bg-orange-50/20 border border-[#FF751F]/40 rounded-xl focus:outline-none focus:border-[#FF751F]"
                      />
                      <span className="absolute right-3.5 top-2.5 font-bold text-[#FF751F]">
                        x
                      </span>
                    </div>
                  </div>

                  <div className="w-48 text-right">
                    <span className="text-[11px] text-[#5A3825] block">Margem Bruta Inicial:</span>
                    <strong className="text-sm font-bold text-[#3D2518]">
                      {((markupMultiplier - 1) * 100).toFixed(0)}% sobre o custo
                    </strong>
                  </div>
                </div>

                {/* Preset Markup Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {presetMarkups.map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setMarkupMultiplier(p.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        markupMultiplier === p.val
                          ? 'bg-[#FF751F] text-white border-[#FF751F] shadow-xs'
                          : 'bg-stone-50 hover:bg-orange-50 text-[#5A3825] border-stone-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* If Margin Mode */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A3825] mb-1">
                    Margem Líquida Alvo no Bolso (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="75"
                      value={targetMarginPercent}
                      onChange={(e) => setTargetMarginPercent(parseFloat(e.target.value) || 10)}
                      className="w-full pl-3 pr-10 py-2 text-base font-extrabold text-[#FF751F] bg-orange-50/20 border border-[#FF751F]/40 rounded-xl focus:outline-none focus:border-[#FF751F]"
                    />
                    <span className="absolute right-3.5 top-2.5 font-bold text-[#FF751F]">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    A calculadora ajusta o preço para que, após todas as despesas da loja, sobre exatamente este percentual de lucro.
                  </span>
                </div>
              </div>
            )}

            {/* Arredondamento Comercial */}
            <div className="pt-2 flex items-center justify-between bg-orange-50/40 p-3 rounded-xl border border-[#BB7F5D]/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-commercial-round"
                  checked={roundToCommercial}
                  onChange={(e) => setRoundToCommercial(e.target.checked)}
                  className="w-4 h-4 text-[#FF751F] accent-[#FF751F] rounded cursor-pointer"
                />
                <label htmlFor="chk-commercial-round" className="text-xs font-bold text-[#3D2518] cursor-pointer">
                  Arredondar Preço para Final Comercial (,90)
                </label>
              </div>
              <span className="text-[11px] text-[#BB7F5D]">
                Ex: R$ 79,90 em vez de R$ 78,42
              </span>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: RESULTS, BREAKDOWN & ACTION (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* MAIN PRICE SUGGESTION HIGHLIGHT CARD */}
          <div className="bg-gradient-to-br from-[#3D2518] via-[#2B1B12] to-[#3D2518] text-white p-6 rounded-3xl shadow-lg border border-[#BB7F5D]/40 relative overflow-hidden flex flex-col justify-between">
            {/* Ambient decorative brand glow */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-[#FF751F]/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-orange-200 text-xs font-bold tracking-wider uppercase">
                <span>Preço de Venda Sugerido</span>
                <span className="bg-[#FF751F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                  {calculations.effectiveMarkupMultiplier.toFixed(2)}x Markup
                </span>
              </div>

              <div className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight mt-3">
                {formatMoney(calculations.finalSellingPrice)}
              </div>

              <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                <span className="text-orange-200">Lucro Líquido Real / Peça:</span>
                <strong className="text-emerald-400 font-extrabold text-base flex items-center gap-1">
                  +{formatMoney(calculations.netProfitAmount)}
                </strong>
              </div>

              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-stone-300">Margem Líquida Efetiva:</span>
                <strong className="text-emerald-400 font-bold">
                  {calculations.effectiveNetMarginPercent.toFixed(1)}% do preço de venda
                </strong>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-6 pt-4 border-t border-white/15">
              <button
                type="button"
                onClick={handleApply}
                className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101 active:scale-99"
              >
                <Check className="w-4 h-4" />
                <span>
                  {onApplyPrice
                    ? `Aplicar ${formatMoney(calculations.finalSellingPrice)} no Produto`
                    : selectedProductId
                    ? 'Salvar Preço no Produto Selecionado'
                    : `Copiar Preço (${formatMoney(calculations.finalSellingPrice)})`}
                </span>
              </button>
            </div>
          </div>

          {/* DEDUCTIONS & COMPOSITION BREAKDOWN */}
          <div className="bg-white p-5 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs space-y-3">
            <h4 className="font-heading font-bold text-xs text-[#3D2518] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#FF751F]" />
              <span>Detalhamento Financeiro da Peça</span>
            </h4>

            {/* Visual Bar representation */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                <div
                  title={`Custo Direto: ${formatMoney(calculations.directCost)}`}
                  className="bg-[#BB7F5D] h-full"
                  style={{
                    width: `${Math.min(100, (calculations.directCost / (calculations.finalSellingPrice || 1)) * 100)}%`,
                  }}
                />
                <div
                  title={`Despesas da Loja: ${formatMoney(calculations.totalDeductionsAmount)}`}
                  className="bg-amber-400 h-full"
                  style={{
                    width: `${Math.min(100, (calculations.totalDeductionsAmount / (calculations.finalSellingPrice || 1)) * 100)}%`,
                  }}
                />
                <div
                  title={`Lucro Líquido: ${formatMoney(calculations.netProfitAmount)}`}
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${Math.max(0, (calculations.netProfitAmount / (calculations.finalSellingPrice || 1)) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-stone-400 font-semibold px-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#BB7F5D] inline-block" /> Custo
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Despesas
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Lucro
                </span>
              </div>
            </div>

            {/* Numerical breakdown items */}
            <div className="space-y-2 pt-1 text-xs divide-y divide-stone-100">
              
              <div className="flex justify-between items-center text-[#5A3825]">
                <span>Custo do Fornecedor + Frete:</span>
                <span className="font-bold text-[#3D2518]">
                  {formatMoney(calculations.directCost)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#5A3825] pt-1.5">
                <span>Custos Fixos da Loja ({shopCosts.fixedCostsPercent}%):</span>
                <span className="font-semibold text-[#5A3825]">
                  {formatMoney(calculations.fixedCostsAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#5A3825] pt-1.5">
                <span>Taxa Cartão / Meio Pagamento ({shopCosts.cardFeePercent}%):</span>
                <span className="font-semibold text-[#5A3825]">
                  {formatMoney(calculations.cardFeeAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#5A3825] pt-1.5">
                <span>Impostos & Reserva ({shopCosts.taxPercent}%):</span>
                <span className="font-semibold text-[#5A3825]">
                  {formatMoney(calculations.taxAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5 text-xs font-bold text-[#3D2518]">
                <span>Preço de Equilíbrio (Zero a Zero):</span>
                <span className="text-amber-700">
                  {formatMoney(calculations.breakevenPrice)}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
