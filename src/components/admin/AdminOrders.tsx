import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  Eye,
  X,
  Trash2,
  Download,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { exportOrderReceiptPDF } from '../../utils/pdfGenerator';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, settings, showToast } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusOptions: OrderStatus[] = [
    'Aguardando pagamento via PIX',
    'Aguardando envio do link TON',
    'Pago / Em separação',
    'Pronto para Retirada em Ubá',
    'Enviado / Em trânsito',
    'Entregue / Concluído',
    'Cancelado',
  ];

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDelete = (orderId: string, orderNum: string) => {
    if (confirm(`Deseja realmente excluir o pedido ${orderNum}? Esta ação não pode ser desfeita.`)) {
      deleteOrder(orderId);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const handleOpenWhatsAppCustomer = (ord: Order) => {
    const rawNumber = ord.customer.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${ord.customer.name}! Aqui é da Majoca Moda sobre o seu pedido ${ord.orderNumber}. Atualizamos o status do seu pedido para: *${ord.status}*. Se tiver qualquer dúvida, estamos à disposição!`
    );
    window.open(`https://wa.me/55${rawNumber}?text=${message}`, '_blank');
  };

  // Filtered orders
  const filtered = orders.filter((o) => {
    if (statusFilter !== 'todas' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nº pedido, cliente ou celular..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-orange-50/20 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
            />
            <Search className="w-4 h-4 text-[#BB7F5D] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-orange-50/20 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none max-w-[200px]"
          >
            <option value="todas">Todos os Status</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-[#5A3825]">
          Total: <span className="text-[#FF751F]">{filtered.length} pedidos</span>
        </div>
      </div>

      {/* ORDERS LIST / TABLE */}
      <div className="bg-white rounded-3xl border border-[#BB7F5D]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/40 text-[#3D2518] font-bold border-b border-[#BB7F5D]/20">
              <tr>
                <th className="p-3.5">Pedido</th>
                <th className="p-3.5">Cliente / Contato</th>
                <th className="p-3.5">Pagamento & Entrega</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BB7F5D]/10">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-orange-50/20 transition-colors">
                  {/* Pedido */}
                  <td className="p-3.5">
                    <div className="font-heading font-bold text-[#3D2518]">{ord.orderNumber}</div>
                    <div className="text-[10px] text-[#BB7F5D]">
                      {new Date(ord.createdAt).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="p-3.5">
                    <div className="font-semibold text-[#3D2518]">{ord.customer.name}</div>
                    <div className="text-[11px] text-[#5A3825] font-mono">{ord.customer.phone}</div>
                  </td>

                  {/* Pagamento & Entrega */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 font-bold text-[#3D2518]">
                      {ord.paymentMethod === 'pix' ? (
                        <span className="text-[#FF751F]">PIX</span>
                      ) : (
                        <span className="text-[#BB7F5D]">Cartão TON</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#5A3825] truncate max-w-[150px]">
                      {ord.deliveryEstimate}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="p-3.5">
                    <span className="font-heading font-bold text-[#3D2518]">
                      {formatMoney(ord.total)}
                    </span>
                    <div className="text-[10px] text-[#BB7F5D]">
                      {ord.items.length} {ord.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-3.5">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border transition-colors focus:outline-none ${
                        ord.status.includes('PIX') || ord.status.includes('TON')
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : ord.status.includes('Pago') || ord.status.includes('Pronto')
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : ord.status.includes('Cancelado')
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-orange-50/50 text-[#3D2518] border-[#BB7F5D]/30'
                      }`}
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Ações */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenWhatsAppCustomer(ord)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Falar com cliente no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg text-[#FF751F] hover:bg-orange-50 transition-colors"
                        title="Ver Detalhes do Pedido"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(ord.id, ord.orderNumber)}
                        className="p-1.5 rounded-lg text-[#BB7F5D] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 bg-orange-50/40 border-b border-[#BB7F5D]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#FF751F] uppercase tracking-wider">
                  Detalhes do Pedido
                </span>
                <h3 className="font-heading font-extrabold text-lg text-[#3D2518]">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full text-[#5A3825] hover:text-[#FF751F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Status change bar */}
              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 flex items-center justify-between">
                <span className="font-bold text-[#3D2518]">Alterar Status Atual:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 font-bold text-xs bg-white border border-[#BB7F5D]/30 rounded-lg text-[#3D2518]"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-orange-50/20 rounded-2xl border border-[#BB7F5D]/20">
                <div>
                  <div className="text-[#BB7F5D] font-medium">Nome do Cliente:</div>
                  <div className="font-bold text-[#3D2518] text-sm mt-0.5">
                    {selectedOrder.customer.name}
                  </div>
                  {selectedOrder.customer.cpf && (
                    <div className="text-[11px] text-[#5A3825]">CPF: {selectedOrder.customer.cpf}</div>
                  )}
                </div>

                <div>
                  <div className="text-[#BB7F5D] font-medium">WhatsApp / Contato:</div>
                  <div className="font-bold text-[#3D2518] text-sm mt-0.5 flex items-center gap-1.5">
                    <span>{selectedOrder.customer.phone}</span>
                    <button
                      onClick={() => handleOpenWhatsAppCustomer(selectedOrder)}
                      className="text-emerald-600 hover:underline text-xs flex items-center gap-0.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chamar
                    </button>
                  </div>
                  {selectedOrder.customer.email && (
                    <div className="text-[11px] text-[#5A3825]">{selectedOrder.customer.email}</div>
                  )}
                </div>

                {selectedOrder.customer.address?.street && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#BB7F5D]/10">
                    <div className="text-[#BB7F5D] font-medium">Endereço de Entrega:</div>
                    <div className="font-semibold text-[#3D2518] mt-0.5">
                      {selectedOrder.customer.address.street}, {selectedOrder.customer.address.number}{' '}
                      {selectedOrder.customer.address.complement && `(${selectedOrder.customer.address.complement})`}{' '}
                      - {selectedOrder.customer.address.neighborhood} — {selectedOrder.customer.address.city}/{selectedOrder.customer.address.state}
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-bold text-[#3D2518] uppercase tracking-wider">
                  Itens do Pedido:
                </div>
                <div className="divide-y divide-[#BB7F5D]/10 border border-[#BB7F5D]/20 rounded-2xl p-3 bg-white">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={it.product.images[0]}
                          alt={it.product.name}
                          className="w-10 h-13 rounded-lg object-cover object-center bg-stone-100 border border-[#BB7F5D]/20 aspect-[3/4]"
                        />
                        <div>
                          <div className="font-bold text-[#3D2518]">{it.product.name}</div>
                          <div className="text-[11px] text-[#5A3825]">
                            Tamanho: <strong>{it.selectedSize}</strong> • Ref: {it.product.sku}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#3D2518]">
                          {it.quantity}x {formatMoney(it.product.price)}
                        </div>
                        <div className="text-[11px] text-[#FF751F] font-semibold">
                          {formatMoney(it.product.price * itemQuantity(it))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-bold text-sm text-[#3D2518]">
                    <span>Total com Frete/Taxas:</span>
                    <span className="text-[#FF751F] font-heading text-base">
                      {formatMoney(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.customer.notes && (
                <div className="p-3 bg-orange-50/30 rounded-xl border border-[#BB7F5D]/20 text-[#5A3825]">
                  <strong>Observações do Cliente:</strong> {selectedOrder.customer.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-orange-50/30 border-t border-[#BB7F5D]/20 flex flex-wrap justify-between items-center gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOpenWhatsAppCustomer(selectedOrder)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chamar no WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    exportOrderReceiptPDF(selectedOrder, settings);
                    showToast('Comprovante do pedido em PDF gerado!', 'success');
                  }}
                  className="bg-[#BB7F5D] hover:bg-[#a66e4d] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Gerar e salvar comprovante/recibo em PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Comprovante PDF</span>
                </button>

                <button
                  onClick={() => handleDelete(selectedOrder.id, selectedOrder.orderNumber)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-orange-100 hover:bg-orange-200 text-[#3D2518] rounded-xl font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

const itemQuantity = (it: { quantity: number }) => it.quantity;
