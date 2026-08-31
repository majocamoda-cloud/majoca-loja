import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Product, StoreSettings } from '../types';

const BRAND_COLORS = {
  primary: [255, 117, 31], // #FF751F (Majoca Orange)
  secondary: [187, 127, 93], // #BB7F5D (Terracotta)
  dark: [43, 27, 18], // #2B1B12 (Deep Coffee)
  lightBg: [250, 245, 238], // #FAF5EE (Warm Off-white)
  grayText: [90, 56, 37], // #5A3825
  border: [230, 220, 210],
  success: [16, 149, 106],
  warning: [217, 119, 6],
  danger: [225, 29, 72],
};

function formatMoney(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString('pt-BR');
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? new Date().toLocaleDateString('pt-BR')
    : `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * 1. Exporta Relatório Completo de Vendas & Faturamento em PDF
 */
export function exportSalesReportPDF({
  orders,
  periodLabel,
  totalRevenue,
  totalOrders,
  totalPieces,
  averageTicket,
  topProducts,
}: {
  orders: Order[];
  periodLabel: string;
  totalRevenue: number;
  totalOrders: number;
  totalPieces: number;
  averageTicket: number;
  topProducts?: Array<{
    name: string;
    sku: string;
    category: string;
    unitsSold: number;
    totalRevenue: number;
  }>;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Brand Banner
  doc.setFillColor(255, 117, 31);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MAJOCA MODA • RELATÓRIO DE VENDAS', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Moda Infanto-Juvenil (RN ao 18) • Ubá/MG', 14, 18);

  doc.setFontSize(9);
  doc.text(`Emissão: ${formatDate()}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Filtro: ${periodLabel}`, pageWidth - 14, 18, { align: 'right' });

  // Summary Metrics Cards
  const startY = 32;
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 20;

  const metrics = [
    { title: 'FATURAMENTO TOTAL', value: formatMoney(totalRevenue), color: BRAND_COLORS.primary },
    { title: 'TOTAL DE PEDIDOS', value: `${totalOrders} pedidos`, color: BRAND_COLORS.secondary },
    { title: 'PEÇAS VENDIDAS', value: `${totalPieces} un.`, color: BRAND_COLORS.success },
    { title: 'TICKET MÉDIO', value: formatMoney(averageTicket), color: BRAND_COLORS.warning },
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(250, 245, 238);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');

    doc.setDrawColor(220, 200, 185);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.title, x + 3, startY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
    doc.text(m.value, x + 3, startY + 14);
  });

  // Table of Orders
  const ordersTableData = orders.map((o) => {
    const itemCount = o.items.reduce((acc, it) => acc + it.quantity, 0);
    return [
      o.orderNumber,
      formatDate(o.createdAt),
      o.customer.name,
      o.customer.phone,
      `${itemCount} un.`,
      o.paymentMethod === 'pix' ? 'PIX' : 'Cartão TON',
      o.deliveryMethod === 'retirada_uba' ? 'Retirada' : o.deliveryMethod === 'entrega_uba' ? 'Motoboy' : 'Correios',
      formatMoney(o.total),
      o.status.replace('Aguardando', 'Ag.'),
    ];
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
  doc.text('Detalhamento dos Pedidos Registrados', 14, 60);

  autoTable(doc, {
    startY: 64,
    head: [['Pedido', 'Data', 'Cliente', 'WhatsApp', 'Itens', 'Pagto', 'Entrega', 'Total', 'Status']],
    body: ordersTableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [43, 27, 18],
      lineColor: [230, 220, 210],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 117, 31],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { fontStyle: 'bold', halign: 'right', textColor: [255, 117, 31] },
      8: { halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [253, 250, 246],
    },
    margin: { left: 14, right: 14 },
  });

  // Top Selling Products Section
  if (topProducts && topProducts.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    
    // Check if we need page break
    if (finalY > 220) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
      doc.text('Top Produtos Mais Vendidos', 14, 18);

      autoTable(doc, {
        startY: 22,
        head: [['Pos', 'Referência', 'Produto', 'Categoria', 'Unidades Vendidas', 'Receita Gerada']],
        body: topProducts.slice(0, 8).map((tp, idx) => [
          `#${idx + 1}`,
          tp.sku,
          tp.name,
          tp.category,
          `${tp.unitsSold} peças`,
          formatMoney(tp.totalRevenue),
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [187, 127, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold' },
          1: { halign: 'center' },
          4: { halign: 'center', fontStyle: 'bold' },
          5: { halign: 'right', fontStyle: 'bold', textColor: [255, 117, 31] },
        },
      });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
      doc.text('Top Produtos Mais Vendidos', 14, finalY + 10);

      autoTable(doc, {
        startY: finalY + 14,
        head: [['Pos', 'Referência', 'Produto', 'Categoria', 'Unidades Vendidas', 'Receita Gerada']],
        body: topProducts.slice(0, 8).map((tp, idx) => [
          `#${idx + 1}`,
          tp.sku,
          tp.name,
          tp.category,
          `${tp.unitsSold} peças`,
          formatMoney(tp.totalRevenue),
        ]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [187, 127, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold' },
          1: { halign: 'center' },
          4: { halign: 'center', fontStyle: 'bold' },
          5: { halign: 'right', fontStyle: 'bold', textColor: [255, 117, 31] },
        },
      });
    }
  }

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 140, 130);
    doc.text(
      `Majoca Moda • Relatório de Gestão Comercial • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  const filename = `relatorio_vendas_majoca_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * 2. Exporta Relatório de Estoque e Inventário em PDF (com Alerta de Estoque Baixo)
 */
export function exportInventoryReportPDF(
  productsOrOptions:
    | Product[]
    | {
        products: Product[];
        lowStockThreshold?: number;
        filterCategory?: string;
      },
  lowStockThresholdArg: number = 2,
  filterCategoryArg: string = 'Todas'
) {
  let products: Product[] = [];
  let lowStockThreshold: number = 2;
  let filterCategory: string = 'Todas';

  if (Array.isArray(productsOrOptions)) {
    products = productsOrOptions;
    lowStockThreshold = lowStockThresholdArg;
    filterCategory = filterCategoryArg;
  } else {
    products = productsOrOptions.products;
    lowStockThreshold = productsOrOptions.lowStockThreshold ?? 2;
    filterCategory = productsOrOptions.filterCategory ?? 'Todas';
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(43, 27, 18);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 117, 31);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('MAJOCA MODA • RELATÓRIO DE ESTOQUE & INVENTÁRIO', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Filtro: ${filterCategory} | Alerta Estoque Baixo <= ${lowStockThreshold} un.`, 14, 17);

  doc.text(`Emissão: ${formatDate()}`, pageWidth - 14, 14, { align: 'right' });

  // Summary Metrics
  const totalProductsCount = products.length;
  const totalStockPieces = products.reduce(
    (sum, p) => sum + p.sizes.reduce((acc, s) => acc + s.stock, 0),
    0
  );
  const lowStockCount = products.filter((p) => {
    const total = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    return total > 0 && total <= lowStockThreshold;
  }).length;

  const outOfStockCount = products.filter((p) => {
    const total = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    return total === 0;
  }).length;

  const totalInventoryValue = products.reduce((sum, p) => {
    const totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    return sum + p.price * totalStock;
  }, 0);

  const startY = 28;
  const cardWidth = (pageWidth - 28 - 12) / 5;
  const cardHeight = 16;

  const cards = [
    { title: 'PRODUTOS CADASTRADOS', val: `${totalProductsCount} itens`, col: BRAND_COLORS.secondary },
    { title: 'PEÇAS TOTAIS EM ESTOQUE', val: `${totalStockPieces} peças`, col: BRAND_COLORS.primary },
    { title: 'EM ALERTA BAIXO', val: `${lowStockCount} peças`, col: BRAND_COLORS.warning },
    { title: 'ESGOTADOS (ZERO)', val: `${outOfStockCount} peças`, col: BRAND_COLORS.danger },
    { title: 'VALOR ESTOQUE (VENDA)', val: formatMoney(totalInventoryValue), col: BRAND_COLORS.success },
  ];

  cards.forEach((c, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(250, 245, 238);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(220, 200, 185);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(c.col[0], c.col[1], c.col[2]);
    doc.text(c.title, x + 3, startY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(BRAND_COLORS.dark[0], BRAND_COLORS.dark[1], BRAND_COLORS.dark[2]);
    doc.text(c.val, x + 3, startY + 12);
  });

  // Table
  const tableData = products.map((p) => {
    const totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    const sizeDetails = p.sizes.map((s) => `${s.size}:${s.stock}`).join(' | ');
    const colorsList = p.colors && p.colors.length > 0 ? p.colors.map((c) => c.name).join(', ') : '-';

    let statusText = 'Em Estoque (OK)';
    if (totalStock === 0) statusText = 'ESGOTADO (0)';
    else if (totalStock <= lowStockThreshold) statusText = `ALERTA BAIXO (${totalStock})`;

    return [
      p.sku,
      p.name,
      p.categoryLabel,
      p.subCategoryName || '-',
      colorsList,
      sizeDetails,
      `${totalStock} un.`,
      formatMoney(p.price),
      formatMoney(p.price * totalStock),
      statusText,
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [[
      'SKU / Ref',
      'Nome do Produto',
      'Categoria',
      'Subcategoria',
      'Cores',
      'Grade de Tamanhos (Tam:Qtd)',
      'Total Peças',
      'Preço Venda',
      'Valor Total',
      'Status / Alerta',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [43, 27, 18],
      lineColor: [230, 220, 210],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 117, 31],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 20 },
      1: { fontStyle: 'bold', cellWidth: 48 },
      2: { cellWidth: 26 },
      3: { cellWidth: 24 },
      4: { cellWidth: 30 },
      5: { cellWidth: 44 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      7: { halign: 'right', cellWidth: 20 },
      8: { halign: 'right', fontStyle: 'bold', textColor: [255, 117, 31], cellWidth: 22 },
      9: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
    },
    didParseCell: (data) => {
      // Color-code low stock / out of stock in column 9
      if (data.section === 'body' && data.column.index === 9) {
        const text = String(data.cell.raw);
        if (text.includes('ESGOTADO')) {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fillColor = [255, 235, 235];
        } else if (text.includes('ALERTA')) {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fillColor = [254, 243, 199];
        } else {
          data.cell.styles.textColor = [16, 149, 106];
        }
      }
    },
    alternateRowStyles: {
      fillColor: [253, 250, 246],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer page numbering
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 140, 130);
    doc.text(
      `Majoca Moda • Controle e Inventário de Estoque • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  const filename = `inventario_estoque_majoca_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * 3. Exporta Comprovante / Ficha do Pedido em PDF
 */
export function exportOrderReceiptPDF(order: Order, settings: StoreSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Box
  doc.setFillColor(255, 117, 31);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MAJOCA MODA', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Moda Infanto-Juvenil (RN ao 18 anos) • Ubá/MG', 14, 18);
  doc.text(`WhatsApp: ${settings.whatsappNumber} | CNPJ: ${settings.cnpj}`, 14, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`PEDIDO ${order.orderNumber}`, pageWidth - 14, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Data: ${formatDate(order.createdAt)}`, pageWidth - 14, 19, { align: 'right' });
  doc.text(`Status: ${order.status}`, pageWidth - 14, 24, { align: 'right' });

  // Customer & Delivery Info Box
  const startY = 34;
  doc.setFillColor(250, 245, 238);
  doc.roundedRect(14, startY, pageWidth - 28, 30, 2, 2, 'F');
  doc.setDrawColor(220, 200, 185);
  doc.roundedRect(14, startY, pageWidth - 28, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 117, 31);
  doc.text('DADOS DO CLIENTE & ENTREGA', 18, startY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(43, 27, 18);
  doc.text(`Nome: ${order.customer.name}`, 18, startY + 12);
  doc.text(`WhatsApp: ${order.customer.phone}`, 18, startY + 17);
  if (order.customer.cpf) doc.text(`CPF: ${order.customer.cpf}`, 18, startY + 22);

  const col2X = pageWidth / 2;
  doc.text(`Forma de Envio: ${order.deliveryEstimate}`, col2X, startY + 12);
  if (order.customer.address?.street) {
    const addr = `${order.customer.address.street}, ${order.customer.address.number} - ${order.customer.address.neighborhood} (${order.customer.address.city}/${order.customer.address.state})`;
    doc.setFont('helvetica', 'normal');
    doc.text(`Endereço: ${addr}`, col2X, startY + 17, { maxWidth: 85 });
  }

  // Items Table
  const itemsTableData = order.items.map((it) => {
    const colorStr = it.selectedColor ? ` | Cor: ${it.selectedColor}` : '';
    return [
      it.product.name,
      `Tam: ${it.selectedSize}${colorStr}`,
      it.product.sku,
      `${it.quantity} un.`,
      formatMoney(it.product.price),
      formatMoney(it.product.price * it.quantity),
    ];
  });

  autoTable(doc, {
    startY: 68,
    head: [['Produto', 'Variação / Tamanho', 'Ref/SKU', 'Qtd', 'Preço Unit.', 'Subtotal']],
    body: itemsTableData,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [43, 27, 18],
      lineColor: [230, 220, 210],
    },
    headStyles: {
      fillColor: [255, 117, 31],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold', textColor: [255, 117, 31] },
    },
    alternateRowStyles: {
      fillColor: [253, 250, 246],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  // Financial Totals
  const totalBoxX = pageWidth - 14 - 70;
  doc.setFillColor(250, 245, 238);
  doc.roundedRect(totalBoxX, finalY + 6, 70, 28, 2, 2, 'F');
  doc.setDrawColor(220, 200, 185);
  doc.roundedRect(totalBoxX, finalY + 6, 70, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 56, 37);
  doc.text(`Subtotal Itens:`, totalBoxX + 4, finalY + 12);
  doc.text(formatMoney(order.subtotal), totalBoxX + 66, finalY + 12, { align: 'right' });

  doc.text(`Frete / Envio:`, totalBoxX + 4, finalY + 18);
  doc.text(order.deliveryFee > 0 ? formatMoney(order.deliveryFee) : 'Grátis', totalBoxX + 66, finalY + 18, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 117, 31);
  doc.text(`TOTAL:`, totalBoxX + 4, finalY + 28);
  doc.text(formatMoney(order.total), totalBoxX + 66, finalY + 28, { align: 'right' });

  // Payment Details on left
  doc.setFillColor(250, 245, 238);
  doc.roundedRect(14, finalY + 6, totalBoxX - 14 - 6, 28, 2, 2, 'F');
  doc.setDrawColor(220, 200, 185);
  doc.roundedRect(14, finalY + 6, totalBoxX - 14 - 6, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 117, 31);
  doc.text('FORMA DE PAGAMENTO', 18, finalY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(43, 27, 18);
  if (order.paymentMethod === 'pix') {
    doc.text(`Método: Transferência Instantânea via PIX`, 18, finalY + 18);
    doc.text(`Chave Pix da Loja: ${settings.pixKey} (${settings.pixHolderName})`, 18, finalY + 23);
  } else {
    doc.text(`Método: Cartão de Crédito via Link Seguro TON`, 18, finalY + 18);
    doc.text(`Link enviado via WhatsApp oficial para confirmação`, 18, finalY + 23);
  }

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 115, 105);
  doc.text(
    'Obrigado por escolher a Majoca Moda! Guarde este comprovante para seu acompanhamento.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  const filename = `comprovante_pedido_${order.orderNumber}.pdf`;
  doc.save(filename);
}
