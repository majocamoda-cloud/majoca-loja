import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Sliders,
  LogOut,
  X,
  ShieldCheck,
  KeyRound,
  Settings,
  TrendingUp,
  Calculator,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminReports } from './AdminReports';
import { AdminPricingCalculator } from './AdminPricingCalculator';
import { AdminBannersContent } from './AdminBannersContent';
import { AdminSettings } from './AdminSettings';
import { AdminLoginModal } from './AdminLoginModal';
import { BrandLogo } from '../BrandLogo';

export const AdminPanel: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, isAdminLoggedIn, logoutAdmin, changeAdminPassword, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'reports' | 'pricing' | 'banners' | 'settings'>('dashboard');
  const [openProductCreateDirect, setOpenProductCreateDirect] = useState(false);
  
  // Quick password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  if (!isAdminOpen) return null;

  // If not logged in, show login modal
  if (!isAdminLoggedIn) {
    return (
      <AdminLoginModal
        onSuccess={() => {}}
        onClose={() => setIsAdminOpen(false)}
      />
    );
  }

  const handleQuickAddProduct = () => {
    setActiveTab('products');
    setOpenProductCreateDirect(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPass.length < 4) {
      setPassError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('A confirmação da nova senha não confere.');
      return;
    }

    const success = changeAdminPassword(currentPass, newPass);
    if (success) {
      showToast('Senha de administrador alterada com sucesso!', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassError('Senha atual incorreta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      
      {/* MAIN ADMIN WINDOW */}
      <div
        id="admin-panel-container"
        className="relative bg-orange-50/20 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/30 flex flex-col h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* TOP BAR */}
        <div className="bg-white px-6 py-4 border-b border-[#BB7F5D]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 px-3 shadow-none" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#3D2518] leading-none">
                  Painel Administrativo
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Acesso Master • Controle Total
                </span>
              </div>
              <p className="text-[11px] text-[#BB7F5D] mt-0.5">
                Gestão da Loja & Catálogo Completo • Ubá/MG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs font-semibold text-[#5A3825] hover:text-[#FF751F] px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-1.5"
              title="Configurações e Senha"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Configurações & Senha</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="text-xs font-semibold text-[#5A3825] hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Encerrar Sessão</span>
            </button>

            <button
              id="btn-close-admin-panel"
              onClick={() => setIsAdminOpen(false)}
              className="p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50 transition-colors"
              title="Fechar painel e voltar à loja"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS BAR */}
        <div className="bg-white border-b border-[#BB7F5D]/20 px-6 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('products');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'products'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Produtos & Estoque</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('categories');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'categories'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>3. Categorias</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>4. Pedidos</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'reports'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>5. Relatórios de Vendas</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pricing');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'pricing'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>6. Calculadora de Preços</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('banners');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'banners'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>7. Banners & Conteúdos</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setOpenProductCreateDirect(false);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'border-[#FF751F] text-[#FF751F]'
                : 'border-transparent text-[#5A3825] hover:text-[#FF751F]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>8. Configurações & Senha</span>
          </button>
        </div>

        {/* TAB BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              onNavigateToTab={(t) => setActiveTab(t)}
              onQuickAddProduct={handleQuickAddProduct}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts initialOpenModal={openProductCreateDirect} />
          )}

          {activeTab === 'categories' && <AdminCategories />}

          {activeTab === 'orders' && <AdminOrders />}

          {activeTab === 'reports' && <AdminReports />}

          {activeTab === 'pricing' && <AdminPricingCalculator />}

          {activeTab === 'banners' && <AdminBannersContent />}

          {activeTab === 'settings' && <AdminSettings />}
        </div>

      </div>

      {/* QUICK CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-[#2B1B12]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#BB7F5D]/20 overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-orange-50/40 border-b border-[#BB7F5D]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF751F]" />
                <h3 className="font-heading font-bold text-base text-[#3D2518]">Alterar Senha do Admin</h3>
              </div>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPassError('');
                }}
                className="p-1 rounded-full text-[#5A3825] hover:text-[#FF751F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 text-xs">
              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
                  {passError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#5A3825] mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 border border-[#BB7F5D]/30 rounded-xl text-[#3D2518] focus:border-[#FF751F] focus:outline-none"
                  placeholder="Digite a senha atual"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A3825] mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 border border-[#BB7F5D]/30 rounded-xl text-[#3D2518] focus:border-[#FF751F] focus:outline-none"
                  placeholder="Mínimo 4 caracteres"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A3825] mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 border border-[#BB7F5D]/30 rounded-xl text-[#3D2518] focus:border-[#FF751F] focus:outline-none"
                  placeholder="Repita a nova senha"
                />
              </div>

              <div className="pt-3 border-t border-[#BB7F5D]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#5A3825] hover:bg-orange-50 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FF751F] hover:bg-[#e06316] text-white px-5 py-2 font-bold rounded-xl shadow-xs"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
