import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  PlusCircle,
  ArrowRight,
  Truck,
  Layers,
  Calculator,
  Download,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { exportInventoryReportPDF } from '../../utils/pdfGenerator';

interface AdminDashboardProps {
  onNavigateToTab: (tab: 'products' | 'categories' | 'orders' | 'reports' | 'pricing' | 'banners') => void;
  onQuickAddProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToTab,
  onQuickAddProduct,
}) => {
  const { orders, products, settings, showToast } = useStore();

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const lowStockThreshold = settings?.lowStockThreshold ?? 2;

  // Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const pendingOrders = orders.filter(
    (o) =>
      o.status === 'Aguardando pagamento via PIX' ||
      o.status === 'Aguardando envio do link TON'
  );
  const paidOrders = orders.filter((o) => o.status === 'Pago / Em separação');

  // Low stock products (total stock <= threshold or any size <= threshold)
  const lowStockProducts = products.filter((prod) => {
    const totalStock = prod.sizes.reduce((acc, s) => acc + s.stock, 0);
    const hasLowSize = prod.sizes.some((s) => s.stock <= lowStockThreshold);
    return totalStock <= lowStockThreshold || hasLowSize;
  });

  const handleExportInventoryPDF = () => {
    exportInventoryReportPDF(products, lowStockThreshold);
    showToast('Relatório de estoque baixado em PDF!', 'success');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div 
          onClick={() => onNavigateToTab('reports')}
          className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#FF751F] hover:shadow-md transition-all group"
          title="Clique para ver relatórios detalhados de faturamento"
        >
          <div>
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider group-hover:text-[#FF751F] transition-colors">
              Faturamento Total
            </span>
            <div className="font-heading font-extrabold text-2xl text-[#3D2518] mt-1 group-hover:text-[#FF751F] transition-colors">
              {formatMoney(totalRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              {orders.length} pedidos • Ver gráficos &rarr;
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF751F] flex items-center justify-center group-hover:bg-[#FF751F] group-hover:text-white transition-all">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Aguardando Pagamento
            </span>
            <div className="font-heading font-extrabold text-2xl text-[#FF751F] mt-1">
              {pendingOrders.length}
            </div>
            <span className="text-[11px] text-[#5A3825] mt-0.5">
              PIX / Link TON pendente
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FF751F] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Orders In Separation / Paid */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Para Separação / Envio
            </span>
            <div className="font-heading font-extrabold text-2xl text-emerald-600 mt-1">
              {paidOrders.length}
            </div>
            <span className="text-[11px] text-[#5A3825] mt-0.5">
              Prontos para embalar
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Catálogo Ativo
            </span>
            <div className="font-heading font-extrabold text-2xl text-[#3D2518] mt-1">
              {products.length}
            </div>
            <span className="text-[11px] text-[#5A3825] mt-0.5">
              Peças de 0 a 18 anos
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#BB7F5D] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. LOW STOCK ALERTS SECTION */}
      <div className="bg-white rounded-3xl border border-[#BB7F5D]/20 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50/70 to-orange-50/70 border-b border-[#BB7F5D]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[#3D2518]">
                Alertas de Estoque Baixo ou Esgotado ({lowStockProducts.length})
              </h3>
              <p className="text-xs text-[#5A3825]">
                Peças com {lowStockThreshold} ou menos unidades em estoque que necessitam de reposição.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportInventoryPDF}
              className="bg-white hover:bg-stone-50 text-[#5A3825] border border-[#BB7F5D]/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Baixar lista completa de estoque em PDF"
            >
              <Download className="w-3.5 h-3.5 text-[#BB7F5D]" />
              <span>Exportar PDF</span>
            </button>

            <button
              onClick={() => onNavigateToTab('products')}
              className="bg-[#FF751F] hover:bg-[#e06316] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <span>Gerenciar Estoque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-6 text-xs text-emerald-700 font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Excelente! Todos os produtos possuem estoque saudável no momento.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((prod) => {
                const totalStock = prod.sizes.reduce((acc, s) => acc + s.stock, 0);

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/30 flex gap-3 items-center"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0 border border-[#BB7F5D]/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#3D2518] truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-[#BB7F5D] font-medium">
                        Ref: {prod.sku} • {prod.categoryLabel}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          {totalStock === 0 ? 'Esgotado' : `Apenas ${totalStock} un.`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. RECENT ORDERS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#BB7F5D]/20 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#BB7F5D]/10">
            <h3 className="font-heading font-bold text-base text-[#3D2518] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#FF751F]" />
              <span>Últimos Pedidos Recebidos</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-xs font-bold text-[#FF751F] hover:underline"
            >
              Ver todos os pedidos &rarr;
            </button>
          </div>

          <div className="divide-y divide-[#BB7F5D]/10">
            {orders.slice(0, 4).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#3D2518]">{ord.orderNumber}</span>
                    <span className="text-[#5A3825]">• {ord.customer.name}</span>
                  </div>
                  <div className="text-[11px] text-[#BB7F5D] mt-0.5">
                    {ord.items.length} {ord.items.length === 1 ? 'item' : 'itens'} • {ord.deliveryEstimate}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-heading font-bold text-[#3D2518]">{formatMoney(ord.total)}</div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      ord.status.includes('PIX') || ord.status.includes('TON')
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[#BB7F5D] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-lg">Ações Rápidas</h3>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Adicione novas peças no catálogo ou atualize as informações e banners da loja.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onQuickAddProduct}
              className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>

            <button
              onClick={() => onNavigateToTab('reports')}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Ver Relatórios de Vendas</span>
            </button>

            <button
              onClick={() => onNavigateToTab('pricing')}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculadora de Preços & Markup</span>
            </button>

            <button
              onClick={() => onNavigateToTab('banners')}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Editar Banners e Textos</span>
            </button>

            <button
              onClick={() => onNavigateToTab('categories')}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Gerenciar Categorias</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
