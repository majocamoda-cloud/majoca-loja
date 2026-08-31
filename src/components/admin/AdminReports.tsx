import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Calendar,
  Award,
  ArrowUpRight,
  Filter,
  Download,
  CreditCard,
  Truck,
  CheckCircle2,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { Order, Product } from '../../types';
import { exportSalesReportPDF } from '../../utils/pdfGenerator';

type PeriodFilter = '7days' | '30days' | 'month' | 'all';

const CATEGORY_COLORS: Record<string, string> = {
  bebe: '#FF751F',
  infantil: '#BB7F5D',
  juvenil: '#3D2518',
  acessorios: '#F59E0B',
  outros: '#8B5CF6',
};

export const AdminReports: React.FC = () => {
  const { orders, products, showToast } = useStore();
  const [period, setPeriod] = useState<PeriodFilter>('30days');

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      if (period === 'all') return true;
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return true; // fallback for sample orders

      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (period === '7days') return diffDays <= 7;
      if (period === '30days') return diffDays <= 30;
      if (period === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [orders, period]);

  // Overall Financial Metrics
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, ord) => sum + ord.total, 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;

  const totalPiecesSold = useMemo(() => {
    return filteredOrders.reduce(
      (sum, ord) =>
        sum + ord.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
  }, [filteredOrders]);

  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const paidOrdersCount = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'Pago / Em separação').length;
  }, [filteredOrders]);

  // 1. Top Selling Products Calculation
  const topSellingProducts = useMemo(() => {
    const salesMap: Record<
      string,
      {
        productId: string;
        name: string;
        sku: string;
        category: string;
        image: string;
        unitsSold: number;
        totalRevenue: number;
        currentStock: number;
      }
    > = {};

    // First scan all products in database
    products.forEach((p) => {
      const totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
      salesMap[p.id] = {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        category: p.categoryLabel || p.category,
        image: p.images[0] || '',
        unitsSold: 0,
        totalRevenue: 0,
        currentStock: totalStock,
      };
    });

    // Aggregate from orders
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prodId = item.product.id;
        if (!salesMap[prodId]) {
          salesMap[prodId] = {
            productId: prodId,
            name: item.product.name,
            sku: item.product.sku,
            category: item.product.categoryLabel || item.product.category,
            image: item.product.images[0] || '',
            unitsSold: 0,
            totalRevenue: 0,
            currentStock: 0,
          };
        }
        salesMap[prodId].unitsSold += item.quantity;
        salesMap[prodId].totalRevenue += item.product.price * item.quantity;
      });
    });

    return Object.values(salesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.totalRevenue - a.totalRevenue)
      .slice(0, 8);
  }, [filteredOrders, products]);

  // 2. Timeline Daily / Monthly Sales Data for Chart
  const revenueTimelineData = useMemo(() => {
    const dayMap: Record<string, { date: string; faturamento: number; pedidos: number }> = {};

    // Generate last 7 days or sample days
    const daysToShow = period === '7days' ? 7 : 14;
    const now = new Date();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      dayMap[dateKey] = { date: dateKey, faturamento: 0, pedidos: 0 };
    }

    // Populate from orders
    filteredOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) {
        const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (dayMap[dateKey]) {
          dayMap[dateKey].faturamento += order.total;
          dayMap[dateKey].pedidos += 1;
        } else {
          dayMap[dateKey] = {
            date: dateKey,
            faturamento: order.total,
            pedidos: 1,
          };
        }
      }
    });

    // If empty, supply representative trends
    const list = Object.values(dayMap);
    const hasData = list.some((item) => item.faturamento > 0);
    if (!hasData && filteredOrders.length > 0) {
      // distribute sample orders smoothly across the timeline
      filteredOrders.forEach((ord, idx) => {
        const target = list[idx % list.length];
        if (target) {
          target.faturamento += ord.total;
          target.pedidos += 1;
        }
      });
    }

    return list;
  }, [filteredOrders, period]);

  // 3. Category Revenue Distribution Data
  const categoryChartData = useMemo(() => {
    const catMap: Record<string, { name: string; value: number; count: number }> = {
      bebe: { name: 'Moda Bebê (RN ao GG)', value: 0, count: 0 },
      infantil: { name: 'Moda Infantil (1 ao 10)', value: 0, count: 0 },
      juvenil: { name: 'Moda Juvenil (12 ao 18)', value: 0, count: 0 },
      acessorios: { name: 'Acessórios & Calçados', value: 0, count: 0 },
    };

    filteredOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        const cat = item.product.category || 'infantil';
        if (catMap[cat]) {
          catMap[cat].value += item.product.price * item.quantity;
          catMap[cat].count += item.quantity;
        } else {
          catMap.infantil.value += item.product.price * item.quantity;
          catMap.infantil.count += item.quantity;
        }
      });
    });

    return Object.entries(catMap)
      .map(([key, data]) => ({
        key,
        name: data.name,
        value: data.value,
        count: data.count,
        color: CATEGORY_COLORS[key] || '#FF751F',
      }))
      .filter((d) => d.value > 0 || d.count > 0);
  }, [filteredOrders]);

  // 4. Payment and Delivery Distribution
  const paymentBreakdown = useMemo(() => {
    const pixCount = filteredOrders.filter((o) => o.paymentMethod === 'pix').length;
    const cardCount = filteredOrders.filter((o) => o.paymentMethod === 'ton_cartao').length;
    const total = filteredOrders.length || 1;
    return {
      pixCount,
      cardCount,
      pixPercent: Math.round((pixCount / total) * 100),
      cardPercent: Math.round((cardCount / total) * 100),
    };
  }, [filteredOrders]);

  const deliveryBreakdown = useMemo(() => {
    const retirada = filteredOrders.filter((o) => o.deliveryMethod === 'retirada_uba').length;
    const motoboy = filteredOrders.filter((o) => o.deliveryMethod === 'entrega_uba').length;
    const correios = filteredOrders.filter((o) => o.deliveryMethod === 'envio_calcular').length;
    return { retirada, motoboy, correios };
  }, [filteredOrders]);

  const handleExportCsv = () => {
    const csvRows: string[] = [
      'ID Pedido,Data,Cliente,Telefone,Total,Status,Metodo Pagamento,Forma Entrega,Qtd Itens',
    ];

    filteredOrders.forEach((o) => {
      const itemsCount = o.items.reduce((acc, i) => acc + i.quantity, 0);
      const row = [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${o.customer.name}"`,
        `"${o.customer.phone}"`,
        `"R$ ${o.total.toFixed(2)}"`,
        `"${o.status}"`,
        `"${o.paymentMethod}"`,
        `"${o.deliveryMethod}"`,
        itemsCount,
      ].join(',');
      csvRows.push(row);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_majoca_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório de vendas exportado com sucesso!', 'success');
  };

  const handleExportPdf = () => {
    const periodLabels: Record<PeriodFilter, string> = {
      '7days': 'Últimos 7 Dias',
      '30days': 'Últimos 30 Dias',
      month: 'Mês Atual',
      all: 'Geral (Todo o Período)',
    };

    exportSalesReportPDF({
      periodLabel: periodLabels[period],
      totalRevenue,
      totalOrders: totalOrdersCount,
      totalPieces: totalPiecesSold,
      averageTicket,
      topProducts: topSellingProducts.map((p) => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        unitsSold: p.unitsSold,
        totalRevenue: p.totalRevenue,
        currentStock: p.currentStock,
      })),
      orders: filteredOrders,
    });

    showToast('Relatório PDF gerado e baixado com sucesso!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER & PERIOD FILTER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#3D2518]">
              Relatórios de Vendas & Faturamento
            </h2>
            <span className="bg-orange-100 text-[#FF751F] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-[#5A3825] mt-0.5">
            Métricas de desempenho, faturamento consolidado e ranking de produtos mais vendidos da Majoca Moda.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Period Selector Tabs */}
          <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1 border border-[#BB7F5D]/20">
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === '7days'
                  ? 'bg-white text-[#FF751F] shadow-xs'
                  : 'text-[#5A3825] hover:text-[#3D2518]'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setPeriod('30days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === '30days'
                  ? 'bg-white text-[#FF751F] shadow-xs'
                  : 'text-[#5A3825] hover:text-[#3D2518]'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === 'month'
                  ? 'bg-white text-[#FF751F] shadow-xs'
                  : 'text-[#5A3825] hover:text-[#3D2518]'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === 'all'
                  ? 'bg-white text-[#FF751F] shadow-xs'
                  : 'text-[#5A3825] hover:text-[#3D2518]'
              }`}
            >
              Geral
            </button>
          </div>

          <button
            onClick={handleExportPdf}
            className="bg-[#FF751F] hover:bg-[#e06316] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            title="Exportar relatório formatado em PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-stone-100 hover:bg-stone-200 text-[#5A3825] border border-[#BB7F5D]/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Exportar dados em formato CSV para Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#BB7F5D]" />
            <span className="hidden md:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* 1. TOP STATS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Faturamento */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Faturamento no Período
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF751F] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#3D2518] mt-2">
            {formatMoney(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{totalOrdersCount} pedidos registrados</span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Ticket Médio / Pedido
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#3D2518] mt-2">
            {formatMoney(averageTicket)}
          </div>
          <div className="text-[11px] text-[#5A3825] mt-1">
            Média gasta por cliente
          </div>
        </div>

        {/* Peças Vendidas */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Peças Vendidas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-emerald-700 mt-2">
            {totalPiecesSold} un.
          </div>
          <div className="text-[11px] text-[#5A3825] mt-1">
            Unidades no carrinho faturadas
          </div>
        </div>

        {/* Pedidos Pagos */}
        <div className="bg-white p-5 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider">
              Status dos Pedidos
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#3D2518] mt-2">
            {paidOrdersCount} / {totalOrdersCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {totalOrdersCount > 0
              ? `${Math.round((paidOrdersCount / totalOrdersCount) * 100)}% pagos / prontos`
              : 'Aguardando pedidos'}
          </div>
        </div>

      </div>

      {/* 2. CHARTS GRID (AREA CHART + CATEGORIES PIE CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Faturamento ao longo do tempo (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-[#3D2518] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FF751F]" />
                <span>Evolução de Faturamento Diário</span>
              </h3>
              <p className="text-xs text-[#5A3825]">
                Receita em Reais (R$) gerada pelos pedidos no período selecionado.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF751F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF751F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#BB7F5D" strokeOpacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#5A3825' }}
                  axisLine={{ stroke: '#BB7F5D', strokeOpacity: 0.3 }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `R$ ${val}`}
                  tick={{ fontSize: 11, fill: '#5A3825' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Faturamento']}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    backgroundColor: '#2B1B12',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  stroke="#FF751F"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorFaturamento)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faturamento por Categoria (1 col) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-heading font-bold text-base text-[#3D2518] flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#FF751F]" />
              <span>Vendas por Categoria</span>
            </h3>
            <p className="text-xs text-[#5A3825]">
              Participação no faturamento por faixa etária.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <div className="text-xs text-[#BB7F5D] text-center">
                Sem dados de categoria no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), 'Faturamento']}
                    contentStyle={{
                      backgroundColor: '#2B1B12',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#BB7F5D]/15">
            {categoryChartData.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#3D2518] font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-[#3D2518]">{formatMoney(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. TOP SELLING PRODUCTS TABLE (RANKING) */}
      <div className="bg-white rounded-3xl border border-[#BB7F5D]/20 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-50/60 to-amber-50/60 border-b border-[#BB7F5D]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF751F] text-white flex items-center justify-center shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[#3D2518]">
                Ranking: Produtos Mais Vendidos
              </h3>
              <p className="text-xs text-[#5A3825]">
                As peças com maior saída no catálogo da Majoca Moda.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#5A3825] font-bold uppercase tracking-wider border-b border-[#BB7F5D]/15">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-center">Unidades Vendidas</th>
                <th className="py-3.5 px-4 text-right">Faturamento Gerado</th>
                <th className="py-3.5 px-4 text-center">Estoque Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BB7F5D]/10">
              {topSellingProducts.map((prod, index) => (
                <tr key={prod.productId} className="hover:bg-orange-50/30 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        index === 0
                          ? 'bg-amber-400 text-white shadow-2xs'
                          : index === 1
                          ? 'bg-stone-300 text-stone-800'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'text-[#BB7F5D]'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-10 h-10 rounded-xl object-cover bg-stone-100 border border-[#BB7F5D]/20 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-[#3D2518] line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-[#BB7F5D]">Ref: {prod.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#5A3825]">
                    <span className="bg-orange-50 text-[#FF751F] px-2 py-0.5 rounded-md font-semibold text-[11px] border border-[#BB7F5D]/15">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#3D2518]">
                    {prod.unitsSold} un.
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-[#FF751F]">
                    {formatMoney(prod.totalRevenue)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        prod.currentStock <= 2
                          ? 'bg-rose-100 text-rose-800'
                          : prod.currentStock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prod.currentStock} un.
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PAYMENT & DELIVERY BREAKDOWN ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pagamentos */}
        <div className="bg-white p-5 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D2518]">
            <CreditCard className="w-4 h-4 text-[#FF751F]" />
            <span>Preferência de Pagamento</span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-[#3D2518]">
                <span>PIX Instantâneo ({paymentBreakdown.pixCount} pedidos)</span>
                <span>{paymentBreakdown.pixPercent}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF751F] h-full rounded-full transition-all"
                  style={{ width: `${paymentBreakdown.pixPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-[#3D2518]">
                <span>Cartão TON Parcelado ({paymentBreakdown.cardCount} pedidos)</span>
                <span>{paymentBreakdown.cardPercent}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#BB7F5D] h-full rounded-full transition-all"
                  style={{ width: `${paymentBreakdown.cardPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-white p-5 rounded-3xl border border-[#BB7F5D]/20 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D2518]">
            <Truck className="w-4 h-4 text-[#FF751F]" />
            <span>Modalidades de Entrega</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-orange-50/50 p-3 rounded-2xl border border-[#BB7F5D]/15">
              <div className="text-lg font-extrabold text-[#3D2518]">{deliveryBreakdown.retirada}</div>
              <div className="text-[10px] text-[#5A3825] font-semibold mt-0.5">Retirada Ubá</div>
            </div>
            <div className="bg-orange-50/50 p-3 rounded-2xl border border-[#BB7F5D]/15">
              <div className="text-lg font-extrabold text-[#FF751F]">{deliveryBreakdown.motoboy}</div>
              <div className="text-[10px] text-[#5A3825] font-semibold mt-0.5">Motoboy Local</div>
            </div>
            <div className="bg-orange-50/50 p-3 rounded-2xl border border-[#BB7F5D]/15">
              <div className="text-lg font-extrabold text-[#BB7F5D]">{deliveryBreakdown.correios}</div>
              <div className="text-[10px] text-[#5A3825] font-semibold mt-0.5">Envio Brasil</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
